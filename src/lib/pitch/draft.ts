import "server-only";

/**
 * Pitch drafting — write a personalised pitch for a saved journalist.
 *
 * Added 2026-09-09. PressIQ has always SCORED pitches; it could not write one.
 * This closes the loop: JournoCollabIQ finds the journalist, the CRM records
 * why, and this drafts the pitch that gets scored and then tracked.
 *
 * ONE CALL PER JOURNALIST, deliberately. A single call producing eight full
 * pitches is exactly the shape that truncates, which is the bug found earlier
 * the same day (a cut-off tool call silently became a confident wrong score).
 * Small independent responses cannot truncate the same way, one journalist
 * failing does not take the batch with it, and each is checked for stop_reason
 * regardless.
 *
 * Sonnet, not Opus: drafting from a fixed brief is far less demanding than
 * scoring, every draft is reviewed before it is sent, and a batch of eight has
 * to stay trivially cheap.
 */

import { DRAFT_MODEL } from "./config";
import { recordAiUsage } from "@/lib/ai-usage";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

/** Hard cap per batch. Guards cost and wall-clock, not correctness. */
export const MAX_DRAFT_BATCH = 10;

/** How many drafts are in flight at once. */
const CONCURRENCY = 3;

export interface DraftBrief {
  companyName: string;
  companyContext: string;
  companyWebsite?: string | null;
  assetTitle?: string | null;
  assetDescription?: string | null;
  assetUrl?: string | null;
  angle?: string | null;
}

export interface DraftTarget {
  id: string;
  name: string;
  outlet?: string | null;
  beat?: string | null;
  fitNote?: string | null;
  /** What they have been writing lately. When present the opening bridges from
   * it to the sender's data; when absent the pitch leads with the strongest
   * number, which is the correct fallback rather than a failure. */
  recentWork?: string | null;
}

export interface DraftResult {
  journalistId: string;
  journalistName: string;
  subject: string;
  body: string;
  error?: string;
}

const SYSTEM_PROMPT = `You write cold pitches from a named expert to a named journalist.

A pitch earns a reply when it hands the journalist a story they could file, not when it describes a company. Follow these rules without exception:

- Open with the most specific, checkable fact available. Never open with a greeting paragraph about who the sender is.
- Name what the journalist gets: the dataset, the methodology, the interview, the exclusive window. Be concrete about what is actually being offered.
- Tie the story to the journalist's own beat and, where one exists, to a dated hook.
- WHEN "RECENT WORK" IS SUPPLIED, open by bridging from what they are already covering to the sender's data, in one sentence, then go straight to the number. The bridge must do real work: it explains why THIS data is the natural next question for a story they have already told. NEVER compliment the piece. Do not write "I loved", "I enjoyed", "great piece", "I was reading", "your excellent". Praise is the most recognisable tell of an automated pitch and journalists discount it instantly. Reference the substance, not the quality.
- WHEN NO RECENT WORK IS SUPPLIED, lead with the strongest checkable number. That is the correct choice, not a fallback to apologise for. Do not manufacture a fake personal connection to avoid it.
- 120 to 180 words in the body. Shorter is better than padded.
- Plain punctuation only. Do NOT use em dashes or en dashes. Use full stops and commas.
- No superlatives, no "I hope this finds you well", no "game-changing", "revolutionary", "excited to share", "reaching out", "circle back", "leverage", "in today's landscape". No flattery about their recent article unless a specific one is named in the brief.
- Never invent a statistic, a source, a date or a credential. Use only what the brief gives you. If the brief is thin, write a shorter pitch rather than padding it with invention.
- Sign off with the sender's name only.
- The subject line is 6 to 9 words, concrete, and contains the strongest fact or the offer. No colons used as clickbait, no questions.

Return the subject and body through the tool. Write nothing else.`;

const DRAFT_TOOL = {
  name: "pitch_draft",
  description: "The drafted pitch subject line and body.",
  input_schema: {
    type: "object" as const,
    properties: {
      subject: { type: "string", description: "6 to 9 words, concrete." },
      body: { type: "string", description: "120 to 180 words. Plain punctuation, no em dashes." },
    },
    required: ["subject", "body"],
  },
};

