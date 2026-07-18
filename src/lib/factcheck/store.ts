// src/lib/factcheck/store.ts
// FactcheckIQ | Supabase reads/writes, mirrors src/lib/supabase.ts + src/lib/pitch conventions

import { createSupabaseServiceClient } from "../supabase";
import type { Claim, FactCheckRun, RunInput } from "./types";

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
 * Stale-run sweeper (17 Jul 2026). When the worker is hard-killed at the
 * function-duration cap, no catch block runs and the run row stays "running"
 * forever — the client then polls forever. There is no cron in this design, so
 * the status route calls this on every read: any of THIS org's runs still
 * queued/running past `staleAfterMs` (config.STALE_RUN_AFTER_MS: the cap plus
 * slack — a live run can never legitimately be that old, the platform would
 * already have killed it) is flipped to a terminal error the UI can show.
 * Best-effort by design: a sweep failure must never break a status read, so
 * errors are swallowed and 0 is returned. Returns the number of runs swept.
 * NOTE: keys off created_at — fact_check_runs has no updated_at column.
 */
export async function failStaleRuns(orgId: string, staleAfterMs: number): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const cutoffIso = new Date(Date.now() - staleAfterMs).toISOString();
  const { data, error } = await supabase
    .from("fact_check_runs")
    .update({
      status: "error",
      error:
        "This run was stopped by the platform's time limit before it could finish and has been marked failed. Re-run it; if it happens again, try citation mode or a shorter document.",
      completed_at: new Date().toISOString(),
    })
    .eq("org_id", orgId)
    .in("status", ["queued", "running"])
    .lt("created_at", cutoffIso)
    .select("id");
  if (error) {
    console.error(`[factcheckiq] stale-run sweep failed for org ${orgId}: ${error.message}`);
    return 0;
  }
  if (data && data.length > 0) {
    console.info(`[factcheckiq] stale-run sweep: marked ${data.length} zombied run(s) as error for org ${orgId}`);
  }
  return data?.length ?? 0;
}

export async function insertClaims(runId: string, orgId: string, claims: Omit<Claim, "id" | "runId" | "orgId" | "createdAt">[]): Promise<void> {
  if (claims.length === 0) return;
  const supabase = createSupabaseServiceClient();
  const rows = claims.map((c) => ({
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
  }));
  const { error } = await supabase.from("fact_check_claims").insert(rows);
  if (error) throw new Error(`Failed to insert fact_check_claims for run ${runId}: ${error.message}`);
}

export async function getRunWithClaims(runId: string, orgId: string): Promise<{ run: any; claims: any[] } | null> {
  const supabase = createSupabaseServiceClient();
  const { data: run, error: runErr } = await supabase.from("fact_check_runs").select("*").eq("id", runId).eq("org_id", orgId).single();
  if (runErr || !run) return null;
  const { data: claims } = await supabase.from("fact_check_claims").select("*").eq("run_id", runId).order("created_at", { ascending: true });
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
