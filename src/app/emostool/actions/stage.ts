"use server";

/**
 * EMOS Stage Progression — SERVER ACTIONS (client-invokable).
 *
 * H4 (2026-07-02 review): the previous version accepted an
 * options.clerkUserId parameter on a server action, trusting a
 * caller-supplied user ID with the RLS-bypassing service client. The trusted
 * variant now lives in src/lib/emos-stage-events.ts (`server-only`, not
 * client-invokable); the actions here resolve identity ONLY via auth().
 *
 * Pipeline: signal → asset → collab → press → coverage → full
 */

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { recordStageEventFor } from "@/lib/emos-stage-events";
import type { EmosStage, StageEventType } from "@/lib/emos-stage-config";

// ─── Log event + maybe advance stage ─────────────────────────────────────────

/** Call this after every meaningful user action (Server Action context only). */
export async function recordStageEvent(
  eventType: StageEventType,
): Promise<{ advanced: boolean; newStage: EmosStage | null }> {
  const { userId } = await auth();
  if (!userId) return { advanced: false, newStage: null };
  return recordStageEventFor(userId, eventType);
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
