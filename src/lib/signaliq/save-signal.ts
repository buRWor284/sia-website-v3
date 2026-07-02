import "server-only";

/**
 * Save a SignalIQ opportunity for a TRUSTED Clerk user ID.
 *
 * H4 (2026-07-02 review): this used to be exported from a "use server"
 * actions file, meaning it was a client-invokable server action that trusted
 * a caller-supplied clerkUserId with the RLS-bypassing service client —
 * letting any caller write signals into another org's data. It now lives in
 * this `server-only` module: importable from API routes and server code only.
 *
 * Callers must have verified the user ID themselves (e.g. via auth()).
 * For Server Action use, see saveSignalFromScan in
 * src/app/emostool/actions/signaliq.ts (auth() + RLS-scoped client).
 */

import { createSupabaseServiceClient } from "@/lib/supabase";
import { recordStageEventFor } from "@/lib/emos-stage-events";
import type { Opportunity } from "@/lib/signaliq/types";

export async function saveSignalForUser(
  clerkUserId: string,
  opp: Opportunity,
  beatLabel: string,
  options?: { companyContext?: string; companyName?: string },
): Promise<string | null> {
  try {
    const db = createSupabaseServiceClient();

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
        org_id:          user.org_id,
        beat_id:         beatId,
        headline:        opp.headline,
        summary,
        source:          primarySignal?.source ?? "manual",
        source_url:      primarySignal?.url ?? null,
        signal_score:    opp.score ?? null,
        coverage_gap:    opp.components?.coverageGap ?? null,
        status:          "saved",
        company_name:    options?.companyName?.trim() || null,
        company_context: options?.companyContext?.trim()?.slice(0, 600) || null,
        scan_category:   beatLabel,
        fit:             opp.fit ?? null,
      })
      .select("id")
      .single();

    if (error) { console.error("saveSignalForUser error:", error.message); return null; }

    // Stage progression
    void recordStageEventFor(clerkUserId, "signal_saved");

    return signal?.id ?? null;
  } catch (err) {
    console.error("saveSignalForUser error (non-fatal):", err);
    return null;
  }
}
