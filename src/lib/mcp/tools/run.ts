/**
 * EMOS MCP — Tier A tools (spec v1.3 §3): run the AI tools.
 *
 * Session 2 (2026-10-06). Each one spends the account's monthly allowance
 * exactly like the dashboard button and ends its result with a cost line.
 * There is no preview step (decision 2). A run that would take more than a
 * quarter of what is left is refused once and runs when repeated with
 * `confirm_large_run: true`.
 *
 * Names, descriptions and schemas only. The work is in src/lib/emos/run.ts.
 * get_run only reads, so it sits in the read tier (and its rate-limit bucket).
 */
import type { JsonSchema, McpTool, ToolAnnotations } from "@/lib/mcp/protocol";
import { buildAssetPack, draftPitch, findJournalists, getRun, scorePitch, startScan } from "@/lib/emos/run";
import { mcpScanBeats } from "@/lib/signaliq/config";

const runs = (title: string, openWorld: boolean): ToolAnnotations => ({
  title, readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: openWorld,
});

const schema = (properties: Record<string, unknown>, required: string[]): JsonSchema => ({
  type: "object", properties, required, additionalProperties: false,
});

const COMPANY = { type: "string", description: "The company this run is for (from list_companies). Required." };
const CONFIRM = {
  type: "boolean",
  description: "Only after a refusal that said confirm_large_run, and only once the user has agreed.",
};
const BEAT_IDS = mcpScanBeats().map((b) => b.id);
const KSA_NOTE = "Saudi beats (ksa-*) read Saudi press volume and suit Saudi and Gulf campaigns.";

export const scanSignalsTool: McpTool = {
  name: "scan_signals",
  tier: "run",
  description:
    "Start a SignalIQ scan for a company on 1 to 3 beats. Returns a run_id within seconds; the scan takes 40 to 90 seconds, " +
    "so poll get_run until it is done. The results are saved as signals (status \"new\"). Uses 1 signal scan. " +
    `Beat ids: ${BEAT_IDS.join(", ")}. ${KSA_NOTE}`,
  inputSchema: schema(
    {
      company_id: COMPANY,
      beats: { type: "array", items: { type: "string", enum: BEAT_IDS }, minItems: 1, maxItems: 3, description: "1 to 3 beat ids, the main one first." },
      confirm_large_run: CONFIRM,
    },
    ["company_id", "beats"],
  ),
  annotations: runs("Scan for signals", true),
  handler: startScan,
};

export const getRunTool: McpTool = {
  name: "get_run",
  tier: "read",
  description: "Status and result of a long call (scan_signals). Poll about every 15 seconds until status is \"done\" or \"failed\".",
  inputSchema: schema({ run_id: { type: "string", description: "The run_id that scan_signals returned." } }, ["run_id"]),
  annotations: { title: "Check a run", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: getRun,
};

export const buildAssetPackTool: McpTool = {
  name: "build_asset_pack",
  tier: "run",
  description:
    "Build an asset pack for one saved signal: pitch angle, subject line, sourced data brief, a linkable-asset idea and cautions. " +
    "Takes about 30 seconds and is saved to SignalIQ. Uses 1 signal pack. Journalist names in a pack are unverified leads. " +
    "Works only on signals where list_signals shows can_build_pack: true.",
  inputSchema: schema({ company_id: COMPANY, signal_id: { type: "string", description: "A saved signal id." }, confirm_large_run: CONFIRM }, ["company_id", "signal_id"]),
  annotations: runs("Build an asset pack", false),
  handler: buildAssetPack,
};

export const findJournalistsTool: McpTool = {
  name: "find_journalists",
  tier: "run",
  description:
    "JournoCollabIQ shortlist: up to 8 journalists for a signal or a beat, each checked for a recent byline at the outlet. " +
    "Takes up to two minutes. Returns candidates only; nothing is saved (saving is a separate write tool). " +
    "Only candidates with verification.status \"verified\" may be presented as people who cover the beat. No emails are returned. " +
    "Uses 1 journalist search; `more: true` (next names from the outlet rosters) is free.",
  inputSchema: schema(
    {
      company_id: COMPANY,
      signal_id: { type: "string", description: "A saved signal to find journalists for. Give this or `beat`." },
      beat: { type: "string", description: "The topic the journalists should cover, e.g. \"Saudi retail and e-commerce\"." },
      story: { type: "string", description: "The story being pitched, in a sentence or two." },
      geography: { type: "string", description: "Market, e.g. \"Saudi Arabia\", \"USA\"." },
      offering: { type: "string", description: "What the source offers the journalist, e.g. data, expert comment, exclusive." },
      more: { type: "boolean", description: "true = the next names from the outlet rosters (free). Pass the names already shown in exclude_names." },
      exclude_names: { type: "array", items: { type: "string" }, description: "Names already shown, to leave out." },
      confirm_large_run: CONFIRM,
    },
    ["company_id"],
  ),
  annotations: runs("Find journalists", true),
  handler: findJournalists,
};

export const scorePitchTool: McpTool = {
  name: "score_pitch",
  tier: "run",
  description:
    "PressIQ: score a pitch out of 100 with the rubric and the top fixes. Takes 30 to 60 seconds. " +
    "Saved to Score History with the company and (when given) the journalist. Uses 1 pitch score. The pitch is scored, never sent.",
  inputSchema: schema(
    {
      company_id: COMPANY,
      pitch: { type: "string", description: "The full pitch body (40 to 8,000 characters)." },
      subject: { type: "string", description: "The email subject line." },
      journalist_id: { type: "string", description: "The saved journalist this pitch is for." },
      asset_id: { type: "string", description: "The linkable asset the pitch offers." },
      journalist_query: { type: "string", description: "Only when replying to a journalist's request (HARO, Qwoted): the request text." },
      platform: { type: "string", enum: ["direct", "haro", "qwoted", "sos", "featured", "b2bwriter"], description: "Default: direct (proactive outreach)." },
      brand_signals: {
        type: "object",
        description: "Which authority signals the pitch's sender really has. Leave a key out when unsure.",
        properties: {
          website: { type: "boolean" }, bylines: { type: "boolean" }, youtube: { type: "boolean" },
          speaking: { type: "boolean" }, caseStudies: { type: "boolean" }, linkedin: { type: "boolean" },
        },
        additionalProperties: false,
      },
      confirm_large_run: CONFIRM,
    },
    ["company_id", "pitch"],
  ),
  annotations: runs("Score a pitch", false),
  handler: scorePitch,
};

export const draftPitchTool: McpTool = {
  name: "draft_pitch",
  tier: "run",
  description:
    "Draft a personalised pitch for 1 to 10 saved journalists from the company's saved context, brief and (optionally) an asset or pack. " +
    "Each draft is saved to PressIQ Drafts and never sent: the user sends from their own inbox. Uses 1 pitch draft per journalist.",
  inputSchema: schema(
    {
      company_id: COMPANY,
      journalist_ids: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 10, description: "Saved journalist ids, in the order to draft." },
      asset_id: { type: "string", description: "A linkable asset to offer." },
      pack_id: { type: "string", description: "A saved asset pack; its angle is used when `angle` is not given." },
      angle: { type: "string", description: "The angle or the user's own take, up to 2,000 characters. It is the user's words, so keep them." },
      confirm_large_run: CONFIRM,
    },
    ["company_id", "journalist_ids"],
  ),
  annotations: runs("Draft pitches", false),
  handler: draftPitch,
};

export const RUN_TOOLS: McpTool[] = [
  scanSignalsTool, getRunTool, buildAssetPackTool, findJournalistsTool, scorePitchTool, draftPitchTool,
];
