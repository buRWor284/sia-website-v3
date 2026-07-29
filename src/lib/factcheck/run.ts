// src/lib/factcheck/run.ts
// FactcheckIQ | orchestrator, per Build-Plan-v2.md §3
//
// Both modes are implemented. Citation & link check (Phase 2) runs the free
// deterministic gate only. Full audit (Phase 3) runs that gate as stage one, then
// sends every not-yet-fabricated claim through verify.ts for paid per-claim web
// verification, parallel and concurrency-capped, before the shared clamp + report.
//
// Phase 4.5 (18 Jul 2026): claims are inserted as 'pending' rows right after
// extraction and resolved in place as each check lands, so the dashboard shows
// the live claim list (and a count-based time estimate) during the run.
//
// Phase 5a (19 Jul 2026): CHECKPOINT AND CONTINUE. One Vercel invocation cannot
// exceed maxDuration (300s on the current plan), and a full audit often can.
// So the work is resumable: all state lives in the DB (pending claim rows +
// input_text + flags), each invocation verifies as many claims as fit before
// its wall-clock deadline and simply stops STARTING new ones; claims never
// started stay 'pending'. The status route (polled every ~2s by the client)
// notices a running run whose work lease has expired, atomically takes the
// lease, and starts a continuation worker on a fresh 300s clock via waitUntil.
// When no pending claims remain, whichever invocation gets there finalizes the
// report. MAX_CONTINUATIONS bounds the loop; the sweeper only kills runs that
// cannot continue (no claims stored) or blow the absolute backstop.
//
// Fix B (24 Jul 2026): ALWAYS-ON WORKER ENGINE. Under FACTCHECK_ENGINE=worker,
// full audits are processed start-to-finish by a 24/7 worker process
// (worker/index.ts) via processFullRunToCompletion below: no invocation window,
// no deadline gate, no continuations. The same DB checkpoint state is the queue
// (status 'queued' = new work, 'running' + pending claims = resume after a
// crash). Retries are bounded PER CLAIM (fact_check_claims.verify_attempts,
// capped at FACTCHECK_MAX_CLAIM_ATTEMPTS) instead of per window. Everything
// from Phase 5a stays in place, dormant, for the FACTCHECK_ENGINE=vercel
// rollback path; it is deleted only after the worker burn-in.

import { extractClaims, buildSkippedClaimPlaceholder } from "./extract";
import { normalizeInput } from "./intake";
import { checkCitation } from "./citations";
import { checkLinks, extractDoi } from "./links";
import { clampVerdict, findNumericContradictions } from "./grade";
import { verifyClaims, type ClaimToVerify, type VerifyContext } from "./verify";
import { buildReportMarkdown, countVerdicts, computeReadiness, hasCheckableReferences } from "./report";
import {
  createRun,
  getPendingClaims,
  getRunRow,
  getRunWithClaims,
  incrementClaimVerifyAttempts,
  insertClaims,
  insertPendingClaims,
  renewRunLease,
  setRunInputText,
  updateClaimRow,
  updateRunStatus,
} from "./store";
import {
  FACTCHECK_MAX_CLAIM_ATTEMPTS,
  MAX_CONTINUATIONS,
  PROCESS_ROUTE_MAX_DURATION_SECONDS,
  RETRY_PASS_BACKOFF_MS,
  RUN_ABSOLUTE_MAX_MS,
  RUN_LEASE_SECONDS,
  VERIFY_DEADLINE_SAFETY_MS,
} from "./config";
import { getClaimQuotaUsage } from "./quota";
import type { Claim, ClaimStatus, ClaimType, FactCheckMode, InputType, Risk, RunFlags, Verdict } from "./types";

export interface RunParams {
  orgId: string;
  userId: string;
  mode: FactCheckMode;
  inputType: InputType;
  title?: string;
  text?: string;
  url?: string;
}

