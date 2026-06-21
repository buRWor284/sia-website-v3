/**
 * Shared, cross-instance rate limiter backed by Supabase (Postgres).
 *
 * Replaces the per-process in-memory limiter for the public tools so the monthly
 * cap actually holds across Vercel serverless instances (each of which had its own
 * memory). One atomic upsert per check via the `check_rate_limit` RPC.
 *
 * Requires the `rate_limits` table + `check_rate_limit` function (see rate-limit.sql)
 * and SUPABASE_SERVICE_ROLE_KEY. If the DB is unavailable (e.g. the migration hasn't
 * been applied yet), it degrades gracefully to the in-memory limiter so scoring never
 * breaks — you just temporarily get the old per-instance behaviour.
 */
import { createSupabaseServiceClient } from "@/lib/supabase";
import { rateLimit as memRateLimit } from "@/lib/rate-limit";

export async function rateLimitDb(
  key: string,
  { limit = 3, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): Promise<{ ok: boolean; remaining: number }> {
  try {
    const db = createSupabaseServiceClient();
    const { data, error } = await db.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: Math.max(1, Math.round(windowMs / 1000)),
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("check_rate_limit returned no row");
    return { ok: row.allowed === true, remaining: Math.max(0, Number(row.remaining) || 0) };
  } catch (e) {
    console.warn("[rate-limit] DB limiter unavailable; falling back to in-memory:", (e as Error)?.message);
    return memRateLimit(key, { limit, windowMs });
  }
}
