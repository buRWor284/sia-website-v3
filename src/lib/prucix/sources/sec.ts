/**
 * SEC EDGAR full-text search (no key; requires a User-Agent).
 * Counts filings mentioning a phrase in the last 30 days vs. the prior 60,
 * so a *surge* in corporate disclosure becomes magnitude + velocity.
 * https://efts.sec.gov/LATEST/search-index?q="phrase"&startdt=&enddt=
 */
import type { Signal } from "../types";
import { SOURCE_CREDIBILITY } from "../config";
import { clamp01, getJson, isoDaysAgo } from "./http";

const FTS = "https://efts.sec.gov/LATEST/search-index?q=";
const FILINGS_CAP = 40; // filings/month mentioning a phrase = strong

interface FtsResp {
  hits?: { total?: { value?: number } };
}

async function countFilings(phrase: string, startdt: string, enddt: string): Promise<number> {
  const url = `${FTS}${encodeURIComponent(`"${phrase}"`)}&startdt=${startdt}&enddt=${enddt}`;
  const json = (await getJson(url)) as FtsResp;
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
    const velocity = clamp01(
      priorMonthly > 0 ? (recent - priorMonthly) / Math.max(priorMonthly, 1) : recent > 3 ? 1 : 0.5,
    );

    return {
      source: "sec",
      topic: seed,
      title: `${recent} SEC filings mention "${seed}" in 30 days`,
      url: `${FTS}${encodeURIComponent(`"${seed}"`)}`,
      observedAt: new Date().toISOString(),
      magnitude,
      velocity,
      credibility: SOURCE_CREDIBILITY.sec,
      detail: `${recent} filings vs ~${priorMonthly.toFixed(0)}/mo prior`,
    };
  } catch {
    return null;
  }
}
