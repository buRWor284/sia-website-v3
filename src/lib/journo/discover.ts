import "server-only";
/**
 * Search-first journalist discovery (JournoCollabIQ P1-01 follow-up, 25 Sep 2026).
 *
 * Why: the five-run eval showed the checker works but the list does not. Opus
 * naming people from memory got 2 of 40 right for Saudi marketing trade press,
 * and named different people every run (1-3 of 8 overlap). So the list is now
 * built FROM real recent articles: one call with web search finds articles on
 * the beat, and the journalists are the people who wrote them.
 *
 * Every name still passes the same code rules as verify.ts: its article URL
 * must be one the search actually returned; the date (the model's, or the
 * search engine's listing date for that exact article) must be within 12
 * months; the outlet is the article's real domain. A name that passes is
 * verified here, with no second check. A name that does not goes through
 * verifyJournalist like before.
 *
 * DASHBOARD ONLY. Never throws.
 */

import { recordAiUsage } from "@/lib/ai-usage";
import { briefPromptBlock } from "@/lib/company-brief-prompt";
import { ANGLE_LABEL, contextLines, parseCandidateArray, scrubContacts } from "@/lib/journo/route-core";
import { collectEvidence, isProfileUrl, parseDate, urlKey, writeVerificationRow } from "@/lib/journo/verify";
import { BYLINE_MAX_AGE_DAYS, normaliseDomain, type JournalistVerification } from "@/lib/journo/verification-shared";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
export const JOURNO_DISCOVER_MODEL = process.env.JOURNO_DISCOVER_MODEL ?? "claude-sonnet-4-6";
const SEARCH_TOOL = process.env.JOURNO_DISCOVER_SEARCH_TOOL ?? "web_search_20250305";
const MAX_SEARCHES = 5;
/** The route caps at 60s and still has to check leftovers. */
const TIMEOUT_MS = 44_000;

function buildDiscoverPrompt(d: Record<string, unknown>, today: Date): string {
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  const earliest = new Date(today.getTime() - BYLINE_MAX_AGE_DAYS * 86_400_000);
  return `Today is ${iso(today)}. You are a media-relations researcher. Find the journalists who are writing NOW about the beat below, using web search.

STORY & SOURCE:
- Business / brand: ${d.biz || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Beat / topic: ${d.industry || "Not provided"}
- The story being pitched: ${d.audDesc || "Not provided"}
- Geography: ${d.geo || "Not provided"}
- What the source is offering: ${ANGLE_LABEL[d.strategy as string] || String(d.strategy || "")}${contextLines(d)}

METHOD:
1. Search for recent articles (published on or after ${iso(earliest)}) on this beat and geography, at the outlets that cover it: trade press, business press, national and regional news.
2. From the articles you find, take the BYLINED AUTHOR. People quoted or mentioned in an article are not its author.
3. Pick up to 8 different journalists who fit the story best. At most 2 per outlet.

RULES (strict):
- Only name a person whose article appeared in your search results. article_url must be copied exactly from a search result. Never build or guess a URL, and never name someone from memory.
- article_date: the publish date if you saw it (YYYY-MM-DD), else empty.
- Fewer than 8 real names is fine. Never pad the list.
- No guessed emails. A handle only if it appeared in the results; else the outlet desk.
- Keep "why" to one or two short sentences.

Return ONLY a JSON array, no other text, no fences:
[{"name":"Full name","url":"outlet domain, e.g. campaignme.com","article_url":"","article_title":"","article_date":"YYYY-MM-DD or empty","why":"why this story fits what they cover","beat":"their beat in a few words","linkPage":"same as article_url","contact":"handle seen in results, else the outlet desk","contactLinkedIn":"","seoNote":"outlet reach and tier in words, no DA/DR number","tier":"A, B or C (A = approach first)"}]`;
}

