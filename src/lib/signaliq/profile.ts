/**
 * SignalIQ — company-profile expansion.
 *
 * One structured tool-use call turns the founder's company description into:
 *   • tailored SEEDS    — topics to scan, chosen mostly by SELECTING from the
 *                         beat's proven seed list (those reliably return signals
 *                         from SEC/news/research) plus a few real market terms;
 *   • relevance THEMES  — a lexicon used by score.ts to rank each opportunity by
 *                         fit to the company;
 *   • NEGATIVES         — industry-adjacent terms that look related but are not
 *                         this company's focus (down-ranked / dropped).
 *
 * Why "select from candidates": free-form, product-flavoured seeds (e.g.
 * "symptom tracking app") have ~zero SEC filings and starve the scan. The beat's
 * own seeds are proven to return signals, so we let the model pick the relevant
 * ones and add only a handful of real market/research phrases on top.
 *
 * Server-only (needs ANTHROPIC_API_KEY). Fails soft: on any error returns null
 * and the scan falls back to the generic beat seeds with neutral relevance.
 */
import type { BeatId, ProfileExpansion } from "./types";
import { SIGNALIQ_MODEL, beatById } from "./config";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export const EXPAND_SYSTEM = `You are an earned-media strategist. Given a founder's company description AND a list of candidate industry topics, you produce the inputs a "newsjacking radar" needs to find PR opportunities that genuinely fit THIS company.

Return, via the emit_profile tool:

1. selectedTopics — copy verbatim the subset of the CANDIDATE topics this specific company could credibly comment on, attach a story to, or has standing in. Pick the genuinely relevant ones and ignore the rest. These are proven to return signals, so they matter most — be generous but honest (usually 6–12).

2. extraTopics — up to 6 ADDITIONAL short phrases (2–3 words) NOT already in the candidate list that fit this company AND are real market/industry/research terms that appear in SEC filings, news, and research (e.g. "remote patient monitoring", "value-based care", "patient-reported outcomes"). NEVER product features or brand names (NOT "symptom tracker", NOT "journaling app").

3. themes — 12–20 lowercase keywords/phrases that signal an opportunity is relevant to this company (its audience, problem space, and adjacent concepts a relevant story would mention).

4. negatives — 6–12 lowercase candidate/industry terms that are in the same broad space but are NOT this company's focus, so loud-but-irrelevant noise can be down-ranked.

Rules: be specific and honest, never invent facts about the company, and keep every phrase something that plausibly appears in news or filings.`;

export const EXPAND_TOOL = {
  name: "emit_profile",
  description: "Return tailored scan topics (selected from candidates + a few new) and a relevance lexicon.",
  input_schema: {
    type: "object",
    properties: {
      selectedTopics: {
        type: "array",
        description: "Subset of the provided CANDIDATE topics relevant to this company (copied verbatim).",
        items: { type: "string" },
      },
      extraTopics: {
        type: "array",
        description: "Up to 6 NEW real market/research phrases (2–3 words) not in the candidate list. No product features or brand names.",
        items: { type: "string" },
      },
      themes: {
        type: "array",
        description: "12–20 lowercase keywords/phrases that indicate relevance to this company.",
        items: { type: "string" },
      },
      negatives: {
        type: "array",
        description: "6–12 lowercase industry-adjacent terms that are NOT this company's focus.",
        items: { type: "string" },
      },
      summary: {
        type: "string",
        description: "One-line neutral positioning of the company (max ~20 words).",
      },
    },
    required: ["selectedTopics", "extraTopics", "themes", "negatives"],
  },
} as const;

export function buildExpandPrompt(description: string, beat?: BeatId): string {
  const b = beatById(beat ?? "saas");
  return `COMPANY DESCRIPTION (from the founder):
${description.trim()}

CANDIDATE TOPICS for the ${b.label} beat — select the ones that fit this company:
${b.seeds.join(", ")}

Produce the topics and relevance lexicon via the emit_profile tool. Selecting the relevant candidates matters most — they reliably return signals. Add new topics only if they are real market/research terms (not product features).`;
}

interface ToolUseBlock {
  type: string;
  name?: string;
  input?: unknown;
}

const cleanList = (v: unknown, max: number, lower: boolean): string[] => {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    let s = String(item ?? "").trim();
    if (lower) s = s.toLowerCase();
    s = s.replace(/^["'\-•\s]+|["'\s]+$/g, "");
    if (s.length < 2 || s.length > 60) continue;
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
};

/** Merge selected + extra topics into a single de-duplicated seed list. */
function mergeSeeds(selected: string[], extra: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...selected, ...extra]) {
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

export function parseExpansion(content: ToolUseBlock[]): ProfileExpansion | null {
  const block = content.find((b) => b.type === "tool_use" && b.name === EXPAND_TOOL.name);
  if (!block?.input) return null;
  const raw = block.input as Record<string, unknown>;
  const selected = cleanList(raw.selectedTopics, 16, false);
  const extra = cleanList(raw.extraTopics, 8, false);
  const seeds = mergeSeeds(selected, extra, 16);
  const themes = cleanList(raw.themes, 24, true);
  const negatives = cleanList(raw.negatives, 14, true);
  if (seeds.length === 0) return null; // nothing usable → caller falls back
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
