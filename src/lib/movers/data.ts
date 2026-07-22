/**
 * Founder Movers — live data layer for the public /movers page (server-only).
 *
 * Reads signaliq_daily_counts (the daily coverage time series SignalIQ scans into
 * every day) for the Founders / Series-A beat and computes week-over-week
 * momentum + latest-day spikes. Uses the service-role client. Never throws:
 * returns a safe empty shape if Supabase is unavailable.
 *
 * Topic universe = the `founders` beat seeds (config.ts), canonicalised — so
 * editing that beat automatically changes what /movers tracks. buildTopicMatchers
 * de-dupes, matching the lowercase canonical topic stored in signaliq_daily_counts.
 */
import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { beatById } from "@/lib/signaliq/config";
import { buildTopicMatchers } from "@/lib/signaliq/coverage/tokenize";
import type { MoversData, MoverTopic } from "./types";

const MATCHER = "webngrams_v2";
const WINDOW_DAYS = 28;
const MIN_SCANNED_DAYS = 14; // need ~2 weeks of REAL scanned days before a topic can rank — kills half-backfilled artifacts
const MIN_PRIOR7 = 30; // WoW noise floor — need a real base the prior week
const MIN_LAST7 = 15; // …and real coverage this week, so tiny topics can't post +900%
const MIN_AVG_SPIKE = 8; // spikes only for topics with a real daily baseline
const MAX_ROWS = 8;
const MAX_SPIKES = 6;

/** Canonical, de-duped founder topics from the Founders / Series-A beat. */
const FOUNDER_TOPICS: string[] = buildTopicMatchers(beatById("founders").seeds).map((m) => m.topic);

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

const sum = (a: number[]): number => a.reduce((s, x) => s + x, 0);

/** Paginated pull — 43 founder topics × 28 days can exceed the PostgREST 1k cap. */
async function fetchDaily(topics: string[], sinceDay: string): Promise<DailyRow[]> {
  const db = createSupabaseServiceClient();
  const PAGE = 1000;
  const out: DailyRow[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await db
      .from("signaliq_daily_counts")
      .select("topic, day, article_count")
      .eq("matcher", MATCHER)
      .gte("day", sinceDay)
      .in("topic", topics)
      .order("topic", { ascending: true })
      .order("day", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error || !data || data.length === 0) break;
    out.push(...(data as DailyRow[]));
    if (data.length < PAGE) break;
  }
  return out;
}

function statsFor(topic: string, series: number[]): MoverTopic {
  const last7 = sum(series.slice(-7));
  const prior7 = sum(series.slice(-14, -7));
  const wow = prior7 > 0 ? (last7 - prior7) / prior7 : last7 > 0 ? 1 : 0;
  const n = sum(series);
  const avgDay = series.length ? n / series.length : 0;
  const variance = series.length ? sum(series.map((v) => (v - avgDay) ** 2)) / series.length : 0;
  const sd = Math.sqrt(variance);
  const lastDay = series.length ? series[series.length - 1] : 0;
  const z = sd > 0 ? (lastDay - avgDay) / sd : 0;
  return { topic, series, last7, prior7, wow, z, lastDay, avgDay, n };
}

export async function getMoversData(): Promise<MoversData> {
  const empty: MoversData = {
    asOf: isoDaysAgo(1),
    windowDays: WINDOW_DAYS,
    covered: 0,
    totalLast7: 0,
    heatingCount: 0,
    coolingCount: 0,
    risers: [],
    coolers: [],
    spikes: [],
  };

  try {
    const rows = await fetchDaily(FOUNDER_TOPICS, isoDaysAgo(WINDOW_DAYS - 1));
    if (rows.length === 0) return empty;

    // Group each topic's counts by the days it was ACTUALLY scanned (present rows
    // only). A missing day means "not scanned for this topic yet", never a real 0 —
    // this matches derive.ts and stops a half-backfilled topic (one recent day, the
    // rest absent) from faking a huge spike.
    const byTopic = new Map<string, { day: string; c: number }[]>();
    for (const r of rows) {
      const arr = byTopic.get(r.topic) ?? [];
      arr.push({ day: String(r.day), c: Number(r.article_count) || 0 });
      byTopic.set(r.topic, arr);
    }

    const allDays = new Set<string>();
    const ranked: MoverTopic[] = [];
    for (const [topic, arr] of byTopic) {
      arr.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
      for (const x of arr) allDays.add(x.day);
      if (arr.length < MIN_SCANNED_DAYS) continue; // sample-size floor
      ranked.push(statsFor(topic, arr.map((x) => x.c)));
    }

    const sortedDays = [...allDays].sort();
    const eligible = ranked.filter((t) => t.prior7 >= MIN_PRIOR7 && t.last7 >= MIN_LAST7);
    const rising = eligible.filter((t) => t.wow > 0).sort((a, b) => b.wow - a.wow);
    const cooling = eligible.filter((t) => t.wow < 0).sort((a, b) => a.wow - b.wow);
    const spikes = ranked
      .filter((t) => t.avgDay >= MIN_AVG_SPIKE && t.z > 0)
      .sort((a, b) => b.z - a.z)
      .slice(0, MAX_SPIKES);

    return {
      asOf: sortedDays.length ? sortedDays[sortedDays.length - 1] : isoDaysAgo(1),
      windowDays: WINDOW_DAYS,
      covered: byTopic.size,
      totalLast7: sum(ranked.map((t) => t.last7)),
      heatingCount: rising.length,
      coolingCount: cooling.length,
      risers: rising.slice(0, MAX_ROWS),
      coolers: cooling.slice(0, MAX_ROWS),
      spikes,
    };
  } catch {
    return empty;
  }
}
