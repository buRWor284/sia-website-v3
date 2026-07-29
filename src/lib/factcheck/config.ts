// src/lib/factcheck/config.ts
// FactcheckIQ | model + tier + cap config, per FactcheckIQ-Build-Plan-v2.md §4, §8, §9, Appendix A

/** Cheap model for mechanical claim extraction. Env var added in Vercel per Phase 0. */
export const FACTCHECK_EXTRACT_MODEL =
  process.env.FACTCHECK_EXTRACT_MODEL ?? "claude-sonnet-4-6";

/** Judgment model for verification + verdicts. Env var added in Vercel per Phase 0. */
export const FACTCHECK_GRADE_MODEL =
  process.env.FACTCHECK_GRADE_MODEL ?? "claude-opus-4-8";

/**
 * Fix B (24 Jul 2026): which engine drives FULL audits.
 * - "vercel" (the DEFAULT, and the value when the env var is unset or anything
 *   unrecognized): today's proven path. The start route hosts the initial worker
 *   via waitUntil and the status route + every-minute cron drive checkpointed
 *   continuations across 300s windows. A misconfigured env can only ever fall
 *   back HERE, never to the new path.
 * - "worker": the start route persists the raw input, leaves the run 'queued',
 *   and the always-on Railway worker (worker/index.ts) claims it and processes
 *   it start-to-finish with no invocation time limit. The continuation
 *   machinery stays in the codebase but dormant.
 * The worker process itself also requires this to be "worker" on ITS host
 * before it will poll, so a half-flipped deployment fails safe (worker idles).
 * Citation-mode runs always use the inline Vercel path regardless of this flag.
 */
export type FactcheckEngine = "vercel" | "worker";
export const FACTCHECK_ENGINE: FactcheckEngine =
  process.env.FACTCHECK_ENGINE === "worker" ? "worker" : "vercel";

/**
 * Web search / web fetch tool versions and beta header.
 *
 * Phase 0 finding (4 Jul 2026): the plan's original assumption (web_fetch_20250910,
 * beta header "web-fetch-2025-09-10") was superseded by the _20260209 tools with a
 * "code-execution-web-tools-2026-02-09" beta header.
 *
 * Phase 3 re-verification (14 Jul 2026, against
 * https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
 * and .../web-fetch-tool): both tools advanced again and are now GA. The current
 * latest is web_search_20260318 / web_fetch_20260318 (adds response-inclusion
 * control on top of the _20260209 dynamic filtering), and the docs no longer
 * require any beta header for either tool. WEB_TOOLS_BETA_HEADER is therefore null;
 * verify.ts only sends an anthropic-beta header when this is non-null, so a future
 * reintroduction is a one-line change. Re-verify against the docs above if this
 * file is touched more than a few weeks after this note.
 */
export const WEB_SEARCH_TOOL_VERSION = "web_search_20260318";
export const WEB_FETCH_TOOL_VERSION = "web_fetch_20260318";
export const WEB_TOOLS_BETA_HEADER: string | null = null;

/**
 * Claims beyond this cap are stored with status "skipped" and reported, never silently dropped.
 *
 * Lowered 40 -> 20 on 29 Jul 2026, to size the tool to what the Vercel engine can
 * ACTUALLY finish rather than what it can start. Measured wall clock on the Fix A
 * path (VERIFY_CONCURRENCY=4): a 9-claim run took 234s, a 14-claim run took 724s,
 * i.e. roughly 30 to 60 seconds per claim once cross-window gaps are counted. At
 * the slow end, 20 claims lands near 17 minutes, comfortably inside both
 * RUN_ABSOLUTE_MAX_MS (45 min) and MAX_CONTINUATIONS (6 windows), with real margin
 * for one stubborn tail claim. 40 claims at that same rate is ~35 minutes, which
 * only fits if nothing goes wrong, and the one 33-claim attempt on record died at
 * the backstop.
 *
 * This cap is a VERCEL-ENGINE constraint, not a product one. Under
 * FACTCHECK_ENGINE=worker there is no invocation window and no reason for a cap
 * this tight, so raise it as part of the Fix B cutover, not before.
 */
