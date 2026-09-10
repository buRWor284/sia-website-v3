/**
 * /api/emos-platform/signaliq/scan
 *
 * Authenticated version of the SignalIQ scan — no public quota, no Turnstile.
 * Requires a valid Clerk session (platform users only).
 *
 * P6: request handling shared with /api/signaliq/scan via
 * lib/signaliq/route-core.ts — this file is only the EMOS guard around it.
 *
 * POST body: { beats?: BeatId[] (1–3, primary first), beat?: BeatId (legacy) }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { getApprovedBrief } from "@/lib/company-brief";
import { parseBeats, runScanRequest } from "@/lib/signaliq/route-core";
import { COMPANY_CONTEXT_MAX } from "@/lib/company-types";
import { withAiUsage } from "@/lib/ai-usage";
import { reserveUsage } from "@/lib/usage-limits";
import type { ScanResponse } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // extra headroom for the company-profile expansion call

export async function POST(req: NextRequest) {
  const guard = await requireEmosAccess({ rateLimitKey: "signaliq-scan" });
  if (!guard.ok) return guard.res;

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const beats = parseBeats(raw);
  if (beats.length === 0) {
    return NextResponse.json({ error: "Unknown or missing beat." }, { status: 400 });
  }

  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, COMPANY_CONTEXT_MAX) : undefined;

  // The active company's approved brief, if any. Null = today's behaviour.
  const companyBrief = await getApprovedBrief(guard.userId);

  const seat = await reserveUsage(guard, "scan");
  if (!seat.ok) return seat.res;

  try {
    const core = await withAiUsage({ surface: "platform", clerkUserId: guard.userId }, () =>
      runScanRequest(beats, companyContext, companyBrief),
    );
    const body: ScanResponse = {
      ...core,
      // Monthly allowance left after this scan (999 = not counted, e.g. admin).
      usage: { remaining: seat.remaining ?? 999, tier: "email" },
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error("emostool signaliq scan route error:", e);
    await seat.release();
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
