/**
 * /api/emos-platform/pitch-score
 *
 * PressIQ scoring — DASHBOARD surface. Authenticated (Clerk EMOS guard), no rate
 * limit, no Turnstile, always stores. The scoring logic lives in the shared
 * `lib/pitch/route-core.ts` (Phase P6); this file owns only the Clerk guard and
 * its own unmetered `usage` block.
 *
 * POST body: same shape as /api/pitch-score (PitchInput), minus turnstileToken.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { parsePitchInput, runScoreRequest } from "@/lib/pitch/route-core";
import { logPitch } from "@/lib/pitch/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Match the public route: scoring runs 30-60s live (was silently 30s here — a
// latent 504 on the same model + prompt the public route was already rescued from).
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const guard = await requireEmosAccess({ rateLimitKey: "pitch-score" });
  if (!guard.ok) return guard.res;
  const { userId } = guard;

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parsePitchInput(raw, { forceStore: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  const input = parsed.input;

  // Platform users are unmetered; usage is woven into composeScore for shape parity.
  const run = await runScoreRequest(input, { remaining: 999, tier: "email" });
  if (!run.ok) return NextResponse.json({ error: run.error }, { status: run.status });

  // Always log — platform users are always authenticated. MUST be awaited: a
  // fire-and-forget insert is dropped when the function freezes post-response
  // (this was why Score History was always empty). logPitch never throws.
  await logPitch(input, run.result, userId);

  return NextResponse.json(run.result);
}
