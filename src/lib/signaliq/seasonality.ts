/**
 * SignalIQ — seasonality summary (seasonality plan step 2; 2026-09-15).
 *
 * Pure and client-safe: no Supabase, no server imports. The server reads raw
 * `signaliq_topic_history` rows (history.ts), turns them into a small
 * HistorySummary here, and every card surface renders that summary with
 * <HistoryStrip>. Every label a visitor reads is DERIVED from these numbers
 * (the signaliq-derived-copy rule): nothing like "peaks in June" is typed by hand.
 *
 * Three things this file is careful about, each learned from the real data:
 *
 * 1. CORPUS GAPS. GDELT returned nothing for 2025-06-15 → 2025-07-01 (17 days,
 *    every topic in every language reads 0). Those weeks are not "zero
 *    articles", they are "no data". A week is treated as a gap when the whole
 *    language's tracked volume falls below half its local median. Gaps break
 *    the sparkline and are excluded from every calculation.
 *
 * 2. LANGUAGE DRIFT. Tracked English volume sits ~9% under its 3-year median
 *    and Arabic ~11% under (checked 15 Sep 2026 against signaliq_lang_history).
 *    So "quiet vs normal" is always divided by the same ratio for the whole
 *    language before it can say "unusually quiet".
 *
 * 3. MOVING SEASONS. Hajj and Ramadan move ~11 days earlier every Gregorian
 *    year, so an ISO-week average points 2 to 3 weeks late by the third year.
 *    The peak finder locates each year's actual peak, measures the shift
 *    between years, and projects the next one from that shift.
 */
import type { LangHistory, TopicHistory } from "./history";

export type HistoryLocale = "en" | "ar";

/** Hide the history UI below this many complete weeks (handoff 15 Sep). */
export const MIN_HISTORY_WEEKS = 26;
/** Same floor the radars use: under this many articles a ratio is noise. */
export const HISTORY_LOW_SAMPLE = 12;
/** "Quiet vs usual" needs a typical week of at least this many articles in earlier years. */
export const MIN_TYPICAL_WEEK = 8;
/** A repeating peak must average at least this many articles to count as a season. */
export const MIN_PEAK_ARTICLES = 25;

export interface SeasonPeak {
  /** Monday (YYYY-MM-DD) of the week the next peak is expected. */
  nextWeekStart: string;
  /** Whole weeks from the current week to that Monday (0 = this week). */
  weeksUntil: number;
  /** Whole weeks since the most recent peak. */
  weeksSinceLast: number;
  /** Mean peak-week count across the matched seasons, divided by the weekly median. */
  ratio: number;
  /** Mean shift of the peak per year, in days (negative = earlier each year). */
  driftDays: number;
  /** True when the peak moves 7+ days earlier a year (Hijri-calendar events). */
  lunar: boolean;
  /** Number of yearly peaks that matched (2 or 3). */
  seasons: number;
  /** Mean article count of the matched peak weeks (how big the moment is). */
  peakAvg: number;
}

export interface HistorySummary {
  topics: string[];
  /** Complete weeks with data. */
  weeks: number;
  /** Under MIN_HISTORY_WEEKS: render "new keyword" instead of the strip. */
  isNew: boolean;
  /** First day counted (or the week a fixed/rephrased seed started matching). */
  countingFrom: string | null;
  /** Weekly counts, oldest → newest; null marks a corpus gap. */
  spark: (number | null)[];
  /** Monday of the newest week in `spark`. */
  sparkEnd: string | null;
  last60d: number;
  priorYear60d: number;
  /** last60d / priorYear60d; null when last year is too thin or overlaps a gap. */
  yoyRatio: number | null;
  peak: SeasonPeak | null;
  /** Typical week over the last 8 weeks vs the same 8 weeks in earlier years,
   *  divided by the same ratio for the whole language. <1 = quieter than usual
   *  for the time of year. */
  seasonalNorm: number | null;
  /** The language-wide ratio used for that correction (1 = no drift). */
  langDrift: number | null;
  /** Number of gap weeks inside the sparkline window. */
  gapWeeks: number;
}

/* ─────────────────────────── date helpers (UTC) ─────────────────────────── */

const DAY = 86_400_000;
const toDate = (iso: string): Date => new Date(iso.slice(0, 10) + "T00:00:00Z");
const toIso = (d: Date): string => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number): string => toIso(new Date(toDate(iso).getTime() + n * DAY));

