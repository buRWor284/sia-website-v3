/**
 * EMOS MCP — Tier R tools (spec v1.3 §3): what is saved.
 *
 * Session 2 (2026-10-06): every read here now runs on actor.db(), a
 * row-level-security client signed for the caller's organisation (see
 * src/lib/emos/supabase-jwt.ts). The Session 1 service-client reads are gone.
 * The one exception is get_usage's allowance meter: usage_counters is on the
 * spec's short list of service-role tables (§2.3) and is read by explicit org.
 * Session 3 (2026-10-07): get_usage reports the "AI writes" switch for real.
 *
 * This file is only names, descriptions and input schemas. The work is in
 * src/lib/emos/read.ts.
 */
import { getUsageMeter } from "@/lib/usage-limits";
import { aiWritesEnabled } from "@/lib/emos/write-core";
import type { JsonSchema, McpTool, ToolAnnotations } from "@/lib/mcp/protocol";
import {
  listAssets, listCompanies, listJournalists, listPitchDrafts, listPitches, listScores, listSignals,
} from "@/lib/emos/read";

const readOnly = (title: string): ToolAnnotations => ({
  title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false,
});

const PAGING = {
  limit: { type: "integer", minimum: 1, maximum: 100, description: "Rows per page. Default 25, max 100." },
  cursor: { type: "string", description: "The next_cursor value from the previous page, unchanged." },
  since: { type: "string", description: "Only rows created on or after this date, e.g. 2026-10-01." },
} as const;

const schema = (properties: Record<string, unknown>, required?: string[]): JsonSchema => ({
  type: "object", properties, ...(required ? { required } : {}), additionalProperties: false,
});

const COMPANY_FILTER = { type: "string", description: "A company id from list_companies. Limits the list to that company." };

export const listCompaniesTool: McpTool = {
  name: "list_companies",
  tier: "read",
  description:
    "List the companies this EMOS account runs campaigns for (each with its saved context). " +
    "Pass `id` to get one company with its approved brief. The `active` flag shows which company " +
    "the dashboard currently has selected; it is a hint only. Every other tool needs an explicit company_id from here.",
  inputSchema: schema({ id: { type: "string", description: "A company id. When given, returns that company with its approved brief." } }),
  annotations: readOnly("List companies"),
  handler: listCompanies,
};

export const listJournalistsTool: McpTool = {
  name: "list_journalists",
  tier: "read",
  description:
    "Saved journalists: name, outlet, outlet domain, email, beat, Domain Rating, byline verification status, last contact, " +
    "pitches sent, placements, and why each was saved (company and angle). An empty email means none is saved: never guess one. " +
    "Filter by `company_id`, a name search `q`, or `has_email: true`. Pass `id` for one journalist.",
  inputSchema: schema({
    company_id: { type: "string", description: "Only journalists saved for this company (from list_companies)." },
    id: { type: "string", description: "One journalist by id." },
    q: { type: "string", description: "Part of a name." },
    has_email: { type: "boolean", description: "true = only journalists with an email saved." },
    ...PAGING,
  }),
  annotations: readOnly("List journalists"),
  handler: listJournalists,
};

export const listSignalsTool: McpTool = {
  name: "list_signals",
  tier: "read",
  description:
    "Saved SignalIQ signals (story leads where real-world activity is ahead of press coverage): headline, score, coverage gap, fit, status. " +
    "A signal is a lead, not a prediction. `can_build_pack` says whether build_asset_pack will work on it. " +
    "`include_pack: true` attaches the latest saved asset pack to each signal.",
  inputSchema: schema({
    company_id: COMPANY_FILTER,
    id: { type: "string", description: "One signal by id." },
    status: { type: "string", enum: ["new", "saved", "pitched", "archived"], description: "new = found by a scan and not yet triaged." },
    include_pack: { type: "boolean", description: "Attach the latest asset pack for each signal." },
    ...PAGING,
  }),
  annotations: readOnly("List signals"),
  handler: listSignals,
};

