/**
 * SignalIQ — Supabase-backed coverage store.
 *
 * The background refresher (/api/signaliq/refresh-coverage) writes here.
 * Scans read from here — instant DB lookup, zero external latency.
 * Uses the service-role client so RLS doesn't block the cron job.
 *
 * Tables (emos-platform):
 *   signaliq_coverage_cache — one row per topic (topic PK, volume, trend,
 *                             article_count, fetched_at, coverage_version)
 *   signaliq_cron_meta      — key/value store (legacy DOC-API rotating cursor)
 *   signaliq_daily_counts   — one row per (topic, day): raw BigQuery webngrams
 *                             counts (see signaliq-bigquery-coverage.sql)
 *   signaliq_scan_log       — one row per scanned day: drives the day cursor +
 *                             tracks bytes billed
 */
import type { Coverage } from "./types";
import { createSupabaseServiceClient } from "@/lib/supabase";

const COVERAGE_TABLE = "signaliq_coverage_cache";
const META_TABLE = "signaliq_cron_meta";
const DAILY_COUNTS_TABLE = "signaliq_daily_counts";
const SCAN_LOG_TABLE = "signaliq_scan_log";
const CURSOR_KEY = "coverage_refresh_cursor";

/**
 * Coverage semantics currently trusted by the scorer:
 *   1 = DOC-API-derived (0..1 normalised volume)   ← ACTIVE today
 *   2 = BigQuery-derived (raw occurrence units)     ← written by the BQ pipeline
 * The BigQuery pipeline writes v2 rows and the scorer only ever reads the ACTIVE
 * version, so raw-unit values can never reach 0..1 scoring. Bump ACTIVE to the
 * BigQuery version at cutover (after the parity week + scoring re-baseline).
 */
// Typed as `number` (not the inferred literals 1 / 2) on purpose: the cutover
// commit flips ACTIVE to the BigQuery version, and `ACTIVE === BIGQUERY` must
// stay a legal runtime comparison rather than a "these literals never overlap"
// type error.
export const ACTIVE_COVERAGE_VERSION: number = 1;
export const BIGQUERY_COVERAGE_VERSION: number = 2;

/** Read cached coverage for a topic (ACTIVE version only). Null if not present. */
export async function getStoredCoverage(topic: string): Promise<Coverage | null> {
  try {
    const db = createSupabaseServiceClient();
    const { data, error } = await db
      .from(COVERAGE_TABLE)
      .select("topic, volume, trend, article_count, coverage_version")
      .eq("topic", topic.toLowerCase())
      .eq("coverage_version", ACTIVE_COVERAGE_VERSION)
      .single();

    if (error || !data) return null;
    return {
      topic: data.topic as string,
      volume: data.volume as number,
      trend: data.trend as number,
      articleCount: data.article_count as number,
      source: "gdelt",
    };
  } catch {
    return null; // don't crash scans if Supabase is unavailable
  }
}

/**
 * Upsert a single coverage record. Legacy DOC-API path — writes the ACTIVE
 * (v1) version. Retained for back-compat; the BigQuery pipeline uses
 * setStoredCoverageBulk() instead.
 */
export async function setStoredCoverage(coverage: Coverage): Promise<void> {
  const db = createSupabaseServiceClient();
  const { error } = await db.from(COVERAGE_TABLE).upsert(
    {
      topic: coverage.topic.toLowerCase(),
      volume: coverage.volume,
      trend: coverage.trend,
      article_count: coverage.articleCount,
      coverage_version: ACTIVE_COVERAGE_VERSION,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "topic" },
  );
  if (error) throw new Error(`setStoredCoverage failed: ${error.message} (code: ${error.code})`);
}

