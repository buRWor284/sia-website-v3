/**
 * /api/emostool/signaliq/pack
 *
 * Authenticated version of the SignalIQ asset pack generator.
 * No Turnstile, no rate limit — Clerk auth only.
 *
 * POST body: { opportunity, companyContext? }
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { SIGNALIQ_MODEL } from "@/lib/signaliq/config";
import {
  PACK_SYSTEM,
  PACK_TOOL,
  assembleSources,
  buildPackPrompt,
  buildSignalChart,
  parsePackResult,
} from "@/lib/signaliq/assetPrompt";
import type { AssetPack, Opportunity } from "@/lib/signaliq/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

function coerceOpportunity(v: unknown): Opportunity | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (!o.id || !Array.isArray(o.signals)) return null;
  return o as unknown as Opportunity;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (userId !== ALLOWED_USER_ID) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set." }, { status: 500 });

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const opp = coerceOpportunity(raw.opportunity);
  if (!opp) return NextResponse.json({ error: "Missing or invalid opportunity." }, { status: 400 });

  const companyContext = typeof raw.companyContext === "string" ? raw.companyContext.slice(0, 500) : undefined;

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
    console.error("emostool signaliq pack error:", e);
    return NextResponse.json({ error: "Internal error generating the pack." }, { status: 500 });
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
    usage: { remaining: 999, tier: "email" },
  };

  return NextResponse.json(pack);
}
