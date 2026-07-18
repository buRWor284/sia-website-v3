// src/lib/factcheck/quota.ts
// FactcheckIQ | Phase 4.5: per-organization monthly CLAIM allowance.
//
// WHY CLAIMS, NOT AUDITS (design change 18 Jul 2026, replaces the Phase 4
// "10 Full audits per month" cap)
// A "document" is a broken metering unit: one doc can be a paragraph with 2
// claims and another 500 pages with thousands, yet both counted as "1 audit".
// The true cost unit is the VERIFIED CLAIM: every claim a full audit verifies is
// exactly one FACTCHECK_GRADE_MODEL call plus up to MAX_SEARCHES_PER_CLAIM web
// searches and MAX_FETCHES_PER_CLAIM fetches, so cost per claim is nearly
// constant (~4 to 8 cents). The allowance is therefore a monthly pool of
// verified claims per org. Citation & link checks stay uncapped: they cost
// close to nothing and keep the 20-starts/hour abuse brake.
//
// HOW IT IS COUNTED
// We count fact_check_claims rows with status 'checked' belonging to full-mode
// runs created in the current UTC month. That row set already exists (claims are
// stored per run), so no new metering table. Notes on precision, all accepted:
// - Claims resolved by the free citation gate inside a full audit (deterministic
//   fabricated) count although they cost no model call: slight overcount, keeps
//   the query simple.
// - 'check_failed' claims (rate limit, timeout, deadline) do NOT count: the user
//   got no answer, so they keep their allowance for the retry.
// - Two runs starting in the same instant can both pass the gate: overspend is
//   bounded by one document and the hourly brake still applies.
//
// ENFORCEMENT LIVES IN TWO PLACES
// 1. start route: blocks a new full audit only when the pool is exhausted.
// 2. run.ts: after extraction, if the document holds more claims than the pool
//    has left, the highest-risk claims are verified up to the remaining
//    allowance and the rest are stored as 'skipped' with an explanatory note
//    (never silently dropped), flagged via flags.quotaLimited.
//
// THE NUMBER IS A BUSINESS DECISION. Default 200/month; override without a
// deploy via the FACTCHECK_MONTHLY_CLAIM_ALLOWANCE env var.

import { createSupabaseServiceClient } from "../supabase";
import type { FactCheckMode } from "./types";

/** Default monthly pool of verified claims per organization (UTC calendar month). */
const DEFAULT_MONTHLY_CLAIM_ALLOWANCE = 200;

/** Resolved allowance: env override first, labeled default otherwise. */
export function monthlyClaimAllowance(): number {
  const raw = process.env.FACTCHECK_MONTHLY_CLAIM_ALLOWANCE;
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MONTHLY_CLAIM_ALLOWANCE;
}

export interface ClaimQuotaUsage {
  /** Monthly claim allowance for this org. */
  cap: number;
  /** Verified claims consumed so far this month. */
  used: number;
  remaining: number;
  /** First instant of the current cap window (UTC ISO). */
  periodStart: string;
  /** When the count resets: first instant of next month (UTC ISO). */
  periodResetsOn: string;
  /** True when the pool is exhausted and new full audits must block. */
  blocked: boolean;
}

/** First instant of the current UTC calendar month, and of the next one. */
function currentMonthWindow(now: Date): { start: Date; nextReset: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, nextReset };
}

/**
 * How many verified claims this org has consumed in the current calendar month
 * and how many remain. Fails OPEN (does not block) if the count query itself
 * errors, since the hourly abuse brake still applies.
 */
export async function getClaimQuotaUsage(orgId: string, now: Date = new Date()): Promise<ClaimQuotaUsage> {
  const { start, nextReset } = currentMonthWindow(now);
  const cap = monthlyClaimAllowance();
  const db = createSupabaseServiceClient();
  const { count, error } = await db
    .from("fact_check_claims")
    .select("id, fact_check_runs!inner(mode)", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "checked")
    .eq("fact_check_runs.mode", "full")
    .gte("created_at", start.toISOString());

  const used: number = error ? 0 : (count ?? 0);
  const remaining = Math.max(0, cap - used);
  return {
    cap,
    used,
    remaining,
    periodStart: start.toISOString(),
    periodResetsOn: nextReset.toISOString(),
    blocked: !error && used >= cap,
  };
}

type QuotaCheck =
  | { ok: true; usage: ClaimQuotaUsage | null }
  | { ok: false; usage: ClaimQuotaUsage; message: string };

/**
 * Gate a run BEFORE it is created. Citation mode is never blocked here (returns
 * ok with usage: null). Full mode is blocked only when the monthly claim pool is
 * fully exhausted; a document larger than the remaining pool is allowed to start
 * and is partially verified by run.ts (highest risk first), which is more useful
 * than refusing outright.
 */
export async function checkClaimQuota(
  orgId: string,
  mode: FactCheckMode,
  now: Date = new Date(),
): Promise<QuotaCheck> {
  if (mode !== "full") return { ok: true, usage: null };
  const usage = await getClaimQuotaUsage(orgId, now);
  if (usage.blocked) {
    const resetDate = usage.periodResetsOn.slice(0, 10);
    return {
      ok: false,
      usage,
      message:
        `Monthly claim allowance reached: ${usage.used} of ${usage.cap} claims used. ` +
        `Citation & link checks are still available, or your allowance resets on ${resetDate}.`,
    };
  }
  return { ok: true, usage };
}
