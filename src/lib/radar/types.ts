/**
 * Earned Media Radar — client-safe types + helpers (no server imports here, so
 * both the server data layer and the client component can import this).
 */
export type Lens = "pr" | "earned" | "seo" | "geo";

export const LENSES: Lens[] = ["pr", "earned", "seo", "geo"];

export const LENS_LABEL: Record<Lens, string> = {
  pr: "PR",
  earned: "Earned Media",
  seo: "SEO",
  geo: "GEO",
};

export interface RadarTopic {
  topic: string;
  lens: Lens;
  vol: number; // 0..1 normalised coverage volume
  tr: number; // -1..+1 momentum
  n: number; // article count over the coverage window
}

export interface RadarData {
  asOf: string; // last day present in the daily series (YYYY-MM-DD)
  topics: RadarTopic[];
  series: Record<Lens, number[]>; // daily article sums per lens, oldest first
  lensTotal: Record<Lens, number>;
  lensCount: Record<Lens, number>;
  grand: number;
  heating: number; // topics with tr > 0
  risers: RadarTopic[]; // tr > 0, sorted desc
  gaps: RadarTopic[]; // lowest article_count first (quiet, ownable)
}

/** 7-day-vs-prior-7-day percentage change of a daily series. */
export function delta7(series: number[]): number {
  const last = series.slice(-7).reduce((a, b) => a + b, 0);
  const prev = series.slice(-14, -7).reduce((a, b) => a + b, 0);
  return prev ? (last - prev) / prev : 0;
}
