/**
 * SEC EDGAR full-text search (no key; requires a User-Agent).
 * Counts filings mentioning a phrase in the last 30 days vs. the prior 60,
 * so a *surge* in corporate disclosure becomes magnitude + velocity.
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

interface FtsResp {
  hits?: { total?: { value?: number } };
}

async function countFilings(phrase: string, startdt: string, enddt: string): Promise<number> {
  const url = `${FTS}${encodeURIComponent(`"${phrase}"`)}&startdt=${startdt}&enddt=${enddt}`;
  const json = (await secLimit(() => getJson(url))) as FtsResp;
  return json.hits?.total?.value ?? 0;
}

export async function secSignal(seed: string): Promise<Signal | null> {
  try {
    const today = isoDaysAgo(0);
    const d30 = isoDaysAgo(30);
    const d90 = isoDaysAgo(90);

    const recent = await countFilings(seed, d30, today);
    if (recent === 0) return null;
    const prior = await countFilings(seed, d90, d30); // 60-day prior window
    const priorMonthly = prior / 2;

    const magnitude = clamp01(recent / FILINGS_CAP);
    const rawVelocity =
      priorMonthly > 0 ? (recent - priorMonthly) / Math.max(priorMonthly, 1) : recent > 3 ? 1 : 0.5;
    const velocity = clamp01(rawVelocity);
    // `velocity` floors any decline at 0 (same as "flat") so the scorer can compare
    // magnitudes. `trend` keeps the sign so a genuine decline isn't lost — see
    // SignalIQ-Notes-and-TODOs.md, "Scoring logic gap" (2026-07-08).
    const trend = priorMonthly > 0 ? clamp(rawVelocity, -1, 1) : velocity;

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
      detail: `${recent} filings vs ~${priorMonthly.toFixed(0)}/mo prior`,
    };
  } catch {
    return null;
  }
}
