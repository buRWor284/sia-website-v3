/**
 * EMOS MCP — Tier W tools (spec v1.3 §3 and §4): record things.
 *
 * Session 3 (2026-10-07). Every tool here works in two calls:
 *   1. call it with the details          -> a PREVIEW and a confirmation_token; nothing is recorded
 *   2. call it with ONLY the token       -> the server records exactly what the preview showed
 * Both calls are refused while the organisation's "AI writes" switch is off.
 * Every commit is logged with before/after in mcp_audit_log and the latest one
 * can be reversed with undo_last_write.
 *
 * Names, descriptions and schemas only. The work is in src/lib/emos.
 */
import type { JsonSchema, McpTool, ToolAnnotations } from "@/lib/mcp/protocol";
import { runWriteTool } from "@/lib/emos/write-core";
import { afterAddJournalists, planAddJournalists } from "@/lib/emos/journalists";

export const writes = (title: string): ToolAnnotations => ({
  title, readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false,
});

/** No `required` list: the commit call carries the token and nothing else. Each tool checks its own fields. */
export const writeSchema = (properties: Record<string, unknown>): JsonSchema => ({
  type: "object",
  properties: {
    ...properties,
    confirmation_token: {
      type: "string",
      description: "Second call only: the token from the preview, and no other field. Send it only after the user has seen the preview and agreed.",
    },
  },
  additionalProperties: false,
});

export const TWO_STEP =
  "Two calls: first with the details (returns a preview and a confirmation_token, records nothing); show the user the preview; " +
  "then call again with only confirmation_token to record it. Refused while the organisation's AI writes switch is off.";

export const addJournalistTool: McpTool = {
  name: "add_journalist",
  tier: "write",
  description:
    "Save 1 to 10 journalists to the journalist list for a company, so draft_pitch and the outcome ledger can use them. " +
    "Pass each candidate from find_journalists as it came back (name, outlet_domain, beat, why, recent_article, verification) and add `email` when you have one. " +
    "Never guess or construct an email: pass one only if the user gave it or you can cite the public page it is on, and say which in `email_source`. " +
    "A journalist already saved is not duplicated; if they are saved without an email, the email is filled in (an existing email is never changed). " +
    TWO_STEP,
  inputSchema: writeSchema({
    company_id: { type: "string", description: "The company these journalists are being saved for (from list_companies)." },
    signal_id: { type: "string", description: "The signal they were found for, if any. Its headline is kept as the reason they were saved." },
    angle: { type: "string", description: "The story being pitched, in a sentence (max 500 characters). Used when no signal_id is given." },
    beat: { type: "string", description: "The search beat they were found under, e.g. \"Saudi retail and e-commerce\"." },
    geography: { type: "string", description: "Market, e.g. \"Saudi Arabia\"." },
    journalists: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      description: "The journalists to save.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          outlet_domain: { type: "string", description: "The outlet's domain, e.g. arabnews.com." },
          stated_outlet: { type: "string", description: "The outlet's name, when there is no domain." },
          beat: { type: "string", description: "What this journalist covers." },
          why: { type: "string", description: "Why they fit this story (max 500 characters)." },
          recent_article: { type: "string", description: "URL of a recent article by them." },
          verification: {
            type: "object",
            description: "The byline check from find_journalists, unchanged.",
            properties: {
              status: { type: "string" }, byline_url: { type: ["string", "null"] }, byline_title: { type: ["string", "null"] },
              byline_date: { type: ["string", "null"] }, note: { type: ["string", "null"] }, checked_at: { type: ["string", "null"] },
            },
          },
          email: { type: "string", description: "Their work email. Only one the user gave you or one you can cite. Leave out when unknown." },
          email_source: { type: "string", description: "Where the email came from: \"given by the user\", or the URL of the page it is on." },
          profile_url: { type: "string", description: "LinkedIn profile URL, if known." },
          public_contact: { type: "string", description: "A public handle such as @name, if known." },
        },
        required: ["name"],
      },
    },
  }),
  annotations: writes("Save journalists"),
  handler: (actor, args) => runWriteTool(actor, "add_journalist", args, planAddJournalists, afterAddJournalists),
};

export const WRITE_TOOLS: McpTool[] = [addJournalistTool];
