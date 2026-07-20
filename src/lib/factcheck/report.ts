// src/lib/factcheck/report.ts
// FactcheckIQ | Markdown report, counts, readiness, per Build-Plan-v2.md §3 step 7

import type { Claim, FactCheckMode, RunFlags, VerdictCounts } from "./types";

export function countVerdicts(claims: Claim[]): VerdictCounts {
  const counts: VerdictCounts = {
    verified: 0,
    partly_accurate: 0,
    misleading: 0,
    unverifiable: 0,
    inaccurate: 0,
    fabricated: 0,
  };
  for (const c of claims) {
    if (c.status === "checked" && c.verdict) counts[c.verdict]++;
  }
  return counts;
}

/** DOI or bare-URL detectors, kept in step with the ones runCitationGate checks. */
const REF_DOI_RE = /(?:doi\.org\/|doi:\s*)?10\.\d{4,9}\/[^\s"'<>)]+/i;
const REF_URL_RE = /https?:\/\/[^\s"'<>)]+/i;

/**
 * Whether the document holds anything the deterministic gate can actually check:
 * at least one DOI or link in a checked claim. When this is false in citation
 * mode the whole run had nothing to verify (named-but-unlinked sources only), and
 * the report says so plainly instead of listing rows of identical "no link" rows.
 */
export function hasCheckableReferences(claims: Claim[]): boolean {
  return claims.some((c) => c.status === "checked" && (REF_DOI_RE.test(c.claimText) || REF_URL_RE.test(c.claimText)));
}

export function computeReadiness(counts: VerdictCounts, mode: FactCheckMode, citationHadReferences = true): string {
  if (counts.fabricated > 0) return "Not publishable: fabricated claims found.";
  if (mode === "citation") {
    if (!citationHadReferences) {
      return "Citation & link check found no links or DOIs to check. This document names its sources in text only, so nothing could be verified in this mode. Add the source links, or run a full audit to check the statistics.";
    }
    return counts.inaccurate > 0 || counts.unverifiable > 0
      ? "Citation & link check only. This does not clear the document for publishing; statistics, quotes, and facts have not been verified."
      : "Citation & link check passed with no issues found. Run a full audit before publishing.";
  }
  if (counts.inaccurate > 0 || counts.misleading > 0) return "Not publish-ready: inaccurate or misleading claims found.";
  if (counts.unverifiable > 2) return "Caution: several claims could not be verified. Review before publishing.";
  return "Publish-ready: no fabricated, inaccurate, or misleading claims found in this pass.";
}

export function buildReportMarkdown(params: {
  title: string | null;
  mode: FactCheckMode;
  claims: Claim[];
  flags: RunFlags | null;
  runDate: Date;
}): string {
  const { title, mode, claims, flags, runDate } = params;
  const counts = countVerdicts(claims);
  const checked = claims.filter((c) => c.status === "checked");
  const skipped = claims.filter((c) => c.status === "skipped");
  const incomplete = claims.filter((c) => c.status === "check_failed");
  const citationHadReferences = mode === "citation" ? hasCheckableReferences(checked) : true;
  const readiness = computeReadiness(counts, mode, citationHadReferences);

  const lines: string[] = [];
  lines.push(`# Fact-check report${title ? `: ${title}` : ""}`);
  lines.push("");
  lines.push(`**Mode:** ${mode === "citation" ? "Citation & link check" : "Full audit"}`);
  lines.push(`**Run date:** ${runDate.toISOString().slice(0, 10)}`);
  lines.push(`**Readiness:** ${readiness}`);
  lines.push("");
  if (mode === "citation" && !citationHadReferences && checked.length > 0) {
    lines.push(
      "> **Nothing to check in this mode.** This document contains no links or DOIs, so the citation and link check had nothing to verify. It checks URLs and DOIs against Crossref, OpenAlex, DOAJ, and Retraction Watch; it does not judge whether a statistic is correct, and it cannot verify a source that is named in text but not linked (for example \"StatCounter, May 2026\" or \"Ahrefs, Dec 2025\"). To check the numbers in this document, add the source links and re-run, or run a full audit.",
    );
    lines.push("");
  }
  lines.push(
    mode === "citation"
      ? "**What was checked:** links resolve; DOIs exist and match the cited paper; journals are legitimate; papers are not retracted. **What was not checked:** whether any statistic, quote, or fact is actually true. Run a full audit before publishing."
      : "**What was checked:** citations, statistics, quotes, and facts, verified against independent live sources.",
  );
  lines.push("");
  lines.push(
    `**Verdict counts:** Verified ${counts.verified} · Partly accurate ${counts.partly_accurate} · Misleading ${counts.misleading} · Unverifiable ${counts.unverifiable} · Inaccurate ${counts.inaccurate} · Fabricated ${counts.fabricated}`,
  );
  if (skipped.length > 0) {
    lines.push(`**Not checked (over cap):** ${skipped.length} claim(s).`);
  }
  if (incomplete.length > 0) {
    lines.push(`**Check incomplete (system busy):** ${incomplete.length} claim(s) could not be verified because live web search was temporarily unavailable. These are not verdicts, retry them.`);
  }
  if (flags?.injectionAttempts?.length) {
    lines.push(`**Prompt injection attempts detected in fetched content:** ${flags.injectionAttempts.length}.`);
  }
  if (flags?.fetchFailures?.length) {
    lines.push(`**Fetch failures during verification:** ${flags.fetchFailures.length} (affected claims marked Unverifiable).`);
  }
  lines.push("");
  lines.push("## Claims");
  lines.push("");
  lines.push("| # | Claim | Verdict | Evidence | Sources |");
  lines.push("|---|---|---|---|---|");
  checked.forEach((c, i) => {
    const sources = (c.sources ?? []).map((s) => `[link](${s.url})${s.as_of ? ` (as of ${s.as_of})` : ""}`).join(", ") || "—";
    lines.push(`| ${i + 1} | ${escapeCell(c.claimText)} | ${verdictLabel(c.verdict)} | ${escapeCell(c.evidence ?? "")} | ${sources} |`);
  });
  if (skipped.length > 0) {
    lines.push("");
    lines.push(`_${skipped.length} claim(s) beyond the ${skipped.length + checked.length > 40 ? "40-claim" : ""} cap were not checked in this run._`);
  }
  if (incomplete.length > 0) {
    lines.push("");
    lines.push("## Check incomplete (retry)");
    lines.push("");
    lines.push("Live web search was temporarily unavailable for these claims (rate limited or timed out), so they were not assessed. This is a system state, not a verdict on the claim. Re-run to check them.");
    lines.push("");
    incomplete.forEach((c) => lines.push(`- ${escapeCell(c.claimText)}`));
  }
  if (flags?.consistencyFindings?.length) {
    lines.push("");
    lines.push("## Consistency findings");
    lines.push("");
    lines.push("Claims within this document that disagree with each other. Reconcile these before publishing, even where each figure is individually defensible.");
    lines.push("");
    for (const f of flags.consistencyFindings) {
      lines.push(`- ${escapeCell(f.note)}`);
    }
  }
  lines.push("");
  lines.push("_AI-assisted verification. Review before publishing._");

  return lines.join("\n");
}

function verdictLabel(v: Claim["verdict"]): string {
  if (!v) return "—";
  return v
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
