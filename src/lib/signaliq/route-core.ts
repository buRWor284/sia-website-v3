/**
 * SignalIQ — shared server route core (Phase P6, Unified-Gate-Freemium RFP v1.1).
 *
 * ONE copy of the request-handling logic behind BOTH route sets:
 *   /api/signaliq/{scan,pack}           (public: Turnstile + unified quota)
 *   /api/emos-platform/signaliq/{scan,pack}  (platform: Clerk EMOS guard)
 *
 * The routes stay separate URLs with separate guards (public stays login-free —
 * RFP §4.5/§9); everything after the guard lives here so fixes land once.
 * History lesson this file exists to prevent: the public pack route's
 * maxDuration was raised to 60s after live packs measured 27–30s, but the
 * copy-pasted emostool twin silently kept 30s (a latent 504) until P6.
 */
import { BEATS, SIGNALIQ_MODEL } from "./config";
import { recordAiUsage } from "@/lib/ai-usage";
import { scanBeat, type ScanTailoring } from "./scan";
import { friendlyAiError } from "@/lib/ai-errors";
import { logScan, logPack } from "./log";
import {
  PACK_SYSTEM,
  PACK_TOOL,
  assembleSources,
  buildPackPrompt,
  buildSignalChart,
  parsePackResult,
} from "./assetPrompt";
import type { AssetPack, BeatId, Opportunity, ScanResponse } from "./types";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

/** Valid beat ids, derived from config so a new beat can never drift out of sync. */
const BEATS_OK: BeatId[] = BEATS.map((b) => b.id);

/**
 * Parse the beat selection: prefer the new `beats` array (1–3, primary first),
 * fall back to the legacy single `beat` field (mapped to [beat]) so cached
 * clients keep working mid-deploy. Validated against BEATS_OK, deduped,
 * order-preserving, capped at 3.
 */
export function parseBeats(raw: Record<string, unknown>): BeatId[] {
  const collected: unknown[] = Array.isArray(raw.beats)
    ? raw.beats
    : raw.beat !== undefined
      ? [raw.beat]
      : [];
  const seen = new Set<string>();
  const out: BeatId[] = [];
  for (const v of collected) {
    const b = String(v) as BeatId;
    if (!BEATS_OK.includes(b) || seen.has(b)) continue;
    seen.add(b);
    out.push(b);
    if (out.length >= 3) break;
  }
  return out;
}

/** Strict opportunity coercion (the public route's version: `topic` is required
 * because buildPackPrompt uses it). */
export function coerceOpportunity(v: unknown): Opportunity | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Partial<Opportunity>;
  if (!o.id || !o.topic || !Array.isArray(o.signals)) return null;
  return o as Opportunity;
}

/** Everything a scan response contains except the per-surface `usage` block. */
export type ScanCore = Omit<ScanResponse, "usage"> & {
  /** Whether the company tailoring step ran (2026-10-07). Callers that meter scans read it. */
  tailoring: ScanTailoring;
};

/** Run a scan and build the response body (minus `usage`, which each route
 * attaches from its own guard). Throws on engine failure — callers map that
 * to their own 500. */
export async function runScanRequest(
  beats: BeatId[],
  companyContext?: string,
  companyBrief?: string | null,
): Promise<ScanCore> {
  const { opportunities, partial, notes, beats: scanned, tailoring } = await scanBeat(beats, { companyContext, companyBrief });
  logScan(scanned.join("+"), opportunities.length);
  return {
    beat: scanned[0], // legacy field = primary beat
    beats: scanned,
    generatedAt: new Date().toISOString(),
    opportunities,
    partial,
    notes,
    tailoring,
  };
}

/**
 * Number lint (2026-10-07). A live pack said filings "triple" in the headline
 * and "double" in the subject line, for the same figure (11 in 30 days against
 * about 3.7 a month). The prompt now forbids that; this catches it when the
 * model does it anyway and says so in the pack's own cautions. It never
 * rewrites the pack: a wrong auto-fix would be worse than a flagged mismatch.
 */
const MULTIPLIERS: { label: string; re: RegExp }[] = [
  { label: "double", re: /\b(doubl\w*|twice|two[- ]?fold|twofold|2x)\b/i },
  { label: "triple", re: /\b(tripl\w*|three times|three[- ]?fold|threefold|3x)\b/i },
  { label: "quadruple", re: /\b(quadrupl\w*|four times|four[- ]?fold|fourfold|4x)\b/i },
];

