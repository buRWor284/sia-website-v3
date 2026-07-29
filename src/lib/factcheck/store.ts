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
 * Everything else that stalls is revived by the continuation trigger (the status
 * route on a live poll, OR the tabless cron) instead of being killed here.
 * Best-effort by design: a sweep failure must never break a status read. Returns
 * the number of runs swept.
 *
 * Scope: pass an orgId to sweep one org (the status route's per-org read); pass
 * null to sweep every org (the tabless cron's global tick). The logic is
 * identical; only the org filter differs.
 */
async function failStaleRunsImpl(orgId: string | null, staleAfterMs: number, absoluteMaxMs: number): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const now = Date.now();
  const staleCutoff = new Date(now - staleAfterMs).toISOString();
  const absoluteCutoff = new Date(now - absoluteMaxMs).toISOString();
  const scope = orgId ? `org ${orgId}` : "all orgs";

  let query = supabase
    .from("fact_check_runs")
    .select("id, created_at, fact_check_claims(count)")
    .in("status", ["queued", "running"])
    .lt("created_at", staleCutoff);
  if (orgId) query = query.eq("org_id", orgId);
  const { data: candidates, error: candErr } = await query;
  if (candErr || !candidates || candidates.length === 0) {
    if (candErr) console.error(`[factcheckiq] stale-run sweep query failed for ${scope}: ${candErr.message}`);
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
    console.error(`[factcheckiq] stale-run sweep failed for ${scope}: ${error.message}`);
    return 0;
  }
  if (data && data.length > 0) {
    console.info(`[factcheckiq] stale-run sweep: marked ${data.length} unrecoverable run(s) as error for ${scope}`);
  }
  return data?.length ?? 0;
}

/** Per-org stale-run sweep (used by the status route on each poll). Behavior unchanged from the pre-cron single-arg version. */
export async function failStaleRuns(orgId: string, staleAfterMs: number, absoluteMaxMs: number): Promise<number> {
  return failStaleRunsImpl(orgId, staleAfterMs, absoluteMaxMs);
}

/**
 * Global stale-run sweep across every org, for the tabless continuation cron:
 * the cron runs with no user/org context, so it cannot sweep per-org the way the
 * status route does. Same unrecoverable-only criteria as failStaleRuns.
 */
export async function failStaleRunsGlobal(staleAfterMs: number, absoluteMaxMs: number): Promise<number> {
  return failStaleRunsImpl(null, staleAfterMs, absoluteMaxMs);
}

/**
 * Tabless continuation (21 Jul 2026): the runs the cron should drive this tick.
 * Returns up to `limit` runs, across ALL orgs, that are:
 *   - status 'running', and
 *   - free to be picked up: lease_until is null or already expired (no live
 *     worker is renewing it), and
 *   - actually resumable: at least one claim row exists.
 *
 * Why the claim-row guard: for a running run, report_md is always null (it is
 * written only at finalize, in the same update that flips status to 'done'), so
 * "still needs work" is implied by status='running' alone — we do NOT need to
 * inspect report_md or pending counts. What we must exclude is a run that died
 * before extraction stored any claims (the sweeper's job, not continueRun's —
 * continueRun on a claim-less run would finalize an empty report) and a slow
 * intake that still holds a live lease but has not inserted claims yet (its lease
 * is not expired, so the lease filter already excludes it; the claim guard is
 * belt-and-suspenders).
 *
 * The embedded fact_check_claims(count) cannot be a WHERE clause in PostgREST, so
 * we over-fetch (oldest first, for fairness) and filter by count in code, then
 * slice to `limit`. Single-writer safety is enforced at pickup by acquireRunLease,
 * not here; this is only a candidate list.
 */
export async function getRunsNeedingContinuation(limit: number): Promise<{ id: string; org_id: string }[]> {
  const supabase = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("fact_check_runs")
    .select("id, org_id, fact_check_claims(count)")
    .eq("status", "running")
    .or(`lease_until.is.null,lease_until.lt.${nowIso}`)
    .order("created_at", { ascending: true })
    .limit(Math.max(limit * 4, limit));
  if (error) {
    console.error(`[factcheckiq] getRunsNeedingContinuation query failed: ${error.message}`);
    return [];
  }
  return (data ?? [])
    .filter((r: { fact_check_claims?: { count: number }[] }) => (r.fact_check_claims?.[0]?.count ?? 0) > 0)
    .slice(0, limit)
    .map((r: { id: string; org_id: string }) => ({ id: r.id, org_id: r.org_id }));
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

/* ---------------- Fix B: always-on worker engine (24 Jul 2026) ---------------- */

/**
 * Fix B: the full-audit runs the always-on worker should consider this poll
 * tick, oldest first:
 *   - status 'queued': created by the start route under FACTCHECK_ENGINE=worker
 *     (raw input persisted, never picked up yet), or
 *   - status 'running': an interrupted run to resume (worker crash/restart, or
 *     a Vercel-era run whose window died) or one that only needs finalizing,
 * and in either case the lease is free or expired (no live worker heartbeat).
 * Deliberately NO claim-count guard here (unlike getRunsNeedingContinuation):
 * the worker's processFullRunToCompletion handles every state itself, including
 * a 'running' run with zero claims (it restarts the pipeline from the persisted
 * input, which the queued flow now guarantees exists). Single-writer safety is
 * enforced at pickup by acquireRunLease, not here; this is only a candidate list.
 */
export async function getRunnableWorkerRuns(limit: number): Promise<{ id: string; org_id: string; status: string }[]> {
  const supabase = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("fact_check_runs")
    .select("id, org_id, status")
    .eq("mode", "full")
    .in("status", ["queued", "running"])
    .or(`lease_until.is.null,lease_until.lt.${nowIso}`)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) {
    console.error(`[factcheckiq] getRunnableWorkerRuns query failed: ${error.message}`);
    return [];
  }
  return (data ?? []).map((r: { id: string; org_id: string; status: string }) => ({
    id: r.id,
    org_id: r.org_id,
    status: r.status,
  }));
}

/**
 * Fix B: bump a pending claim's verify_attempts after a TRANSIENT check_failed
 * (the worker engine's per-claim retry meter; see FACTCHECK_MAX_CLAIM_ATTEMPTS).
 * Read-modify-write is safe here: only the run's lease holder processes its
 * claims, so there is exactly one writer. The caller passes the row's current
 * value (it already holds the row) to save a read. Best-effort: a lost increment
 * only means one extra retry, never a wrong verdict.
 */
export async function incrementClaimVerifyAttempts(claimId: string, currentAttempts: number): Promise<void> {
  const supabase = createSupabaseServiceClient();
  await supabase
    .from("fact_check_claims")
    .update({ verify_attempts: currentAttempts + 1 })
    .eq("id", claimId);
}

/**
 * Fix B: release a run's lease immediately (graceful worker shutdown), so the
 * replacement worker resumes the run on its next poll instead of waiting out
 * WORKER_LEASE_SECONDS. Best-effort; harmless on a run that just finished.
 */
export async function clearRunLease(runId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  await supabase.from("fact_check_runs").update({ lease_until: null }).eq("id", runId);
}

/**
 * Fix B: worker-engine queue watchdog, called from the status route on user
 * polls. Fails 'queued' full-audit runs older than stalledAfterMs with an honest
 * "engine offline" message, but ONLY when no run anywhere holds a live lease.
 * A live lease means a worker heartbeat landed within WORKER_LEASE_SECONDS, so
 * the engine is up and the queued run is simply waiting its turn behind a busy
 * worker, which is healthy at any age. Best-effort, never throws into the route.
 */
export async function failStalledQueuedRuns(orgId: string, stalledAfterMs: number): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();

  // Liveness probe: any unexpired lease anywhere = a worker is alive.
  const { data: live, error: liveErr } = await supabase
    .from("fact_check_runs")
    .select("id")
    .gt("lease_until", nowIso)
    .limit(1);
  if (liveErr) {
    console.error(`[factcheckiq] queued-stall liveness probe failed: ${liveErr.message}`);
    return 0;
  }
  if (live && live.length > 0) return 0;

  const cutoff = new Date(Date.now() - stalledAfterMs).toISOString();
  const { data, error } = await supabase
    .from("fact_check_runs")
    .update({
      status: "error",
      error:
        "The verification engine did not pick this run up. It may be offline for maintenance. Please re-run in a few minutes; your claim allowance was not used.",
      completed_at: new Date().toISOString(),
    })
    .eq("org_id", orgId)
    .eq("mode", "full")
    .eq("status", "queued")
    .lt("created_at", cutoff)
    .select("id");
  if (error) {
    console.error(`[factcheckiq] queued-stall sweep failed for org ${orgId}: ${error.message}`);
    return 0;
  }
  if (data && data.length > 0) {
    console.info(`[factcheckiq] queued-stall sweep: failed ${data.length} unclaimed queued run(s) for org ${orgId}`);
  }
  return data?.length ?? 0;
}
