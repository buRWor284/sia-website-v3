"use server";

/**
 * Organisation-level reads for the dashboard chrome.
 *
 * `organizations.is_test` (2026-09-10) marks an internal test org. The flag
 * lives on the org rather than on each row, so every org-scoped table inherits
 * it through org_id; supabase/organizations-is-test.sql has the real-only
 * queries. This action only feeds the TEST ORG badge in the "Working for" bar.
 *
 * Only async functions may be exported from a "use server" file (AGENTS.md).
 */

import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase";

/** True when the signed-in user's org is a test org. False when signed out,
 * when the org row is missing, or on any error: the badge is a reminder, and a
 * failed lookup must never block a tool from rendering. */
export async function getOrgIsTest(): Promise<boolean> {
  const { userId, getToken } = await auth();
  if (!userId) return false;

  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");

  // RLS-scoped: org_isolation returns only this user's own org row.
  const { data, error } = await db
    .from("organizations")
    .select("is_test")
    .maybeSingle();

  if (error) { console.error("getOrgIsTest error:", error.message); return false; }
  return data?.is_test === true;
}
