// src/app/api/emostool/factcheck/status/route.ts
// FactcheckIQ | poll a run's progress/result. Per Build-Plan-v2.md §3, §6.

import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getRunWithClaims, listRuns } from "@/lib/factcheck/store";

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
    // No runId: return the plain history list for the dashboard.
    const runs = await listRuns(orgId);
    return NextResponse.json({ runs });
  }

  const result = await getRunWithClaims(runId, orgId);
  if (!result) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
