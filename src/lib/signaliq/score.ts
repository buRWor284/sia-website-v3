/**
 * SignalIQ — opportunity scoring. Pure, deterministic, unit-testable.
 *
 *   opportunity = Σ weighted(magnitude, velocity, coverageGap, fit, credibility)
 *               + corroboration bonus
 *
 * The score is a *lead/whitespace* measure (how far ahead of coverage you are),
 * NOT a probability that the story breaks. See SignalIQ-RFP.md §6 & §11.1.
 */
import type { BeatId, Coverage, Opportunity, Signal } from "./types";
import { WEIGHTS, bandFor, beatById, isSensitive } from "./config";

const clamp01 = (n: number): number => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const maxOr0 = (xs: number[]): number => (xs.length ? Math.max(...xs) : 0);

/** Beat-fit: overlap between the topic text and the beat's seed vocabulary. */
export function beatFit(topic: string, beat: BeatId): number {
  const seeds = new Set(
    beatById(beat)
      .seeds.join(" ")
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2),
  );
  const words = topic.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  if (words.length === 0 || seeds.size === 0) return 0.4;
  const hits = words.filter((w) => seeds.has(w)).length;
  return clamp01(0.4 + hits * 0.3); // any overlap is meaningful; caps at 1
}

/** Corroboration: more independent sources → less likely to be noise. */
export function corroboration(signals: Signal[]): number {
  const distinct = new Set(signals.map((s) => s.source)).size;
  const ladder = [0, 0, 0.6, 0.85, 1]; // 0,1 → 0; 2 → .6; 3 → .85; 4+ → 1
  return clamp01(ladder[Math.min(distinct, 4)] ?? 1);
}

export interface ScoreInputs {
  topic: string;
  beat: BeatId;
  signals: Signal[];
  coverage: Coverage | null;
}

export function scoreOpportunity(inp: ScoreInputs): Opportunity {
  const { topic, beat, signals, coverage } = inp;

  const magnitude = clamp01(maxOr0(signals.map((s) => s.magnitude)));
  const velocity = clamp01(maxOr0(signals.map((s) => s.velocity)));
  const credibility = clamp01(maxOr0(signals.map((s) => s.credibility)));
  // Unknown coverage → neutral 0.5 (don't reward or punish the gap blindly).
  const coverageGap = coverage ? clamp01(1 - coverage.volume) : 0.5;
  const fit = beatFit(topic, beat);
  const corr = corroboration(signals);

  const base =
    WEIGHTS.magnitude * magnitude +
    WEIGHTS.velocity * velocity +
    WEIGHTS.coverageGap * coverageGap +
    WEIGHTS.fit * fit +
    WEIGHTS.credibility * credibility;

  const score = Math.round(clamp01(base + WEIGHTS.corroborationBonus * corr) * 100);
  const band = bandFor(score);

  const headline = signals[0]?.title?.trim() || topic;
  const sensitive = isSensitive(`${topic} ${headline} ${signals.map((s) => s.title).join(" ")}`);

  return {
    id: oppId(beat, topic),
    beat,
    topic,
    headline,
    score,
    band: band.band,
    bandLabel: band.label,
    components: { magnitude, velocity, coverageGap, fit, credibility, corroboration: corr },
    coverage,
    signals,
    sensitive,
    createdAt: new Date().toISOString(),
  };
}

export function oppId(beat: string, topic: string): string {
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `opp_${beat}_${slug}`;
}

/**
 * Rank: highest score first, but demote sensitive items below every
 * non-sensitive one so tragedy is never surfaced as a "top opportunity".
 */
export function rankOpportunities(opps: Opportunity[]): Opportunity[] {
  return [...opps].sort((a, b) => {
    if (a.sensitive !== b.sensitive) return a.sensitive ? 1 : -1;
    return b.score - a.score;
  });
}
