"use server";

/**
 * Company Brief read / save / approve (2026-09-10). RLS-scoped like
 * actions/companies.ts. Research and condense live in the API route because
 * they call the model; saving the user's own edits does not.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { BRIEF_MAX, type BriefStatus, type CompanyBrief } from "@/lib/company-brief-types";

const COLUMNS = "company_id, content, status, source, sources, researched_at, updated_at";

async function db() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  const token = await getToken();
  return createSupabaseServerClient(token ?? "");
}

export async function getCompanyBrief(companyId: string): Promise<CompanyBrief | null> {
  if (!companyId) return null;
  const client = await db();
  const { data, error } = await client.from("company_briefs").select(COLUMNS).eq("company_id", companyId).maybeSingle();
  if (error) { console.error("getCompanyBrief error:", error.message); return null; }
  return (data as CompanyBrief | null) ?? null;
}

/**
 * Save the user's text. `status` "approved" is the switch that lets tools use
 * it; any edit saved as "draft" takes it back out of the tools until approved
 * again. An empty brief is deleted rather than stored.
 */
export async function saveCompanyBrief(
  companyId: string,
  content: string,
  status: BriefStatus,
): Promise<CompanyBrief | null> {
  if (!companyId) return null;
  const client = await db();
  const text = content.slice(0, BRIEF_MAX);

  if (!text.trim()) {
    await client.from("company_briefs").delete().eq("company_id", companyId);
    return null;
  }

  // Resolve org_id explicitly from the company (RLS hides other orgs' rows).
  const { data: company } = await client.from("companies").select("org_id").eq("id", companyId).maybeSingle();
  if (!company) { console.warn(`saveCompanyBrief: no company ${companyId}`); return null; }

  const { data: existing } = await client.from("company_briefs").select("source").eq("company_id", companyId).maybeSingle();

  const { data, error } = await client
    .from("company_briefs")
    .upsert({
      company_id: companyId,
      org_id: company.org_id,
      content: text,
      status: status === "approved" ? "approved" : "draft",
      source: (existing?.source as string | undefined) ?? "manual",
      updated_at: new Date().toISOString(),
    }, { onConflict: "company_id" })
    .select(COLUMNS)
    .single();

  if (error) { console.error("saveCompanyBrief error:", error.message); return null; }
  return data as CompanyBrief;
}
