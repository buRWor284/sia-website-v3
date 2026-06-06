/**
 * arXiv API (no key; returns Atom XML). Research often precedes coverage by
 * weeks — a surge of new preprints on a topic is an early signal.
 * magnitude — new papers in the last 30 days
 * velocity  — last 30 days vs the prior 60
 * Light regex XML parse (no dependency added).
 */
import type { Signal } from "../types";
import { SOURCE_CREDIBILITY } from "../config";
import { clamp01, daysSince, getText } from "./http";

const PAPERS_CAP = 20; // new papers/month on a niche topic = strong

function tag(entry: string, name: string): string {
  return (entry.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "").trim();
}

export async function arxivSignal(seed: string): Promise<Signal | null> {
  const url =
    `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(`all:"${seed}"`)}` +
    `&sortBy=submittedDate&sortOrder=descending&max_results=50`;
  try {
    const xml = await getText(url);
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
    if (!entries.length) return null;

    const dates = entries.map((e) => tag(e, "published")).filter(Boolean);
    const recent30 = dates.filter((d) => daysSince(d) <= 30).length;
    if (recent30 === 0) return null;
    const prior = dates.filter((d) => daysSince(d) > 30 && daysSince(d) <= 90).length;
    const priorMonthly = prior / 2;

    const magnitude = clamp01(recent30 / PAPERS_CAP);
    const velocity = clamp01(
      priorMonthly > 0 ? (recent30 - priorMonthly) / Math.max(priorMonthly, 1) : recent30 > 3 ? 1 : 0.5,
    );

    const firstTitle = tag(entries[0], "title").replace(/\s+/g, " ");
    const id = tag(entries[0], "id");

    return {
      source: "arxiv",
      topic: seed,
      title: `${recent30} new arXiv papers on "${seed}" in 30 days`,
      // Link to arXiv search results page, not a specific paper — avoids
      // showing an irrelevant paper abstract (e.g. "battery longevity" when
      // the user searched for health longevity).
      url: `https://arxiv.org/search/?query=${encodeURIComponent(`"${seed}"`)}&searchtype=all&order=-announced_date_first`,
      observedAt: new Date().toISOString(),
      magnitude,
      velocity,
      credibility: SOURCE_CREDIBILITY.arxiv,
      detail: firstTitle ? `latest: ${firstTitle.slice(0, 90)}` : undefined,
    };
  } catch {
    return null;
  }
}