/** Monday (UTC) of the ISO week containing `d`. */
export function mondayOf(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() - (dow - 1));
  return toIso(t);
}

/** Monday of the newest COMPLETE week, given the newest scanned day. */
export function lastCompleteWeekStart(lastDay: string): string {
  const d = toDate(lastDay);
  const mon = mondayOf(d);
  return (d.getUTCDay() || 7) === 7 ? mon : addDays(mon, -7);
}

const weeksBetween = (fromIso: string, toIsoDate: string): number =>
  Math.round((toDate(toIsoDate).getTime() - toDate(fromIso).getTime()) / (7 * DAY));

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/* ─────────────────────────── gap detection ─────────────────────────── */

/** Monday → true for weeks where the whole language had (almost) no data. */
export function langGapWeeks(lang: LangHistory | null): Set<string> {
  const gaps = new Set<string>();
  if (!lang || !lang.lastWeekStart || lang.series.length === 0) return gaps;
  const s = lang.series;
  const L = s.length;
  for (let i = 0; i < L; i++) {
    const local = median(s.slice(Math.max(0, i - 6), Math.min(L, i + 7)));
    if (local > 0 && s[i] < 0.5 * local) gaps.add(addDays(lang.lastWeekStart, -7 * (L - 1 - i)));
  }
  return gaps;
}

/* ─────────────────────────── the summary ─────────────────────────── */

interface Aligned {
  values: (number | null)[];
  end: string; // Monday of the last element
}

/** Sum several topics' weekly series, aligned on their end week; gaps become null. */
function alignAndSum(histories: TopicHistory[], gaps: Set<string>): Aligned | null {
  const withSeries = histories.filter((h) => h.series.length > 0 && h.lastDay);
  if (withSeries.length === 0) return null;
  const ends = withSeries.map((h) => lastCompleteWeekStart(h.lastDay as string));
  const end = ends.sort()[ends.length - 1];
  const len = Math.max(...withSeries.map((h) => h.series.length + weeksBetween(lastCompleteWeekStart(h.lastDay as string), end)));
  const values: (number | null)[] = Array.from({ length: len }, () => 0);
  for (const h of withSeries) {
    const hEnd = lastCompleteWeekStart(h.lastDay as string);
    const offset = weeksBetween(hEnd, end); // how many weeks this series ends before `end`
    const start = len - offset - h.series.length;
    h.series.forEach((v, i) => {
      const idx = start + i;
      if (idx >= 0 && idx < len) values[idx] = (values[idx] as number) + (Number(v) || 0);
    });
  }
  for (let i = 0; i < len; i++) {
    if (gaps.has(addDays(end, -7 * (len - 1 - i)))) values[i] = null;
  }
  return { values, end };
}

