// ─────────────────────────────────────────────────────────────────────────────
// CoverageIQ — Placement value (the rebuilt "Points"), 2026-09-25.
//
// Decided by Irfan on 25 Sep 2026 from SignalIQ-Magnitude-and-Points-Decision-
// 2026-09-13.md, Part B, all three recommended options:
//   P1  weights   authority 40 · relevance 30 · traffic 15 · link quality 15
//   P2  relevance beat-tag overlap with the company context, manual override 1-3
//   P3  audience  INTERNAL ONLY (EMOS admin accounts), never on a client screen
//
// The old `coverageiq_pitches.points` column held hand-seeded numbers with no
// formula behind them. This module IS the formula: computed at render from
// facts already on the row, never stored, never typed by hand. Pure module,
// no React, safe to import anywhere.
// ─────────────────────────────────────────────────────────────────────────────

import type { LinkType, ContentType } from "./types";

export const PLACEMENT_VALUE_WEIGHTS = {
  authority: 0.40,
  relevance: 0.30,
  traffic: 0.15,
  linkQuality: 0.15,
} as const;

/** Manual relevance override: 1 = off-topic, 2 = adjacent, 3 = squarely on-topic. */
export type RelevanceOverride = 1 | 2 | 3;
const OVERRIDE_SCORE: Record<RelevanceOverride, number> = { 1: 0.2, 2: 0.6, 3: 1.0 };

/** Blank = neutral, never zero: an unknown outlet is not a worthless one. */
export const NEUTRAL = 0.5;

export interface PlacementValueInput {
  dr: number | null;
  journalistTags: string[];
  companyContext: string | null;
  relevanceOverride: RelevanceOverride | null;
  estMonthlyTraffic: number | null;
  linkType: LinkType | null;
  contentType: ContentType | null;
}

export interface PlacementValueBreakdown {
  /** 0-100, rounded. */
  value: number;
  authority: number;   // 0..1
  relevance: number;   // 0..1
  traffic: number;     // 0..1
  linkQuality: number; // 0..1
  /** Which parts fell back to NEUTRAL because the input was blank. */
  assumed: ("authority" | "relevance" | "traffic")[];
  relevanceSource: "override" | "tags" | "assumed";
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** DR is already 0..100 and already logarithmic (Ahrefs); linear is right. */
export function authorityScore(dr: number | null): number | null {
  if (dr == null || !Number.isFinite(dr)) return null;
  return clamp01(dr / 100);
}

/**
 * Relevance from beat tags vs company context. A tag counts as a hit when the
 * context mentions it, or when at least one of its meaningful words does
 * ("saudi retail" hits a context that says "retail"). Share of tags that hit,
 * lifted so that one solid hit already reads as adjacent rather than
 * off-topic. No stemming, no synonyms: the same deliberate simplicity as
 * beatToTags, so a score is always explainable from the words on screen.
 */
const STOP = new Set(["the", "and", "of", "for", "in", "on", "to", "a", "an", "&", "with", "at", "by", "or", "vs", "news"]);

export function relevanceFromTags(tags: string[], context: string | null): number | null {
  if (!tags.length || !context || !context.trim()) return null;
  const ctx = ` ${context.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ")} `;
  let hits = 0;
  for (const tag of tags) {
    const t = tag.toLowerCase().trim();
    if (!t) continue;
    if (ctx.includes(` ${t} `)) { hits++; continue; }
    const words = t.split(/[\s-]+/).filter(w => w.length > 2 && !STOP.has(w));
    if (words.some(w => ctx.includes(` ${w} `) || ctx.includes(` ${w}s `))) hits++;
  }
  if (hits === 0) return 0.2;
  // 1 hit of many → 0.6 floor ("adjacent"); every tag hitting → 1.0.
  return clamp01(0.6 + 0.4 * (hits / tags.length));
}

/** log-scaled: 10k → 0.4, 100k → 0.6, 1M → 0.8, 10M → 1.0. */
export function trafficScore(monthly: number | null): number | null {
  if (monthly == null || !Number.isFinite(monthly) || monthly <= 0) return null;
  return clamp01((Math.log10(monthly) - 2) / 5);
}

export function linkQualityScore(linkType: LinkType | null, contentType: ContentType | null): number {
  const link = linkType === "Do Follow" ? 1.0 : linkType === "No Follow" ? 0.5 : 0.25; // N/A or blank = mention, no link
  const piece = contentType === "Republished" ? 0.6 : 1.0;
  return clamp01(link * piece);
}

export function placementValue(input: PlacementValueInput): PlacementValueBreakdown {
  const assumed: PlacementValueBreakdown["assumed"] = [];

  let authority = authorityScore(input.dr);
  if (authority == null) { authority = NEUTRAL; assumed.push("authority"); }

  let relevance: number;
  let relevanceSource: PlacementValueBreakdown["relevanceSource"];
  if (input.relevanceOverride) {
    relevance = OVERRIDE_SCORE[input.relevanceOverride];
    relevanceSource = "override";
  } else {
    const fromTags = relevanceFromTags(input.journalistTags, input.companyContext);
    if (fromTags == null) { relevance = NEUTRAL; relevanceSource = "assumed"; assumed.push("relevance"); }
    else { relevance = fromTags; relevanceSource = "tags"; }
  }

  let traffic = trafficScore(input.estMonthlyTraffic);
  if (traffic == null) { traffic = NEUTRAL; assumed.push("traffic"); }

  const linkQuality = linkQualityScore(input.linkType, input.contentType);

  const W = PLACEMENT_VALUE_WEIGHTS;
  const sum = W.authority * authority + W.relevance * relevance + W.traffic * traffic + W.linkQuality * linkQuality;
  return { value: Math.round(100 * sum), authority, relevance, traffic, linkQuality, assumed, relevanceSource };
}

/** One-line, plain-English explanation for a tooltip. */
export function explainPlacementValue(b: PlacementValueBreakdown): string {
  const pct = (n: number) => `${Math.round(n * 100)}`;
  const rel = b.relevanceSource === "override" ? "your override" : b.relevanceSource === "tags" ? "beat tags vs company brief" : "assumed";
  const parts = [
    `Authority ${pct(b.authority)} (DR, 40%)`,
    `Relevance ${pct(b.relevance)} (${rel}, 30%)`,
    `Traffic ${pct(b.traffic)} (${b.assumed.includes("traffic") ? "no traffic data, assumed" : "est. monthly visits"}, 15%)`,
    `Link quality ${pct(b.linkQuality)} (dofollow/nofollow/mention × original/republished, 15%)`,
  ];
  return `Placement value ${b.value}/100 = ${parts.join(" · ")}. Internal figure, not shown to clients.`;
}

/** Formula in one line, for the legend. Derived from the weights, never typed. */
export function placementValueFormula(): string {
  const W = PLACEMENT_VALUE_WEIGHTS;
  const p = (n: number) => `${Math.round(n * 100)}%`;
  return `Authority (DR) ${p(W.authority)} + Relevance ${p(W.relevance)} + Traffic ${p(W.traffic)} + Link quality ${p(W.linkQuality)}`;
}
