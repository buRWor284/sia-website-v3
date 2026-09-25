import "server-only";
/**
 * Outlet rosters: who is writing for each outlet right now, read from the
 * outlet's OWN pages (JournoCollabIQ, 25 Sep 2026).
 *
 * Why: web search does not surface bylines for niche trade press (eval, 25
 * Sep), and the model naming people from memory got 2 of 40 right. The
 * hand-picked outlet lists (outlets.ts) are read on a schedule; each read
 * stores (author, article URL, date) rows. Search time then only READS the
 * stored rows, so it is fast and nearly free.
 *
 * Freshness (Irfan, 25 Sep): a name is "current" when the outlet was read in
 * the last 30 days and the article is within 12 months. Older rows are kept
 * and shown as "last seen at <outlet>, <month>, may have moved". Nothing is
 * deleted; an outlet that keeps failing is visible in outlet_reads.
 *
 * Code decides, not the model: an article only counts if its URL is one the
 * reader actually fetched or saw linked on a fetched page, it sits on the
 * outlet's own domain, it has a date within 12 months, and the byline is a
 * person (staff, desk and wire credits are dropped).
 */

import { recordAiUsage } from "@/lib/ai-usage";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { collectEvidence, parseDate, urlKey } from "@/lib/journo/verify";
import { BYLINE_MAX_AGE_DAYS, VERIFY_TTL_DAYS, nameKey, normaliseDomain } from "@/lib/journo/verification-shared";
import type { Outlet } from "@/lib/journo/outlets";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
export const ROSTER_MODEL = process.env.JOURNO_ROSTER_MODEL ?? "claude-haiku-4-5";
/**
 * Reader version, written to outlet_bylines.model. Only rows from these
 * readers are used, so a reader fix retires older rows without deletes
 * (same pattern as CHECKER_ID in verify.ts). r2 (25 Sep, commit 10) asks for
 * the kind of piece and the author's role, to drop op-eds by company
 * executives (Saudi Gazette's top business names were an Amazon manager's
 * pieces) and sponsored posts. r1 rows carry neither, so they are retired.
 */
export const ROSTER_READER_ID = `${ROSTER_MODEL}|r2`;
const ACCEPTED_READERS = [ROSTER_READER_ID];
/**
 * Days a name stays "current" after the outlet read that saw it; older =
 * "last seen, may have moved". Default 30 (Irfan, 25 Sep). Env-tunable so the
 * last-seen state can be tested live with 1 day, then set back.
 */
export const ROSTER_CURRENT_DAYS = Math.max(1, Number(process.env.JOURNO_ROSTER_CURRENT_DAYS) || VERIFY_TTL_DAYS);
const FETCH_TOOL = process.env.JOURNO_ROSTER_FETCH_TOOL ?? "web_fetch_20250910";
const FETCH_BETA = "web-fetch-2025-09-10";
const SEARCH_TOOL = "web_search_20250305";
/** Listing page(s) plus up to 4 articles opened for bylines and dates. */
const MAX_FETCHES = 8;
const READ_TIMEOUT_MS = 120_000;
/**
 * Page cap per read. 8k -> 20k (25 Sep, first read): Campaign ME's tag page
 * showed Anup Oommen's 23-24 Sep bylines further down the page, and the 8k
 * cap cut them off (0 names found). Costs a little more per read.
 */
const PAGE_TOKENS = 20_000;

/** Credits that are not a person: never a roster name. */
const NOT_A_PERSON =
  /\b(staff|desk|team|editor(ial)? team|newsroom|correspondent|agenc(y|ies)|afp|reuters|ap|spa|wam|bloomberg|bna|kuna|wires?|press release|sponsored|partner content|contributor)\b/i;

export function isPersonByline(author: string, outletName: string): boolean {
  const a = author.trim();
  if (a.length < 4 || a.length > 60) return false;
  if (NOT_A_PERSON.test(a)) return false;
  const bare = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  if (bare(a) && bare(outletName).includes(bare(a))) return false; // "Argaam", "Arab News"
  if (!/\s/.test(a)) return false; // one word: a brand, not a person
  return true;
}

/** URL paths for paid or non-editorial posts. */
const NOT_EDITORIAL_URL = /\/(sponsored|partner-content|partner|advertorial|brand-?voice|press-?releases?|corporate-news|pr-news|promoted)(\/|-|$)/i;
const NOT_EDITORIAL_KIND = new Set(["sponsored", "press_release", "advertorial"]);

/**
 * Why a byline is not a journalist to pitch, or null if it is. Code decides
 * from what the reader reported: the kind of piece, whether the author works
 * for another organisation (a guest op-ed by an executive, official or
 * consultant), and the URL path.
 */