export const listAssetsTool: McpTool = {
  name: "list_assets",
  tier: "read",
  description:
    "Linkable assets (reports, calculators, data studies, and so on) with status, published URL and links earned. " +
    "The AI creation brief is cut at 1,500 characters unless `full: true` or an `id` is given.",
  inputSchema: schema({
    company_id: COMPANY_FILTER,
    id: { type: "string", description: "One asset by id." },
    status: { type: "string", enum: ["draft", "in_review", "published", "archived"] },
    full: { type: "boolean", description: "Return the whole AI creation brief." },
    ...PAGING,
  }),
  annotations: readOnly("List linkable assets"),
  handler: listAssets,
};

export const listScoresTool: McpTool = {
  name: "list_scores",
  tier: "read",
  description:
    "PressIQ pitch scores: composite score, tier, the radar dimensions and the top fixes, with which journalist and company each was for. " +
    "Pass `id` for one score with the full rubric and the pitch text.",
  inputSchema: schema({
    company_id: COMPANY_FILTER,
    journalist_id: { type: "string", description: "Only scores for this journalist." },
    id: { type: "string", description: "One score by id, with its full rubric." },
    ...PAGING,
  }),
  annotations: readOnly("List pitch scores"),
  handler: listScores,
};

export const listPitchDraftsTool: McpTool = {
  name: "list_pitch_drafts",
  tier: "read",
  description:
    "Saved pitch drafts by journalist and company. Bodies are cut at 1,500 characters unless `full: true` or an `id` is given. " +
    "Discarded drafts are left out unless `status: \"discarded\"`. A draft is never sent by EMOS.",
  inputSchema: schema({
    company_id: COMPANY_FILTER,
    journalist_id: { type: "string", description: "Only drafts for this journalist." },
    id: { type: "string", description: "One draft by id, with its full body." },
    status: { type: "string", enum: ["draft", "sent", "discarded"] },
    full: { type: "boolean", description: "Return whole bodies." },
    ...PAGING,
  }),
  annotations: readOnly("List pitch drafts"),
  handler: listPitchDrafts,
};

export const listPitchesTool: McpTool = {
  name: "list_pitches",
  tier: "read",
  description:
    "The CoverageIQ ledger: every pitch with its stage (drafted, sent, opened, replied, placed, amplified), sent date, placement fields, " +
    "company, and the journalist's name, email and outlet domain. Use it to know who was pitched and what came of it.",
  inputSchema: schema({
    company_id: COMPANY_FILTER,
    journalist_id: { type: "string", description: "Only pitches to this journalist." },
    id: { type: "string", description: "One pitch by id." },
    stage: { type: "string", enum: ["drafted", "sent", "opened", "replied", "placed", "amplified"] },
    full: { type: "boolean", description: "Return whole pitch bodies (cut at 1,500 characters otherwise)." },
    ...PAGING,
  }),
  annotations: readOnly("List pitches (ledger)"),
  handler: listPitches,
};

export const getUsageTool: McpTool = {
  name: "get_usage",
  tier: "read",
  description:
    "This month's allowance meter for the account (scans, packs, drafts, scores, etc.: used and limit), " +
    "when it resets, and whether AI writes are enabled for this organisation. Call it before a large run.",
  inputSchema: schema({}),
  annotations: readOnly("Usage this month"),
  async handler(actor) {
    const meter = await getUsageMeter(actor.orgId);
    // The org-level switch (spec §4.5): organizations.ai_writes_enabled, read
    // live through row-level security. The write tools check the same column.
    const writesOn = await aiWritesEnabled(actor);
    const lines = meter.rows.map((r) => `${r.label}: ${r.used}/${actor.isAdmin ? "unlimited" : r.limit}`);
    return {
      text: `Allowances this month (resets ${meter.resetsOn}): ${lines.join("; ")}. AI writes: ${writesOn ? "ON (the write tools can record outcomes, each after a preview)" : "off (the write tools will refuse)"}.`,
      data: {
        period: meter.period,
        resets_on: meter.resetsOn,
        admin_unlimited: actor.isAdmin,
        allowances: meter.rows.map((r) => ({ action: r.action, tool: r.tool, label: r.label, used: r.used, limit: r.limit })),
        ai_writes_enabled: writesOn,
      },
    };
  },
};

export const READ_TOOLS: McpTool[] = [
  listCompaniesTool, listSignalsTool, listJournalistsTool, listAssetsTool,
  listScoresTool, listPitchDraftsTool, listPitchesTool, getUsageTool,
];
