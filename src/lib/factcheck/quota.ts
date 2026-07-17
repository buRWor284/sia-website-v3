// src/lib/factcheck/quota.ts
// FactcheckIQ | Phase 4 : per-organization monthly cap on Full audits.
//
// WHY THIS EXISTS
// Every Full audit spends from the shared ANTHROPIC_API_KEY (one key across all
// EMOS AI tools). A 40-claim Full audit tops out near $5; Citation checks are
// near free. Before opening FactcheckIQ to real users we cap how many Full
// audits one paying organization can run per calendar month, so a single org
// cannot drain the shared balance.
//
// WHY IT COUNTS fact_check_runs ROWS (not a new table, not QUOTA_LIMITS)
// The EMOS platform is deliberately unmetered (see src/lib/gate/quota-limits.ts,
// "single-plan platform-tier decision"), so there is no per-org product-quota
// mechanism to reuse. Rather than stand up a parallel metering table, we count
// the runs already logged in fact_check_runs (each stamped with org_id, mode,
// created_at). That row set is the single source of truth for "how many Full
// audits did this org run this month", and it stays correct even if this file
// is bypassed. A small race (two Full audits starting in the same instant can
// both pass the check) is acceptable: the overspend is at most one audit and
// the hourly abuse brake in requireEmosAccess() still applies.
//
// THE NUMBER IS A BUSINESS DECISION (labeled default below). Change the one
// constant once confirmed; nothing else needs to move.

import { createSupabaseServiceClient } from "../supabase";
import type { FactCheckMode } from "./types";

/**
 * DEFAULT (confirm before public launch): 10 Full audits per organization per
 * UTC calendar month. Rough cost ceiling: 10 x ~$5 = ~$50 of Anthropic spend in
 * a heavy month, usually far less (most audits are well under 40 claims and
 * Citation checks do not count).
 */
export const FULL_AUDIT_MONTHLY_CAP = 10;

/**
 * Citation & link check is near free, so it carries NO monthly cap here: only
 * the existing 20-starts/hour abuse brake in requireEmosAccess() applies. Set a
 * number here if a citation cap is ever wanted.
 */
export const CITATION_MONTHLY_CAP: number | null = null;

export interface FullAuditUsage {
  cap: number;
  used: number;
  remaining: number;
  /** First instant of the current cap window (UTC ISO). */
  periodStart: string;
  /** When the count resets: first instant of next month (UTC ISO). */
  periodResetsOn: string;
  /** True when the org is at or over the cap and further Full audits must block. */
  blocked: boolean;
}

/** First instant of the current UTC calendar month, and of the next one. */
function currentMonthWindow(now: Date): { start: Date; nextReset: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, nextReset };
}

/**
 * How many Full audits this org has run in the current calendar month, and how
 * many remain. Counts every full-mode run created in the window regardless of
 * final status: an audit that errored partway may still have spent search
 * budget, so it consumes quota (drain-safe). Fails OPEN (does not block) if the
 * count query itself errors, since the hourly abuse brake still applies.
 */
export async function getFullAuditUsage(orgId: string, now: Date = new Date()): Promise<FullAuditUsage> {
  const { start, nextReset } = currentMonthWindow(now);
  const db = createSupabaseServiceClient();
  const { count, error } = await db
    .from("fact_check_runs")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("mode", "full")
    .gte("created_at", start.toISOString());

  const used: number = error ? 0 : (count ?? 0);
  const remaining = Math.max(0, FULL_AUDIT_MONTHLY_CAP - used);
  return {
    cap: FULL_AUDIT_MONTHLY_CAP,
    used,
    remaining,
    periodStart: start.toISOString(),
    periodResetsOn: nextReset.toISOString(),
    blocked: !error && used >= FULL_AUDIT_MONTHLY_CAP,
  };
}

type QuotaCheck =
  | { ok: true; usage: FullAuditUsage | null }
  | { ok: false; usage: FullAuditUsage; message: string };

/**
 * Gate a run BEFORE it is created. Citation mode is never blocked here (returns
 * ok with usage: null). Full mode is blocked when the org is at/over its monthly
 * cap.
 */
export async function checkFullAuditQuota(
  orgId: string,
  mode: FactCheckMode,
  now: Date = new Date(),
): Promise<QuotaCheck> {
  if (mode !== "full") return { ok: true, usage: null };
  const usage = await getFullAuditUsage(orgId, now);
  if (usage.blocked) {
    const resetDate = usage.periodResetsOn.slice(0, 10);
    return {
      ok: false,
      usage,
      message:
        `Full-audit limit reached for this month: ${usage.used} of ${usage.cap} used. ` +
        `Citation & link checks are still available, or your Full-audit allowance resets on ${resetDate}.`,
    };
  }
  return { ok: true, usage };
}
