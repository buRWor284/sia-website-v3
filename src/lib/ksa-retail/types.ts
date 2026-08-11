/**
 * KSA Retail & Consumer Radar — client-safe types + helpers.
 * No server imports here, so both the server data layer and the client
 * component can import this. Forked from src/lib/ksa-radar/types.ts
 * (the tourism radar) on 2026-08-10.
 */
export type RetailLens = "ecom" | "brands" | "lifestyle" | "macro";

export const RETAIL_LENSES: RetailLens[] = ["ecom", "brands", "lifestyle", "macro"];

export const RETAIL_LENS_LABEL: Record<RetailLens, string> = {
  ecom: "E-commerce & Delivery",
  brands: "Retail Groups & Brands",
  lifestyle: "Lifestyle & Entertainment",
  macro: "Consumer Economy",
};

/** One tracked topic with live SignalIQ coverage numbers. */
export interface RetailLiveTopic {
  topic: string; // lowercase canonical (signaliq_coverage_cache key)
  lens: RetailLens;
  vol: number; // 0..1 normalised coverage volume
  tr: number; // -1..+1 momentum (30d vs prior 30d)
  n: number; // article count over the coverage window
}

export interface RetailRadarData {
  /** True once the ksa-retail seeds have data in Supabase (post seed-deploy). */
  hasData: boolean;
  asOf: string; // last day present in the daily series (YYYY-MM-DD)
  topics: RetailLiveTopic[];
  series: Record<RetailLens, number[]>; // daily article sums per lens, oldest first
  lensTotal: Record<RetailLens, number>;
  lensCount: Record<RetailLens, number>;
  grand: number;
  heating: number; // topics with tr > 0
  risers: RetailLiveTopic[]; // tr > 0, sorted desc
  quiet: RetailLiveTopic[]; // lowest article_count first (quiet, ownable)
}

/** 7-day-vs-prior-7-day percentage change of a daily series. */
export function retailDelta7(series: number[]): number {
  const last = series.slice(-7).reduce((a, b) => a + b, 0);
  const prev = series.slice(-14, -7).reduce((a, b) => a + b, 0);
  return prev ? (last - prev) / prev : 0;
}
