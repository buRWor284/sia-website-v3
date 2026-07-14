// src/lib/factcheck/extract.ts
// FactcheckIQ | claim extraction, FACTCHECK_EXTRACT_MODEL, structured tool call
// Per Build-Plan-v2.md §3 step 2, §6.

import Anthropic from "@anthropic-ai/sdk";
import { FACTCHECK_EXTRACT_MODEL, MAX_CLAIMS_PER_RUN } from "./config";
import { buildSystemPrompt } from "./prompts";
import { EXTRACT_TOOL } from "./prompts";
import type { Claim, ClaimType, Risk } from "./types";

export interface ExtractedClaim {
  claimText: string;
  claimType: ClaimType;
  section: string | null;
  risk: Risk;
}

export interface ExtractResult {
  claims: ExtractedClaim[];
  overCapCount: number;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function extractClaims(documentText: string, runDate: Date = new Date()): Promise<ExtractResult> {
  const system = buildSystemPrompt("citation", runDate); // extraction instructions are mode-independent (see prompts.ts)

  const message = await anthropic.messages.create({
    model: FACTCHECK_EXTRACT_MODEL,
    max_tokens: 8000,
    system,
    tools: [EXTRACT_TOOL as unknown as Anthropic.Tool],
    tool_choice: { type: "tool", name: "record_claims" },
    messages: [
      {
        role: "user",
        content: `Extract every checkable claim (cap: ${MAX_CLAIMS_PER_RUN}).\n\nDOCUMENT UNDER AUDIT:\n"""\n${documentText}\n"""`,
      },
    ],
  });

  const toolUse = message.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "record_claims");
  if (!toolUse) {
    throw new Error("Extraction model did not return a record_claims tool call.");
  }

  const input = toolUse.input as { claims: ExtractedClaim[]; overCapCount?: number };
  const claims = input.claims ?? [];

  // Enforce the cap in code, not just via the prompt: never trust the model to
  // self-limit. Anything beyond MAX_CLAIMS_PER_RUN is reported as over-cap.
  const kept = claims.slice(0, MAX_CLAIMS_PER_RUN);
  const overflow = claims.length - kept.length;

  return {
    claims: kept.map((c) => ({
      claimText: c.claimText,
      claimType: c.claimType,
      section: c.section ?? null,
      risk: c.risk,
    })),
    overCapCount: overflow + (input.overCapCount ?? 0),
  };
}

/** Converts extracted claims into the `status: 'skipped'` rows the plan requires for honesty (§3 "Honesty mechanics"). */
export function buildSkippedClaimPlaceholder(overCapCount: number): Pick<Claim, "claimText" | "claimType" | "section" | "risk" | "status">[] {
  if (overCapCount <= 0) return [];
  return [
    {
      claimText: `${overCapCount} additional claim(s) were found beyond the ${MAX_CLAIMS_PER_RUN}-claim cap and were not checked in this run.`,
      claimType: "fact",
      section: null,
      risk: "low",
      status: "skipped",
    },
  ];
}
