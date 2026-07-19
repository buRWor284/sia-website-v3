// src/lib/factcheck/store.ts
// FactcheckIQ | Supabase reads/writes, mirrors src/lib/supabase.ts + src/lib/pitch conventions

import { createSupabaseServiceClient } from "../supabase";
import type { Claim, ClaimType, FactCheckRun, Risk, RunInput } from "./types";

/** Always fetch org_id from `organizations` before insert, per repo convention. */
export async function getOrgId(clerkOrgSlugOrId: string): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .or(`id.eq.${clerkOrgSlugOrId},slug.eq.${clerkOrgSlugOrId}`)
    .single();
  if (error || !data) throw new Error(`Could not resolve org_id for '${clerkOrgSlugOrId}': ${error?.message ?? "not found"}`);
  return data.id as string;
}

export async function createRun(params: {
  orgId: string;
  userId: string;
  input: RunInput;
}): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("fact_check_runs")
    .insert({
      org_id: params.orgId,
      user_id: params.userId,
      title: params.input.title ?? null,
      mode: params.input.mode,
      input_type: params.input.inputType,
      input_excerpt: params.input.text?.slice(0, 500) ?? null,
      source_url: params.input.sourceUrl ?? null,
      status: "queued",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create fact_check_runs row: ${error?.message}`);
  return data.id as string;
}

export async function updateRunStatus(
  runId: string,
  patch: Partial<Pick<FactCheckRun, "status" | "progress" | "verdictCounts" | "readiness" | "flags" | "reportMd" | "costCents" | "searchesUsed" | "error">>,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const row: Record<string, unknown> = {};
  if (patch.status) row.status = patch.status;
  if (patch.progress) row.progress = patch.progress;
  if (patch.verdictCounts) row.verdict_counts = patch.verdictCounts;
  if (patch.readiness) row.readiness = patch.readiness;
  if (patch.flags) row.flags = patch.flags;
  if (patch.reportMd) row.report_md = patch.reportMd;
  if (patch.costCents !== undefined) row.cost_cents = patch.costCents;
  if (patch.searchesUsed !== undefined) row.searches_used = patch.searchesUsed;
  if (patch.error) row.error = patch.error;
  if (patch.status === "done" || patch.status === "error") row.completed_at = new Date().toISOString();

  const { error } = await supabase.from("fact_check_runs").update(row).eq("id", runId);
  if (error) throw new Error(`Failed to update fact_check_runs ${runId}: ${error.message}`);
}

/**
 * Stale-run sweeper, Phase 5a semantics (19 Jul 2026). With continuation in
 * place, "old and still running" is NORMAL for a large document, so age alone
 * no longer means dead. A run is failed only when it cannot possibly continue:
 * - it died before any claims were stored (nothing for a continuation to pick
 *   up): older than `staleAfterMs` with zero claim rows; or
 * - it blew the absolute backstop (`absoluteMaxMs`), whatever its state.
 * Everything else that stalls is revived by the status route's continuation
 * trigger instead of being killed here. Best-effort by design: a sweep failure
 * must never break a status read. Returns the number of runs swept.
 */
export async function failStaleRuns(orgId: string, staleAfterMs: number, absoluteMaxMs: number): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const now = Date.now();
  const staleCutoff = new Date(now - staleAfterMs).toISOString();
  const absoluteCutoff = new Date(now - absoluteMaxMs).toISOString();

  const { data: candidates, error: candErr } = await supabase
    .from("fact_check_runs")
    .select("id, created_at, fact_check_claims(count)")
    .eq("org_id", orgId)
    .in("status", ["queued", "running"])
    .lt("created_at", staleCutoff);
  if (candErr || !candidates || candidates.length === 0) {
    if (candErr) console.error(`[factcheckiq] stale-run sweep query failed for org ${orgId}: ${candErr.message}`);
    return 0;
  }

  const toFail = candidates
    .filter((r: { id: string; created_at: string; fact_check_claims?: { count: number }[] }) => {
      const claimCount = r.fact_check_claims?.[0]?.count ?? 0;
      return claimCount === 0 || r.created_at < absoluteCutoff;
    })
    .map((r: { id: string }) => r.id);
  if (toFail.length === 0) return 0;

  const { data, error } = await supabase
    .from("fact_check_runs")
    .update({
      status: "error",
      error:
        "This run could not be completed and has been marked failed. Re-run it; if it happens again, try citation mode or a shorter document.",
      completed_at: new Date().toISOString(),
    })
    .in("id", toFail)
    .in("status", ["queued", "running"])
    .select("id");
  if (error) {
    console.error(`[factcheckiq] stale-run sweep failed for org ${orgId}: ${error.message}`);
    return 0;
  }
  if (data && data.length > 0) {
    console.info(`[factcheckiq] stale-run sweep: marked ${data.length} unrecoverable run(s) as error for org ${orgId}`);
  }
  return data?.length ?? 0;
}

/**
 * Phase 5a: atomically take the run's work lease if it is free or expired.
 * Exactly one caller wins; everyone else sees false and leaves the run alone.
 * The winner must renew via renewRunLease as it makes progress.
 */
export async function acquireRunLease(runId: string, leaseSeconds: number): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();
  const untilIso = new Date(Date.now() + leaseSeconds * 1000).toISOString();
  const { data, error } = await supabase
    .from("fact_check_runs")
    .update({ lease_until: untilIso })
    .eq("id", runId)
    .or(`lease_until.is.null,lease_until.lt.${nowIso}`)
    .select("id");
  if (error) {
    console.error(`[factcheckiq] lease acquire failed for run ${runId}: ${error.message}`);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

/** Phase 5a: unconditional lease refresh by the worker that already owns the run. Best-effort. */
export async function renewRunLease(runId: string, leaseSeconds: number): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const untilIso = new Date(Date.now() + leaseSeconds * 1000).toISOString();
  await supabase.from("fact_check_runs").update({ lease_until: untilIso }).eq("id", runId);
}

/** Phase 5a: store the normalized document text so continuation invocations keep full verify context. */
export async function setRunInputText(runId: string, text: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("fact_check_runs").update({ input_text: text }).eq("id", runId);
  if (error) throw new Error(`Failed to store input_text for run ${runId}: ${error.message}`);
}

/** Phase 5a: full run row (snake_case, as stored) for continuation and finalize. */
export async function getRunRow(runId: string): Promise<any | null> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from("fact_check_runs").select("*").eq("id", runId).single();
  return data ?? null;
}

/** Phase 5a: this run's still-pending claim rows (snake_case), display order. */
export async function getPendingClaims(runId: string): Promise<any[]> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("fact_check_claims")
    .select("*")
    .eq("run_id", runId)
    .eq("status", "pending")
    .order("idx", { ascending: true, nullsFirst: false });
  return data ?? [];
}

/**
 * Phase 4.5: insert every extracted claim immediately with status 'pending', so
 * the dashboard shows the full claim list (and its count-based time estimate)
 * while verification is still running. Returns the new row ids IN INPUT ORDER;
 * run.ts uses them to update each row in place as its verdict lands. idx is the
 * stable display order (batch inserts share one created_at, which made
 * created_at ordering unstable).
 */
export async function insertPendingClaims(
  runId: string,
  orgId: string,
  claims: { claimText: string; claimType: ClaimType; section: string | null; risk: Risk }[],
): Promise<string[]> {
  if (claims.length === 0) return [];
  const supabase = createSupabaseServiceClient();
  const rows = claims.map((c, i) => ({
    run_id: runId,
    org_id: orgId,
    claim_text: c.claimText,
    claim_type: c.claimType,
    section: c.section,
    risk: c.risk,
    status: "pending",
    verdict: null,
    sources: null,
    source_url: null,
    source_tier: null,
    evidence: null,
    note: null,
    idx: i,
  }));
  const { data, error } = await supabase.from("fact_check_claims").insert(rows).select("id, idx");
  if (error || !data) throw new Error(`Failed to insert pending fact_check_claims for run ${runId}: ${error?.message}`);
  // Re-order by idx defensively: PostgREST does not guarantee returned row order.
  const byIdx = [...data].sort((a, b) => (a.idx as number) - (b.idx as number));
  return byIdx.map((r) => r.id as string);
}

/** Phase 4.5: resolve one pending claim row in place as its check completes. */
export async function updateClaimRow(
  claimId: string,
  patch: Omit<Claim, "id" | "runId" | "orgId" | "createdAt">,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("fact_check_claims")
    .update({
      status: patch.status,
      verdict: patch.verdict,
      sources: patch.sources,
      source_url: patch.sourceUrl,
      source_tier: patch.sourceTier,
      evidence: patch.evidence,
      note: patch.note,
    })
    .eq("id", claimId);
  if (error) throw new Error(`Failed to update fact_check_claims ${claimId}: ${error.message}`);
}

/**
 * Insert claims that were never pending (today: the over-cap skipped
 * placeholder). startIdx continues the display order after the pending batch.
 */
export async function insertClaims(
  runId: string,
  orgId: string,
  claims: Omit<Claim, "id" | "runId" | "orgId" | "createdAt">[],
  startIdx = 0,
): Promise<void> {
  if (claims.length === 0) return;
  const supabase = createSupabaseServiceClient();
  const rows = claims.map((c, i) => ({
    run_id: runId,
    org_id: orgId,
    claim_text: c.claimText,
    claim_type: c.claimType,
    section: c.section,
    risk: c.risk,
    status: c.status,
    verdict: c.verdict,
    sources: c.sources,
    source_url: c.sourceUrl,
    source_tier: c.sourceTier,
    evidence: c.evidence,
    note: c.note,
    idx: startIdx + i,
  }));
  const { error } = await supabase.from("fact_check_claims").insert(rows);
  if (error) throw new Error(`Failed to insert fact_check_claims for run ${runId}: ${error.message}`);
}

export async function getRunWithClaims(runId: string, orgId: string): Promise<{ run: any; claims: any[] } | null> {
  const supabase = createSupabaseServiceClient();
  const { data: run, error: runErr } = await supabase.from("fact_check_runs").select("*").eq("id", runId).eq("org_id", orgId).single();
  if (runErr || !run) return null;
  const { data: claims } = await supabase
    .from("fact_check_claims")
    .select("*")
    .eq("run_id", runId)
    .order("idx", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  return { run, claims: claims ?? [] };
}

export async function listRuns(orgId: string, limit = 20): Promise<any[]> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("fact_check_runs")
    .select("id, title, mode, status, readiness, created_at, completed_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
