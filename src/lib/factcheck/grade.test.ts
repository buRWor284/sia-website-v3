// src/lib/factcheck/grade.test.ts
// Unit tests for clampVerdict — the correctness-critical function in the pipeline.
// Run with: npx vitest run src/lib/factcheck/grade.test.ts  (or your existing test runner)

import { describe, expect, it } from "vitest";
import { clampVerdict, countIndependentSources, findNumericContradictions } from "./grade";
import type { Claim, Source } from "./types";

const src = (url: string, quote = "matched text"): Source => ({ url, tier: 2, quote });

describe("clampVerdict", () => {
  it("clamps any non-allowed verdict to unverifiable in citation mode", () => {
    const result = clampVerdict({
      proposedVerdict: "verified",
      sources: [],
      mode: "citation",
      loadBearing: false,
    });
    expect(result.verdict).toBe("unverifiable");
    expect(result.clamped).toBe(true);
  });

  it("allows fabricated in citation mode (fake DOI case)", () => {
    const result = clampVerdict({
      proposedVerdict: "fabricated",
      sources: [],
      mode: "citation",
      loadBearing: false,
    });
    expect(result.verdict).toBe("fabricated");
    expect(result.clamped).toBe(false);
  });

  it("never allows verified with zero sources, even in full-audit mode", () => {
    const result = clampVerdict({
      proposedVerdict: "verified",
      sources: [],
      mode: "full",
      loadBearing: false,
    });
    expect(result.verdict).toBe("unverifiable");
    expect(result.clamped).toBe(true);
  });

  it("downgrades a load-bearing claim with only one independent source", () => {
    const result = clampVerdict({
      proposedVerdict: "verified",
      sources: [src("https://pubmed.ncbi.nlm.nih.gov/11561925/")],
      mode: "full",
      loadBearing: true,
    });
    expect(result.verdict).toBe("partly_accurate");
    expect(result.clamped).toBe(true);
  });

  it("allows verified for a load-bearing claim with two independent sources", () => {
    const result = clampVerdict({
      proposedVerdict: "verified",
      sources: [src("https://pubmed.ncbi.nlm.nih.gov/11561925/"), src("https://pmc.ncbi.nlm.nih.gov/articles/PMC6305886/")],
      mode: "full",
      loadBearing: true,
    });
    expect(result.verdict).toBe("verified");
    expect(result.clamped).toBe(false);
  });

  it("allows verified for a non-load-bearing claim with a single source", () => {
    const result = clampVerdict({
      proposedVerdict: "verified",
      sources: [src("https://quoteinvestigator.com/2016/04/27/worth/")],
      mode: "full",
      loadBearing: false,
    });
    expect(result.verdict).toBe("verified");
    expect(result.clamped).toBe(false);
  });

  it("treats two URLs on the same domain as one independent source", () => {
    const count = countIndependentSources([
      src("https://ahrefs.com/blog/a"),
      src("https://www.ahrefs.com/blog/b"),
    ]);
    expect(count).toBe(1);
  });
});

describe("findNumericContradictions", () => {
  const base = {
    runId: "r1",
    orgId: "o1",
    section: null,
    risk: null,
    status: "checked" as const,
    verdict: null,
    sources: null,
    sourceUrl: null,
    sourceTier: null,
    evidence: null,
    note: null,
    createdAt: "2026-07-14T00:00:00Z",
  };
  const stat = (id: string, claimText: string): Claim => ({ ...base, id, claimText, claimType: "statistic" });

  // --- genuine same-subject conflicts: must still flag ---

  it("flags the Pennebaker 20-min vs 15-min case (same subject, same unit)", () => {
    const claims: Claim[] = [
      stat("c1", "The Pennebaker writing dose is 20 minutes per session."),
      stat("c2", "The recommended Pennebaker writing dose is at least 15 minutes per session."),
    ];
    const findings = findNumericContradictions(claims);
    expect(findings.length).toBe(1);
    expect(findings[0].claimIds).toEqual(["c1", "c2"]);
  });

  it("flags a same-subject count that disagrees (35 vs 36 participants)", () => {
    const claims: Claim[] = [
      stat("c1", "The experiment enrolled 35 participants."),
      stat("c2", "The experiment enrolled 36 participants."),
    ];
    expect(findNumericContradictions(claims).length).toBe(1);
  });

  // --- precision guards: patterns that must NOT be flagged (regressions from 20 Jul 2026) ---

  it("does not flag unrelated statistics", () => {
    const claims: Claim[] = [
      stat("c1", "Bing US desktop share is about 9-10%."),
      stat("c2", "Ghost citations make up 62% of AI citations."),
    ];
    expect(findNumericContradictions(claims).length).toBe(0);
  });

  it("does not flag different search engines in an enumeration (Google vs Bing share)", () => {
    const claims: Claim[] = [
      stat("c1", "As of May 2026, StatCounter put Google at 90.39% of worldwide search across all devices"),
      stat("c2", "As of May 2026, StatCounter put Bing at 5.03% of worldwide search across all devices"),
    ];
    expect(findNumericContradictions(claims).length).toBe(0);
  });

  it("does not flag correlations reported for different AI systems", () => {
    const claims: Claim[] = [
      stat("c1", "In Ahrefs's study, Domain Rating correlation with AI citations landed at just 0.266 for ChatGPT"),
      stat("c2", "In Ahrefs's study, Domain Rating correlation with AI citations landed at 0.285 for AI Mode"),
      stat("c3", "In Ahrefs's study, Domain Rating correlation with AI citations landed at 0.326 for AI Overviews"),
    ];
    expect(findNumericContradictions(claims).length).toBe(0);
  });

  it("does not flag a level against a growth rate (share vs YoY growth)", () => {
    const claims: Claim[] = [
      stat("c1", "AI engines sent under 1% of referral traffic in 2025"),
      stat("c2", "AI referral traffic grew about 357% year over year in 2025"),
    ];
    expect(findNumericContradictions(claims).length).toBe(0);
  });

  it("does not flag a percentage against a count (a year is never the compared number)", () => {
    const claims: Claim[] = [
      stat("c1", "As of May 2026, StatCounter put Google at 90.39% of worldwide search across all devices"),
      stat("c2", "There were 191 billion referrals from Google Search as of June 2025"),
    ];
    expect(findNumericContradictions(claims).length).toBe(0);
  });
});
