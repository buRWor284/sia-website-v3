/**
 * SEC EDGAR full-text search (no key; requires a User-Agent).
 * Counts filings mentioning a phrase in the last 30 days vs. a trailing 12-month
 * baseline, so a *surge* in corporate disclosure becomes magnitude + velocity.
 * https://efts.sec.gov/LATEST/search-index?q="phrase"&startdt=&enddt=
 */
import type { Signal } from "../types";
import { SOURCE_CREDIBILITY } from "../config";
import { clamp, clamp01, getJson, isoDaysAgo } from "./http";
import { createLimiter } from "./throttle";

const FTS = "https://efts.sec.gov/LATEST/search-index?q=";
const FILINGS_CAP = 40; // filings/month mentioning a phrase = strong

// SEC EDGAR allows ~10 req/s and we make 2 calls per seed — cap concurrency and
// space the starts so a wide scan doesn't get throttled into timeouts.
const secLimit = createLimiter({ concurrency: 4, minIntervalMs: 120 });

const RECENT_WINDOW_DAYS = 30;
// Widened from a 60-day lookback (2026-07-08 — baseline sanity check v1, see
// SignalIQ-Notes-and-TODOs.md). A short baseline gets skewed by 10-K/10-Q
// filing-season clusters; a trailing 12 months naturally averages over them
// without hand-coding a seasonal calendar. Same # of API calls as before (2/seed).
const BASELINE_WINDOW_DAYS = 365;
const BASELINE_MONTHS = BASELINE_WINDOW_DAYS / RECENT_WINDOW_DAYS; // ~12.2

// Below this many filings, don't let a % swing headline the pack — the sample is
// too small to responsibly call a trend either way.
const MIN_SAMPLE_FILINGS = 10;

// Single-filer dominance heuristic: uses only the page of hits the API returns
// alongside the total (no extra request) — cheap, but a SAMPLE, not an exhaustive
// per-filer count across the whole baseline window. Good enough to catch the
// obvious case (one company's disclosure cadence skewing the baseline); a full
// per-filer breakdown across all pages is a v2 item.
const MIN_DOMINANCE_SAMPLE = 5; // need at least this many sampled hits to call it
const DOMINANCE_SHARE = 0.6; // one filer ≥ 60% of the sampled hits

interface FtsHit {
  _source?: { ciks?: string[] };
}
interface FtsResp {
  hits?: { total?: { value?: number }; hits?: FtsHit[] };
}
interface FilingSearch {
  total: number;
  hits: FtsHit[];
}

async function searchFilings(phrase: string, startdt: string, enddt: string): Promise<FilingSearch> {
  const url = `${FTS}${encodeURIComponent(`"${phrase}"`)}&startdt=${startdt}&enddt=${enddt}`;
  const json = (await secLimit(() => getJson(url))) as FtsResp;
  return { total: json.hits?.total?.value ?? 0, hits: json.hits?.hits ?? [] };
}

/** Share of the sampled hits that belong to the single most common filer (by
 * primary CIK). Returns 0 when there are too few sampled hits to say anything. */
function dominantFilerShare(hits: FtsHit[]): number {
  if (hits.length < MIN_DOMINANCE_SAMPLE) return 0;
  const counts = new Map<string, number>();
  for (const h of hits) {
    const cik = h._source?.ciks?.[0];
    if (!cik) continue;
    counts.set(cik, (counts.get(cik) ?? 0) + 1);
  }
  const top = Math.max(0, ...counts.values());
  return top / hits.length;
}

export async function secSignal(seed: string): Promise<Signal | null> {
  try {
    const today = isoDaysAgo(0);
    const d30 = isoDaysAgo(RECENT_WINDOW_DAYS);
    const dBaselineStart = isoDaysAgo(RECENT_WINDOW_DAYS + BASELINE_WINDOW_DAYS);

    const recentRes = await searchFilings(seed, d30, today);
    const recent = recentRes.total;
    if (recent === 0) return null;
    const baselineRes = await searchFilings(seed, dBaselineStart, d30); // trailing 12-mo baseline
    const prior = baselineRes.total;
    const priorMonthly = prior / BASELINE_MONTHS;

    const magnitude = clamp01(recent / FILINGS_CAP);
    const rawVelocity =
      priorMonthly > 0 ? (recent - priorMonthly) / Math.max(priorMonthly, 1) : recent > 3 ? 1 : 0.5;
    const velocity = clamp01(rawVelocity);
    // `velocity` floors any decline at 0 (same as "flat") so the scorer can compare
    // magnitudes. `trend` keeps the sign so a genuine decline isn't lost — see
    // SignalIQ-Notes-and-TODOs.md, "Scoring logic gap" (2026-07-08).
    const trend = priorMonthly > 0 ? clamp(rawVelocity, -1, 1) : velocity;

    // Baseline sanity checks v1 (2026-07-08): don't let a tiny sample or a
    // one-filer baseline pass as a market-wide trend without saying so.
    const lowSample = recent < MIN_SAMPLE_FILINGS || prior < MIN_SAMPLE_FILINGS;
    const singleFilerDominant = dominantFilerShare(baselineRes.hits) >= DOMINANCE_SHARE;

    const detailParts = [`${recent} filings vs ~${priorMonthly.toFixed(1)}/mo prior (trailing 12-mo baseline)`];
    if (lowSample) detailParts.push("sample too small to call a trend");
    if (singleFilerDominant) detailParts.push("baseline dominated by one filer, not market-wide");

    return {
      source: "sec",
      topic: seed,
      title: `${recent} SEC filings mention "${seed}" in 30 days`,
      url: `${FTS}${encodeURIComponent(`"${seed}"`)}`,
      observedAt: new Date().toISOString(),
      magnitude,
      velocity,
      trend,
      credibility: SOURCE_CREDIBILITY.sec,
      detail: detailParts.join("; "),
      lowSample,
      singleFilerDominant,
    };
  } catch {
    return null;
  }
}
