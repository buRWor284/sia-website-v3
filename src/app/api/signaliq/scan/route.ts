/**
 * /api/signaliq/scan
 *
 * Returns ranked newsjacking opportunities for a beat. Scanning hits free,
 * no-key open data sources — metered via the unified quota service (Phase P2:
 * consumeQuota, identity-keyed + DB-backed) and protected by Turnstile. If the
 * caller supplies `companyContext`, one LLM call tailors the seeds + relevance
 * scoring to that company (optional here; always on in the EMOS platform).
 *
 * P6: request handling shared with /api/emostool/signaliq/scan via
 * lib/signaliq/route-core.ts — this file is only the public guard (Turnstile +
 * quota) around it.
 *
 * POST body: { beats?: BeatId[] (1–3, primary first), beat?: BeatId (legacy,
 * mapped to [beat]), companyContext?, turnstileToken? }  (see src/lib/signaliq/types.ts)
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { consumeQuota } from "@/lib/gate/quota";
import { clientIp } from "@/lib/public-tool-guard";
import { parseBeats, runScanRequest } from "@/lib/signaliq/route-core";
import type { ScanResponse, UsageTier } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // extra headroom when a company profile is expanded

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
  // cap. DB-backed and shared across serverless instances. Metered → fail-open-with-logging.
  const quota = await consumeQuota(req, "signaliq-scan");
  const tier: UsageTier = quota.tier;
  if (!quota.ok) {
    // P4: an email subscriber out of quota is the strongest upgrade signal —
    // point them at the paid rung instead of a 30-day dead end. `upgrade: true`
    // tells the shared core to render the EMOS platform CTA (public shell only;
    // the dashboard route never sets it).
    return NextResponse.json(
      {
        error: tier === "email"
          ? "You've used all your scans this month. EMOS platform members scan without limits."
          : "You've used your free scans this month. Add your email for more.",
        usage: { remaining: 0, tier },
        ...(tier === "email" ? { upgrade: true } : {}),
      },
      { status: 429 },
    );
  }

  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, 600) : undefined;

  try {
    const core = await runScanRequest(beats, companyContext);
    const body: ScanResponse = { ...core, usage: { remaining: quota.remaining, tier } };
    return NextResponse.json(body);
  } catch (e) {
    console.error("signaliq scan route error:", e);
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
