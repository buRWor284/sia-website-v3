"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { recordStageEvent } from "./stage";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
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
  signal_ref: string | null; // stored in description as "signal:<id>:<headline>" prefix
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
    .select("id, asset_type, title, description, target_keyword, status, published_url, links_earned, created_at, updated_at")
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
    created_at: string;
    updated_at: string;
  }) => ({
    ...row,
    asset_type: row.asset_type as AssetType,
    status: row.status as AssetStatus,
    // Extract signal_ref from description prefix if present
    signal_ref: row.description?.startsWith("signal:") ? row.description.split("\n")[0] : null,
    description: row.description?.startsWith("signal:")
      ? (row.description.split("\n").slice(1).join("\n") || null)
      : row.description,
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

  // Encode signal reference in description prefix so we don't need a schema change
  let description = input.description ?? null;
  if (input.signal_id) {
    const sigRef = `signal:${input.signal_id}:${(input.signal_headline ?? "").substring(0, 100)}`;
    description = description ? `${sigRef}\n${description}` : sigRef;
  }

  const { data, error } = await db
    .from("linkable_assets")
    .insert({
      org_id:         org.id,
      asset_type:     input.asset_type,
      title:          input.title,
      description:    description ?? null,
      target_keyword: input.target_keyword ?? null,
      status:         "draft",
    })
    .select("id")
    .single();

  if (error) { console.error("createAsset error:", error.message); return null; }

  void recordStageEvent("asset_created");
  revalidatePath("/emostool/dashboard/assetiq");
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
  revalidatePath("/emostool/dashboard/assetiq");
  return true;
}

export async function deleteAsset(assetId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { error } = await db
    .from("linkable_assets")
    .delete()
    .eq("id", assetId);
  if (error) { console.error("deleteAsset error:", error.message); return false; }
  revalidatePath("/emostool/dashboard/assetiq");
  return true;
}
