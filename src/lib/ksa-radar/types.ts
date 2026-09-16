/**
 * KSA Tourism & Hospitality Radar — client-safe types + helpers.
 * No server imports here, so both the server data layer and the client
 * component can import this. Mirrors src/lib/radar/types.ts conventions.
 */
import type { HistorySummary } from "@/lib/signaliq/seasonality";

export type KsaLens = "giga" | "events" | "hosp" | "faith";

export const KSA_LENSES: KsaLens[] = ["giga", "events", "hosp", "faith"];

export const KSA_LENS_LABEL: Record<KsaLens, string> = {
  giga: "Giga-projects",
  events: "Mega-events",
  hosp: "Hospitality & Aviation",
  faith: "Faith Travel",
};

/** One tracked topic with live SignalIQ coverage numbers. */
export interface KsaLiveTopic {
  topic: string; // lowercase canonical (signaliq_coverage_cache key)
  lens: KsaLens;
  vol: number; // 0..1 normalised coverage volume
  tr: number; // -1..+1 momentum (30d vs prior 30d)
  n: number; // article count over the coverage window
}

export interface KsaRadarData {
  /** True once the ksa-tourism seeds have data in Supabase (post seed-deploy). */
  hasData: boolean;
  asOf: string; // last day present in the daily series (YYYY-MM-DD)
  topics: KsaLiveTopic[];
  series: Record<KsaLens, number[]>; // daily article sums per lens, oldest first
  lensTotal: Record<KsaLens, number>;
  lensCount: Record<KsaLens, number>;
  grand: number;
  heating: number; // topics with tr > 0
  risers: KsaLiveTopic[]; // tr > 0, sorted desc
  quiet: KsaLiveTopic[]; // lowest article_count first (quiet, ownable)
  /** Seasonality (2026-09-15): summary per signal id, plus `<id>:ar` for the Arabic twin. */
  history?: Record<string, HistorySummary>;
  /** Monday (YYYY-MM-DD) of the week the page was rendered, for the season calendar. */
  thisMonday?: string;
}

/** 7-day-vs-prior-7-day percentage change of a daily series. */
export function ksaDelta7(series: number[]): number {
  const last = series.slice(-7).reduce((a, b) => a + b, 0);
  const prev = series.slice(-14, -7).reduce((a, b) => a + b, 0);
  return prev ? (last - prev) / prev : 0;
}