/** Verification priority: the claims the argument leans on get checked first. */
const RISK_PRIORITY: Record<Risk, number> = { high: 0, medium: 1, low: 2 };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The honest terminal text for a claim that stayed unassessed after every allowed retry. Shown to users; no em/en dashes. */
const EXHAUSTED_CLAIM_EVIDENCE =
  "This claim could not be checked within the allowed number of passes; it was not assessed. Re-run to check it.";

/**
 * Wall-clock deadline for STARTING claim verifications in this invocation.
 * Vercel hard-kills at maxDuration and no catch runs, so we stop early enough
 * that in-flight claims (bounded by PER_CLAIM_TIMEOUT_MS) can land and progress
 * writes can flush. Called at invocation start (waitUntil fires essentially at
 * request start, so Date.now() ~= the invocation clock).
 */
function invocationDeadline(): number {
  return Date.now() + PROCESS_ROUTE_MAX_DURATION_SECONDS * 1000 - VERIFY_DEADLINE_SAFETY_MS;
}

export async function startRun(params: RunParams): Promise<string> {
  const runId = await createRun({
    orgId: params.orgId,
    userId: params.userId,
    input: {
      mode: params.mode,
      inputType: params.inputType,
      title: params.title,
      text: params.text,
      sourceUrl: params.url,
    },
  });
  return runId;
}

/** The initial worker (Vercel engine). Called from the start route via waitUntil. */
export async function processRun(runId: string, params: RunParams): Promise<void> {
  const runDate = new Date();
  const deadlineMs = invocationDeadline();
  try {
    // Take the work lease immediately: the run is brand new, so nobody else can
    // legitimately hold it, and holding it stops the status route from spawning
    // a continuation while this worker is alive.
    await renewRunLease(runId, RUN_LEASE_SECONDS);
    const docText = await runFrontHalf(runId, params, runDate);
    if (params.mode === "full") {
      await verifyPendingBatch(runId, params.orgId, docText, runDate, deadlineMs);
    }
    await maybeFinalize(runId);
  } catch (err) {
    await updateRunStatus(runId, {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error during fact-check run.",
    });
    throw err;
  }
}

/**
 * The engine-independent front half of every run: intake/normalize, persist the
 * normalized document, extract claims, store them as pending rows, run the free
 * deterministic citation gate, and (full mode) apply the monthly claim-allowance
 * slice ONCE. Extracted verbatim from processRun for Fix B so the always-on
 * worker (processFullRunToCompletion) reuses the identical logic; behavior on
 * the Vercel path is unchanged. Returns the normalized document text. The
 * renewRunLease calls inside are harmless on the worker engine (its heartbeat
 * runs independently; an extra renew only extends the lease).
 */
