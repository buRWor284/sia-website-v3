/**
 * PressIQ — single source of truth for scoring config.
 * Every threshold traces to docs/PressIQ-RFP.md Appendix A (the EVIDENCE map below).
 * Tune scoring here without touching logic, prompts, or UI.
 */

import type { Platform } from "./types";

/** D-9: Sonnet by default, overridable via env. */
export const PITCH_MODEL = process.env.PITCH_SCORE_MODEL || "claude-sonnet-4-6";

/** D-12: launch name + EMOS links (mirrors other tools in this repo). */
export const PRODUCT_NAME = "PressIQ";
export const EMOS_URL = "https://dmr.agency/earnedmediaos/";
export const EMOS_APPLY = "https://dmr.agency/earnedmediaos/apply/";

export const FREE_LIMIT = 3; // scores / month, anonymous
export const EMAIL_LIMIT = 10; // scores / month, with email

/** D-7: one rubric + light per-platform overrides. */
export const PLATFORMS: { id: Platform; label: string; formal: boolean }[] = [
  { id: "haro", label: "HARO / Connectively", formal: true },
  { id: "qwoted", label: "Qwoted", formal: true },
  { id: "sos", label: "Source of Sources", formal: true },
  { id: "featured", label: "Featured", formal: true },
  { id: "b2bwriter", label: "Help a B2B Writer", formal: false },
];

/** Composite starting weights (sum = 1.0). Relevance redistributes if no query. */
export const WEIGHTS = {
  relevance: 0.25,
  objective: 0.15,
  checklist: 0.3,
  storytelling: 0.12,
  neuromarketing: 0.12,
  personalBrand: 0.06,
} as const;

/** Layer-1 evidence-backed target bands (Appendix A). */
export const L1_BANDS = {
  wordCount: { ideal: [100, 150] as [number, number], ok: [80, 200] as [number, number], hardMax: 250, warnMin: 60 },
  subjectWords: { ideal: [6, 9] as [number, number], ok: [4, 12] as [number, number] },
  readingGrade: { ideal: [0, 7] as [number, number], ok: [0, 9] as [number, number], penaltyAbove: 12 },
  questions: { ideal: 1, ok: [1, 3] as [number, number] },
};

export const TIERS = [
  { min: 0, max: 39, label: "Will be ignored", badge: "Cold", color: "#c14a32" },
  { min: 40, max: 64, label: "Needs work", badge: "Warming", color: "#d99211" },
  { min: 65, max: 84, label: "Competitive", badge: "Live", color: "#2d5393" },
  { min: 85, max: 100, label: "Placement-grade", badge: "Filed", color: "#3e6b45" },
] as const;

export function tierFor(score: number) {
  return TIERS.find((t) => score >= t.min && score <= t.max) ?? TIERS[0];
}

/** Layer-2: the 34-point SIA journo-outreach checklist (mirror of the infographic STEPS). */
export interface ChecklistStep {
  no: string;
  title: string;
  items: string[];
  /** post-send items are coaching, not scored */
  coaching?: string[];
  color: string;
}

export const CHECKLIST: ChecklistStep[] = [
  {
    no: "01",
    title: "Research",
    color: "#c14a32",
    items: [
      "References the journalist's prior work, beat, or a specific past article",
      "Shows awareness of the journalist's style/focus",
      "Ties the pitch to something the journalist actually covers",
    ],
  },
  {
    no: "02",
    title: "Subject Line",
    color: "#d99211",
    items: [
      "Anchored to the query title",
      "Adds a substantive modifier (Insider Tips, [Stats + Examples], Myths, etc.)",
      "Reads as substantive, not generic",
      "Scannable in ~2 seconds",
      "Tone fits the platform (emoji only on casual platforms)",
    ],
  },
  {
    no: "03",
    title: "Intro + Bio",
    color: "#2f6f68",
    items: [
      "Greets the reporter by first name",
      "Bio is 2–3 sentences, not a résumé",
      "Credibility/social proof tied to the topic",
    ],
  },
  {
    no: "04",
    title: "Answering the Query",
    color: "#2d5393",
    items: [
      "Answers the exact question(s) asked, directly",
      "Substantive answer is ~70–250 words",
      "Includes at least one statistic with a source",
      "Offers a screenshot/GIF or concrete artifact",
      "Skimmable (short lists, occasional emphasis)",
      "Shares a first-hand, personal example",
      "Points readers to a useful tool/app/book",
    ],
  },
  {
    no: "05",
    title: "The Ending",
    color: "#834063",
    items: ["Ends on a single question, not a sign-off", "Offers to send more"],
  },
  {
    no: "06",
    title: "Signature",
    color: "#3e6b45",
    items: [
      "Full name",
      "Designation / title",
      "Company name",
      "Company website URL",
      "Email",
      "X / Twitter",
      "LinkedIn",
      "Headshot URL",
    ],
  },
  {
    no: "07",
    title: "More Hacks",
    color: "#c5662a",
    items: [
      "Uses a branded short URL where relevant",
      "Reads tight — nothing unnecessary left in",
      "Proofed (no obvious grammar errors)",
      "A read-receipt would be enabled before sending",
    ],
    coaching: [
      "After sending: engage the reporter on social (retweet/follow)",
      "After sending: log the pitch in an outreach tracker",
    ],
  },
];