export function multiplierMismatch(parts: Record<string, string | undefined>): string | null {
  const found = new Map<string, string[]>();
  for (const [where, text] of Object.entries(parts)) {
    for (const m of MULTIPLIERS) {
      if (text && m.re.test(text)) found.set(m.label, [...(found.get(m.label) ?? []), where]);
    }
  }
  if (found.size < 2) return null;
  const said = [...found].map(([label, where]) => `"${label}" in the ${where.join(" and ")}`).join(", ");
  return `Check the numbers before sending: this pack describes a change as ${said}. Use the plain figures from the data instead of a multiplier word.`;
}

/** Everything an asset pack contains except the per-surface `usage` block. */
export type PackCore = Omit<AssetPack, "usage">;

export type PackResult =
  | { ok: true; pack: PackCore }
  | { ok: false; error: string; status: number };

/**
 * Generate a newsjacking asset pack for one opportunity via a single
 * structured tool-use call to the Anthropic Messages API (direct fetch, no
 * SDK — mirrors /api/collab-ai and /api/pitch-score). The opportunity is
 * re-sent in the body so generation stays stateless (no DB in MVP).
 * Measured at ~27–30s live: routes calling this MUST set maxDuration = 60.
 */
export async function runPackRequest(
  opp: Opportunity,
  companyContext?: string,
  companyBrief?: string | null,
): Promise<PackResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY not set in environment.", status: 500 };
  }

  let content: Array<{ type: string; name?: string; input?: unknown }>;
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: SIGNALIQ_MODEL,
        // Raised 1600 -> 2500 on 2026-09-10: the first two logged packs used
        // 1,257 and 1,302 tokens, over 80% of the old cap. Output is only as
        // long as it needs to be, so the headroom costs nothing.
        max_tokens: 2500,
        temperature: 0.4,
        system: PACK_SYSTEM,
        tools: [PACK_TOOL],
        tool_choice: { type: "tool", name: PACK_TOOL.name },
        messages: [{ role: "user", content: buildPackPrompt(opp, companyContext, companyBrief) }],
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      // 2026-10-07: the provider's wording (billing, keys) is ours to read, not the customer's.
      return { ok: false, error: friendlyAiError("signaliq-pack", res.status, err?.error?.message), status: res.status };
    }

    const json = (await res.json()) as { content?: Array<{ type: string; name?: string; input?: unknown }>; stop_reason?: string };
    await recordAiUsage("signaliq-pack", SIGNALIQ_MODEL, json); // cost log (stage 3)
    // Same guard as PressIQ (97d91e6) and the profile call (cdda9c0): a cut-off
    // tool call still parses, and a half pack would be saved as a whole one.
    if (json.stop_reason === "max_tokens") {
      console.error("signaliq pack: output truncated (stop_reason=max_tokens)");
      return { ok: false, error: "The pack was cut short before it finished. Please try again.", status: 502 };
    }
    content = json.content ?? [];
  } catch (e) {
    console.error("signaliq pack core error:", e);
    return { ok: false, error: "Internal server error generating the pack.", status: 500 };
  }

  const ai = parsePackResult(content);
  if (!ai.brief && !ai.angle) {
    return { ok: false, error: "Could not generate a pack. Please try again.", status: 502 };
  }

  // Direction lint (16 Sep 2026), log only: flags hype or "up" words in the titles
  // when a baseline signal is below its norm, so Vercel logs show if the prompt
  // rule is still being broken. No retry: packs take ~30s against a 60s limit.
  const falling = opp.signals.some((s) => (s.source === "sec" || s.source === "arxiv") && !s.lowSample && (s.trend ?? 0) <= -0.1);
  if (falling) {
    const firstBriefLine = (ai.brief ?? "").split("\n").find((l) => l.trim()) ?? "";
    const titles = `${ai.headline ?? ""} | ${ai.subjectLine ?? ""} | ${firstBriefLine}`;
    const hit = titles.match(/\b(uptick|surg\w*|spik\w*|soar\w*|skyrocket\w*)\b/gi);
    if (hit) console.warn(`[signaliq pack] direction words in titles while a signal is below norm (${opp.topic}): ${hit.join(", ")} :: ${titles}`);
  }

  const mismatch = multiplierMismatch({ headline: ai.headline, "subject line": ai.subjectLine, "pitch angle": ai.angle, brief: ai.brief });
  if (mismatch) {
    console.warn(`[signaliq pack] multiplier words disagree (${opp.topic}): ${ai.headline} | ${ai.subjectLine}`);
    ai.cautions = [mismatch, ...ai.cautions].slice(0, 4);
  }

  const pack: PackCore = {
    ...ai,
    opportunityId: opp.id,
    chart: buildSignalChart(opp),
    sources: assembleSources(opp),
  };

  logPack(opp);
  return { ok: true, pack };
}
