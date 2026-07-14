/**
 * /api/pitch-score
 *
 * PressIQ — scores a PR pitch (PUBLIC surface). Turnstile + unified quota guard.
 * The scoring logic itself lives in the shared `lib/pitch/route-core.ts` (Phase
 * P6) so the public and dashboard routes can never drift; this file owns only
 * the public guard (human check + monthly quota) and its own `usage` block.
 *
 * Requires ANTHROPIC_API_KEY. Optional: PITCH_SCORE_MODEL, TURNSTILE_SECRET_KEY.
 * POST body: PitchInput (see src/lib/pitch/types.ts).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { consumeQuota } from "@/lib/gate/quota";
import { EMAIL_LIMIT } from "@/lib/pitch/config";
import { parsePitchInput, runScoreRequest } from "@/lib/pitch/route-core";
import { logPitch } from "@/lib/pitch/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Scoring runs 30-60s live (see the tool's loader copy) — 60s ceiling on both
// surfaces (this route previously declared none; the dashboard twin was on 30).
export const maxDuration = 60;

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

export async function POST(req: NextRequest) {
  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parsePitchInput(raw, { withTurnstile: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const input = parsed.input;

  const ip = clientIp(req);

  // Bot protection (no-op in dev if TURNSTILE_SECRET_KEY unset).
  const human = await verifyTurnstile(input.turnstileToken, ip, req.headers.get("x-turnstile-bypass"));
  if (!human) {
    return NextResponse.json({ error: "Verification failed. Please retry." }, { status: 403 });
  }

  // Quota: the unified service (Phase P2) keys by subscriber identity when the
  // signed sia_sub wristband is present (counts follow the user across devices),
  // else by spoof-resistant IP. Email tier (wristband OR legacy pp_tier grace)
  // raises the cap. Metered/free action → fail-open-with-logging on a DB outage.
  const quota = await consumeQuota(req, "pressiq-score");
  const usageTier = quota.tier;
  if (!quota.ok) {
    // P4: an email subscriber out of quota is the strongest upgrade signal —
    // `upgrade: true` makes the shared core render the EMOS platform CTA
    // (public shell only; the dashboard route never sets it).
    return NextResponse.json(
      {
        error: usageTier === "email"
          ? "You've used all your scores this month. EMOS platform members score without limits."
          : `You've used your ${quota.limit} free scores this month. Add your email for ${EMAIL_LIMIT}/month.`,
        usage: { remaining: 0, tier: usageTier },
        ...(usageTier === "email" ? { upgrade: true } : {}),
      },
      { status: 429 },
    );
  }

  const run = await runScoreRequest(input, { remaining: quota.remaining, tier: usageTier });
  if (!run.ok) return NextResponse.json({ error: run.error }, { status: run.status });

  // Flywheel — pass the Clerk user ID if a session is present so the score is
  // org-scoped. MUST be awaited: a fire-and-forget insert is dropped when the
  // serverless function is frozen right after the response is sent (logPitch is
  // internally try/caught, so awaiting can never break the response).
  const { userId: clerkUserId } = await auth();
  await logPitch(input, run.result, clerkUserId ?? undefined);

  return NextResponse.json(run.result);
}
