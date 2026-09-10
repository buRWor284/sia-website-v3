/**
 * Company Brief: server-side loader + prompt block (server only).
 *
 * Tools call getApprovedBrief() and, when it returns text, add
 * briefPromptBlock() (company-brief-prompt.ts) to their prompt. No approved brief = no change to any
 * prompt, so a company without a brief behaves exactly as before.
 *
 * Reads with the service client, always scoped to the caller's own org_id, so
 * the browser only ever sends a company id (or nothing: the active company).
 */

import { createSupabaseServiceClient } from "@/lib/supabase";
import { BRIEF_PROMPT_MAX } from "@/lib/company-brief-types";
import { fitBrief } from "@/lib/company-brief-prompt";

/**
 * The approved brief for `companyId`, or for the caller's active company when
 * no id is given. Null when there is none, it is still a draft, or anything
 * fails: a brief must never be the reason a tool errors.
 */
export async function getApprovedBrief(
  clerkUserId: string,
  companyId?: string | null,
): Promise<string | null> {
  try {
    const db = createSupabaseServiceClient();
    const { data: user } = await db
      .from("users")
      .select("org_id, active_company_id")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();
    const orgId = user?.org_id as string | undefined;
    const target = companyId || (user?.active_company_id as string | null) || null;
    if (!orgId || !target) return null;

    const { data: brief } = await db
      .from("company_briefs")
      .select("content, status")
      .eq("company_id", target)
      .eq("org_id", orgId)
      .maybeSingle();
    if (!brief || brief.status !== "approved") return null;
    const text = String(brief.content ?? "").trim();
    return text ? fitBrief(text, BRIEF_PROMPT_MAX) : null;
  } catch (e) {
    console.error("[company-brief] getApprovedBrief failed:", e);
    return null;
  }
}
