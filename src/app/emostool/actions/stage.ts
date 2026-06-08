"use server";

/**
 * EMOS Stage Progression Engine
 *
 * Thresholds (from RFP):
 *   signal  → press    : 3 saved signals OR 1 asset pack generated
 *   press   → collab   : 5 pitches scored
 *   collab  → coverage : 5 journalists saved
 *   coverage→ full     : 10 pitches logged in CoverageIQ
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StageEventType =
  | "signal_saved"
  | "pack_generated"
  | "pitch_scored"
  | "journalist_saved"
  | "pitch_logged"
  | "placement_confirmed";

export type EmosStage = "signal" | "press" | "collab" | "coverage" | "full";

const STAGE_ORDER: EmosStage[] = ["signal", "press", "collab", "coverage", "full"];

const THRESHOLDS: Record<EmosStage, { events: StageEventType[]; count: number }> = {
  signal:   { events: ["signal_saved", "pack_generated"], count: 3 },
  press:    { events: ["pitch_scored"],                   count: 5 },
  collab:   { events: ["journalist_saved"],               count: 5 },
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

// ─── Stage metadata (for UI) ──────────────────────────────────────────────────

export const STAGE_META: Record<EmosStage, {
  label: string;
  tool: string;
  description: string;
  threshold: string;
}> = {
  signal:   { label: "SignalIQ",        tool: "Signal Detection",     description: "Spot story opportunities before the news cycle.",   threshold: "Save 3 signals to unlock PressIQ" },
  press:    { label: "PressIQ",         tool: "Pitch Scoring",        description: "Score and refine your pitches with AI.",            threshold: "Score 5 pitches to unlock JournoCollabIQ" },
  collab:   { label: "JournoCollabIQ",  tool: "Journalist CRM",       description: "Build and manage journalist relationships.",        threshold: "Save 5 journalists to unlock CoverageIQ" },
  coverage: { label: "CoverageIQ",      tool: "Pitch Tracking",       description: "Track your full pitch pipeline and placements.",    threshold: "Log 10 pitches to reach Full EMOS" },
  full:     { label: "EMOS Full",       tool: "Full Platform",        description: "Complete earned media operating system unlocked.",  threshold: "All stages complete" },
};
