/**
 * SignalIQ — shared server route core (Phase P6, Unified-Gate-Freemium RFP v1.1).
 *
 * ONE copy of the request-handling logic behind BOTH route sets:
 *   /api/signaliq/{scan,pack}           (public: Turnstile + unified quota)
 *   /api/emostool/signaliq/{scan,pack}  (platform: Clerk EMOS guard)
 *
 * The routes stay separate URLs with separate guards (public stays login-free —
 * RFP §4.5/§9); everything after the guard lives here so fixes land once.
 * History lesson this file exists to prevent: the public pack route's
 * maxDuration was raised to 60s after live packs measured 27–30s, but the
 * copy-pasted emostool twin silently kept 30s (a latent 504) until P6.
 */
import { BEATS, SIGNALIQ_MODEL } from "./config";
import { scanBeat } from "./scan";
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
export type ScanCore = Omit<ScanResponse, "usage">;

/** Run a scan and build the response body (minus `usage`, which each route
 * attaches from its own guard). Throws on engine failure — callers map that
 * to their own 500. */
export async function runScanRequest(
  beats: BeatId[],
  companyContext?: string,
): Promise<ScanCore> {
  const { opportunities, partial, notes, beats: scanned } = await scanBeat(beats, { companyContext });
  logScan(scanned.join("+"), opportunities.length);
  return {
    beat: scanned[0], // legacy field = primary beat
    beats: scanned,
    generatedAt: new Date().toISOString(),
    opportunities,
    partial,
    notes,
  };
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
        max_tokens: 1600,
        temperature: 0.4,
        system: PACK_SYSTEM,
        tools: [PACK_TOOL],
        tool_choice: { type: "tool", name: PACK_TOOL.name },
        messages: [{ role: "user", content: buildPackPrompt(opp, companyContext) }],
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      return { ok: false, error: err?.error?.message || `Anthropic API error ${res.status}`, status: res.status };
    }

    const json = (await res.json()) as { content?: Array<{ type: string; name?: string; input?: unknown }> };
    content = json.content ?? [];
  } catch (e) {
    console.error("signaliq pack core error:", e);
    return { ok: false, error: "Internal server error generating the pack.", status: 500 };
  }

  const ai = parsePackResult(content);
  if (!ai.brief && !ai.angle) {
    return { ok: false, error: "Could not generate a pack. Please try again.", status: 502 };
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
