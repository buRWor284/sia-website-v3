// src/lib/factcheck/verify.ts
// FactcheckIQ | per-claim verify + grade (Phase 3), per Build-Plan-v2.md §3 step 5.
//
// This is the paid, judgment-heavy half of a full audit. For each claim it makes
// ONE model call (FACTCHECK_GRADE_MODEL) with Anthropic's server-side web_search
// and web_fetch tools attached. The model reads laterally on the live web, then
// finishes by calling record_verdict (GRADE_TOOL). Numeric, recency, and reasoning
// checks are NOT separate passes — the system prompt (VERIFY_AND_GRADE_INSTRUCTIONS)
// folds them into this single call, exactly as the plan specifies.
//
// The verdict this file returns is only ever PROPOSED. run.ts runs every result
// through clampVerdict() before storing, so overclaiming is closed in code, not
// left to the prompt. Honesty rules (extract.ts / grade.ts): a claim whose
// verification fails mid-flight is marked Unverifiable with the reason noted,
// never guessed.

import Anthropic from "@anthropic-ai/sdk";
import {
  FACTCHECK_GRADE_MODEL,
  MAX_SEARCHES_PER_CLAIM,
  PER_CLAIM_TIMEOUT_MS,
  VERIFY_CONCURRENCY,
  WEB_SEARCH_TOOL_VERSION,
  WEB_FETCH_TOOL_VERSION,
  WEB_TOOLS_BETA_HEADER,
} from "./config";
import { buildSystemPrompt, GRADE_TOOL } from "./prompts";
import { clampVerdict } from "./grade";
import type { Claim, ClaimType, Risk, Source, Verdict } from "./types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** The valid verdict strings the grading tool may return. */
const VALID_VERDICTS: readonly Verdict[] = [
  "verified",
  "partly_accurate",
  "misleading",
  "unverifiable",
  "inaccurate",
  "fabricated",
];

/**
 * Max web_fetch calls the model may make per claim. Kept tight on purpose: each
 * fetch pulls a full page into Opus context at input-token cost, and fetches are
 * the dominant cost driver of a full audit. Raised 3 -> 5 (20 Jul 2026): 3 left
 * no room to read the PRIMARY cited source on top of the two independent
 * corroborators the two-source rule needs, so attributed statistics were graded
 * on a secondary site's rounding instead of the source itself (the StatCounter
 * 90.39% case). 5 = primary + 2 independent + slack. A ceiling, not a target;
 * most claims use fewer.
 */
const MAX_FETCHES_PER_CLAIM = 5;

/**
 * Hard ceiling on model turns per claim. Server tools resolve inside one turn, so
 * turn 0 normally does all the search/fetch/verdict work; turn 1 is only the
 * forced "record your verdict" fallback. Keeping this at 2 stops the context from
 * being re-sent (and re-billed) across many turns.
 */
const MAX_TURNS_PER_CLAIM = 2;

export interface ClaimToVerify {
  claimText: string;
  claimType: ClaimType;
  section: string | null;
  risk: Risk;
  /** Deterministic evidence already gathered by the citation gate (run.ts), passed in so the model does not re-derive it. */
  citationEvidence?: string;
}

export interface VerifyContext {
  /** The full document under audit, for lateral-reading and doc-level reference-frame context. */
  documentText: string;
  runDate: Date;
  /**
   * Optional wall-clock deadline (epoch ms) for STARTING claim verifications.
   * The whole run lives inside one Vercel function invocation (the start route's
   * maxDuration); at the cap the platform hard-kills the worker and no catch
   * block runs, zombie-ing the run at "running" (observed live 17 Jul 2026).
   * When set: a claim whose verification has not started by this time returns
   * status "check_failed" with zero API calls, and the mid-flight rate-limit
   * retry is skipped when its backoff would cross the deadline. run.ts sizes
   * this so in-flight claims can land and the partial report still gets written.
   */
  deadlineMs?: number;
}

export interface VerifiedClaim {
  claim: Omit<Claim, "id" | "runId" | "orgId" | "createdAt">;
  searchesUsed: number;
  injectionDetected: boolean;
  /** True when web verification could not complete for this claim (API/search failure); claim is marked Unverifiable. */
  verifyFailed: boolean;
  /**
   * True when the failure is TERMINAL (auth rejected, usage/credit limit, or a
   * refused request): retrying across windows cannot fix it, so run.ts fails the
   * whole run fast with the reason instead of leaving the claim pending to spin
   * until the backstop (the 20 Jul 2026 silent "Checking" hang).
   */
  terminal?: boolean;
}

