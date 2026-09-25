import "server-only";
/**
 * verifyJournalist: does this named person have a byline at this outlet in the
 * last 12 months? (JournoCollabIQ bug P1-01, pass 3, 25 Sep 2026.)
 *
 * Why: the journalist list is one Opus call with no tools, naming people from
 * memory. Two identical runs on 24-25 Sep gave 14 distinct names, 1 fully
 * correct. Every candidate now goes through this check before the card shows
 * them as a person.
 *
 * How:
 *  1. Cache first: newest journalist_verifications row for (name, outlet
 *     domain) checked within VERIFY_TTL_DAYS. Free, instant. `force` skips it
 *     (the card's free "Re-verify").
 *  2. Else ONE call on a fast model with Anthropic's server-side web_search,
 *     max_uses 2, asking for one byline and strict JSON back.
 *  3. The answer is only PROPOSED. Code decides, and refuses to verify when:
 *     the byline URL is not one of the URLs the search actually returned (so an
 *     invented link can never verify anyone); the date is missing or older than
 *     12 months; or the URL's domain is not the stated outlet (outletMatches).
 *     The domain is always derived from the URL, never from the model.
 *  4. The row is written AWAITED (Vercel drops fire-and-forget writes).
 *     A technical failure (API error, timeout, no search ran) returns
 *     "check_failed" and writes nothing, so a flaky call never caches a false
 *     "not confirmed" for 30 days.
 *
 * Model: claude-haiku-4-5 ($1 / $5 per MTok) over claude-sonnet-4-6 ($3 / $15)
 * per the ai-usage.ts price table: search results dominate input tokens, so
 * Haiku is about a third of the cost. Haiku takes the basic web_search tool
 * version (20250305); the newer dynamic-filtering versions FactCheckIQ uses are
 * for Opus/Sonnet 4.6+. Both are env-overridable.
 *
 * Never throws.
 */

import { recordAiUsage } from "@/lib/ai-usage";
import { createSupabaseServiceClient } from "@/lib/supabase";
import {
  BYLINE_MAX_AGE_DAYS,
  VERIFY_TTL_DAYS,
  nameKey,
  normaliseDomain,
  outletMatches,
  type JournalistVerification,
} from "./verification-shared";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
export const JOURNO_VERIFY_MODEL = process.env.JOURNO_VERIFY_MODEL ?? "claude-haiku-4-5";
const WEB_SEARCH_TOOL = process.env.JOURNO_VERIFY_SEARCH_TOOL ?? "web_search_20250305";
const MAX_SEARCHES = 2;
/** Per-candidate ceiling. The search route runs these in parallel after Opus. */
const DEFAULT_TIMEOUT_MS = 25_000;

export interface VerifyInput {
  name: string;
  /** Outlet domain as the candidate list gave it, e.g. "arabianbusiness.com". */
  outlet: string;
  beat?: string | null;
}

interface Row {
  name: string;
  outlet: string;
  byline_domain: string | null;
  verified: boolean;
  byline_url: string | null;
  byline_title: string | null;
  byline_date: string | null;
  role_as_of: string | null;
  note: string | null;
  checked_at: string;
  searches_used: number;
}

function fromRow(r: Row, cached: boolean): JournalistVerification {
  return {
    status: r.verified ? "verified" : "unverified",
    name: r.name,
    outlet: r.outlet,
    bylineDomain: r.byline_domain,
    bylineUrl: r.byline_url,
    bylineTitle: r.byline_title,
    bylineDate: r.byline_date,
    roleAsOf: r.role_as_of,
    note: r.note,
    checkedAt: r.checked_at,
    cached,
    searchesUsed: cached ? 0 : r.searches_used,
  };
}

function failed(input: VerifyInput, note: string, searchesUsed = 0): JournalistVerification {
  return {
    status: "check_failed",
    name: input.name,
    outlet: input.outlet,
    bylineDomain: null,
    bylineUrl: null,
    bylineTitle: null,
    bylineDate: null,
    roleAsOf: null,
    note,
    checkedAt: new Date().toISOString(),
    cached: false,
    searchesUsed,
  };
}

