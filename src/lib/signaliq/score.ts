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

// Trend-direction guard (found 2026-07-08, see SignalIQ-Notes-and-TODOs.md "Scoring
// logic gap"): a falling coverage.volume used to score identically whether the
// underlying signals were rising (real whitespace — you're ahead of the coverage) or
// also falling (the topic has peaked and is cooling off). |trend| below this is noise.
const COOLING_TREND_EPS = 0.05;
// Residual credit given to the coverage gap when the topic is cooling — not zeroed
// entirely (data is noisy / short windows), but heavily discounted vs. real whitespace.
const COOLING_GAP_DISCOUNT = 0.15;

/**
 * True when press coverage is trending down AND no signal source shows real upward
 * movement (each source's `trend` if known, else its `velocity` — which is always
 * >= 0 — as a conservative fallback). In that state, low/falling coverage is NOT
 * whitespace; it's a topic that already peaked. See notes above.
 */
export function isCooling(coverage: Coverage | null, signals: Signal[]): boolean {
  if (!coverage) return false; // unknown coverage → don't penalise
  const bestTrend = maxOr0(signals.map((s) => s.trend ?? s.velocity));
  return coverage.trend < -COOLING_TREND_EPS && bestTrend <= COOLING_TREND_EPS;
}

/**
 * UI-facing coverage-gap state, derived from fields already on Opportunity so every
 * surface (radar cards, angle detail, receipts panel, EMOS dashboard) reads it the
 * same way instead of re-deriving it:
 *   "no-data" — GDELT returned nothing; `components.coverageGap` is the neutral 0.5
 *               default, not a real reading. Don't show it as "medium."
 *   "cooling" — coverage exists but `isCooling()` discounted the gap (see above).
 *   "normal"  — a real, undiscounted coverage-gap reading.
 * Added 2026-07-08 because the discount/no-data cases were computed correctly but
 * invisible on screen — a real "medium" gap and an unknown one rendered identically.
 * See SignalIQ-Notes-and-TODOs.md.
 */
export type CoverageState = "no-data" | "cooling" | "normal";

export function coverageState(opp: Pick<Opportunity, "coverage" | "cooling">): CoverageState {
  if (!opp.coverage) return "no-data";
  if (opp.cooling) return "cooling";
  return "normal";
}

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
  let r = tailored ? 0.75 : 0.0;       // the model explicitly selected this topic for the company → high fit
  r += Math.min(themeHits, 4) * 0.2;   // theme overlap pushes toward full relevance
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
  const rawCoverageGap = coverage ? clamp01(1 - coverage.volume) : 0.5;
  // Cooling topic (falling coverage + nothing rising) → discount the gap heavily so
  // it isn't framed as whitespace. See isCooling() above.
  const cooling = isCooling(coverage, signals);
  const coverageGap = cooling ? clamp01(rawCoverageGap * COOLING_GAP_DISCOUNT) : rawCoverageGap;
  const fit = beatFit(topic, beat);
  const corr = corroboration(signals);

  const relText = `${topic} ${signals.map((s) => s.title).join(" ")} ${signals
    .map((s) => s.detail ?? "")
    .join(" ")}`;
  // Fit: use the model's explicit per-topic rating for selected topics; fall
  // back to a theme-overlap heuristic for generic beat backfill. Fit drives the
  // badge + RANKING only — it never scales the displayed strength score.
  let fitTier: Opportunity["fit"] = undefined;
  let relevance = 1;
  if (expansion) {
    const rated = expansion.fits[topic.trim().toLowerCase()];
    if (rated) {
      fitTier = rated;
    } else {
      const r = companyRelevance(relText, expansion, false);
      // Threshold raised from 0.4 → 0.6: two incidental generic-theme-word
      // hits (0.2 each) used to be enough to earn "medium" for an otherwise
      // unrelated, non-tailored topic. Now needs ~3 real theme hits (or 2 +
      // partial signal) before we call it medium instead of low.
      fitTier = r >= 0.6 ? "medium" : "low";
    }
    relevance = fitTier === "high" ? 0.9 : fitTier === "medium" ? 0.55 : 0.2;
  }
  const rankWeight = expansion ? RELEVANCE_FLOOR + (1 - RELEVANCE_FLOOR) * relevance : 1;

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
    cooling,
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
