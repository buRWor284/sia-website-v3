/**
 * What to tell a customer when the AI provider refuses a call.
 *
 * Added 2026-10-07 (EMOS MCP Session 3). Until now several cores passed the
 * provider's own error text straight through. On 6 Oct that put "Your credit
 * balance is too low to access the Anthropic API. Please go to Plans & Billing"
 * in front of an EMOS user, who would reasonably read it as THEIR bill. The
 * provider's account is EMOS's business, never the customer's: the raw text is
 * logged for us and a plain EMOS-side sentence goes to the caller.
 *
 * Pure module: no imports, safe on any surface.
 */

export type AiFailureKind = "billing" | "busy" | "setup" | "request" | "other";

export function classifyAiError(status: number | null | undefined, message?: string | null): AiFailureKind {
  const m = (message ?? "").toLowerCase();
  if (status === 402 || /credit balance|plans\s*(&|and)\s*billing|billing|purchase credits|payment/.test(m)) return "billing";
  if (status === 401 || status === 403 || /api[- ]?key|authentication|permission/.test(m)) return "setup";
  if (status === 429 || status === 529 || status === 503 || /overloaded|rate limit/.test(m)) return "busy";
  if (status === 400 || status === 404 || status === 413) return "request";
  return "other";
}

const MESSAGES: Record<AiFailureKind, string> = {
  billing:
    "EMOS could not reach its AI service. The problem is on EMOS's side (our AI provider account), not your EMOS plan or payment. Please try again later; if it keeps happening, tell EMOS support.",
  setup:
    "EMOS's AI service is not set up correctly on our side, so this could not run. It is not a problem with your account. Please tell EMOS support.",
  busy: "The AI service is busy right now. Please try again in a minute.",
  request: "The AI service could not process this request. Please try again; if it keeps happening, tell EMOS support.",
  other: "The AI service returned an error. Please try again in a moment.",
};

/**
 * The sentence for the caller. Logs the provider's own words (for us) under
 * `where`, and never returns them.
 */
export function friendlyAiError(where: string, status: number | null | undefined, message?: string | null): string {
  const kind = classifyAiError(status, message);
  console.error(`[ai] ${where}: provider error ${status ?? "?"} (${kind}): ${message ?? "no message"}`);
  return MESSAGES[kind];
}

export const aiFailureMessage = (kind: AiFailureKind): string => MESSAGES[kind];

/**
 * Safety net for an error string that was built somewhere else: if it still
 * carries the provider's billing or key wording, swap it for the EMOS-side
 * sentence. Anything else is returned unchanged.
 */
export function scrubAiError(text: string): string {
  if (/credit balance|plans\s*(&|and)\s*billing|anthropic|x-api-key|api[_ -]?key/i.test(text)) {
    return MESSAGES[classifyAiError(null, text)];
  }
  return text;
}
