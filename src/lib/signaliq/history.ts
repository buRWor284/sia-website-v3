/**
 * SignalIQ — topic HISTORY reader (seasonality plan, step 1; 2026-09-15).
 *
 * One row per topic in `signaliq_topic_history`, rebuilt nightly by the
 * Postgres function `signaliq_refresh_history()` (see supabase/signaliq-history.sql),
 * which the refresh-coverage route calls after the day scan. Every card surface
 * (SignalIQ opportunity cards, both KSA radars, the global radar) reads this one
 * row per topic and never touches the 2.4M-row `signaliq_daily_counts`.
 *
 * What a row lets a card say:
 *   norm_ratio      last complete week ÷ this topic's 3-year weekly median
 *                   ("quiet, but this is its quiet season" vs "quiet and unusually so")
 *   yoy_ratio       last 60 days ÷ the same 60 days a year earlier
 *   peak_weeks      the ISO weeks this topic usually spikes (≥1.3× median),
 *                   next_peak_week = the next one coming up
 *   series_156      3-year weekly sparkline, oldest → newest
 *
 * Step 2 (same day) adds `signaliq_lang_history`: one row per LANGUAGE with the
 * summed weekly volume of every tracked topic in it. Cards use it to spot corpus
 * gaps and to correct "quiet vs normal" for language-wide drift. Turning rows
 * into card copy happens in seasonality.ts (client-safe), not here.
 *
 * Server-only: uses the service-role client. Nothing here changes scoring.
 */
import { createSupabaseServiceClient } from "@/lib/supabase";
import { langOfTopic, summarizeHistory, type HistorySummary } from "./seasonality";
import { withoutProbeTopics } from "./config";

const HISTORY_TABLE = "signaliq_topic_history";
const LANG_TABLE = "signaliq_lang_history";

export interface TopicHistory {
  topic: string;
  last60d: number;
  priorYear60d: number;
  twoYears60d: number;
  /** last60d / priorYear60d; null when there was nothing a year ago. */
  yoyRatio: number | null;
  weeklyMedian3y: number;
  lastWeek: number;
  /** lastWeek / weeklyMedian3y; null when the median is 0. */
  normRatio: number | null;
  /** ISO week numbers (1-53), strongest first; empty when the topic has no real season. */
  peakWeeks: number[];
  /** strongest peak-week average / weekly median; null when the median is 0. */
  peakRatio: number | null;
  nextPeakWeek: number | null;
  /** Up to 156 complete weeks, oldest → newest. */
  series: number[];
  weeksAvailable: number;
  firstDay: string | null;
  lastDay: string | null;
  updatedAt: string;
}

/** Summed weekly volume of every tracked topic in one language. */
export interface LangHistory {
  lang: string;
  topics: number;
  weeklyMedian3y: number;
  lastWeek: number;
  normRatio: number | null;
  /** Up to 156 complete weeks, oldest → newest. */
  series: number[];
  weeksAvailable: number;
  /** Monday of the newest week in `series`. */
  lastWeekStart: string | null;
}

interface Row {
  topic: string;
  last_60d: number;
  prior_year_60d: number;
  two_years_60d: number;
  yoy_ratio: number | string | null;
  weekly_median_3y: number | string;
  last_week: number;
  norm_ratio: number | string | null;
  peak_weeks: number[] | null;
  peak_ratio: number | string | null;
  next_peak_week: number | null;
  series_156: number[] | null;
  weeks_available: number;
  first_day: string | null;
  last_day: string | null;
  updated_at: string;
}

interface LangRow {
  lang: string;
  topics: number;
  weekly_median_3y: number | string;
  last_week: number;
  norm_ratio: number | string | null;
  series_156: number[] | null;
  weeks_available: number;
  last_week_start: string | null;
}

const num = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function toHistory(r: Row): TopicHistory {
  return {
    topic: r.topic,
    last60d: Number(r.last_60d) || 0,
    priorYear60d: Number(r.prior_year_60d) || 0,
    twoYears60d: Number(r.two_years_60d) || 0,
    yoyRatio: num(r.yoy_ratio),
    weeklyMedian3y: num(r.weekly_median_3y) ?? 0,
    lastWeek: Number(r.last_week) || 0,
    normRatio: num(r.norm_ratio),
    peakWeeks: (r.peak_weeks ?? []).map(Number),
    peakRatio: num(r.peak_ratio),
    nextPeakWeek: r.next_peak_week === null ? null : Number(r.next_peak_week),
    series: (r.series_156 ?? []).map(Number),
    weeksAvailable: Number(r.weeks_available) || 0,
    firstDay: r.first_day,
    lastDay: r.last_day,
    updatedAt: r.updated_at,
  };
}

function toLang(r: LangRow): LangHistory {
  return {
    lang: r.lang,
    topics: Number(r.topics) || 0,
    weeklyMedian3y: num(r.weekly_median_3y) ?? 0,
    lastWeek: Number(r.last_week) || 0,
    normRatio: num(r.norm_ratio),
    series: (r.series_156 ?? []).map(Number),
    weeksAvailable: Number(r.weeks_available) || 0,
    lastWeekStart: r.last_week_start,
  };
}

/** History rows for a set of canonical topic keys (missing topics are simply absent). */
export async function getTopicHistory(topics: string[]): Promise<Map<string, TopicHistory>> {
  const out = new Map<string, TopicHistory>();
  const keys = [...new Set(topics.filter(Boolean))];
  if (keys.length === 0) return out;
  const db = createSupabaseServiceClient();
  // PostgREST `in` lists are URL-encoded; keep each request comfortably small.
  const CHUNK = 200;
  for (let i = 0; i < keys.length; i += CHUNK) {
    const { data, error } = await db
      .from(HISTORY_TABLE)
      .select("*")
      .in("topic", keys.slice(i, i + CHUNK));
    if (error) throw new Error(`getTopicHistory failed: ${error.message} (code: ${error.code})`);
    for (const r of (data ?? []) as Row[]) out.set(r.topic, toHistory(r));
  }
  return out;
}

