/**
 * /api/signaliq/scan
 *
 * Returns ranked newsjacking opportunities for a beat. Scanning hits free,
 * no-key open data sources (no LLM), so it's cheap — gated only to deter abuse,
 * reusing the repo's rateLimit + Turnstile and the shared `pp_tier` email cookie.
 *
 * POST body: { beat, turnstileToken? }   (see src/lib/signaliq/types.ts)
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { EMAIL_SCANS, FREE_SCANS } from "@/lib/signaliq/config";
import { scanBeat } from "@/lib/signaliq/scan";
import { logScan } from "@/lib/signaliq/log";
import type { BeatId, ScanResponse, UsageTier } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const BEATS_OK: BeatId[] = ["saas", "fintech", "health", "climate", "ai"];

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
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

  const ip = clientIp(req);
  const token = typeof raw.turnstileToken === "string" ? raw.turnstileToken : undefined;
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    return NextResponse.json({ error: "Verification failed. Please retry." }, { status: 403 });
  }

  const isEmail = req.cookies.get("pp_tier")?.value === "email";
  const limit = isEmail ? EMAIL_SCANS : FREE_SCANS;
  const tier: UsageTier = isEmail ? "email" : "anonymous";
  const rl = rateLimit(`signaliq-scan:${ip}`, { limit, windowMs: MONTH_MS });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: isEmail
          ? "You've used all your scans this month."
          : "You've used your free scans this month. Add your email for more.",
        usage: { remaining: 0, tier },
      },
      { status: 429 },
    );
  }

  try {
    const { opportunities, partial, notes } = await scanBeat(beat);
    logScan(beat, opportunities.length);
    const body: ScanResponse = {
      beat,
      generatedAt: new Date().toISOString(),
      opportunities,
      usage: { remaining: rl.remaining, tier },
      partial,
      notes,
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error("signaliq scan route error:", e);
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