function findPeak(values: (number | null)[], end: string, firstIdx: number, now: Date): SeasonPeak | null {
  const L = values.length;
  const ok = (i: number): boolean => i >= firstIdx && i < L && values[i] !== null;
  const v = (i: number): number => (values[i] as number) ?? 0;
  if (L - firstIdx < 60) return null; // need more than a year of data to call anything a season

  const base = Math.max(median(values.slice(firstIdx).filter((x): x is number => x !== null)), 1);

  // Candidate peaks in the newest 52 weeks: local maxima, strongest first.
  const cands: number[] = [];
  for (let i = Math.max(firstIdx, L - 52); i < L; i++) {
    if (!ok(i)) continue;
    const prev = ok(i - 1) ? v(i - 1) : -1;
    const next = ok(i + 1) ? v(i + 1) : -1;
    if (v(i) >= prev && v(i) >= next) cands.push(i);
  }
  cands.sort((a, b) => v(b) - v(a));

  const argmaxIn = (lo: number, hi: number): number | null => {
    let best: number | null = null;
    for (let i = Math.max(lo, firstIdx); i <= Math.min(hi, L - 1); i++) {
      if (!ok(i)) continue;
      if (best === null || v(i) > v(best)) best = i;
    }
    return best;
  };

  for (const c of cands.slice(0, 3)) {
    if (v(c) < Math.max(2.5 * base, 15)) break; // sorted: nothing weaker can qualify
    // A season must recur: the same stretch of the calendar (±3 weeks, enough for
    // the ~1.6-week yearly Hijri shift) has to spike in EVERY earlier year the data
    // covers, at 2× the median, 10+ articles and at least 30% of this year's peak.
    // Wider windows let noise on low-count topics pass as a "season" (tested on
    // the 28 tourism signals, 15 Sep 2026).
    const W = 3;
    const floor = Math.max(2 * base, 0.3 * v(c), 10);
    const j1 = argmaxIn(c - 52 - W, c - 52 + W);
    if (j1 === null || v(j1) < floor) continue;
    const hasYear3 = j1 - 52 - W >= firstIdx;
    const j2raw = hasYear3 ? argmaxIn(j1 - 52 - W, j1 - 52 + W) : null;
    if (hasYear3 && (j2raw === null || v(j2raw) < floor)) continue;
    const j2 = j2raw;

    const shifts = [(c - j1) * 7 - 365.25];
    if (j2 !== null) shifts.push((j1 - j2) * 7 - 365.25);
    const driftDays = shifts.reduce((a, b) => a + b, 0) / shifts.length;
    const lunar = shifts.length === 2 && shifts.every((d) => d <= -4) && driftDays <= -7;

    const lastPeak = addDays(end, -7 * (L - 1 - c));
    const cycle = Math.round(lunar ? 365.25 + driftDays : 365.25);
    const thisMonday = mondayOf(now);
    let next = mondayOf(toDate(addDays(lastPeak, cycle)));
    // If the projected week has already passed (by more than a week), roll forward.
    let guard = 0;
    while (weeksBetween(thisMonday, next) < -1 && guard++ < 3) next = mondayOf(toDate(addDays(next, cycle)));

    const peaks = [v(c), v(j1), ...(j2 !== null ? [v(j2)] : [])];
    // A season is a press moment, not a wobble: the peak weeks must average 25+
    // articles (tested 15 Sep: Haramain rail's ~20-article bumps otherwise
    // projected a "peak this week" that the live counts did not show).
    if (peaks.reduce((a, b) => a + b, 0) / peaks.length < MIN_PEAK_ARTICLES) continue;
    return {
      nextWeekStart: next,
      weeksUntil: Math.max(0, weeksBetween(thisMonday, next)),
      weeksSinceLast: Math.max(0, weeksBetween(lastPeak, thisMonday)),
      ratio: Math.round((peaks.reduce((a, b) => a + b, 0) / peaks.length / base) * 100) / 100,
      driftDays: Math.round(driftDays * 10) / 10,
      lunar,
      seasons: peaks.length,
      peakAvg: Math.round(peaks.reduce((a, b) => a + b, 0) / peaks.length),
    };
  }
  return null;
}

function windowMedian(values: (number | null)[], endIdx: number, weeks: number, firstIdx: number): number | null {
  const lo = endIdx - weeks + 1;
  if (lo < firstIdx) return null;
  const xs: number[] = [];
  for (let i = lo; i <= endIdx; i++) {
    if (values[i] === null || values[i] === undefined) continue;
    xs.push(values[i] as number);
  }
  // Allow a gap week or two inside the window, but not a window that is mostly gap.
  if (xs.length < weeks - 2) return null;
  return median(xs);
}

/**
 * Typical week now vs the typical week at the same time in earlier years:
 * median weekly count over the last 8 complete weeks ÷ the mean of the same
 * 8-week medians 1 and 2 years earlier. Medians, not sums, so one spike in last
 * year's window cannot make this year look "unusually quiet".
 * Null when the earlier years' typical week is below `minWeekly` articles.
 */
const SAME_WEEKS = 8;
function sameWeeksRatio(values: (number | null)[], firstIdx: number, minWeekly: number): number | null {
  const L = values.length;
  const cur = windowMedian(values, L - 1, SAME_WEEKS, firstIdx);
  if (cur === null) return null;
  const prior: number[] = [];
  for (const k of [1, 2]) {
    const p = windowMedian(values, L - 1 - 52 * k, SAME_WEEKS, firstIdx);
    if (p !== null) prior.push(p);
  }
  if (prior.length === 0) return null;
  const base = prior.reduce((a, b) => a + b, 0) / prior.length;
  if (base < minWeekly) return null;
  return cur / base;
}

/**
 * Summarise one signal (one or more topics, SAME language) for a card.
 * `lang` is that language's row from signaliq_lang_history (drift + gaps).
 */
