/**
 * Earned Media Radar — live data layer for the public /radar page (server-only).
 *
 * Reads the SignalIQ coverage cache (press-coverage volume + momentum for a
 * curated set of PR / earned-media / SEO / GEO topics) and the daily-count time
 * series that powers the sparklines. Uses the service-role client.
 *
 * Tables (emos-platform Supabase, same ones SignalIQ writes daily):
 *   signaliq_coverage_cache  — topic, volume (0..1), trend (-1..+1), article_count
 *   signaliq_daily_counts    — topic, day, article_count (matcher = 'webngrams_v2')
 */
import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { ACTIVE_COVERAGE_VERSION } from "@/lib/signaliq/coverage-store";
import { LENSES, type Lens, type RadarData, type RadarTopic } from "./types";

/**
 * The curated, marketing-safe focus set (no client-specific beats). Edit here to
 * change which topics the radar tracks. Topic strings must match the lowercase
 * canonical topic in signaliq_coverage_cache.
 */
export const FOCUS: { topic: string; lens: Lens }[] = [
  // PR
  { topic: "press release", lens: "pr" },
  { topic: "public relations", lens: "pr" },
  { topic: "media relations", lens: "pr" },
  { topic: "media outreach", lens: "pr" },
  { topic: "thought leadership", lens: "pr" },
  { topic: "earned media", lens: "pr" },
  { topic: "crisis communications", lens: "pr" },
  { topic: "data journalism", lens: "pr" },
  { topic: "brand mentions", lens: "pr" },
  { topic: "fractional cmo", lens: "pr" },
  { topic: "media pitching", lens: "pr" },
  // Earned
  { topic: "digital pr", lens: "earned" },
  { topic: "seo pr", lens: "earned" },
  { topic: "cold email", lens: "earned" },
  { topic: "link building", lens: "earned" },
  { topic: "editorial backlinks", lens: "earned" },
  // SEO
  { topic: "seo", lens: "seo" },
  { topic: "search engine optimization", lens: "seo" },
  { topic: "email marketing", lens: "seo" },
  { topic: "content marketing", lens: "seo" },
  { topic: "influencer marketing", lens: "seo" },
  { topic: "local seo", lens: "seo" },
  { topic: "zero-click search", lens: "seo" },
  // GEO
  { topic: "ai search", lens: "geo" },
  { topic: "generative engine optimization", lens: "geo" },
  { topic: "answer engine optimization", lens: "geo" },
  { topic: "ai generated content", lens: "geo" },
  { topic: "llm visibility", lens: "geo" },
];

const WINDOW_DAYS = 35;

interface CovRow {
  topic: string;
  volume: number;
  trend: number;
  article_count: number;
}
interface DailyRow {
  topic: string;
  day: string;
  article_count: number;
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const emptySeries = (): Record<Lens, number[]> => ({ pr: [], earned: [], seo: [], geo: [] });

/**
 * Fetch and shape the live radar data. Call from the server component with ISR
 * (revalidate) so it hits Supabase at most a couple of times a day. Never throws:
 * returns a safe empty-ish shape if Supabase is unavailable.
 */
export async function getRadarData(): Promise<RadarData> {
  const topics = FOCUS.map((f) => f.topic);
  const lensOf = new Map<string, Lens>(FOCUS.map((f) => [f.topic, f.lens]));

  try {
    const db = createSupabaseServiceClient();

    const [covRes, dailyRes] = await Promise.all([
      db
        .from("signaliq_coverage_cache")
        .select("topic, volume, trend, article_count")
        .eq("coverage_version", ACTIVE_COVERAGE_VERSION)
        .in("topic", topics),
      // 28 topics x 35 days = <1000 rows, safely under the PostgREST page cap
      db
        .from("signaliq_daily_counts")
        .select("topic, day, article_count")
        .eq("matcher", "webngrams_v2")
        .gte("day", isoDaysAgo(WINDOW_DAYS - 1))
        .in("topic", topics)
        .order("day", { ascending: true }),
    ]);

    const cov = (covRes.data ?? []) as CovRow[];
    const daily = (dailyRes.data ?? []) as DailyRow[];

    const radarTopics: RadarTopic[] = cov.map((r) => ({
      topic: r.topic,
      lens: lensOf.get(r.topic) ?? "pr",
      vol: Number(r.volume) || 0,
      tr: Number(r.trend) || 0,
      n: Number(r.article_count) || 0,
    }));

    const days = Array.from(new Set(daily.map((d) => String(d.day)))).sort();
    const dayIndex = new Map(days.map((d, i) => [d, i] as const));
    const series = emptySeries();
    for (const l of LENSES) series[l] = days.map(() => 0);
    for (const row of daily) {
      const l = lensOf.get(row.topic);
      const i = dayIndex.get(String(row.day));
      if (l === undefined || i === undefined) continue;
      series[l][i] += Number(row.article_count) || 0;
    }

    const lensTotal: Record<Lens, number> = { pr: 0, earned: 0, seo: 0, geo: 0 };
    const lensCount: Record<Lens, number> = { pr: 0, earned: 0, seo: 0, geo: 0 };
    for (const t of radarTopics) {
      lensTotal[t.lens] += t.n;
      lensCount[t.lens] += 1;
    }

    const risers = radarTopics.filter((t) => t.tr > 0).sort((a, b) => b.tr - a.tr);
    const gaps = radarTopics.slice().sort((a, b) => a.n - b.n).slice(0, 9);

    return {
      asOf: days.length ? days[days.length - 1] : isoDaysAgo(1),
      topics: radarTopics,
      series,
      lensTotal,
      lensCount,
      grand: LENSES.reduce((s, l) => s + lensTotal[l], 0),
      heating: risers.length,
      risers,
      gaps,
    };
  } catch {
    return {
      asOf: isoDaysAgo(1),
      topics: [],
      series: emptySeries(),
      lensTotal: { pr: 0, earned: 0, seo: 0, geo: 0 },
      lensCount: { pr: 0, earned: 0, seo: 0, geo: 0 },
      grand: 0,
      heating: 0,
      risers: [],
      gaps: [],
    };
  }
}
