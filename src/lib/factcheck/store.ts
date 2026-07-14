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
