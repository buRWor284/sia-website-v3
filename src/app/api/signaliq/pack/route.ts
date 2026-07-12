/**
 * /api/signaliq/pack
 *
 * Generates a newsjacking asset pack for one opportunity. The Anthropic call
 * and pack assembly are shared with /api/emostool/signaliq/pack via
 * lib/signaliq/route-core.ts (P6) — this file is only the public guard
 * (Turnstile + unified quota) around it.
 *
 * Requires ANTHROPIC_API_KEY. Optional: SIGNALIQ_MODEL, TURNSTILE_SECRET_KEY.
 * POST body: { opportunity, store?, companyContext?, turnstileToken? }
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { consumeQuota } from "@/lib/gate/quota";
import { clientIp } from "@/lib/public-tool-guard";
import { coerceOpportunity, runPackRequest } from "@/lib/signaliq/route-core";
import type { AssetPack, UsageTier } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Sonnet pack generation was measured at ~27-30s live, right at the old 30s
// ceiling (504 risk). Give it headroom.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const opp = coerceOpportunity(raw.opportunity);
  if (!opp) {
    return NextResponse.json({ error: "Missing or invalid opportunity." }, { status: 400 });
  }
  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, 500) : undefined;

  const ip = clientIp(req);
  const token = typeof raw.turnstileToken === "string" ? raw.turnstileToken : undefined;
  const human = await verifyTurnstile(token, ip, req.headers.get("x-turnstile-bypass"));
  if (!human) {
    return NextResponse.json({ error: "Verification failed. Please retry." }, { status: 403 });
  }

  // Unified quota (P2): identity-keyed, DB-backed, shared across serverless
  // instances. consumeQuota's getPublicTier honors the sia_sub wristband AND the
  // legacy pp_tier cookie during the P1 grace period. Metered → fail-open-with-logging.
  const quota = await consumeQuota(req, "signaliq-pack");
  const tier: UsageTier = quota.tier;
  if (!quota.ok) {
    return NextResponse.json(
      {
        error: tier === "email"
          ? "You've used all your asset packs this month."
          : "You've used your free asset pack this month. Add your email for more.",
        usage: { remaining: 0, tier },
      },
      { status: 429 },
    );
  }

  const result = await runPackRequest(opp, companyContext);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const pack: AssetPack = { ...result.pack, usage: { remaining: quota.remaining, tier } };
  return NextResponse.json(pack);
}
