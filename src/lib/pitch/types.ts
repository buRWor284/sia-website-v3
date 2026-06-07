/**
 * PressIQ — shared types for the pitch-scoring tool.
 * See docs/PressIQ-RFP.md for the full spec.
 */

export type Platform = "haro" | "qwoted" | "sos" | "featured" | "b2bwriter";

export interface BrandSignals {
  website: boolean;
  bylines: boolean;
  youtube: boolean;
  speaking: boolean;
  caseStudies: boolean;
  linkedin: boolean;
}

export const EMPTY_BRAND: BrandSignals = {
  website: false,
  bylines: false,
  youtube: false,
  speaking: false,
  caseStudies: false,
  linkedin: false,
};

export interface PitchInput {
  pitch: string;
  query?: string;
  subject?: string;
  platform: Platform;
  brandSignals: BrandSignals;
  /** D-13: store the pitch for the outcome flywheel. Default true; user can opt out. */
  store?: boolean;
  /** "standalone" = proactive outreach scored against journalist's beat; "query" = reactive HARO-style response. Default = standalone. */
  pitchMode?: "standalone" | "query";
  /** Cloudflare Turnstile token (optional in dev). */
  turnstileToken?: string;
}

/** Deterministic Layer-1 signals, computed in JS (client + server). */
export interface Layer1Metrics {
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  fkGrade: number;
  fkReadingEase: number;
  questionCount: number;
  subjectWordCount: number;
  subjectivity: number; // 0..1 lexical proxy
  hasStatistic: boolean; // a number/percent appears
  hasClosingQuestion: boolean;
}

export type BandStatus = "ideal" | "ok" | "off";

export interface BandResult {
  value: number;
  status: BandStatus;
  score: number; // 0..1
  hint: string;
}

export interface Layer1Scored {
  metrics: Layer1Metrics;
  bands: {
    wordCount: BandResult;
    subjectWords: BandResult;
    readingGrade: BandResult;
    questions: BandResult;
    subjectivity: BandResult;
  };
  score: number; // 0..100
}

export interface SubSignal {
  label: string;
  met: boolean;
}

export interface AreaScore {
  score: number; // 0..100
  note?: string;
  topFix?: string;
  /** v2: a 2–4 sentence specific read of THIS pitch (the depth). */
  analysis?: string;
  /** v2: ✓/✗ checks, surfaced as chips in the UI. */
  subSignals?: SubSignal[];
  /** v2: EVIDENCE keys backing this dimension (drives evidence cards). */
  evidence?: string[];
}

/** Strict shape returned by the model via tool-use. */
export interface AiScore {
  relevance: (AreaScore & { answersExactQuestion?: boolean }) | null;
  checklist: {
    score: number;
    analysis?: string;
    steps: Record<string, { met: number; of: number; topFix?: string }>;
  };
  storytelling: AreaScore & { hasArc?: boolean; hasCharacter?: boolean };
  neuromarketing: AreaScore & {
    usesOriginalData?: boolean;
    borrowedStatsOnly?: boolean;
    subjectTwoSecond?: boolean;
  };
  personalBrand: AreaScore & { reflectsAuthority?: boolean };
  /** v2: the new 7th dimension — publishable raw material. */
  newsroomReady: AreaScore & {
    originalData?: boolean;
    sourceAccess?: boolean;
    assets?: boolean;
    timeliness?: boolean;
  };
  /** v2 (D-C): soft, non-scored flag when a pitch reads templated/generic. */
  authenticityRisk?: { flagged: boolean; note?: string };
  strongestLine?: string;
  overallNote?: string;
}

export interface TierResult {
  label: string;
  badge: string;
  color: string;
}

export interface CompositeAreas {
  relevance?: AreaScore;
  objective: AreaScore;
  checklist: AreaScore;
  newsroomReady: AreaScore;
  emos: {
    storytelling: AreaScore;
    neuromarketing: AreaScore;
    personalBrand: AreaScore;
  };
}

/** A single spoke of the radar chart (one per scored dimension). */
export interface RadarAxis {
  label: string;
  score: number;
}

export interface ScoreResponse {
  composite: number;
  tier: TierResult;
  relevanceAssessed: boolean;
  metrics: Layer1Metrics;
  areas: CompositeAreas;
  /** v2: dimensions for the radar chart, in display order. */
  radar: RadarAxis[];
  /** v2 (D-C): soft authenticity nudge, shown above the breakdown when flagged. */
  authenticityRisk?: { flagged: boolean; note?: string };
  strongestLine?: string;
  topFixes: { area: string; mechanism?: string; learn?: string; text: string }[];
  usage: { remaining: number; tier: "anonymous" | "email" };
}
