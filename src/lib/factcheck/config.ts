// src/lib/factcheck/config.ts
// FactcheckIQ | model + tier + cap config, per FactcheckIQ-Build-Plan-v2.md §4, §8, §9, Appendix A

/** Cheap model for mechanical claim extraction. Env var added in Vercel per Phase 0. */
export const FACTCHECK_EXTRACT_MODEL =
  process.env.FACTCHECK_EXTRACT_MODEL ?? "claude-sonnet-4-6";

/** Judgment model for verification + verdicts. Env var added in Vercel per Phase 0. */
export const FACTCHECK_GRADE_MODEL =
  process.env.FACTCHECK_GRADE_MODEL ?? "claude-opus-4-8";

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

/** Claims beyond this cap are stored with status "skipped" and reported, never silently dropped. */
export const MAX_CLAIMS_PER_RUN = 40;

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
 * How long before the function-duration cap the full-audit verify stage stops
 * STARTING new per-claim verifications, so a claim already in flight can finish
 * and the partial report still gets written before the platform hard-kill.
 *
 * INVARIANT (revised 21 Jul 2026): must be >= PER_CLAIM_TIMEOUT_MS. A claim may
 * be started right at the deadline and then run for up to a full per-claim
 * timeout; if this safety margin were smaller than that timeout, the platform
 * would hard-kill the claim mid-flight (wasted paid work). Sized here at
 * PER_CLAIM_TIMEOUT_MS + 15s of slack for the final report build + status write.
 * Raised 90s -> 135s alongside the per-claim timeout raise (75s -> 120s), after
 * live logs (21 Jul) showed most claims legitimately needed longer than 75s and
 * were being killed as false "timeouts."
 */
export const VERIFY_DEADLINE_SAFETY_MS = 135_000;

/**
 * A run still queued/running this long after creation is presumed hard-killed
 * (the platform kill skips all catch blocks, so the row can never fix itself).
 * The status route sweeps such rows to status "error" so clients stop polling.
 * Cap + 2 minutes of slack for clock drift and slow final writes.
 */
export const STALE_RUN_AFTER_MS = (PROCESS_ROUTE_MAX_DURATION_SECONDS + 120) * 1000;

/**
 * Per-request timeout on each verify+grade model call. The deadline guard cannot
 * abort an in-flight call; this can. A claim that exceeds it comes back
 * check_failed fast and the worker moves on; unfinished claims are retried by a
 * later continuation window.
 *
 * RAISED 75s -> 120s (21 Jul 2026). Live logs showed the 75s cap was the actual
 * blocker: on a 33-claim run all but the fastest claims tripped it — Opus +
 * web_search + reading a couple of fetched pages routinely needs 80-110s — so
 * they came back as false "Request timed out" check_failures, retried, timed out
 * again, and the run died at the backstop with most claims never really checked.
 * 120s covers the realistic per-claim cost with headroom. Trade-off: fewer claims
 * start per 300s window, so long docs need more continuation windows (fine now
 * that continuations are cron-driven and the attempts counter is fixed). Kept
 * below VERIFY_DEADLINE_SAFETY_MS so a claim started at the deadline still lands
 * before the invocation hard-kill.
 */
export const PER_CLAIM_TIMEOUT_MS = 120_000;

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
 */
export const MAX_CONTINUATIONS = 6;

/** Absolute backstop: a run older than this is failed by the sweeper regardless of state. Far above any legitimate multi-window audit. */
export const RUN_ABSOLUTE_MAX_MS = 45 * 60 * 1000;

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

export const CITATION_APIS = {
  CROSSREF: "https://api.crossref.org",
  OPENALEX: "https://api.openalex.org",
  DOAJ: "https://doaj.org/api",
  // Retraction Watch data is served via Crossref's Retraction Watch integration.
} as const;
