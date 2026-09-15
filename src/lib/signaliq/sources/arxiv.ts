/**
 * arXiv API (no key; returns Atom XML). Research often precedes coverage by
 * weeks — a surge of new preprints on a topic is an early signal.
 * magnitude — new papers in the last 30 days
 * velocity  — last 30 days vs the prior 60 (monthly rate)
 * trend     — signed version of that, used to damp magnitude when below norm
 * Light regex XML parse (no dependency added).
 */
import type { Signal } from "../types";
import { SOURCE_CREDIBILITY } from "../config";
import { clamp, clamp01, dampForDecline, daysSince, getText } from "./http";
import { createLimiter } from "./throttle";

const PAPERS_CAP = 20; // new papers/month on a niche topic = strong
const MAX_RESULTS = 50; // must match max_results in the query below

// arXiv asks clients to go easy; cap concurrent queries to avoid 429s/timeouts.
const arxivLimit = createLimiter({ concurrency: 4 });

function tag(entry: string, name: string): string {
  return (entry.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "").trim();
}

export async function arxivSignal(seed: string): Promise<Signal | null> {
  const url =
    `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(`all:"${seed}"`)}` +
    `&sortBy=submittedDate&sortOrder=descending&max_results=${MAX_RESULTS}`;
  try {
    const xml = await arxivLimit(() => getText(url));
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
    if (!entries.length) return null;

    const dates = entries.map((e) => tag(e, "published")).filter(Boolean);
    const recent30 = dates.filter((d) => daysSince(d) <= 30).length;
    if (recent30 === 0) return null;
    const prior = dates.filter((d) => daysSince(d) > 30 && daysSince(d) <= 90).length;
    const priorMonthly = prior / 2;

    const rawVelocity =
      priorMonthly > 0 ? (recent30 - priorMonthly) / Math.max(priorMonthly, 1) : recent30 > 3 ? 1 : 0.5;
    const velocity = clamp01(rawVelocity);
    // Signed direction (15 Sep 2026), but only when the prior window is complete.
    // The query returns the newest 50 papers, so on a busy topic the list runs out
    // before day 90 and the prior count is cut short. A cut-short baseline would
    // make a decline look like growth, so in that case we claim no direction.
    const oldest = dates[dates.length - 1];
    const priorTruncated = entries.length >= MAX_RESULTS && (!oldest || daysSince(oldest) <= 90);
    const trend = priorMonthly > 0 && !priorTruncated ? clamp(rawVelocity, -1, 1) : undefined;
    const magnitude = dampForDecline(clamp01(recent30 / PAPERS_CAP), trend);

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
      trend,
      credibility: SOURCE_CREDIBILITY.arxiv,
      detail: firstTitle ? `latest: ${firstTitle.slice(0, 90)}` : undefined,
    };
  } catch {
    return null;
  }
}
