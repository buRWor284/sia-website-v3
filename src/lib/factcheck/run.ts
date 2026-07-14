// src/lib/factcheck/run.ts
// FactcheckIQ | orchestrator, per Build-Plan-v2.md §3
//
// Citation & link check mode is fully implemented here (Phase 2). Full-audit
// mode's verify+grade step (Phase 3, verify.ts) does not exist yet — calling
// run() with mode "full" throws a clear NotImplemented error rather than
// silently doing a partial job.

import { extractClaims, buildSkippedClaimPlaceholder } from "./extract";
import { normalizeInput } from "./intake";
import { checkCitation } from "./citations";
import { checkLinks, extractDoi } from "./links";
import { clampVerdict, findNumericContradictions } from "./grade";
import { buildReportMarkdown, countVerdicts, computeReadiness } from "./report";
import { createRun, insertClaims, updateRunStatus } from "./store";
import type { Claim, ClaimType, FactCheckMode, InputType, Risk, RunFlags, Verdict } from "./types";

export interface RunParams {
  orgId: string;
  userId: string;
  mode: FactCheckMode;
  inputType: InputType;
  title?: string;
  text?: string;
  url?: string;
}

export async function startRun(params: RunParams): Promise<string> {
  const runId = await createRun({
    orgId: params.orgId,
    userId: params.userId,
    input: {
      mode: params.mode,
      inputType: params.inputType,
      title: params.title,
      text: params.text,
      sourceUrl: params.url,
    },
  });
  return runId;
}

/** The actual worker. Called from the process route via waitUntil, or directly for a retry. */
export async function processRun(runId: string, params: RunParams): Promise<void> {
  const runDate = new Date();
  try {
    await updateRunStatus(runId, { status: "running", progress: { phase: "intake", claimsDone: 0, claimsTotal: 0 } });

    const intake = await normalizeInput(params.inputType, { text: params.text, url: params.url });

    await updateRunStatus(runId, { progress: { phase: "extract", claimsDone: 0, claimsTotal: 0 } });
    const extraction = await extractClaims(intake.text, runDate);

    await updateRunStatus(runId, {
      progress: { phase: "citation_gate", claimsDone: 0, claimsTotal: extraction.claims.length },
    });

    const flags: RunFlags = { skippedClaims: extraction.overCapCount };
    const gradedClaims: Omit<Claim, "id" | "runId" | "orgId" | "createdAt">[] = [];

    for (const [i, claim] of extraction.claims.entries()) {
      const graded = await runCitationGate(claim.claimText, claim.claimType, claim.section, claim.risk, params.mode);
      gradedClaims.push(graded);
      await updateRunStatus(runId, {
        progress: { phase: "citation_gate", claimsDone: i + 1, claimsTotal: extraction.claims.length },
      });
    }

    if (params.mode === "full") {
      // Phase 3 (verify.ts) doesn't exist yet. Fail loudly and specifically,
      // rather than silently returning citation-only results labeled "full audit" —
      // that would be exactly the overclaiming the clamp exists to prevent.
      throw new Error(
        "Full audit mode requires verify.ts (Phase 3), which has not been built yet. " +
          "Only 'citation' mode is available in this build.",
      );
    }

    const skipped = buildSkippedClaimPlaceholder(extraction.overCapCount);
    const allClaims = [...gradedClaims, ...skipped];

    const consistency = findNumericContradictions(
      allClaims.map((c, i) => ({ ...c, id: `tmp-${i}`, runId, orgId: params.orgId, createdAt: runDate.toISOString() })),
    );
    if (consistency.length > 0) {
      flags.injectionAttempts = flags.injectionAttempts ?? [];
      // Consistency findings are stored in flags for now (no dedicated column);
      // Phase 3 promotes this into its own doc-level pass output.
      (flags as any).consistencyFindings = consistency;
    }

    await insertClaims(runId, params.orgId, allClaims);

    const counts = countVerdicts(
      allClaims.map((c, i) => ({ ...c, id: `tmp-${i}`, runId, orgId: params.orgId, createdAt: runDate.toISOString() })),
    );
    const readiness = computeReadiness(counts, params.mode);
    const reportMd = buildReportMarkdown({
      title: params.title ?? intake.title,
      mode: params.mode,
      claims: allClaims.map((c, i) => ({ ...c, id: `tmp-${i}`, runId, orgId: params.orgId, createdAt: runDate.toISOString() })),
      flags,
      runDate,
    });

    await updateRunStatus(runId, {
      status: "done",
      progress: { phase: "done", claimsDone: allClaims.length, claimsTotal: allClaims.length },
      verdictCounts: counts,
      readiness,
      flags,
      reportMd,
    });
  } catch (err) {
    await updateRunStatus(runId, {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error during fact-check run.",
    });
    throw err;
  }
}

/**
 * Citation & link check for one claim: resolves any DOI/URL in the claim text
 * against Crossref/OpenAlex/DOAJ and checks any bare links, then clamps the
 * verdict. This never calls a model to judge truth — it is pure deterministic
 * evidence, exactly as citation mode promises.
 */
async function runCitationGate(
  claimText: string,
  claimType: ClaimType,
  section: string | null,
  risk: Risk,
  mode: FactCheckMode,
): Promise<Omit<Claim, "id" | "runId" | "orgId" | "createdAt">> {
  const doi = extractDoi(claimText);
  const urlMatch = claimText.match(/https?:\/\/[^\s"'<>)]+/);

  let proposedVerdict: Verdict = "unverifiable";
  let evidence = "No DOI or link found in this claim to check deterministically.";
  const sources: Claim["sources"] = [];

  if (doi) {
    const result = await checkCitation({ doi });
    if (!result.exists) {
      proposedVerdict = "fabricated";
      evidence = `DOI ${doi} does not resolve in Crossref or OpenAlex.`;
    } else if (result.retracted) {
      proposedVerdict = "fabricated";
      evidence = `DOI ${doi} resolves to a paper flagged as retracted.`;
    } else if (result.matchesClaim === false) {
      proposedVerdict = "fabricated";
      evidence = `DOI ${doi} resolves to "${result.resolvedTitle}", which does not match what the claim attributes to it.`;
    } else {
      proposedVerdict = "unverifiable"; // exists + not obviously wrong is still not "verified" without web evidence
      evidence = `DOI ${doi} resolves to "${result.resolvedTitle}" (${result.source}). Citation mode cannot confirm the claim's content is accurately represented; run a full audit.`;
    }
    if (result.resolvedTitle) {
      sources.push({ url: `https://doi.org/${doi}`, tier: 1, quote: result.resolvedTitle, as_of: new Date().toISOString().slice(0, 10) });
    }
  } else if (urlMatch) {
    const [linkResult] = await checkLinks([urlMatch[0]]);
    if (!linkResult.resolved) {
      proposedVerdict = "inaccurate";
      evidence = `Link ${urlMatch[0]} did not resolve (${linkResult.statusCode ?? linkResult.error}).`;
    } else {
      evidence = `Link ${urlMatch[0]} resolves (HTTP ${linkResult.statusCode}). Citation mode cannot confirm the linked page supports the claim; run a full audit.`;
    }
  }

  const clamp = clampVerdict({ proposedVerdict, sources, mode, loadBearing: risk === "high" });

  return {
    claimText,
    claimType,
    section,
    risk,
    status: "checked",
    verdict: clamp.verdict,
    sources,
    sourceUrl: sources[0]?.url ?? (urlMatch ? urlMatch[0] : null),
    sourceTier: sources[0]?.tier ?? null,
    evidence: clamp.clamped ? `${evidence} (${clamp.reason})` : evidence,
    note: null,
  };
}