/** Newest check for this person at this outlet inside the TTL, or null. */
export async function readCachedVerification(name: string, outlet: string): Promise<JournalistVerification | null> {
  const key = nameKey(name);
  const domain = normaliseDomain(outlet);
  if (!key || !domain) return null;
  try {
    const db = createSupabaseServiceClient();
    const since = new Date(Date.now() - VERIFY_TTL_DAYS * 86_400_000).toISOString();
    const { data, error } = await db
      .from("journalist_verifications")
      .select("name, outlet, byline_domain, verified, byline_url, byline_title, byline_date, role_as_of, note, checked_at, searches_used")
      .eq("name_key", key)
      .eq("outlet_domain", domain)
      .gt("checked_at", since)
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) { console.warn("[journo-verify] cache read failed:", error.message); return null; }
    return data ? fromRow(data as Row, true) : null;
  } catch (e) {
    console.warn("[journo-verify] cache read error (non-fatal):", e);
    return null;
  }
}

function buildPrompt(input: VerifyInput, today: Date): string {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const earliest = new Date(today.getTime() - BYLINE_MAX_AGE_DAYS * 86_400_000);
  return `Today is ${iso(today)}. Check whether this journalist currently writes for this outlet.

Journalist: ${input.name}
Outlet (the domain may be approximate or wrong): ${input.outlet}
Beat: ${input.beat || "not given"}

Use web search to find ONE article with this person's byline at this outlet, published on or after ${iso(earliest)}. Search for the person's name together with the outlet's name.

Rules:
- Only report an article that appeared in your search results. Copy its URL exactly. Never build or guess a URL.
- The byline must be this person. An article that only quotes or mentions them does not count.
- If the byline is at a DIFFERENT publication, set same_outlet to false and say in "note" where you found them.
- If you cannot confirm a publish date on or after ${iso(earliest)}, set verified to false.

Reply with ONLY this JSON object, no other text:
{"verified": true or false, "byline_url": "", "byline_title": "", "byline_date": "YYYY-MM-DD or empty", "outlet_name": "the publication's real name", "same_outlet": true or false, "role_as_of": "their role or beat as the article shows it, or empty", "note": "one short sentence"}`;
}

interface VerifierAnswer {
  verified?: unknown;
  byline_url?: unknown;
  byline_title?: unknown;
  byline_date?: unknown;
  outlet_name?: unknown;
  same_outlet?: unknown;
  role_as_of?: unknown;
  note?: unknown;
}

/** The last {...} object in the model's text that parses. */
function parseAnswer(text: string): VerifierAnswer | null {
  const starts: number[] = [];
  for (let i = 0; i < text.length; i++) if (text[i] === "{") starts.push(i);
  const end = text.lastIndexOf("}");
  if (end < 0) return null;
  for (let k = starts.length - 1; k >= 0; k--) {
    try {
      const v = JSON.parse(text.slice(starts[k], end + 1));
      if (v && typeof v === "object" && "verified" in v) return v as VerifierAnswer;
    } catch { /* try an earlier brace */ }
  }
  return null;
}

/** URL identity for "did the search return this page?": host without www,
 *  path without trailing slash, no query or fragment. */
