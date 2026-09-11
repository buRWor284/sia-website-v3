import "server-only";
import { briefPromptBlock } from "@/lib/company-brief-prompt";

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
  /** The person the pitch is FROM (companies.spokesperson_*, 2026-09-10). */
  senderName?: string | null;
  senderTitle?: string | null;
  senderEmail?: string | null;
  senderLinkedIn?: string | null;
  assetTitle?: string | null;
  assetDescription?: string | null;
  assetUrl?: string | null;
  angle?: string | null;
  /** The approved Company Brief, if any (2026-09-10). Server-loaded only. */
  companyBrief?: string | null;
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
- 80 to 120 words in the body, not counting the signature; 135 is a hard ceiling. PressIQ counts the whole email and aims for 100 to 150, and the signature adds about 15. Shorter is better than padded.
- Word budget, in sentences: the greeting line; the hook in 2 sentences; the authority line in 1 sentence; the offer in 2 sentences; the question in 1 sentence; a one-line offer to send more. That lands near 110 words. Adding the authority line means cutting elsewhere, usually the offer.
- Never list more than three items. Name the most telling ones and summarise the rest ("AT&T, Verizon, T-Mobile and five prepaid brands"). The full lists, sources and method go in the follow-up, so one short line offering them is enough.
- Use at most two statistics. The angle often gives more facts than fit: pick the strongest, drop the rest.
- Write at a reading level of grade 7 or below: sentences of about 15 words or fewer, everyday words, one idea per sentence. Journalists skim.
- Write as the named sender in the first person ("I", "we") from the first line to the last. Never switch to describing the sender or the company in the third person.
- After the offer, END WITH EXACTLY ONE short question that is easy to say yes to (for example, whether they would like the data or a call this week), then a one-line offer to send more. Never end on a pleasantry.
- Plain punctuation only. Do NOT use em dashes or en dashes. Use full stops and commas.
- No superlatives, no "I hope this finds you well", no "game-changing", "revolutionary", "excited to share", "reaching out", "circle back", "leverage", "in today's landscape". No flattery about their recent article unless a specific one is named in the brief.
- WHEN A COMPANY BRIEF IS SUPPLIED, add exactly ONE sentence of authority from it straight after the hook: the sender's own true story (e.g. why they started the company) or one proof point, in the first person. A pitch without it scores low on personal brand, and the brief is where it comes from. Keep a self-reported claim framed as the company's own claim. Use a customer story only if the brief marks it public or anonymised. Make room by trimming elsewhere, never by going over the word limit.
- An asset without a "Published at" link is NOT finished. Say it is being built or nearly ready and offer early access. Never write "I have built", "we just published" or describe findings or results that do not exist yet.
- Never invent a statistic, a source, a date or a credential. Use only what the brief gives you. If the brief is thin, write a shorter pitch rather than padding it with invention.
- Close with a signature block, one item per line: the sender's full name, their title and company, the company website, then their email and LinkedIn if given. Copy the SIGNATURE lines from the brief exactly. Where the brief shows a [bracketed placeholder], keep the placeholder exactly as written so the user fills it in. Never sign with the company name alone and never invent a name, title or contact.
- The subject line is 6 to 9 words, concrete, and contains the strongest fact or the offer. Tailor it to this journalist's beat so two journalists in the same batch do not get the same subject. No colons used as clickbait, no questions.

