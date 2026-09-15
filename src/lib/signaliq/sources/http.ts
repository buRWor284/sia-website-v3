/**
 * SignalIQ — shared HTTP helpers for source adapters.
 * All requests carry a descriptive User-Agent (SEC and others require one) and
 * a hard timeout so one slow feed can't stall a scan.
 */

export const UA =
  "SignalIQBot/0.1 (+https://www.syedirfanajmal.com; sia@syedirfanajmal.com)";

const TIMEOUT_MS = 9000;

async function req(url: string, accept: string, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: accept },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function getJson(url: string, timeoutMs?: number): Promise<unknown> {
  return (await req(url, "application/json", timeoutMs)).json();
}

export async function getText(url: string, timeoutMs?: number): Promise<string> {
  return (await req(url, "application/xml,text/plain,*/*", timeoutMs)).text();
}

export const clamp01 = (n: number): number =>
  Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

export const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

/**
 * Baseline-aware volume (decided by Irfan 15 Sep 2026, D1 = 0.6; see
 * SignalIQ-Magnitude-and-Points-Decision-2026-09-13.md). A raw count against a
 * fixed cap said "149 SEC filings = 100/100" even though 149 was well BELOW the
 * topic's ~262/month norm, while the pack warned "do not frame this as a surge".
 * Only declines are damped: a topic at half its norm (trend -0.5) keeps 70% of
 * its volume. Rising topics are untouched, because velocity already rewards them.
 * `trend` is undefined when a source has no honest baseline, and then nothing is damped.
 */
export const DECLINE_WEIGHT = 0.6;
export const dampForDecline = (rawMagnitude: number, trend: number | undefined): number =>
  clamp01(rawMagnitude * (1 + DECLINE_WEIGHT * Math.min(trend ?? 0, 0)));

export const avg = (xs: number[]): number =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

/** YYYY-MM-DD, `d` days ago (UTC). */
export function isoDaysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
}

/** YYYYMMDD, `daysAgo` days ago (Wikipedia pageviews format). */
export function ymd(daysAgo: number): string {
  return isoDaysAgo(daysAgo).replace(/-/g, "");
}

export function daysSince(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? (Date.now() - t) / 86_400_000 : 9999;
}