async function runFrontHalf(runId: string, params: RunParams, runDate: Date): Promise<string> {
  await updateRunStatus(runId, { status: "running", progress: { phase: "intake", claimsDone: 0, claimsTotal: 0 } });

  const intake = await normalizeInput(params.inputType, { text: params.text, url: params.url });
  // Persist the normalized document: continuation invocations and the always-on
  // worker never see the original request body, and per-claim verification
  // needs the full text for lateral reading.
  await setRunInputText(runId, intake.text);

  await updateRunStatus(runId, { progress: { phase: "extract", claimsDone: 0, claimsTotal: 0 } });
  const extraction = await extractClaims(intake.text, runDate);

  // Phase 4.5: store every extracted claim NOW as a pending row (plus the
  // over-cap placeholder, already terminal). The dashboard polls the same
  // rows the report will use, and continuation invocations resume from them.
  const claimIds = await insertPendingClaims(runId, params.orgId, extraction.claims);
  const overCapPlaceholder = buildSkippedClaimPlaceholder(extraction.overCapCount);
  await insertClaims(runId, params.orgId, overCapPlaceholder, extraction.claims.length);
  if (extraction.overCapCount > 0) {
    await mergeRunFlags(runId, { skippedClaims: extraction.overCapCount });
  } else {
    await mergeRunFlags(runId, { skippedClaims: 0 });
  }

  await updateRunStatus(runId, {
    progress: { phase: "citation_gate", claimsDone: 0, claimsTotal: extraction.claims.length },
  });

  // Stage one of every run (both modes): the free, deterministic citation & link
  // gate. In full mode it also cheaply kills fabricated citations before any paid
  // web search runs (plan §9: "free citation gate first").
  for (const [i, claim] of extraction.claims.entries()) {
    const graded = await runCitationGate(claim.claimText, claim.claimType, claim.section, claim.risk, params.mode);
    if (params.mode === "citation" || graded.verdict === "fabricated") {
      // Final result for this claim: resolve the pending row now.
      await updateClaimRow(claimIds[i], graded).catch(() => {});
    } else {
      // Full mode, heading to web verification: stay pending, but persist the
      // gate's deterministic evidence on the row. Continuation invocations
      // read it back as citationEvidence (in-memory state does not survive).
      await updateClaimRow(claimIds[i], { ...graded, status: "pending", verdict: null, sources: null, sourceUrl: null, sourceTier: null, note: null }).catch(() => {});
    }
    await renewRunLease(runId, RUN_LEASE_SECONDS);
    await updateRunStatus(runId, {
      progress: { phase: "citation_gate", claimsDone: i + 1, claimsTotal: extraction.claims.length },
    });
  }

  if (params.mode === "full") {
    // Phase 4.5 claim allowance: if this document holds more claims than the
    // org's monthly pool has left, verify the highest-risk claims up to the
    // remainder and mark the rest skipped with the reason. Done ONCE, here:
    // continuations and worker resume passes only ever see the already-sliced
    // pending set.
    const pending = await getPendingClaims(runId);
    const usage = await getClaimQuotaUsage(params.orgId);
    if (pending.length > usage.remaining) {
      const sorted = sortByRiskThenIdx(pending);
      const overBudget = sorted.slice(usage.remaining);
      const resetDate = usage.periodResetsOn.slice(0, 10);
      for (const row of overBudget) {
        await updateClaimRow(row.id, {
          ...rowToClaimPatch(row),
          status: "skipped",
          verdict: null,
          sources: null,
          sourceUrl: null,
          sourceTier: null,
          evidence: null,
          note: `Not checked: the monthly claim allowance ran out before this claim. Allowance resets on ${resetDate}.`,
        }).catch(() => {});
      }
      if (overBudget.length > 0) await mergeRunFlags(runId, { quotaLimited: overBudget.length });
    }
  }

  return intake.text;
}

/**
 * Phase 5a continuation worker (Vercel engine). Called from the status route via
 * waitUntil AFTER the caller atomically acquired the run's expired lease. Loads
 * all state from the DB, verifies what fits in this invocation's window,
 * finalizes when done. Never marks the run failed on its own crash: the lease
 * simply expires and the next poll retries, bounded by MAX_CONTINUATIONS.
 */
export async function continueRun(runId: string): Promise<void> {
  const deadlineMs = invocationDeadline();
  const run = await getRunRow(runId);
  if (!run || run.status !== "running") return;

  const attempts = ((run.progress?.attempts as number | undefined) ?? 0) + 1;
  console.info(`[factcheckiq] continuation ${attempts} for run ${runId}`);
  await updateRunStatus(runId, {
    progress: { ...(run.progress ?? { phase: "verify", claimsDone: 0, claimsTotal: 0 }), attempts },
  });

  if (attempts > MAX_CONTINUATIONS) {
    // Loop guard: stop spending, resolve what is left as honestly incomplete,
    // and ship the partial report. A partial report always beats an error.
    const stillPending = await getPendingClaims(runId);
    for (const row of stillPending) {
      await updateClaimRow(row.id, {
        ...rowToClaimPatch(row),
        status: "check_failed",
        verdict: null,
        sources: null,
        sourceUrl: null,
        sourceTier: null,
        evidence: EXHAUSTED_CLAIM_EVIDENCE,
        note: null,
      }).catch(() => {});
    }
    if (stillPending.length > 0) await mergeRunFlags(runId, { checkIncomplete: stillPending.length, additive: true });
    await maybeFinalize(runId);
    return;
  }

  const docText: string = run.input_text ?? "";
  const runDate = new Date(run.created_at);
  if (run.mode === "full" && docText) {
    await verifyPendingBatch(runId, run.org_id, docText, runDate, deadlineMs, attempts);
  }
  await maybeFinalize(runId);
}