Return the subject and body through the tool. Write nothing else.`;

const DRAFT_TOOL = {
  name: "pitch_draft",
  description: "The drafted pitch subject line and body.",
  input_schema: {
    type: "object" as const,
    properties: {
      subject: { type: "string", description: "6 to 9 words, concrete." },
      body: { type: "string", description: "80 to 120 words (135 at most) plus the signature block. Grade 7 reading level, first person throughout, ends with one question. Plain punctuation, no em dashes." },
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
  lines.push(`Company: ${brief.companyName}`);
  lines.push(`Background: ${brief.companyContext}`);
  if (brief.companyWebsite) lines.push(`Website: ${brief.companyWebsite}`);
  if (brief.senderName) lines.push(`Person sending the pitch: ${brief.senderName}${brief.senderTitle ? `, ${brief.senderTitle}` : ""}`);
  if (brief.companyBrief) {
    // Proof points and true stories come from here. Test 10 Sep 2026: with the
    // brief supplied but "at most one" wording, the drafter used none; adding
    // two founder facts by hand had lifted the same pitch from 77 to 80.
    lines.push(briefPromptBlock(brief.companyBrief).trim());
    lines.push("From the brief, use exactly one authority sentence (the sender's own story or one proof point), whichever fits this journalist best. Stay inside the word limit.");
  }
  lines.push("");
  // The signature is assembled here, not left to the model: a missing field
  // becomes a visible [placeholder] instead of an invented name or email.
  lines.push(`SIGNATURE (copy these lines exactly at the end of the body)`);
  lines.push(brief.senderName?.trim() || "[Your full name]");
  lines.push(`${brief.senderTitle?.trim() || "[Your title]"}, ${brief.companyName}`);
  if (brief.companyWebsite) lines.push(brief.companyWebsite);
  lines.push(brief.senderEmail?.trim() || "[Your email]");
  lines.push(brief.senderLinkedIn?.trim() || "[Your LinkedIn URL]");
  lines.push("");
  if (brief.assetTitle) {
    lines.push(`THE ASSET BEING OFFERED`);
    lines.push(`Title: ${brief.assetTitle}`);
    if (brief.assetDescription) lines.push(`Detail: ${brief.assetDescription}`);
    if (brief.assetUrl) lines.push(`Published at: ${brief.assetUrl}`);
    // Live test 10 Sep 2026: with no status line the drafter wrote "I have
    // built the Scorecard" for an asset that is still a plan.
    else lines.push(`Status: not published yet, still being built. Offer early or exclusive access; do not say it is finished.`);
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

/** Longest body we accept before one "shorter, please" retry (signature excluded). */
const BODY_WORD_CAP = 140;

/**
 * Words in the body above the signature. The signature is assembled by us, so
 * its first line is known: everything from there down is not counted.
 */
export function bodyWords(body: string, signatureFirstLine: string): number {
  const at = signatureFirstLine ? body.lastIndexOf(signatureFirstLine) : -1;
  const main = at > 0 ? body.slice(0, at) : body;
  return main.split(/\s+/).filter(Boolean).length;
}

/** House rule for outbound copy; the prompt asks, this makes sure. */
function noDashes(text: string): string {
  return text
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/(\w)[—–](\w)/g, "$1-$2")
    .replace(/[—–]/g, ",");
}

/**
 * Drafts ran about 30 words long once the brief's authority line was added
 * (full-pass test, 10 Sep 2026): the model added the sentence but did not trim.
 * One retry with the word count is cheaper than a pitch PressIQ marks down.
 */
async function draftOne(
  apiKey: string,
  brief: DraftBrief,
  target: DraftTarget,
): Promise<DraftResult> {
  const base: DraftResult = { journalistId: target.id, journalistName: target.name, subject: "", body: "" };
  const first = await callDraft(apiKey, brief, target, null);
  if (first.error) return { ...base, error: first.error };

  const sigLine = brief.senderName?.trim() || "[Your full name]";
  const words = bodyWords(first.body, sigLine);
  if (words <= BODY_WORD_CAP) return { ...base, subject: first.subject, body: first.body };

  const retry = await callDraft(apiKey, brief, target, {
    words,
    previous: first.body,
  });
  if (retry.error) return { ...base, subject: first.subject, body: first.body };
  const retryWords = bodyWords(retry.body, sigLine);
  const pick = retryWords < words ? retry : first;
  return { ...base, subject: pick.subject, body: pick.body };
}

async function callDraft(
  apiKey: string,
  brief: DraftBrief,
  target: DraftTarget,
  tooLong: { words: number; previous: string } | null,
): Promise<{ subject: string; body: string; error?: string }> {
  const base = { subject: "", body: "" };
  const userText = buildPrompt(brief, target) + (tooLong
    ? `\n\nYOUR LAST DRAFT WAS ${tooLong.words} WORDS ABOVE THE SIGNATURE. The limit is 135. Rewrite it at 100 words or fewer above the signature (you tend to run long, so aim low). Keep the hook, the one authority sentence and the question. Cut in this order until it fits: lists longer than three items, source and method details, a second statistic, any sentence that repeats the hook. Last draft for reference:\n${tooLong.previous}`
    : "");
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
        messages: [{ role: "user", content: userText }],
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

    return { subject: noDashes(subject), body: noDashes(body) };
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
