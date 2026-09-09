"use server";

/**
 * Saved pitch drafts — read, edit, delete (2026-09-09).
 *
 * Drafts are WRITTEN by the pitch-draft API route (service client, alongside
 * generation). These are the dashboard's own paths, on the RLS-scoped Clerk JWT
 * client like every other server action. Types live in @/lib/pitch-draft-types
 * because a "use server" file may only export async functions.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { DbPitchDraft } from "@/lib/pitch-draft-types";

const COLUMNS =
  "id, journalist_id, journalist_name, company_id, asset_id, subject, body, angle, status, created_at, updated_at";

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

export async function getPitchDrafts(): Promise<DbPitchDraft[]> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("pitch_drafts")
    .select(COLUMNS)
    .neq("status", "discarded")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) { console.error("getPitchDrafts error:", error.message); return []; }
  return (data ?? []) as unknown as DbPitchDraft[];
}

export async function updatePitchDraft(
  draftId: string,
  input: Partial<{ subject: string; body: string; status: "draft" | "sent" | "discarded" }>,
): Promise<boolean> {
  const db = await getAuthenticatedClient();
  // `.select()` so a no-op write (stale id, or another org's row that RLS
  // filters out silently) reports false rather than a false success.
  const { data, error } = await db
    .from("pitch_drafts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", draftId)
    .select("id");

  if (error) { console.error("updatePitchDraft error:", error.message); return false; }
  if (!data?.length) { console.warn(`updatePitchDraft: no row matched ${draftId}`); return false; }
  revalidatePath("/emos-platform/dashboard/pressiq");
  return true;
}

export async function deletePitchDraft(draftId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("pitch_drafts")
    .delete()
    .eq("id", draftId)
    .select("id");

  if (error) { console.error("deletePitchDraft error:", error.message); return false; }
  if (!data?.length) { console.warn(`deletePitchDraft: no row matched ${draftId}`); return false; }
  revalidatePath("/emos-platform/dashboard/pressiq");
  return true;
}

/** What this journalist has been writing lately — the personalisation source.
 * Stored on the journalist because it is a property of the person that goes
 * stale, not of any one pitch. */
export async function updateJournalistRecentWork(
  journalistId: string,
  recentWork: string,
): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("journalists")
    .update({ recent_work: recentWork.slice(0, 2000), updated_at: new Date().toISOString() })
    .eq("id", journalistId)
    .select("id");

  if (error) { console.error("updateJournalistRecentWork error:", error.message); return false; }
  if (!data?.length) return false;
  revalidatePath("/emos-platform/dashboard/pressiq");
  revalidatePath("/emos-platform/dashboard/journocollabiq");
  return true;
}
