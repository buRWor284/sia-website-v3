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
 *   2. day cursor — the recent [today-7, yesterday] days not yet in
 *      signaliq_scan_log, take up to MAX_DAYS_PER_RUN (nothing pending →
 *      cheap no-op; the frequent invocations make the schedule self-healing).
 *   3. per pending day — one batched BigQuery query (scanDay) → upsert counts +
 *      explicit zeros into signaliq_daily_counts → log the run (day, bytes,
 *      duration) in signaliq_scan_log. A day is logged ONLY after a successful
 *      scan+upsert, so a failed/timed-out day is simply retried next run
 *      (advance-on-success, like the old topic cursor).
 *   4. derive — recompute volume/trend/article_count per topic over the trailing
 *      60 days. Written to the coverage cache ONLY at cutover (see CUTOVER),
 *      and only when a day was scanned or the cache has gone stale (§ DERIVE).
 *
 * QUOTA (2026-07-25) — BigQuery enforces a custom QueryUsagePerDay cap
 * (0.15 TiB) that resets at midnight PACIFIC, not UTC. A large backfill spends
 * days of budget in minutes, so every scan for the rest of that Pacific day is
 * rejected with `usageQuotaExceeded`. That is a budget event, not a fault: the
 * day stays unlogged and the next run retries it. This route therefore answers
 * 200 with `quotaBlocked: true` rather than 500, so the Actions schedule does
 * not go red for hours over an expected, self-clearing condition. Genuine
 * failures (auth, Supabase, malformed SQL, timeouts) still 500.
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
import { BEATS, normalizeVolume } from "@/lib/signaliq/config";
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
  getCoverageFreshness,
} from "@/lib/signaliq/coverage-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds (Vercel Hobby cap)

// v2 = COUNT(DISTINCT url) article counting (2026-07-20 parity probe: occurrence
// counting inflated low-volume topics; see signaliq-parity-probe memory / WORKLOG).
const MATCHER = "webngrams_v2";
// A day that never gets scanned inside this window is lost SILENTLY — it just
// stops being a candidate and leaves a hole in the 60-day derive. 3 days gave
// almost no slack: one quota-blocked Pacific day plus GitHub's schedule
// throttling (~3 runs/6h observed, not the nominal 48/day) came within a day of
// dropping 2026-07-24. 7 costs nothing in steady state (still MAX_DAYS_PER_RUN
// per run, and only MISSING days are scanned) and survives a full quota outage.
const RECENT_WINDOW_DAYS = 7; // steady state scans within [today-7, yesterday]
const MAX_DAYS_PER_RUN = 1; // 1 BigQuery scan per invocation - 2 v2 days (~66s+) breach the 60s route cap; frequent invocations still self-heal
const MAX_BACKFILL_DAYS_PER_RUN = 1; // backfill: ONE day per call - 3-day v2 batches exceeded the 60s cap and left billed-but-discarded BigQuery jobs (2026-07-21)
const DERIVE_WINDOW_DAYS = 60;
// § DERIVE — derive is a pure function of signaliq_daily_counts + today, so on a
// no-op run it recomputes an identical result. Re-running it on all ~48
// invocations/day meant ~21k row reads + a 351-row cache rewrite each time, for
// nothing. Derive when a day was actually scanned, or when the cache is older
// than this (so the trailing-60-day window still rolls forward on days where no
// scan lands), or when freshness is unknown.
const DERIVE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
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

/**
 * True for BigQuery budget rejections (custom QueryUsagePerDay cap, project
 * quota, rate limit) as opposed to real faults. Checked on the `reason` field
 * first, which the BigQuery client sets to `usageQuotaExceeded`, with a message
 * regex as the fallback since `reason` is not always populated on the top-level
 * error. Deliberately NARROW: anything it does not match still 500s.
 */
const QUOTA_REASONS = new Set(["usageQuotaExceeded", "quotaExceeded", "rateLimitExceeded"]);

function isQuotaError(err: unknown): boolean {
  const e = err as {
    message?: unknown;
    reason?: unknown;
    errors?: Array<{ reason?: unknown }> | null;
  };
  const nested = Array.isArray(e?.errors) ? e.errors.map((x) => x?.reason) : [];
  const reasons = [e?.reason, ...nested].filter((r): r is string => typeof r === "string");
  if (reasons.some((r) => QUOTA_REASONS.has(r))) return true;
  const message = typeof e?.message === "string" ? e.message : String(err);
  return /custom quota exceeded|quota exceeded|exceeded .*quota|rateLimitExceeded/i.test(message);
}

/** See § DERIVE. Scanned a day → always. Otherwise only if the cache is stale. */
async function shouldDerive(scannedCount: number): Promise<boolean> {
  if (scannedCount > 0) return true;
  if (!CUTOVER) return false; // pre-cutover derive is a dry run; nothing is written
  const fetchedAt = await getCoverageFreshness();
  if (!fetchedAt) return true; // empty cache or unknown freshness → rebuild
  return Date.now() - fetchedAt.getTime() > DERIVE_MAX_AGE_MS;
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
    return { topic, volume: normalizeVolume(d.volume), trend: d.trend, articleCount: d.articleCount };
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
  // Hoisted out of the try so the catch can label a quota block with the mode
  // it happened in (backfill quota blocks are expected and routine).
  const params = new URL(req.url).searchParams;
  const mode = params.get("mode") === "backfill" ? "backfill" : "daily";

  try {
    // ── Backfill mode (Phase 4) ──────────────────────────────────────────────
    if (mode === "backfill") {
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
      const derive = (await shouldDerive(scanned.length))
        ? await deriveAndMaybeWrite(today)
        : { skipped: true };

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
    const missing = candidates.filter((d) => !already.has(d));
    const pending = missing.slice(0, MAX_DAYS_PER_RUN);
    const scanned = await runDays(pending);
    const derive = (await shouldDerive(scanned.length))
      ? await deriveAndMaybeWrite(today)
      : { skipped: true };

    return NextResponse.json({
      mode: "daily",
      pendingDays: pending,
      // Days still missing after this run — the Actions health check warns when
      // this stops shrinking, which is what a stuck cursor actually looks like.
      daysBehind: missing.length - scanned.length,
      scanned,
      derive,
      quotaBlocked: false,
      totalTopics: ALL_TOPICS.length,
      cutover: CUTOVER,
      elapsedMs: elapsed(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Budget exhaustion is expected and self-clearing (see QUOTA above): answer
    // 200 so the schedule stays green, but say so loudly in the body. The day
    // was never logged, so the next run after the Pacific-midnight reset picks
    // it straight back up.
    if (isQuotaError(err)) {
      return NextResponse.json({
        mode,
        quotaBlocked: true,
        skipped: "quota",
        scanned: [],
        derive: { skipped: true },
        message,
        totalTopics: ALL_TOPICS.length,
        cutover: CUTOVER,
        elapsedMs: elapsed(),
      });
    }

    return NextResponse.json(
      { error: "refresh-coverage failed", quotaBlocked: false, message, elapsedMs: elapsed() },
      { status: 500 },
    );
  }
}
