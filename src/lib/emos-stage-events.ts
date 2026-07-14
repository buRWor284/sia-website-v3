import "server-only";

/**
 * EMOS stage-event recording for TRUSTED server-side callers.
 *
 * H4 (2026-07-02 review): this logic used to live in a "use server" actions
 * file with an options.clerkUserId parameter — meaning it was exposed as a
 * server action that TRUSTED a caller-supplied user ID and wrote through the
 * RLS-bypassing service client. Anyone who invoked the action from the client
 * could write stage events into another org's data.
 *
 * It now lives in this `server-only` module (NOT a server action, cannot be
 * invoked from the client). API routes and server libs call
 * recordStageEventFor() with a user ID they have verified themselves; the
 * auth()-based server action in src/app/emos-platform/actions/stage.ts wraps it.
 *
 * Pipeline: signal → asset → collab → press → coverage → full
 */

import { createSupabaseServiceClient } from "@/lib/supabase";
import {
  STAGE_ORDER,
  type EmosStage,
  type StageEventType,
} from "@/lib/emos-stage-config";

const THRESHOLDS: Record<EmosStage, { events: StageEventType[]; count: number }> = {
  signal:   { events: ["signal_saved", "pack_generated"], count: 3 },
  asset:    { events: ["asset_created"],                  count: 1 },
  collab:   { events: ["journalist_saved"],               count: 3 },
  press:    { events: ["pitch_scored"],                   count: 5 },
  coverage: { events: ["pitch_logged", "placement_confirmed"], count: 10 },
  full:     { events: [],                                 count: Infinity },
};

/**
 * Record a stage event for a VERIFIED Clerk user ID and advance the org's
 * stage if the threshold is met. The caller is responsible for having
 * authenticated the user (e.g. via auth() or a verified webhook payload).
 */
export async function recordStageEventFor(
  clerkUserId: string,
  eventType: StageEventType,
): Promise<{ advanced: boolean; newStage: EmosStage | null }> {
  try {
    const db = createSupabaseServiceClient();

    // Get user + org
    const { data: user } = await db
      .from("users")
      .select("id, org_id")
      .eq("clerk_user_id", clerkUserId)
      .single();
    if (!user) return { advanced: false, newStage: null };

    const { data: org } = await db
      .from("organizations")
      .select("id, emos_stage")
      .eq("id", user.org_id)
      .single();
    if (!org) return { advanced: false, newStage: null };

    const currentStage = org.emos_stage as EmosStage;

    // Record the event
    await db.from("stage_activity").insert({
      org_id:     user.org_id,
      user_id:    user.id,
      stage:      currentStage,
      event_type: eventType,
    });

    // Check if threshold is met for current stage
    const threshold = THRESHOLDS[currentStage];
    if (!threshold || threshold.count === Infinity || threshold.events.length === 0) {
      return { advanced: false, newStage: null };
    }

    const { count } = await db
      .from("stage_activity")
      .select("id", { count: "exact", head: true })
      .eq("org_id", user.org_id)
      .eq("stage", currentStage)
      .in("event_type", threshold.events);

    const total = count ?? 0;
    if (total < threshold.count) return { advanced: false, newStage: null };

    // Advance to next stage
    const nextIdx = STAGE_ORDER.indexOf(currentStage) + 1;
    if (nextIdx >= STAGE_ORDER.length) return { advanced: false, newStage: null };
    const nextStage = STAGE_ORDER[nextIdx];

    await db
      .from("organizations")
      .update({ emos_stage: nextStage, updated_at: new Date().toISOString() })
      .eq("id", user.org_id);

    console.log(`[emos-stage] org ${user.org_id}: ${currentStage} → ${nextStage} (${total} ${eventType} events)`);
    return { advanced: true, newStage: nextStage };
  } catch (err) {
    console.error("[emos-stage] recordStageEventFor error (non-fatal):", err);
    return { advanced: false, newStage: null };
  }
}
