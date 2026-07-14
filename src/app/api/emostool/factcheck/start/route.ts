// src/app/api/emostool/factcheck/start/route.ts
// FactcheckIQ | Clerk auth -> create run row -> waitUntil(process) -> runId
// Per Build-Plan-v2.md §3, §6, Appendix A.

import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { startRun, processRun } from "@/lib/factcheck/run";
import type { FactCheckMode, InputType } from "@/lib/factcheck/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Phase 0 finding: fluid-compute default; full audits fit comfortably inside this

async function getOrgIdForUser(userId: string): Promise<string> {
  const db = createSupabaseServiceClient();
  const { data, error } = await db.from("users").select("org_id").eq("clerk_user_id", userId).single();
  if (error || !data?.org_id) throw new Error("Could not resolve organization for this account.");
  return data.org_id as string;
}

export async function POST(req: NextRequest) {
  const guard = await requireEmosAccess({ rateLimitKey: "factcheckiq-start", limit: 20, windowMs: 60 * 60 * 1000 });
  if (!guard.ok) return guard.res;

  let body: { mode?: FactCheckMode; inputType?: InputType; title?: string; text?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.mode || !["citation", "full"].includes(body.mode)) {
    return NextResponse.json({ error: "mode must be 'citation' or 'full'." }, { status: 400 });
  }
  if (!body.inputType || !["paste", "markdown", "url"].includes(body.inputType)) {
    return NextResponse.json({ error: "inputType must be 'paste', 'markdown', or 'url'." }, { status: 400 });
  }
  if (body.inputType === "url" && !body.url) {
    return NextResponse.json({ error: "url is required when inputType is 'url'." }, { status: 400 });
  }
  if (body.inputType !== "url" && !body.text) {
    return NextResponse.json({ error: "text is required for paste/markdown input." }, { status: 400 });
  }
  if (body.mode === "full") {
    // Phase 3 (verify.ts) isn't built yet — reject clearly at the API boundary
    // instead of creating a run that will always error mid-flight.
    return NextResponse.json(
      { error: "Full audit mode is not available yet in this build. Use 'citation' mode for now." },
      { status: 501 },
    );
  }

  let orgId: string;
  try {
    orgId = await getOrgIdForUser(guard.userId);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Organization lookup failed." }, { status: 403 });
  }

  const runParams = {
    orgId,
    userId: guard.userId,
    mode: body.mode,
    inputType: body.inputType,
    title: body.title,
    text: body.text,
    url: body.url,
  };

  const runId = await startRun(runParams);

  // Fire the worker without blocking the response; Vercel's fluid compute keeps
  // this alive past the response via waitUntil (no cron path, per plan §3).
  waitUntil(
    processRun(runId, runParams).catch((err) => {
      console.error(`[factcheckiq] run ${runId} failed:`, err);
    }),
  );

  return NextResponse.json({ runId });
}
