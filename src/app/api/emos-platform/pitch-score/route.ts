/**
 * /api/emos-platform/pitch-score
 *
 * PressIQ scoring — DASHBOARD surface. Authenticated (Clerk EMOS guard), no
 * Turnstile, always stores, counted against the monthly allowance (200 scores).
 * The scoring logic lives in the shared `lib/pitch/route-core.ts` (Phase P6);
 * this file owns the Clerk guard and the allowance.
 *
 * POST body: same shape as /api/pitch-score (PitchInput), minus turnstileToken.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { parsePitchInput, runScoreRequest } from "@/lib/pitch/route-core";
import { logPitch } from "@/lib/pitch/log";
import { withAiUsage } from "@/lib/ai-usage";
import { reserveUsage } from "@/lib/usage-limits";

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

  // Monthly allowance (2026-09-10; was unmetered). Reserved before the call,
  // handed back if it fails. `usage` is woven into composeScore for shape parity.
  const seat = await reserveUsage(guard, "score");
  if (!seat.ok) return seat.res;
  const run = await withAiUsage({ surface: "platform", clerkUserId: userId }, () =>
    runScoreRequest(input, { remaining: seat.remaining ?? 999, tier: "email" }),
  );
  if (!run.ok) {
    await seat.release();
    return NextResponse.json({ error: run.error }, { status: run.status });
  }

  // 2026-09-09 (state layer): carry who and what this pitch was for. Read off
  // the raw body rather than PitchInput — these are dashboard-only context, not
  // part of the scoring input the public route shares.
  const context = {
    journalistId: typeof raw.journalistId === "string" ? raw.journalistId : null,
    assetId:      typeof raw.assetId      === "string" ? raw.assetId      : null,
    companyId:    typeof raw.companyId    === "string" ? raw.companyId    : null,
  };

  // Always log — platform users are always authenticated. MUST be awaited: a
  // fire-and-forget insert is dropped when the function freezes post-response
  // (this was why Score History was always empty). logPitch never throws.
  await logPitch(input, run.result, userId, context);

  return NextResponse.json(run.result);
}
