// src/app/api/emos-platform/factcheck/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { failStaleRuns, getRunWithClaims, listRuns } from "@/lib/factcheck/store";
import { getClaimQuotaUsage } from "@/lib/factcheck/quota";
import { isFactcheckOrgAllowed } from "@/lib/factcheck/access";
import { STALE_RUN_AFTER_MS } from "@/lib/factcheck/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // Zombie-run sweep (17 Jul 2026): a worker hard-killed at the function-duration
  // cap leaves its run at "running" forever (no catch runs on a platform kill),
  // and the client would poll forever. There is no cron in this design, and the
  // polling client calls this route every ~2s while a run is live, so sweeping
  // here guarantees a stuck run resolves to a visible error within one poll of
  // going stale. failStaleRuns is best-effort and never throws.
  await failStaleRuns(orgId, STALE_RUN_AFTER_MS);

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

  return NextResponse.json(result);
}
