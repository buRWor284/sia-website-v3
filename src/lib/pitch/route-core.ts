/**
 * PressIQ — shared server route core (Phase P6, Unified-Gate-Freemium RFP v1.1).
 *
 * ONE copy of the request-handling logic behind BOTH pitch-score routes:
 *   /api/pitch-score           (public: Turnstile + unified quota)
 *   /api/emos-platform/pitch-score  (platform: Clerk EMOS guard)
 *
 * The routes stay separate URLs with separate guards (public stays login-free —
 * RFP §4.5/§9); everything after the guard lives here so fixes land once. The
 * scoring engine (metrics/scorePrompt/composite) was already shared — this
 * collapses the duplicated request handler (validation + the single Anthropic
 * call + compose).
 *
 * History lesson this file exists to prevent: the dashboard route silently sat
 * on maxDuration = 30 while the public route declared none, yet the tool's own
 * loader tells users "a full analysis typically takes 30-60 seconds" — a latent
 * 504 on both surfaces. Routes calling this MUST set maxDuration = 60.
 */
import { PITCH_MODEL } from "./config";
import { computeMetrics, resolveSubject, scoreLayer1 } from "./metrics";
import { buildUserPrompt, parseAiResult, SCORE_TOOL, SYSTEM_PROMPT } from "./scorePrompt";
import { composeScore } from "./composite";
import {
  EMPTY_BRAND,
  type BrandSignals,
  type PitchInput,
  type Platform,
  type ScoreResponse,
} from "./types";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
export const MAX_PITCH_CHARS = 8000;

/** Valid platform ids — unified across surfaces. The dashboard route previously
 * omitted "direct" (added 08 Jul 2026 for standalone outreach); once the
 * dashboard uses the full input core it emits platform:"direct" for standalone
 * pitches, so both routes must accept it. */
const PLATFORM_IDS: Platform[] = ["haro", "qwoted", "sos", "featured", "b2bwriter", "direct"];

export function coerceBrand(v: unknown): BrandSignals {
  const o = (typeof v === "object" && v ? v : {}) as Record<string, unknown>;
  return {
    website: !!o.website,
    bylines: !!o.bylines,
    youtube: !!o.youtube,
    speaking: !!o.speaking,
    caseStudies: !!o.caseStudies,
    linkedin: !!o.linkedin,
  };
}

export type PitchValidation =
  | { ok: true; input: PitchInput }
  | { ok: false; error: string; status: number };

/**
 * Parse + validate a raw POST body into a PitchInput.
 *   - forceStore: dashboard always stores (the user's own history).
 *   - withTurnstile: public forwards the token to the guard.
 * Error copy is unified here (the dashboard route used to say "~1,000 words").
 */
export function parsePitchInput(
  raw: Record<string, unknown>,
  opts?: { forceStore?: boolean; withTurnstile?: boolean },
): PitchValidation {
  const pitch = typeof raw.pitch === "string" ? raw.pitch : "";
  if (!pitch.trim() || pitch.trim().length < 40) {
    return { ok: false, error: "Paste a pitch of at least a few sentences to score it.", status: 400 };
  }
  if (pitch.length > MAX_PITCH_CHARS) {
    return {
      ok: false,
      error: "That pitch is too long to score. Keep it under 8,000 characters (about 1,300 words).",
      status: 400,
    };
  }

  const platform = (PLATFORM_IDS.includes(String(raw.platform) as Platform)
    ? (raw.platform as Platform)
    : "haro") as Platform;

  const input: PitchInput = {
    pitch,
    query: typeof raw.query === "string" ? raw.query : undefined,
    subject: typeof raw.subject === "string" ? raw.subject : undefined,
    platform,
    brandSignals: raw.brandSignals ? coerceBrand(raw.brandSignals) : EMPTY_BRAND,
    store: opts?.forceStore ? true : raw.store !== false,
    pitchMode: raw.pitchMode === "query" ? "query" : "standalone",
    turnstileToken:
      opts?.withTurnstile && typeof raw.turnstileToken === "string" ? raw.turnstileToken : undefined,
  };
  return { ok: true, input };
}

export type ScoreRunResult =
  | { ok: true; result: ScoreResponse }
  | { ok: false; error: string; status: number };

/**
 * Run the full score: Layer-1 (deterministic) + one structured Anthropic
 * tool-use call (Layers 2-3 + Relevance) + the composite roll-up. `usage` is the
 * per-surface block each route computes from its own guard (public: quota;
 * dashboard: unmetered {999,"email"}) — it is woven INTO composeScore, not
 * attached afterwards. Uses the public route's safe, generic error copy.
 */
export async function runScoreRequest(
  input: PitchInput,
  usage: ScoreResponse["usage"],
): Promise<ScoreRunResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("pitch-score: ANTHROPIC_API_KEY is not set");
    return { ok: false, error: "Scoring is temporarily unavailable. Please try again later.", status: 500 };
  }

  // Layer 1 — deterministic (pure; identical to the client live meters).
  const subject = resolveSubject(input.pitch, input.subject);
  const metrics = computeMetrics(input.pitch, subject);
  const l1 = scoreLayer1(metrics);

  // Layers 2-3 + Relevance — one structured tool-use call (direct fetch, no SDK).
  let aiContent: Array<{ type: string; name?: string; input?: unknown }>;
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: PITCH_MODEL,
        max_tokens: 3500,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        tools: [SCORE_TOOL],
        tool_choice: { type: "tool", name: SCORE_TOOL.name },
        messages: [{ role: "user", content: buildUserPrompt(input, metrics) }],
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      console.error("pitch-score upstream error:", res.status, err?.error?.message);
      return { ok: false, error: "Couldn't score the pitch right now. Please try again in a moment.", status: 502 };
    }

    const json = (await res.json()) as { content?: Array<{ type: string; name?: string; input?: unknown }> };
    aiContent = json.content ?? [];
  } catch (e) {
    console.error("pitch-score route error:", e);
    return { ok: false, error: "Internal server error scoring the pitch.", status: 500 };
  }

  try {
    const ai = parseAiResult(aiContent);
    const result = composeScore(l1, ai, {
      hasQuery: Boolean(input.query?.trim()),
      usage,
    });
    return { ok: true, result };
  } catch (e) {
    console.error("pitch-score parse error:", e);
    return { ok: false, error: "Could not parse the score. Please try again.", status: 502 };
  }
}
