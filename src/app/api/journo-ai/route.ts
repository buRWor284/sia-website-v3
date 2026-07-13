/**
 * /api/journo-ai  —  JournoCollabIQ (Journalist Beat Matcher)
 *
 * Calls the Anthropic Messages API directly via fetch — no SDK required.
 * Requires ANTHROPIC_API_KEY in .env.local
 *
 * POST body: { type: "partner-suggestions" | "email-writer" | "campaign-brief", data: {...} }
 *   (request-type keys are kept identical to the CollabIQ clone so the wizard keeps working;
 *    they now mean: journalist-suggestions | angle-writer | media-plan.)
 *
 * v1 generates journalists from the model's knowledge and asks for a recent article per name
 * (to be VERIFIED in the UI). v2 grounds this in LIVE coverage via the SignalIQ GDELT layer —
 * real recent articles → real current bylines. See JournoCollabIQ-Retargeting-Plan.md.
 *
 * Abuse protection (H1, 2026-07-02 review): Turnstile + DB-backed IP rate
 * limit + per-field char caps — same pattern as /api/pitch-score. This route
 * previously had none and calls Opus, so a bot loop could drain the
 * Anthropic budget.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { capToolInput, clientIp } from "@/lib/public-tool-guard";
import { consumeQuota } from "@/lib/gate/quota";
import { PREVIEW_REVEAL } from "@/lib/gate/quota-limits";

// Opus generations run 20-40s (esp. the 8-journalist search at max_tokens 3000).
// Without this the platform default could cut a genuine generation short with a
// 504 — the same latent bug the PressIQ routes were hardened against.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-6";
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_LIMIT = 12; // per IP across all three call types — generous for real use

// Angle types. Internal keys are inherited from the clone (discount/institution/badge).
const ANGLE_LABEL: Record<string, string> = {
  discount: "Expert commentary — a quotable expert take for a story they're already writing",
  institution: "Exclusive data — original data/research offered as an exclusive or embargo",
  badge: "Trend reaction — a timely reaction tied to a breaking trend or news hook",
};

// ─────────────────────────────────────────────────────────────
// Prompt builders
// ─────────────────────────────────────────────────────────────

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
- What the source is offering: ${ANGLE_LABEL[d.strategy as string] || String(d.strategy)}

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
  return `You are an expert media-relations strategist. Write a tight, tailored PITCH ANGLE for approaching ONE specific journalist. This is the angle plus a starter draft only — the final pitch will be scored separately in PressIQ, so do not over-polish or pad.

SOURCE:
- Business: ${d.biz || "Not provided"}
- Website: ${d.domain || "Not provided"}
- What they do: ${d.desc || "Not provided"}
- Beat / topic: ${d.industry || "Not provided"}
- The story being pitched: ${d.audDesc || "Not provided"}
- What the source is offering: ${ANGLE_LABEL[d.strategy as string] || String(d.strategy)}
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

function buildMediaPlanPrompt(d: Record<string, unknown>): string {
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
- Offer to journalists: ${d.stratLabel || ANGLE_LABEL[d.strategy as string] || d.strategy}
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

// ─────────────────────────────────────────────────────────────
// Preview-gate helpers (Phase P3, RFP §5)
// ─────────────────────────────────────────────────────────────

/** Strip the markdown code fences the model sometimes wraps JSON in. */
function stripFences(s: string): string {
  return s.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
}

/**
 * Clamp the model's JSON array of journalist matches to `limit` rows for the
 * caller's tier. Anonymous callers receive only their top slice; the withheld
 * rows never leave the server, so there is nothing to scrape from the payload
 * and no fake scarcity — the matches are real, just gated. On any parse failure
 * we fail OPEN (return the text untouched, total unknown) so a formatting hiccup
 * never blanks a genuine result.
 */
function clampResults(raw: string, limit: number): { text: string; total: number; revealed: number } {
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

// ─────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in environment." }, { status: 500 });
  }

  let body: { type?: string; data?: Record<string, unknown>; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, data } = body;
  if (!type || !data || typeof data !== "object") {
    return NextResponse.json({ error: "Missing type or data." }, { status: 400 });
  }

  const ip = clientIp(request);

  // Bot protection (no-op in dev if TURNSTILE_SECRET_KEY unset).
  const human = await verifyTurnstile(
    typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
    ip,
    request.headers.get("x-turnstile-bypass"),
  );
  if (!human) {
    return NextResponse.json({ error: "Verification failed. Please retry." }, { status: 403 });
  }

  // DB-backed rate limit — holds across serverless instances. This is the
  // per-IP abuse brake on ALL three call types (protects the Anthropic budget);
  // it stays in place alongside the identity quota below.
  const rl = await rateLimitDb(`journo-ai:${ip}`, { limit: DAILY_LIMIT, windowMs: DAY_MS });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You've hit today's limit for AI generations on this tool. Try again tomorrow." },
      { status: 429 },
    );
  }

  // P3 (RFP §5): per-identity monthly quota on the PREVIEW SEARCH only
  // (partner-suggestions = the journalist search). The downstream angle-writer /
  // media-plan calls are per-journalist actions and stay on the shared IP brake
  // above — only the search is metered. Keyed by the sia_sub wristband when present
  // (counts follow the user across devices), else hardened IP. Metered →
  // fail-open-with-logging (P2 pattern).
  let previewTier: "anonymous" | "email" = "anonymous";
  let previewRemaining = 0;
  if (type === "partner-suggestions") {
    const quota = await consumeQuota(request, "jciq-preview");
    previewTier = quota.tier;
    previewRemaining = quota.remaining;
    if (!quota.ok) {
      return NextResponse.json(
        {
          error: quota.tier === "email"
            ? "You've used all 30 journalist searches this month. Unlimited runs live in the EMOS platform."
            : "You've used your 3 free journalist searches this month. Add your email for 30 a month, free.",
          usage: { remaining: 0, tier: quota.tier },
        },
        { status: 429 },
      );
    }
  }

  const capped = capToolInput(data);

  let prompt: string;
  switch (type) {
    case "partner-suggestions": prompt = buildJournalistPrompt(capped); break; // journalist suggestions
    case "email-writer":        prompt = buildAnglePrompt(capped);      break; // tailored angle
    case "campaign-brief":      prompt = buildMediaPlanPrompt(capped);  break; // media targeting brief
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
      const msg = err?.error?.message || `Anthropic API error ${res.status}`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const json = await res.json() as { content?: Array<{ type: string; text: string }> };
    const result = (json.content ?? [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    // Preview search (P3): withhold the rows beyond the caller's tier reveal cap
    // server-side, and tell the client the tier + how many are held back so it can
    // render the blur/unlock overlay. Anonymous → top 3; subscriber → all.
    if (type === "partner-suggestions") {
      const revealLimit = PREVIEW_REVEAL["jciq-preview"][previewTier];
      const clamped = clampResults(result, revealLimit);
      return NextResponse.json({
        result: clamped.text,
        tier: previewTier,
        total: clamped.total,
        revealed: clamped.revealed,
        hidden: clamped.total >= 0 ? Math.max(0, clamped.total - clamped.revealed) : 0,
        usage: { remaining: previewRemaining, tier: previewTier },
      });
    }

    return NextResponse.json({ result });
  } catch (e) {
    console.error("journo-ai route error:", e);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
