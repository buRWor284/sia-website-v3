/**
 * /api/signaliq/refresh-coverage — SignalIQ coverage refresher (BigQuery edition).
 *
 * Replaces the old GDELT DOC-API rotating-cursor worker. GDELT IP-blocks Vercel
 * egress, so the DOC path could only refresh ~4 topics/day. This job queries
 * GDELT Web News NGrams 3.0 directly in BigQuery: ONE scan covers every topic at
 * once, so the cursor rotates over DAYS, not topics. Adding topics costs zero
 * extra query bytes — only array size.
 *
 * Per invocation (Vercel Cron daily + GitHub Actions ~every 30 min):
 *   1. auth — CRON_SECRET bearer check (unchanged).
 *   2. day cursor — the recent [today-3, yesterday] days not yet in
 *      signaliq_scan_log, take up to MAX_DAYS_PER_RUN (nothing pending →
 *      cheap no-op; the frequent invocations make the schedule self-healing).
 *   3. per pending day — one batched BigQuery query (scanDay) → upsert counts +
 *      explicit zeros into signaliq_daily_counts → log the run (day, bytes,
 *      duration) in signaliq_scan_log. A day is logged ONLY after a successful
 *      scan+upsert, so a failed/timed-out day is simply retried next run
 *      (advance-on-success, like the old topic cursor).
 *   4. derive — recompute volume/trend/article_count per topic over the trailing
 *      60 days. Written to the coverage cache ONLY at cutover (see CUTOVER).
 *
 * SAFETY — the live scorer is untouched until cutover. `coverage.volume` is a
 * 0..1 value in the DOC-API (v1) world; BigQuery counts are raw units. The derive
 * step writes the cache only when the code's ACTIVE coverage version already
 * equals the BigQuery version (the cutover commit, which also re-baselines the
 * scorer). Before that, this job writes ONLY the two new tables and never touches
 * signaliq_coverage_cache — so raw counts can never reach scoring, and the parity
 * week compares signaliq_daily_counts against the DOC API directly.
 *
 * Backfill (Phase 4) — the GCP key lives only in Vercel env, so backfill runs
 * here, not in a local script:
 *   GET /api/signaliq/refresh-coverage?mode=backfill&start=YYYY-MM-DD&end=YYYY-MM-DD
 * walks the range in up to MAX_BACKFILL_DAYS_PER_RUN unscanned days per call
 * (call repeatedly until `remaining` is 0). Same 100 GB/query + 0.15 TiB/day caps.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { BEATS } from "@/lib/signaliq/config";
import { buildTopicMatchers } from "@/lib/signaliq/coverage/tokenize";
import { scanDay } from "@/lib/signaliq/coverage/bigquery";
import { deriveTopicCoverage, type DailyCount } from "@/lib/signaliq/coverage/derive";
import {
  ACTIVE_COVERAGE_VERSION,
  BIGQUERY_COVERAGE_VERSION,
  getScannedDays,
  upsertDailyCounts,
  logScan,
  getRecentDailyCounts,
  setStoredCoverageBulk,
} from "@/lib/signaliq/coverage-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds (Vercel Hobby cap)

// v2 = COUNT(DISTINCT url) article counting (2026-07-20 parity probe: occurrence
// counting inflated low-volume topics; see signaliq-parity-probe memory / WORKLOG).
const MATCHER = "webngrams_v2";
const RECENT_WINDOW_DAYS = 3; // steady state scans within [today-3, yesterday]
const MAX_DAYS_PER_RUN = 2; // ≤2 BigQuery scans per invocation (~80 GB worst case at v2 bytes)
const MAX_BACKFILL_DAYS_PER_RUN = 3; // backfill: a few more, still inside 60s + the daily quota
const DERIVE_WINDOW_DAYS = 60;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Canonical, de-duped matchers built once from every beat's seeds. */
const TOPIC_MATCHERS = buildTopicMatchers(BEATS.flatMap((b) => b.seeds));
const ALL_TOPICS = TOPIC_MATCHERS.map((m) => m.topic);

/** Cache-write switch: true only once ACTIVE has been flipped to the BigQuery
 *  version (the cutover commit). Until then the cache is never touched here. */
const CUTOVER = ACTIVE_COVERAGE_VERSION === BIGQUERY_COVERAGE_VERSION;

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDaysUTC(base: Date, delta: number): Date {
  return new Date(base.getTime() + delta * 86_400_000);
}

