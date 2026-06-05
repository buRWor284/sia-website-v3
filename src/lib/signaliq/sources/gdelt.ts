/**
 * GDELT DOC 2.0 — the coverage denominator (RFP §5, §6).
 * `timelinevol` returns "Volume Intensity": the % of all global news coverage
 * matching the query, day by day. We turn that into:
 *   volume  — how much press already covers it now (0..1, normalised by a cap)
 *   trend   — recent vs prior coverage (-1..1)
 * High volume → small coverage gap → lower opportunity score.
 *
 * No API key. Caps below are tunable once live data is observed.
 */
import type { Coverage } from "../types";
import { avg, clamp, clamp01, getJson } from "./http";

const BASE = "https://api.gdeltproject.org/api/v2/doc/doc";

// ~0.5% of all global coverage = "saturated" for a niche business topic.
const VOLUME_CAP = 0.5;

interface TimelineResp {
  timeline?: { series: string; data: { date: string; value: number }[] }[];
}

export async function gdeltCoverage(topic: string): Promise<Coverage | null> {
  const url =
    `${BASE}?query=${encodeURIComponent(`"${topic}"`)}` +
    `&mode=timelinevol&format=json&timespan=3m`;
  try {
    const json = (await getJson(url)) as TimelineResp;
    const data = json.timeline?.[0]?.data ?? [];
    if (!data.length) {
      return { topic, volume: 0, trend: 0, articleCount: 0, source: "gdelt" };
    }
    const vals = data.map((d) => d.value);
    const recent = avg(vals.slice(-14)); // last ~2 weeks
    const prior = avg(vals.slice(-42, -14)); // the ~4 weeks before that
    const volume = clamp01(recent / VOLUME_CAP);
    const trend = prior > 0 ? clamp((recent - prior) / prior, -1, 1) : recent > 0 ? 1 : 0;
    const daysCovered = vals.filter((v) => v > 0).length;
    return { topic, volume, trend, articleCount: daysCovered, source: "gdelt" };
  } catch {
    return null; // unknown coverage → scorer treats the gap as neutral
  }
}
