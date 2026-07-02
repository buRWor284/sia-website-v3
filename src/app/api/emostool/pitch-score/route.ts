/**
 * /api/emostool/pitch-score
 *
 * Authenticated version of PressIQ scoring — no rate limit, no Turnstile.
 * Requires a valid Clerk session. Always stores the score.
 *
 * POST body: same shape as /api/pitch-score (PitchInput), minus turnstileToken.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { PITCH_MODEL } from "@/lib/pitch/config";
import { computeMetrics, resolveSubject, scoreLayer1 } from "@/lib/pitch/metrics";
import { buildUserPrompt, parseAiResult, SCORE_TOOL, SYSTEM_PROMPT } from "@/lib/pitch/scorePrompt";
import { composeScore } from "@/lib/pitch/composite";
import { logPitch } from "@/lib/pitch/log";
import { EMPTY_BRAND, type BrandSignals, type PitchInput } from "@/lib/pitch/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MAX_PITCH_CHARS = 8000;

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
  const guard = await requireEmosAccess({ rateLimitKey: "pitch-score" });
  if (!guard.ok) return guard.res;
  const { userId } = guard;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 500 });

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
    return NextResponse.json({ error: "That pitch is too long — keep it under ~1,000 words." }, { status: 400 });
  }

  const input: PitchInput = {
    pitch,
    query: typeof raw.query === "string" ? raw.query : undefined,
    subject: typeof raw.subject === "string" ? raw.subject : undefined,
    platform: (["haro", "qwoted", "sos", "featured", "b2bwriter"].includes(String(raw.platform))
      ? raw.platform : "haro") as PitchInput["platform"],
    brandSignals: raw.brandSignals ? coerceBrand(raw.brandSignals) : EMPTY_BRAND,
    store: true, // always store on platform
    pitchMode: raw.pitchMode === "query" ? "query" : "standalone",
  };

  // Layer 1 — deterministic
  const subject = resolveSubject(input.pitch, input.subject);
  const metrics = computeMetrics(input.pitch, subject);
  const l1 = scoreLayer1(metrics);

  // Layers 2–3 + Relevance — AI call
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
    console.error("emostool pitch-score route error:", e);
    return NextResponse.json({ error: "Internal error scoring the pitch." }, { status: 500 });
  }

  let result;
  try {
    const ai = parseAiResult(aiContent);
    result = composeScore(l1, ai, {
      hasQuery: Boolean(input.query?.trim()),
      usage: { remaining: 999, tier: "email" },
    });
  } catch (e) {
    console.error("emostool pitch-score parse error:", e);
    return NextResponse.json({ error: "Could not parse the score. Please try again." }, { status: 502 });
  }

  // Always log — platform users always authenticated
  void logPitch(input, result, userId);

  return NextResponse.json(result);
}
