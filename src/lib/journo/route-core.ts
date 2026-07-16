/**
 * JournoCollabIQ — shared server core (Phase P6).
 *
 * The public (/api/journo-ai) and dashboard (/api/emos-platform/journo-ai) routes
 * both call into this module so the prompt builders, the Anthropic call and the
 * preview clamp can never drift — they had already begun to (the dashboard's
 * copies had quietly diverged: a dropped "do not over-polish" line, an abridged
 * media-brief, `String(d.strategy)` vs `String(d.strategy || "")`). The routes
 * now keep ONLY their own guards: the public route owns Turnstile + IP
 * rate-limit + monthly preview quota + preview clamp; the dashboard route owns
 * the Clerk EMOS guard.
 *
 * NOT shared with PartnerCollabIQ (/api/collab-ai) — that's a different tool with
 * its own prompts and `pciq-preview` quota. Keep this scoped to journo prompts.
 *
 * Requires ANTHROPIC_API_KEY.
 */

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-6";

// Angle types. Internal keys are inherited from the CollabIQ clone
// (discount/institution/badge) and kept identical so the wizard keeps working.
export const ANGLE_LABEL: Record<string, string> = {
  discount:    "Expert commentary — a quotable expert take for a story they're already writing",
  institution: "Exclusive data — original data/research offered as an exclusive or embargo",
  badge:       "Trend reaction — a timely reaction tied to a breaking trend or news hook",
};

// Dashboard callers pass extra grounding context (signal / asset / company); the
// public tool doesn't. Each line is included ONLY when present, so the public
// prompt is byte-identical to before and the dashboard prompt gains exactly the
// context it supplied (an absent field is omitted rather than rendered as
// "Not provided" — the one intentional, harmless change from the old copies).
function contextLines(d: Record<string, unknown>): string {
  const lines: string[] = [];
  if (d.signalContext)  lines.push(`- Signal / news hook context: ${d.signalContext}`);
  if (d.assetContext)   lines.push(`- Asset being pitched (if applicable): ${d.assetContext}`);
  if (d.companyContext) lines.push(`- Company / brand background: ${d.companyContext}`);
  return lines.length ? "\n" + lines.join("\n") : "";
}

export function buildJournalistPrompt(d: Record<string, unknown>): string {
  return `You are an expert digital-PR and media-relations strategist who places founders and brands in earned editorial coverage. Your task is to find the JOURNALISTS most likely to cover the story below.

STORY & SOURCE:
- Business / brand: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Beat / topic: ${d.industry || "Not provided"}
- The story / angle being pitched: ${d.audDesc || d.audType || "Not provided"}
- Target tier: ${d.audType || "Not specified"}
- Geography: ${d.geo || "Not provided"}
- What the source is offering: ${ANGLE_LABEL[d.strategy as string] || String(d.strategy || "")}${contextLines(d)}

Generate 8 REAL, NAMED journalists who genuinely cover this beat. Prefer reporters who have published on this topic recently. Do NOT invent people. If you are not confident a person currently covers this beat at this outlet, choose someone you ARE confident about, or fall back to the relevant section/desk.

CRITICAL HONESTY RULES:
- Never fabricate a personal email address. For contact, give a public handle (X/Twitter) or the outlet section/desk only.
- Treat every journalist as "verify before pitching" — people and beats change.
- For the recent article, give a real, specific article by that journalist on this beat if you know one; otherwise give their author/section page. Never invent a URL.

Return ONLY a valid JSON array — no text before or after, no markdown fences. Each object must have exactly these fields:

[
  {
    "name": "Journalist full name (e.g. Kara Swisher)",
    "url": "their outlet's domain, e.g. forbes.com",
    "why": "2-3 sentences: which beat they cover, why this story fits their recent coverage, and the angle that would land with them",
    "linkPage": "URL of a recent relevant article BY this journalist (the proof they cover this) — or their author/section page if no specific article URL is known. Never invent a URL.",
    "contact": "Public contact only: an X/Twitter handle (e.g. @karaswisher) or the outlet desk/section. NEVER a guessed personal email.",
    "contactLinkedIn": "Muck Rack or X profile URL if known, else empty string",
    "seoNote": "Outlet authority + reach and tier, e.g. 'DA 94 · national business desk · very high reach · Tier 1'",
    "tier": "A or B or C — A = highest-fit, approach first"
  }
]`;
}