// --- server-tool definitions (cast: these versions are newer than the SDK's typed union) ---

function webSearchTool() {
  return { type: WEB_SEARCH_TOOL_VERSION, name: "web_search", max_uses: MAX_SEARCHES_PER_CLAIM } as unknown as Anthropic.Tool;
}
function webFetchTool() {
  return { type: WEB_FETCH_TOOL_VERSION, name: "web_fetch", max_uses: MAX_FETCHES_PER_CLAIM } as unknown as Anthropic.Tool;
}

/** Wait after a rate-limit failure before the single retry, to let the search budget recover. */
const RATE_LIMIT_BACKOFF_MS = 15000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Verify and grade a single claim. Never throws. If web verification cannot run
 * (search rate-limited, timeout, API error) the claim comes back with
 * status "check_failed" (NOT a verdict), and we retry once after a backoff in case
 * the rate limit clears. A genuine content result (any real verdict) short-circuits
 * the retry. Each model call carries PER_CLAIM_TIMEOUT_MS, so no single claim can
 * quietly hold a worker for minutes (observed live 19 Jul 2026). The deadline
 * gate for NOT STARTING claims lives in verifyClaims, not here: unstarted claims
 * must stay pending so a continuation invocation can pick them up.
 */
export async function verifyClaim(claim: ClaimToVerify, ctx: VerifyContext): Promise<VerifiedClaim> {
  const first = await attemptVerify(claim, ctx);
  if (first.claim.status !== "check_failed") return first;

  // Skip the backoff+retry when it cannot finish before the deadline: one honest
  // check_failed beats a retry the platform kills mid-flight.
  if (ctx.deadlineMs !== undefined && Date.now() + RATE_LIMIT_BACKOFF_MS >= ctx.deadlineMs) {
    return first;
  }

  await sleep(RATE_LIMIT_BACKOFF_MS);
  const second = await attemptVerify(claim, ctx);
  second.searchesUsed += first.searchesUsed; // meter both attempts
  return second;
}

