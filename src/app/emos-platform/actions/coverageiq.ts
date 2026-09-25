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
import type { JournalistHistory } from "@/lib/journalist-history-types";
import { beatToTags } from "@/lib/journo/beat-tags";
import { getDomainRating, getDomainRatings, ahrefsConfigured, domainFromInput } from "@/lib/ahrefs-dr";

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
      id, subject, client, company_id, team, stage, peso_type, data_source, notes, body,
      sent_date, placed_date, follow_up_due, placement_url, anchor_text,
      domain_rating, link_type, content_type, points, journalist_id,
      journalists ( name, outlet, domain_rating, email ),
      companies ( name )
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
    company_id: row.company_id ?? null,
    company_name: row.companies?.name ?? null,
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
    body: row.body ?? null,
  }));
}

export async function getJournalists(): Promise<DbJournalist[]> {
  const db = await getAuthenticatedClient();

  const { data, error } = await db
    .from("journalists")
    .select("id, name, outlet, beat, email, twitter_handle, domain_rating, last_contact, pitches_sent, placements, notes, tags, recent_work")
    .order("last_contact", { ascending: false });

  if (error) {
    console.error("getJournalists error:", error.message);
    return [];
  }

  const rows = (data ?? []) as DbJournalist[];
  if (rows.length === 0) return rows;

  // 2026-09-09 (state layer phase 5): resolve WHY each journalist is here from
  // journalist_context, newest row per journalist. Denormalised onto the read so
  // every existing consumer — the CRM table, the PressIQ picker, CoverageIQ —
  // gets the company and angle without changing its own query.
  const { data: ctxRows } = await db
    .from("journalist_context")
    .select("journalist_id, company_id, asset_id, angle, strategy, created_at")
    .order("created_at", { ascending: false });

  const latest = new Map<string, Record<string, unknown>>();
  for (const c of (ctxRows ?? []) as Record<string, unknown>[]) {
    const jid = c.journalist_id as string;
    if (!latest.has(jid)) latest.set(jid, c);   // ordered desc, so first wins
  }
  if (latest.size === 0) return rows;

  const companyIds = Array.from(new Set([...latest.values()].map(c => c.company_id).filter(Boolean) as string[]));
  const assetIds   = Array.from(new Set([...latest.values()].map(c => c.asset_id).filter(Boolean) as string[]));

  const [companies, assets] = await Promise.all([
    companyIds.length ? db.from("companies").select("id, name").in("id", companyIds) : Promise.resolve({ data: [] }),
    assetIds.length   ? db.from("linkable_assets").select("id, title").in("id", assetIds) : Promise.resolve({ data: [] }),
  ]);
  const companyName = new Map(((companies.data ?? []) as { id: string; name: string }[]).map(c => [c.id, c.name]));
  const assetTitle  = new Map(((assets.data ?? []) as { id: string; title: string }[]).map(a => [a.id, a.title]));

  return rows.map(j => {
    const c = latest.get(j.id);
    if (!c) return j;
    const cid = (c.company_id as string | null) ?? null;
    const aid = (c.asset_id as string | null) ?? null;
    return {
      ...j,
      company_id:   cid,
      company_name: cid ? companyName.get(cid) ?? null : null,
      asset_id:     aid,
      asset_title:  aid ? assetTitle.get(aid) ?? null : null,
      angle:        (c.angle as string | null) ?? null,
      strategy:     (c.strategy as string | null) ?? null,
    };
  });
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
      // 2026-09-13: the company this pitch is for, from the picker. RLS on
      // companies means a foreign id here fails the FK rather than crossing
      // tenants, but the callers only ever pass the active company.
      company_id: input.company_id ?? null,
      client: input.client ?? null,
      team: input.team ?? null,
      peso_type: input.peso_type ?? "Earned",
      stage: input.stage ?? "drafted",
      data_source: input.data_source ?? "manual",
      notes: input.notes ?? null,
      body: input.body ?? null,
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

/** Tag every untagged pitch in this org with one company. One-shot migration
 * helper for rows that predate company scoping (2026-09-13); exposed from the
 * "Unassigned" view in CoverageIQ. Returns the number of rows tagged. */
export async function assignUnassignedPitches(companyId: string): Promise<number> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("coverageiq_pitches")
    .update({ company_id: companyId, updated_at: new Date().toISOString() })
    .is("company_id", null)
    .select("id");
  if (error) { console.error("assignUnassignedPitches error:", error.message); return 0; }
  revalidatePath("/emos-platform/dashboard/coverageiq");
  return data?.length ?? 0;
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

/**
 * 2026-09-25 (P3-05): attach (or detach) a journalist to an existing pitch.
 * PressIQ hands over pitches with no journalist when none was picked there,
 * and the row had no way to set one afterwards.
 */
export async function updatePitchJournalist(pitchId: string, journalistId: string | null): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("coverageiq_pitches")
    .update({ journalist_id: journalistId, updated_at: new Date().toISOString() })
    .eq("id", pitchId)
    .select("id");
  if (error) { console.error("updatePitchJournalist error:", error.message); return false; }
  if (!data?.length) { console.warn(`updatePitchJournalist: no row matched ${pitchId}`); return false; }
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

export async function createJournalist(input: CreateJournalistInput): Promise<{ id: string; domain_rating: number | null } | null> {
  const db = await getAuthenticatedClient();

  const { data: org, error: orgError } = await db.from("organizations").select("id").single();
  if (orgError || !org) { console.error("createJournalist: no org", orgError?.message); return null; }

  // 2026-09-13 (Ahrefs DR): the real Domain Rating of the outlet, cached per
  // domain. A caller-supplied value (the Contacts form, or a DA parsed out of
  // an AI note) is only a fallback for when Ahrefs has nothing.
  const outletDr = await getDomainRating(input.outlet);

  const { data, error } = await db
    .from("journalists")
    .insert({
      org_id:         org.id,
      name:           input.name,
      outlet:         input.outlet ?? null,
      beat:           input.beat ?? null,
      email:          input.email ?? null,
      twitter_handle: input.twitter_handle ?? null,
      domain_rating:  outletDr ?? input.domain_rating ?? null,
      notes:          input.notes ?? null,
      // 2026-09-13 (beats as tags): derive filterable tags from the beat
      // sentence unless the caller supplied its own. Done here so every save
      // path (JournoCollabIQ, the Contacts form, a headless caller) gets them.
      tags:           input.tags?.length ? input.tags : beatToTags(input.beat),
      data_source:    input.data_source ?? "manual",
    })
    .select("id, domain_rating")
    .single();

  if (error) { console.error("createJournalist error:", error.message); return null; }

  // 2026-09-09: record WHY this journalist was saved. Awaited, not
  // fire-and-forget — a dropped context row is exactly the failure this phase
  // exists to fix. A failure here is logged and never loses the journalist.
  const ctx = input.context;
  if (data?.id && ctx && (ctx.company_id || ctx.asset_id || ctx.angle || ctx.fit_note)) {
    const { error: ctxError } = await db.from("journalist_context").insert({
      org_id:        org.id,
      journalist_id: data.id,
      company_id:    ctx.company_id ?? null,
      asset_id:      ctx.asset_id ?? null,
      angle:         ctx.angle?.slice(0, 2000) ?? null,
      beat_query:    ctx.beat_query?.slice(0, 500) ?? null,
      geography:     ctx.geography?.slice(0, 200) ?? null,
      strategy:      ctx.strategy ?? null,
      fit_note:      ctx.fit_note?.slice(0, 2000) ?? null,
    });
    if (ctxError) console.error("createJournalist context error:", ctxError.message);
  }

  revalidatePath("/emos-platform/dashboard/coverageiq");
  revalidatePath("/emos-platform/dashboard/journocollabiq");
  // Awaited for the same fire-and-forget reason as pitch_logged above.
  await recordStageEvent("journalist_saved");
  // 2026-09-25 (P3-09): the Ahrefs DR is returned so the list shows it at
  // once instead of "—" until the next reload.
  return data as { id: string; domain_rating: number | null };
}

export async function updateJournalist(
  journalistId: string,
  input: Partial<CreateJournalistInput>,
): Promise<boolean> {
  const db = await getAuthenticatedClient();
  // An edited beat re-derives its tags unless tags were passed explicitly.
  const patch: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
  if (input.beat !== undefined && !input.tags?.length) patch.tags = beatToTags(input.beat);
  const { data, error } = await db
    .from("journalists")
    .update(patch)
    .eq("id", journalistId)
    .select("id");
  if (error) { console.error("updateJournalist error:", error.message); return false; }
  if (!data?.length) { console.warn(`updateJournalist: no row matched ${journalistId}`); return false; }
  revalidatePath("/emos-platform/dashboard/coverageiq");
  revalidatePath("/emos-platform/dashboard/journocollabiq");
  return true;
}

/**
 * Refresh Domain Rating for this org's journalists (outlet domain) and for
 * pitches that carry a placement URL. 2026-09-13. Returns counts, plus
 * `configured: false` when AHREFS_API_KEY is not set so the UI can say why
 * nothing changed. Sequential and capped; the free endpoint has unpublished
 * limits and this is a button, not a cron.
 */
export async function refreshDomainRatings(): Promise<{ configured: boolean; journalists: number; pitches: number }> {
  const db = await getAuthenticatedClient();
  if (!ahrefsConfigured()) return { configured: false, journalists: 0, pitches: 0 };

  const [{ data: js }, { data: ps }] = await Promise.all([
    db.from("journalists").select("id, outlet, domain_rating").not("outlet", "is", null).limit(60),
    db.from("coverageiq_pitches").select("id, placement_url, domain_rating").not("placement_url", "is", null).limit(60),
  ]);

  const ratings = await getDomainRatings([
    ...((js ?? []) as { outlet: string | null }[]).map(j => j.outlet),
    ...((ps ?? []) as { placement_url: string | null }[]).map(p => p.placement_url),
  ]);
  let jn = 0, pn = 0;
  for (const j of (js ?? []) as { id: string; outlet: string | null; domain_rating: number | null }[]) {
    const d = domainFromInput(j.outlet); const dr = d ? ratings.get(d) ?? null : null;
    if (dr != null && dr !== j.domain_rating) {
      const { data } = await db.from("journalists").update({ domain_rating: dr, updated_at: new Date().toISOString() }).eq("id", j.id).select("id");
      if (data?.length) jn++;
    }
  }
  for (const p of (ps ?? []) as { id: string; placement_url: string | null; domain_rating: number | null }[]) {
    const d = domainFromInput(p.placement_url); const dr = d ? ratings.get(d) ?? null : null;
    if (dr != null && dr !== p.domain_rating) {
      const { data } = await db.from("coverageiq_pitches").update({ domain_rating: dr, updated_at: new Date().toISOString() }).eq("id", p.id).select("id");
      if (data?.length) pn++;
    }
  }
  revalidatePath("/emos-platform/dashboard/coverageiq");
  revalidatePath("/emos-platform/dashboard/journocollabiq");
  return { configured: true, journalists: jn, pitches: pn };
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

// ─── Prior contact, for the duplicate-pitch warning (2026-09-09) ─────────────
// Answers "have I already pitched this person, and was it for this company?"
// Built from data already held — pressiq_scores carries journalist_id and
// company_id since the state layer, and coverageiq_pitches has always carried
// journalist_id. No new table, and nothing an outreach tool could tell us.

export async function getJournalistHistory(): Promise<JournalistHistory[]> {
  const db = await getAuthenticatedClient();

  const [{ data: scores }, { data: pitches }] = await Promise.all([
    db.from("pressiq_scores")
      .select("journalist_id, company_id, scored_at")
      .not("journalist_id", "is", null)
      .order("scored_at", { ascending: false }),
    db.from("coverageiq_pitches")
      .select("journalist_id, created_at, sent_date")
      .not("journalist_id", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  const byJournalist = new Map<string, JournalistHistory>();

  function touch(id: string): JournalistHistory {
    let h = byJournalist.get(id);
    if (!h) {
      h = { journalistId: id, lastPitchedAt: null, lastCompanyId: null, lastCompanyName: null, pitchCount: 0 };
      byJournalist.set(id, h);
    }
    return h;
  }

  for (const r of (scores ?? []) as { journalist_id: string; company_id: string | null; scored_at: string }[]) {
    const h = touch(r.journalist_id);
    h.pitchCount += 1;
    // Ordered newest first, so the first row seen is the most recent.
    if (!h.lastPitchedAt) {
      h.lastPitchedAt = r.scored_at;
      h.lastCompanyId = r.company_id;
      h.lastKind = "scored";
    }
  }

  for (const r of (pitches ?? []) as { journalist_id: string; created_at: string; sent_date: string | null }[]) {
    const h = touch(r.journalist_id);
    const when = r.sent_date ?? r.created_at;
    h.pitchCount += 1;
    if (!h.lastPitchedAt || when > h.lastPitchedAt) {
      h.lastPitchedAt = when;
      h.lastKind = r.sent_date ? "sent" : "tracked";
    }
  }

  // Resolve the company names in one go.
  const companyIds = Array.from(
    new Set([...byJournalist.values()].map(h => h.lastCompanyId).filter(Boolean) as string[]),
  );
  if (companyIds.length > 0) {
    const { data: companies } = await db.from("companies").select("id, name").in("id", companyIds);
    const names = new Map(((companies ?? []) as { id: string; name: string }[]).map(c => [c.id, c.name]));
    for (const h of byJournalist.values()) {
      if (h.lastCompanyId) h.lastCompanyName = names.get(h.lastCompanyId) ?? null;
    }
  }

  return [...byJournalist.values()];
}
