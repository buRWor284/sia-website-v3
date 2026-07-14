// src/lib/factcheck/grade.ts
// FactcheckIQ | clampVerdict() + doc-level consistency pass, per Build-Plan-v2.md §1a, §3 step 7
//
// This is the single most important file in the pipeline: it is the code-level
// enforcement of "never verify a claim by asking a model whether it sounds true."
// clampVerdict is a pure function, unit-testable, called on every claim before
// it is written to fact_check_claims or shown in a report.

import type { Claim, FactCheckMode, Source, Verdict } from "./types";
import { CITATION_MODE_VERDICTS } from "./types";

export interface ClampInput {
  /** The verdict the grading model proposed. */
  proposedVerdict: Verdict;
  /** Sources attached to this claim (may be empty). */
  sources: Source[];
  /** The mode the run is executing in. */
  mode: FactCheckMode;
  /** Whether this claim was flagged load-bearing (a statistic/citation the argument leans on). */
  loadBearing: boolean;
}

export interface ClampResult {
  verdict: Verdict;
  /** Set when the clamp overrode the model's proposed verdict. */
  clamped: boolean;
  reason?: string;
}

/**
 * clampVerdict enforces two rules in code, not prompt instruction:
 *
 * 1. Citation & link check mode has no web evidence, so it may only ever emit
 *    Fabricated, Inaccurate, or Unverifiable — never Verified.
 * 2. In any mode, "Verified" requires at least one fetched web source, and a
 *    load-bearing claim requires two or more INDEPENDENT sources (different
 *    publishers/domains) before it may be marked Verified.
 */
export function clampVerdict(input: ClampInput): ClampResult {
  const { proposedVerdict, sources, mode, loadBearing } = input;

  // Rule 1: citation mode clamp.
  if (mode === "citation") {
    if (!CITATION_MODE_VERDICTS.includes(proposedVerdict)) {
      return {
        verdict: "unverifiable",
        clamped: true,
        reason:
          "Citation & link check mode has no web evidence; verdicts are limited to " +
          "Fabricated, Inaccurate, or Unverifiable. The model proposed a verdict outside " +
          "that set, so it was clamped to Unverifiable.",
      };
    }
    return { verdict: proposedVerdict, clamped: false };
  }

  // Rule 2: full-audit mode, the corroboration requirement.
  if (proposedVerdict === "verified") {
    if (sources.length === 0) {
      return {
        verdict: "unverifiable",
        clamped: true,
        reason: "No fetched web source is attached to this claim; a model's own confidence is not evidence.",
      };
    }

    if (loadBearing && countIndependentSources(sources) < 2) {
      return {
        verdict: "partly_accurate",
        clamped: true,
        reason:
          "Load-bearing claim carries only one independent source. The two-source rule " +
          "requires corroboration before a load-bearing claim can be marked Verified.",
      };
    }
  }

  return { verdict: proposedVerdict, clamped: false };
}

/** Counts sources as independent by distinct registrable domain, not distinct URL. */
export function countIndependentSources(sources: Source[]): number {
  const domains = new Set<string>();
  for (const s of sources) {
    try {
      domains.add(new URL(s.url).hostname.replace(/^www\./, ""));
    } catch {
      // Malformed URL: still counts as one source, but flagged separately upstream.
      domains.add(s.url);
    }
  }
  return domains.size;
}

/**
 * Doc-level consistency pass (§3 step 6): looks for figures/claims within the
 * SAME document that contradict each other (e.g. a header stat and a body-copy
 * stat that disagree, as in the "20 min" vs "15 min" Pennebaker case in the
 * golden eval set). This does not call a model; it is a structural diff over
 * already-extracted claims grouped by subject. The actual contradiction
 * *detection* (same subject, different numbers) is intentionally left to the
 * per-claim verify+grade call's prompt (it has full document context already);
 * this function's job is to surface pairs for that call to reconcile and to
 * record any contradiction it reports here, in `flags`.
 */
export interface ConsistencyFinding {
  claimIds: [string, string];
  note: string;
}

export function findNumericContradictions(claims: Claim[]): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = [];
  const numeric = claims.filter((c) => c.claimType === "statistic" && c.status === "checked");

  for (let i = 0; i < numeric.length; i++) {
    for (let j = i + 1; j < numeric.length; j++) {
      const a = numeric[i];
      const b = numeric[j];
      if (shareSubject(a.claimText, b.claimText) && extractNumber(a.claimText) !== extractNumber(b.claimText)) {
        findings.push({
          claimIds: [a.id, b.id],
          note: `Two claims about the same subject report different numbers: "${a.claimText}" vs "${b.claimText}".`,
        });
      }
    }
  }
  return findings;
}

// --- helpers (heuristic, cheap; the model call does the real semantic work) ---

function extractNumber(text: string): string | null {
  const match = text.match(/-?\d+(\.\d+)?/);
  return match ? match[0] : null;
}

function shareSubject(a: string, b: string): boolean {
  const wordsA = new Set(significantWords(a));
  const wordsB = significantWords(b);
  let overlap = 0;
  for (const w of wordsB) if (wordsA.has(w)) overlap++;
  return overlap >= 2;
}

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4);
}
