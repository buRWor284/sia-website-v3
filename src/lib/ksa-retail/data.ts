/**
 * KSA Retail & Consumer Radar — live data layer (server-only).
 *
 * Reads the same SignalIQ tables as /ksa-tourism-radar (see src/lib/ksa-radar/data.ts),
 * scoped to the `ksa-retail` beat topics. The beat shipped 2026-08-10 (commit df5db43)
 * with daily counts accruing from 2026-07-26 and a 62-day deepen backfilled to
 * 2026-06-09. Until the coverage cache picks the topics up, both queries return
 * zero rows and `hasData` is false: the page then renders its curated layer with
 * the live-wire band in a "pending" state. No code change needed when data lands.
 *
 * Tables (emos-platform Supabase, written daily by the coverage refresh):
 *   signaliq_coverage_cache  — topic, volume (0..1), trend (-1..+1), article_count
 *   signaliq_daily_counts    — topic, day, article_count (matcher = 'webngrams_v2')
 */
import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { ACTIVE_COVERAGE_VERSION } from "@/lib/signaliq/coverage-store";
import { RETAIL_LENSES, type RetailLens, type RetailLiveTopic, type RetailRadarData } from "./types";

/**
 * The ksa-retail beat topics on the page (lowercase canonical, matching the seed
 * list in src/lib/signaliq/config.ts). Notes:
 * - "saudi retail" / "saudi consumer" are umbrella head-terms: they feed the
 *   macro lens totals but never headline the radar's own numbers.
 * - "bindawood" is the calibration control: a real Tadawul-listed grocer with
 *   near-zero English press and no curated demand file, so it should read
 *   DORMANT. A radar that can say no is the point.
 * - "quick commerce" is deliberately NOT tracked here: the global term's counts
 *   are dominated by India coverage and would pollute the ecom lens totals.
 *   Its signal file renders as curated context only.
 * - Zero-count probe seeds (mrsool, floward, tamimi markets, al othaim) stay in
 *   the beat accruing data but are not page topics; see the 2026-08-10 probe.
 */
export const RETAIL_FOCUS: { topic: string; lens: RetailLens }[] = [
  // e-commerce & delivery
  { topic: "salla", lens: "ecom" },
  { topic: "hungerstation", lens: "ecom" },
  { topic: "jahez", lens: "ecom" },
  { topic: "white friday", lens: "ecom" },
  { topic: "saudi e-commerce", lens: "ecom" },
  { topic: "saudi food delivery", lens: "ecom" },
  // retail groups & brands
  { topic: "alshaya", lens: "brands" },
  { topic: "jarir", lens: "brands" },
  { topic: "cenomi", lens: "brands" },
  { topic: "savola", lens: "brands" },
  { topic: "almarai", lens: "brands" },
  { topic: "lulu hypermarket", lens: "brands" },
  { topic: "nahdi", lens: "brands" },
  { topic: "bindawood", lens: "brands" }, // calibration control: should read DORMANT
  // lifestyle & entertainment retail
  { topic: "saudi fashion", lens: "lifestyle" },
  { topic: "riyadh fashion week", lens: "lifestyle" },
  { topic: "saudi coffee", lens: "lifestyle" },
  { topic: "saudi beauty", lens: "lifestyle" },
  { topic: "savvy games", lens: "lifestyle" },
  { topic: "saudi gaming", lens: "lifestyle" },
  { topic: "saudi malls", lens: "lifestyle" },
  // consumer economy (macro)
  { topic: "saudi retail", lens: "macro" },
  { topic: "saudi consumer", lens: "macro" },
  { topic: "saudi consumer spending", lens: "macro" },
  { topic: "saudi advertising", lens: "macro" },
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

const emptySeries = (): Record<RetailLens, number[]> => ({ ecom: [], brands: [], lifestyle: [], macro: [] });

const emptyData = (): RetailRadarData => ({
  hasData: false,
  asOf: isoDaysAgo(1),
  topics: [],
  series: emptySeries(),
  lensTotal: { ecom: 0, brands: 0, lifestyle: 0, macro: 0 },
  lensCount: { ecom: 0, brands: 0, lifestyle: 0, macro: 0 },
  grand: 0,
  heating: 0,
  risers: [],
  quiet: [],
});

/**
 * Fetch and shape the live radar data. Call from the server component with ISR
 * (revalidate) so it hits Supabase at most a couple of times a day. Never throws:
 * returns a safe empty shape (hasData=false) if Supabase is unavailable or the
 * ksa-retail seeds have not been scanned yet.
 */
export async function getRetailRadarData(): Promise<RetailRadarData> {
  const topics = RETAIL_FOCUS.map((f) => f.topic);
  const lensOf = new Map<string, RetailLens>(RETAIL_FOCUS.map((f) => [f.topic, f.lens]));

  try {
    const db = createSupabaseServiceClient();

    const [covRes, dailyRes] = await Promise.all([
      db
        .from("signaliq_coverage_cache")
        .select("topic, volume, trend, article_count")
        .eq("coverage_version", ACTIVE_COVERAGE_VERSION)
        .in("topic", topics),
      // 25 topics x 35 days = ~875 rows worst case; PostgREST default page cap
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

    const liveTopics: RetailLiveTopic[] = cov.map((r) => ({
      topic: r.topic,
      lens: lensOf.get(r.topic) ?? "macro",
      vol: Number(r.volume) || 0,
      tr: Number(r.trend) || 0,
      n: Number(r.article_count) || 0,
    }));

    const days = Array.from(new Set(daily.map((d) => String(d.day)))).sort();
    const dayIndex = new Map(days.map((d, i) => [d, i] as const));
    const series = emptySeries();
    for (const l of RETAIL_LENSES) series[l] = days.map(() => 0);
    for (const row of daily) {
      const l = lensOf.get(row.topic);
      const i = dayIndex.get(String(row.day));
      if (l === undefined || i === undefined) continue;
      series[l][i] += Number(row.article_count) || 0;
    }

    const lensTotal: Record<RetailLens, number> = { ecom: 0, brands: 0, lifestyle: 0, macro: 0 };
    const lensCount: Record<RetailLens, number> = { ecom: 0, brands: 0, lifestyle: 0, macro: 0 };
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
      grand: RETAIL_LENSES.reduce((s, l) => s + lensTotal[l], 0),
      heating: risers.length,
      risers,
      quiet,
    };
  } catch {
    return emptyData();
  }
}