async function attemptVerify(claim: ClaimToVerify, ctx: VerifyContext): Promise<VerifiedClaim> {
  const system = buildSystemPrompt("full", ctx.runDate);

  const userText =
    `DOCUMENT UNDER AUDIT:\n"""\n${ctx.documentText}\n"""\n\n` +
    `Verify exactly ONE claim from that document:\n"""\n${claim.claimText}\n"""\n\n` +
    `Claim type: ${claim.claimType}. Risk tier: ${claim.risk}` +
    (claim.risk === "high" ? " (treat as load-bearing: the two-source rule applies)." : ".") +
    (claim.citationEvidence
      ? `\n\nDeterministic citation/link check already run on this claim:\n${claim.citationEvidence}\nUse this as a starting point; still read laterally for independent corroboration.`
      : "") +
    `\n\nSearch the live web for INDEPENDENT sources (do not rely on any source the document itself cites), fetch the most relevant ones, and when you are done call record_verdict with your verdict, the exact matched quote per source, and an as_of date for any value that changes over time. Call record_verdict exactly once.`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userText }];
  const tools = [webSearchTool(), webFetchTool(), GRADE_TOOL as unknown as Anthropic.Tool];

  let searchesUsed = 0;
  let searchOk = 0; // web_search_tool_result blocks that returned results
  let searchErr = 0; // web_search_tool_result blocks that returned an error (rate limit etc.)

  try {
    for (let turn = 0; turn < MAX_TURNS_PER_CLAIM; turn++) {
      const lastTurn = turn === MAX_TURNS_PER_CLAIM - 1;
      const message = await anthropic.messages.create(
        {
          model: FACTCHECK_GRADE_MODEL,
          // The verdict payload (verdict + a few sources + a short evidence line) is
          // small; 2000 is ample and caps runaway output cost.
          max_tokens: 2000,
          // Cache the static system prompt + tool definitions. Every claim in a run
          // shares this exact prefix, so after the first claim the big playbook is a
          // cache hit (~90% cheaper on those input tokens) instead of re-billed each
          // time. This is the plan's top cost lever (§9); the cache_control breakpoint
          // on the system block covers the tools+system prefix.
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          tools,
          // On the final fallback turn, force the verdict so we never end without one.
          tool_choice: lastTurn ? { type: "tool", name: "record_verdict" } : { type: "auto" },
          messages,
        },
        {
          // Hard per-call ceiling: a hung search/fetch turn fails fast as
          // check_failed instead of silently eating the invocation window.
          timeout: PER_CLAIM_TIMEOUT_MS,
          ...(WEB_TOOLS_BETA_HEADER ? { headers: { "anthropic-beta": WEB_TOOLS_BETA_HEADER } } : {}),
        },
      );

      searchesUsed += countSearches(message);
      const scan = scanSearchResults(message);
      searchOk += scan.ok;
      searchErr += scan.err;
      const verdictBlock = message.content.find(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "record_verdict",
      );

      if (verdictBlock) {
        // Pass the raw search tallies; finalizeVerdict decides whether the web
        // check actually happened (searchOk) before trusting any content verdict.
        return finalizeVerdict(claim, verdictBlock.input as GradeToolInput, searchesUsed, searchOk, searchErr);
      }

      // No verdict yet. If the model stopped to use server tools, the API has
      // already executed them and returned their results inline; push the turn
      // and nudge it to finish. (Server tool_use blocks need no client result.)
      messages.push({ role: "assistant", content: message.content });
      messages.push({
        role: "user",
        content: "You have gathered enough. Now call record_verdict exactly once with your final verdict for this single claim.",
      });
    }

    // Ran out of turns without a verdict. If no search succeeded, the web check
    // never really happened, so this is a technical "couldn't check", not an
    // honest Unverifiable (which must mean "we looked and could not confirm").
    if (searchOk === 0) {
      return checkFailed(claim, technicalReason(searchErr), searchesUsed);
    }
    return unverifiable(claim, "Searched the live web but could not gather enough to reach a verdict within the step budget.", searchesUsed, true);
  } catch (err) {
    const cls = classifyVerifyError(err);
    // Always surface the real error to the server logs. A swallowed verify error
    // used to leave the run spinning at "Checking" with no visible reason.
    console.error(`[factcheckiq] verify call failed (status=${cls.status ?? "n/a"}, terminal=${cls.terminal}): ${cls.raw}`);
    // Terminal (auth / usage limit / refused request): do not retry, run.ts fails
    // the run fast with this reason. Transient (rate limit, timeout, 5xx): retry.
    return checkFailed(
      claim,
      cls.terminal ? cls.message : `Web verification could not complete (${cls.raw}). Retry.`,
      searchesUsed,
      cls.terminal,
    );
  }
}

/**
 * Split a verify failure into TERMINAL (retrying cannot help: auth rejected,
 * usage/credit limit reached, or a request the API refuses) vs transient (rate
 * limit, timeout, network, provider 5xx). run.ts stops a run on a terminal error
 * and shows the reason, instead of retrying every window until the backstop kills
 * it (the 20 Jul 2026 Anthropic spend-limit silent hang).
 */
function classifyVerifyError(err: unknown): { terminal: boolean; message: string; raw: string; status?: number } {
  const raw = err instanceof Error ? err.message : String(err);
  const status = typeof (err as { status?: unknown })?.status === "number" ? (err as { status: number }).status : undefined;
  const low = raw.toLowerCase();
  if (/usage limit|regain access|credit balance|billing|quota|insufficient|out of credit|payment/.test(low)) {
    return {
      terminal: true,
      status,
      raw,
      message:
        "Verification is unavailable: the verification service's usage limit or credit has been reached. Raise the limit or add credit in the provider account, then re-run.",
    };
  }
  if (status === 401 || status === 403 || /invalid x-api-key|authentication_error|unauthorized|permission/.test(low)) {
    return {
      terminal: true,
      status,
      raw,
      message:
        "Verification is unavailable: the verification service rejected the API key. Check the key in the deployment settings, then re-run.",
    };
  }
  // Other 4xx (not 429 rate limit, not 408 timeout) are refused/malformed requests
  // that a retry will not fix; 429 / 408 / 5xx / network / timeouts are transient.
  if (status !== undefined && status >= 400 && status < 500 && status !== 429 && status !== 408) {
    return {
      terminal: true,
      status,
      raw,
      message: `Verification is unavailable: the request was rejected by the verification service (${raw}). This will not clear on its own; re-run after resolving it.`,
    };
  }
  return { terminal: false, status, raw, message: raw };
}

