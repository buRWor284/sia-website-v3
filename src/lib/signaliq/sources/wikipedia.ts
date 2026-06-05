/**
 * Wikipedia pageviews (no key). A spike in attention to a topic's article
 * often precedes mainstream coverage.
 *   1) resolve the seed → an article via the REST title search
 *   2) pull daily pageviews and compare the last 14 days to the prior 30
 * magnitude — recent average views (relative spike or absolute volume)
 * velocity  — size of the spike (recent ÷ prior − 1)
 */
import type { Signal } from "../types";
import { SOURCE_CREDIBILITY } from "../config";
import { avg, clamp01, getJson, ymd } from "./http";

const VIEW_CAP = 5000; // ~5k views/day with no prior baseline = strong

interface SearchResp {
  pages?: { key: string; title: string }[];
}
interface ViewsResp {
  items?: { views: number; timestamp: string }[];
}

async function resolveArticle(seed: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(seed)}&limit=1`;
  const json = (await getJson(url)) as SearchResp;
  return json.pages?.[0]?.key ?? null;
}

export async function wikipediaSignal(seed: string): Promise<Signal | null> {
  try {
    const key = await resolveArticle(seed);
    if (!key) return null;

    const url =
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/` +
      `en.wikipedia/all-access/all-agents/${encodeURIComponent(key)}/daily/${ymd(60)}/${ymd(1)}`;
    const json = (await getJson(url)) as ViewsResp;
    const items = json.items ?? [];
    if (items.length < 14) return null;

    const views = items.map((i) => i.views);
    const recent = avg(views.slice(-14));
    const prior = avg(views.slice(-44, -14));
    const spike = prior > 0 ? recent / prior : 1;

    // Skip the unremarkable: flat traffic and low absolute volume.
    if (spike < 1.15 && recent < 2000) return null;

    const magnitude = clamp01(prior > 0 ? recent / (prior * 3) : recent / VIEW_CAP);
    const velocity = clamp01(spike - 1); // +100% → 1.0
    const label = key.replace(/_/g, " ");

    return {
      source: "wikipedia",
      topic: seed,
      title:
        spike >= 1.15
          ? `Wikipedia views for "${label}" up ${Math.round((spike - 1) * 100)}%`
          : `Elevated Wikipedia attention to "${label}"`,
      url: `https://en.wikipedia.org/wiki/${key}`,
      observedAt: new Date().toISOString(),
      magnitude,
      velocity,
      credibility: SOURCE_CREDIBILITY.wikipedia,
      detail: `${Math.round(recent)} views/day (14d avg)`,
    };
  } catch {
    return null;
  }
}
