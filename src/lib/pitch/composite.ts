/**
 * PressIQ — composite scoring math.
 * Deterministic roll-up of Layer-1 (objective) + AI areas (relevance, checklist, EMOS,
 * Newsroom-Ready) using the v2 launch weights. Relevance redistributes proportionally when
 * no query is given. Also attaches per-dimension analysis, ✓/✗ sub-signals, and evidence keys
 * for the v2 output, and builds the radar axes.
 */

import { DIMENSION_EVIDENCE, NEWSROOM_SIGNALS, WEIGHTS_V2, tierFor } from "./config";
import { emosFrame } from "./feedback";
import type { AiScore, AreaScore, Layer1Scored, RadarAxis, ScoreResponse, SubSignal } from "./types";

type WKey = keyof typeof WEIGHTS_V2;

export function composeScore(
  l1: Layer1Scored,
  ai: AiScore,
  opts: { hasQuery: boolean; usage: ScoreResponse["usage"] },
): ScoreResponse {
  const relevanceAssessed = opts.hasQuery && ai.relevance != null;

  // Build the weight set, redistributing relevance's share if it's not assessed.
  const w: Record<WKey, number> = { ...WEIGHTS_V2 };
  let parts: { key: WKey; score: number }[] = [
    { key: "objective", score: l1.score },
    { key: "checklist", score: clamp100(ai.checklist.score) },
    { key: "storytelling", score: clamp100(ai.storytelling.score) },
    { key: "neuromarketing", score: clamp100(ai.neuromarketing.score) },
    { key: "personalBrand", score: clamp100(ai.personalBrand.score) },
    { key: "newsroomReady", score: clamp100(ai.newsroomReady.score) },
  ];
  if (relevanceAssessed) {
    parts = [{ key: "relevance", score: clamp100(ai.relevance!.score) }, ...parts];
  } else {
    // redistribute relevance weight across the rest, proportional to their weights
    const others = parts.map((p) => p.key);
    const otherTotal = others.reduce((s, k) => s + w[k], 0);
    for (const k of others) w[k] += (WEIGHTS_V2.relevance * w[k]) / otherTotal;
    w.relevance = 0;
  }

  const composite = Math.round(
    parts.reduce((sum, p) => sum + (w[p.key] / activeTotal(w, relevanceAssessed)) * p.score, 0),
  );

  const tier = tierFor(composite);

  // ── per-dimension sub-signals (the ✓/✗ chips) ─────────────────────────────────
  const objectiveSignals: SubSignal[] = [
    { label: "Length in range", met: l1.bands.wordCount.status === "ideal" },
    { label: "Subject length", met: l1.bands.subjectWords.status === "ideal" },
    { label: "Reading level", met: l1.bands.readingGrade.status === "ideal" },
    { label: "Closing question", met: l1.bands.questions.status === "ideal" },
    { label: "Tone (not salesy)", met: l1.bands.subjectivity.status !== "off" },
  ];
  const storySignals: SubSignal[] = [
    { label: "A real character in a scene", met: ai.storytelling.hasCharacter === true },
    { label: "Problem → insight → resolution arc", met: ai.storytelling.hasArc === true },
  ];
  const neuroSignals: SubSignal[] = [
    { label: "Subject passes the 2-second test", met: ai.neuromarketing.subjectTwoSecond === true },
    { label: "Not just borrowed/Googleable stats", met: ai.neuromarketing.borrowedStatsOnly === false },
  ];
  const brandSignals: SubSignal[] = [
    { label: "Surfaces verifiable authority in-line", met: ai.personalBrand.reflectsAuthority === true },
  ];
  const nrBooleans: Record<string, boolean | undefined> = {
    originalData: ai.newsroomReady.originalData,
    sourceAccess: ai.newsroomReady.sourceAccess,
    assets: ai.newsroomReady.assets,
    timeliness: ai.newsroomReady.timeliness,
  };
  const newsroomSignals: SubSignal[] = NEWSROOM_SIGNALS.map((s) => ({ label: s.label, met: nrBooleans[s.key] === true }));

  const mk = (
    dim: keyof typeof DIMENSION_EVIDENCE,
    score: number,
    src: { note?: string; topFix?: string; analysis?: string },
    subSignals?: SubSignal[],
  ): AreaScore => ({
    score: clamp100(score),
    note: src.note,
    topFix: src.topFix,
    analysis: src.analysis,
    subSignals,
    evidence: DIMENSION_EVIDENCE[dim],
  });

  const areas: ScoreResponse["areas"] = {
    objective: { ...mk("objective", l1.score, { note: emosFrame("objective", l1.score).text }, objectiveSignals) },
    checklist: mk("checklist", ai.checklist.score, { note: ai.overallNote, analysis: ai.checklist.analysis, topFix: firstStepFix(ai) }),
    newsroomReady: mk("newsroomReady", ai.newsroomReady.score, { note: ai.newsroomReady.note, analysis: ai.newsroomReady.analysis, topFix: ai.newsroomReady.topFix }, newsroomSignals),
    emos: {
      storytelling: mk("storytelling", ai.storytelling.score, { note: ai.storytelling.note, analysis: ai.storytelling.analysis, topFix: ai.storytelling.topFix }, storySignals),
      neuromarketing: mk("neuromarketing", ai.neuromarketing.score, { note: ai.neuromarketing.note, analysis: ai.neuromarketing.analysis, topFix: ai.neuromarketing.topFix }, neuroSignals),
      personalBrand: mk("personalBrand", ai.personalBrand.score, { note: ai.personalBrand.note, analysis: ai.personalBrand.analysis, topFix: ai.personalBrand.topFix }, brandSignals),
    },
  };
  if (relevanceAssessed && ai.relevance) {
    areas.relevance = mk("relevance", ai.relevance.score, { note: ai.relevance.note, analysis: ai.relevance.analysis, topFix: ai.relevance.topFix }, [
      { label: "Answers the exact question asked", met: ai.relevance.answersExactQuestion === true },
    ]);
  }

  // ── radar axes (display order; SHORT labels so the SVG never clips) ────────────
  const radar: RadarAxis[] = [];
  if (relevanceAssessed && areas.relevance) radar.push({ label: "Relevance", score: areas.relevance.score });
  radar.push(
    { label: "Mechanics", score: areas.objective.score },
    { label: "SIA 7-step", score: areas.checklist.score },
    { label: "Story", score: areas.emos.storytelling.score },
    { label: "Neuro", score: areas.emos.neuromarketing.score },
    { label: "Personal", score: areas.emos.personalBrand.score },
    { label: "Newsroom", score: areas.newsroomReady.score },
  );

  return {
    composite,
    tier,
    relevanceAssessed,
    metrics: l1.metrics,
    areas,
    radar,
    authenticityRisk: ai.authenticityRisk,
    strongestLine: ai.strongestLine,
    topFixes: buildTopFixes(l1, ai, relevanceAssessed),
    usage: opts.usage,
  };
}

