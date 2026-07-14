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

  it("flags the Pennebaker 20-min vs 15-min case", () => {
    const claims: Claim[] = [
      { ...base, id: "c1", claimText: "Header stat: 20 min, the Pennebaker dose.", claimType: "statistic" },
      { ...base, id: "c2", claimText: "Dose calculator: Pennebaker, at least 15 min per session.", claimType: "statistic" },
    ];
    const findings = findNumericContradictions(claims);
    expect(findings.length).toBe(1);
    expect(findings[0].claimIds).toEqual(["c1", "c2"]);
  });

  it("does not flag unrelated statistics", () => {
    const claims: Claim[] = [
      { ...base, id: "c1", claimText: "Bing US desktop share is about 9-10%.", claimType: "statistic" },
      { ...base, id: "c2", claimText: "Ghost citations make up 62% of AI citations.", claimType: "statistic" },
    ];
    expect(findNumericContradictions(claims).length).toBe(0);
  });
});
