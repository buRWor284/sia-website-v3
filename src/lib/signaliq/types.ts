/**
 * SignalIQ — shared types for the proactive-PR / newsjacking tool.
 * Working name "SignalIQ" (rename in ONE place: PRODUCT in config.ts).
 * See SignalIQ-RFP.md for the full spec.
 *
 * Honesty rule baked into the model: an Opportunity is a *lead/whitespace*
 * measure (how far ahead of coverage you are), NOT a prediction that a story
 * will break. Every signal carries its primary-source `url` (receipts).
 */

export type BeatId = "saas" | "fintech" | "health" | "climate" | "ai" | "cybersecurity";

export interface Beat {
  id: BeatId;
  label: string;
  /** Search seeds used to query sources for this beat. */
  seeds: string[];
  blurb: string;
}

export type SourceId = "gdelt" | "hackernews" | "sec" | "wikipedia" | "arxiv";

/** A raw signal from one source, normalised into a common shape. */
export interface Signal {
  source: SourceId;
  topic: string;        // the seed/term this signal is about
  title: string;        // human-readable headline for the signal
  url: string;          // primary-source link (the receipt)
  observedAt: string;   // ISO timestamp
  magnitude: number;    // 0..1 — how large/unusual vs the source's own baseline
  velocity: number;     // 0..1 — how fast it's accelerating
  credibility: number;  // 0..1 — source trust weight (from config)
  detail?: string;      // one-line human context (counts, points, etc.)
  raw?: Record<string, unknown>;
}

/** Coverage measured from news volume (the denominator). */
export interface Coverage {
  topic: string;
  volume: number;       // 0..1 — how much press already covers it (normalised)
  trend: number;        // -1..1 — coverage rising (+) or falling (-)
  articleCount: number;
  source: "gdelt";
}

export type OppBand = "hot" | "look" | "early" | "noise";

/** A scored, rankable opportunity = signals + coverage gap. */
export interface Opportunity {
  id: string;
  beat: BeatId;
  topic: string;
  headline: string;
  score: number;        // 0..100 composite
  band: OppBand;
  bandLabel: string;
  components: {
    magnitude: number;     // 0..1
    velocity: number;      // 0..1
    coverageGap: number;   // 0..1
    fit: number;           // 0..1
    credibility: number;   // 0..1
    corroboration: number; // 0..1 (# independent sources)
  };
  coverage: Coverage | null;
  signals: Signal[];       // the receipts
  sensitive: boolean;      // tasteful-newsjacking flag (RFP §11.4)
  createdAt: string;
}

export type UsageTier = "anonymous" | "email";

export interface ScanInput {
  beat: BeatId;
  /** Pro/custom keywords (v2). Accepted but preset beats drive the MVP. */
  keywords?: string[];
  turnstileToken?: string;
}

export interface ScanResponse {
  beat: BeatId;
  generatedAt: string;
  opportunities: Opportunity[];
  usage: { remaining: number; tier: UsageTier };
  partial: boolean;        // true if one or more sources failed
  notes: string[];
}

/* ── Asset pack (LLM-generated) ─────────────────────────────── */

export interface AssetPackInput {
  /** The opportunity is re-sent so generation stays stateless (no DB in MVP). */
  opportunity: Opportunity;
  /** Optional company context — tailor the pitch angle and journalist targets. */
  companyContext?: string;
  store?: boolean;
  turnstileToken?: string;
}

export interface JournalistLead {
  name: string;
  outlet: string;
  beat: string;
  why: string;
}

export interface ChartSpec {
  type: "line" | "bar";
  title: string;
  xLabel: string;
  yLabel: string;
  points: { x: string; y: number }[];
  caption: string;
}

/** Strict shape the model returns via tool-use. */
export interface AssetPackAi {
  headline: string;
  brief: string;             // sourced data brief (markdown)
  angle: string;             // journalist-ready pitch angle
  subjectLine: string;       // suggested email subject (6–9 words)
  linkableAssetIdea: string; // report/infographic/calculator/quiz concept
  journalists: JournalistLead[];
  cautions: string[];        // honesty / verify-before-pitch notes
}

export interface AssetPack extends AssetPackAi {
  opportunityId: string;
  chart: ChartSpec | null;   // built deterministically from coverage/signal data
  sources: { label: string; url: string }[];
  usage: { remaining: number; tier: UsageTier };
}