function urlKey(u: string): string {
  try {
    const p = new URL(u);
    return `${p.hostname.replace(/^www\d?\./, "").toLowerCase()}${p.pathname.replace(/\/+$/, "")}`;
  } catch {
    return "";
  }
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface SearchResponse {
  content?: Array<{ type: string; text?: string; content?: unknown }>;
  usage?: { server_tool_use?: { web_search_requests?: number | null } | null };
  stop_reason?: string;
}

/** Check one journalist. Cache first unless `force`. Never throws. */
export async function verifyJournalist(
  input: VerifyInput,
  opts?: { force?: boolean; timeoutMs?: number },
): Promise<JournalistVerification> {
  const name = input.name?.trim() ?? "";
  const outletDomain = normaliseDomain(input.outlet);
  if (!name || !outletDomain) return failed(input, "Missing name or outlet, nothing to check.");

  if (!opts?.force) {
    const hit = await readCachedVerification(name, outletDomain);
    if (hit) return hit;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return failed(input, "Verification is not configured on the server.");

  const today = new Date();
  let json: SearchResponse;
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: JOURNO_VERIFY_MODEL,
        max_tokens: 700,
        tools: [{ type: WEB_SEARCH_TOOL, name: "web_search", max_uses: MAX_SEARCHES }],
        messages: [{ role: "user", content: buildPrompt({ ...input, name, outlet: outletDomain }, today) }],
      }),
      signal: AbortSignal.timeout(opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    json = (await res.json().catch(() => ({}))) as SearchResponse;
    if (!res.ok) {
      const msg = (json as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
      console.error(`[journo-verify] API error for "${name}" @ ${outletDomain}: ${msg}`);
      return failed(input, "The check could not run just now.");
    }
  } catch (e) {
    console.error(`[journo-verify] call failed for "${name}" @ ${outletDomain}:`, e);
    return failed(input, "The check timed out or could not run just now.");
  }

  // Billed whatever happens next, so record before any parse check.
  await recordAiUsage("journo-verify", JOURNO_VERIFY_MODEL, json);
  const searchesUsed = json.usage?.server_tool_use?.web_search_requests ?? 0;

  // Every URL the search really returned. A byline must be one of these.
  const seen = new Set<string>();
  let searchOk = 0;
  for (const b of json.content ?? []) {
    if (b.type !== "web_search_tool_result") continue;
    if (Array.isArray(b.content)) {
      searchOk++;
      for (const r of b.content as Array<{ url?: string }>) if (r?.url) seen.add(urlKey(r.url));
    }
  }
  if (searchOk === 0) return failed(input, "The web search did not run, so nothing was checked.", searchesUsed);

  const text = (json.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  const ans = parseAnswer(text);
  if (!ans) return failed(input, "The check returned an unreadable answer.", searchesUsed);

  const bylineUrl = str(ans.byline_url);
  const bylineDomain = bylineUrl ? normaliseDomain(bylineUrl) : "";
  const date = parseDate(str(ans.byline_date));
  const ageDays = date ? (today.getTime() - date.getTime()) / 86_400_000 : Infinity;
  let note = str(ans.note) || null;

  // Code decides. Each failed rule says why in the note.
  let verified = ans.verified === true;
  const refuse = (why: string) => { verified = false; note = note ? `${why} ${note}` : why; };
  if (verified && (!bylineUrl || !/^https?:\/\//i.test(bylineUrl))) refuse("No byline link was given.");
  else if (verified && !seen.has(urlKey(bylineUrl))) refuse("The byline link was not among the search results.");
  else if (verified && (!date || ageDays > BYLINE_MAX_AGE_DAYS || ageDays < -2)) refuse("No byline dated within the last 12 months.");
  else if (verified && !outletMatches(outletDomain, bylineDomain, ans.same_outlet === true)) {
    refuse(`Byline found at ${bylineDomain}, not ${outletDomain}.`);
  }

  const row = {
    name,
    name_key: nameKey(name),
    outlet: input.outlet.trim(),
    outlet_domain: outletDomain,
    byline_domain: bylineDomain || null,
    verified,
    // An unverified row keeps what was found (a byline elsewhere, an old one)
    // for the note and history, but the card never links it as proof.
    byline_url: bylineUrl || null,
    byline_title: str(ans.byline_title) || null,
    byline_date: date ? date.toISOString().slice(0, 10) : null,
    role_as_of: str(ans.role_as_of) || null,
    note: note ? note.slice(0, 500) : null,
    searches_used: searchesUsed,
    model: JOURNO_VERIFY_MODEL,
  };

  let checkedAt = new Date().toISOString();
  try {
    const db = createSupabaseServiceClient();
    const { data, error } = await db.from("journalist_verifications").insert(row).select("checked_at").single();
    if (error) console.warn("[journo-verify] cache write failed:", error.message);
    else if (data?.checked_at) checkedAt = data.checked_at as string;
  } catch (e) {
    console.warn("[journo-verify] cache write error (non-fatal):", e);
  }

  return fromRow({ ...row, checked_at: checkedAt }, false);
}
