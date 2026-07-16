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
 * the dominant cost driver of a full audit. 3 is enough to corroborate one claim
 * (the two-source rule needs 2 independent sources, +1 for slack).
 */
const MAX_FETCHES_PER_CLAIM = 3;

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
}

export interface VerifiedClaim {
  claim: Omit<Claim, "id" | "runId" | "orgId" | "createdAt">;
  searchesUsed: number;
  injectionDetected: boolean;
  /** True when web verification could not complete for this claim (API/search failure); claim is marked Unverifiable. */
  verifyFailed: boolean;
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
 * the retry.
 */
export async function verifyClaim(claim: ClaimToVerify, ctx: VerifyContext): Promise<VerifiedClaim> {
  const first = await attemptVerify(claim, ctx);
  if (first.claim.status !== "check_failed") return first;

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
        WEB_TOOLS_BETA_HEADER ? { headers: { "anthropic-beta": WEB_TOOLS_BETA_HEADER } } : undefined,
      );

      searchesUsed += countSearches(message);
      const scan = scanSearchResults(message);
      searchOk += scan.ok;
      searchErr += scan.err;
      // Web search attempted but every result errored (rate limit / unavailable):
      // this claim cannot be honestly graded, no matter what verdict the model states.
      const toolUnavailable = searchErr > 0 && searchOk === 0;

      const verdictBlock = message.content.find(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "record_verdict",
      );

      if (verdictBlock) {
        return finalizeVerdict(claim, verdictBlock.input as GradeToolInput, searchesUsed, toolUnavailable);
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

    // Ran out of turns without a verdict. If the tools were unavailable, that is a
    // system failure (check_failed); otherwise it is an honest Unverifiable.
    if (searchErr > 0 && searchOk === 0) {
      return checkFailed(claim, "Live web search was unavailable (rate limited); this claim was not checked. Retry.", searchesUsed);
    }
    return unverifiable(claim, "Verification did not converge on a verdict within the turn budget.", searchesUsed, true);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error during web verification.";
    // An exception mid-verification (timeout, API error) means the claim was never
    // assessed: check_failed, not a verdict.
    return checkFailed(claim, `Web verification could not complete (${reason}). Retry.`, searchesUsed);
  }
}

/**
 * Verify a batch of claims in parallel, capped at VERIFY_CONCURRENCY. Results are
 * returned in the same order as the input. Individual failures are contained.
 */
export async function verifyClaims(claims: ClaimToVerify[], ctx: VerifyContext, onProgress?: (done: number) => void): Promise<VerifiedClaim[]> {
  const results = new Array<VerifiedClaim>(claims.length);
  let nextIndex = 0;
  let doneCount = 0;

  async function worker() {
    for (;;) {
      const i = nextIndex++;
      if (i >= claims.length) return;
      results[i] = await verifyClaim(claims[i], ctx);
      doneCount++;
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

function finalizeVerdict(claim: ClaimToVerify, input: GradeToolInput, searchesUsed: number, toolUnavailable: boolean): VerifiedClaim {
  const sources: Source[] = (input.sources ?? [])
    .filter((s) => typeof s.url === "string" && s.url.length > 0)
    .map((s) => ({
      url: s.url as string,
      tier: typeof s.tier === "number" ? s.tier : 4,
      quote: typeof s.quote === "string" ? s.quote : "",
      publisher: s.publisher,
      as_of: s.as_of,
    }));

  // If web search was unavailable and the model gathered no real sources, the claim
  // was not actually assessed, whatever verdict the model typed. Report it honestly
  // as check_failed (retryable), never as a content verdict like Unverifiable.
  if (toolUnavailable && sources.length === 0) {
    return checkFailed(claim, "Live web search was unavailable (rate limited); this claim was not checked. Retry.", searchesUsed);
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
function checkFailed(claim: ClaimToVerify, reason: string, searchesUsed: number): VerifiedClaim {
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
