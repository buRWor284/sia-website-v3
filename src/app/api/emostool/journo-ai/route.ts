/**
 * /api/emostool/journo-ai
 *
 * Authenticated version of the JournoCollabIQ AI endpoint.
 * Clerk auth only — no email gate, no rate limit.
 *
 * Same request/response shape as /api/journo-ai.
 * POST body: { type: "partner-suggestions" | "email-writer" | "campaign-brief", data: {...} }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";

// Match the public route: Opus generations run 20-40s, so lift the ceiling to
// 60s to avoid a latent 504 cutting a real generation short.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-6";

const ANGLE_LABEL: Record<string, string> = {
  discount:    "Expert commentary — a quotable expert take for a story they're already writing",
  institution: "Exclusive data — original data/research offered as an exclusive or embargo",
  badge:       "Trend reaction — a timely reaction tied to a breaking trend or news hook",
};

function buildJournalistPrompt(d: Record<string, unknown>): string {
  return `You are an expert digital-PR and media-relations strategist who places founders and brands in earned editorial coverage. Your task is to find the JOURNALISTS most likely to cover the story below.

STORY & SOURCE:
- Business / brand: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Beat / topic: ${d.industry || "Not provided"}
- The story / angle being pitched: ${d.audDesc || d.audType || "Not provided"}
- Target tier: ${d.audType || "Not specified"}
- Geography: ${d.geo || "Not provided"}
- What the source is offering: ${ANGLE_LABEL[d.strategy as string] || String(d.strategy || "")}
- Signal / news hook context: ${d.signalContext || "Not provided"}
- Asset being pitched (if applicable): ${d.assetContext || "Not provided"}
- Company / brand background: ${d.companyContext || "Not provided"}

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

function buildAnglePrompt(d: Record<string, unknown>): string {
  return `You are an expert media-relations strategist. Write a tight, tailored PITCH ANGLE for approaching ONE specific journalist. This is the angle plus a starter draft only — the final pitch will be scored separately in PressIQ.

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
1. A one-line ANGLE — why THIS journalist, on THIS beat, would want THIS story now.
2. A short starter pitch (under 150 words): specific subject line, opening that references their beat or recent work, the news hook or data on offer, and a single low-friction ask.

Keep it warm, specific, and non-salesy. End with: "Verify the journalist's name, outlet, and contact before sending — then score the final pitch in PressIQ."

Format:
Angle: [one line]

Subject: [subject line]

[pitch body]`;
}

function buildMediaPlanPrompt(d: Record<string, unknown>): string {
  const beats = Array.isArray(d.selNiches) ? (d.selNiches as string[]).join(", ") : "Not yet selected";
  return `You are a senior digital-PR strategist writing a MEDIA TARGETING BRIEF for a client's outreach campaign.

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
Tier-1 exclusive (48-hour window) → embargo / simultaneous Tier-2 → wider release. Include follow-up cadence.

## Per-Journalist Angles
For the top targets, one line each on the specific angle to lead with.

## Verify Before You Send
Short checklist: confirm journalist still covers the beat, the outlet, and the contact; then score each pitch in PressIQ before sending.

Write in plain, direct prose. Tone: expert consultant. Length: 400–600 words.`;
}

export async function POST(request: NextRequest) {
  const guard = await requireEmosAccess({ rateLimitKey: "journo-ai" });
  if (!guard.ok) return guard.res;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set." }, { status: 500 });

  let body: { type?: string; data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, data } = body;
  if (!type || !data) return NextResponse.json({ error: "Missing type or data." }, { status: 400 });

  let prompt: string;
  switch (type) {
    case "partner-suggestions": prompt = buildJournalistPrompt(data); break;
    case "email-writer":        prompt = buildAnglePrompt(data);      break;
    case "campaign-brief":      prompt = buildMediaPlanPrompt(data);  break;
    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
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
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
      return NextResponse.json({ error: err?.error?.message || `Anthropic API error ${res.status}` }, { status: res.status });
    }

    const json = await res.json() as { content?: Array<{ type: string; text: string }> };
    const result = (json.content ?? [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return NextResponse.json({ result });
  } catch (e) {
    console.error("emostool journo-ai route error:", e);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