export const CHECKLIST_TOTAL = CHECKLIST.reduce((n, s) => n + s.items.length, 0); // 34

/** Resource essays for feedback deep-links (the EMOS funnel). */
export const ESSAYS = {
  storytelling: "/resources/storytelling",
  neuromarketing: "/resources/neuromarketing",
  personalBranding: "/resources/personal-branding",
  writingTips: "/resources/writing-tips",
  checklist: "/infographics/journo-outreach-checklist",
} as const;

/** Appendix A — cited evidence. Keys are referenced by config + surfaced in the UI ("why?"). */
export interface Evidence {
  claim: string;
  figure: string;
  source: string;
  url: string;
}

export const EVIDENCE: Record<string, Evidence> = {
  A1: { claim: "Pitch body length sweet spot", figure: "51–150 words → 7.51% response (highest band); 501–1000 → 1.51%", source: "Propel Media Barometer, Q1 2024 (400k+ pitches)", url: "https://www.propelmypr.com/research/the-propel-media-barometer---q1-2024" },
  A2: { claim: "Subject-line length", figure: "6–9 words → highest open rate (48.83%)", source: "Propel Media Barometer", url: "https://www.propelmypr.com/research/the-propel-media-barometer---q1-2024" },
  A3: { claim: "Pitch length preference", figure: "65% of journalists want < 200 words", source: "Muck Rack State of Journalism 2025 (n≈1,500)", url: "https://muckrack.com/research/state-of-journalism" },
  A4: { claim: "Pitch length preference", figure: "58% want 100–200 words", source: "Fractl journalist survey (500+)", url: "https://www.frac.tl/work/marketing-research/earned-media-content-types/" },
  A5: { claim: "Email length / response", figure: "50–125 words optimal; 75–100 → 51%", source: "Boomerang study (40M emails)", url: "https://blog.boomerangapp.com/2016/02/7-tips-for-getting-more-responses-to-your-emails-with-data/" },
  A6: { claim: "Reading level", figure: "3rd-grade level → +36% vs college, +17% vs high school", source: "Boomerang study", url: "https://blog.boomerangapp.com/2016/02/7-tips-for-getting-more-responses-to-your-emails-with-data/" },
  A7: { claim: "Question count", figure: "1–3 questions lifts response", source: "Boomerang study", url: "https://blog.boomerangapp.com/2016/02/7-tips-for-getting-more-responses-to-your-emails-with-data/" },
  A9: { claim: "Relevance is #1", figure: "86% immediately reject off-beat pitches", source: "Cision State of the Media 2025 (n≈3,000)", url: "https://www.cision.com/resources/guides-and-reports/2025-state-of-the-media-report/" },
  A10: { claim: "Off-topic = ignored", figure: "86% ignore off-topic pitches", source: "Muck Rack 2025", url: "https://muckrack.com/research/state-of-journalism" },
  A11: { claim: "Personalization lift", figure: "+30.5% (subject), +32.7% (body)", source: "Backlinko, 12M emails", url: "https://backlinko.com/email-outreach-study" },
  A12: { claim: "Realistic base rate", figure: "~3.43% journalist response rate", source: "Propel Media Barometer", url: "https://www.propelmypr.com/research/the-propel-media-barometer---q1-2024" },
};

/** Which evidence key backs each Layer-1 signal (for the "why?" affordance). */
export const SIGNAL_EVIDENCE = {
  wordCount: ["A1", "A3", "A4", "A5"],
  subjectWords: ["A2"],
  readingGrade: ["A6"],
  questions: ["A7"],
  relevance: ["A9", "A10"],
} as const;
