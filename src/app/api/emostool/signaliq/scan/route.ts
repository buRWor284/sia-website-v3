/**
 * /api/emostool/signaliq/scan
 *
 * Authenticated version of the SignalIQ scan — no rate limit, no Turnstile.
 * Requires a valid Clerk session (platform users only).
 *
 * POST body: { beats?: BeatId[] (1–3, primary first), beat?: BeatId (legacy) }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { scanBeat } from "@/lib/signaliq/scan";
import { logScan } from "@/lib/signaliq/log";
import type { BeatId, ScanResponse } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // extra headroom for the company-profile expansion call

const BEATS_OK: BeatId[] = ["saas", "fintech", "health", "climate", "ai", "cybersecurity"];

/**
 * Prefer the new `beats` array (1–3, primary first); fall back to the legacy
 * single `beat`. Validated, deduped, order-preserving, capped at 3.
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

  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, 600) : undefined;

  try {
    const { opportunities, partial, notes, beats: scanned } = await scanBeat(beats, { companyContext });
    logScan(scanned.join("+"), opportunities.length);
    const body: ScanResponse = {
      beat: scanned[0],
      beats: scanned,
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