export function notJournalistReason(item: { kind?: unknown; outside_writer?: unknown; author_role?: unknown }, url: string): string | null {
  const kind = typeof item.kind === "string" ? item.kind.toLowerCase().replace(/[\s-]+/g, "_") : "";
  if (NOT_EDITORIAL_KIND.has(kind)) return "sponsored or press release";
  if (NOT_EDITORIAL_URL.test(url)) return "sponsored or press release";
  if (item.outside_writer === true || item.outside_writer === "true") return "outside writer";
  const role = typeof item.author_role === "string" ? item.author_role : "";
  if (/\b(ceo|cfo|coo|cmo|founder|co-founder|managing director|country manager|general manager|chairman|president|vice president|vp|head of|partner at|director at|minister|ambassador)\b/i.test(role)
    && !/\b(editor|reporter|journalist|correspondent|writer|columnist)\b/i.test(role)) return "outside writer";
  return null;
}

function sameSite(url: string, domain: string): boolean {
  const d = normaliseDomain(url);
  const o = normaliseDomain(domain);
  return !!d && (d === o || d.endsWith("." + o) || o.endsWith("." + d));
}

/** "/2026/09/24/" or "/2026-09-24" in a URL. Month-only paths are not enough. */
export function dateFromUrl(url: string): Date | null {
  const m = /\/(20\d{2})[/-](0[1-9]|1[0-2])[/-](0[1-9]|[12]\d|3[01])(?:[/-]|$)/.exec(url);
  return m ? parseDate(`${m[1]}-${m[2]}-${m[3]}`) : null;
}

/**
 * The byline list from the reader's answer. The model sometimes narrates
 * before the JSON ("I'll help you find..."), which broke the first read for
 * Argaam and Arab News tourism, so every complete {...} object that has an
 * "author" is salvaged on its own.
 */
export function parseBylines(text: string): Array<Record<string, unknown>> | null {
  const a = text.lastIndexOf("[{");
  const z = text.lastIndexOf("]");
  if (a >= 0 && z > a) {
    try {
      const v = JSON.parse(text.slice(a, z + 1));
      if (Array.isArray(v)) return v as Array<Record<string, unknown>>;
    } catch { /* fall through to salvage */ }
  }
  const out: Array<Record<string, unknown>> = [];
  let depth = 0, start = -1, inStr = false, esc = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === "{") { if (depth === 0) start = i; depth++; }
    else if (ch === "}" && depth > 0) {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          const o = JSON.parse(text.slice(start, i + 1));
          if (o && typeof o === "object" && typeof (o as { author?: unknown }).author === "string") out.push(o as Record<string, unknown>);
        } catch { /* skip */ }
        start = -1;
      }
    }
  }
  // An empty "[]" answer is a real answer (no named bylines), not a failure.
  if (!out.length && /\[\s*\]/.test(text)) return [];
  return out.length ? out : null;
}

const MARKET_NAMES: Record<string, string> = { ksa: "Saudi Arabia", usa: "the United States" };

function buildReadPrompt(o: Outlet, market: string, beat: string, today: Date): string {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const earliest = new Date(today.getTime() - BYLINE_MAX_AGE_DAYS * 86_400_000);
  return `Today is ${iso(today)}. Read these pages from ${o.name} (${o.domain}) with the page-fetch tool:
${o.pages.map((p) => `- ${p}`).join("\n")}
${o.confirmPages ? `\nIf these pages show few articles, you may search once for recent ${o.name} articles about ${MARKET_NAMES[market] ?? market.toUpperCase()}.\n` : ""}
Goal: find the named JOURNALISTS who wrote recent articles here (market: ${market.toUpperCase()}, beat: ${beat.replace(/-/g, " ")}).

Steps:
1. Read the WHOLE page: bylines and dates are often further down, or shown only on some items.
2. Take the most recent articles (published on or after ${iso(earliest)}).
3. The listing may not show the author or date. Open up to 4 of the most recent articles that still lack one, to read the byline and date.
4. Report only PERSONAL bylines. Skip "Staff", desks, the outlet's own name, and wire agencies (AFP, Reuters, SPA, WAM, AP, Bloomberg).
5. We want JOURNALISTS to pitch, not guest writers. If an author might be an outside writer (an opinion piece by a company executive, official, consultant or founder), open the article and read the author line or bio.

Rules:
- article_url must be copied exactly from a page you fetched or a link on it. Never build or guess a URL.
- date is YYYY-MM-DD; leave it empty if you did not see it.
- kind: news, feature, interview, opinion, sponsored or press_release (sponsored = paid, partner or "corporate news" content).
- author_role: the role printed with the byline or bio (e.g. "Senior Reporter", "Country Manager, Amazon.sa"); empty if none shown.
- outside_writer: true if the author works for a company or organisation other than ${o.name} (a guest op-ed); false for staff, freelance journalists and columnists.

Do not describe your steps. Your final message must be ONLY this JSON array, nothing before or after it:
[{"author":"Full name","article_url":"","title":"","date":"YYYY-MM-DD or empty","kind":"news","author_role":"","outside_writer":false}]`;
}

