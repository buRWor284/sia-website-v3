/**
 * /api/emos-platform/journo-roster/refresh — read the hand-picked outlets and
 * store who is writing for them (JournoCollabIQ rosters, 25 Sep 2026).
 *
 * Driven by .github/workflows/journo-roster-refresh.yml (weekly) and by hand
 * from the Actions tab. CRON_SECRET bearer, fail closed (same rule as the
 * FactCheckIQ cron: a route that spends money never runs unauthenticated).
 *
 * GET ?market=ksa[&beat=marketing-pr-media][&force=1]
 * Skips an outlet read successfully in the last 21 days unless force=1, so a
 * weekly run keeps every roster under the 30-day freshness line for about
 * the cost of one read per outlet per month.
 */
import { NextRequest, NextResponse } from "next/server";
import { OUTLET_LISTS, type Outlet } from "@/lib/journo/outlets";
import { readOutlet, type OutletReadResult } from "@/lib/journo/roster";
import { withAiUsage } from "@/lib/ai-usage";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { normaliseDomain } from "@/lib/journo/verification-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const REFRESH_AFTER_DAYS = 21;
const CONCURRENCY = 5;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const started = Date.now();
  const sp = req.nextUrl.searchParams;
  const market = sp.get("market") ?? "ksa";
  const beat = sp.get("beat");
  const force = sp.get("force") === "1";

  // One job per outlet+pages; the same outlet can serve several beats with
  // different pages (Arab News media vs tourism), so key on domain + pages.
  const jobs = new Map<string, { outlet: Outlet; beat: string }>();
  for (const l of OUTLET_LISTS) {
    if (l.market !== market || (beat && l.beat !== beat)) continue;
    for (const o of l.outlets) jobs.set(`${o.domain}|${o.pages.join(",")}`, { outlet: o, beat: l.beat });
  }

  // Skip outlets read successfully recently (unless forced).
  const recent = new Set<string>();
  if (!force) {
    const since = new Date(Date.now() - REFRESH_AFTER_DAYS * 86_400_000).toISOString();
    const { data } = await createSupabaseServiceClient()
      .from("outlet_reads").select("outlet_domain, beat").eq("ok", true).gt("read_at", since);
    for (const r of (data ?? []) as Array<{ outlet_domain: string; beat: string | null }>) recent.add(`${r.outlet_domain}|${r.beat ?? ""}`);
  }

  const todo = [...jobs.values()].filter((j) => force || !recent.has(`${normaliseDomain(j.outlet.domain)}|${j.beat}`));
  const results: OutletReadResult[] = [];
  let next = 0;
  await withAiUsage({ surface: "platform", clerkUserId: null }, async () => {
    const worker = async () => {
      for (;;) {
        const i = next++;
        if (i >= todo.length) return;
        if (Date.now() - started > 250_000) return; // leave room to answer
        results.push(await readOutlet(todo[i].outlet, market, todo[i].beat));
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker));
  });

  const skipped = jobs.size - todo.length;
  const summary = {
    ok: true, market, beat, force,
    outlets: jobs.size, read: results.length, skippedFresh: skipped,
    notReached: todo.length - results.length,
    bylines: results.reduce((n, r) => n + r.bylines, 0),
    results, elapsedMs: Date.now() - started,
  };
  console.log(`[journo-roster] refresh ${market}/${beat ?? "all"}: read ${results.length}, bylines ${summary.bylines}, ${summary.elapsedMs}ms`);
  return NextResponse.json(summary);
}