/**
 * Fix B: the always-on worker engine's entry point. Processes ONE full-audit run
 * from whatever state the DB shows to a terminal state, with no invocation
 * window: a 'queued' run (or a 'running' run that died before any claims were
 * stored) gets the whole pipeline from intake; a 'running' run with claims
 * resumes straight into verify passes. The caller (worker/index.ts) holds the
 * run's lease and heartbeats it; opts.shouldStop turns true on graceful
 * shutdown, which stops new claim verifications from STARTING (in-flight ones
 * land and are written) and returns with the remainder still pending for the
 * replacement worker.
 */
export async function processFullRunToCompletion(runId: string, opts?: { shouldStop?: () => boolean }): Promise<void> {
  const run = await getRunRow(runId);
  if (!run) return;
  if (run.status !== "queued" && run.status !== "running") return; // terminal: nothing to do
  if (run.mode !== "full") return; // citation runs never queue for the worker; belt and suspenders

  // Match continuation semantics: the run's own creation time anchors recency
  // judgments, not whenever the worker happened to pick it up.
  const runDate = new Date(run.created_at);

  try {
    const existing = await getRunWithClaims(runId, run.org_id);
    const hasClaims = (existing?.claims.length ?? 0) > 0;

    if (!hasClaims) {
      // Fresh run, or one that died between createRun and insertPendingClaims.
      // The raw input was persisted at creation (start route, worker engine), so
      // the pipeline can start (or safely restart: no claims exist, so no
      // duplicates are possible) from intake.
      const params: RunParams = {
        orgId: run.org_id as string,
        userId: run.user_id as string,
        mode: "full",
        inputType: run.input_type as InputType,
        title: (run.title as string | null) ?? undefined,
        text: (run.input_text as string | null) ?? undefined,
        url: (run.source_url as string | null) ?? undefined,
      };
      await runFrontHalf(runId, params, runDate);
    }

    const docText: string = ((await getRunRow(runId))?.input_text as string | null) ?? "";
    await workerVerifyPassLoop(runId, run.org_id as string, docText, runDate, opts?.shouldStop);
    await maybeFinalize(runId);
  } catch (err) {
    // Same contract as processRun: an unhandled pipeline error (extraction
    // failure, DB write failure) marks the run instead of leaving it to spin.
    await updateRunStatus(runId, {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error during fact-check run.",
    });
    throw err;
  }
}

/**
 * Fix B: verify passes over a run's pending set until every claim is terminal,
 * each retryable claim has exhausted FACTCHECK_MAX_CLAIM_ATTEMPTS, the absolute
 * backstop age is reached (finalize an honest partial, never an error), a
 * terminal API failure stops the run, or shutdown is requested (leave the rest
 * pending for the next worker). Replaces the window/continuation model: same
 * verify machinery, no clock.
 */
