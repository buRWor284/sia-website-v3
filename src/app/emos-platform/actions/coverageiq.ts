"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { recordStageEvent } from "./stage";
// Types live canonically in src/lib/coverageiq/types.ts and are imported for
// internal use only. Do NOT re-export them from this file: it is a "use server"
// module, and Turbopack's server-action manifest treats every export name as a
// runtime action binding — a re-exported type has no runtime value and breaks
// the production build (tsc passes; `next build` does not). External consumers
// import these types directly from "@/lib/coverageiq/types".
import type {
  Stage, PesoType, LinkType, ContentType, DataSource, AlertStatus,
  DbPitch, DbJournalist, DbAlert, CreatePitchInput, CreateJournalistInput,
} from "@/lib/coverageiq/types";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPitches(): Promise<DbPitch[]> {
  const db = await getAuthenticatedClient();

  const { data, error } = await db
    .from("coverageiq_pitches")
    .select(`
      id, subject, client, team, stage, peso_type, data_source, notes,
      sent_date, placed_date, follow_up_due, placement_url, anchor_text,
      domain_rating, link_type, content_type, points, journalist_id,
      journalists ( name, outlet, domain_rating, email )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPitches error:", error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    subject: row.subject,
    client: row.client,
    team: row.team,
    stage: row.stage as Stage,
    peso_type: row.peso_type as PesoType,
    data_source: row.data_source as DataSource,
    notes: row.notes,
    sent_date: row.sent_date,
    placed_date: row.placed_date,
    follow_up_due: row.follow_up_due,
    placement_url: row.placement_url,
    anchor_text: row.anchor_text,
    domain_rating: row.domain_rating,
    link_type: row.link_type as LinkType | null,
    content_type: row.content_type as ContentType | null,
    points: row.points,
    journalist_id: row.journalist_id,
    journalist_name: row.journalists?.name ?? null,
    journalist_outlet: row.journalists?.outlet ?? null,
    journalist_dr: row.journalists?.domain_rating ?? null,
    journalist_email: row.journalists?.email ?? null,
  }));
}

export async function getJournalists(): Promise<DbJournalist[]> {
  const db = await getAuthenticatedClient();

  const { data, error } = await db
    .from("journalists")
    .select("id, name, outlet, beat, email, twitter_handle, domain_rating, last_contact, pitches_sent, placements, notes, tags")
    .order("last_contact", { ascending: false });

  if (error) {
    console.error("getJournalists error:", error.message);
    return [];
  }

  return (data ?? []) as DbJournalist[];
}

export async function getAlerts(): Promise<DbAlert[]> {
  const db = await getAuthenticatedClient();

  const { data, error } = await db
    .from("coverageiq_alerts")
    .select("id, alert_type, title, url, source, status, detected_at, pitch_id")
    .order("detected_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getAlerts error:", error.message);
    return [];
  }

  return (data ?? []) as DbAlert[];
}

// ─── Mutations ────────────────────────────────────────────────────────────────
//
// M5 (2026-07-02 review) — why every update/delete below ends with `.select("id")`:
//
// These filter by row id alone (`.eq("id", pitchId)`), so tenancy rests entirely
// on Supabase RLS. That was verified live on 2026-07-26: every tenant table has
// RLS enabled with an `org_isolation` policy (`org_id = get_current_org_id()`,
// FOR ALL, no separate WITH CHECK, so the same expression guards writes), and
// these actions use createSupabaseServerClient (anon key + Clerk JWT), which RLS
// applies to. Isolation IS enforced.
//
// The gap was in the reporting. An UPDATE or DELETE against another org's row is
// not an error under RLS — it simply matches zero rows and reports success. So a
// cross-tenant attempt, a stale id and a genuine edit all returned `true`.
// Asking for the affected rows back makes the difference visible: no row means
// no write happened, which is a real false and worth a log line.

export async function createPitch(input: CreatePitchInput): Promise<{ id: string } | null> {
  const db = await getAuthenticatedClient();

  // org_id is NOT NULL — fetch it first (same pattern that works in the dashboard)
  const { data: org, error: orgError } = await db
    .from("organizations")
    .select("id")
    .single();

  if (orgError || !org) {
    console.error("createPitch: could not resolve org_id", orgError?.message);
    return null;
  }

  const { data, error } = await db
    .from("coverageiq_pitches")
    .insert({
      org_id: org.id,
      subject: input.subject,
      journalist_id: input.journalist_id ?? null,
      client: input.client ?? null,
      team: input.team ?? null,
      peso_type: input.peso_type ?? "Earned",
      stage: input.stage ?? "drafted",
      data_source: input.data_source ?? "manual",
      notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createPitch error:", error.message);
    return null;
  }

  revalidatePath("/emos-platform/dashboard/coverageiq");
  // Stage progression: pitch_logged event. MUST be awaited — a fire-and-forget
  // call is dropped when the serverless function freezes after the response
  // (same bug class as the PressIQ "Score History always empty" fix, see
  // feedback-fire-and-forget-persistence).
  await recordStageEvent("pitch_logged");
  return data as { id: string };
}

export async function updatePitchStage(pitchId: string, stage: Stage): Promise<boolean> {
  const db = await getAuthenticatedClient();

  const { data, error } = await db
    .from("coverageiq_pitches")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", pitchId)
    .select("id");

  if (error) {
    console.error("updatePitchStage error:", error.message);
    return false;
  }
  if (!data?.length) {
    console.warn(`updatePitchStage: no row matched ${pitchId} (deleted, or not this org)`);
    return false;
  }

  revalidatePath("/emos-platform/dashboard/coverageiq");
  return true;
}

export async function updateAlertStatus(alertId: string, status: AlertStatus): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db.from("coverageiq_alerts").update({ status }).eq("id", alertId).select("id");
  if (error) { console.error("updateAlertStatus error:", error.message); return false; }
  if (!data?.length) { console.warn(`updateAlertStatus: no row matched ${alertId}`); return false; }
  revalidatePath("/emos-platform/dashboard/coverageiq");
  return true;
}

// ─── Journalist management (Phase 4) ─────────────────────────────────────────

export async function createJournalist(input: CreateJournalistInput): Promise<{ id: string } | null> {
  const db = await getAuthenticatedClient();

  const { data: org, error: orgError } = await db.from("organizations").select("id").single();
  if (orgError || !org) { console.error("createJournalist: no org", orgError?.message); return null; }

  const { data, error } = await db
    .from("journalists")
    .insert({
      org_id:         org.id,
      name:           input.name,
      outlet:         input.outlet ?? null,
      beat:           input.beat ?? null,
      email:          input.email ?? null,
      twitter_handle: input.twitter_handle ?? null,
      domain_rating:  input.domain_rating ?? null,
      notes:          input.notes ?? null,
      tags:           input.tags ?? [],
      data_source:    input.data_source ?? "manual",
    })
    .select("id")
    .single();

  if (error) { console.error("createJournalist error:", error.message); return null; }

  revalidatePath("/emos-platform/dashboard/coverageiq");
  revalidatePath("/emos-platform/dashboard/journocollabiq");
  // Awaited for the same fire-and-forget reason as pitch_logged above.
  await recordStageEvent("journalist_saved");
  return data as { id: string };
}

export async function updateJournalist(
  journalistId: string,
  input: Partial<CreateJournalistInput>,
): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("journalists")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", journalistId)
    .select("id");
  if (error) { console.error("updateJournalist error:", error.message); return false; }
  if (!data?.length) { console.warn(`updateJournalist: no row matched ${journalistId}`); return false; }
  revalidatePath("/emos-platform/dashboard/coverageiq");
  revalidatePath("/emos-platform/dashboard/journocollabiq");
  return true;
}

export async function deleteJournalist(journalistId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db.from("journalists").delete().eq("id", journalistId).select("id");
  if (error) { console.error("deleteJournalist error:", error.message); return false; }
  if (!data?.length) { console.warn(`deleteJournalist: no row matched ${journalistId}`); return false; }
  revalidatePath("/emos-platform/dashboard/coverageiq");
  revalidatePath("/emos-platform/dashboard/journocollabiq");
  return true;
}
