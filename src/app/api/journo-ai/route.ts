/**
 * /api/journo-ai  —  JournoCollabIQ (Journalist Beat Matcher), PUBLIC surface.
 *
 * Turnstile + DB-backed per-IP rate limit + per-identity monthly PREVIEW quota
 * (on the journalist search only) + server-side preview clamp. The prompt
 * builders, the Anthropic call and the clamp itself live in the shared
 * `lib/journo/route-core` (Phase P6) so this route and the dashboard twin can
 * never drift; this file owns only the public guards.
 *
 * Requires ANTHROPIC_API_KEY. Optional: TURNSTILE_SECRET_KEY.
 * POST body: { type: "partner-suggestions" | "email-writer" | "campaign-brief", data: {...}, turnstileToken? }
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimitDb } from "@/lib/rate-limit-db";
import { capToolInput, clientIp } from "@/lib/public-tool-guard";
import { consumeQuota } from "@/lib/gate/quota";
import { PREVIEW_REVEAL } from "@/lib/gate/quota-limits";
import { runJournoAI, clampResults } from "@/lib/journo/route-core";

// Opus generations run 20-40s (esp. the 8-journalist search at max_tokens 3000).
// Without this the platform default could cut a genuine generation short with a
// 504 — the same latent bug the PressIQ routes were hardened against.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_LIMIT = 12; // per IP across all three call types — generous for real use

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
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

  // DB-backed per-IP abuse brake across all three call types (protects the
  // Anthropic budget); stays in place alongside the identity quota below.
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
  // above — only the search is metered. Keyed by the sia_sub wristband when
  // present (counts follow the user across devices), else hardened IP.
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

  const run = await runJournoAI(type, capToolInput(data));
  if (!run.ok) return NextResponse.json({ error: run.error }, { status: run.status });

  // Preview search (P3): withhold the rows beyond the caller's tier reveal cap
  // server-side, and tell the client the tier + how many are held back so it can
  // render the blur/unlock overlay. Anonymous → top 3; subscriber → all.
  if (type === "partner-suggestions") {
    const revealLimit = PREVIEW_REVEAL["jciq-preview"][previewTier];
    const clamped = clampResults(run.result, revealLimit);
    return NextResponse.json({
      result: clamped.text,
      tier: previewTier,
      total: clamped.total,
      revealed: clamped.revealed,
      hidden: clamped.total >= 0 ? Math.max(0, clamped.total - clamped.revealed) : 0,
      usage: { remaining: previewRemaining, tier: previewTier },
    });
  }

  return NextResponse.json({ result: run.result });
}
