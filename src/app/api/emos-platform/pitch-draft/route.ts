/**
 * /api/emos-platform/pitch-draft
 *
 * Draft personalised pitches for saved journalists (2026-09-09).
 *
 * The brief is assembled SERVER-SIDE from the caller's own rows — company,
 * asset, journalists — rather than from the request body. The browser sends
 * ids only. That keeps the model's input trustworthy and stops a tampered or
 * stale tab from putting another org's text into a prompt.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { draftPitches, MAX_DRAFT_BATCH, type DraftBrief, type DraftTarget } from "@/lib/pitch/draft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Up to MAX_DRAFT_BATCH drafts, three at a time, a few seconds each.
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const guard = await requireEmosAccess({ rateLimitKey: "pitch-draft", limit: 20 });
  if (!guard.ok) return guard.res;

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const journalistIds = Array.isArray(raw.journalistIds)
    ? (raw.journalistIds.filter(v => typeof v === "string") as string[]).slice(0, MAX_DRAFT_BATCH)
    : [];
  if (journalistIds.length === 0) {
    return NextResponse.json({ error: "Pick at least one journalist." }, { status: 400 });
  }

  const companyId = typeof raw.companyId === "string" ? raw.companyId : null;
  const assetId = typeof raw.assetId === "string" ? raw.assetId : null;
  const angle = typeof raw.angle === "string" ? raw.angle.slice(0, 2000) : null;

  const db = createSupabaseServiceClient();

  const { data: user } = await db
    .from("users")
    .select("org_id")
    .eq("clerk_user_id", guard.userId)
    .single();
  if (!user) return NextResponse.json({ error: "Could not resolve your account." }, { status: 403 });
  const orgId = user.org_id as string;

  // Everything below is scoped to the caller's org explicitly — the service
  // client bypasses RLS, so the org filter is the only thing protecting it.
  const [{ data: company }, { data: asset }, { data: journalists }] = await Promise.all([
    companyId
      ? db.from("companies").select("name, context, website").eq("id", companyId).eq("org_id", orgId).maybeSingle()
      : Promise.resolve({ data: null }),
    assetId
      ? db.from("linkable_assets").select("title, description, published_url").eq("id", assetId).eq("org_id", orgId).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from("journalists").select("id, name, outlet, beat, notes, recent_work").in("id", journalistIds).eq("org_id", orgId),
  ]);

  if (!company) {
    return NextResponse.json(
      { error: "Pick a company first — the pitch needs to know who it is from." },
      { status: 400 },
    );
  }
  const rows = (journalists ?? []) as { id: string; name: string; outlet: string | null; beat: string | null; notes: string | null; recent_work: string | null }[];
  if (rows.length === 0) {
    return NextResponse.json({ error: "None of those journalists are in your CRM." }, { status: 400 });
  }

  const brief: DraftBrief = {
    companyName:      company.name as string,
    companyContext:   (company.context as string) || "",
    companyWebsite:   (company.website as string | null) ?? null,
    assetTitle:       (asset?.title as string | null) ?? null,
    assetDescription: (asset?.description as string | null) ?? null,
    assetUrl:         (asset?.published_url as string | null) ?? null,
    angle,
  };

  // Preserve the order the user picked rather than whatever the DB returned.
  const byId = new Map(rows.map(r => [r.id, r]));
  const targets: DraftTarget[] = journalistIds
    .map(id => byId.get(id))
    .filter(Boolean)
    .map(r => ({ id: r!.id, name: r!.name, outlet: r!.outlet, beat: r!.beat, fitNote: r!.notes, recentWork: r!.recent_work }));

  const drafts = await draftPitches(brief, targets);

  // Persist every successful draft. AWAITED: a draft that vanishes with the tab
  // is the exact failure this was changed to fix, and regenerating produces A
  // draft rather than THAT draft. A save failure is logged and never costs the
  // user the drafts they can already see on screen.
  const toSave = drafts
    .filter(d => !d.error && d.subject && d.body)
    .map(d => ({
      org_id:          orgId,
      journalist_id:   d.journalistId,
      journalist_name: d.journalistName,
      company_id:      companyId,
      asset_id:        assetId,
      subject:         d.subject,
      body:            d.body,
      angle,
      status:          "draft" as const,
    }));

  let saved: { id: string; journalist_id: string | null }[] = [];
  if (toSave.length > 0) {
    const { data, error } = await db.from("pitch_drafts").insert(toSave).select("id, journalist_id");
    if (error) console.error("pitch-draft: could not save drafts:", error.message);
    else saved = (data ?? []) as { id: string; journalist_id: string | null }[];
  }

  // Hand back the saved row id so the UI can edit in place immediately.
  const idByJournalist = new Map(saved.map(r => [r.journalist_id, r.id]));
  return NextResponse.json({
    drafts: drafts.map(d => ({ ...d, draftId: idByJournalist.get(d.journalistId) ?? null })),
  });
}
