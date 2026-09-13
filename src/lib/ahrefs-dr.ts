import "server-only";

/**
 * Ahrefs Domain Rating — the free DR endpoint, cached.
 * 2026-09-13 (items 4/5/6: replace the model-invented "DA 94" with a real DR).
 *
 * Endpoint (verified against docs.ahrefs.com, 13 Sep 2026):
 *   GET https://api.ahrefs.com/v3/public/domain-rating-free?target=<domain>&output=json
 *   Authorization: Bearer <AHREFS_API_KEY>   (a free "APIv3" key from Account
 *   settings → API keys; the call consumes no API units)
 *   → { "domain_rating": { "domain_rating": 46, "license": "https://…" } }
 *
 * Licence (ahrefs.com/legal/domain-rating-license): wherever a DR from here is
 * shown, the page must carry the text "Domain Rating by Ahrefs" linked to
 * https://ahrefs.com/ — see <DrAttribution/> in components/coverageiq/primitives.
 * Ahrefs may rate-limit or withdraw the endpoint without notice, so every path
 * here fails soft: no key, no network, no rating → null, never a thrown error.
 *
 * Cache: public.domain_ratings, one row per registrable-ish host, 30-day TTL.
 * DR moves slowly; a month is fresh enough for a pitch decision and keeps the
 * call count at "once per new outlet", not per page view.
 */

import { createSupabaseServiceClient } from "@/lib/supabase";

const ENDPOINT = "https://api.ahrefs.com/v3/public/domain-rating-free";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const DR_ATTRIBUTION_TEXT = "Domain Rating by Ahrefs";
export const DR_ATTRIBUTION_URL = "https://ahrefs.com/";

/** "https://www.forbes.com/sites/x" → "forbes.com"; "Forbes" → null. */
export function domainFromInput(input: string | null | undefined): string | null {
  if (!input) return null;
  let s = input.trim().toLowerCase();
  if (!s) return null;
  if (!/^[a-z]+:\/\//.test(s)) s = "https://" + s;
  try {
    const host = new URL(s).hostname.replace(/^www\./, "");
    // Must look like a domain: at least one dot, no spaces.
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;
    return host;
  } catch {
    return null;
  }
}

export function ahrefsConfigured(): boolean {
  return !!process.env.AHREFS_API_KEY;
}

async function fetchFromAhrefs(domain: string): Promise<{ dr: number | null; error: string | null }> {
  const key = process.env.AHREFS_API_KEY;
  if (!key) return { dr: null, error: "no_key" };
  try {
    const res = await fetch(`${ENDPOINT}?target=${encodeURIComponent(domain)}&output=json`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return { dr: null, error: `http_${res.status}` };
    const json = (await res.json()) as { domain_rating?: { domain_rating?: number | null } };
    const raw = json?.domain_rating?.domain_rating;
    if (typeof raw !== "number" || !Number.isFinite(raw)) return { dr: null, error: "no_rating" };
    return { dr: Math.max(0, Math.min(100, Math.round(raw))), error: null };
  } catch (e) {
    return { dr: null, error: e instanceof Error ? e.name : "fetch_failed" };
  }
}

/**
 * DR for a domain (or anything a domain can be pulled out of), from cache
 * when fresh, else from Ahrefs. Null when unknown. Never throws.
 */
export async function getDomainRating(input: string | null | undefined): Promise<number | null> {
  const domain = domainFromInput(input);
  if (!domain) return null;

  let db: ReturnType<typeof createSupabaseServiceClient>;
  try { db = createSupabaseServiceClient(); } catch { return null; }

  const { data: cached } = await db
    .from("domain_ratings")
    .select("dr, fetched_at")
    .eq("domain", domain)
    .maybeSingle();
  if (cached && Date.now() - Date.parse(cached.fetched_at) < TTL_MS) {
    return (cached.dr as number | null) ?? null;
  }

  // Without a key there is nothing to refresh; keep whatever the cache holds.
  if (!ahrefsConfigured()) return (cached?.dr as number | null) ?? null;

  const { dr, error } = await fetchFromAhrefs(domain);
  // A failed refresh keeps the old value rather than blanking it.
  const value = dr ?? (cached?.dr as number | null) ?? null;
  const { error: upsertError } = await db
    .from("domain_ratings")
    .upsert({ domain, dr: value, fetched_at: new Date().toISOString(), error }, { onConflict: "domain" });
  if (upsertError) console.error("domain_ratings upsert:", upsertError.message);
  return value;
}

/** Batch helper for the refresh action: sequential on purpose (the free
 * endpoint's limits are unpublished; ~60 calls in a burst is the most we ask). */
export async function getDomainRatings(inputs: (string | null | undefined)[]): Promise<Map<string, number | null>> {
  const out = new Map<string, number | null>();
  for (const input of inputs) {
    const domain = domainFromInput(input);
    if (!domain || out.has(domain)) continue;
    out.set(domain, await getDomainRating(domain));
  }
  return out;
}
