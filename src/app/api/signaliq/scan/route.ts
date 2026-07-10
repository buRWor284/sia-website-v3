/**
 * /api/signaliq/scan
 *
 * Returns ranked newsjacking opportunities for a beat. Scanning hits free,
 * no-key open data sources — gated to deter abuse, reusing the repo's
 * rateLimit + Turnstile and the shared `pp_tier` email cookie. If the caller
 * supplies `companyContext`, one LLM call tailors the seeds + relevance scoring
 * to that company (optional here; always on in the EMOS platform).
 *
 * POST body: { beats?: BeatId[] (1–3, primary first), beat?: BeatId (legacy,
 * mapped to [beat]), companyContext?, turnstileToken? }  (see src/lib/signaliq/types.ts)
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { verifyTier } from "@/lib/pitch/tier-cookie";
import { EMAIL_SCANS, FREE_SCANS } from "@/lib/signaliq/config";
import { scanBeat } from "@/lib/signaliq/scan";
import { logScan } from "@/lib/signaliq/log";
import type { BeatId, ScanResponse, UsageTier } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // extra headroom when a company profile is expanded

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const BEATS_OK: BeatId[] = ["saas", "fintech", "health", "climate", "ai", "cybersecurity"];

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Parse the beat selection: prefer the new `beats` array (1–3, primary first),
 * fall back to the legacy single `beat` field (mapped to [beat]) so the EMOS
 * surface and any cached clients keep working mid-deploy. Validated against
 * BEATS_OK, deduped, order-preserving, capped at 3.
 */
function parseBeats(raw: Record<string, unknown>): BeatId[] {
  const collected: unknown[] = Array.isArray(raw.beats)
    ? raw.beats
    : raw.beat !== undefined
      ? [raw.beat]
      : [];
  const seen = new Set<string>();
  const out: BeatId[] = [];
  for (const v of collected) {
    const b = String(v) as BeatId;
    if (!BEATS_OK.includes(b) || seen.has(b)) continue;
    seen.add(b);
    out.push(b);
    if (out.length >= 3) break;
  }
  return out;
}

export async function POST(req: NextRequest) {
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

  const ip = clientIp(req);
  const token = typeof raw.turnstileToken === "string" ? raw.turnstileToken : undefined;
  const human = await verifyTurnstile(token, ip, req.headers.get("x-turnstile-bypass"));
  if (!human) {
    return NextResponse.json({ error: "Verification failed. Please retry." }, { status: 403 });
  }

  // H7 (2026-07-02 review): verify the HMAC-signed cookie (same helper as
  // PressIQ) instead of comparing the raw value, which anyone could hand-set.
  const isEmail = verifyTier(req.cookies.get("pp_tier")?.value) === "email";
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

  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, 600) : undefined;

  try {
    const { opportunities, partial, notes, beats: scanned } = await scanBeat(beats, { companyContext });
    logScan(scanned.join("+"), opportunities.length);
    const body: ScanResponse = {
      beat: scanned[0],   // legacy field = primary beat
      beats: scanned,
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