export const MAX_CLAIMS_PER_RUN = 20;

/** Per-claim search budget inside the verify+grade step. Raised 3 -> 4 (20 Jul 2026) so the verifier has a search to spare for locating the primary cited source (e.g. StatCounter's own page) before corroborating with independent ones. */
export const MAX_SEARCHES_PER_CLAIM = 4;

/** Concurrency cap for parallel per-claim verify+grade calls in full-audit mode. */
export const VERIFY_CONCURRENCY = 4;

/**
 * Source tiers, used for source_tier / sources[].tier.
 * Lower number = higher trust. Referenced by grade.ts's clampVerdict().
 */
export const SOURCE_TIERS = {
  PRIMARY_ACADEMIC: 1, // peer-reviewed journals, Crossref/OpenAlex-indexed papers
  GOVERNMENT_OR_STANDARDS_BODY: 1,
  REPUTABLE_NEWS_OR_INDUSTRY: 2,
  VENDOR_OR_COMPANY_BLOG: 3,
  UNVERIFIED_OR_LOW_TRUST: 4,
} as const;

/**
 * Vercel fluid-compute duration (Phase 0 finding, 4 Jul 2026):
 * default maxDuration across plans is now 300s; Pro/Enterprise fluid compute
 * supports up to 800s generally available (30 min extended max is beta-only).
 *
 * REVISED 17 Jul 2026 after the first live full audit was hard-killed at exactly
 * 300s ("Vercel Runtime Timeout Error: Task timed out after 300 seconds"): the
 * Phase 0 assumption that "a typical full audit fits well inside the 300s
 * default" is FALSE for a ~9-claim document with Opus + web search + the
 * rate-limit retry path. The whole worker (waitUntil) lives inside the start
 * route's single invocation, and a hard kill skips every catch block, leaving
 * the run row at status "running" forever. Two guards now depend on this value:
 * the verify-stage wall-clock deadline in run.ts (stops STARTING new claim
 * verifications VERIFY_DEADLINE_SAFETY_MS before the cap so in-flight claims can
 * land and a partial report still gets written) and the stale-run sweeper in the
 * status route (flips zombied runs to error after STALE_RUN_AFTER_MS).
 *
 * NOTE: the start route's `export const maxDuration = 300` must stay a literal
 * (Next.js statically analyzes segment config) and MUST be kept equal to this.
 */
export const PROCESS_ROUTE_MAX_DURATION_SECONDS = 300;

/**
 * Per-request timeout on each verify+grade model call. The deadline guard cannot
 * abort an in-flight call; this can. A claim that exceeds it comes back
 * check_failed fast and the worker moves on; unfinished claims are retried by a
 * later continuation window (Vercel engine) or a later pass (worker engine).
 *
 * RAISED 75s -> 120s (21 Jul 2026). Live logs showed the 75s cap was the actual
 * blocker: on a 33-claim run all but the fastest claims tripped it — Opus +
 * web_search + reading a couple of fetched pages routinely needs 80-110s — so
 * they came back as false "Request timed out" check_failures, retried, timed out
 * again, and the run died at the backstop with most claims never really checked.
 * 120s covers the realistic per-claim cost with headroom.
 *
 * Fix B (24 Jul 2026): ENV-OVERRIDABLE via FACTCHECK_PER_CLAIM_TIMEOUT_MS. This
 * exists for the ALWAYS-ON WORKER HOST ONLY (Railway sets 240000): with no
 * invocation window to fit inside, the timeout's sole job is hang protection on
 * the SDK call, so it can be generous. Do NOT set the env var on Vercel: there
 * the 120s default is load-bearing (VERIFY_DEADLINE_SAFETY_MS below is derived
 * from this value so a claim started at the deadline still lands before the
 * invocation hard-kill).
 */
const perClaimTimeoutEnv = parseInt(process.env.FACTCHECK_PER_CLAIM_TIMEOUT_MS ?? "", 10);
export const PER_CLAIM_TIMEOUT_MS =
  Number.isFinite(perClaimTimeoutEnv) && perClaimTimeoutEnv > 0 ? perClaimTimeoutEnv : 120_000;

