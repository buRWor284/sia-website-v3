/**
 * /api/emos-platform/company-brief (2026-09-10)
 *
 * POST { companyId, mode: "research" }                  → read the company's website, draft the brief
 * POST { companyId, mode: "condense", text, fileName }  → rewrite an uploaded / pasted doc into the brief
 *
 * Either way the result is saved as a DRAFT, merged into any existing brief:
 * sections the user wrote themselves are kept, research fills the rest. Tools only use a brief once the
 * user approves it (actions/company-briefs.ts), so a bad read can never reach
 * a pitch unseen. The company row is loaded server-side and scoped to the
 * caller's org; the browser sends ids only.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { withAiUsage } from "@/lib/ai-usage";
import { reserveUsage } from "@/lib/usage-limits";
import { researchCompany, condenseToBrief } from "@/lib/company-brief-research";
import { BRIEF_MAX, BRIEF_UPLOAD_MAX, mergeBriefs } from "@/lib/company-brief-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Up to 10 page reads (8s timeout each, in parallel) plus one model call.
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // Research and condense are the priciest single calls a user can make here,
  // so a tighter hourly limit than the default 30.
  const guard = await requireEmosAccess({ rateLimitKey: "company-brief", limit: 10 });
  if (!guard.ok) return guard.res;

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const companyId = typeof raw.companyId === "string" ? raw.companyId : "";
  const mode = raw.mode === "condense" ? "condense" : raw.mode === "research" ? "research" : null;
  if (!companyId || !mode) return NextResponse.json({ error: "companyId and mode are required." }, { status: 400 });

  const db = createSupabaseServiceClient();
  const { data: user } = await db.from("users").select("org_id").eq("clerk_user_id", guard.userId).single();
  const orgId = user?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No organisation found for this account." }, { status: 403 });

  const { data: company } = await db
    .from("companies")
    .select("id, name, context, website")
    .eq("id", companyId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!company) return NextResponse.json({ error: "Company not found." }, { status: 404 });

  const co = { name: company.name as string, context: (company.context as string) || "", website: (company.website as string | null) ?? null };

  // Monthly allowance: research and condense share one bucket (10 a month).
  // Reserved once the request is known to be valid, handed back on failure.
  if (mode === "condense") {
    const t = typeof raw.text === "string" ? raw.text.trim() : "";
    if (t.length < 40) return NextResponse.json({ error: "That document is too short to build a brief from." }, { status: 400 });
    if (t.length > BRIEF_UPLOAD_MAX) {
      return NextResponse.json({ error: `That document is too long (${t.length.toLocaleString()} characters). The limit is ${BRIEF_UPLOAD_MAX.toLocaleString()}.` }, { status: 413 });
    }
  }
  const seat = await reserveUsage(guard, "company-research");
  if (!seat.ok) return seat.res;

  let content: string;
  let sources: string[];
  let source: "research" | "upload";

  if (mode === "research") {
    const out = await withAiUsage({ surface: "platform", clerkUserId: guard.userId }, () => researchCompany(co));
    if (!out.ok) {
      await seat.release();
      return NextResponse.json({ error: out.error }, { status: out.status });
    }
    content = out.result.content;
    sources = out.result.sources;
    source = "research";
  } else {
    const text = typeof raw.text === "string" ? raw.text.trim() : "";
    const fileName = typeof raw.fileName === "string" && raw.fileName.trim() ? raw.fileName.trim().slice(0, 120) : "pasted notes";
    if (text.length < 40) return NextResponse.json({ error: "That document is too short to build a brief from." }, { status: 400 });
    if (text.length > BRIEF_UPLOAD_MAX) {
      return NextResponse.json({ error: `That document is too long (${text.length.toLocaleString()} characters). The limit is ${BRIEF_UPLOAD_MAX.toLocaleString()}.` }, { status: 413 });
    }
    const out = await withAiUsage({ surface: "platform", clerkUserId: guard.userId }, () => condenseToBrief(co, text, fileName));
    if (!out.ok) {
      await seat.release();
      return NextResponse.json({ error: out.error }, { status: out.status });
    }
    content = out.content;
    sources = [fileName];
    source = "upload";
  }

  // Never overwrite the user's own words: sections they wrote or edited
  // (locked_sections) are kept; research only fills the rest.
  const { data: existing } = await db
    .from("company_briefs")
    .select("content, locked_sections")
    .eq("company_id", companyId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (existing?.content) {
    content = mergeBriefs(existing.content as string, content, (existing.locked_sections as string[]) ?? [], co.name).slice(0, BRIEF_MAX);
  }

  const now = new Date().toISOString();
  const { data: saved, error } = await db
    .from("company_briefs")
    .upsert({
      company_id: companyId,
      org_id: orgId,
      content,
      status: "draft",
      source,
      sources,
      researched_at: source === "research" ? now : null,
      updated_at: now,
    }, { onConflict: "company_id" })
    .select("company_id, content, status, source, sources, researched_at, updated_at, locked_sections")
    .single();

  if (error || !saved) {
    console.error("[company-brief] save failed:", error?.message);
    return NextResponse.json({ error: "The brief was written but could not be saved. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ brief: saved });
}
