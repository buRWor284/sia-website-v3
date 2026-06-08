/**
 * PressIQ — pitch logging (outcome flywheel).
 *
 * Saves scored pitches to pressiq_scores in Supabase using the service-role
 * client (bypasses RLS) so it works from the public tool without a full session.
 * When a Clerk user ID is provided we resolve the internal user + org and write them.
 */

import { createHash } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { recordStageEvent } from "@/app/emostool/actions/stage";
import type { PitchInput, ScoreResponse } from "./types";

export async function logPitch(
  input: PitchInput,
  result: ScoreResponse,
  clerkUserId?: string,
): Promise<void> {
  try {
    const pitchHash = createHash("sha256").update(input.pitch).digest("hex").slice(0, 16);
    const db = createSupabaseServiceClient();

    // Resolve internal user + org when a Clerk user ID is available
    let orgId: string | null = null;
    let internalUserId: string | null = null;
    if (clerkUserId) {
      const { data: u } = await db
        .from("users")
        .select("id, org_id")
        .eq("clerk_user_id", clerkUserId)
        .single();
      if (u) { orgId = u.org_id; internalUserId = u.id; }
    }

    const areas = result.areas;
    const l3Score = areas.emos
      ? Math.round(
          ((areas.emos.storytelling?.score ?? 0) +
            (areas.emos.neuromarketing?.score ?? 0) +
            (areas.emos.personalBrand?.score ?? 0)) /
            3,
        )
      : null;

    const { error } = await db.from("pressiq_scores").insert({
      org_id:               orgId,
      user_id:              internalUserId,
      pitch_text:           input.store === false ? null : input.pitch,
      journalist_query:     input.query ?? null,
      platform:             input.platform ?? "manual",
      composite_score:      result.composite,
      tier:                 result.tier.label,
      layer1_score:         areas.objective?.score ?? null,
      layer2_score:         areas.checklist?.score ?? null,
      layer3_score:         l3Score,
      authenticity_risk:    result.authenticityRisk?.flagged ?? false,
      dimension_breakdown:  areas,
      radar_axes:           result.radar ?? null,
      top_fixes:            result.topFixes ?? null,
    });

    if (error) {
      console.error("[pitch-score] DB insert failed:", error.message);
    } else {
      console.log(`[pitch-score] saved hash=${pitchHash} composite=${result.composite} tier=${result.tier.label}`);
      // Stage progression: pitch_scored event (only when user is authenticated)
      if (clerkUserId) {
        void recordStageEvent("pitch_scored", { clerkUserId });
      }
    }
  } catch (err) {
    // Non-fatal: never break the scoring response
    console.error("[pitch-score] logPitch failed (non-fatal):", err);
  }
}
