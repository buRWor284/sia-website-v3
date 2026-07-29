// worker/index.ts
// FactcheckIQ | Fix B always-on worker (24 Jul 2026).
//
// A plain 24/7 Node process (Railway, `npm run worker`, via tsx) that replaces
// the Vercel window/continuation model for FULL audits: it polls Supabase for
// runnable runs, claims one with the existing atomic lease CAS, and processes it
// start-to-finish with no invocation time limit via
// processFullRunToCompletion(). The website stays on Vercel; the two Supabase
// tables are the whole integration surface.
//
// SAFETY MODEL
// - Activation: refuses to poll unless FACTCHECK_ENGINE=worker is set on THIS
//   host, so a deployed-but-not-cut-over worker (build phase B1) provably idles.
// - Single writer: acquireRunLease is an atomic compare-and-swap on
//   fact_check_runs.lease_until; whoever wins processes the run, everyone else
//   skips. While processing, the lease is renewed on a fixed WORKER_HEARTBEAT_MS
//   timer, so it can only expire if this process is dead.
// - Crash recovery: a dead worker stops heartbeating, the lease expires within
//   WORKER_LEASE_SECONDS, and the next poll (after restart) reclaims the run and
//   resumes it from the DB checkpoint (pending claim rows).
// - Graceful shutdown (SIGTERM on every Railway redeploy): stop starting new
//   claim verifications, let in-flight ones land and be written, clear the lease
//   so the replacement worker resumes immediately, exit 0.
// - One run at a time: claims within a run are verified VERIFY_CONCURRENCY-wide
//   exactly as before, but runs are processed sequentially to keep Anthropic
//   rate-limit pressure identical to the single-window world.

import {
  FACTCHECK_ENGINE,
  FACTCHECK_EXTRACT_MODEL,
  FACTCHECK_GRADE_MODEL,
  FACTCHECK_MAX_CLAIM_ATTEMPTS,
  PER_CLAIM_TIMEOUT_MS,
  WORKER_HEARTBEAT_MS,
  WORKER_LEASE_SECONDS,
  WORKER_POLL_INTERVAL_MS,
} from "../src/lib/factcheck/config";
import { processFullRunToCompletion } from "../src/lib/factcheck/run";
import {
  acquireRunLease,
  clearRunLease,
  getRunnableWorkerRuns,
  renewRunLease,
} from "../src/lib/factcheck/store";

const TAG = "[factcheckiq-worker]";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let shuttingDown = false;
const shouldStop = () => shuttingDown;

function requestShutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`${TAG} ${signal} received: finishing in-flight claims, then exiting`);
}
process.on("SIGTERM", () => requestShutdown("SIGTERM"));
process.on("SIGINT", () => requestShutdown("SIGINT"));

/** Fail fast, loudly, at boot if a required secret is missing on this host. */
function assertEnv(): void {
  const missing = ["ANTHROPIC_API_KEY", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter(
    (k) => !process.env[k],
  );
  if (missing.length > 0) {
    console.error(`${TAG} missing required env: ${missing.join(", ")}. Set them in the Railway service variables.`);
    process.exit(1);
  }
}

async function processOneRun(runId: string): Promise<void> {
  // Heartbeat: renew the lease on a fixed timer while this run is being
  // processed. Independent of claim resolution (unlike the Vercel engine's
  // renew-on-resolve), so one slow claim can never let the lease lapse under a
  // live worker.
  const heartbeat = setInterval(() => {
    void renewRunLease(runId, WORKER_LEASE_SECONDS);
  }, WORKER_HEARTBEAT_MS);

  const startedAt = Date.now();
  try {
    console.info(`${TAG} processing run ${runId}`);
    await processFullRunToCompletion(runId, { shouldStop });
    console.info(`${TAG} run ${runId} finished after ${Math.round((Date.now() - startedAt) / 1000)}s`);
  } catch (err) {
    // processFullRunToCompletion already marked the run errored; log and move on.
    console.error(`${TAG} run ${runId} failed:`, err);
  } finally {
    clearInterval(heartbeat);
    // Release the lease: on a finished run it is meaningless; on a shutdown
    // mid-run it lets the replacement worker resume immediately instead of
    // waiting out WORKER_LEASE_SECONDS.
    await clearRunLease(runId).catch(() => {});
  }
}

async function main(): Promise<void> {
  assertEnv();
  console.info(
    `${TAG} booted. engine=${FACTCHECK_ENGINE} grade=${FACTCHECK_GRADE_MODEL} extract=${FACTCHECK_EXTRACT_MODEL} ` +
      `perClaimTimeoutMs=${PER_CLAIM_TIMEOUT_MS} maxClaimAttempts=${FACTCHECK_MAX_CLAIM_ATTEMPTS} ` +
      `pollMs=${WORKER_POLL_INTERVAL_MS} leaseS=${WORKER_LEASE_SECONDS} heartbeatMs=${WORKER_HEARTBEAT_MS}`,
  );

  if (FACTCHECK_ENGINE !== "worker") {
    // Build phase B1 state: deployed but not cut over. Idle loudly rather than
    // exit, so Railway does not restart-loop and the log makes the state obvious.
    console.info(`${TAG} FACTCHECK_ENGINE is not "worker" on this host: idling, processing nothing.`);
    for (;;) {
      if (shuttingDown) break;
      await sleep(60_000);
    }
    console.info(`${TAG} shut down cleanly (idle mode)`);
    return;
  }

  for (;;) {
    if (shuttingDown) break;
    try {
      const candidates = await getRunnableWorkerRuns(3);
      let didWork = false;
      for (const run of candidates) {
        if (shuttingDown) break;
        // Atomic claim: only the CAS winner processes the run. Losing just means
        // another instance (or a not-yet-expired lease) already covers it.
        if (!(await acquireRunLease(run.id, WORKER_LEASE_SECONDS))) continue;
        didWork = true;
        await processOneRun(run.id);
      }
      if (!didWork && !shuttingDown) await sleep(WORKER_POLL_INTERVAL_MS);
    } catch (err) {
      console.error(`${TAG} poll iteration failed:`, err);
      if (!shuttingDown) await sleep(WORKER_POLL_INTERVAL_MS);
    }
  }
  console.info(`${TAG} shut down cleanly`);
}

void main();
