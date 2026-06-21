/**
 * GDELT DOC 2.0 — the coverage denominator (RFP §5, §6).
 * `timelinevol` returns "Volume Intensity": the % of all global news coverage
 * matching the query, day by day. We turn that into:
 *   volume  — how much press already covers it now (0..1, normalised by a cap)
 *   trend   — recent vs prior coverage (-1..1)
 * High volume → small coverage gap → lower opportunity score.
 *
 * No API key. VOLUME_CAP below is still uncalibrated — see SignalIQ-Test-Findings.
 */
import type { Coverage } from "../types";
import { avg, clamp, clamp01, getText } from "./http";
import { createLimiter } from "./throttle";

const BASE = "https://api.gdeltproject.org/api/v2/doc/doc";

// ~0.5% of all global coverage = "saturated" for a niche business topic.
// NOTE: observed live, this tends to pin coverageGap near 1.0 — recalibrate
// (likely much lower, or switch to a log/percentile scale) once a real value
// distribution is sampled from production.
const VOLUME_CAP = 0.5;

// GDELT's timelinevol is slow (~10s) AND rate-limited (returns a PLAINTEXT
// throttle notice — HTTP 200, not JSON — under load). Strategy:
//   1) modest concurrency so slow calls OVERLAP and finish within the function
//      budget (serialising them timed out the scan),
//   2) detect the throttle notice and treat it as "no coverage" (neutral gap)
//      WITHOUT a synchronous retry (a per-seed back-off blew the timeout),
//   3) cache results 6h (coverage moves slowly), so repeat scans cover more.
// scan.ts caps how many seeds reach here so a cold scan stays under maxDuration.
const gdeltLimit = createLimiter({ concurrency: 4 });

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — volume is a slow-moving 2-month signal
const cache = new Map<string, { at: number; val: Coverage }>();

interface TimelineResp {
  timeline?: { series: string; data: { date: string; value: number }[] }[];
}

function isThrottleNotice(text: string): boolean {
  return /limit requests|too many requests/i.test(text);
}

export function parseTimeline(topic: string, text: string): Coverage | null {
  let json: TimelineResp;
  try {
    json = JSON.parse(text) as TimelineResp;
  } catch {
    return null; // non-JSON (e.g. a throttle notice that slipped through)
  }
  const data = json.timeline?.[0]?.data ?? [];
  if (!data.length) {
    return { topic, volume: 0, trend: 0, articleCount: 0, source: "gdelt" };
  }
  const vals = data.map((d) => d.value);
  const recent = avg(vals.slice(-14)); // last ~2 weeks
  const prior = avg(vals.slice(-42, -14)); // the ~4 weeks before that
  const volume = clamp01(recent / VOLUME_CAP);
  const trend = prior > 0 ? clamp((recent - prior) / prior, -1, 1) : recent > 0 ? 1 : 0;
  const daysCovered = vals.filter((v) => v > 0).length; // days with non-zero coverage
  return { topic, volume, trend, articleCount: daysCovered, source: "gdelt" };
}

export async function gdeltCoverage(topic: string): Promise<Coverage | null> {
  const cacheKey = topic.toLowerCase();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.val;

  const url =
    `${BASE}?query=${encodeURIComponent(`"${topic}"`)}` +
    `&mode=timelinevol&format=json&timespan=2m`;

  try {
    // Single attempt only — no synchronous retry (a 5s back-off per seed could
    // blow the function timeout). If throttled, return null (neutral gap); the
    // cache + next scan recover it. scan.ts also caps how many seeds reach here.
    const text = await gdeltLimit(() => getText(url, 11000));
    if (isThrottleNotice(text)) return null;
    const cov = parseTimeline(topic, text);
    if (cov) cache.set(cacheKey, { at: Date.now(), val: cov });
    return cov;
  } catch {
    return null; // unknown coverage → scorer treats the gap as neutral
  }
}