export function summarizeHistory(
  histories: TopicHistory[],
  lang: LangHistory | null,
  now: Date = new Date(),
): HistorySummary | null {
  const present = histories.filter(Boolean);
  if (present.length === 0) return null;
  const gaps = langGapWeeks(lang);
  const aligned = alignAndSum(present, gaps);
  if (!aligned) return null;
  const { values, end } = aligned;
  const L = values.length;

  // First week with any articles. A seed whose history starts with a long run
  // of zeros (Thai tokenizer fix, rephrased seeds) is counted from there.
  let firstIdx = values.findIndex((x) => x !== null && x > 0);
  if (firstIdx < 0) firstIdx = L;
  const firstDays = present.map((h) => h.firstDay).filter((d): d is string => !!d).sort();
  const dataStart = firstDays[0] ?? null;
  const stepUp = firstIdx >= 26 ? addDays(end, -7 * (L - 1 - firstIdx)) : null;
  const weeks = values.slice(stepUp ? firstIdx : 0).filter((x) => x !== null).length;
  const isNew = weeks < MIN_HISTORY_WEEKS;

  const last60d = present.reduce((a, h) => a + h.last60d, 0);
  const priorYear60d = present.reduce((a, h) => a + h.priorYear60d, 0);
  // The prior-year 60-day window must not overlap a corpus gap.
  const lastDay = present.map((h) => h.lastDay).filter((d): d is string => !!d).sort().pop() ?? null;
  let priorTouchesGap = false;
  if (lastDay) {
    const pStart = addDays(lastDay, -364 - 59);
    const pEnd = addDays(lastDay, -364);
    for (const g of gaps) {
      if (addDays(g, 6) >= pStart && g <= pEnd) priorTouchesGap = true;
    }
  }
  const yoyRatio =
    !isNew && !stepUp && priorYear60d >= HISTORY_LOW_SAMPLE && !priorTouchesGap
      ? Math.round((last60d / priorYear60d) * 1000) / 1000
      : null;

  const peak = isNew || stepUp ? null : findPeak(values, end, firstIdx, now);

  let seasonalNorm: number | null = null;
  let langDrift: number | null = null;
  if (!isNew && !stepUp) {
    const topicRatio = sameWeeksRatio(values, firstIdx, MIN_TYPICAL_WEEK);
    if (topicRatio !== null) {
      if (lang && lang.series.length > 0 && lang.lastWeekStart) {
        const langVals: (number | null)[] = lang.series.map((x, i) =>
          gaps.has(addDays(lang.lastWeekStart as string, -7 * (lang.series.length - 1 - i))) ? null : x,
        );
        // Align the language series to the topic's end week.
        const shift = weeksBetween(end, lang.lastWeekStart);
        const trimmed = shift > 0 ? langVals.slice(0, langVals.length - shift) : langVals;
        langDrift = sameWeeksRatio(trimmed, 0, 1);
      }
      seasonalNorm = langDrift ? Math.round((topicRatio / langDrift) * 1000) / 1000 : Math.round(topicRatio * 1000) / 1000;
    }
  }

  const sparkStart = Math.max(0, L - 156);
  const spark = values.slice(sparkStart);
  return {
    topics: present.map((h) => h.topic),
    weeks,
    isNew,
    countingFrom: stepUp ?? dataStart,
    spark,
    sparkEnd: end,
    last60d,
    priorYear60d,
    yoyRatio,
    peak,
    seasonalNorm,
    langDrift: langDrift === null ? null : Math.round(langDrift * 1000) / 1000,
    gapWeeks: spark.filter((x) => x === null).length,
  };
}

/** Language of a topic key: "ar:الحج" → "ar"; unprefixed keys are English. */
export function langOfTopic(topic: string): string {
  const m = /^([a-z]{2}):/.exec(topic);
  return m ? m[1] : "en";
}

/* ─────────────────────────── derived copy ─────────────────────────── */

const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "early June" / "أوائل يونيو", from the middle of the week that starts on `mondayIso`. */
export function monthPhrase(mondayIso: string, locale: HistoryLocale = "en"): string {
  const mid = toDate(addDays(mondayIso, 3));
  const d = mid.getUTCDate();
  const m = mid.getUTCMonth();
  if (locale === "ar") return `${d <= 10 ? "أوائل" : d <= 20 ? "منتصف" : "أواخر"} ${MONTHS_AR[m]}`;
  return `${d <= 10 ? "early" : d <= 20 ? "mid" : "late"} ${MONTHS_EN[m]}`;
}

