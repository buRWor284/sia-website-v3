/**
 * Hacker News via the Algolia API (no key). Tech/SaaS/AI attention surges.
 * magnitude — cumulative points across recent matching stories
 * velocity  — share of those points earned in the last 7 days
 * No baseline: the 30-day query has no prior window to compare against, so HN
 * sets no `trend` and its magnitude is NOT damped for declines (15 Sep 2026).
 * Adding a prior-window query would be the way to change that.
 */
import type { Signal } from "../types";
import { SOURCE_CREDIBILITY } from "../config";
import { clamp01, getJson } from "./http";

const BASE = "https://hn.algolia.com/api/v1/search";
const POINTS_CAP = 600; // cumulative points (30d) that count as a strong signal
// Thin sample (16 Sep 2026): one or two quiet stories are not evidence. Without this
// flag a "2 SEC filings" card escaped the thin-evidence cap just because one HN story
// also matched. A single story with real traction (100+ points) still counts.
const MIN_STORIES = 3;
const MIN_POINTS = 100;

interface HnResp {
  hits?: {
    title: string;
    url?: string;
    objectID: string;
    points?: number;
    num_comments?: number;
    created_at_i: number;
  }[];
}

export async function hnSignal(seed: string): Promise<Signal | null> {
  const since = Math.floor(Date.now() / 1000) - 30 * 86_400;
  const url =
    `${BASE}?query=${encodeURIComponent(seed)}&tags=story` +
    `&numericFilters=created_at_i>${since}&hitsPerPage=30`;
  try {
    const json = (await getJson(url)) as HnResp;
    const all = (json.hits ?? []).filter((h) => h.title);
    if (!all.length) return null;

    // Algolia search is fuzzy — keep only stories whose title actually contains
    // a meaningful seed term, so loosely-matched noise (e.g. an unrelated
    // "Show HN" post) isn't surfaced as the headline. A single generic buzzword
    // (e.g. "open", "platform") isn't enough on its own — that's how an
    // unrelated "open-source game platform" post once got attached to the seed
    // "open banking" (it only shares the word "open"). Require either 2+
    // distinct seed tokens in the title, or a single match that isn't generic.
    const GENERIC_TOKENS = new Set([
      "open", "smart", "digital", "cloud", "mobile", "data", "platform",
      "market", "service", "services", "tech", "technology", "app", "apps",
      "software", "system", "systems", "based", "using", "startup", "startups",
      "growth", "new", "next",
    ]);
    const seedTokens = seed.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const hits = seedTokens.length
      ? all.filter((h) => {
          const t = h.title.toLowerCase();
          const matched = seedTokens.filter((tok) => t.includes(tok));
          if (matched.length === 0) return false;
          if (matched.length === 1) return !GENERIC_TOKENS.has(matched[0]);
          return true;
        })
      : all;
    if (!hits.length) return null;

    const top = hits.reduce((a, b) => ((b.points ?? 0) > (a.points ?? 0) ? b : a), hits[0]);
    const totalPoints = hits.reduce((s, h) => s + (h.points ?? 0), 0);
    const weekAgo = Math.floor(Date.now() / 1000) - 7 * 86_400;
    const recentPoints = hits
      .filter((h) => h.created_at_i >= weekAgo)
      .reduce((s, h) => s + (h.points ?? 0), 0);

    const magnitude = clamp01(totalPoints / POINTS_CAP);
    const velocity = clamp01(
      totalPoints > 0 ? recentPoints / totalPoints + (hits.length >= 5 ? 0.1 : 0) : 0,
    );

    return {
      source: "hackernews",
      topic: seed,
      title: top.title,
      url: `https://news.ycombinator.com/item?id=${top.objectID}`,
      observedAt: new Date().toISOString(),
      magnitude,
      velocity,
      credibility: SOURCE_CREDIBILITY.hackernews,
      detail: `${hits.length} HN stories · ${totalPoints} pts in 30d${hits.length < MIN_STORIES && totalPoints < MIN_POINTS ? "; too few stories to call a trend" : ""}`,
      lowSample: hits.length < MIN_STORIES && totalPoints < MIN_POINTS,
    };
  } catch {
    return null;
  }
}