/** One topic, or null. */
export async function getOneTopicHistory(topic: string): Promise<TopicHistory | null> {
  const m = await getTopicHistory([topic]);
  return m.get(topic) ?? null;
}

/** Language-volume rows (e.g. ["en", "ar"]); ~13 rows exist in total. */
export async function getLangHistory(langs: string[]): Promise<Map<string, LangHistory>> {
  const out = new Map<string, LangHistory>();
  const keys = [...new Set(langs.filter(Boolean))];
  if (keys.length === 0) return out;
  const db = createSupabaseServiceClient();
  const { data, error } = await db.from(LANG_TABLE).select("*").in("lang", keys);
  if (error) throw new Error(`getLangHistory failed: ${error.message} (code: ${error.code})`);
  for (const r of (data ?? []) as LangRow[]) out.set(r.lang, toLang(r));
  return out;
}

/** A named group of topic keys that renders as ONE history strip (e.g. a radar signal). */
export interface HistoryGroup {
  id: string;
  topics: string[];
}

/** Anything shaped like a radar signal: English topic keys plus optional Arabic keys. */
export interface RadarHistorySource {
  id: string;
  topics: string[];
  topicsAr?: string[];
}

/** A radar signal becomes up to two groups: `<id>` (English) and `<id>:ar` (Arabic). */
export function radarHistoryGroups(signals: RadarHistorySource[]): HistoryGroup[] {
  return signals.flatMap((s) => [
    ...(s.topics.length > 0 ? [{ id: s.id, topics: s.topics }] : []),
    ...(s.topicsAr && s.topicsAr.length > 0 ? [{ id: `${s.id}:ar`, topics: s.topicsAr }] : []),
  ]);
}

/**
 * One query for the topics, one for their languages, then a summary per group.
 * Groups must be single-language (an English signal and its Arabic twin are two
 * groups). Never throws: a failure returns an empty map, so a card simply shows
 * no strip. Two round trips total, whatever the number of groups.
 */
export async function getHistorySummaries(
  groups: HistoryGroup[],
  now: Date = new Date(),
): Promise<Record<string, HistorySummary>> {
  const out: Record<string, HistorySummary> = {};
  // Seed gate: a topic still on probation never feeds a history strip.
  groups = groups.map((g) => ({ ...g, topics: withoutProbeTopics(g.topics) })).filter((g) => g.topics.length > 0);
  const all = groups.flatMap((g) => g.topics);
  if (all.length === 0) return out;
  try {
    const [rows, langs] = await Promise.all([
      getTopicHistory(all),
      getLangHistory([...new Set(all.map(langOfTopic))]),
    ]);
    for (const g of groups) {
      const hs = g.topics.map((t) => rows.get(t)).filter((h): h is TopicHistory => !!h);
      if (hs.length === 0) continue;
      const s = summarizeHistory(hs, langs.get(langOfTopic(g.topics[0])) ?? null, now);
      if (s) out[g.id] = s;
    }
  } catch {
    // History is decoration on top of the live numbers; never break a page for it.
  }
  return out;
}

export interface HistoryRefreshResult {
  topics: number;
  weeks: number;
  lastDay: string | null;
  ms: number;
  langs?: number;
  langError?: string;
}

/**
 * Rebuild the weekly rollup + per-topic profile from signaliq_daily_counts, then
 * the per-language volume rows from that rollup. ~15-20 s + ~1 s on 1,100 days ×
 * 2,200 topics. Called by the refresh-coverage route after a successful day scan;
 * safe to call any time (idempotent, truncate+insert).
 */
export async function refreshTopicHistory(): Promise<HistoryRefreshResult> {
  const db = createSupabaseServiceClient();
  const { data, error } = await db.rpc("signaliq_refresh_history");
  if (error) throw new Error(`refreshTopicHistory failed: ${error.message} (code: ${error.code})`);
  const row = (Array.isArray(data) ? data[0] : data) as
    | { topics: number; weeks: number; last_day: string | null; ms: number }
    | undefined;
  const result: HistoryRefreshResult = {
    topics: Number(row?.topics ?? 0),
    weeks: Number(row?.weeks ?? 0),
    lastDay: row?.last_day ?? null,
    ms: Number(row?.ms ?? 0),
  };
  // Language rows read the weekly rollup just rebuilt above, so they run second.
  const lang = await db.rpc("signaliq_refresh_lang_history");
  if (lang.error) {
    // Topic history above is already rebuilt; report the language step separately.
    result.langError = `${lang.error.message} (code: ${lang.error.code})`;
    return result;
  }
  const lrow = (Array.isArray(lang.data) ? lang.data[0] : lang.data) as { langs: number; ms: number } | undefined;
  result.langs = Number(lrow?.langs ?? 0);
  result.ms += Number(lrow?.ms ?? 0);
  return result;
}

/** ISO week number (1-53) of a date, UTC — for comparing against peak_weeks. */
export function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  return Math.ceil(((t.getTime() - yearStart) / 86_400_000 + 1) / 7);
}

/** Whole weeks from `now` to the next occurrence of ISO week `week` (0 = this week). */
export function weeksUntil(week: number, now: Date = new Date()): number {
  const cur = isoWeek(now);
  return week >= cur ? week - cur : 52 - cur + week;
}
