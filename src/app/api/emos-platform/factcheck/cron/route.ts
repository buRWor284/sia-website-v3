// src/app/api/emos-platform/factcheck/cron/route.ts
// FactcheckIQ | TABLESS continuation cron (21 Jul 2026).
//
// WHY THIS EXISTS. A full audit checkpoints its work in the DB and resumes across
// several 300s Vercel windows (Phase 5a). Until now the ONLY thing that started a
// continuation window was the status route, fired by the browser polling every
// ~2s. That makes a run advance only while its tab is open and focused: close or
// background the tab and no poll fires, no lease is taken, continueRun never runs
// (that is exactly why progress.attempts stayed null on stalled runs — attempts is
// incremented as the first line of continueRun, so null means continueRun never
// executed, not that it ran and failed), and the run stalls until the 45-min
// backstop fails it.
//
// This route is the tab-independent driver. Vercel Cron hits it every minute
// (see vercel.json); it finds runs that need another window and drives them
// server-side with the SAME trigger-agnostic machinery the status route uses
// (getRunsNeedingContinuation -> acquireRunLease -> continueRun). No browser, no
// poll, no open tab required.
//
// WHY await, not waitUntil. The status route answers a waiting client, so it takes
// the lease and hands continueRun to waitUntil so the poll can return immediately.
// A cron tick has no waiting client, so it AWAITS continueRun to completion inside
// this invocation. That guarantees the continuation actually runs (including its
// attempts++ write) rather than depending on post-response background execution
// surviving — the very reliability gap this feature is meant to close. The winners
// are started together (Promise.allSettled) so each continueRun computes its ~300s
// invocation deadline from the same clock; a sequential await would hand a later
// run a deadline past this invocation's hard kill.
//
// SAFETY. Auth is the CRON_SECRET bearer check (same secret the SignalIQ cron
// uses), NOT the user-auth guard. The single-writer lease (acquireRunLease, an
// atomic conditional UPDATE) means an overlapping cron tick — Vercel does not skip
// a tick just because the previous one is still running — or a still-live
// start-route worker can never double-drive the same run: RUN_LEASE_SECONDS is
// sized to outlive one whole invocation, so a lease can never expire while its
// worker is still alive (config.ts explains the sizing). Terminal runs are never
// re-triggered: only status='running' runs with a free/expired lease are eligible,
// and continueRun itself no-ops on any run that is not running. Runs-per-tick is
// bounded (MAX_RUNS_PER_CRON_TICK) so a burst of stalled runs cannot fan out into
// unbounded paid verification in one tick.
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { acquireRunLease, failStaleRunsGlobal, getRunsNeedingContinuation } from "@/lib/factcheck/store";
import { continueRun } from "@/lib/factcheck/run";
import {
  MAX_RUNS_PER_CRON_TICK,
  RUN_ABSOLUTE_MAX_MS,
  RUN_LEASE_SECONDS,
  STALE_RUN_AFTER_MS,
} from "@/lib/factcheck/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Same window as the start/status routes: this route hosts continuation workers.
// MUST stay a literal (Next.js statically analyzes segment config) and equal to
// config.PROCESS_ROUTE_MAX_DURATION_SECONDS, which continueRun's deadline assumes.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // CRON_SECRET bearer auth. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
  // automatically when CRON_SECRET is set in the project env (it already is — the
  // SignalIQ cron uses it). We require it to be set AND matched: a route that
  // triggers paid verification should fail closed if the secret is ever missing,
  // rather than run unauthenticated (a deliberately stricter check than the
  // SignalIQ route's `if (secret && ...)`), so nothing but Vercel Cron can drive it.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();

  // 1) Global stale sweep (all orgs). Fails ONLY truly unrecoverable runs (died
  //    before any claims were stored, or past the absolute backstop) — the same
  //    criteria the status route applies per-org. Best-effort: a sweep failure must
  //    never stop us from driving healthy runs below. Running first also trims
  //    claim-less zombies out of the way before we look for work.
  let sweptStale = 0;
  try {
    sweptStale = await failStaleRunsGlobal(STALE_RUN_AFTER_MS, RUN_ABSOLUTE_MAX_MS);
  } catch (err) {
    console.error(`[factcheckiq] cron global stale sweep failed:`, err);
  }

  // 2) Candidate runs that need another window: running, lease free/expired, with
  //    stored claims. Bounded so one tick cannot fan out unboundedly.
  let eligible: { id: string; org_id: string }[] = [];
  try {
    eligible = await getRunsNeedingContinuation(MAX_RUNS_PER_CRON_TICK);
  } catch (err) {
    console.error(`[factcheckiq] cron eligible-run query failed:`, err);
    return NextResponse.json(
      { ok: false, error: "eligible-run query failed", sweptStale, elapsedMs: Date.now() - started },
      { status: 500 },
    );
  }

  // 3) Take each run's lease; only the winners get driven. acquireRunLease is an
  //    atomic CAS on lease_until, so if the previous window's worker is somehow
  //    still alive (lease not yet expired) or a concurrent tick already grabbed it,
  //    we lose the CAS and skip — never double-driving a run.
  const won: string[] = [];
  for (const run of eligible) {
    try {
      if (await acquireRunLease(run.id, RUN_LEASE_SECONDS)) won.push(run.id);
    } catch (err) {
      console.error(`[factcheckiq] cron lease acquire failed for run ${run.id}:`, err);
    }
  }

  if (won.length > 0) {
    console.info(`[factcheckiq] cron driving ${won.length} run(s): ${won.join(", ")}`);
  }

  // 4) Drive the winners concurrently, awaiting all so the work provably runs in
  //    this invocation. continueRun never throws the run into a bad state on its
  //    own crash (the lease simply expires and a later tick retries), but we still
  //    catch per-run so one failure cannot reject the whole batch.
  const outcomes = await Promise.allSettled(
    won.map((id) =>
      continueRun(id).catch((err) => {
        console.error(`[factcheckiq] cron continuation for run ${id} failed:`, err);
        throw err;
      }),
    ),
  );
  const failed = outcomes.filter((o) => o.status === "rejected").length;

  return NextResponse.json({
    ok: true,
    sweptStale,
    eligible: eligible.length,
    driven: won.length,
    failed,
    elapsedMs: Date.now() - started,
  });
}