export function buildAnglePrompt(d: Record<string, unknown>): string {
  return `You are an expert media-relations strategist. Write a tight, tailored PITCH ANGLE for approaching ONE specific journalist. This is the angle plus a starter draft only — the final pitch will be scored separately in PressIQ, so do not over-polish or pad.

SOURCE:
- Business: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Beat / topic: ${d.industry || "Not provided"}
- The story being pitched: ${d.audDesc || "Not provided"}
- What the source is offering: ${ANGLE_LABEL[d.strategy as string] || String(d.strategy || "")}
- Geography: ${d.geo || "Not provided"}

TARGET JOURNALIST:
- Name: ${d.partner || "the journalist"}
- Outlet / beat: ${d.partnerCat || "their beat"}
- Fit score: ${(d.scorePct as number) > 0 ? `${d.scorePct}% fit` : "not yet scored"}

Write:
1. A one-line ANGLE — why THIS journalist, on THIS beat, would want THIS story now (tie it to the kind of thing they cover).
2. A short starter pitch (under 150 words) they could adapt: a specific subject line, an opening that references the journalist's beat or recent work, the news hook or data on offer, and a single low-friction ask.

Keep it warm, specific, and non-salesy. End with one line: "Verify the journalist's name, outlet, and contact before sending — then score the final pitch in PressIQ."

Format:
Angle: [one line]

Subject: [subject line]

[pitch body]`;
}

export function buildMediaPlanPrompt(d: Record<string, unknown>): string {
  const beats = Array.isArray(d.selNiches) ? (d.selNiches as string[]).join(", ") : "Not yet selected";
  return `You are a senior digital-PR strategist writing a MEDIA TARGETING BRIEF for a client's outreach campaign.

Write a polished, executive-ready brief using these inputs:

SOURCE:
- Name: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Beat / topic: ${d.industry || "Not provided"}
- The story / angle: ${d.audDesc || "Not provided"}
- Geography: ${d.geo || "Not provided"}

CAMPAIGN:
- Offer to journalists: ${d.stratLabel || ANGLE_LABEL[d.strategy as string] || d.strategy || ""}
- Selected journalists / outlets: ${beats}
- First scored target: ${d.partner || "Not yet scored"} (${d.partnerCat || ""})${(d.scorePct as number) > 0 ? ` — ${d.scorePct}% fit` : ""}

Structure the brief as:

## Targeting Overview
2–3 sentences on the beat, the angle, and why this set of journalists is the right target.

## The Tiered Media List
Group the selected journalists into Tier A / B / C with a one-line rationale each.

## Outreach Sequence
A phased plan: Tier-1 exclusive (48-hour window) → embargo / simultaneous Tier-2 → wider release. Include follow-up cadence.

## Per-Journalist Angles
For the top targets, one line each on the specific angle to lead with.

## Verify Before You Send
A short checklist: confirm the journalist still covers the beat, the outlet, and the contact channel; then score each pitch in PressIQ before sending.

Write in plain, direct prose — no fluff. Tone: expert consultant. Length: 400–600 words.`;
}

/** Strip the markdown code fences the model sometimes wraps JSON in. */
export function stripFences(s: string): string {
  return s.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
}

/**
 * Clamp the model's JSON array of journalist matches to `limit` rows for the
 * caller's tier. The withheld rows never leave the server, so there is nothing
 * to scrape from the payload and no fake scarcity — the matches are real, just
 * gated. On any parse failure we fail OPEN (return the text untouched, total
 * unknown) so a formatting hiccup never blanks a genuine result.
 */
export function clampResults(raw: string, limit: number): { text: string; total: number; revealed: number } {
  let arr: unknown;
  try { arr = JSON.parse(stripFences(raw)); } catch { return { text: raw, total: -1, revealed: -1 }; }
  if (!Array.isArray(arr)) return { text: raw, total: -1, revealed: -1 };
  const total = arr.length;
  if (!Number.isFinite(limit) || total <= limit) {
    return { text: JSON.stringify(arr), total, revealed: total };
  }
  const sliced = arr.slice(0, limit);
  return { text: JSON.stringify(sliced), total, revealed: sliced.length };
}

/**
 * Build the prompt for the given call type and run it through the Anthropic
 * Messages API. Returns the joined text on success, or a { status, error } the
 * caller can pass straight to NextResponse. The caller owns all gating (auth,
 * Turnstile, quota) and any post-processing (e.g. the public preview clamp).
 */
export async function runJournoAI(
  type: string,
  data: Record<string, unknown>,
): Promise<{ ok: true; result: string } | { ok: false; status: number; error: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, status: 500, error: "ANTHROPIC_API_KEY not set in environment." };

  let prompt: string;
  switch (type) {
    case "partner-suggestions": prompt = buildJournalistPrompt(data); break; // journalist suggestions
    case "email-writer":        prompt = buildAnglePrompt(data);      break; // tailored angle
    case "campaign-brief":      prompt = buildMediaPlanPrompt(data);  break; // media targeting brief
    default:
      return { ok: false, status: 400, error: `Unknown type: ${type}` };
  }

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: type === "partner-suggestions" ? 3000 : 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return { ok: false, status: res.status, error: err?.error?.message || `Anthropic API error ${res.status}` };
    }

    const json = (await res.json()) as { content?: Array<{ type: string; text: string }> };
    const result = (json.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return { ok: true, result };
  } catch (e) {
    console.error("[journo-ai] runJournoAI error:", e);
    return { ok: false, status: 500, error: "Internal server error." };
  }
}