export interface OutletReadResult {
  domain: string;
  ok: boolean;
  bylines: number;
  newest: string | null;
  note: string;
}

/** Read one outlet and store what was found. Never throws. */
export async function readOutlet(o: Outlet, market: string, beat: string): Promise<OutletReadResult> {
  const domain = normaliseDomain(o.domain);
  const db = createSupabaseServiceClient();
  const logRead = async (r: OutletReadResult) => {
    try {
      await db.from("outlet_reads").insert({
        outlet_domain: domain, market, beat, ok: r.ok, bylines_found: r.bylines,
        newest_article: r.newest, note: r.note.slice(0, 500),
      });
    } catch (e) {
      console.warn("[journo-roster] read log failed:", e);
    }
    return r;
  };

  if (o.status !== "active") return logRead({ domain, ok: false, bylines: 0, newest: null, note: `skipped: status ${o.status}` });
  if (o.blocksReading) return logRead({ domain, ok: false, bylines: 0, newest: null, note: "skipped: site blocks page reads" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return logRead({ domain, ok: false, bylines: 0, newest: null, note: "no API key" });

  const today = new Date();
  let json: { content?: Array<{ type: string; text?: string; content?: unknown }>; stop_reason?: string };
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-beta": FETCH_BETA },
      body: JSON.stringify({
        model: ROSTER_MODEL,
        max_tokens: 2500, // r2 asks for kind, role and outside_writer per byline
        tools: [
          { type: FETCH_TOOL, name: "web_fetch", max_uses: MAX_FETCHES, max_content_tokens: PAGE_TOKENS },
          ...(o.confirmPages ? [{ type: SEARCH_TOOL, name: "web_search", max_uses: 1 }] : []),
        ],
        messages: [{ role: "user", content: buildReadPrompt(o, market, beat, today) }],
      }),
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    json = (await res.json().catch(() => ({}))) as typeof json;
    if (!res.ok) {
      const msg = (json as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
      return logRead({ domain, ok: false, bylines: 0, newest: null, note: `API error: ${msg}` });
    }
  } catch (e) {
    return logRead({ domain, ok: false, bylines: 0, newest: null, note: `call failed: ${String(e).slice(0, 200)}` });
  }
  await recordAiUsage("journo-roster", ROSTER_MODEL, json);

  const { seen } = collectEvidence(json.content);
  // Fetched pages count as seen even when only the fetch tool ran.
  const fetchErrors = (json.content ?? []).filter(
    (b) => b.type === "web_fetch_tool_result" && (b.content as { type?: string })?.type === "web_fetch_tool_error",
  ).length;

  const text = (json.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  const arr = parseBylines(text);
  if (!arr) {
    return logRead({ domain, ok: false, bylines: 0, newest: null, note: `unreadable answer (fetch errors: ${fetchErrors}) ${text.slice(0, 160)}` });
  }

  const rows: Array<Record<string, unknown>> = [];
  const dropped: Record<string, number> = {};
  const drop = (why: string) => { dropped[why] = (dropped[why] ?? 0) + 1; };
  const keys = new Set<string>();
  for (const item of arr as Array<Record<string, unknown>>) {
    const author = typeof item?.author === "string" ? item.author.trim() : "";
    const url = typeof item?.article_url === "string" ? item.article_url.trim() : "";
    // The model's date, else a date written in the article URL (/2026/09/24/).
    const date = parseDate(typeof item?.date === "string" ? item.date : "") ?? dateFromUrl(url);
    if (!author || !url) { drop("missing"); continue; }
    if (!isPersonByline(author, o.name)) { drop("not a person"); continue; }
    const notJournalist = notJournalistReason(item, url);
    if (notJournalist) { drop(notJournalist); continue; }
    if (!sameSite(url, domain)) { drop("other site"); continue; }
    if (!seen.has(urlKey(url))) { drop("url not seen"); continue; }
    if (!date) { drop("no date"); continue; }
    const age = (today.getTime() - date.getTime()) / 86_400_000;
    if (age > BYLINE_MAX_AGE_DAYS || age < -2) { drop("too old"); continue; }
    const k = `${nameKey(author)}|${urlKey(url)}`;
    if (keys.has(k)) continue;
    keys.add(k);
    rows.push({
      outlet_domain: domain,
      page_url: o.pages[0] ?? null,
      author_name: author,
      author_key: nameKey(author),
      article_url: url,
      article_title: typeof item.title === "string" ? item.title.slice(0, 300) : null,
      article_date: date.toISOString().slice(0, 10),
      kind: typeof item.kind === "string" ? item.kind.slice(0, 40) : null,
      author_role: typeof item.author_role === "string" && item.author_role.trim() ? item.author_role.trim().slice(0, 200) : null,
      model: ROSTER_READER_ID,
    });
  }

  if (rows.length) {
    const { error } = await db.from("outlet_bylines").insert(rows);
    if (error) return logRead({ domain, ok: false, bylines: 0, newest: null, note: `write failed: ${error.message}` });
  }
  const newest = rows.map((r) => r.article_date as string).sort().pop() ?? null;
  const droppedNote = Object.entries(dropped).map(([k, v]) => `${k} ${v}`).join(", ");
  return logRead({
    domain, ok: true, bylines: rows.length, newest,
    note: `found ${rows.length} named bylines${droppedNote ? `; dropped: ${droppedNote}` : ""}; fetch errors: ${fetchErrors}`,
  });
}

export interface RosterPerson {
  name: string;
  outletDomain: string;
  articleUrl: string;
  articleTitle: string | null;
  articleDate: string;
  /** Last time the outlet read saw this person. */
  readAt: string;
  /** Seen in a read within ROSTER_CURRENT_DAYS. False = "last seen, may have moved". */
  current: boolean;
  articles: number;
  /** Role printed with the byline, when the reader saw one. */
  role: string | null;
}

/** Where to look: a domain, and optionally only the listing pages of the chosen beat lists. */
export interface RosterScope {
  domains: string[];
  /**
   * outlet_bylines.page_url values to keep. Needed because one site can sit in
   * several beat lists (arabnews.com is in media, tourism and business): without
   * it, every section's writers showed up in every beat (tourism test, 25 Sep).
   */
  pages?: string[];
}

/** Everyone seen writing for these outlets in the last 12 months, newest first. */
export async function readRoster(scope: string[] | RosterScope): Promise<RosterPerson[]> {
  const { domains, pages } = Array.isArray(scope) ? { domains: scope, pages: undefined } : scope;
  const list = Array.from(new Set(domains.map(normaliseDomain).filter(Boolean)));
  if (!list.length) return [];
  try {
    const db = createSupabaseServiceClient();
    const since = new Date(Date.now() - BYLINE_MAX_AGE_DAYS * 86_400_000).toISOString().slice(0, 10);
    const { data, error } = await db
      .from("outlet_bylines")
      .select("outlet_domain, page_url, author_name, author_key, article_url, article_title, article_date, read_at, author_role")
      .in("outlet_domain", list)
      .in("model", ACCEPTED_READERS)
      .gte("article_date", since)
      .order("article_date", { ascending: false })
      .limit(1000);
    if (error || !data) { if (error) console.warn("[journo-roster] read failed:", error.message); return []; }
    const cutoff = Date.now() - ROSTER_CURRENT_DAYS * 86_400_000;
    const keepPages = pages?.length ? new Set(pages) : null;
    const byPerson = new Map<string, RosterPerson>();
    for (const r of data as Array<Record<string, string>>) {
      if (keepPages && !keepPages.has(r.page_url)) continue;
      const k = `${r.author_key}|${r.outlet_domain}`;
      const cur = byPerson.get(k);
      if (!cur) {
        byPerson.set(k, {
          name: r.author_name, outletDomain: r.outlet_domain, articleUrl: r.article_url,
          articleTitle: r.article_title ?? null, articleDate: r.article_date, readAt: r.read_at,
          current: Date.parse(r.read_at) >= cutoff, articles: 1, role: r.author_role ?? null,
        });
      } else {
        cur.articles++;
        if (!cur.role && r.author_role) cur.role = r.author_role;
        if (Date.parse(r.read_at) > Date.parse(cur.readAt)) {
          cur.readAt = r.read_at;
          cur.current = Date.parse(r.read_at) >= cutoff;
        }
      }
    }
    return [...byPerson.values()].sort((x, y) => Number(y.current) - Number(x.current) || y.articleDate.localeCompare(x.articleDate));
  } catch (e) {
    console.warn("[journo-roster] read error:", e);
    return [];
  }
}

/** The roster entry for this person at this outlet, if any (current or not). */
export async function rosterLookup(name: string, outlet: string): Promise<RosterPerson | null> {
  const key = nameKey(name);
  const domain = normaliseDomain(outlet);
  if (!key || !domain) return null;
  const people = await readRoster([domain]);
  return people.find((p) => nameKey(p.name) === key) ?? null;
}