/**
 * How long before the function-duration cap the full-audit verify stage stops
 * STARTING new per-claim verifications, so a claim already in flight can finish
 * and the partial report still gets written before the platform hard-kill.
 *
 * INVARIANT (revised 21 Jul 2026): must be >= PER_CLAIM_TIMEOUT_MS. A claim may
 * be started right at the deadline and then run for up to a full per-claim
 * timeout; if this safety margin were smaller than that timeout, the platform
 * would hard-kill the claim mid-flight (wasted paid work). Sized at
 * PER_CLAIM_TIMEOUT_MS + 15s of slack for the final report build + status write.
 * Fix B (24 Jul 2026): now DERIVED from PER_CLAIM_TIMEOUT_MS (same 135_000 value
 * as before at the 120s default), so the invariant holds by construction even if
 * someone sets the timeout env var on Vercel against advice.
 */
export const VERIFY_DEADLINE_SAFETY_MS = PER_CLAIM_TIMEOUT_MS + 15_000;

/**
 * A run still queued/running this long after creation is presumed hard-killed
 * (the platform kill skips all catch blocks, so the row can never fix itself).
 * The status route sweeps such rows to status "error" so clients stop polling.
 * Cap + 2 minutes of slack for clock drift and slow final writes.
 * Vercel-engine semantics; the worker engine uses QUEUED_STALL_AFTER_MS and the
 * absolute backstop instead (a queued run waiting for a busy worker is healthy).
 */
export const STALE_RUN_AFTER_MS = (PROCESS_ROUTE_MAX_DURATION_SECONDS + 120) * 1000;

/**
 * Cooperative work lease on a run (fact_check_runs.lease_until). The live worker
 * renews it as claims resolve; another worker (a status poll OR the tabless cron)
 * may start a continuation ONLY by atomically taking an EXPIRED lease, so at most
 * one worker verifies a run at a time.
 *
 * SIZED TO OUTLIVE ONE INVOCATION (revised 21 Jul 2026). The lease is renewed only
 * when a claim RESOLVES (run.ts onClaim) — there is no mid-claim heartbeat — and a
 * single stubborn claim can run with no resolution for far longer than the old
 * "~165s" estimate assumed: up to MAX_TURNS_PER_CLAIM (2) * PER_CLAIM_TIMEOUT_MS
 * + RATE_LIMIT_BACKOFF_MS + a second full attempt — comfortably into the minutes,
 * and larger still after the 120s per-claim timeout raise. If the lease were
 * shorter than the invocation, it could expire UNDER a still-alive
 * worker grinding one slow claim, and the every-minute cron would pounce on that
 * expired lease and double-drive the run (double paid verify). The fix does not
 * depend on estimating the worst claim: a worker cannot outlive its function
 * invocation (PROCESS_ROUTE_MAX_DURATION_SECONDS hard kill), so a lease longer
 * than one invocation can NEVER expire while its worker is alive. The only cost is
 * that a genuinely dead run waits marginally longer for revival — a non-issue next
 * to double-spending. Keep this strictly greater than PROCESS_ROUTE_MAX_DURATION_SECONDS.
 * (Vercel-engine lease sizing. The always-on worker claims runs with the shorter
 * WORKER_LEASE_SECONDS below because it has a real mid-claim heartbeat.)
 */
export const RUN_LEASE_SECONDS = PROCESS_ROUTE_MAX_DURATION_SECONDS + 60;

/**
 * Continuation attempts cap: after this many continueRun passes, remaining
 * pending claims are marked check_failed and the run finalizes with a partial
 * report (never an endless loop).
 *
 * Tabless-cron cadence check (21 Jul 2026): under the every-minute cron each
 * window ends with the lease renewed to now + RUN_LEASE_SECONDS (240s), so the
 * next window can only start ~4 min after the previous one's last claim landed —
 * i.e. windows are naturally spaced, not back-to-back. A realistic worst case (a
 * 40-claim doc; the initial start-route window plus ~14 claims per continuation
 * window) finishes in 2-3 continuations and well under RUN_ABSOLUTE_MAX_MS, so 6
 * keeps ample headroom. Only a run doing very few claims per window (heavy rate
 * limiting) would reach the cap; that finalizes an honest partial report, which
 * beats spending unboundedly. If real cron traffic shows long docs hitting the
 * cap, raise this AND RUN_ABSOLUTE_MAX_MS together (raising this alone just lets
 * the 45-min sweeper preempt the clean partial with an error) — and weigh the
 * added per-run cost, since each extra window re-attempts every stuck claim.
 * (Vercel engine only; the worker engine bounds retries per claim with
 * FACTCHECK_MAX_CLAIM_ATTEMPTS instead, since it has no windows.)
 */
