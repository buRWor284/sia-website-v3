/**
 * KSA Tourism & Hospitality Radar — live data layer (server-only).
 *
 * Reads the same SignalIQ tables as /earned-media-radar (see src/lib/radar/data.ts),
 * scoped to the `ksa-tourism` beat topics. Written BEFORE the seeds are deployed:
 * until the beat ships and the backfill runs, both queries return zero rows and
 * `hasData` is false — the page then renders its curated layer with the live-wire
 * band in a "pending" state. No code change needed when the data lands.
 *
 * Tables (emos-platform Supabase, written daily by the coverage refresh):
 *   signaliq_coverage_cache  — topic, volume (0..1), trend (-1..+1), article_count
 *   signaliq_daily_counts    — topic, day, article_count (matcher = 'webngrams_v2')
 */
import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { ACTIVE_COVERAGE_VERSION } from "@/lib/signaliq/coverage-store";
import { KSA_LENSES, type KsaLens, type KsaLiveTopic, type KsaRadarData } from "./types";

/**
 * The ksa-tourism beat topics (lowercase canonical, matching the seed list in
 * src/lib/signaliq/config.ts). "saudi tourism" / "saudi hotels" are umbrella
 * head-terms: they feed lens totals but are kept off signal headlines.
 */
export const KSA_FOCUS: { topic: string; lens: KsaLens }[] = [
  // giga-projects & destinations
  { topic: "neom", lens: "giga" },
  { topic: "red sea global", lens: "giga" },
  { topic: "alula", lens: "giga" },
  { topic: "diriyah", lens: "giga" },
  { topic: "qiddiya", lens: "giga" },
  { topic: "new murabba", lens: "giga" },
  { topic: "mukaab", lens: "giga" },
  { topic: "soudah peaks", lens: "giga" },
  // mega-events & entertainment
  { topic: "riyadh season", lens: "events" },
  { topic: "expo 2030", lens: "events" },
  { topic: "2034 world cup", lens: "events" },
  { topic: "saudi grand prix", lens: "events" },
  { topic: "saudi arabian grand prix", lens: "events" }, // variant seed, accrues from 2026-07-25
  { topic: "esports world cup", lens: "events" },
  { topic: "soundstorm", lens: "events" },
  { topic: "jeddah season", lens: "events" },
  { topic: "sharqiah season", lens: "events" }, // calibration control: should read DORMANT
  // hospitality & aviation
  { topic: "riyadh air", lens: "hosp" },
  { topic: "saudia", lens: "hosp" },
  { topic: "aroya cruises", lens: "hosp" },
  { topic: "cruise saudi", lens: "hosp" },
  { topic: "saudi hotels", lens: "hosp" },
  { topic: "saudi hotel", lens: "hosp" }, // variant seed, accrues from 2026-07-25
  { topic: "king salman international airport", lens: "hosp" },
  { topic: "saudi tourism", lens: "hosp" },
  // faith & Muslim-friendly travel
  { topic: "hajj", lens: "faith" },
  { topic: "umrah", lens: "faith" },
  { topic: "makkah", lens: "faith" },
  { topic: "madinah", lens: "faith" },
  { topic: "halal travel", lens: "faith" },
  { topic: "muslim travelers", lens: "faith" },
  { topic: "nusuk", lens: "faith" },
  { topic: "haramain", lens: "faith" },
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

const emptySeries = (): Record<KsaLens, number[]> => ({ giga: [], events: [], hosp: [], faith: [] });

const emptyData = (): KsaRadarData => ({
  hasData: false,
  asOf: isoDaysAgo(1),
  topics: [],
  series: emptySeries(),
  lensTotal: { giga: 0, events: 0, hosp: 0, faith: 0 },
  lensCount: { giga: 0, events: 0, hosp: 0, faith: 0 },
  grand: 0,
  heating: 0,
  risers: [],
  quiet: [],
});

/**
 * Fetch and shape the live radar data. Call from the server component with ISR
 * (revalidate) so it hits Supabase at most a couple of times a day. Never throws:
 * returns a safe empty shape (hasData=false) if Supabase is unavailable or the
 * ksa-tourism seeds have not been scanned yet.
 */
export async function getKsaRadarData(): Promise<KsaRadarData> {
  const topics = KSA_FOCUS.map((f) => f.topic);
  const lensOf = new Map<string, KsaLens>(KSA_FOCUS.map((f) => [f.topic, f.lens]));

  try {
    const db = createSupabaseServiceClient();

    const [covRes, dailyRes] = await Promise.all([
      db
        .from("signaliq_coverage_cache")
        .select("topic, volume, trend, article_count")
        .eq("coverage_version", ACTIVE_COVERAGE_VERSION)
        .in("topic", topics),
      // 30 topics x 35 days = ~1050 rows worst case; PostgREST default page cap
      // is 1000, so cap explicitly to stay deterministic.
      db
        .from("signaliq_daily_counts")
        .select("topic, day, article_count")
        .eq("matcher", "webngrams_v2")
        .gte("day", isoDaysAgo(WINDOW_DAYS - 1))
        .in("topic", topics)
        .order("day", { ascending: true })
        .limit(2000),
    ]);

    const cov = (covRes.data ?? []) as CovRow[];
    const daily = (dailyRes.data ?? []) as DailyRow[];
    if (cov.length === 0 && daily.length === 0) return emptyData();

    const liveTopics: KsaLiveTopic[] = cov.map((r) => ({
      topic: r.topic,
      lens: lensOf.get(r.topic) ?? "hosp",
      vol: Number(r.volume) || 0,
      tr: Number(r.trend) || 0,
      n: Number(r.article_count) || 0,
    }));

    const days = Array.from(new Set(daily.map((d) => String(d.day)))).sort();
    const dayIndex = new Map(days.map((d, i) => [d, i] as const));
    const series = emptySeries();
    for (const l of KSA_LENSES) series[l] = days.map(() => 0);
    for (const row of daily) {
      const l = lensOf.get(row.topic);
      const i = dayIndex.get(String(row.day));
      if (l === undefined || i === undefined) continue;
      series[l][i] += Number(row.article_count) || 0;
    }

    const lensTotal: Record<KsaLens, number> = { giga: 0, events: 0, hosp: 0, faith: 0 };
    const lensCount: Record<KsaLens, number> = { giga: 0, events: 0, hosp: 0, faith: 0 };
    for (const t of liveTopics) {
      lensTotal[t.lens] += t.n;
      lensCount[t.lens] += 1;
    }

    const risers = liveTopics.filter((t) => t.tr > 0).sort((a, b) => b.tr - a.tr);
    const quiet = liveTopics.slice().sort((a, b) => a.n - b.n).slice(0, 8);

    return {
      hasData: true,
      asOf: days.length ? days[days.length - 1] : isoDaysAgo(1),
      topics: liveTopics,
      series,
      lensTotal,
      lensCount,
      grand: KSA_LENSES.reduce((s, l) => s + lensTotal[l], 0),
      heating: risers.length,
      risers,
      quiet,
    };
  } catch {
    return emptyData();
  }
}