async function workerVerifyPassLoop(
  runId: string,
  orgId: string,
  documentText: string,
  runDate: Date,
  shouldStop?: () => boolean,
): Promise<void> {
  if (!documentText) return;

  let firstPass = true;
  for (;;) {
    if (shouldStop?.()) return; // graceful shutdown: remainder stays pending for the next worker

    const run = await getRunRow(runId);
    if (!run || run.status !== "running") return; // errored (terminal API failure) or finalized elsewhere

    // Absolute backstop: finalize what we have as an honest partial. The pass
    // loop checks age BEFORE each pass, so the run never starts a pass beyond
    // the cap; the status-route sweep (backstop + margin) stays the dead-worker
    // last resort.
    if (Date.now() - new Date(run.created_at).getTime() > RUN_ABSOLUTE_MAX_MS) break;

    const pending = await getPendingClaims(runId);
    if (pending.length === 0) return; // all terminal: caller finalizes
    const retryable = pending.filter(
      (r) => ((r.verify_attempts as number | null) ?? 0) < FACTCHECK_MAX_CLAIM_ATTEMPTS,
    );
    if (retryable.length === 0) break; // every pending claim exhausted its attempts

    if (!firstPass) await sleep(RETRY_PASS_BACKOFF_MS); // let transient rate limits / slow sources clear
    firstPass = false;
    if (shouldStop?.()) return;

    await verifyPendingBatch(runId, orgId, documentText, runDate, undefined, undefined, {
      countAttempts: true,
      shouldStop,
    });
  }

  // Backstop hit or every pending claim exhausted: resolve the remainder as
  // honestly unassessed (same text and flag the continuation cap uses).
  const stillPending = await getPendingClaims(runId);
  for (const row of stillPending) {
    await updateClaimRow(row.id, {
      ...rowToClaimPatch(row),
      status: "check_failed",
      verdict: null,
      sources: null,
      sourceUrl: null,
      sourceTier: null,
      evidence: EXHAUSTED_CLAIM_EVIDENCE,
      note: null,
    }).catch(() => {});
  }
  if (stillPending.length > 0) await mergeRunFlags(runId, { checkIncomplete: stillPending.length, additive: true });
}

/**
 * Verify as many of this run's pending claims as allowed, highest risk first,
 * resolving each DB row live and renewing the work lease as results land. Used
 * identically by the initial Vercel worker, continuations, and the always-on
 * worker's passes: the DB pending set IS the work queue.
 *
 * deadlineMs: the Vercel engine's invocation deadline for STARTING claims;
 * undefined on the worker engine (no window). workerOpts (worker engine only):
 * countAttempts meters transient check_faileds into verify_attempts and skips
 * claims that exhausted FACTCHECK_MAX_CLAIM_ATTEMPTS; shouldStop stops new
 * claims from starting on graceful shutdown (via a live deadline getter, so
 * verify.ts needs no changes).
 */
