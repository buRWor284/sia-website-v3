/**
 * SignalIQ — Supabase-backed coverage cache.
 *
 * The background refresher (/api/signaliq/refresh-coverage) writes here.
 * Scans read from here — instant DB lookup, zero GDELT latency.
 * Uses the service-role client so RLS doesn't block the cron job.
 *
 * Tables required (run signaliq-coverage-cache-migration.sql in Supabase):
 *   signaliq_coverage_cache — one row per topic (topic PK, volume, trend, article_count, fetched_at)
 *   signaliq_cron_meta      — key/value store for the rotating cursor
 */
import type { Coverage } from "./types";
import { createSupabaseServiceClient } from "@/lib/supabase";

const COVERAGE_TABLE = "signaliq_coverage_cache";
const META_TABLE = "signaliq_cron_meta";
const CURSOR_KEY = "coverage_refresh_cursor";

/** Read cached coverage for a topic. Returns null if not yet in the store. */
export async function getStoredCoverage(topic: string): Promise<Coverage | null> {
  try {
    const db = createSupabaseServiceClient();
    const { data, error } = await db
      .from(COVERAGE_TABLE)
      .select("topic, volume, trend, article_count")
      .eq("topic", topic.toLowerCase())
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

/** Upsert a coverage record. Called only by the cron refresher. */
export async function setStoredCoverage(coverage: Coverage): Promise<void> {
  const db = createSupabaseServiceClient();
  const { error } = await db.from(COVERAGE_TABLE).upsert(
    {
      topic: coverage.topic.toLowerCase(),
      volume: coverage.volume,
      trend: coverage.trend,
      article_count: coverage.articleCount,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "topic" },
  );
  if (error) throw new Error(`setStoredCoverage failed: ${error.message} (code: ${error.code})`);
}

/** Read the rotating cursor (index into the flat seeds list). */
export async function getCursor(): Promise<number> {
  try {
    const db = createSupabaseServiceClient();
    const { data } = await db
      .from(META_TABLE)
      .select("value")
      .eq("key", CURSOR_KEY)
      .single();
    if (!data) return 0;
    const n = parseInt(data.value as string, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Advance the rotating cursor. Called by the cron refresher after each batch. */
export async function setCursor(index: number): Promise<void> {
  const db = createSupabaseServiceClient();
  const { error } = await db.from(META_TABLE).upsert(
    { key: CURSOR_KEY, value: String(index), updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) throw new Error(`setCursor failed: ${error.message} (code: ${error.code})`);
}