/** Rank the 3 highest-leverage fixes: lowest weighted scores first, each with its EMOS frame. */
function buildTopFixes(l1: Layer1Scored, ai: AiScore, relevanceAssessed: boolean): ScoreResponse["topFixes"] {
  const candidates: { area: string; dim: Parameters<typeof emosFrame>[0]; score: number; weight: number; aiFix?: string }[] = [
    { area: "Mechanics", dim: "objective", score: l1.score, weight: WEIGHTS_V2.objective },
    { area: "SIA 7-step checklist", dim: "checklist", score: ai.checklist.score, weight: WEIGHTS_V2.checklist, aiFix: firstStepFix(ai) },
    { area: "Storytelling", dim: "storytelling", score: ai.storytelling.score, weight: WEIGHTS_V2.storytelling, aiFix: ai.storytelling.topFix },
    { area: "Neuromarketing", dim: "neuromarketing", score: ai.neuromarketing.score, weight: WEIGHTS_V2.neuromarketing, aiFix: ai.neuromarketing.topFix },
    { area: "Personal brand", dim: "personalBrand", score: ai.personalBrand.score, weight: WEIGHTS_V2.personalBrand, aiFix: ai.personalBrand.topFix },
    { area: "Newsroom-ready", dim: "newsroomReady", score: ai.newsroomReady.score, weight: WEIGHTS_V2.newsroomReady, aiFix: ai.newsroomReady.topFix },
  ];
  if (relevanceAssessed && ai.relevance) {
    candidates.push({ area: "Answering the brief", dim: "relevance", score: ai.relevance.score, weight: WEIGHTS_V2.relevance, aiFix: ai.relevance.topFix });
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

function activeTotal(w: Record<WKey, number>, relevanceAssessed: boolean): number {
  const keys: WKey[] = relevanceAssessed
    ? ["relevance", "objective", "checklist", "storytelling", "neuromarketing", "personalBrand", "newsroomReady"]
    : ["objective", "checklist", "storytelling", "neuromarketing", "personalBrand", "newsroomReady"];
  return keys.reduce((s, k) => s + w[k], 0);
}

function clamp100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