/** Scan + persist a list of days in order. Each day is logged only on success. */
async function runDays(days: string[]): Promise<Array<Record<string, unknown>>> {
  const scanned: Array<Record<string, unknown>> = [];
  for (const day of days) {
    const res = await scanDay(day, TOPIC_MATCHERS);
    await upsertDailyCounts(day, res.counts, ALL_TOPICS, MATCHER);
    await logScan({
      day,
      topicsMatched: res.topicsMatched,
      bytesBilled: res.bytesBilled,
      durationMs: res.durationMs,
    });
    scanned.push({
      day,
      topicsMatched: res.topicsMatched,
      bytesBilledMB: Math.round(res.bytesBilled / 1e6),
      durationMs: res.durationMs,
    });
  }
  return scanned;
}

/** Recompute per-topic coverage from signaliq_daily_counts; write to the cache
 *  only at cutover. Returns a compact summary for the response. */
async function deriveAndMaybeWrite(today: Date): Promise<Record<string, unknown>> {
  const since = ymd(addDaysUTC(today, -DERIVE_WINDOW_DAYS));
  const rows = await getRecentDailyCounts(since);

  const byTopic = new Map<string, DailyCount[]>();
  for (const r of rows) {
    const arr = byTopic.get(r.topic) ?? [];
    arr.push({ day: String(r.day), article_count: Number(r.article_count) || 0 });
    byTopic.set(r.topic, arr);
  }

  const derived = [...byTopic.entries()].map(([topic, series]) => {
    const d = deriveTopicCoverage(series, today);
    return { topic, volume: d.volume, trend: d.trend, articleCount: d.articleCount };
  });

  if (CUTOVER && derived.length) {
    await setStoredCoverageBulk(derived, BIGQUERY_COVERAGE_VERSION);
  }

  return {
    topicsDerived: derived.length,
    written: CUTOVER,
    version: CUTOVER ? BIGQUERY_COVERAGE_VERSION : null,
  };
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const today = new Date();
  const elapsed = () => Date.now() - started;

  try {
    const mode = new URL(req.url).searchParams.get("mode");

    // ── Backfill mode (Phase 4) ──────────────────────────────────────────────
    if (mode === "backfill") {
      const params = new URL(req.url).searchParams;
      const start = params.get("start") ?? "";
      const end = params.get("end") ?? "";
      if (!ISO_DAY.test(start) || !ISO_DAY.test(end) || start > end) {
        return NextResponse.json(
          { error: "backfill needs ?start=YYYY-MM-DD&end=YYYY-MM-DD (start ≤ end)" },
          { status: 400 },
        );
      }
      const candidates: string[] = [];
      for (let d = new Date(`${start}T00:00:00Z`); ymd(d) <= end; d = addDaysUTC(d, 1)) {
        candidates.push(ymd(d));
      }
      const already = await getScannedDays(start);
      const outstanding = candidates.filter((d) => !already.has(d));
      const pending = outstanding.slice(0, MAX_BACKFILL_DAYS_PER_RUN);
      const scanned = await runDays(pending);
      const derive = scanned.length ? await deriveAndMaybeWrite(today) : { skipped: true };

      return NextResponse.json({
        mode: "backfill",
        start,
        end,
        scanned,
        remaining: outstanding.length - pending.length,
        derive,
        totalTopics: ALL_TOPICS.length,
        cutover: CUTOVER,
        elapsedMs: elapsed(),
      });
    }

    // ── Steady state: recent day cursor ──────────────────────────────────────
    const candidates: string[] = [];
    for (let age = 1; age <= RECENT_WINDOW_DAYS; age++) candidates.push(ymd(addDaysUTC(today, -age)));
    const oldest = candidates[candidates.length - 1];
    const already = await getScannedDays(oldest);
    const pending = candidates.filter((d) => !already.has(d)).slice(0, MAX_DAYS_PER_RUN);
    const scanned = await runDays(pending);
    const derive = scanned.length || CUTOVER ? await deriveAndMaybeWrite(today) : { skipped: true };

    return NextResponse.json({
      mode: "daily",
      pendingDays: pending,
      scanned,
      derive,
      totalTopics: ALL_TOPICS.length,
      cutover: CUTOVER,
      elapsedMs: elapsed(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "refresh-coverage failed", message, elapsedMs: elapsed() },
      { status: 500 },
    );
  }
}
