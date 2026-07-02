"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { recordStageEvent } from "./stage";
import type { Opportunity } from "@/lib/signaliq/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbSignal {
  id: string;
  beat_id: string | null;
  beat_name: string | null;        // denormalized for display
  headline: string;
  summary: string | null;
  source: string;
  source_url: string | null;
  signal_score: number | null;
  coverage_gap: number | null;
  status: "new" | "saved" | "pitched" | "archived";
  detected_at: string;
  // Attribution — what this signal was scanned for (so it's findable later)
  company_name: string | null;
  company_context: string | null;
  scan_category: string | null;    // the beat label at scan time
  fit: "high" | "medium" | "low" | null;  // company-fit rating from LLM
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getSignals(): Promise<DbSignal[]> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("signaliq_signals")
    .select("id, beat_id, headline, summary, source, source_url, signal_score, coverage_gap, status, detected_at, company_name, company_context, scan_category, fit")
    .order("detected_at", { ascending: false })
    .limit(200);

  if (error) { console.error("getSignals error:", error.message); return []; }

  return (data ?? []).map((row: {
    id: string;
    beat_id: string | null;
    headline: string;
    summary: string | null;
    source: string;
    source_url: string | null;
    signal_score: number | null;
    coverage_gap: number | null;
    status: string;
    detected_at: string;
    company_name: string | null;
    company_context: string | null;
    scan_category: string | null;
    fit: string | null;
  }) => ({
    ...row,
    beat_name: row.scan_category, // category doubles as the display beat name
    status: row.status as DbSignal["status"],
    fit: (row.fit as DbSignal["fit"]) ?? null,
  }));
}

// ─── Save a signal from a scan result ────────────────────────────────────────
// H4 (2026-07-02 review): the clerkUserId-accepting variant
// (saveSignalFromOpportunity) was a server action that trusted a
// caller-supplied user ID with the service client. It moved to
// src/lib/signaliq/save-signal.ts (`server-only`) as saveSignalForUser().
// Only auth()-based actions remain exposed here.

// ─── Explicit save from platform scan (called by client component) ────────────

/**
 * Called when an authenticated platform user clicks "Save to EMOS →" on a
 * scan result card. Uses the JWT client (same as all other platform actions) —
 * does NOT require SUPABASE_SERVICE_ROLE_KEY.
 */
export async function saveSignalFromScan(
  opp: Opportunity,
  beatLabel: string,
  companyContext?: string,
  companyName?: string,
): Promise<{ ok: boolean; id: string | null; error?: string }> {
  try {
    const db = await getAuthenticatedClient();

    // Resolve org_id via RLS-scoped query (same pattern as createPitch)
    const { data: org, error: orgError } = await db
      .from("organizations")
      .select("id")
      .single();
    if (orgError || !org) {
      console.error("saveSignalFromScan: no org", orgError?.message);
      return { ok: false, id: null, error: "Could not resolve org" };
    }

    // Upsert beat by name
    let beatId: string | null = null;
    const { data: existingBeat } = await db
      .from("signaliq_beats")
      .select("id")
      .eq("org_id", org.id)
      .eq("name", beatLabel)
      .maybeSingle();

    if (existingBeat) {
      beatId = existingBeat.id;
    } else {
      const { data: newBeat, error: beatErr } = await db
        .from("signaliq_beats")
        .insert({ org_id: org.id, name: beatLabel, keywords: [] })
        .select("id")
        .single();
      if (beatErr) console.error("beat insert error:", beatErr.message);
      beatId = newBeat?.id ?? null;
    }

    const summary = opp.signals.map(s => s.title).join(" · ").substring(0, 500);
    const primarySignal = opp.signals[0];

    const { data: signal, error: sigErr } = await db
      .from("signaliq_signals")
      .insert({
        org_id:          org.id,
        beat_id:         beatId,
        headline:        opp.headline,
        summary,
        source:          primarySignal?.source ?? "manual",
        source_url:      primarySignal?.url ?? null,
        signal_score:    opp.score ?? null,
        coverage_gap:    opp.components?.coverageGap ?? null,
        status:          "saved",
        company_name:    companyName?.trim() || null,
        company_context: companyContext?.trim()?.slice(0, 600) || null,
        scan_category:   beatLabel,
        fit:             opp.fit ?? null,
      })
      .select("id")
      .single();

    if (sigErr) {
      console.error("saveSignalFromScan insert error:", sigErr.message);
      return { ok: false, id: null, error: sigErr.message };
    }

    void recordStageEvent("signal_saved");
    revalidatePath("/emostool/dashboard/signaliq");
    return { ok: true, id: signal?.id ?? null };
  } catch (err) {
    console.error("saveSignalFromScan error:", err);
    return { ok: false, id: null, error: String(err) };
  }
}

// ─── Update signal status ─────────────────────────────────────────────────────

export async function updateSignalStatus(
  signalId: string,
  status: DbSignal["status"],
): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { error } = await db
    .from("signaliq_signals")
    .update({ status })
    .eq("id", signalId);
  if (error) { console.error("updateSignalStatus error:", error.message); return false; }
  revalidatePath("/emostool/dashboard/signaliq");
  return true;
}

// ─── Delete a saved signal ────────────────────────────────────────────────────

export async function deleteSignal(signalId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { error } = await db.from("signaliq_signals").delete().eq("id", signalId);
  if (error) { console.error("deleteSignal error:", error.message); return false; }
  revalidatePath("/emostool/dashboard/signaliq");
  return true;
}
