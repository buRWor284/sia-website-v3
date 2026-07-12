/**
 * /api/signaliq/scan
 *
 * Returns ranked newsjacking opportunities for a beat. Scanning hits free,
 * no-key open data sources — metered via the unified quota service (Phase P2:
 * consumeQuota, identity-keyed + DB-backed) and protected by Turnstile. If the
 * caller supplies `companyContext`, one LLM call tailors the seeds + relevance
 * scoring to that company (optional here; always on in the EMOS platform).
 *
 * POST body: { beats?: BeatId[] (1–3, primary first), beat?: BeatId (legacy,
 * mapped to [beat]), companyContext?, turnstileToken? }  (see src/lib/signaliq/types.ts)
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { consumeQuota } from "@/lib/gate/quota";
import { clientIp } from "@/lib/public-tool-guard";
import { scanBeat } from "@/lib/signaliq/scan";
import { logScan } from "@/lib/signaliq/log";
import type { BeatId, ScanResponse, UsageTier } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // extra headroom when a company profile is expanded

const BEATS_OK: BeatId[] = ["saas", "fintech", "health", "climate", "ai", "cybersecurity", "agency"];

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

  // Unified quota (P2): keyed by subscriber identity when the signed sia_sub
  // wristband is present (counts follow the user across devices/IPs), else by
  // spoof-resistant IP. Email tier (wristband OR legacy pp_tier grace) raises the
  // cap. Now DB-backed and shared across serverless instances (the old in-memory
  // limiter enforced nothing across instances). Metered → fail-open-with-logging.
  const quota = await consumeQuota(req, "signaliq-scan");
  const tier: UsageTier = quota.tier;
  if (!quota.ok) {
    return NextResponse.json(
      {
        error: tier === "email"
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
      usage: { remaining: quota.remaining, tier },
      partial,
      notes,
    };

    return NextResponse.json(body);
  } catch (e) {
    console.error("signaliq scan route error:", e);
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
