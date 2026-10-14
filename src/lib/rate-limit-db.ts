/**
 * Shared, cross-instance rate limiter backed by Supabase (Postgres).
 *
 * One atomic upsert per check via the `check_rate_limit` RPC (see rate-limit.sql),
 * using SUPABASE_SERVICE_ROLE_KEY. Used for ABUSE BRAKES (per-IP / per-user caps).
 * Product quotas for the public tools (PressIQ scores, SignalIQ scans, etc.) live
 * in lib/gate/quota.ts, which follows the same no-fallback rule.
 *
 * NO SILENT IN-MEMORY FALLBACK (fixed 2026-10-14). This used to fall back to the
 * per-process `rateLimit()` from lib/rate-limit.ts whenever the RPC failed. On
 * Vercel every serverless instance has its own memory, so that fallback quietly
 * reset the count on each new instance and the cap stopped holding, with only a
 * console.warn to show for it. Now:
 *   1. A failed RPC is retried once (covers a transient network/pool blip).
 *   2. If it still fails, the caller's explicit `failMode` decides:
 *        - "closed" → DENY. For brakes that protect money or reputation: Anthropic
 *          spend on public AI routes, and routes that send email (spam-relay risk).
 *        - "open"   → ALLOW. For paid / signed-in flows where locking out a
 *          paying customer during a DB blip is worse than a briefly missing brake.
 *   3. Either way it logs at ERROR level with a stable "[rate-limit] DEGRADED" tag
 *      so it shows up in Vercel runtime logs, and returns `degraded: true`.
 *
 * `failMode` defaults to "closed": a new caller that forgets to choose gets the
 * safe behaviour, never a fake counter.
 */
import { createSupabaseServiceClient } from "@/lib/supabase";

export type RateLimitFailMode = "open" | "closed";

export interface RateLimitDbResult {
  ok: boolean;
  remaining: number;
  /** True when the DB check could not run and `failMode` was applied instead. */
  degraded: boolean;
}

const RETRY_DELAY_MS = 150;

async function callRpc(key: string, limit: number, windowSeconds: number) {
  const db = createSupabaseServiceClient();
  const { data, error } = await db.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("check_rate_limit returned no row");
  return { ok: row.allowed === true, remaining: Math.max(0, Number(row.remaining) || 0) };
}

export async function rateLimitDb(
  key: string,
  {
    limit = 3,
    windowMs = 60_000,
    failMode = "closed",
  }: { limit?: number; windowMs?: number; failMode?: RateLimitFailMode } = {},
): Promise<RateLimitDbResult> {
  const windowSeconds = Math.max(1, Math.round(windowMs / 1000));
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await callRpc(key, limit, windowSeconds);
      return { ...r, degraded: false };
    } catch (e) {
      lastError = e;
      if (attempt === 1) await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    }
  }

  console.error(
    `[rate-limit] DEGRADED: DB check failed twice for "${key}" (failMode=${failMode}); ` +
      `${failMode === "closed" ? "DENYING" : "ALLOWING"} without a counter:`,
    (lastError as Error)?.message,
  );
  return failMode === "closed"
    ? { ok: false, remaining: 0, degraded: true }
    : { ok: true, remaining: Math.max(0, limit - 1), degraded: true };
}
