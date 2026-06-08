"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { recordStageEvent } from "./stage";

// ─── Auth guard ───────────────────────────────────────────────────────────────
const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Stage = "drafted" | "sent" | "opened" | "replied" | "placed" | "amplified";
export type PesoType = "Earned" | "Shared" | "Owned" | "Paid";
export type LinkType = "Do Follow" | "No Follow" | "N/A";
export type ContentType = "Original" | "Republished";
export type DataSource = "manual" | "PressIQ" | "SignalIQ" | "Google Alerts";
export type AlertStatus = "new" | "reviewed" | "archived";
export type AlertType = "syndication" | "mention" | "pickup";

export interface DbPitch {
  id: string;
  subject: string;
  client: string | null;
  team: string | null;
  stage: Stage;
  peso_type: PesoType;
  data_source: DataSource;
  notes: string | null;
  sent_date: string | null;
  placed_date: string | null;
  follow_up_due: string | null;
  placement_url: string | null;
  anchor_text: string | null;
  domain_rating: number | null;
  link_type: LinkType | null;
  content_type: ContentType | null;
  points: number | null;
  journalist_id: string | null;
  // joined
  journalist_name: string | null;
  journalist_outlet: string | null;
  journalist_dr: number | null;
}

export interface DbJournalist {
  id: string;
  name: string;
  outlet: string | null;
  beat: string | null;
  email: string | null;
  twitter_handle: string | null;
  domain_rating: number | null;
  last_contact: string | null;
  pitches_sent: number;
  placements: number;
  notes: string | null;
  tags: string[];
}

export interface DbAlert {
  id: string;
  alert_type: AlertType;
  title: string;
  url: string | null;
  source: string | null;
  status: AlertStatus;
  detected_at: string;
  pitch_id: string | null;
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
      journalists ( name, outlet, domain_rating )
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

export interface CreatePitchInput {
  subject: string;
  journalist_id?: string | null;
  client?: string | null;
  team?: string | null;
  peso_type?: PesoType;
  stage?: Stage;
  data_source?: DataSource;
  notes?: string | null;
}

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

  revalidatePath("/emostool/dashboard/coverageiq");
  // Stage progression: pitch_logged event
  void recordStageEvent("pitch_logged");
  return data as { id: string };
}

export async function updatePitchStage(pitchId: string, stage: Stage): Promise<boolean> {
  const db = await getAuthenticatedClient();

  const { error } = await db
    .from("coverageiq_pitches")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", pitchId);

  if (error) {
    console.error("updatePitchStage error:", error.message);
    return false;
  }

  revalidatePath("/emostool/dashboard/coverageiq");
  return true;
}

export async function updateAlertStatus(alertId: string, status: AlertStatus): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { error } = await db.from("coverageiq_alerts").update({ status }).eq("id", alertId);
  if (error) { console.error("updateAlertStatus error:", error.message); return false; }
  revalidatePath("/emostool/dashboard/coverageiq");
  return true;
}

// ─── Journalist management (Phase 4) ─────────────────────────────────────────

export interface CreateJournalistInput {
  name: string;
  outlet?: string | null;
  beat?: string | null;
  email?: string | null;
  twitter_handle?: string | null;
  domain_rating?: number | null;
  notes?: string | null;
  tags?: string[];
}

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
      data_source:    "manual",
    })
    .select("id")
    .single();

  if (error) { console.error("createJournalist error:", error.message); return null; }

  revalidatePath("/emostool/dashboard/coverageiq");
  void recordStageEvent("journalist_saved");
  return data as { id: string };
}

export async function updateJournalist(
  journalistId: string,
  input: Partial<CreateJournalistInput>,
): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { error } = await db
    .from("journalists")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", journalistId);
  if (error) { console.error("updateJournalist error:", error.message); return false; }
  revalidatePath("/emostool/dashboard/coverageiq");
  return true;
}

export async function deleteJournalist(journalistId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { error } = await db.from("journalists").delete().eq("id", journalistId);
  if (error) { console.error("deleteJournalist error:", error.message); return false; }
  revalidatePath("/emostool/dashboard/coverageiq");
  return true;
}
