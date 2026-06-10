/**
 * SignalIQ — opportunity scoring. Pure, deterministic, unit-testable.
 *
 *   score (shown) = Σ weighted(magnitude, velocity, coverageGap, fit, credibility, corroboration) × 100
 *                   — honest signal STRENGTH; relevance never lowers it.
 *   fit           = how well the opportunity matches the company profile, surfaced as a
 *                   High/Med/Low badge and used to RANK + filter (not to scale the score).
 *
 * The score is a *lead/whitespace* measure (how far ahead of coverage you are),
 * NOT a probability that the story breaks. See SignalIQ-RFP.md §6 & §11.1.
 *
 * Relevance: when the founder supplies a company profile we expand it (profile.ts)
 * into themes/negatives, rank relevant signals first, and drop off-topic ones —
 * so the radar is focused on THIS company without faking the strength numbers.
 */
import type { BeatId, Coverage, Opportunity, ProfileExpansion, Signal } from "./types";
import { RELEVANCE_FLOOR, WEIGHTS, bandFor, beatById, isSensitive } from "./config";

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

/**
 * Company relevance: how well this opportunity fits the founder's company.
 * Returns a neutral 1 when there is no profile (don't penalise the public default).
 * With a profile: a tailored seed starts relevant; theme hits raise it; negative
 * (off-focus industry) terms cut it hard.
 */
export function companyRelevance(
  text: string,
  expansion: ProfileExpansion | null,
  tailored: boolean,
): number {
  if (!expansion) return 1; // neutral — no profile present
  const t = ` ${text.toLowerCase()} `;
  const themeHits = expansion.themes.reduce((n, w) => (w && t.includes(w) ? n + 1 : n), 0);
  const negHits = expansion.negatives.reduce((n, w) => (w && t.includes(w) ? n + 1 : n), 0);
  let r = tailored ? 0.65 : 0.0;       // a tailored seed is relevant by construction
  r += Math.min(themeHits, 4) * 0.2;   // strong theme overlap can carry it to full relevance
  r -= negHits * 0.3;                  // off-focus industry noise is penalised
  return clamp01(r);
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
  /** Company expansion (themes/negatives). Null → relevance is neutral. */
  expansion?: ProfileExpansion | null;
  /** True when this opportunity's seed was tailored to the company. */
  tailored?: boolean;
}

export function scoreOpportunity(inp: ScoreInputs): Opportunity {
  const { topic, beat, signals, coverage, expansion = null, tailored = false } = inp;

  const magnitude = clamp01(maxOr0(signals.map((s) => s.magnitude)));
  const velocity = clamp01(maxOr0(signals.map((s) => s.velocity)));
  const credibility = clamp01(maxOr0(signals.map((s) => s.credibility)));
  // Unknown coverage → neutral 0.5 (don't reward or punish the gap blindly).
  const coverageGap = coverage ? clamp01(1 - coverage.volume) : 0.5;
  const fit = beatFit(topic, beat);
  const corr = corroboration(signals);

  const relText = `${topic} ${signals.map((s) => s.title).join(" ")} ${signals
    .map((s) => s.detail ?? "")
    .join(" ")}`;
  const relevance = companyRelevance(relText, expansion, tailored);
  // Company fit weights RANKING only — it no longer scales the displayed score,
  // so an honest, modest signal keeps its true strength number + a fit badge.
  const rankWeight = expansion ? RELEVANCE_FLOOR + (1 - RELEVANCE_FLOOR) * relevance : 1;
  const fitTier: Opportunity["fit"] = expansion
    ? relevance >= 0.7
      ? "high"
      : relevance >= 0.4
        ? "medium"
        : "low"
    : undefined;

  const base =
    WEIGHTS.magnitude * magnitude +
    WEIGHTS.velocity * velocity +
    WEIGHTS.coverageGap * coverageGap +
    WEIGHTS.fit * fit +
    WEIGHTS.credibility * credibility +
    WEIGHTS.corroborationBonus * corr;

  // Displayed score = honest signal strength (NOT scaled by relevance).
  const score = Math.round(clamp01(base) * 100);
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
    components: { magnitude, velocity, coverageGap, fit, relevance, credibility, corroboration: corr },
    relevanceMultiplier: rankWeight,
    tailored,
    fit: fitTier,
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
  // Rank by strength × fit so relevant-and-strong rises, while the DISPLAYED
  // score stays the honest strength number.
  const rankScore = (o: Opportunity) => o.score * (o.relevanceMultiplier ?? 1);
  return [...opps].sort((a, b) => {
    if (a.sensitive !== b.sensitive) return a.sensitive ? 1 : -1;
    return rankScore(b) - rankScore(a);
  });
}
