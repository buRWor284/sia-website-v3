/**
 * /api/emostool/signaliq/pack
 *
 * Authenticated version of the SignalIQ asset pack generator.
 * Gated by the shared EMOS guard (access + subscription + rate limit).
 *
 * P6: the Anthropic call and pack assembly are shared with /api/signaliq/pack
 * via lib/signaliq/route-core.ts — this file is only the EMOS guard around it.
 * P6 also raised maxDuration 30→60: packs measure 27–30s live, so the old
 * copy-pasted 30s ceiling was a latent 504 for platform users.
 *
 * POST body: { opportunity, companyContext? }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { coerceOpportunity, runPackRequest } from "@/lib/signaliq/route-core";
import type { AssetPack } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // H6 (2026-07-02 review): previously hardcoded to one test user ID, which
  // returned "Forbidden." for every real customer. Now uses the shared guard.
  const guard = await requireEmosAccess({ rateLimitKey: "signaliq-pack" });
  if (!guard.ok) return guard.res;

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const opp = coerceOpportunity(raw.opportunity);
  if (!opp) return NextResponse.json({ error: "Missing or invalid opportunity." }, { status: 400 });

  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, 500) : undefined;

  const result = await runPackRequest(opp, companyContext);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const pack: AssetPack = { ...result.pack, usage: { remaining: 999, tier: "email" } };
  return NextResponse.json(pack);
}
