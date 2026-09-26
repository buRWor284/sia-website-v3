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
import { discoverJournalists } from "@/lib/journo/discover";
import { buildRosterList } from "@/lib/journo/roster-list";
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
const VERIFY_DEADLINE_MS = 52_000;

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

  // Names to leave out (26 Sep): the user's saved list, plus on "show more"
  // the people already on screen. Capped so a huge list cannot bloat the call.
  const exclude = Array.isArray(data.exclude)
    ? (data.exclude as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 500)
    : [];

  // "Show more" (26 Sep): the next people from the stored outlet rosters.
  // Free to the user (no allowance used): it only re-ranks names already
  // read, about 1 cent of AI. Roster markets only; never falls back to the
  // paid search paths.
  if (data.more === true) {
    if (type !== "partner-suggestions") return NextResponse.json({ error: "Show more is for journalist searches." }, { status: 400 });
    const companyBriefMore = await getApprovedBrief(guard.userId);
    const ctxMore = { surface: "platform" as const, clerkUserId: guard.userId };
    const roster = await withAiUsage(ctxMore, () => buildRosterList(data, companyBriefMore, { exclude, more: true })).catch(() => null);
    if (!roster || roster.candidates.length === 0) {
      return NextResponse.json({ result: "[]", listSource: roster ? `roster:${roster.market}` : "none", moreAvailable: 0, skipped: roster?.skipped ?? 0, ms: Date.now() - startedAt });
    }
    const checked = await withAiUsage(ctxMore, () =>
      verifyCandidates(JSON.stringify(roster.candidates), {
        deadlineMs: startedAt + VERIFY_DEADLINE_MS,
        beat: typeof data.industry === "string" ? data.industry : null,
      }),
    );
    if (!checked) return NextResponse.json({ error: "Could not load more names. Please retry." }, { status: 502 });
    after(() => checked.inFlight);
    return NextResponse.json({
      result: checked.result, verifyStats: checked.stats, listSource: `roster:${roster.market}`,
      moreAvailable: roster.remaining, skipped: roster.skipped, ms: Date.now() - startedAt,
    });
  }

  // Journalist searches and angles/briefs are separate monthly allowances.
  const action =
    type === "partner-suggestions" ? "journalist-search" :
    type === "email-writer" || type === "campaign-brief" ? "pitch-angle" : null;
  if (!action) return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  const seat = await reserveUsage(guard, action);
  if (!seat.ok) return seat.res;

  const companyBrief = await getApprovedBrief(guard.userId); // active company, approved only
  const ctx = { surface: "platform" as const, clerkUserId: guard.userId };

  // Search-first list (25 Sep, after the eval): the journalists come from
  // real recent articles found by web search, not from the model's memory.
  // If discovery fails FAST (an API error), fall back to the memory list +
  // checks; if it failed slowly there is no time left, so say so and refund.
  let listSource = "memory";
  let listJson: string | null = null;
  let moreAvailable = 0;
  let skipped = 0;

  // 1) Roster first (25 Sep): for markets with hand-picked outlets (KSA),
  // the people come from the outlets' own pages, read on a schedule.
  if (type === "partner-suggestions") {
    const roster = await withAiUsage(ctx, () => buildRosterList(data, companyBrief, { exclude })).catch((e) => {
      console.warn("[journo-ai] roster list failed:", e);
      return null;
    });
    if (roster && roster.candidates.length > 0) {
      listJson = JSON.stringify(roster.candidates);
      listSource = `roster:${roster.market}`;
      moreAvailable = roster.remaining;
      skipped = roster.skipped;
    }
  }

  // 2) Search-first list, 3) the memory list: only when no roster applies.
  if (!listJson && type === "partner-suggestions" && process.env.JOURNO_DISCOVERY !== "off") {
    const found = await withAiUsage(ctx, () => discoverJournalists(data, companyBrief));
    if (found.ok && found.candidates.length > 0) {
      listJson = JSON.stringify(found.candidates);
      listSource = "search";
    } else if (Date.now() - startedAt > 15_000) {
      await seat.release();
      console.error(`[journo-ai] discovery failed slowly (${found.error}); search refunded`);
      return NextResponse.json(
        { error: "The live journalist search took too long. This search was not counted; please retry." },
        { status: 504 },
      );
    } else {
      console.warn(`[journo-ai] discovery failed (${found.error}); falling back to the memory list`);
    }
  }

  let resultText = listJson;
  if (!resultText) {
    const run = await withAiUsage(ctx, () => runJournoAI(type, data, companyBrief));
    if (!run.ok) {
      await seat.release();
      return NextResponse.json({ error: run.error }, { status: run.status });
    }
    resultText = run.result;
  }

  if (type === "partner-suggestions") {
    // Every name is checked for a recent byline before the card shows it as a
    // person (P1-01). Checks run in parallel; late ones come back "pending".
    const checked = await withAiUsage(ctx, () =>
      verifyCandidates(resultText, {
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
      `[journo-ai] list=${listSource} verified=${checked.stats.verified} unverified=${checked.stats.unverified} pending=${checked.stats.pending} cached=${checked.stats.cached} ms=${Date.now() - startedAt}`,
    );
    return NextResponse.json({ result: checked.result, verifyStats: checked.stats, listSource, moreAvailable, skipped, ms: Date.now() - startedAt });
  }

  return NextResponse.json({ result: resultText });
}
