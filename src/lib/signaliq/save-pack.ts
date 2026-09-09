import "server-only";

/**
 * Persist a generated SignalIQ asset pack for a TRUSTED Clerk user ID.
 *
 * Pipeline state layer, phase 2 (2026-09-09). Before this, the pack route was
 * 48 lines with no Supabase import: an Opus call produced a pitch angle, a
 * sourced data brief, a journalist shortlist and the cautions, handed them to
 * the browser, and closing the tab destroyed all of it. Regenerating cost
 * another Opus call for the same signal.
 *
 * Same shape and trust model as save-signal.ts: `server-only`, callers must
 * have verified the user themselves (the pack route does, via
 * requireEmosAccess), and the RLS-bypassing service client is used because an
 * API route has no Clerk-JWT Supabase session.
 */

import { createSupabaseServiceClient } from "@/lib/supabase";
import type { AssetPack, Opportunity } from "@/lib/signaliq/types";

export async function saveAssetPackForUser(
  clerkUserId: string,
  pack: AssetPack,
  opp: Opportunity,
  options?: { companyId?: string | null; beatLabel?: string | null },
): Promise<string | null> {
  try {
    const db = createSupabaseServiceClient();

    const { data: user } = await db
      .from("users")
      .select("org_id")
      .eq("clerk_user_id", clerkUserId)
      .single();
    if (!user) return null;

    // A company id is only honoured if it belongs to this org. The value comes
    // from the browser, so it is never trusted on its own.
    let companyId: string | null = null;
    if (options?.companyId) {
      const { data: company } = await db
        .from("companies")
        .select("id")
        .eq("id", options.companyId)
        .eq("org_id", user.org_id)
        .maybeSingle();
      companyId = company?.id ?? null;
    }

    // If this opportunity was already saved as a signal, link them. Matching on
    // headline within the org is the only handle available — the radar's
    // opportunityId is generated per scan and is not stored on the signal.
    let signalId: string | null = null;
    if (opp.headline) {
      const { data: signal } = await db
        .from("signaliq_signals")
        .select("id")
        .eq("org_id", user.org_id)
        .eq("headline", opp.headline)
        .order("detected_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      signalId = signal?.id ?? null;
    }

    const { data, error } = await db
      .from("signaliq_asset_packs")
      .insert({
        org_id:              user.org_id,
        company_id:         companyId,
        signal_id:          signalId,          // nullable since the phase-2 migration
        opportunity_id:     pack.opportunityId ?? null,
        beat_label:         options?.beatLabel ?? null,
        headline:           pack.headline ?? opp.headline ?? null,
        pitch_angle:        pack.angle ?? null,
        story_brief:        pack.brief ?? null,
        subject_line:       pack.subjectLine ?? null,
        linkable_asset_idea: pack.linkableAssetIdea ?? null,
        journalist_recs:    pack.journalists ?? null,
        cautions:           pack.cautions ?? null,
        sources:            pack.sources ?? null,
        chart_data:         pack.chart ?? null,
      })
      .select("id")
      .single();

    if (error) { console.error("saveAssetPackForUser error:", error.message); return null; }
    return data?.id ?? null;
  } catch (err) {
    console.error("saveAssetPackForUser error (non-fatal):", err);
    return null;
  }
}
