/**
 * EMOS MCP — Tier W, the outcome ledger (spec v1.3 §3): what happened to a pitch.
 *
 * Session 3 (2026-10-07). log_pitch_sent, log_reply, record_placement and
 * undo_last_write. Same two-call rule as every write tool (see write.ts):
 * preview first, then commit with only the confirmation_token. EMOS never
 * reads an inbox: the user's own AI finds the sent mail or the reply through
 * the user's own connectors and reports it here.
 *
 * Names, descriptions and schemas only. The work is in src/lib/emos/ledger.ts,
 * which the dashboard's stage buttons call too.
 */
import type { McpTool } from "@/lib/mcp/protocol";
import { runWriteTool } from "@/lib/emos/write-core";
import {
  afterPitchSent, afterPlacement, LEDGER_TOOLS, planPitchSent, planPlacement, planReplies, planUndo,
} from "@/lib/emos/ledger";
import { TWO_STEP, writes, writeSchema } from "@/lib/mcp/tools/write";

const IDEMPOTENCY = {
  type: "string",
  description:
    "A stable id for the thing being logged, normally the email's message id from the user's inbox. A repeat with the same key records nothing and returns the first result.",
};
const DAY = (what: string) => ({ type: "string", description: `${what}, as YYYY-MM-DD. Default: today. Never a future date.` });

export const logPitchSentTool: McpTool = {
  name: LEDGER_TOOLS.sent,
  tier: "write",
  description:
    "Record that a pitch was SENT: sets the pitch's stage and sent date in the ledger and logs the contact against the journalist. " +
    "Use it only after you have seen the sent email in the user's own inbox (or the user says they sent it); EMOS never sends anything. " +
    "Give `pitch_id` for a pitch already in the ledger, or `journalist_id` + `company_id` + `subject` to add one that was written outside EMOS. " +
    "The preview warns if this journalist was already pitched for this company in the last 30 days. " +
    TWO_STEP,
  inputSchema: writeSchema({
    pitch_id: { type: "string", description: "A pitch in the ledger (from list_pitches)." },
    journalist_id: { type: "string", description: "The saved journalist it went to. Needed with company_id and subject when there is no pitch_id." },
    company_id: { type: "string", description: "The company the pitch is for (from list_companies). Needed when there is no pitch_id." },
    subject: { type: "string", description: "The email subject line. Needed when there is no pitch_id." },
    body: { type: "string", description: "Optional: the pitch text, kept on a newly added pitch." },
    sent_date: DAY("The day it was sent"),
    note: { type: "string", description: "Optional note, max 500 characters." },
    idempotency_key: IDEMPOTENCY,
  }),
  annotations: writes("Log a sent pitch"),
  handler: (actor, args) => runWriteTool(actor, LEDGER_TOOLS.sent, args, planPitchSent, afterPitchSent),
};

export const logReplyTool: McpTool = {
  name: LEDGER_TOOLS.reply,
  tier: "write",
  description:
    "Record what came back on pitches: `replied` (stage moves to replied), `rejected` (they answered with a no) or `no_response` (silence after about 14 days; the stage stays as it is). " +
    "Pass up to 50 `items` so one preview and one commit cover a whole inbox sweep. Read and log only: never reply to a journalist on the user's behalf. " +
    "A note is a short summary in your words (max 500 characters), never the pasted email. " +
    TWO_STEP,
  inputSchema: writeSchema({
    items: {
      type: "array",
      minItems: 1,
      maxItems: 50,
      description: "One entry per pitch outcome.",
      items: {
        type: "object",
        properties: {
          pitch_id: { type: "string", description: "The pitch in the ledger (from list_pitches)." },
          outcome: { type: "string", enum: ["replied", "rejected", "no_response"], description: "Default: replied." },
          date: DAY("The day of the reply (or the day you gave up waiting)"),
          note: { type: "string", description: "Short summary of the reply, max 500 characters." },
          idempotency_key: IDEMPOTENCY,
        },
        required: ["pitch_id"],
        additionalProperties: false,
      },
    },
  }),
  annotations: writes("Log replies"),
  handler: (actor, args) => runWriteTool(actor, LEDGER_TOOLS.reply, args, planReplies),
};

export const recordPlacementTool: McpTool = {
  name: LEDGER_TOOLS.placement,
  tier: "write",
  description:
    "Record that a pitch was PLACED (published): stage, placement URL, date, link type, content type and the page's Domain Rating. " +
    "The server opens the URL itself and refuses unless the page links to the company's website or is on the outlet the pitched journalist writes for. " +
    "So give the real published page, not a homepage or a search result. " +
    TWO_STEP,
  inputSchema: writeSchema({
    pitch_id: { type: "string", description: "The pitch in the ledger (from list_pitches)." },
    placement_url: { type: "string", description: "Full address of the published page, starting with https://." },
    placed_date: DAY("The day it was published"),
    link_type: { type: "string", enum: ["Do Follow", "No Follow", "N/A"], description: "Only if you checked the link's rel attribute. N/A = a mention with no link." },
    content_type: { type: "string", enum: ["Original", "Republished"], description: "Republished = a syndicated copy of a piece first published elsewhere." },
    anchor_text: { type: "string", description: "The link's visible text, if there is a link." },
    idempotency_key: IDEMPOTENCY,
  }),
  annotations: { ...writes("Record a placement"), openWorldHint: true },
  handler: (actor, args) => runWriteTool(actor, LEDGER_TOOLS.placement, args, planPlacement, afterPlacement),
};

export const undoLastWriteTool: McpTool = {
  name: LEDGER_TOOLS.undo,
  tier: "write",
  description:
    "Reverse the most recent write made through these tools on this account (add_journalist, log_pitch_sent, log_reply, record_placement), within 7 days. One step only: it cannot go further back. " +
    "Rows the write created are removed and rows it changed go back to how they were; refused if any of them was edited since. " +
    "Call it with no arguments for a preview of what would be reversed, then again with only confirmation_token.",
  inputSchema: writeSchema({}),
  annotations: { ...writes("Undo the last write"), idempotentHint: false },
  handler: (actor, args) => runWriteTool(actor, LEDGER_TOOLS.undo, args, (a) => planUndo(a)),
};

export const LEDGER_WRITE_TOOLS: McpTool[] = [logPitchSentTool, logReplyTool, recordPlacementTool, undoLastWriteTool];
