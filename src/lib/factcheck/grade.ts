// src/lib/factcheck/grade.ts
// FactcheckIQ | clampVerdict() + doc-level consistency pass, per Build-Plan-v2.md §1a, §3 step 7
//
// This is the single most important file in the pipeline: it is the code-level
// enforcement of "never verify a claim by asking a model whether it sounds true."
// clampVerdict is a pure function, unit-testable, called on every claim before
// it is written to fact_check_claims or shown in a report.

import type { Claim, ConsistencyFinding, FactCheckMode, Source, Verdict } from "./types";
import { CITATION_MODE_VERDICTS } from "./types";

// ConsistencyFinding is defined in types.ts (so RunFlags can carry it without a
// circular import); re-exported here for callers that import it from grade.ts.
export type { ConsistencyFinding } from "./types";

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
 * Doc-level consistency pass (§3 step 6): surfaces pairs of claims in the SAME
 * document that assert the same measurement with different values (the "20 min"
 * vs "15 min" Pennebaker case in the golden set). It calls no model; it is a
 * deterministic structural diff over the extracted statistic claims.
 *
 * In citation mode this output goes straight into the report with no per-claim
 * model to reconcile it, so it is tuned for PRECISION over recall: a pair is
 * only flagged when the two claims are the same subject, in the same unit, over
 * the same timeframe, with no distinguishing entity (different search engines or
 * AI systems) and no level-vs-rate mismatch (a share vs a growth rate). Subtler
 * contradictions that need semantic judgement are left to the full audit rather
 * than guessed at here.
 *
 * Rewritten 20 Jul 2026: the previous version compared the FIRST number in each
 * claim (usually a YEAR such as "May 2026") across any two statistics that
 * shared two long words. On a clean document that false-flagged unrelated
 * figures as contradictions: a market-share percentage against a referral count,
 * three AI systems' correlations against each other, a traffic share against a
 * growth rate. The rules below exist to make each of those a non-match.
 */
export function findNumericContradictions(claims: Claim[]): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = [];
  const numeric = claims.filter((c) => c.claimType === "statistic" && c.status === "checked");

  for (let i = 0; i < numeric.length; i++) {
    for (let j = i + 1; j < numeric.length; j++) {
      const a = numeric[i];
      const b = numeric[j];
      const ma = primaryMeasurement(a.claimText);
      const mb = primaryMeasurement(b.claimText);
      if (!ma || !mb) continue; // no comparable figure in one of them
      if (ma.unit !== mb.unit) continue; // percent vs count vs ratio vs minutes: not the same quantity
      if (valuesAgree(ma.value, mb.value)) continue; // same number: nothing to reconcile
      if (!sameSubject(a.claimText, b.claimText)) continue; // must be about the same thing
      if (hasDistinguishingEntity(a.claimText, b.claimText)) continue; // different engine / AI system / source
      if (levelVsRateMismatch(a.claimText, b.claimText)) continue; // a level vs a growth rate
      if (differentTimeframe(a.claimText, b.claimText)) continue; // pinned to different as-of dates
      findings.push({
        claimIds: [a.id, b.id],
        note: `Two claims about the same subject report different numbers: "${a.claimText}" vs "${b.claimText}".`,
      });
    }
  }
  return findings;
}

// --- helpers (heuristic, cheap, deterministic; precision-tuned) ---

interface Measurement {
  value: number;
  /** A coarse unit bucket. Two measurements only compare when these are equal. */
  unit: string;
}

const MONTHS = new Set([
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december", "jan", "feb", "mar", "apr",
  "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec",
]);

/** Words that carry no subject meaning, excluded from the subject signature. */
const STOPWORDS = new Set([
  "about", "above", "across", "after", "against", "along", "among", "around",
  "because", "before", "below", "between", "could", "during", "every", "found",
  "from", "their", "there", "these", "those", "through", "under", "until",
  "where", "which", "while", "would", "roughly", "reported", "report", "study",
  "landed", "showed", "other", "being", "that", "this", "with", "than", "over",
  "year", "years", "just", "only", "some", "into", "onto", "upon", "each", "also",
  "put", "at",
]);

/** Unit words, excluded from the subject signature so they cannot inflate overlap. */
const UNIT_WORDS = new Set([
  "percent", "billion", "million", "thousand", "minute", "minutes", "min", "mins",
  "hour", "hours", "day", "days", "week", "weeks", "point", "points",
]);

/**
 * The single salient (value, unit) a statistic claim asserts. The extractor
 * produces atomic claims (one figure each), so there is normally exactly one.
 * A four-digit year and a bare month-year date are never treated as the figure,
 * which is what stops "May 2026" from being read as the number 2026.
 */