function buildPrompt(brief: DraftBrief, target: DraftTarget): string {
  const lines: string[] = [];
  lines.push(`THE JOURNALIST`);
  lines.push(`Name: ${target.name}`);
  if (target.outlet) lines.push(`Outlet: ${target.outlet}`);
  if (target.beat) lines.push(`Beat: ${target.beat}`);
  if (target.fitNote) lines.push(`Why they fit this story: ${target.fitNote}`);
  if (target.recentWork) {
    lines.push(`Recent work (bridge from this, never compliment it): ${target.recentWork}`);
  }
  lines.push("");
  lines.push(`THE SENDER`);
  lines.push(`Name: ${brief.companyName}`);
  lines.push(`Background: ${brief.companyContext}`);
  if (brief.companyWebsite) lines.push(`Website: ${brief.companyWebsite}`);
  lines.push("");
  if (brief.assetTitle) {
    lines.push(`THE ASSET BEING OFFERED`);
    lines.push(`Title: ${brief.assetTitle}`);
    if (brief.assetDescription) lines.push(`Detail: ${brief.assetDescription}`);
    if (brief.assetUrl) lines.push(`Published at: ${brief.assetUrl}`);
    lines.push("");
  }
  if (brief.angle) {
    lines.push(`THE STORY ANGLE`);
    lines.push(brief.angle);
    lines.push("");
  }
  lines.push(`Write the pitch to ${target.name}. Use their first name in the greeting.`);
  return lines.join("\n");
}

async function draftOne(
  apiKey: string,
  brief: DraftBrief,
  target: DraftTarget,
): Promise<DraftResult> {
  const base: DraftResult = { journalistId: target.id, journalistName: target.name, subject: "", body: "" };
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: DRAFT_MODEL,
        max_tokens: 1500,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        tools: [DRAFT_TOOL],
        tool_choice: { type: "tool", name: DRAFT_TOOL.name },
        messages: [{ role: "user", content: buildPrompt(brief, target) }],
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      console.error("pitch-draft upstream error:", res.status, err?.error?.message);
      return { ...base, error: "Could not draft this one. Try again." };
    }

    const json = (await res.json()) as {
      content?: Array<{ type: string; name?: string; input?: unknown }>;
      stop_reason?: string;
    };
    // Cost log (stage 3). Before the truncation check: a cut-off draft is billed too.
    await recordAiUsage("pitch-draft", DRAFT_MODEL, json);

    // Same lesson as the scoring truncation bug found earlier today: a cut-off
    // response must never be presented as a finished one.
    if (json.stop_reason === "max_tokens") {
      console.error("pitch-draft: output truncated for", target.name);
      return { ...base, error: "The draft was cut short. Try again." };
    }

    const block = (json.content ?? []).find(b => b.type === "tool_use" && b.name === DRAFT_TOOL.name);
    const input = (block?.input ?? {}) as { subject?: unknown; body?: unknown };
    const subject = typeof input.subject === "string" ? input.subject.trim() : "";
    const body = typeof input.body === "string" ? input.body.trim() : "";
    if (!subject || !body) return { ...base, error: "The draft came back incomplete. Try again." };

    return { ...base, subject, body };
  } catch (e) {
    console.error("pitch-draft error for", target.name, e);
    return { ...base, error: "Could not draft this one. Try again." };
  }
}

/** Draft for every target, a few at a time. Never rejects: a failed target
 * comes back carrying its own `error` so the rest of the batch still lands. */
export async function draftPitches(
  brief: DraftBrief,
  targets: DraftTarget[],
): Promise<DraftResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("pitch-draft: ANTHROPIC_API_KEY is not set");
    return targets.map(t => ({
      journalistId: t.id, journalistName: t.name, subject: "", body: "",
      error: "Drafting is not configured.",
    }));
  }

  const capped = targets.slice(0, MAX_DRAFT_BATCH);
  const out: DraftResult[] = new Array(capped.length);
  let cursor = 0;

  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= capped.length) return;
      out[i] = await draftOne(apiKey!, brief, capped[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, capped.length) }, worker));
  return out;
}
