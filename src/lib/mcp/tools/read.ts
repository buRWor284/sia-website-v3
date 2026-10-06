/**
 * EMOS MCP — Tier R tools shipped in Session 1: list_companies, get_usage.
 *
 * DATA ACCESS NOTE (Session 1 only). These two reads use the service client
 * with an explicit `.eq("org_id", actor.orgId)`. The spec (v1.3 §2.3) wants
 * every business-table read on an RLS-scoped client. Session 1's experiment
 * C4 settled HOW: the Clerk OAuth token is opaque (dashboard decision 3), so
 * Supabase cannot verify it as a Bearer, which means Session 2 mints a
 * short-lived Supabase JWT per actor (needs SUPABASE_JWT_SECRET on Vercel)
 * and moves these two queries onto it along with the rest of Tier R.
 * Until then the org filter is the only tenancy guard on this door; keep
 * these the only service-client reads of business tables in src/lib/mcp.
 */
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getUsageMeter } from "@/lib/usage-limits";
import type { McpTool } from "@/lib/mcp/protocol";

const COMPANY_COLUMNS =
  "id, name, context, website, spokesperson_name, spokesperson_title, spokesperson_email, created_at, updated_at";

export const listCompanies: McpTool = {
  name: "list_companies",
  tier: "read",
  description:
    "List the companies this EMOS account runs campaigns for (each with its saved context). " +
    "Pass `id` to get one company with its approved brief. The `active` flag shows which company " +
    "the dashboard currently has selected; it is a hint only. Every other tool needs an explicit company_id from here.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "A company id. When given, returns that company with its approved brief." },
    },
    additionalProperties: false,
  },
  annotations: { title: "List companies", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  async handler(actor, args) {
    const db = createSupabaseServiceClient();
    const id = typeof args.id === "string" ? args.id : null;

    const { data: me } = await db
      .from("users")
      .select("active_company_id")
      .eq("clerk_user_id", actor.userId)
      .eq("org_id", actor.orgId)
      .maybeSingle();
    const activeId = (me?.active_company_id as string | null) ?? null;

    if (id) {
      const { data: c, error } = await db
        .from("companies")
        .select(COMPANY_COLUMNS)
        .eq("org_id", actor.orgId)
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`Could not read company: ${error.message}`);
      if (!c) return { text: "No company with that id in this account.", isError: true };
      const { data: brief } = await db
        .from("company_briefs")
        .select("content, status, updated_at")
        .eq("org_id", actor.orgId)
        .eq("company_id", id)
        .maybeSingle();
      const approved = brief && brief.status === "approved" ? String(brief.content ?? "") : null;
      return {
        text: `${c.name}${activeId === c.id ? " (active in dashboard)" : ""}${approved ? ", approved brief attached" : ", no approved brief"}.`,
        data: { company: { ...c, active: activeId === c.id }, brief: approved, brief_status: brief?.status ?? null },
      };
    }

    const { data, error } = await db
      .from("companies")
      .select(COMPANY_COLUMNS)
      .eq("org_id", actor.orgId)
      .order("name", { ascending: true });
    if (error) throw new Error(`Could not list companies: ${error.message}`);
    const companies = (data ?? []).map((c) => ({ ...c, active: c.id === activeId }));
    const names = companies.map((c) => `${c.name}${c.active ? " (active)" : ""}`).join(", ");
    return {
      text: companies.length ? `${companies.length} compan${companies.length === 1 ? "y" : "ies"}: ${names}.` : "No companies yet. Add one in the EMOS dashboard first.",
      data: { companies },
    };
  },
};

export const getUsage: McpTool = {
  name: "get_usage",
  tier: "read",
  description:
    "This month's allowance meter for the account (scans, packs, drafts, scores, etc.: used and limit), " +
    "when it resets, and whether AI writes are enabled for this organisation. Call it before a large run.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { title: "Usage this month", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  async handler(actor) {
    const meter = await getUsageMeter(actor.orgId);
    // The org-level switch arrives in Session 3 (spec §4.5). Until the column
    // exists every write tool refuses, so reporting false here is accurate.
    const aiWritesEnabled = false;
    const lines = meter.rows.map((r) => `${r.label}: ${r.used}/${actor.isAdmin ? "unlimited" : r.limit}`);
    return {
      text: `Allowances this month (resets ${meter.resetsOn}): ${lines.join("; ")}. AI writes: ${aiWritesEnabled ? "enabled" : "off"}.`,
      data: {
        period: meter.period,
        resets_on: meter.resetsOn,
        admin_unlimited: actor.isAdmin,
        allowances: meter.rows.map((r) => ({ action: r.action, tool: r.tool, label: r.label, used: r.used, limit: r.limit })),
        ai_writes_enabled: aiWritesEnabled,
      },
    };
  },
};

export const SESSION1_TOOLS: McpTool[] = [listCompanies, getUsage];
