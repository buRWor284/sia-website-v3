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
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAssets(): Promise<DbAsset[]> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("linkable_assets")
    .select("id, asset_type, title, description, target_keyword, status, published_url, links_earned, signal_id, signal_headline, created_at, updated_at")
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
      status:          "draft",
    })
    .select("id")
    .single();

  if (error) { console.error("createAsset error:", error.message); return null; }

  void recordStageEvent("asset_created");
  revalidatePath("/emos-platform/dashboard/assetiq");
  return data as { id: string };
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
  const { error } = await db
    .from("linkable_assets")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", assetId);
  if (error) { console.error("updateAsset error:", error.message); return false; }
  revalidatePath("/emos-platform/dashboard/assetiq");
  return true;
}

export async function deleteAsset(assetId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { error } = await db
    .from("linkable_assets")
    .delete()
    .eq("id", assetId);
  if (error) { console.error("deleteAsset error:", error.message); return false; }
  revalidatePath("/emos-platform/dashboard/assetiq");
  return true;
}
