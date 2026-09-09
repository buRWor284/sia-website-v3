"use server";

/**
 * Company profiles — phase 1 of the EMOS pipeline state layer (2026-09-09).
 *
 * Replaces the per-device localStorage string that useCompanyContext used to
 * hold. Company name + context now live in `public.companies`, org-scoped by
 * the same `org_isolation` RLS policy as signaliq_signals, so they survive a
 * new browser, a second teammate on the same org, and a server-side caller.
 *
 * Modelled on actions/assetiq.ts. Types live in @/lib/company-types because a
 * "use server" file may only export async functions (AGENTS.md critical rules).
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { Company, CreateCompanyInput, UpdateCompanyInput } from "@/lib/company-types";
import { COMPANY_CONTEXT_MAX } from "@/lib/company-types";

const COLUMNS = "id, name, context, website, created_at, updated_at";

// Every dashboard surface that reads a company. Kept in one place so a new
// tool cannot forget one.
const COMPANY_PATHS = [
  "/emos-platform/dashboard",
  "/emos-platform/dashboard/signaliq",
  "/emos-platform/dashboard/assetiq",
  "/emos-platform/dashboard/journocollabiq",
];

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

/** The Supabase client plus the Clerk user id, for the two actions that need
 * to touch this user's own row rather than the whole org's. */
async function getAuthenticatedClientAndUser() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  return { db: createSupabaseServerClient(token ?? ""), clerkUserId: userId };
}

function revalidateCompanyPaths() {
  for (const p of COMPANY_PATHS) revalidatePath(p);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listCompanies(): Promise<Company[]> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("companies")
    .select(COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) { console.error("listCompanies error:", error.message); return []; }
  return (data ?? []) as Company[];
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createCompany(input: CreateCompanyInput): Promise<Company | null> {
  const name = input.name.trim();
  if (!name) return null;

  const db = await getAuthenticatedClient();

  // Always resolve org_id explicitly — never rely on RLS to inject it.
  const { data: org, error: orgError } = await db
    .from("organizations")
    .select("id")
    .single();
  if (orgError || !org) { console.error("createCompany: no org", orgError?.message); return null; }

  const { data, error } = await db
    .from("companies")
    .insert({
      org_id:  org.id,
      name,
      context: (input.context ?? "").slice(0, COMPANY_CONTEXT_MAX),
      website: input.website?.trim() || null,
    })
    .select(COLUMNS)
    .single();

  // A unique-index collision on (org_id, lower(name)) means this company
  // already exists — return the existing row rather than failing the user's
  // save. 23505 = unique_violation.
  if (error?.code === "23505") {
    const { data: existing } = await db
      .from("companies")
      .select(COLUMNS)
      .ilike("name", name)
      .maybeSingle();
    if (existing) return existing as Company;
  }

  if (error) { console.error("createCompany error:", error.message); return null; }

  revalidateCompanyPaths();
  return data as Company;
}

export async function updateCompany(
  companyId: string,
  input: UpdateCompanyInput,
): Promise<Company | null> {
  const db = await getAuthenticatedClient();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined)    patch.name    = input.name.trim();
  if (input.context !== undefined) patch.context = input.context.slice(0, COMPANY_CONTEXT_MAX);
  if (input.website !== undefined) patch.website = input.website?.trim() || null;

  // `.select()` so a no-op write (stale id, or another org's row, which RLS
  // silently filters out rather than erroring) reports null, not success.
  // Same reasoning as the note in actions/coverageiq.ts.
  const { data, error } = await db
    .from("companies")
    .update(patch)
    .eq("id", companyId)
    .select(COLUMNS);

  if (error) { console.error("updateCompany error:", error.message); return null; }
  if (!data?.length) { console.warn(`updateCompany: no row matched ${companyId}`); return null; }

  revalidateCompanyPaths();
  return data[0] as Company;
}

export async function deleteCompany(companyId: string): Promise<boolean> {
  const db = await getAuthenticatedClient();
  const { data, error } = await db
    .from("companies")
    .delete()
    .eq("id", companyId)
    .select("id");

  if (error) { console.error("deleteCompany error:", error.message); return false; }
  if (!data?.length) { console.warn(`deleteCompany: no row matched ${companyId}`); return false; }

  revalidateCompanyPaths();
  return true;
}

// ─── Which company this person is working on ─────────────────────────────────
// Stored on the user row, not in localStorage, so choosing a company in any one
// tool sets it in every tool AND on every browser this person signs in from.
// Per user rather than per org on purpose: two teammates in the same org can be
// working on different clients at the same time.

export async function getActiveCompanyId(): Promise<string | null> {
  const { db, clerkUserId } = await getAuthenticatedClientAndUser();
  const { data, error } = await db
    .from("users")
    .select("active_company_id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) { console.error("getActiveCompanyId error:", error.message); return null; }
  return (data?.active_company_id as string | null) ?? null;
}

export async function setActiveCompanyId(companyId: string | null): Promise<boolean> {
  const { db, clerkUserId } = await getAuthenticatedClientAndUser();
  const { data, error } = await db
    .from("users")
    .update({ active_company_id: companyId })
    .eq("clerk_user_id", clerkUserId)
    .select("id");

  if (error) { console.error("setActiveCompanyId error:", error.message); return false; }
  if (!data?.length) { console.warn("setActiveCompanyId: no user row matched"); return false; }

  // Deliberately NO revalidatePath here. The dashboard layout is dynamic (it
  // calls auth()), so the next tool the user opens re-reads this anyway, and
  // revalidating would refresh the page they are standing on mid-switch.
  return true;
}
