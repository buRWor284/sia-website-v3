// src/lib/factcheck/types.ts
// FactcheckIQ | plain types, per FactcheckIQ-Build-Plan-v2.md §5-6
// Types only. Do not re-export from "use server" action files.

export type FactCheckMode = "citation" | "full";

export type InputType = "paste" | "markdown" | "url";

export type RunStatus = "queued" | "running" | "done" | "error";

export type ClaimStatus = "checked" | "skipped";

export type ClaimType = "statistic" | "citation" | "quote" | "fact" | "logic";

export type Risk = "low" | "medium" | "high";

export type Verdict =
  | "verified"
  | "partly_accurate"
  | "misleading"
  | "unverifiable"
  | "inaccurate"
  | "fabricated";

/** Verdicts a claim may carry when checked in "citation" mode (the clamp). */
export const CITATION_MODE_VERDICTS: readonly Verdict[] = [
  "fabricated",
  "inaccurate",
  "unverifiable",
];

export interface Source {
  url: string;
  tier: number;
  /** Required: the exact matched sentence/cell from the source, never a bare pass/fail assertion. */
  quote: string;
  publisher?: string;
  /** Pins live/volatile data (StatCounter etc.) to the date it was fetched. */
  as_of?: string;
}

export interface Claim {
  id: string;
  runId: string;
  orgId: string;
  claimText: string;
  claimType: ClaimType | null;
  section: string | null;
  risk: Risk | null;
  status: ClaimStatus;
  verdict: Verdict | null;
  sources: Source[] | null;
  sourceUrl: string | null;
  sourceTier: number | null;
  evidence: string | null;
  note: string | null;
  createdAt: string;
}

export interface VerdictCounts {
  verified: number;
  partly_accurate: number;
  misleading: number;
  unverifiable: number;
  inaccurate: number;
  fabricated: number;
}

export interface RunProgress {
  phase: string;
  claimsDone: number;
  claimsTotal: number;
}

/**
 * A doc-level contradiction between two claims in the same document (e.g. a
 * header stat and a body stat that disagree). Produced by
 * findNumericContradictions() in grade.ts and surfaced as its own report section.
 */
export interface ConsistencyFinding {
  claimIds: [string, string];
  note: string;
}

export interface RunFlags {
  injectionAttempts?: string[];
  skippedClaims?: number;
  fetchFailures?: string[];
  /** Doc-level consistency pass output (§3 step 6), promoted from the prior `(flags as any)` stopgap. */
  consistencyFindings?: ConsistencyFinding[];
}

export interface RunInput {
  mode: FactCheckMode;
  inputType: InputType;
  title?: string;
  /** Raw pasted or Markdown text. Required unless inputType === "url". */
  text?: string;
  /** Required when inputType === "url"; fetched and normalized to text during intake. */
  sourceUrl?: string;
}

export interface FactCheckRun {
  id: string;
  orgId: string;
  userId: string;
  title: string | null;
  mode: FactCheckMode;
  inputType: InputType;
  inputExcerpt: string | null;
  sourceUrl: string | null;
  status: RunStatus;
  progress: RunProgress | null;
  verdictCounts: VerdictCounts | null;
  readiness: string | null;
  flags: RunFlags | null;
  reportMd: string | null;
  costCents: number | null;
  searchesUsed: number | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Report {
  run: FactCheckRun;
  claims: Claim[];
  markdown: string;
}
