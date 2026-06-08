"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";
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
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getSignals(): Promise<DbSignal[]> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("signaliq_signals")
    .select("id, beat_id, headline, summary, source, source_url, signal_score, coverage_gap, status, detected_at")
    .order("detected_at", { ascending: false })
    .limit(100);

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
  }) => ({
    ...row,
    beat_name: null, // enriched below if beat_id present
    status: row.status as DbSignal["status"],
  }));
}

// ─── Save a signal from a scan result ────────────────────────────────────────

/**
 * Called from the SignalIQ scan API route (server-side) or directly from a
 * platform Server Action. Uses the service client when clerkUserId is passed
 * directly (API route context), otherwise uses auth() (Server Action context).
 */
export async function saveSignalFromOpportunity(
  opp: Opportunity,
  beatLabel: string,
  options?: { clerkUserId?: string },
): Promise<string | null> {
  try {
    const db = createSupabaseServiceClient();

    // Resolve org_id from either provided clerkUserId or auth()
    let clerkUserId = options?.clerkUserId;
    if (!clerkUserId) {
      const { userId } = await auth();
      if (!userId) return null;
      clerkUserId = userId;
    }

    const { data: user } = await db
      .from("users")
      .select("org_id")
      .eq("clerk_user_id", clerkUserId)
      .single();
    if (!user) return null;

    // Ensure beat exists (upsert by name)
    let beatId: string | null = null;
    const { data: existingBeat } = await db
      .from("signaliq_beats")
      .select("id")
      .eq("org_id", user.org_id)
      .eq("name", beatLabel)
      .single();

    if (existingBeat) {
      beatId = existingBeat.id;
    } else {
      const { data: newBeat } = await db
        .from("signaliq_beats")
        .insert({ org_id: user.org_id, name: beatLabel, keywords: [] })
        .select("id")
        .single();
      beatId = newBeat?.id ?? null;
    }

    // Build summary from signal sources
    const summary = opp.signals.map(s => s.title).join(" · ").substring(0, 500);
    const primarySignal = opp.signals[0];

    const { data: signal, error } = await db
      .from("signaliq_signals")
      .insert({
        org_id:       user.org_id,
        beat_id:      beatId,
        headline:     opp.headline,
        summary,
        source:       primarySignal?.source ?? "manual",
        source_url:   primarySignal?.url ?? null,
        signal_score: opp.score ?? null,
        coverage_gap: opp.components?.coverageGap ?? null,
        status:       "saved",
      })
      .select("id")
      .single();

    if (error) { console.error("saveSignal error:", error.message); return null; }

    // Stage progression
    void recordStageEvent("signal_saved", { clerkUserId });

    revalidatePath("/emostool/dashboard/signaliq");
    return signal?.id ?? null;
  } catch (err) {
    console.error("saveSignalFromOpportunity error (non-fatal):", err);
    return null;
  }
}

// ─── Explicit save from platform scan (called by client component) ────────────

/**
 * Called when an authenticated platform user clicks "Save to EMOS →" on a
 * scan result card. Uses the auth() session directly.
 */
export async function saveSignalFromScan(
  opp: Opportunity,
  beatLabel: string,
): Promise<{ ok: boolean; id: string | null }> {
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false, id: null };

    const id = await saveSignalFromOpportunity(opp, beatLabel, { clerkUserId: userId });
    return { ok: !!id, id };
  } catch (err) {
    console.error("saveSignalFromScan error:", err);
    return { ok: false, id: null };
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
