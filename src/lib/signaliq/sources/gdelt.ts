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

// GDELT enforces ~1 request / 5s per IP and returns a PLAINTEXT throttle notice
// (HTTP 200, not JSON) when exceeded — which previously parsed as an error and
// collapsed coverage to neutral for nearly every topic. We now:
//   1) serialise calls with spacing (concurrency 1 + interval),
//   2) cache results (coverage moves slowly over a 2-month window), and
//   3) retry once after backing off past GDELT's window if we hit the notice.
// scan.ts further limits the fan-out to seeds that actually produced signals.
const gdeltLimit = createLimiter({ concurrency: 1, minIntervalMs: 4000 });

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — volume is a slow-moving 2-month signal
const cache = new Map<string, { at: number; val: Coverage }>();

interface TimelineResp {
  timeline?: { series: string; data: { date: string; value: number }[] }[];
}

function isThrottleNotice(text: string): boolean {
  return /limit requests|too many requests/i.test(text);
}

function parseTimeline(topic: string, text: string): Coverage | null {
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
    const text = await gdeltLimit(() => getText(url, 6000));
    if (isThrottleNotice(text)) return null;
    const cov = parseTimeline(topic, text);
    if (cov) cache.set(cacheKey, { at: Date.now(), val: cov });
    return cov;
  } catch {
    return null; // unknown coverage → scorer treats the gap as neutral
  }
}
