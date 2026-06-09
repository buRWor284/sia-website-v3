/**
 * SignalIQ — company-profile expansion.
 *
 * One structured tool-use call turns the founder's company description into:
 *   • tailored SEEDS    — startup-specific topics to scan (instead of the 20
 *                         generic beat seeds), so the radar looks where THIS
 *                         company can credibly play;
 *   • relevance THEMES  — a lexicon used by score.ts to compute how relevant
 *                         each opportunity is to the company;
 *   • NEGATIVES         — industry-adjacent terms that look related but are not
 *                         this company's focus (penalised in scoring).
 *
 * Server-only (needs ANTHROPIC_API_KEY). Fails soft: on any error returns null
 * and the scan falls back to the generic beat seeds with neutral relevance.
 */
import type { BeatId, ProfileExpansion } from "./types";
import { SIGNALIQ_MODEL, beatById } from "./config";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export const EXPAND_SYSTEM = `You are an earned-media strategist. Given a founder's description of their company, you produce the inputs a "newsjacking radar" needs to find PR opportunities that genuinely fit THIS company.

You return three things via the emit_profile tool:

1. seeds — 12 to 16 SHORT search phrases (2-4 words) naming topics, trends, or themes this specific company could credibly comment on, attach a story to, or has standing in. These are queried against SEC filings, news, Hacker News, arXiv and Wikipedia, so they must be REAL discourse phrases that show up in corporate filings, research, and the press — NOT the company's brand name, NOT product features no one writes about, NOT generic words like "software" or "health". Favour the company's actual niche over the broad industry (e.g. for a chronic-condition symptom journal: "patient-generated health data", "medication adherence", "remote patient monitoring", "chronic disease management" — NOT "drug pricing" or "clinical trial recruitment").

2. themes — 12 to 20 lowercase keywords/short phrases that signal an opportunity is truly relevant to this company. Include the company's audience, problem space, and adjacent concepts a relevant story would mention.

3. negatives — 6 to 12 lowercase terms that are in the same broad industry but are NOT this company's focus, so we can down-rank loud-but-irrelevant industry noise.

Rules: be specific and honest, never invent facts about the company, and keep every phrase something that would plausibly appear in news or filings.`;

export const EXPAND_TOOL = {
  name: "emit_profile",
  description: "Return tailored scan seeds and a relevance lexicon for the company.",
  input_schema: {
    type: "object",
    properties: {
      seeds: {
        type: "array",
        description: "12-16 short (2-4 word) searchable topic phrases tailored to this company.",
        items: { type: "string" },
      },
      themes: {
        type: "array",
        description: "12-20 lowercase keywords/phrases that indicate relevance to this company.",
        items: { type: "string" },
      },
      negatives: {
        type: "array",
        description: "6-12 lowercase industry-adjacent terms that are NOT this company's focus.",
        items: { type: "string" },
      },
      summary: {
        type: "string",
        description: "One-line neutral positioning of the company (max ~20 words).",
      },
    },
    required: ["seeds", "themes", "negatives"],
  },
} as const;

export function buildExpandPrompt(description: string, beat?: BeatId): string {
  const area = beat ? beatById(beat).label : "their industry";
  return `COMPANY DESCRIPTION (from the founder):
${description.trim()}

General area / beat: ${area}

Produce the scan seeds and relevance lexicon via the emit_profile tool. Tailor everything to THIS company's specific niche and audience, not the broad industry.`;
}

interface ToolUseBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const cleanList = (v: unknown, max: number, lower: boolean): string[] => {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    let s = String(item ?? "").trim();
    if (lower) s = s.toLowerCase();
    s = s.replace(/^["'\-•\s]+|["'\s]+$/g, "");
    if (s.length < 2 || s.length > 60) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
};

export function parseExpansion(content: ToolUseBlock[]): ProfileExpansion | null {
  const block = content.find((b) => b.type === "tool_use" && b.name === EXPAND_TOOL.name);
  if (!block?.input) return null;
  const raw = block.input as Partial<ProfileExpansion>;
  const seeds = cleanList(raw.seeds, 16, false);
  const themes = cleanList(raw.themes, 24, true);
  const negatives = cleanList(raw.negatives, 14, true);
  if (seeds.length === 0) return null; // nothing usable
  return {
    seeds,
    themes,
    negatives,
    summary: typeof raw.summary === "string" ? raw.summary.trim().slice(0, 160) : undefined,
  };
}

/* ── tiny per-instance cache so repeat scans of the same profile are free ── */
const cache = new Map<string, ProfileExpansion>();
const cacheKey = (s: string): string => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `${SIGNALIQ_MODEL}:${h}`;
};

/**
 * Expand a company description into tailored seeds + relevance lexicon.
 * Returns null on any failure (missing key, API error, empty result) so the
 * caller can fall back to the generic beat seeds.
 */
export async function expandCompanyProfile(
  companyContext: string,
  beat?: BeatId,
): Promise<ProfileExpansion | null> {
  const desc = (companyContext ?? "").trim();
  if (desc.length < 12) return null; // too thin to tailor on

  const key = cacheKey(`${beat ?? ""}|${desc}`);
  const hit = cache.get(key);
  if (hit) return hit;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

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
        max_tokens: 900,
        temperature: 0.3,
        system: EXPAND_SYSTEM,
        tools: [EXPAND_TOOL],
        tool_choice: { type: "tool", name: EXPAND_TOOL.name },
        messages: [{ role: "user", content: buildExpandPrompt(desc, beat) }],
      }),
    });
    if (!res.ok) {
      console.error("expandCompanyProfile: anthropic error", res.status);
      return null;
    }
    const json = (await res.json()) as { content?: ToolUseBlock[] };
    const expansion = parseExpansion(json.content ?? []);
    if (expansion) cache.set(key, expansion);
    return expansion;
  } catch (e) {
    console.error("expandCompanyProfile error (non-fatal):", e);
    return null;
  }
}
