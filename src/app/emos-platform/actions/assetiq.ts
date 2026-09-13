"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { recordStageEvent } from "./stage";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssetType = "research_report" | "calculator" | "quiz" | "infographic" | "data_study";
export type AssetStatus = "draft" | "in_review" | "published" | "archived";

export interface DbAsset {
  id: string;
  asset_type: AssetType;
  title: string;
  description: string | null;
  target_keyword: string | null;
  status: AssetStatus;
  published_url: string | null;
  links_earned: number;
  signal_id: string | null;       // FK → signaliq_signals.id
  signal_headline: string | null; // denormalized headline for display
  // 2026-09-13 (company scoping 1c): the company this asset is FOR. Null on
  // rows that predate tagging.
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetInput {
  asset_type: AssetType;
  title: string;
  description?: string | null;
  target_keyword?: string | null;
  signal_id?: string | null;
  signal_headline?: string | null;
  company_id?: string | null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAssets(): Promise<DbAsset[]> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("linkable_assets")
    .select("id, asset_type, title, description, target_keyword, status, published_url, links_earned, signal_id, signal_headline, company_id, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) { console.error("getAssets error:", error.message); return []; }

  return (data ?? []).map((row: {
    id: string;
    asset_type: string;
    title: string;
    description: string | null;
    target_keyword: string | null;
    status: string;
    published_url: string | null;
    links_earned: number;
    signal_id: string | null;
    signal_headline: string | null;
    company_id: string | null;
    created_at: string;
    updated_at: string;
  }) => ({
    ...row,
    asset_type: row.asset_type as AssetType,
    status: row.status as AssetStatus,
  }));
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createAsset(input: CreateAssetInput): Promise<{ id: string } | null> {
  const db = await getAuthenticatedClient();

  const { data: org, error: orgError } = await db
    .from("organizations")
    .select("id")
    .single();
  if (orgError || !org) { console.error("createAsset: no org", orgError?.message); return null; }

  const { data, error } = await db
    .from("linkable_assets")
    .insert({
      org_id:          org.id,
      asset_type:      input.asset_type,
      title:           input.title,
      description:     input.description ?? null,
      target_keyword:  input.target_keyword ?? null,
      signal_id:       input.signal_id ?? null,
      signal_headline: input.signal_headline?.substring(0, 200) ?? null,
      company_id:      input.company_id ?? null,
      status:          "draft",
    })
    .select("id")
    .single();

  if (error) { console.error("createAsset error:", error.message); return null; }

  // Awaited, not fire-and-forget: a void call is dropped when the serverless
  // function freezes after the response (feedback-fire-and-forget-persistence).
  await recordStageEvent("asset_created");
  revalidatePath("/emos-platform/dashboard/assetiq");
  return data as { id: string };
}

/** Tag every untagged asset in this org with one company. One-shot helper for
 * rows that predate company scoping (2026-09-13); exposed from the
 * "Unassigned" view in AssetIQ. Returns the number of rows tagged. */
export async function assignUnassignedAssets(companyId: string): Promise<number> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("linkable_assets")
    .update({ company_id: companyId, updated_at: new Date().toISOString() })
    .is("company_id", null)
    .select("id");
  if (error) { console.error("assignUnassignedAssets error:", error.message); return 0; }
  revalidatePath("/emos-platform/dashboard/assetiq");
  return data?.length ?? 0;
}

export async function updateAsset(
  assetId: string,
  input: Partial<{
    title: string;
    description: string | null;
    target_keyword: string | null;
    status: AssetStatus;
    published_url: string | null;
  }>,
): Promise<boolean> {
  const db = await getAuthenticatedClient();
  // M5: `.select("id")` so a no-op write (stale id, or another org's row, which
  // RLS silently filters out rather than erroring) reports false, not success.
  // See the long note in actions/coverageiq.ts.
  const { data, error } = await db
    .from("linkable_assets")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", assetId)
    .select("id");
  if (error) { console.error("updateAsset error:", error.message); return false; }
  if (!data?.length) { console.warn(`updateAsset: no row matched ${assetId}`); return false; }
  revalidatePath("/emos-platform/dashboard/assetiq");
  return true;
}

export async function deleteAsset(assetId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("linkable_assets")
    .delete()
    .eq("id", assetId)
    .select("id");
  if (error) { console.error("deleteAsset error:", error.message); return false; }
  if (!data?.length) { console.warn(`deleteAsset: no row matched ${assetId}`); return false; }
  revalidatePath("/emos-platform/dashboard/assetiq");
  return true;
}