function primaryMeasurement(text: string): Measurement | null {
  const t = text.toLowerCase();

  // percentage
  let m = t.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/);
  if (m) return { value: parseFloat(m[1]), unit: "percent" };

  // scale words (a count magnitude)
  m = t.match(/(\d+(?:\.\d+)?)\s*(billion|bn|million|thousand)\b/);
  if (m) return { value: parseFloat(m[1]), unit: `scale:${m[2] === "bn" ? "billion" : m[2]}` };

  // durations
  m = t.match(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|days?|weeks?)\b/);
  if (m) return { value: parseFloat(m[1]), unit: `time:${m[2].replace(/s$/, "").replace(/^min$/, "minute")}` };

  // any remaining number that is not a year and not a month-anchored date
  const re = /(\d+(?:\.\d+)?)/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(t))) {
    const raw = mm[1];
    const val = parseFloat(raw);
    const isYear = /^\d{4}$/.test(raw) && val >= 1900 && val <= 2099;
    const preceding = t.slice(0, mm.index).trim().split(/\s+/).pop() ?? "";
    if (isYear || MONTHS.has(preceding)) continue;
    // a bare fraction below one (a correlation coefficient etc.) vs a plain count
    return { value: val, unit: val < 1 ? "ratio" : "count" };
  }
  return null;
}

function valuesAgree(x: number, y: number): boolean {
  return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
}

/** Subject words = meaningful tokens with numbers, units, months and stopwords removed. */
function subjectWords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (w) => w.length >= 5 && !/\d/.test(w) && !STOPWORDS.has(w) && !UNIT_WORDS.has(w) && !MONTHS.has(w),
    );
  return new Set(words);
}

/** Same subject = a substantial shared-word core (a near-paraphrase), not just any two words. */
function sameSubject(a: string, b: string): boolean {
  const A = subjectWords(a);
  const B = subjectWords(b);
  if (A.size === 0 || B.size === 0) return false;
  let shared = 0;
  for (const w of B) if (A.has(w)) shared++;
  return shared >= 2 && shared >= 0.5 * Math.min(A.size, B.size);
}

/** Brand and product names a claim may be about. Case-insensitive substring match. */
const KNOWN_ENTITIES = [
  "google", "bing", "yahoo", "yandex", "duckduckgo", "baidu", "ecosia",
  "chatgpt", "gemini", "claude", "perplexity", "copilot", "grok",
  "ai mode", "ai overviews", "ai overview",
  "brightedge", "similarweb", "demandsage", "statcounter", "semrush", "ahrefs",
  "openai", "anthropic", "meta", "microsoft",
];

/** The set of entities a claim names: known brands plus non-initial capitalized tokens. */
function entities(text: string): Set<string> {
  const set = new Set<string>();
  const low = text.toLowerCase();
  for (const e of KNOWN_ENTITIES) if (low.includes(e)) set.add(e);
  const tokens = text.split(/\s+/);
  tokens.forEach((tok, idx) => {
    const clean = tok.replace(/[^A-Za-z]/g, "");
    if (clean.length < 2 || idx === 0) return; // a sentence-initial capital is not a reliable entity signal
    if (MONTHS.has(clean.toLowerCase())) return;
    if (/^[A-Z][a-zA-Z]+$/.test(clean) || /^[A-Z]{2,}$/.test(clean)) set.add(clean.toLowerCase());
  });
  return set;
}

/** True when each claim names an entity the other does not (Google vs Bing, ChatGPT vs AI Mode). */
function hasDistinguishingEntity(a: string, b: string): boolean {
  const A = entities(a);
  const B = entities(b);
  let aOnly = false;
  let bOnly = false;
  for (const e of A) if (!B.has(e)) aOnly = true;
  for (const e of B) if (!A.has(e)) bOnly = true;
  return aOnly && bOnly;
}

const RATE_RE =
  /\b(grew|grow|grows|growing|growth|year over year|yoy|per year|per annum|annually|cagr|increase[ds]?|increasing|rose|rising|declin\w*|dropped|drop|falling|fell|up \d|down \d)\b/;

/** One claim describes a change or rate while the other describes a level: not the same quantity. */
function levelVsRateMismatch(a: string, b: string): boolean {
  return RATE_RE.test(a.toLowerCase()) !== RATE_RE.test(b.toLowerCase());
}

function years(text: string): Set<string> {
  const set = new Set<string>();
  const re = /\b(?:19|20)\d{2}\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) set.add(m[0]);
  return set;
}

/** True when both claims are pinned to a year and those years do not overlap. */
function differentTimeframe(a: string, b: string): boolean {
  const ya = years(a);
  const yb = years(b);
  if (ya.size === 0 || yb.size === 0) return false;
  for (const y of ya) if (yb.has(y)) return false; // a shared year means the same timeframe
  return true;
}