interface Raw {
  name?: unknown; url?: unknown; article_url?: unknown; article_title?: unknown; article_date?: unknown;
  [k: string]: unknown;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export interface DiscoverResult {
  ok: boolean;
  /** Candidates in the card's shape; verified ones carry `verification`. */
  candidates: Array<Record<string, unknown>>;
  error?: string;
  searchesUsed: number;
}

export async function discoverJournalists(
  data: Record<string, unknown>,
  companyBrief?: string | null,
): Promise<DiscoverResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, candidates: [], error: "ANTHROPIC_API_KEY not set.", searchesUsed: 0 };

  const today = new Date();
  let prompt = buildDiscoverPrompt(data, today);
  if (companyBrief) {
    prompt += `\n${briefPromptBlock(companyBrief)}\nPrefer journalists who fit the brief's goals, skip anyone it says not to contact. The output format above still applies exactly.`;
  }

  let json: { content?: Array<{ type: string; text?: string; content?: unknown }>; usage?: { server_tool_use?: { web_search_requests?: number | null } | null }; stop_reason?: string };
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: JOURNO_DISCOVER_MODEL,
        max_tokens: 3000,
        // Same inputs should give the same people (the eval's overlap bar).
        temperature: 0,
        tools: [{ type: SEARCH_TOOL, name: "web_search", max_uses: MAX_SEARCHES }],
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    json = (await res.json().catch(() => ({}))) as typeof json;
    if (!res.ok) {
      const msg = (json as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
      console.error(`[journo-discover] API error: ${msg}`);
      return { ok: false, candidates: [], error: msg, searchesUsed: 0 };
    }
  } catch (e) {
    console.error("[journo-discover] call failed:", e);
    return { ok: false, candidates: [], error: "timeout or network", searchesUsed: 0 };
  }

  await recordAiUsage("journo-discover", JOURNO_DISCOVER_MODEL, json);
  const searchesUsed = json.usage?.server_tool_use?.web_search_requests ?? 0;
  if (json.stop_reason === "max_tokens") console.warn("[journo-discover] output hit max_tokens (truncated)");

  const { seen, ages, searchOk } = collectEvidence(json.content);
  const text = (json.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  const parsed = parseCandidateArray(text);
  if (!parsed || searchOk === 0) {
    console.error(
      `[journo-discover] unusable answer (searchOk=${searchOk}, parsed=${!!parsed}, textLen=${text.length}) head=${JSON.stringify(text.slice(0, 300))} tail=${JSON.stringify(text.slice(-300))}`,
    );
    return { ok: false, candidates: [], error: "unreadable list", searchesUsed };
  }
  // Same handle / LinkedIn scrub as the memory path.
  const scrubbed = parseCandidateArray(scrubContacts(JSON.stringify(parsed))) ?? parsed;

  const seenNames = new Set<string>();
  const out: Array<Record<string, unknown>> = [];
  const writes: Promise<unknown>[] = [];

  for (const item of scrubbed as Raw[]) {
    const name = str(item?.name);
    if (!name || seenNames.has(name.toLowerCase())) continue;
    seenNames.add(name.toLowerCase());

    const articleUrl = str(item.article_url) || str(item.linkPage);
    const stated = normaliseDomain(str(item.url));
    const articleDomain = articleUrl ? normaliseDomain(articleUrl) : "";
    const inResults = !!articleUrl && seen.has(urlKey(articleUrl));
    let date = parseDate(str(item.article_date));
    let fromListing = false;
    if (!date && inResults && !isProfileUrl(articleUrl)) {
      const d = ages.get(urlKey(articleUrl));
      if (d) { date = d; fromListing = true; }
    }
    const ageDays = date ? (today.getTime() - date.getTime()) / 86_400_000 : Infinity;
    const passes = inResults && !isProfileUrl(articleUrl) && ageDays <= BYLINE_MAX_AGE_DAYS && ageDays >= -2;

    const base: Record<string, unknown> = {
      ...item,
      name,
      url: articleDomain || stated,
      linkPage: passes ? articleUrl : "",
      tier: ["A", "B", "C"].includes(str(item.tier)) ? str(item.tier) : "C",
    };
    delete base.article_url; delete base.article_title; delete base.article_date;

    if (passes) {
      const row = {
        name,
        outlet: articleDomain,
        outlet_domain: articleDomain,
        byline_domain: articleDomain,
        verified: true,
        byline_url: articleUrl,
        byline_title: str(item.article_title) || null,
        byline_date: date!.toISOString().slice(0, 10),
        role_as_of: str(item.beat) || null,
        note: fromListing ? "Found by the search-first list. Date taken from the search listing." : "Found by the search-first list.",
        searches_used: 0,
      };
      const v: JournalistVerification = {
        status: "verified",
        name,
        outlet: articleDomain,
        bylineDomain: articleDomain,
        bylineUrl: articleUrl,
        bylineTitle: row.byline_title,
        bylineDate: row.byline_date,
        roleAsOf: row.role_as_of,
        note: row.note,
        checkedAt: new Date().toISOString(),
        cached: false,
        searchesUsed: 0,
      };
      writes.push(writeVerificationRow(row));
      out.push({ ...base, aiTier: base.tier, verification: v });
    } else {
      // Not proven by this search: verifyJournalist decides, as before.
      out.push(base);
    }
  }
  await Promise.all(writes);
  return { ok: true, candidates: out, searchesUsed };
}
