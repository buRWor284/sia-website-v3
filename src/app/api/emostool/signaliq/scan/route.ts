/**
 * /api/emostool/signaliq/scan
 *
 * Authenticated version of the SignalIQ scan — no rate limit, no Turnstile.
 * Requires a valid Clerk session (platform users only).
 *
 * POST body: { beat: BeatId }
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { scanBeat } from "@/lib/signaliq/scan";
import { logScan } from "@/lib/signaliq/log";
import type { BeatId, ScanResponse } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";
const BEATS_OK: BeatId[] = ["saas", "fintech", "health", "climate", "ai", "cybersecurity"];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (userId !== ALLOWED_USER_ID) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const beat = String(raw.beat) as BeatId;
  if (!BEATS_OK.includes(beat)) {
    return NextResponse.json({ error: "Unknown beat." }, { status: 400 });
  }

  try {
    const { opportunities, partial, notes } = await scanBeat(beat);
    logScan(beat, opportunities.length);
    const body: ScanResponse = {
      beat,
      generatedAt: new Date().toISOString(),
      opportunities,
      // Platform users have unlimited scans
      usage: { remaining: 999, tier: "email" },
      partial,
      notes,
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error("emostool signaliq scan route error:", e);
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