/** "−31%" / "+34%" with a real minus sign (site style). */
export function signedPct(ratio: number): string {
  const p = Math.round((ratio - 1) * 100);
  return (p >= 0 ? "+" : "−") + Math.abs(p) + "%";
}

export function shortDate(iso: string, locale: HistoryLocale = "en"): string {
  const d = toDate(iso);
  if (locale === "ar") return `${d.getUTCDate()} ${MONTHS_AR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  return `${d.getUTCDate()} ${MONTHS_SHORT_EN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export interface HistoryCopy {
  /** e.g. "−31% vs the same 60 days last year" */
  yoy: string | null;
  /** e.g. "Usually peaks mid November · next in 9 wks" */
  season: string | null;
  /** e.g. "New keyword · history from 15 Sep 2026" */
  fresh: string | null;
  /** e.g. "3 YR" */
  span: string;
  /** Screen-reader sentence for the sparkline. */
  aria: string;
}

/** Left-to-right isolate so "−31%" or "3.8×" keeps its order inside Arabic text. */
export const ltr = (s: string): string => `\u2066${s}\u2069`;

export function historyCopy(h: HistorySummary, locale: HistoryLocale = "en"): HistoryCopy {
  const ar = locale === "ar";
  const years = Math.max(1, Math.round(h.weeks / 52));
  const span = ar ? `${years} ${years === 1 ? "سنة" : years === 2 ? "سنتان" : "سنوات"}` : `${years} YR`;

  if (h.isNew || !h.sparkEnd) {
    const from = h.countingFrom ? shortDate(h.countingFrom, locale) : null;
    return {
      yoy: null,
      season: null,
      fresh: ar
        ? `كلمة مفتاحية جديدة${from ? ` · السجل يبدأ ${from}` : ""}`
        : `New keyword${from ? ` · history from ${from}` : ""}`,
      span,
      aria: ar ? "لا يوجد سجل كافٍ بعد" : "Not enough history yet",
    };
  }

  const yoy =
    h.yoyRatio === null
      ? null
      : ar
        ? `${ltr(signedPct(h.yoyRatio))} مقارنة بالأيام الستين نفسها من العام الماضي`
        : `${signedPct(h.yoyRatio)} vs the same 60 days last year`;

  let season: string | null = null;
  const p = h.peak;
  if (p) {
    const when = monthPhrase(p.nextWeekStart, locale);
    if (p.weeksSinceLast <= 2) {
      season = ar ? "في موسمه المعتاد الآن" : "In its usual peak season now";
    } else if (p.lunar) {
      const shift = Math.round(Math.abs(p.driftDays));
      season = ar
        ? `ذروته تتقدم نحو ${shift} يومًا كل عام · القادمة قرابة ${when}، بعد ${p.weeksUntil} أسبوعًا`
        : `Next peak about ${when}, in ${p.weeksUntil} wks · it moves ~${shift} days earlier each year`;
    } else {
      season = ar
        ? `يبلغ ذروته عادة ${when} · القادمة بعد ${p.weeksUntil} أسبوعًا`
        : `Usually peaks ${when} · next in ${p.weeksUntil} wks`;
    }
  }

  const aria = ar
    ? `عدد المقالات الأسبوعي على مدى ${span}${yoy ? `، ${yoy}` : ""}${season ? `، ${season}` : ""}`
    : `Weekly article counts over ${years} years${yoy ? `, ${yoy}` : ""}${season ? `, ${season}` : ""}`;
  return { yoy, season, fresh: null, span, aria };
}

/** SVG polyline point strings for the sparkline, split at gaps. */
export function sparkSegments(spark: (number | null)[], w: number, h: number, pad = 2): string[] {
  const n = spark.length;
  if (n < 2) return [];
  const vals = spark.filter((x): x is number => x !== null);
  const mx = Math.max(...vals, 1);
  const segs: string[] = [];
  let cur: string[] = [];
  spark.forEach((v, i) => {
    if (v === null) {
      if (cur.length > 1) segs.push(cur.join(" "));
      cur = [];
      return;
    }
    const x = (i / (n - 1)) * w;
    const y = h - pad - (v / mx) * (h - pad * 2);
    cur.push(x.toFixed(1) + "," + y.toFixed(1));
  });
  if (cur.length > 1) segs.push(cur.join(" "));
  return segs;
}
