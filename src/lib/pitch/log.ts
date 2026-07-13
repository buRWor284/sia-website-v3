/**
 * PressIQ — pitch logging (outcome flywheel).
 *
 * Saves scored pitches to pressiq_scores in Supabase using the service-role
 * client (bypasses RLS) so it works from the public tool without a full session.
 * When a Clerk user ID is provided we resolve the internal user + org and write them.
 * Anonymous public scores (no session → no org) are stored too, with null
 * org_id/user_id — approved 2026-07-13 for the outcome flywheel. The D-13
 * store-toggle is honoured for them exactly like signed-in users.
 *
 * MUST be awaited by callers — a fire-and-forget call is dropped when the
 * serverless function freezes after the response (this was the "Score History
 * always empty" bug). See feedback-fire-and-forget-persistence.
 */

import { createHash } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { recordStageEventFor } from "@/lib/emos-stage-events";
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

    // Anonymous public scores are stored with null org_id/user_id (the
    // `pressiq_scores_allow_anonymous` migration made org_id + pitch_text
    // nullable). Null-org rows are invisible to every tenant — Score History
    // reads run as `authenticated` under org_isolation RLS — they exist only
    // for the aggregate flywheel.
    const areas = result.areas;
    const l3Score = areas.emos
      ? Math.round(
          ((areas.emos.storytelling?.score ?? 0) +
            (areas.emos.neuromarketing?.score ?? 0) +
            (areas.emos.personalBrand?.score ?? 0)) /
            3,
        )
      : null;

    // D-13: "store this pitch (anonymised)". When the user opts out we withhold ALL
    // pitch-derived content — the pitch text, the verbatim journalist query, the
    // per-dimension analysis text, and the top-fix text — keeping only anonymous
    // aggregate scores (composite/tier/layer scores, authenticity flag, radar numbers).
    const stored = input.store !== false;
    const { error } = await db.from("pressiq_scores").insert({
      org_id:               orgId,
      user_id:              internalUserId,
      pitch_text:           stored ? input.pitch : null,
      journalist_query:     stored ? (input.query ?? null) : null,
      platform:             input.platform ?? "manual",
      composite_score:      result.composite,
      tier:                 result.tier.label,
      layer1_score:         areas.objective?.score ?? null,
      layer2_score:         areas.checklist?.score ?? null,
      layer3_score:         l3Score,
      authenticity_risk:    result.authenticityRisk?.flagged ?? false,
      dimension_breakdown:  stored ? areas : null,
      radar_axes:           result.radar ?? null,
      top_fixes:            stored ? (result.topFixes ?? null) : null,
    });

    if (error) {
      console.error("[pitch-score] DB insert failed:", error.message);
    } else {
      console.log(`[pitch-score] saved hash=${pitchHash} composite=${result.composite} tier=${result.tier.label} org=${orgId ?? "anonymous"}`);
      // Stage progression: pitch_scored event. Awaited so it isn't dropped when
      // the function freezes after the response.
      if (clerkUserId) {
        await recordStageEventFor(clerkUserId, "pitch_scored");
      }
    }
  } catch (err) {
    // Non-fatal: never break the scoring response
    console.error("[pitch-score] logPitch failed (non-fatal):", err);
  }
}
