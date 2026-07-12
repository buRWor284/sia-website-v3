/**
 * /api/signaliq/pack
 *
 * Generates a newsjacking asset pack for one opportunity via a single
 * structured tool-use call to the Anthropic Messages API (direct fetch, no SDK
 * — mirrors /api/collab-ai and /api/pitch-score). The opportunity is re-sent in
 * the body so generation stays stateless (no DB in MVP).
 *
 * Requires ANTHROPIC_API_KEY. Optional: SIGNALIQ_MODEL, TURNSTILE_SECRET_KEY.
 * POST body: { opportunity, store?, turnstileToken? }
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { consumeQuota } from "@/lib/gate/quota";
import { clientIp } from "@/lib/public-tool-guard";
import { SIGNALIQ_MODEL } from "@/lib/signaliq/config";
import {
  PACK_SYSTEM,
  PACK_TOOL,
  assembleSources,
  buildPackPrompt,
  buildSignalChart,
  parsePackResult,
} from "@/lib/signaliq/assetPrompt";
import { logPack } from "@/lib/signaliq/log";
import type { AssetPack, Opportunity, UsageTier } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Sonnet pack generation was measured at ~27-30s live, right at the old 30s
// ceiling (504 risk). Give it headroom.
export const maxDuration = 60;

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

function coerceOpportunity(v: unknown): Opportunity | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Partial<Opportunity>;
  if (!o.id || !o.topic || !Array.isArray(o.signals)) return null;
  return o as Opportunity;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in environment." }, { status: 500 });
  }

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
  // instances. This also migrates pack OFF the raw pp_tier check onto the unified
  // gate seam — consumeQuota's getPublicTier honors the sia_sub wristband AND the
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

  let content: Array<{ type: string; name?: string; input?: unknown }>;
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: SIGNALIQ_MODEL,
        max_tokens: 1600,
        temperature: 0.4,
        system: PACK_SYSTEM,
        tools: [PACK_TOOL],
        tool_choice: { type: "tool", name: PACK_TOOL.name },
        messages: [{ role: "user", content: buildPackPrompt(opp, companyContext) }],
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return NextResponse.json({ error: err?.error?.message || `Anthropic API error ${res.status}` }, { status: res.status });
    }

    const json = (await res.json()) as { content?: Array<{ type: string; name?: string; input?: unknown }> };
    content = json.content ?? [];
  } catch (e) {
    console.error("signaliq pack route error:", e);
    return NextResponse.json({ error: "Internal server error generating the pack." }, { status: 500 });
  }

  const ai = parsePackResult(content);
  if (!ai.brief && !ai.angle) {
    return NextResponse.json({ error: "Could not generate a pack. Please try again." }, { status: 502 });
  }

  const pack: AssetPack = {
    ...ai,
    opportunityId: opp.id,
    chart: buildSignalChart(opp),
    sources: assembleSources(opp),
    usage: { remaining: quota.remaining, tier },
  };

  logPack(opp);
  return NextResponse.json(pack);
}
