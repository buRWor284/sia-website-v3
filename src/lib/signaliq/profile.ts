/**
 * SignalIQ — company-profile expansion.
 *
 * One structured tool-use call turns the founder's company description into:
 *   • tailored SEEDS    — topics to scan, chosen mostly by SELECTING from the
 *                         beat's proven seed list (those reliably return signals
 *                         from SEC/news/research) plus a few real market terms;
 *   • a FIT rating      — high/medium/low per topic, judged by the model, used
 *                         for the Fit badge + ranking (NOT to scale the score);
 *   • relevance THEMES  — a lexicon used to rate generic beat backfill;
 *   • NEGATIVES         — industry-adjacent terms that look related but are not
 *                         this company's focus (down-ranked / dropped).
 *
 * Why "select from candidates": free-form, product-flavoured seeds (e.g.
 * "symptom tracking app") have ~zero SEC filings and starve the scan. The beat's
 * own seeds are proven to return signals, so we let the model pick the relevant
 * ones, rate their fit, and add only a handful of real market phrases on top.
 *
 * Server-only (needs ANTHROPIC_API_KEY). Fails soft: on any error returns null
 * and the scan falls back to the generic beat seeds with neutral relevance.
 */
import type { BeatId, ProfileExpansion } from "./types";
import { SIGNALIQ_MODEL, beatById } from "./config";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

type Tier = "high" | "medium" | "low";

export const EXPAND_SYSTEM = `You are an earned-media strategist. Given a founder's company description AND a list of candidate industry topics, you produce the inputs a "newsjacking radar" needs to find PR opportunities that genuinely fit THIS company.

Return, via the emit_profile tool:

1. selectedTopics — the subset of the CANDIDATE topics this specific company could credibly comment on, attach a story to, or has standing in (copy each topic verbatim). For each, give a fit rating. These candidates are proven to return signals, so they matter most — but only pick ones that genuinely fit. Match the company's modality, inferred from the description: pick topics the company can actually speak to, and favour topics its product and audience are about over adjacent ones it doesn't build or operate in.

2. extraTopics — up to 6 ADDITIONAL real market/industry/research phrases (2–3 words) NOT in the candidate list that fit this company and appear in SEC filings, news, and research (e.g. "remote patient monitoring", "value-based care"). NEVER product features or brand names. Give each a fit rating.

3. themes — 12–20 lowercase keywords/phrases that signal relevance to this company (its audience, problem space, adjacent concepts).

4. negatives — 6–12 lowercase candidate/industry terms that are NOT this company's focus.

Fit ratings: high = central to what the company does and can credibly lead on; medium = relevant or adjacent; low = tangential (usually skip it). Be honest — most companies have only a few genuinely "high" topics.`;

export const EXPAND_TOOL = {
  name: "emit_profile",
  description: "Return tailored scan topics (selected from candidates + a few new), each with a fit rating, plus a relevance lexicon.",
  input_schema: {
    type: "object",
    properties: {
      selectedTopics: {
        type: "array",
        description: "Subset of the provided CANDIDATE topics relevant to this company, each with a fit rating.",
        items: {
          type: "object",
          properties: {
            topic: { type: "string", description: "A candidate topic, copied verbatim." },
            fit: { type: "string", enum: ["high", "medium", "low"], description: "How central this topic is to the company." },
          },
          required: ["topic", "fit"],
        },
      },
      extraTopics: {
        type: "array",
        description: "Up to 6 NEW real market/research phrases (2–3 words) not in the candidate list, each with a fit rating. No product features or brand names.",
        items: {
          type: "object",
          properties: {
            topic: { type: "string" },
            fit: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["topic", "fit"],
        },
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

export function buildExpandPrompt(description: string, beats: BeatId[]): string {
  const list = beats && beats.length ? beats : (["saas"] as BeatId[]);
  const beatLabels = list.map((id) => beatById(id).label).join(" + ");
  // Candidates are listed GROUPED per beat so the model can pick across a
  // multi-beat (boundary-vertical) selection without losing which beat a topic
  // belongs to. Still one small prompt even at 2–3 beats.
  const groups = list
    .map((id) => {
      const b = beatById(id);
      return `CANDIDATE TOPICS (${b.label}):\n${b.seeds.join(", ")}`;
    })
    .join("\n\n");
  return `COMPANY DESCRIPTION (from the founder):
${description.trim()}

The founder chose ${list.length > 1 ? `these beats: ${beatLabels}` : `the ${beatLabels} beat`}. Select the candidate topics — from ANY group below — that genuinely fit this company and rate each (copy each topic verbatim):

${groups}

Produce the topics and relevance lexicon via the emit_profile tool. Selecting the relevant candidates matters most — they reliably return signals. Add new topics only if they are real market/research terms (not product features). Rate fit honestly.`;
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

const asTier = (v: unknown): Tier => {
  const s = String(v ?? "").toLowerCase();
  return s === "high" || s === "low" ? s : "medium";
};

/** Parse a {topic, fit}[] array, cleaning topics and validating tiers. */
function cleanTopics(v: unknown, max: number): { topic: string; fit: Tier }[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: { topic: string; fit: Tier }[] = [];
  for (const item of v) {
    const o = (item ?? {}) as Record<string, unknown>;
    const topic = String(o.topic ?? "").trim().replace(/^["'\-•\s]+|["'\s]+$/g, "");
    if (topic.length < 2 || topic.length > 60) continue;
    const key = topic.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ topic, fit: asTier(o.fit) });
    if (out.length >= max) break;
  }
  return out;
}

export function parseExpansion(content: ToolUseBlock[]): ProfileExpansion | null {
  const block = content.find((b) => b.type === "tool_use" && b.name === EXPAND_TOOL.name);
  if (!block?.input) return null;
  const raw = block.input as Record<string, unknown>;

  const selected = cleanTopics(raw.selectedTopics, 16);
  const extra = cleanTopics(raw.extraTopics, 8);

  const seen = new Set<string>();
  const seeds: string[] = [];
  const fits: Record<string, Tier> = {};
  for (const { topic, fit } of [...selected, ...extra]) {
    const key = topic.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    seeds.push(topic);
    fits[key] = fit;
    if (seeds.length >= 16) break;
  }
  if (seeds.length === 0) return null; // nothing usable → caller falls back

  return {
    seeds,
    fits,
    themes: cleanList(raw.themes, 24, true),
    negatives: cleanList(raw.negatives, 14, true),
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
 * Expand a company description into tailored seeds (+ fit ratings) and a
 * relevance lexicon. Returns null on any failure so the caller can fall back
 * to the generic beat seeds.
 */
export async function expandCompanyProfile(
  companyContext: string,
  beats: BeatId[],
): Promise<ProfileExpansion | null> {
  const desc = (companyContext ?? "").trim();
  if (desc.length < 12) return null; // too thin to tailor on

  const beatList = beats && beats.length ? beats : (["saas"] as BeatId[]);
  // Cache key includes ALL selected beats in order — a Health+AI selection must
  // not collide with a Health-only one.
  const key = cacheKey(`${beatList.join(",")}|${desc}`);
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
        max_tokens: 1100,
        temperature: 0.3,
        system: EXPAND_SYSTEM,
        tools: [EXPAND_TOOL],
        tool_choice: { type: "tool", name: EXPAND_TOOL.name },
        messages: [{ role: "user", content: buildExpandPrompt(desc, beatList) }],
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