/** Read the legacy rotating cursor (index into the flat seeds list). */
export async function getCursor(): Promise<number> {
  try {
    const db = createSupabaseServiceClient();
    const { data } = await db.from(META_TABLE).select("value").eq("key", CURSOR_KEY).single();
    if (!data) return 0;
    const n = parseInt(data.value as string, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Advance the legacy rotating cursor. */
export async function setCursor(index: number): Promise<void> {
  const db = createSupabaseServiceClient();
  const { error } = await db.from(META_TABLE).upsert(
    { key: CURSOR_KEY, value: String(index), updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) throw new Error(`setCursor failed: ${error.message} (code: ${error.code})`);
}

/* ── BigQuery day-scan store ─────────────────────────────────────────────── */

/** Days already scanned (present in signaliq_scan_log) on/after `sinceDay`. */
export async function getScannedDays(sinceDay: string): Promise<Set<string>> {
  const db = createSupabaseServiceClient();
  const { data, error } = await db.from(SCAN_LOG_TABLE).select("day").gte("day", sinceDay);
  if (error || !data) return new Set<string>();
  return new Set(data.map((r) => String((r as { day: string }).day)));
}

/**
 * Upsert one day's counts for EVERY topic (explicit zeros included — a zero is
 * signal, not absence). Idempotent: re-running a day overwrites the same rows
 * via the (topic, day) primary key.
 */
export async function upsertDailyCounts(
  day: string,
  countsByTopic: Map<string, number>,
  topics: string[],
  matcher: string,
): Promise<void> {
  const db = createSupabaseServiceClient();
  const scannedAt = new Date().toISOString();
  const rows = topics.map((topic) => ({
    topic,
    day,
    article_count: countsByTopic.get(topic) ?? 0,
    matcher,
    scanned_at: scannedAt,
  }));
  const { error } = await db.from(DAILY_COUNTS_TABLE).upsert(rows, { onConflict: "topic,day" });
  if (error) throw new Error(`upsertDailyCounts failed: ${error.message} (code: ${error.code})`);
}

export interface ScanLogEntry {
  day: string;
  topicsMatched: number;
  bytesBilled: number;
  durationMs: number;
}

/** Record a scanned day (upsert on day — idempotent). */
export async function logScan(e: ScanLogEntry): Promise<void> {
  const db = createSupabaseServiceClient();
  const { error } = await db.from(SCAN_LOG_TABLE).upsert(
    { day: e.day, topics_matched: e.topicsMatched, bytes_billed: e.bytesBilled, duration_ms: e.durationMs },
    { onConflict: "day" },
  );
  if (error) throw new Error(`logScan failed: ${error.message} (code: ${error.code})`);
}

export interface DailyCountRow {
  topic: string;
  day: string;
  article_count: number;
}

/**
 * Pull all daily-count rows on/after `sinceDay` for the derive step. Paginated,
 * because a 60-day window over ~250 topics is ~15k rows and PostgREST caps a
 * single response at 1,000.
 */
export async function getRecentDailyCounts(sinceDay: string): Promise<DailyCountRow[]> {
  const db = createSupabaseServiceClient();
  const PAGE = 1000;
  const out: DailyCountRow[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await db
      .from(DAILY_COUNTS_TABLE)
      .select("topic, day, article_count")
      .gte("day", sinceDay)
      .order("topic", { ascending: true })
      .order("day", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error || !data || data.length === 0) break;
    out.push(...(data as DailyCountRow[]));
    if (data.length < PAGE) break;
  }
  return out;
}

export interface DerivedCoverageRow {
  topic: string;
  volume: number;
  trend: number;
  articleCount: number;
}

/**
 * Bulk-upsert derived coverage rows at a given version. Called by the BigQuery
 * pipeline ONLY at/after cutover (when ACTIVE === BIGQUERY version). Upsert on
 * topic flips each row to the given version + new-unit values.
 */
export async function setStoredCoverageBulk(rows: DerivedCoverageRow[], version: number): Promise<void> {
  if (rows.length === 0) return;
  const db = createSupabaseServiceClient();
  const fetchedAt = new Date().toISOString();
  const payload = rows.map((r) => ({
    topic: r.topic.toLowerCase(),
    volume: r.volume,
    trend: r.trend,
    article_count: r.articleCount,
    coverage_version: version,
    fetched_at: fetchedAt,
  }));
  const { error } = await db.from(COVERAGE_TABLE).upsert(payload, { onConflict: "topic" });
  if (error) throw new Error(`setStoredCoverageBulk failed: ${error.message} (code: ${error.code})`);
}
