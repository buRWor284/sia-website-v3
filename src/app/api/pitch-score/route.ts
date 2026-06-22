/**
 * /api/pitch-score
 *
 * PressIQ — scores a PR pitch. Mirrors the repo's /api/collab-ai pattern
 * (direct fetch to the Anthropic Messages API, no SDK). One structured tool-use call
 * scores Relevance + the 32-point checklist + the three EMOS dimensions; Layer-1
 * metrics are computed deterministically server-side.
 *
 * Requires ANTHROPIC_API_KEY in .env.local.  Optional: PITCH_SCORE_MODEL, TURNSTILE_SECRET_KEY.
 * POST body: PitchInput (see src/lib/pitch/types.ts).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { verifyTurnstile } from "@/lib/turnstile";
import { EMAIL_LIMIT, FREE_LIMIT, PITCH_MODEL } from "@/lib/pitch/config";
import { computeMetrics, resolveSubject, scoreLayer1 } from "@/lib/pitch/metrics";
import { buildUserPrompt, parseAiResult, SCORE_TOOL, SYSTEM_PROMPT } from "@/lib/pitch/scorePrompt";
import { composeScore } from "@/lib/pitch/composite";
import { logPitch } from "@/lib/pitch/log";
import type { BrandSignals, PitchInput } from "@/lib/pitch/types";
import { EMPTY_BRAND } from "@/lib/pitch/types";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_PITCH_CHARS = 8000;

function clientIp(req: NextRequest): string {
  // On Vercel, x-real-ip is set by the platform to the true client IP and cannot be
  // spoofed by the caller. Prefer it; fall back to the LAST x-forwarded-for hop (the
  // one the platform appends), never the client-controllable first entry.
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

function coerceBrand(v: unknown): BrandSignals {
  const o = (typeof v === "object" && v ? v : {}) as Record<string, unknown>;
  return {
    website: !!o.website,
    bylines: !!o.bylines,
    youtube: !!o.youtube,
    speaking: !!o.speaking,
    caseStudies: !!o.caseStudies,
    linkedin: !!o.linkedin,
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in environment." }, { status: 500 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const pitch = typeof raw.pitch === "string" ? raw.pitch : "";
  if (!pitch.trim() || pitch.trim().length < 40) {
    return NextResponse.json({ error: "Paste a pitch of at least a few sentences to score it." }, { status: 400 });
  }
  if (pitch.length > MAX_PITCH_CHARS) {
    return NextResponse.json({ error: "That pitch is too long to score. Keep it under 8,000 characters (about 1,300 words)." }, { status: 400 });
  }

  const input: PitchInput = {
    pitch,
    query: typeof raw.query === "string" ? raw.query : undefined,
    subject: typeof raw.subject === "string" ? raw.subject : undefined,
    platform: (["haro", "qwoted", "sos", "featured", "b2bwriter"].includes(String(raw.platform))
      ? raw.platform
      : "haro") as PitchInput["platform"],
    brandSignals: raw.brandSignals ? coerceBrand(raw.brandSignals) : EMPTY_BRAND,
    store: raw.store !== false,
    pitchMode: raw.pitchMode === "query" ? "query" : "standalone",
    turnstileToken: typeof raw.turnstileToken === "string" ? raw.turnstileToken : undefined,
  };

  const ip = clientIp(req);

  // Bot protection (no-op in dev if TURNSTILE_SECRET_KEY unset).
  const human = await verifyTurnstile(input.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ error: "Verification failed. Please retry." }, { status: 403 });
  }

  // Gating: email tier (cookie set after newsletter unlock) raises the cap.
  const isEmailTier = req.cookies.get("pp_tier")?.value === "email";
  const limit = isEmailTier ? EMAIL_LIMIT : FREE_LIMIT;
  const usageTier: "anonymous" | "email" = isEmailTier ? "email" : "anonymous";
  const rl = await rateLimitDb(`pitch:${ip}`, { limit, windowMs: MONTH_MS });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: isEmailTier
          ? "You've used all your scores this month. They reset on a rolling 30-day window."
          : "You've used your 3 free scores this month. Add your email for 10/month.",
        usage: { remaining: 0, tier: usageTier },
      },
      { status: 429 },
    );
  }

  // Layer 1 — deterministic.
  const subject = resolveSubject(input.pitch, input.subject);
  const metrics = computeMetrics(input.pitch, subject);
  const l1 = scoreLayer1(metrics);

  // Layers 2-3 + Relevance — one structured AI call.
  let aiContent: Array<{ type: string; name?: string; input?: unknown }>;
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: PITCH_MODEL,
        max_tokens: 3500,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        tools: [SCORE_TOOL],
        tool_choice: { type: "tool", name: SCORE_TOOL.name },
        messages: [{ role: "user", content: buildUserPrompt(input, metrics) }],
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return NextResponse.json({ error: err?.error?.message || `Anthropic API error ${res.status}` }, { status: res.status });
    }

    const json = (await res.json()) as { content?: Array<{ type: string; name?: string; input?: unknown }> };
    aiContent = json.content ?? [];
  } catch (e) {
    console.error("pitch-score route error:", e);
    return NextResponse.json({ error: "Internal server error scoring the pitch." }, { status: 500 });
  }

  let result;
  try {
    const ai = parseAiResult(aiContent);
    result = composeScore(l1, ai, {
      hasQuery: Boolean(input.query?.trim()),
      usage: { remaining: rl.remaining, tier: usageTier },
    });
  } catch (e) {
    console.error("pitch-score parse error:", e);
    return NextResponse.json({ error: "Could not parse the score. Please try again." }, { status: 502 });
  }

  // Flywheel (non-blocking) — pass Clerk user ID if session present so score gets org-scoped.
  const { userId: clerkUserId } = await auth();
  void logPitch(input, result, clerkUserId ?? undefined);

  return NextResponse.json(result);
}
