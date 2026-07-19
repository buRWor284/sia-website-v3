// src/app/api/emos-platform/factcheck/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { acquireRunLease, failStaleRuns, getRunWithClaims, listRuns } from "@/lib/factcheck/store";
import { continueRun } from "@/lib/factcheck/run";
import { getClaimQuotaUsage } from "@/lib/factcheck/quota";
import { isFactcheckOrgAllowed } from "@/lib/factcheck/access";
import { RUN_ABSOLUTE_MAX_MS, RUN_LEASE_SECONDS, STALE_RUN_AFTER_MS } from "@/lib/factcheck/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Phase 5a: this route can host a continuation worker via waitUntil, so it needs
// the same window as the start route. MUST stay a literal (Next.js static
// analysis) and equal to config.PROCESS_ROUTE_MAX_DURATION_SECONDS.
export const maxDuration = 300;

async function getOrgIdForUser(userId: string): Promise<string> {
  const db = createSupabaseServiceClient();
  const { data, error } = await db.from("users").select("org_id").eq("clerk_user_id", userId).single();
  if (error || !data?.org_id) throw new Error("Could not resolve organization for this account.");
  return data.org_id as string;
}

export async function GET(req: NextRequest) {
  const guard = await requireEmosAccess();
  if (!guard.ok) return guard.res;

  let orgId: string;
  try {
    orgId = await getOrgIdForUser(guard.userId);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Organization lookup failed." }, { status: 403 });
  }

  // Private-testing gate (18 Jul 2026): see src/lib/factcheck/access.ts.
  if (!isFactcheckOrgAllowed(orgId)) {
    return NextResponse.json({ error: "FactcheckIQ is in private testing and not yet available to your organization." }, { status: 403 });
  }

  // Sweep only truly unrecoverable runs (Phase 5a semantics): died before any
  // claims were stored, or older than the absolute backstop. Stalled runs WITH
  // stored claims are revived below instead. Best-effort, never throws.
  await failStaleRuns(orgId, STALE_RUN_AFTER_MS, RUN_ABSOLUTE_MAX_MS);

  const runId = req.nextUrl.searchParams.get("runId");

  if (!runId) {
    // History list for the dashboard + the org's current claim-allowance
    // snapshot (so the client can render "N of M claims left this month").
    const [runs, quota] = await Promise.all([listRuns(orgId), getClaimQuotaUsage(orgId)]);
    return NextResponse.json({ runs, quota });
  }

  const result = await getRunWithClaims(runId, orgId);
  if (!result) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  // Phase 5a continuation trigger. The client polls this route every ~2s while
  // a run is live, which makes it a free heartbeat: if the run is still marked
  // running, has stored claims, and is not finished (pending work, or resolved
  // but never finalized after a kill), and its work lease has EXPIRED (no live
  // worker is renewing it), take the lease atomically and resume the run on
  // this invocation's fresh clock. At most one poll wins the lease; every
  // other poll returns immediately. waitUntil lets the response return now
  // while the worker keeps running in the background.
  const run = result.run as { id: string; status: string; report_md: string | null };
  const claims = result.claims as { status: string }[];
  if (run.status === "running" && claims.length > 0) {
    const hasPending = claims.some((c) => c.status === "pending");
    const needsWork = hasPending || run.report_md == null;
    if (needsWork) {
      const acquired = await acquireRunLease(run.id, RUN_LEASE_SECONDS);
      if (acquired) {
        console.info(`[factcheckiq] status poll acquired lease, continuing run ${run.id}`);
        waitUntil(
          continueRun(run.id).catch((err) => {
            console.error(`[factcheckiq] continuation for run ${run.id} failed:`, err);
          }),
        );
      }
    }
  }

  return NextResponse.json(result);
}
