"use server";

/**
 * EMOS Stage Progression Engine
 *
 * Pipeline: signal → asset → collab → press → coverage → full
 * Thresholds:
 *   signal   → asset    : 3 signals saved
 *   asset    → collab   : 1 asset created
 *   collab   → press    : 3 journalists saved
 *   press    → coverage : 5 pitches scored
 *   coverage → full     : 10 pitches logged
 */

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";
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

// ─── Log event + maybe advance stage ─────────────────────────────────────────

/**
 * Call this after every meaningful user action.
 * Uses the service client so it works from API routes too (pass clerkUserId directly).
 */
export async function recordStageEvent(
  eventType: StageEventType,
  options?: { clerkUserId?: string },
): Promise<{ advanced: boolean; newStage: EmosStage | null }> {
  try {
    // Resolve Clerk user ID — from options (API routes) or from auth() (Server Actions)
    let clerkUserId = options?.clerkUserId;
    if (!clerkUserId) {
      const { userId } = await auth();
      if (!userId) return { advanced: false, newStage: null };
      clerkUserId = userId;
    }

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
    console.error("[emos-stage] recordStageEvent error (non-fatal):", err);
    return { advanced: false, newStage: null };
  }
}

// ─── Get current org stage ────────────────────────────────────────────────────

export async function getOrgStage(): Promise<EmosStage | null> {
  const { userId, getToken } = await auth();
  if (!userId) return null;
  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");
  const { data: org } = await db.from("organizations").select("emos_stage").single();
  return (org?.emos_stage as EmosStage) ?? null;
}

// STAGE_META lives in src/lib/emos-stage-config.ts (plain constants file, not "use server")
