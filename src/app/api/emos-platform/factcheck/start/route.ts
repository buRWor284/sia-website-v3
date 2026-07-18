// src/app/api/emos-platform/factcheck/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { startRun, processRun } from "@/lib/factcheck/run";
import { checkClaimQuota } from "@/lib/factcheck/quota";
import { isFactcheckOrgAllowed } from "@/lib/factcheck/access";
import type { FactCheckMode, InputType } from "@/lib/factcheck/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Next.js requires a literal here (segment config is statically analyzed), so this
// CANNOT import config.PROCESS_ROUTE_MAX_DURATION_SECONDS — keep the two equal by
// hand. Full audits do NOT always fit inside this (a 9-claim audit was hard-killed
// at exactly 300s on 17 Jul 2026); run.ts's verify deadline guard derives from the
// config constant and finishes the run with a partial report before the cap hits.
export const maxDuration = 300;

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
    body = (await req.json()) as typeof body;
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

  let orgId: string;
  try {
    orgId = await getOrgIdForUser(guard.userId);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Organization lookup failed." }, { status: 403 });
  }

  // Private-testing gate (18 Jul 2026): while FACTCHECKIQ_ALLOWED_ORG_IDS is
  // set, only allowlisted orgs may run checks. See src/lib/factcheck/access.ts.
  if (!isFactcheckOrgAllowed(orgId)) {
    return NextResponse.json({ error: "FactcheckIQ is in private testing and not yet available to your organization." }, { status: 403 });
  }

  // Per-org monthly CLAIM allowance (Phase 4.5, replaces the per-document cap).
  // Citation mode is never blocked here. A full audit is refused only when the
  // pool is fully exhausted; a document larger than the remaining pool starts
  // normally and run.ts partially verifies it, highest risk first. See
  // src/lib/factcheck/quota.ts for the counting rules.
  const quota = await checkClaimQuota(orgId, body.mode);
  if (!quota.ok) {
    console.info(`[factcheckiq] claim-quota block org=${orgId} used=${quota.usage.used}/${quota.usage.cap}`);
    return NextResponse.json({ error: quota.message, quota: quota.usage }, { status: 429 });
  }
  if (body.mode === "citation") {
    // Citation runs are uncapped and near free; log for observability only.
    console.info(`[factcheckiq] citation run (uncapped) org=${orgId}`);
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

  // Fire the worker without blocking the response; fluid compute keeps this
  // alive past the response via waitUntil (no cron path).
  waitUntil(
    processRun(runId, runParams).catch((err) => {
      console.error(`[factcheckiq] run ${runId} failed:`, err);
    }),
  );

  // quota.usage reflects the count BEFORE this run consumed anything; the client
  // re-reads history (which includes fresh quota) once the run completes.
  return NextResponse.json({ runId, quota: quota.usage });
}
