/**
 * GDELT DOC 2.0 — the coverage denominator (RFP §5, §6).
 * `timelinevol` returns "Volume Intensity": the % of all global news coverage
 * matching the query, day by day. We turn that into:
 *   volume  — how much press already covers it now (0..1, normalised by a cap)
 *   trend   — recent vs prior coverage (-1..1)
 * High volume → small coverage gap → lower opportunity score.
 *
 * No API key. VOLUME_CAP calibrated 2026-06-25 from production data (5 rows, recalibrate at ≥50).
 */
import type { Coverage } from "../types";
import { avg, clamp, clamp01, getText } from "./http";
import { createLimiter } from "./throttle";

const BASE = "https://api.gdeltproject.org/api/v2/doc/doc";

// Calibrated 2026-06-25 from 5 production rows (pipeline started 2026-06-24 ~07:52).
// Raw GDELT Volume Intensity (% of global news) for niche B2B topics:
//   max=0.0053, p90=0.00354, avg=0.00129
// Setting cap just above observed max so the most-covered topic scores ~1.0.
// Re-calibrate once ≥50 rows are in the cache for a more stable distribution.
// NOTE: cached rows computed with old cap (0.5) will be stale until next refresh.
const VOLUME_CAP = 0.005;

// Baseline sanity check v1 (2026-07-08, see SignalIQ-Notes-and-TODOs.md): below
// this many days of non-zero baseline coverage, don't let a trend % headline the
// pack — press cycles are bursty and a handful of active days can swing the %
// wildly. Mirrors the same-purpose MIN_SAMPLE_FILINGS gate in sources/sec.ts.
const MIN_COVERAGE_DAYS = 10;

// GDELT's timelinevol is slow (~10s) AND rate-limited (returns a PLAINTEXT
// throttle notice — HTTP 200, not JSON — under load). Strategy:
//   1) modest concurrency so slow calls OVERLAP and finish within the function
//      budget (serialising them timed out the scan),
//   2) detect the throttle notice and treat it as "no coverage" (neutral gap)
//      WITHOUT a synchronous retry (a per-seed back-off blew the timeout),
//   3) cache results 6h (coverage moves slowly), so repeat scans cover more.
// scan.ts caps how many seeds reach here so a cold scan stays under maxDuration.
const gdeltLimit = createLimiter({ concurrency: 4 });

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — volume is a slow-moving signal (now ~13-month window)
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
    return { topic, volume: 0, trend: 0, articleCount: 0, source: "gdelt", lowSample: true };
  }
  const vals = data.map((d) => d.value);
  const recent = avg(vals.slice(-14)); // last ~2 weeks
  // Widened from a 4-week prior window to everything else in the fetched span
  // (2026-07-08 — baseline sanity check v1, see SignalIQ-Notes-and-TODOs.md).
  // Press cycles have their own seasonality (health stories spike around flu
  // season, tax stories in April); comparing against ~12 months instead of one
  // arbitrary 4-week window averages over that instead of amplifying it.
  const baselineVals = vals.slice(0, -14);
  const prior = avg(baselineVals);
  const volume = clamp01(recent / VOLUME_CAP);
  const trend = prior > 0 ? clamp((recent - prior) / prior, -1, 1) : recent > 0 ? 1 : 0;
  const daysCovered = vals.filter((v) => v > 0).length; // days with non-zero coverage
  const baselineDaysCovered = baselineVals.filter((v) => v > 0).length;
  const lowSample = baselineDaysCovered < MIN_COVERAGE_DAYS;
  return { topic, volume, trend, articleCount: daysCovered, source: "gdelt", lowSample };
}

export async function gdeltCoverage(topic: string): Promise<Coverage | null> {
  const cacheKey = topic.toLowerCase();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.val;

  // Widened from 2m to 13m (2026-07-08 — baseline sanity check v1, see
  // SignalIQ-Notes-and-TODOs.md) so parseTimeline has ~12 months of baseline to
  // compare the recent 2 weeks against, instead of just the 4 weeks prior.
  // NOT verified against a live response in this sandbox (no outbound access to
  // GDELT here) — same caveat as the VOLUME_CAP calibration note above; confirm
  // response shape/latency on the next real scan and adjust if GDELT enforces a
  // shorter max timespan for timelinevol than documented.
  const url =
    `${BASE}?query=${encodeURIComponent(`"${topic}"`)}` +
    `&mode=timelinevol&format=json&timespan=13m`;

  try {
    // Single attempt only — no synchronous retry (a 5s back-off per seed could
    // blow the function timeout). If throttled, return null (neutral gap); the
    // cache + next scan recover it. scan.ts also caps how many seeds reach here.
    // Bumped 11s → 15s alongside the 2m → 13m widening above: a longer requested
    // span is a larger response for GDELT to assemble, and this is a per-call
    // timeout (a slow call just degrades to "unknown coverage", it doesn't fail
    // the scan) — still comfortable inside the 60s route maxDuration at
    // concurrency 4. Re-tune if real scans show more timeouts than before.
    const text = await gdeltLimit(() => getText(url, 15000));
    if (isThrottleNotice(text)) return null;
    const cov = parseTimeline(topic, text);
    if (cov) cache.set(cacheKey, { at: Date.now(), val: cov });
    return cov;
  } catch {
    return null; // unknown coverage → scorer treats the gap as neutral
  }
}
