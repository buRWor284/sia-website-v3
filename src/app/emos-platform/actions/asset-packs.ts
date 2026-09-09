"use server";

/**
 * Saved SignalIQ asset packs — pipeline state layer, phase 2 (2026-09-09).
 *
 * The write side lives in src/lib/signaliq/save-pack.ts (server-only, called by
 * the pack API route with the service client). These are the read and delete
 * paths for the dashboard, on the RLS-scoped Clerk JWT client like every other
 * server action.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { DbAssetPack } from "@/lib/asset-pack-types";
import type { ChartSpec, JournalistLead } from "@/lib/signaliq/types";

const COLUMNS =
  "id, company_id, signal_id, headline, beat_label, pitch_angle, story_brief, " +
  "subject_line, linkable_asset_idea, journalist_recs, cautions, sources, chart_data, created_at";

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

export async function getAssetPacks(): Promise<DbAssetPack[]> {
  const db = await getAuthenticatedClient();

  const { data, error } = await db
    .from("signaliq_asset_packs")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) { console.error("getAssetPacks error:", error.message); return []; }
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  if (rows.length === 0) return [];

  // Resolve company names in one extra query rather than a join: PostgREST
  // embedding needs a declared relationship and this stays readable.
  const companyIds = Array.from(
    new Set(rows.map(r => r.company_id).filter(Boolean) as string[]),
  );
  const names = new Map<string, string>();
  if (companyIds.length > 0) {
    const { data: companies } = await db
      .from("companies")
      .select("id, name")
      .in("id", companyIds);
    for (const c of (companies ?? []) as { id: string; name: string }[]) {
      names.set(c.id, c.name);
    }
  }

  return rows.map(r => ({
    id:                  r.id as string,
    company_id:          (r.company_id as string | null) ?? null,
    company_name:        r.company_id ? names.get(r.company_id as string) ?? null : null,
    signal_id:           (r.signal_id as string | null) ?? null,
    headline:            (r.headline as string | null) ?? null,
    beat_label:          (r.beat_label as string | null) ?? null,
    pitch_angle:         (r.pitch_angle as string | null) ?? null,
    story_brief:         (r.story_brief as string | null) ?? null,
    subject_line:        (r.subject_line as string | null) ?? null,
    linkable_asset_idea: (r.linkable_asset_idea as string | null) ?? null,
    journalist_recs:     (r.journalist_recs as JournalistLead[] | null) ?? null,
    cautions:            (r.cautions as string[] | null) ?? null,
    sources:             (r.sources as { label: string; url: string }[] | null) ?? null,
    chart_data:          (r.chart_data as ChartSpec | null) ?? null,
    created_at:          r.created_at as string,
  }));
}

export async function deleteAssetPack(packId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();

  // `.select()` so a no-op delete (stale id, or another org's row, which RLS
  // filters out silently rather than erroring) reports false, not success.
  const { data, error } = await db
    .from("signaliq_asset_packs")
    .delete()
    .eq("id", packId)
    .select("id");

  if (error) { console.error("deleteAssetPack error:", error.message); return false; }
  if (!data?.length) { console.warn(`deleteAssetPack: no row matched ${packId}`); return false; }

  revalidatePath("/emos-platform/dashboard/signaliq");
  return true;
}
