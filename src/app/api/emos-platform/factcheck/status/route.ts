// src/app/api/emos-platform/factcheck/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getRunWithClaims, listRuns } from "@/lib/factcheck/store";
import { getFullAuditUsage } from "@/lib/factcheck/quota";

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

  const runId = req.nextUrl.searchParams.get("runId");

  if (!runId) {
    // History list for the dashboard + the org's current Full-audit quota
    // snapshot (so the client can render "N of M full audits left this month").
    const [runs, quota] = await Promise.all([listRuns(orgId), getFullAuditUsage(orgId)]);
    return NextResponse.json({ runs, quota });
  }

  const result = await getRunWithClaims(runId, orgId);
  if (!result) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
