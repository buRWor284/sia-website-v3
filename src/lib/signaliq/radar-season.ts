/**
 * Radar seasonality rules shared by the KSA Tourism and KSA Retail radars
 * (seasonality plan step 3; 2026-09-15). Client-safe, no server imports.
 *
 * Both radars keep their five verdicts and LOW_SAMPLE_N exactly as they were.
 * Everything here is ADDITIVE:
 *   · PRE-SEASON   a quiet signal whose own usual peak is ≤ 8 weeks away
 *   · unusually quiet   a quiet signal running well below the same weeks in
 *                        earlier years, after correcting for language drift
 *   · EN vs AR split     English and Arabic 60-day counts side by side, behind
 *                        SHOW_AR_COUNTS until the rephrased Arabic seeds are clean
 */
import type { HistorySummary } from "./seasonality";

/** Arabic counts stay private until the 4 seeds rephrased on 15 Sep 2026
 *  (ar:مشروع نيوم, ar:بوابة الدرعية, ar:محافظة العلا, ar:شركة المراعي) have two
 *  clean weeks of history, i.e. no earlier than ~1 Oct 2026. Irfan decides. */
export const SHOW_AR_COUNTS = false;

/** "Unusually quiet" uses the drift-corrected same-weeks ratio (seasonalNorm),
 *  NOT the raw norm_ratio: tracked English volume runs ~9% and Arabic ~11% under
 *  their 3-year medians, and a raw ratio would call half the radar "below normal".
 *  Checked 15 Sep 2026 (WORKLOG). Flip to false to hide the note everywhere. */
export const SHOW_UNUSUALLY_QUIET = true;

export const PRESEASON_WEEKS = 8;
/** The handoff said peak_ratio ≥ 2, where the SQL ratio is a multi-year ISO-week
 *  AVERAGE ÷ median. SeasonPeak.ratio uses each year's single peak week, which runs
 *  higher for the same season, so the equivalent bar here is 3. */
export const PRESEASON_MIN_RATIO = 3;
export const UNUSUALLY_QUIET_BELOW = 0.5;

/** The verdicts a quiet signal can hold; only these can become PRE-SEASON. */
const QUIET_VERDICTS = new Set(["whitespace", "early", "dormant"]);

/** True when a quiet verdict should read PRE-SEASON instead. */
export function isPreSeason(baseVerdict: string, h: HistorySummary | null | undefined): boolean {
  const p = h?.peak;
  if (!p || !QUIET_VERDICTS.has(baseVerdict)) return false;
  // (SeasonPeak already requires the peak weeks to average 25+ articles.)
  return p.weeksSinceLast > 2 && p.weeksUntil <= PRESEASON_WEEKS && p.ratio >= PRESEASON_MIN_RATIO;
}

/** The verdicts a crowded signal can hold. */
const LOUD_VERDICTS = new Set(["late", "newsjack"]);

/**
 * Weeks until the usual peak, for a CROWDED signal (LATE or NEWSJACK) whose own
 * season is 8 weeks away or less. A loud signal can never read PRE-SEASON, but
 * "wait for the next catalyst" is more useful when the card says the catalyst is
 * 8 weeks out (Irfan, 16 Sep 2026). Null otherwise.
 */
export function loudPeakWeeks(verdict: string, h: HistorySummary | null | undefined): number | null {
  const p = h?.peak;
  if (!p || !LOUD_VERDICTS.has(verdict)) return null;
  if (p.weeksSinceLast <= 2 || p.weeksUntil > PRESEASON_WEEKS || p.ratio < PRESEASON_MIN_RATIO) return null;
  return p.weeksUntil;
}

/** True when a quiet, not-rising signal is quiet beyond its usual level for the
 *  time of year. A rising topic is never called unusually quiet, even when it is
 *  still below earlier years: the card already says it is climbing. */
export function isUnusuallyQuiet(loud: boolean, h: HistorySummary | null | undefined, rising = false): boolean {
  if (!SHOW_UNUSUALLY_QUIET || loud || rising || !h || h.seasonalNorm === null) return false;
  return h.seasonalNorm < UNUSUALLY_QUIET_BELOW;
}

/**
 * Daily GDELT Web News NGrams rows per language, used to compare an English
 * count with an Arabic one fairly (English press is ~16× larger). Arabic measured
 * 2026-09-07 against webngrams (3,576,344 rows/day, see config.ts); English from
 * the 15 Sep seed audit (57.6M). Step 4 adds the other 11 languages.
 */
export const CORPUS_ROWS_PER_DAY = {
  en: 57_600_000,
  ar: 3_576_344,
} as const;

export type LangLean = "ar-heavy" | "en-heavy" | "balanced" | "thin";

export interface LangSplit {
  en: number;
  ar: number;
  /** Arabic share of Arabic press ÷ English share of English press. */
  relative: number | null;
  lean: LangLean;
}

/** Corpus-scaled Arabic-vs-English ratio, or null when either side is too thin. */
export function langRelative(en: number, ar: number, minN = 12): number | null {
  if (en < minN || ar < minN) return null;
  return ar / CORPUS_ROWS_PER_DAY.ar / (en / CORPUS_ROWS_PER_DAY.en);
}

/**
 * Compare 60-day EN and AR counts. Saudi topics are Arabic-leaning almost by
 * definition (scaled by corpus size, Hajj reads ~20× more Arabic than English),
 * so the lean is judged against the radar's OWN median ratio: a signal twice as
 * Arabic-leaning as the typical signal on the same radar is "local story,
 * international gap"; half as much is "international story, local gap".
 */
export function langSplit(en: number, ar: number, radarMedianRelative: number | null, minN = 12): LangSplit {
  const relative = langRelative(en, ar, minN);
  if (relative === null || !radarMedianRelative) return { en, ar, relative, lean: "thin" };
  const vsRadar = relative / radarMedianRelative;
  const lean: LangLean = vsRadar >= 2 ? "ar-heavy" : vsRadar <= 0.5 ? "en-heavy" : "balanced";
  return { en, ar, relative: Math.round(relative * 100) / 100, lean };
}

export const LEAN_COPY: Record<"en" | "ar", Record<LangLean, string>> = {
  en: {
    "ar-heavy": "local story, international gap",
    "en-heavy": "international story, local gap",
    balanced: "in line with the radar",
    thin: "too few articles to compare",
  },
  ar: {
    "ar-heavy": "قصة محلية وفجوة دولية",
    "en-heavy": "قصة دولية وفجوة محلية",
    balanced: "ضمن المعتاد في هذا الرصد",
    thin: "عدد المقالات قليل للمقارنة",
  },
};