async function verifyPendingBatch(
  runId: string,
  orgId: string,
  documentText: string,
  runDate: Date,
  deadlineMs: number | undefined,
  // The continuation counter for THIS window, threaded in so the progress writes
  // below preserve it. Without this, verifyPendingBatch's progress writes replace
  // the whole progress object and silently drop progress.attempts, so every
  // continuation re-read it as 0 and MAX_CONTINUATIONS never fired — the run could
  // only ever stop at the 45-min backstop (diagnosed live 21 Jul 2026: logs showed
  // "continuation 1" forever, DB attempts stuck null). Undefined on the initial
  // processRun window, which has no continuation attempts yet.
  attempts?: number,
  workerOpts?: { countAttempts: boolean; shouldStop?: () => boolean },
): Promise<void> {
  const withAttempts = (p: { phase: string; claimsDone: number; claimsTotal: number }) =>
    attempts !== undefined ? { ...p, attempts } : p;
  let pendingRows = sortByRiskThenIdx(await getPendingClaims(runId));
  if (workerOpts?.countAttempts) {
    // Worker engine: never re-attempt a claim that already used its retry budget.
    pendingRows = pendingRows.filter(
      (r) => ((r.verify_attempts as number | null) ?? 0) < FACTCHECK_MAX_CLAIM_ATTEMPTS,
    );
  }
  if (pendingRows.length === 0) return;

  const { claims: allRows } = (await getRunWithClaims(runId, orgId)) ?? { claims: [] };
  const totalClaims = allRows.length;
  const resolvedBefore = totalClaims - pendingRows.length;

  await updateRunStatus(runId, {
    progress: withAttempts({ phase: "verify", claimsDone: resolvedBefore, claimsTotal: totalClaims }),
  });

  const toVerify: ClaimToVerify[] = pendingRows.map((row) => ({
    claimText: row.claim_text as string,
    claimType: (row.claim_type ?? "fact") as ClaimType,
    section: (row.section ?? null) as string | null,
    risk: (row.risk ?? "medium") as Risk,
    citationEvidence: (row.evidence as string | null) ?? undefined,
  }));

  let batchSearches = 0;
  const fetchFailures: string[] = [];
  const injectionAttempts: string[] = [];

  // Worker-engine graceful shutdown reuses verify.ts's existing deadline gate
  // untouched: a live getter flips deadlineMs to an already-passed instant the
  // moment shouldStop() turns true, so no NEW claim starts and the in-call
  // retry backoff is skipped, while in-flight claims land normally.
  const stop = workerOpts?.shouldStop;
  const ctx: VerifyContext = stop
    ? {
        documentText,
        runDate,
        get deadlineMs(): number | undefined {
          return stop() ? 0 : undefined;
        },
      }
    : { documentText, runDate, deadlineMs };

  const results = await verifyClaims(
    toVerify,
    ctx,
    (done) => {
      void updateRunStatus(runId, {
        progress: withAttempts({ phase: "verify", claimsDone: resolvedBefore + done, claimsTotal: totalClaims }),
      }).catch(() => {});
    },
    (index, result) => {
      // Live per-claim resolution + lease renewal (proof of life for the
      // status route, which only spawns a continuation on an expired lease).
      // COMPLETENESS RULE (19 Jul 2026): a claim that came back check_failed was
      // never actually assessed (per-claim timeout, rate limit, transient API
      // error). We do NOT write that terminal status now; we leave the row
      // pending so a LATER continuation window retries it on a fresh clock, when
      // the slow source or rate limit may have cleared. Only a real verdict
      // (including an honest "unverifiable") is written and terminal. Claims that
      // still cannot be assessed after every window are finalized as check_failed
      // once, by continueRun at the MAX_CONTINUATIONS cap. Net effect: you only
      // ever see "Check incomplete" for a claim that failed every retry across
      // all windows, never for one that simply ran out of time in one window.
      // (Worker engine: same rule, but the retry budget is per claim; each
      // transient check_failed below meters verify_attempts, and the pass loop
      // finalizes a claim that exhausts FACTCHECK_MAX_CLAIM_ATTEMPTS.)
      if (result.claim.status !== "check_failed") {
        void updateClaimRow(pendingRows[index].id, result.claim).catch(() => {});
      } else if (workerOpts?.countAttempts && result.terminal !== true) {
        void incrementClaimVerifyAttempts(
          pendingRows[index].id,
          ((pendingRows[index].verify_attempts as number | null) ?? 0),
        );
      }
      void renewRunLease(runId, RUN_LEASE_SECONDS);
    },
  );

  // Terminal failure (auth rejected / usage limit / refused request): retrying
  // across windows cannot fix it, so stop now and surface the reason instead of
  // leaving claims pending to spin until the backstop (the 20 Jul 2026 silent hang).
  const fatal = results.find((v) => v && v.terminal === true);
  if (fatal) {
    await updateRunStatus(runId, {
      status: "error",
      error: fatal.claim.evidence ?? "Verification is unavailable; re-run after resolving it.",
    });
    return;
  }

  for (const v of results) {
    if (!v) continue; // never started: still pending, next invocation's work
    batchSearches += v.searchesUsed;
    // check_failed claims stay pending for a later window (see onClaim), so they
    // are not flagged here. fetchFailures is informational on a REAL verdict
    // whose corroboration hit a snag, and is only meaningful for a resolved row.
    if (v.claim.status === "checked" && v.verifyFailed) fetchFailures.push(v.claim.claimText.slice(0, 140));
    if (v.injectionDetected) injectionAttempts.push(v.claim.claimText.slice(0, 140));
  }

  const flagPatch: FlagMerge = { additive: true };
  if (fetchFailures.length) flagPatch.fetchFailures = fetchFailures;
  if (injectionAttempts.length) flagPatch.injectionAttempts = injectionAttempts;
  if (flagPatch.fetchFailures || flagPatch.injectionAttempts) {
    await mergeRunFlags(runId, flagPatch);
  }
  if (batchSearches > 0) {
    const run = await getRunRow(runId);
    await updateRunStatus(runId, { searchesUsed: ((run?.searches_used as number | null) ?? 0) + batchSearches });
  }
}

