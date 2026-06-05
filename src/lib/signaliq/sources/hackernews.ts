/**
 * Hacker News via the Algolia API (no key). Tech/SaaS/AI attention surges.
 * magnitude — cumulative points across recent matching stories
 * velocity  — share of those points earned in the last 7 days
 */
import type { Signal } from "../types";
import { SOURCE_CREDIBILITY } from "../config";
import { clamp01, getJson } from "./http";

const BASE = "https://hn.algolia.com/api/v1/search";
const POINTS_CAP = 600; // cumulative points (30d) that count as a strong signal

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
    const hits = (json.hits ?? []).filter((h) => h.title);
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
      detail: `${hits.length} HN stories · ${totalPoints} pts in 30d`,
    };
  } catch {
    return null;
  }
}
