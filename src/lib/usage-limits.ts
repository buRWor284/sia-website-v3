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

/**
 * The same reservation for a caller whose org is already known (the MCP door,
 * spec v1.3 §2.3). Differences from reserveUsage(), all deliberate:
 *  - no org is an error, never "allow";
 *  - a database error REFUSES (fail closed on the machine door);
 *  - a run that would take more than a quarter of what is left for that action
 *    is refused once with `confirmLargeRun`, and goes ahead when the caller
 *    repeats it with `confirmLarge: true` (spec §3, Tier A);
 *  - returns plain data (no NextResponse) plus a ready-made cost line.
 */
/** The allowance side of a run's cost, as data (2026-10-07: results used to carry only `remaining: null` for an admin). */
export interface SeatUsage {
  action: PlatformAction;
  /** What one unit is called, e.g. "pitch draft". */
  unit: string;
  units_used: number;
  used_this_month: number;
  monthly_limit: number;
  /** Null on an admin account: counted, not capped. */
  remaining: number | null;
  admin_unlimited: boolean;
  resets_on: string;
}

export type ActorSeat =
  | { ok: true; remaining: number | null; costLine: string; usage: SeatUsage; release: (n?: number) => Promise<void> }
  | { ok: false; error: string; confirmLargeRun?: boolean; remaining?: number };

export async function reserveUsageForActor(
  actor: { orgId: string; email: string; isAdmin?: boolean },
  action: PlatformAction,
  n = 1,
  opts?: { confirmLarge?: boolean },
): Promise<ActorSeat> {
  if (!actor.orgId) return { ok: false, error: "No EMOS organisation on this account." };
  const allowance = PLATFORM_MONTHLY_LIMITS[action];
  const admin = actor.isAdmin ?? isEmosAdminEmail(actor.email);
  const period = usagePeriod();
  const reset = usageResetLabel();
  const unit = (k: number) => (k === 1 ? allowance.one : allowance.many);
  const db = createSupabaseServiceClient();

  if (!admin) {
    const usedBefore = await currentCount(actor.orgId, period, action);
    const left = Math.max(allowance.limit - usedBefore, 0);
    if (n > left) {
      return {
        ok: false,
        remaining: left,
        error:
          left > 0
            ? `Only ${left} ${unit(left)} left this month and this needs ${n}. Ask for ${left} or fewer, or wait until ${reset}.`
            : `All ${allowance.limit} ${allowance.many} for this month are used. They reset on ${reset}.`,
      };
    }
    if (n > left * 0.25 && !opts?.confirmLarge) {
      return {
        ok: false,
        confirmLargeRun: true,
        remaining: left,
        error: `This would use ${n} of the ${left} ${unit(left)} left this month (more than a quarter). Check with the user, then call again with confirm_large_run: true.`,
      };
    }
  }

  const { data, error } = await db.rpc("reserve_usage", {
    p_org: actor.orgId, p_period: period, p_action: action, p_n: n, p_limit: admin ? null : allowance.limit,
  });
  if (error) {
    console.error(`[usage] reserve ${action} failed on the MCP door, refusing:`, error.message);
    return { ok: false, error: "Could not check the monthly allowance. Nothing was run; please try again." };
  }
  const count = typeof data === "number" ? data : Number(data);
  if (!(count >= 0)) {
    return { ok: false, remaining: 0, error: `Not enough ${allowance.many} left this month. They reset on ${reset}.` };
  }

  const remaining = admin ? null : Math.max(allowance.limit - count, 0);
  let released = 0;
  return {
    ok: true,
    remaining,
    costLine: admin
      ? `Cost: used ${n} ${unit(n)} (admin account, counted but not capped; ${count} used this month).`
      : `Cost: used ${n} ${unit(n)}, ${remaining} left this month (resets ${reset}).`,
    usage: {
      action, unit: allowance.one, units_used: n, used_this_month: count, monthly_limit: allowance.limit,
      remaining, admin_unlimited: admin, resets_on: reset,
    },
    release: async (k = n) => {
      const give = Math.min(Math.max(k, 0), n - released);
      if (give <= 0) return;
      released += give;
      const { error: relErr } = await db.rpc("release_usage", {
        p_org: actor.orgId, p_period: period, p_action: action, p_n: give,
      });
      if (relErr) console.warn(`[usage] release ${action} failed:`, relErr.message);
    },
  };
}

/** Hand units back for a run that died without releasing them (get_run's stale-run sweep). */
export async function releaseUsageForOrg(orgId: string, action: PlatformAction, n = 1): Promise<void> {
  const db = createSupabaseServiceClient();
  const { error } = await db.rpc("release_usage", { p_org: orgId, p_period: usagePeriod(), p_action: action, p_n: n });
  if (error) console.warn(`[usage] release ${action} failed:`, error.message);
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