/**
 * Finalize the run IF no pending claims remain: verdict counts, readiness,
 * doc-level consistency pass, report markdown, status done. Safe to call from
 * any invocation; a run with pending work or a non-running status is left alone.
 */
async function maybeFinalize(runId: string): Promise<void> {
  const run = await getRunRow(runId);
  if (!run || run.status !== "running") return;
  const result = await getRunWithClaims(runId, run.org_id);
  if (!result) return;
  const rows = result.claims;
  if (rows.some((r: { status: string }) => r.status === "pending")) return;

  const runDate = new Date(run.created_at);
  const claims: Claim[] = rows.map((r: any) => ({
    id: r.id as string,
    runId,
    orgId: run.org_id as string,
    claimText: r.claim_text as string,
    claimType: (r.claim_type ?? null) as ClaimType | null,
    section: (r.section ?? null) as string | null,
    risk: (r.risk ?? null) as Risk | null,
    status: r.status as ClaimStatus,
    verdict: (r.verdict ?? null) as Verdict | null,
    sources: r.sources ?? null,
    sourceUrl: (r.source_url ?? null) as string | null,
    sourceTier: (r.source_tier ?? null) as number | null,
    evidence: (r.evidence ?? null) as string | null,
    note: (r.note ?? null) as string | null,
    createdAt: r.created_at as string,
  }));

  const flags: RunFlags = { ...((run.flags as RunFlags | null) ?? {}) };
  // Doc-level consistency pass (§3 step 6), computed over the final claim set.
  const consistency = findNumericContradictions(claims);
  if (consistency.length > 0) flags.consistencyFindings = consistency;

  const mode = run.mode as FactCheckMode;
  const counts = countVerdicts(claims);
  // Citation mode with no links/DOIs anywhere had nothing to check: say so in the
  // stored readiness too, so the dashboard's readiness box matches the report body.
  const citationHadReferences = mode === "citation" ? hasCheckableReferences(claims) : true;
  const readiness = computeReadiness(counts, mode, citationHadReferences);
  const reportMd = buildReportMarkdown({
    title: (run.title as string | null),
    mode,
    claims,
    flags,
    runDate,
  });

  await updateRunStatus(runId, {
    status: "done",
    progress: { phase: "done", claimsDone: claims.length, claimsTotal: claims.length },
    verdictCounts: counts,
    readiness,
    flags,
    reportMd,
  });
}

/* ------------------------------- helpers -------------------------------- */

interface FlagMerge extends Partial<RunFlags> {
  /** When true, numeric counters and string lists ADD to stored values instead of replacing them. */
  additive?: boolean;
}

/** Read-merge-write on run.flags. Single-writer safe: only the lease holder calls this. */
async function mergeRunFlags(runId: string, patch: FlagMerge): Promise<void> {
  const run = await getRunRow(runId);
  const current: RunFlags = { ...((run?.flags as RunFlags | null) ?? {}) };
  const { additive, ...rest } = patch;
  const next: RunFlags = { ...current };
  if (rest.skippedClaims !== undefined) next.skippedClaims = rest.skippedClaims;
  if (rest.quotaLimited !== undefined) next.quotaLimited = rest.quotaLimited;
  if (rest.checkIncomplete !== undefined) {
    next.checkIncomplete = additive ? (current.checkIncomplete ?? 0) + rest.checkIncomplete : rest.checkIncomplete;
  }
  if (rest.fetchFailures !== undefined) {
    next.fetchFailures = additive ? [...(current.fetchFailures ?? []), ...rest.fetchFailures] : rest.fetchFailures;
  }
  if (rest.injectionAttempts !== undefined) {
    next.injectionAttempts = additive ? [...(current.injectionAttempts ?? []), ...rest.injectionAttempts] : rest.injectionAttempts;
  }
  await updateRunStatus(runId, { flags: next });
}

