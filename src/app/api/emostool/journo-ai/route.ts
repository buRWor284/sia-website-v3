/**
 * /api/emostool/journo-ai  —  JournoCollabIQ AI endpoint, DASHBOARD surface.
 *
 * Clerk EMOS guard only — no Turnstile, no quota, no preview clamp. The prompt
 * builders and the Anthropic call live in the shared `lib/journo/route-core`
 * (Phase P6); this file owns only the guard. Dashboard callers may pass extra
 * grounding context (signalContext / assetContext / companyContext), which the
 * shared journalist prompt folds in when present.
 *
 * Same request shape as /api/journo-ai (minus the preview-gate response fields).
 * POST body: { type: "partner-suggestions" | "email-writer" | "campaign-brief", data: {...} }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { runJournoAI } from "@/lib/journo/route-core";

// Match the public route: Opus generations run 20-40s, so lift the ceiling to
// 60s to avoid a latent 504 cutting a real generation short.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const guard = await requireEmosAccess({ rateLimitKey: "journo-ai" });
  if (!guard.ok) return guard.res;

  let body: { type?: string; data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, data } = body;
  if (!type || !data) return NextResponse.json({ error: "Missing type or data." }, { status: 400 });

  const run = await runJournoAI(type, data);
  if (!run.ok) return NextResponse.json({ error: run.error }, { status: run.status });

  return NextResponse.json({ result: run.result });
}