export const MAX_CONTINUATIONS = 6;

/**
 * Absolute backstop: a run older than this is failed by the sweeper regardless
 * of state. Far above any legitimate audit. Fix B (24 Jul 2026): under the
 * worker engine this is 2 hours (runs no longer race a window cadence, and the
 * worker's pass loop FINALIZES an honest partial at this age rather than
 * erroring; the sweeper error is the last resort for a dead worker). Under the
 * Vercel engine it stays 45 minutes, matched to the window cadence math above.
 */
export const RUN_ABSOLUTE_MAX_MS =
  FACTCHECK_ENGINE === "worker" ? 2 * 60 * 60 * 1000 : 45 * 60 * 1000;

/**
 * Tabless continuation cron (21 Jul 2026): the max number of DISTINCT runs the
 * every-minute cron will drive in a single tick. The single-writer lease
 * (acquireRunLease) already stops any one run being driven twice, so this only
 * bounds how many separate stalled runs advance concurrently inside one cron
 * invocation — a cost/throughput guard, not a correctness one. Small on purpose:
 * FactcheckIQ is in private testing with low concurrency, and the per-minute
 * schedule means anything not picked up this tick is picked up moments later.
 * Raise it only if many long audits legitimately run at the same time.
 */
export const MAX_RUNS_PER_CRON_TICK = 5;

/* ---------------- Fix B: always-on worker engine (24 Jul 2026) ---------------- */

/**
 * Per-claim retry cap on the worker engine, replacing MAX_CONTINUATIONS' window
 * math. A pending claim whose verification comes back check_failed (transient
 * tooling failure, NOT a verdict) has fact_check_claims.verify_attempts
 * incremented and stays pending for a later pass; once it reaches this cap it is
 * finalized as an honest check_failed. Strictly cheaper than the old worst case
 * (a stuck claim could be re-attempted in every one of up to 7 windows).
 */
export const FACTCHECK_MAX_CLAIM_ATTEMPTS = 3;

/** How often the idle worker polls Supabase for runnable full-audit runs. */
export const WORKER_POLL_INTERVAL_MS = 5_000;

/**
 * Lease duration the always-on worker claims runs with. Deliberately SHORT
 * (unlike RUN_LEASE_SECONDS): the worker renews on a fixed WORKER_HEARTBEAT_MS
 * timer while alive, so expiry means roughly three missed heartbeats = the
 * worker is dead and the run is claimable again (by the restarted worker).
 */
export const WORKER_LEASE_SECONDS = 180;

/** Fixed heartbeat interval at which the busy worker renews its run lease. */
export const WORKER_HEARTBEAT_MS = 60_000;

/** Wait between verify passes over a run's still-pending claims, so transient rate limits / slow sources can clear before the retry. */
export const RETRY_PASS_BACKOFF_MS = 30_000;

/**
 * Worker engine: a run still 'queued' this long after creation, while NO run
 * anywhere holds a live lease (= no worker heartbeat = the worker looks
 * offline), is failed with an honest "engine offline" message. A queued run
 * waiting behind a BUSY worker (live lease exists) is healthy and never swept.
 */
export const QUEUED_STALL_AFTER_MS = 10 * 60 * 1000;

export const CITATION_APIS = {
  CROSSREF: "https://api.crossref.org",
  OPENALEX: "https://api.openalex.org",
  DOAJ: "https://doaj.org/api",
  // Retraction Watch data is served via Crossref's Retraction Watch integration.
} as const;
