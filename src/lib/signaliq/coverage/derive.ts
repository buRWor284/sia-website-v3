/**
 * SignalIQ — derive per-topic coverage numbers from the accumulated daily counts
 * (build plan §5.3 step 5). Pure and unit-testable; no I/O.
 *
 * Windows are calendar-relative to `today` (UTC), counting only days we actually
 * scanned (present rows); unscanned days are treated as absent, not zero, so a
 * gap in the history doesn't drag an average toward 0. An explicit stored 0
 * (topic scanned, no coverage that day) IS counted as 0 — that's real signal.
 *
 *   volume        = avg(article_count) over the last 14 days
 *   trend         = (avg last 30d − avg prior 30d) / avg prior 30d, clamped [-1,1]
 *   articleCount  = sum over the last 60 days
 *
 * NOTE (cutover): `volume` here is a RAW occurrence average (new units), NOT the
 * 0..1 normalised value the live scorer expects from the old DOC-API path. It is
 * only ever written to the coverage cache once the code's ACTIVE coverage version
 * equals the BigQuery version (the cutover commit), which is also where the
 * scorer thresholds get re-baselined against these new units. Until then these
 * numbers are computed for visibility only and never reach scoring.
 */

const DAY_MS = 86_400_000;

export interface DailyCount {
  /** 'YYYY-MM-DD'. */
  day: string;
  article_count: number;
}

export interface DerivedCoverage {
  /** Raw avg occurrences over the last 14 days (see cutover note above). */
  volume: number;
  /** Coverage direction, clamped to [-1, 1]. */
  trend: number;
  /** Sum of occurrences over the last 60 days. */
  articleCount: number;
  /** How many scanned days fed the 60-day window (sample size). */
  days: number;
}

const clampTrend = (n: number): number => Math.max(-1, Math.min(1, Number.isFinite(n) ? n : 0));

/** UTC-midnight epoch for a Date. */
function utcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Whole-day age of a 'YYYY-MM-DD' relative to `today` (yesterday = 1). */
function ageInDays(day: string, todayMidnight: number): number {
  const t = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(t)) return Number.POSITIVE_INFINITY;
  return Math.round((todayMidnight - t) / DAY_MS);
}

export function deriveTopicCoverage(rows: DailyCount[], today: Date): DerivedCoverage {
  const t0 = utcMidnight(today);

  let sum14 = 0, n14 = 0;
  let sum30 = 0, n30 = 0;
  let sumPrior30 = 0, nPrior30 = 0;
  let sum60 = 0, n60 = 0;

  for (const r of rows) {
    const age = ageInDays(r.day, t0);
    const c = Number(r.article_count) || 0;
    if (age >= 1 && age <= 60) { sum60 += c; n60++; }
    if (age >= 1 && age <= 14) { sum14 += c; n14++; }
    if (age >= 1 && age <= 30) { sum30 += c; n30++; }
    if (age >= 31 && age <= 60) { sumPrior30 += c; nPrior30++; }
  }

  const volume = n14 ? sum14 / n14 : 0;
  const avg30 = n30 ? sum30 / n30 : 0;
  const avgPrior30 = nPrior30 ? sumPrior30 / nPrior30 : 0;
  const trend = avgPrior30 > 0 ? clampTrend((avg30 - avgPrior30) / avgPrior30) : avg30 > 0 ? 1 : 0;

  return { volume, trend, articleCount: sum60, days: n60 };
}