/**
 * Verify a batch of claims in parallel, capped at VERIFY_CONCURRENCY. Results are
 * returned in the same order as the input; entries are null for claims that were
 * NEVER STARTED because ctx.deadlineMs passed first. Null claims stay 'pending'
 * in the DB, which is exactly what lets a continuation invocation (Phase 5a)
 * resume them on a fresh clock. Individual failures are contained. onClaim
 * (Phase 4.5) fires per finished claim with its input index, so run.ts can flip
 * the matching pending DB row live while later claims are still running.
 */
export async function verifyClaims(
  claims: ClaimToVerify[],
  ctx: VerifyContext,
  onProgress?: (done: number) => void,
  onClaim?: (index: number, result: VerifiedClaim) => void,
): Promise<(VerifiedClaim | null)[]> {
  const results = new Array<VerifiedClaim | null>(claims.length).fill(null);
  let nextIndex = 0;
  let doneCount = 0;

  async function worker() {
    for (;;) {
      const i = nextIndex++;
      if (i >= claims.length) return;
      // Deadline gate: never START a claim past the deadline; leave it null
      // (still pending in the DB) for the next invocation.
      if (ctx.deadlineMs !== undefined && Date.now() >= ctx.deadlineMs) return;
      const result = await verifyClaim(claims[i], ctx);
      results[i] = result;
      doneCount++;
      onClaim?.(i, result);
      onProgress?.(doneCount);
    }
  }

  const workerCount = Math.min(VERIFY_CONCURRENCY, claims.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

// --- internals ---

interface GradeToolInput {
  verdict?: string;
  sources?: Array<{ url?: string; tier?: number; quote?: string; publisher?: string; as_of?: string }>;
  loadBearing?: boolean;
  evidence?: string;
  note?: string;
  injectionAttemptDetected?: boolean;
}

/**
 * A clear, user-facing reason for a claim that could not be web-checked because
 * the research tooling did not deliver — a TECHNICAL failure, not a judgment on
 * the claim. Distinguishes "search ran but errored / was rate-limited" from
 * "search never ran (tool unavailable)" so the report can say which, instead of
 * the overloaded "Unverifiable" (which should mean "we looked and could not
 * confirm"). No em/en dashes: this text is shown to users.
 */
function technicalReason(searchErr: number): string {
  return searchErr > 0
    ? "Couldn't verify: live web search was rate-limited or errored, so no sources could be read. This is a temporary tool issue, not a judgment on the claim. Re-run to check it."
    : "Couldn't verify: the web research tool was unavailable, so no sources could be read. This is a temporary tool issue, not a judgment on the claim. Re-run to check it.";
}

function finalizeVerdict(claim: ClaimToVerify, input: GradeToolInput, searchesUsed: number, searchOk: number, searchErr: number): VerifiedClaim {
  // Defensive (29 Jul 2026): `?? []` only guards null/undefined, NOT a wrong TYPE.
  // A grader that returns `sources` as an object or string made this throw
  // "(input.sources ?? []).filter is not a function", which failed the whole verify
  // call and burned a paid retry (seen live on claude-sonnet-5, eval claim seo-10,
  // searches 8 instead of 4). Semantically neutral: it only changes the path that
  // previously crashed. No verdict logic altered.
  const rawSources = Array.isArray(input.sources) ? input.sources : [];
  const sources: Source[] = rawSources
    .filter((s) => s && typeof s.url === "string" && s.url.length > 0)
    .map((s) => ({
      url: s.url as string,
      tier: typeof s.tier === "number" ? s.tier : 4,
      quote: typeof s.quote === "string" ? s.quote : "",
      publisher: s.publisher,
      as_of: s.as_of,
    }));

  // A full-audit verdict is only real if the live web check actually happened. If
  // NO search succeeded (searchOk === 0) and nothing was fetched, the claim was not
  // assessed, whatever verdict the model typed — surface it as an honest technical
  // "couldn't check" (retryable), never a content verdict like Unverifiable. This is
  // the Kilimanjaro case (21 Jul 2026): the model returned "unverifiable" with zero
  // sources because the web tool was down, and it was wrongly shown as a real
  // verdict. Broadened from the old `searchErr > 0` test so the "search never even
  // ran" variant (searchErr === 0 && searchOk === 0) is caught too.
  if (searchOk === 0 && sources.length === 0) {
    return checkFailed(claim, technicalReason(searchErr), searchesUsed);
  }

  const proposedVerdict: Verdict = VALID_VERDICTS.includes(input.verdict as Verdict)
    ? (input.verdict as Verdict)
    : "unverifiable";

  // Load-bearing is the grader's per-claim judgment (GRADE_TOOL requires it): a
  // claim the surrounding argument leans its weight on, per §1a. This is
  // deliberately NOT `risk === "high"`. Risk tiers many things high (any citation,
  // any quote), but "the Ahrefs study reports 62%" is verified by reading that one
  // study — it is not a load-bearing claim about the world needing two independent
  // corroborators. Forcing risk-high => load-bearing would wrongly downgrade every
  // single-source verified citation/quote/attributed-statistic in the golden set
  // (wb-01, wb-03, wb-09, seo-08, seo-10) to partly_accurate. The clamp still
  // guarantees the relationships that matter in code: no Verified without at least
  // one fetched source, and no load-bearing Verified without two independent domains.
  const loadBearing = input.loadBearing === true;

  const clamp = clampVerdict({ proposedVerdict, sources, mode: "full", loadBearing });
  const baseEvidence = input.evidence?.trim() || "No evidence summary returned by the grader.";
  const evidence = clamp.clamped ? `${baseEvidence} (${clamp.reason})` : baseEvidence;

  return {
    claim: {
      claimText: claim.claimText,
      claimType: claim.claimType,
      section: claim.section,
      risk: claim.risk,
      status: "checked",
      verdict: clamp.verdict,
      sources,
      sourceUrl: sources[0]?.url ?? null,
      sourceTier: sources[0]?.tier ?? null,
      evidence,
      note: input.note?.trim() || null,
    },
    searchesUsed,
    injectionDetected: input.injectionAttemptDetected === true,
    verifyFailed: false,
  };
}

/** The claim could not be assessed because verification tooling failed. Not a verdict. */
function checkFailed(claim: ClaimToVerify, reason: string, searchesUsed: number, terminal = false): VerifiedClaim {
  return {
    claim: {
      claimText: claim.claimText,
      claimType: claim.claimType,
      section: claim.section,
      risk: claim.risk,
      status: "check_failed",
      verdict: null,
      sources: [],
      sourceUrl: null,
      sourceTier: null,
      evidence: reason,
      note: claim.citationEvidence ?? null,
    },
    searchesUsed,
    injectionDetected: false,
    verifyFailed: true,
    terminal,
  };
}

function unverifiable(claim: ClaimToVerify, reason: string, searchesUsed: number, failed: boolean): VerifiedClaim {
  return {
    claim: {
      claimText: claim.claimText,
      claimType: claim.claimType,
      section: claim.section,
      risk: claim.risk,
      status: "checked",
      verdict: "unverifiable",
      sources: [],
      sourceUrl: null,
      sourceTier: null,
      evidence: reason,
      note: claim.citationEvidence ?? null,
    },
    searchesUsed,
    injectionDetected: false,
    verifyFailed: failed,
  };
}

/** Counts server-side web_search invocations in a response, for per-run metering. */
function countSearches(message: Anthropic.Message): number {
  let n = 0;
  for (const block of message.content) {
    if ((block as { type?: string }).type === "server_tool_use" && (block as { name?: string }).name === "web_search") {
      n++;
    }
  }
  return n;
}

/**
 * Distinguishes successful web searches from errored ones (rate limit / unavailable).
 * A web_search_tool_result whose content is an array = results returned (ok); one whose
 * content is a web_search_tool_result_error object = the search failed (err).
 */
function scanSearchResults(message: Anthropic.Message): { ok: number; err: number } {
  let ok = 0;
  let err = 0;
  for (const block of message.content) {
    const b = block as { type?: string; content?: unknown };
    if (b.type !== "web_search_tool_result") continue;
    const c = b.content;
    if (Array.isArray(c)) {
      ok++;
    } else if (c && typeof c === "object" && (c as { type?: string }).type === "web_search_tool_result_error") {
      err++;
    }
  }
  return { ok, err };
}
