/**
 * PressIQ — composite scoring math.
 * Deterministic roll-up of Layer-1 (objective) + AI areas (relevance, checklist, EMOS)
 * using the config weights. Relevance redistributes proportionally when no query is given.
 */

import { WEIGHTS, tierFor } from "./config";
import { bandFor, emosFrame } from "./feedback";
import type { AiScore, Layer1Scored, ScoreResponse } from "./types";

export function composeScore(
  l1: Layer1Scored,
  ai: AiScore,
  opts: { hasQuery: boolean; usage: ScoreResponse["usage"] },
): ScoreResponse {
  const relevanceAssessed = opts.hasQuery && ai.relevance != null;

  // Build the weight set, redistributing relevance's share if it's not assessed.
  const w: Record<keyof typeof WEIGHTS, number> = { ...WEIGHTS };
  let parts: { key: keyof typeof WEIGHTS; score: number }[] = [
    { key: "objective", score: l1.score },
    { key: "checklist", score: clamp100(ai.checklist.score) },
    { key: "storytelling", score: clamp100(ai.storytelling.score) },
    { key: "neuromarketing", score: clamp100(ai.neuromarketing.score) },
    { key: "personalBrand", score: clamp100(ai.personalBrand.score) },
  ];
  if (relevanceAssessed) {
    parts = [{ key: "relevance", score: clamp100(ai.relevance!.score) }, ...parts];
  } else {
    // redistribute relevance weight across the rest, proportional to their weights
    const others = parts.map((p) => p.key);
    const otherTotal = others.reduce((s, k) => s + w[k], 0);
    for (const k of others) w[k] += (WEIGHTS.relevance * w[k]) / otherTotal;
    w.relevance = 0;
  }

  const composite = Math.round(
    parts.reduce((sum, p) => sum + (w[p.key] / activeTotal(w, relevanceAssessed)) * p.score, 0),
  );

  const tier = tierFor(composite);

  const areas: ScoreResponse["areas"] = {
    objective: { score: l1.score, note: emosFrame("objective", l1.score).text },
    checklist: { score: clamp100(ai.checklist.score), note: ai.overallNote, topFix: firstStepFix(ai) },
    emos: {
      storytelling: { score: clamp100(ai.storytelling.score), note: ai.storytelling.note, topFix: ai.storytelling.topFix },
      neuromarketing: { score: clamp100(ai.neuromarketing.score), note: ai.neuromarketing.note, topFix: ai.neuromarketing.topFix },
      personalBrand: { score: clamp100(ai.personalBrand.score), note: ai.personalBrand.note, topFix: ai.personalBrand.topFix },
    },
  };
  if (relevanceAssessed) {
    areas.relevance = { score: clamp100(ai.relevance!.score), note: ai.relevance!.note, topFix: ai.relevance!.topFix };
  }

  return {
    composite,
    tier,
    relevanceAssessed,
    metrics: l1.metrics,
    areas,
    strongestLine: ai.strongestLine,
    topFixes: buildTopFixes(l1, ai, relevanceAssessed),
    usage: opts.usage,
  };
}

/** Rank the 3 highest-leverage fixes: lowest weighted scores first, each with its EMOS frame. */
function buildTopFixes(l1: Layer1Scored, ai: AiScore, relevanceAssessed: boolean): ScoreResponse["topFixes"] {
  const candidates: { area: string; dim: Parameters<typeof emosFrame>[0]; score: number; weight: number; aiFix?: string }[] = [
    { area: "Mechanics", dim: "objective", score: l1.score, weight: WEIGHTS.objective },
    { area: "The SIA system", dim: "checklist", score: ai.checklist.score, weight: WEIGHTS.checklist, aiFix: firstStepFix(ai) },
    { area: "Storytelling", dim: "storytelling", score: ai.storytelling.score, weight: WEIGHTS.storytelling, aiFix: ai.storytelling.topFix },
    { area: "Neuromarketing", dim: "neuromarketing", score: ai.neuromarketing.score, weight: WEIGHTS.neuromarketing, aiFix: ai.neuromarketing.topFix },
    { area: "Personal brand", dim: "personalBrand", score: ai.personalBrand.score, weight: WEIGHTS.personalBrand, aiFix: ai.personalBrand.topFix },
  ];
  if (relevanceAssessed && ai.relevance) {
    candidates.push({ area: "Answering the brief", dim: "relevance", score: ai.relevance.score, weight: WEIGHTS.relevance, aiFix: ai.relevance.topFix });
  }

  return candidates
    // impact ≈ how far from perfect × how much it's weighted
    .map((c) => ({ ...c, impact: (100 - clamp100(c.score)) * c.weight }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map((c) => {
      const frame = emosFrame(c.dim, c.score);
      return {
        area: c.area,
        mechanism: frame.mechanism,
        learn: frame.learn,
        text: c.aiFix ? `${c.aiFix} — ${frame.text}` : frame.text,
      };
    });
}

function firstStepFix(ai: AiScore): string | undefined {
  const entries = Object.values(ai.checklist.steps ?? {});
  const worst = entries
    .filter((s) => s.topFix && s.met < s.of)
    .sort((a, b) => a.met / a.of - b.met / b.of)[0];
  return worst?.topFix;
}

function activeTotal(w: Record<keyof typeof WEIGHTS, number>, relevanceAssessed: boolean): number {
  const keys: (keyof typeof WEIGHTS)[] = relevanceAssessed
    ? ["relevance", "objective", "checklist", "storytelling", "neuromarketing", "personalBrand"]
    : ["objective", "checklist", "storytelling", "neuromarketing", "personalBrand"];
  return keys.reduce((s, k) => s + w[k], 0);
}

function clamp100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
