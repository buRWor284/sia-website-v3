"use server";

/**
 * Company Brief read / save / approve (2026-09-10). RLS-scoped like
 * actions/companies.ts. Research and condense live in the API route because
 * they call the model; saving the user's own edits does not.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { BRIEF_MAX, changedSections, headingKey, type BriefStatus, type CompanyBrief } from "@/lib/company-brief-types";

const COLUMNS = "company_id, content, status, source, sources, researched_at, updated_at, locked_sections";

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
 * again. An empty brief is deleted rather than stored. Sections the user
 * edited are recorded in locked_sections so research never overwrites them.
 */
export async function saveCompanyBrief(
  companyId: string,
  content: string,
  status: BriefStatus,
  /** Headings the user handed back to research ("Let research update this"). */
  unlock: string[] = [],
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

  const { data: existing } = await client
    .from("company_briefs")
    .select("source, content, locked_sections")
    .eq("company_id", companyId)
    .maybeSingle();

  // Any section whose text the user changed becomes theirs: a later
  // "Research their website" will not overwrite it.
  const unlockKeys = new Set(unlock.map(headingKey));
  const locked = new Set<string>((existing?.locked_sections as string[] | undefined) ?? []);
  for (const k of changedSections((existing?.content as string | undefined) ?? "", text)) locked.add(k);
  for (const k of unlockKeys) locked.delete(k);

  const { data, error } = await client
    .from("company_briefs")
    .upsert({
      company_id: companyId,
      org_id: company.org_id,
      content: text,
      status: status === "approved" ? "approved" : "draft",
      source: (existing?.source as string | undefined) ?? "manual",
      locked_sections: [...locked],
      updated_at: new Date().toISOString(),
    }, { onConflict: "company_id" })
    .select(COLUMNS)
    .single();

  if (error) { console.error("saveCompanyBrief error:", error.message); return null; }
  return data as CompanyBrief;
}
