/**
 * Founder Movers (/movers) — client-safe types + pure helpers.
 *
 * No server imports here, so both the server data layer and any future client
 * component can import this. Momentum = 7-day vs prior-7-day change of the daily
 * coverage series, computed in data.ts from signaliq_daily_counts (the same time
 * series SignalIQ scans into every day).
 */

export interface MoverTopic {
  topic: string;
  /** Daily article counts over the window, oldest first. */
  series: number[];
  /** Sum of the last 7 scanned days. */
  last7: number;
  /** Sum of the 7 scanned days before that. */
  prior7: number;
  /** (last7 − prior7) / prior7 — week-over-week change. */
  wow: number;
  /** Spike score: z of the latest day vs the window mean/stddev. */
  z: number;
  /** Latest day's article count. */
  lastDay: number;
  /** Mean articles/day over the window. */
  avgDay: number;
  /** Total articles over the window. */
  n: number;
}

export interface MoversData {
  /** Last scanned day present in the series (YYYY-MM-DD). */
  asOf: string;
  windowDays: number;
  /** Founder topics that had any coverage data in the window. */
  covered: number;
  /** Total articles across all founder topics in the last 7 days. */
  totalLast7: number;
  /** Count of all eligible rising topics (before the display cap). */
  heatingCount: number;
  /** Count of all eligible cooling topics (before the display cap). */
  coolingCount: number;
  /** Heating up: wow > 0, sorted desc (capped). */
  risers: MoverTopic[];
  /** Cooling down: wow < 0, sorted asc — most negative first (capped). */
  coolers: MoverTopic[];
  /** Breaking now: latest-day spikes vs baseline, sorted by z desc (capped). */
  spikes: MoverTopic[];
}

/** Signed integer percent, e.g. +251% / −56% (real minus glyph). */
export function pctInt(x: number): string {
  const s = Math.round(x * 100);
  return (s >= 0 ? "+" : "−") + Math.abs(s) + "%";
}

/** Compact article count, e.g. 1.2K. */
export function fmtK(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(Math.round(n));
}

/** Build sparkline polyline points for a series; null if too short to draw. */
export function sparkline(series: number[], w = 92, h = 26): { line: string } | null {
  if (!series || series.length < 2) return null;
  const mn = Math.min(...series);
  const mx = Math.max(...series);
  const rg = mx - mn || 1;
  const line = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - 2 - ((v - mn) / rg) * (h - 4);
      return x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");
  return { line };
}
