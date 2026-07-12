/**
 * GET /api/gate/status  →  { subscriber: boolean }
 *
 * Public tools call this on mount to decide whether to show the gate — replacing the
 * old per-browser localStorage flag. Reads the signed subscriber wristband (and honors
 * the legacy pp_tier cookie during the P1 grace period) via the shared getPublicTier
 * seam. Foundation for the embed status check in a later phase.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPublicTier } from "@/lib/gate/public-tier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const subscriber = getPublicTier(req) === "email";
  return NextResponse.json({ subscriber }, { headers: { "Cache-Control": "no-store" } });
}
