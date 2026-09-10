/**
 * Monthly allowances for the paid EMOS platform (2026-09-10).
 *
 * Limits live in src/lib/gate/quota-limits.ts (PLATFORM_MONTHLY_LIMITS); the
 * counters live in public.usage_counters (supabase/usage-counters.sql).
 *
 * Pattern in a route, right after requireEmosAccess():
 *
 *   const seat = await reserveUsage(guard, "score");
 *   if (!seat.ok) return seat.res;
 *   ... AI call ...
 *   if (failed) await seat.release();
 *
 * Reserving BEFORE the call (an atomic check-and-increment in Postgres) means
 * two tabs cannot both spend the last unit, and a failed call is handed back so
 * nobody pays for an error. Admin logins are counted (so the meter can be tested
 * on them) but never blocked.
 *
 * Fails OPEN on a database error, like the subscription check in emos-guard:
 * an outage should not lock paying users out, and the hourly abuse brake in
 * requireEmosAccess() still caps the damage.
 */
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { isEmosAdminEmail } from "@/lib/emos-admins";
import {
  PLATFORM_ACTION_ORDER,
  PLATFORM_MONTHLY_LIMITS,
  usagePeriod,
  usageResetLabel,
  type PlatformAction,
} from "@/lib/gate/quota-limits";

export type UsageSeat =
  | { ok: true; orgId: string | null; remaining: number | null; release: (n?: number) => Promise<void> }
  | { ok: false; res: NextResponse };

const noop = async () => {};

async function orgIdFor(clerkUserId: string): Promise<string | null> {
  const db = createSupabaseServiceClient();
  const { data } = await db.from("users").select("org_id").eq("clerk_user_id", clerkUserId).maybeSingle();
  return (data?.org_id as string | undefined) ?? null;
}

/**
 * Reserve `n` units of `action` for the caller's org this month.
 * `n` > 1 is for batches (drafts: one unit per journalist).
 */
export async function reserveUsage(
  guard: { userId: string; email: string },
  action: PlatformAction,
  n = 1,
): Promise<UsageSeat> {
  const allowance = PLATFORM_MONTHLY_LIMITS[action];
  const admin = isEmosAdminEmail(guard.email);
  const period = usagePeriod();

  let orgId: string | null = null;
  try {
    orgId = await orgIdFor(guard.userId);
  } catch (e) {
    console.warn("[usage] org lookup failed, allowing:", e);
  }
  if (!orgId) return { ok: true, orgId: null, remaining: null, release: noop };

  const db = createSupabaseServiceClient();
  const { data, error } = await db.rpc("reserve_usage", {
    p_org: orgId,
    p_period: period,
    p_action: action,
    p_n: n,
    p_limit: admin ? null : allowance.limit,
  });
  if (error) {
    console.warn(`[usage] reserve ${action} failed, allowing:`, error.message);
    return { ok: true, orgId, remaining: null, release: noop };
  }

  const count = typeof data === "number" ? data : Number(data);
  if (count < 0) {
    const used = await currentCount(orgId, period, action);
    const left = Math.max(allowance.limit - used, 0);
    const reset = usageResetLabel();
    const error =
      left > 0 && n > left
        ? `You have ${left} ${left === 1 ? allowance.one : allowance.many} left this month and asked for ${n}. Pick ${left} or fewer, or wait until ${reset}.`
        : `You've used all ${allowance.limit} ${allowance.many} included this month. They reset on ${reset}.`;
    return {
      ok: false,
      res: NextResponse.json(
        { error, code: "monthly_limit", action, limit: allowance.limit, used, remaining: left, resetsOn: reset },
        { status: 429 },
      ),
    };
  }

  let released = 0;
  return {
    ok: true,
    orgId,
    remaining: admin ? null : Math.max(allowance.limit - count, 0),
    release: async (k = n) => {
      const give = Math.min(Math.max(k, 0), n - released);
      if (give <= 0) return;
      released += give;
      const { error: relErr } = await db.rpc("release_usage", {
        p_org: orgId, p_period: period, p_action: action, p_n: give,
      });
      if (relErr) console.warn(`[usage] release ${action} failed:`, relErr.message);
    },
  };
}

async function currentCount(orgId: string, period: string, action: PlatformAction): Promise<number> {
  const db = createSupabaseServiceClient();
  const { data } = await db
    .from("usage_counters")
    .select("count")
    .eq("org_id", orgId).eq("period", period).eq("action", action)
    .maybeSingle();
  return (data?.count as number | undefined) ?? 0;
}

export interface UsageRow {
  action: PlatformAction;
  label: string;
  tool: string;
  used: number;
  limit: number;
}

/** This month's meter for one org, every action in display order. */
export async function getUsageMeter(orgId: string): Promise<{ rows: UsageRow[]; resetsOn: string; period: string }> {
  const period = usagePeriod();
  const db = createSupabaseServiceClient();
  const { data, error } = await db
    .from("usage_counters")
    .select("action, count")
    .eq("org_id", orgId)
    .eq("period", period);
  if (error) console.warn("[usage] meter read failed:", error.message);
  const used = new Map<string, number>(
    ((data ?? []) as { action: string; count: number }[]).map((r) => [r.action, r.count]),
  );
  return {
    period,
    resetsOn: usageResetLabel(),
    rows: PLATFORM_ACTION_ORDER.map((action) => {
      const a = PLATFORM_MONTHLY_LIMITS[action];
      return { action, label: a.many, tool: a.tool, used: used.get(action) ?? 0, limit: a.limit };
    }),
  };
}