function sortByRiskThenIdx(rows: any[]): any[] {
  return [...rows].sort((a, b) => {
    const ra = RISK_PRIORITY[(a.risk ?? "medium") as Risk] ?? 1;
    const rb = RISK_PRIORITY[(b.risk ?? "medium") as Risk] ?? 1;
    if (ra !== rb) return ra - rb;
    return ((a.idx as number | null) ?? 0) - ((b.idx as number | null) ?? 0);
  });
}

/** Base claim-shaped patch from a stored row (identity fields preserved). */
function rowToClaimPatch(row: any): Omit<Claim, "id" | "runId" | "orgId" | "createdAt"> {
  return {
    claimText: row.claim_text as string,
    claimType: (row.claim_type ?? null) as ClaimType | null,
    section: (row.section ?? null) as string | null,
    risk: (row.risk ?? null) as Risk | null,
    status: row.status as ClaimStatus,
    verdict: (row.verdict ?? null) as Verdict | null,
    sources: row.sources ?? null,
    sourceUrl: (row.source_url ?? null) as string | null,
    sourceTier: (row.source_tier ?? null) as number | null,
    evidence: (row.evidence ?? null) as string | null,
    note: (row.note ?? null) as string | null,
  };
}

/**
 * Citation & link check for one claim: resolves any DOI/URL in the claim text
 * against Crossref/OpenAlex/DOAJ and checks any bare links, then clamps the
 * verdict. This never calls a model to judge truth — it is pure deterministic
 * evidence, exactly as citation mode promises.
 */
async function runCitationGate(
  claimText: string,
  claimType: ClaimType,
  section: string | null,
  risk: Risk,
  mode: FactCheckMode,
): Promise<Omit<Claim, "id" | "runId" | "orgId" | "createdAt">> {
  const doi = extractDoi(claimText);
  const urlMatch = claimText.match(/https?:\/\/[^\s"'<>)]+/);

  let proposedVerdict: Verdict = "unverifiable";
  let evidence = "No link or DOI in this claim, so the citation and link check has nothing to verify here. Run a full audit to check the statistic itself.";
  const sources: Claim["sources"] = [];

  if (doi) {
    const result = await checkCitation({ doi });
    if (!result.exists) {
      proposedVerdict = "fabricated";
      evidence = `DOI ${doi} does not resolve in Crossref or OpenAlex.`;
    } else if (result.retracted) {
      proposedVerdict = "fabricated";
      evidence = `DOI ${doi} resolves to a paper flagged as retracted.`;
    } else if (result.matchesClaim === false) {
      proposedVerdict = "fabricated";
      evidence = `DOI ${doi} resolves to "${result.resolvedTitle}", which does not match what the claim attributes to it.`;
    } else {
      proposedVerdict = "unverifiable"; // exists + not obviously wrong is still not "verified" without web evidence
      evidence = `DOI ${doi} resolves to "${result.resolvedTitle}" (${result.source}). Citation mode cannot confirm the claim's content is accurately represented; run a full audit.`;
    }
    if (result.resolvedTitle) {
      sources.push({ url: `https://doi.org/${doi}`, tier: 1, quote: result.resolvedTitle, as_of: new Date().toISOString().slice(0, 10) });
    }
  } else if (urlMatch) {
    const [linkResult] = await checkLinks([urlMatch[0]]);
    if (!linkResult.resolved) {
      proposedVerdict = "inaccurate";
      evidence = `Link ${urlMatch[0]} did not resolve (${linkResult.statusCode ?? linkResult.error}).`;
    } else {
      evidence = `Link ${urlMatch[0]} resolves (HTTP ${linkResult.statusCode}). Citation mode cannot confirm the linked page supports the claim; run a full audit.`;
    }
  }

  const clamp = clampVerdict({ proposedVerdict, sources, mode, loadBearing: risk === "high" });

  return {
    claimText,
    claimType,
    section,
    risk,
    status: "checked",
    verdict: clamp.verdict,
    sources,
    sourceUrl: sources[0]?.url ?? (urlMatch ? urlMatch[0] : null),
    sourceTier: sources[0]?.tier ?? null,
    evidence: clamp.clamped ? `${evidence} (${clamp.reason})` : evidence,
    note: null,
  };
}
