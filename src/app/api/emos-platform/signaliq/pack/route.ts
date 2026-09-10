/**
 * /api/emos-platform/signaliq/pack
 *
 * Authenticated version of the SignalIQ asset pack generator.
 * Gated by the shared EMOS guard (access + subscription + rate limit).
 *
 * P6: the Anthropic call and pack assembly are shared with /api/signaliq/pack
 * via lib/signaliq/route-core.ts — this file is only the EMOS guard around it.
 * P6 also raised maxDuration 30→60: packs measure 27–30s live, so the old
 * copy-pasted 30s ceiling was a latent 504 for platform users.
 *
 * POST body: { opportunity, companyContext?, companyId?, beatLabel? }
 *
 * 2026-09-09 (state layer phase 2): the generated pack is now PERSISTED to
 * signaliq_asset_packs before it is returned. This route previously had no
 * Supabase import at all, so an Opus call's entire output lived only in the
 * browser tab that requested it.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { getApprovedBrief } from "@/lib/company-brief";
import { coerceOpportunity, runPackRequest } from "@/lib/signaliq/route-core";
import { COMPANY_CONTEXT_MAX } from "@/lib/company-types";
import { withAiUsage } from "@/lib/ai-usage";
import { saveAssetPackForUser } from "@/lib/signaliq/save-pack";
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

  // Was slice(0, 500) while a saved company description holds up to 600, so
  // the last 100 characters silently never reached the pack (fixed 2026-09-10).
  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, COMPANY_CONTEXT_MAX) : undefined;
  const companyId = typeof raw.companyId === "string" ? raw.companyId : null;
  const beatLabel = typeof raw.beatLabel === "string" ? raw.beatLabel.slice(0, 120) : null;

  const companyBrief = await getApprovedBrief(guard.userId, companyId);
  const result = await withAiUsage({ surface: "platform", clerkUserId: guard.userId }, () =>
    runPackRequest(opp, companyContext, companyBrief),
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const pack: AssetPack = { ...result.pack, usage: { remaining: 999, tier: "email" } };

  // AWAITED, not fire-and-forget. This is the write the whole change exists
  // for, it is a single insert against a call that already took ~30s, and a
  // `void save()` here would be the same latent race as the 13 Jul logPitch
  // bug. A failed save is logged and never blocks the response — the customer
  // still gets the pack they paid an Opus call for.
  const savedId = await saveAssetPackForUser(guard.userId, pack, opp, { companyId, beatLabel });

  return NextResponse.json({ ...pack, savedPackId: savedId });
}
