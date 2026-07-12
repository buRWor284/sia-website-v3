/**
 * Unified server-side quota service (Phase P2, Unified-Gate-Freemium-RFP §4.3).
 *
 * One enforcement path for every metered public-tool action, replacing:
 *   - PressIQ score's `rateLimitDb`, whose silent in-memory FALLBACK under-counted
 *     across serverless instances (each instance started a fresh counter, so the
 *     monthly cap never really held — the 2026-07-10 prod bug).
 *   - SignalIQ scan + pack's pure in-memory `rateLimit`, which was never shared
 *     across instances at all.
 *
 * Two things change vs. the old limiters:
 *  1. Keyed by IDENTITY, not just IP. A verified subscriber (the signed `sia_sub`
 *     wristband) is counted by their subscriber id, so one quota follows them
 *     across devices and networks. Anonymous callers fall back to a spoof-resistant
 *     IP (x-real-ip; see lib/public-tool-guard.ts).
 *  2. NO silent per-instance fallback. On a DB outage we apply an explicit policy:
 *       - failMode "open"  (metered free actions: scan / pack / score) → ALLOW and
 *         log loudly. We never spin up a per-process counter that fakes enforcement.
 *       - failMode "closed" (hard-gated actions) → DENY.
 *
 * Storage reuses the existing atomic `check_rate_limit` RPC + `rate_limits` table
 * (see lib/rate-limit.sql) — no new migration. Keys are namespaced `quota:<tool>:<identity>`
 * so product quotas never collide with abuse-braking keys (e.g. `gate-req:<ip>`).
 */
import type { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { clientIp } from "@/lib/public-tool-guard";
import { getPublicTier, getSubscriberId } from "@/lib/gate/public-tier";
import { QUOTA_LIMITS, QUOTA_WINDOW_MS, type QuotaTool } from "@/lib/gate/quota-limits";

export type QuotaTierName = "anonymous" | "email";

export interface QuotaResult {
  /** Whether this request is within quota (or was allowed by a fail-open policy). */
  ok: boolean;
  /** Remaining allowance in the window. Best-effort estimate when `degraded`. */
  remaining: number;
  /** Resolved caller tier. */
  tier: QuotaTierName;
  /** The applicable limit for this tier/tool. */
  limit: number;
  /** True when the DB check couldn't run and a failMode policy was applied. */
  degraded: boolean;
}

/**
 * Atomically check-and-increment the caller's rolling-window quota for `tool`.
 *
 * @param req      the incoming request (reads the wristband cookie + client IP)
 * @param tool     which metered action
 * @param opts.failMode  "open" (default) allows on DB outage; "closed" denies.
 */
export async function consumeQuota(
  req: NextRequest,
  tool: QuotaTool,
  opts: { failMode?: "open" | "closed" } = {},
): Promise<QuotaResult> {
  const failMode = opts.failMode ?? "open";
  const subId = getSubscriberId(req);
  const tier: QuotaTierName = getPublicTier(req) === "email" ? "email" : "anonymous";
  const identity = subId ? `sub:${subId}` : `ip:${clientIp(req)}`;
  const limit = QUOTA_LIMITS[tool][tier];
  const key = `quota:${tool}:${identity}`;

  try {
    const db = createSupabaseServiceClient();
    const { data, error } = await db.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: Math.round(QUOTA_WINDOW_MS / 1000),
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("check_rate_limit returned no row");
    return {
      ok: row.allowed === true,
      remaining: Math.max(0, Number(row.remaining) || 0),
      tier,
      limit,
      degraded: false,
    };
  } catch (e) {
    console.error(
      `[quota] DB check failed for ${key} (failMode=${failMode}) — NOT falling back to a per-instance counter:`,
      (e as Error)?.message,
    );
    if (failMode === "closed") {
      return { ok: false, remaining: 0, tier, limit, degraded: true };
    }
    // Fail open with logging: allow, and report an optimistic remaining so the UI
    // stays coherent during a rare outage. Enforcement resumes when the DB returns.
    return { ok: true, remaining: Math.max(0, limit - 1), tier, limit, degraded: true };
  }
}
