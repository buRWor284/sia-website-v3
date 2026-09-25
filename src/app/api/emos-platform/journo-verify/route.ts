/**
 * /api/emos-platform/journo-verify: check one journalist's byline (P1-01, 2026-09-25).
 *
 * Two callers, both on the JournoCollabIQ card:
 *  - fill-in: a candidate the search route sent back as "pending" (its check
 *    did not land inside the route's deadline). Cache is read first, so a
 *    check that finished late in the search route's after() costs nothing.
 *  - Re-verify: `force: true` skips the cache and writes a fresh row.
 *
 * FREE by decision (25 Sep): no reserveUsage call, nothing counts against the
 * monthly search allowance. Rate-limited per user instead, so it cannot be
 * used as an unlimited web-search endpoint.
 *
 * POST body: { name: string, outlet: string, beat?: string, force?: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { withAiUsage } from "@/lib/ai-usage";
import { verifyJournalist } from "@/lib/journo/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  // 8 fill-ins per search plus Re-verify clicks: 60 an hour is ample for real
  // use and caps the cost of abuse at well under a dollar an hour.
  const guard = await requireEmosAccess({ rateLimitKey: "journo-verify", limit: 60 });
  if (!guard.ok) return guard.res;

  let body: { name?: unknown; outlet?: unknown; beat?: unknown; force?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const outlet = typeof body.outlet === "string" ? body.outlet.trim().slice(0, 200) : "";
  const beat = typeof body.beat === "string" ? body.beat.trim().slice(0, 200) : null;
  if (!name || !outlet) return NextResponse.json({ error: "Missing name or outlet." }, { status: 400 });

  const verification = await withAiUsage({ surface: "platform", clerkUserId: guard.userId }, () =>
    verifyJournalist({ name, outlet, beat }, { force: body.force === true }),
  );
  return NextResponse.json({ verification });
}
