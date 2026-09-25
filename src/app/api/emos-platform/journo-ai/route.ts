/**
 * /api/emos-platform/journo-ai  —  JournoCollabIQ AI endpoint, DASHBOARD surface.
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
import { NextRequest, NextResponse, after } from "next/server";
import { requireEmosAccess } from "@/lib/emos-guard";
import { runJournoAI, verifyCandidates } from "@/lib/journo/route-core";
import { withAiUsage } from "@/lib/ai-usage";
import { getApprovedBrief } from "@/lib/company-brief";
import { reserveUsage } from "@/lib/usage-limits";

// Match the public route: Opus generations run 20-40s, so lift the ceiling to
// 60s to avoid a latent 504 cutting a real generation short.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Stop waiting for byline checks this long after the request started, and
 * send the rest as "pending" for the card to fill in (P1-01, 2026-09-25).
 * Keeps a clear margin under maxDuration; raising maxDuration is NOT the fix. */
const VERIFY_DEADLINE_MS = 48_000;

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
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

  // Journalist searches and angles/briefs are separate monthly allowances.
  const action =
    type === "partner-suggestions" ? "journalist-search" :
    type === "email-writer" || type === "campaign-brief" ? "pitch-angle" : null;
  if (!action) return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  const seat = await reserveUsage(guard, action);
  if (!seat.ok) return seat.res;

  const companyBrief = await getApprovedBrief(guard.userId); // active company, approved only
  const run = await withAiUsage({ surface: "platform", clerkUserId: guard.userId }, () =>
    runJournoAI(type, data, companyBrief),
  );
  if (!run.ok) {
    await seat.release();
    return NextResponse.json({ error: run.error }, { status: run.status });
  }

  if (type === "partner-suggestions") {
    // Every name is checked for a recent byline before the card shows it as a
    // person (P1-01). Checks run in parallel; late ones come back "pending".
    const checked = await withAiUsage({ surface: "platform", clerkUserId: guard.userId }, () =>
      verifyCandidates(run.result, {
        deadlineMs: startedAt + VERIFY_DEADLINE_MS,
        beat: typeof data.industry === "string" ? data.industry : null,
      }),
    );
    if (!checked) {
      // Unreadable list: not the user's fault, so the search is not counted.
      await seat.release();
      return NextResponse.json(
        { error: "The journalist list came back unreadable. This search was not counted; please retry." },
        { status: 502 },
      );
    }
    // Late checks keep running after the response so they still reach the
    // cache (awaited inside after(), never fire-and-forget).
    after(() => checked.inFlight);
    console.log(
      `[journo-ai] verified=${checked.stats.verified} unverified=${checked.stats.unverified} pending=${checked.stats.pending} cached=${checked.stats.cached} ms=${Date.now() - startedAt}`,
    );
    return NextResponse.json({ result: checked.result, verifyStats: checked.stats, ms: Date.now() - startedAt });
  }

  return NextResponse.json({ result: run.result });
}
