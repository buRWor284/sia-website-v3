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

/** Composite starting weights (sum = 1.0). Relevance redistributes if no query.
 *  LIVE — read by composite.ts. Do not change without updating composite.ts. */
export const WEIGHTS = {
  relevance: 0.25,
  objective: 0.15,
  checklist: 0.3,
  storytelling: 0.12,
  neuromarketing: 0.12,
  personalBrand: 0.06,
} as const;

/** v2 LAUNCH weights (sum = 1.0) — STAGED, not yet live. Activated in step 3, when
 *  composite.ts + the scorePrompt schema actually score `newsroomReady`. Until then
 *  `WEIGHTS` above stays live and scoring is unchanged. Reshuffle rationale: Newsroom-Ready
 *  (the #2 journalist want after relevance) earns 0.12, mostly from de-concentrating the
 *  34-pt checklist (0.30→0.24) and trimming mechanics (0.15→0.12); Neuromarketing cedes its
 *  "original data" judgment to Newsroom-Ready. */
export const WEIGHTS_V2 = {
  relevance: 0.24,
  objective: 0.12,
  checklist: 0.24,
  storytelling: 0.11,
  neuromarketing: 0.11,
  personalBrand: 0.06,
  newsroomReady: 0.12,
} as const;

/** Layer-1 evidence-backed target bands (Appendix A). */
export const L1_BANDS = {
  wordCount: { ideal: [100, 150] as [number, number], ok: [80, 200] as [number, number], hardMax: 250, warnMin: 60 },
  // NOTE: `ideal` 6–9 is tuned for OPEN rate. Propel Q1'24 shows 1–5 words best for RESPONSE
  // (3.88%); 6–9 is merely the most-sent band. Revisit if optimizing for replies (roadmap).
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
  // — Mechanics / Layer-1 — (A1/A2 corrected to the primary Propel report, 2026-06)
  A1: { claim: "Pitch body length", figure: "51–150 words = top-responding band (3.03% response); overall response 3.15%", source: "Propel Media Barometer, Q1 2024 (425k+ pitches, Q4'23 data)", url: "https://propel-ai.com/research/the-propel-media-barometer---q1-2024" },
  A2: { claim: "Subject-line length", figure: "Short wins — 1–5 words → highest response (3.88%); 6–9 words = most-sent band (34.99%)", source: "Propel Media Barometer, Q1 2024", url: "https://propel-ai.com/research/the-propel-media-barometer---q1-2024" },
  A3: { claim: "Pitch length preference", figure: "65% of journalists want pitches under 200 words", source: "Muck Rack State of Journalism (2025–2026)", url: "https://muckrack.com/resources/research/state-of-journalism" },
  A4: { claim: "Pitch length preference", figure: "58% want 100–200 words", source: "Fractl journalist survey (500+)", url: "https://www.frac.tl/work/marketing-research/earned-media-content-types/" },
  A5: { claim: "Email length / response", figure: "50–125 words optimal", source: "Boomerang study (40M emails)", url: "https://blog.boomerangapp.com/2016/02/7-tips-for-getting-more-responses-to-your-emails-with-data/" },
  A6: { claim: "Reading level", figure: "3rd-grade level → +36% response vs college (53% vs 39%)", source: "Boomerang study (40M emails)", url: "https://blog.boomerangapp.com/2016/02/7-tips-for-getting-more-responses-to-your-emails-with-data/" },
  A7: { claim: "Question count", figure: "1–3 questions → +50% likelihood of a reply", source: "Boomerang study", url: "https://blog.boomerangapp.com/2016/02/7-tips-for-getting-more-responses-to-your-emails-with-data/" },
  A9: { claim: "Relevance is #1", figure: "82% delete on irrelevance alone; 72% say <25% of pitches are relevant", source: "Cision State of the Media 2026 (n≈1,800)", url: "https://www.cision.com/resources/guides-and-reports/sotm/" },
  A10: { claim: "Off-beat = deleted", figure: "88% immediately delete off-beat pitches; 70% rank beat-alignment #1", source: "Muck Rack State of Journalism 2026 (n≈900)", url: "https://muckrack.com/resources/research/state-of-journalism" },
  A11: { claim: "Personalization lift", figure: "+30.5% (subject), +32.7% (body)", source: "Backlinko, 12M emails — SEO/sales-outreach proxy, not journalist-specific", url: "https://backlinko.com/email-outreach-study" },
  A12: { claim: "Realistic base rate", figure: "~3.15–3.43% response; ~46% open; a short pitch earns ~4× the response of a long one", source: "Propel Media Barometer (Q1'24–Q3'25)", url: "https://propel-ai.com/q3-2025-propel-media-barometer" },

  // — Storytelling pillar (why it matters) —
  S1: { claim: "Story to trust (oxytocin)", figure: "A character-driven narrative with tension releases oxytocin, raising trust, empathy and action", source: "Paul Zak, HBR / Claremont Graduate University", url: "https://hbr.org/2014/10/why-your-brain-loves-good-storytelling" },
  S2: { claim: "Narrative transportation", figure: "Absorption in a story reduces counter-arguing and resistance to persuasion", source: "Green & Brock; van Laer et al. meta-analysis", url: "https://www.researchgate.net/publication/287364520" },

  // — Neuromarketing pillar (why it matters) —
  N1: { claim: "System 1 snap-judgment", figure: "The subject + first lines are judged by fast, automatic System 1; concrete specificity reads credible instantly", source: "Kahneman, Thinking, Fast and Slow", url: "https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow" },
  N2: { claim: "Loss aversion", figure: "Losses feel ~2x as powerful as gains, so loss-framed hooks outperform gain frames", source: "Kahneman & Tversky, prospect theory", url: "https://en.wikipedia.org/wiki/Loss_aversion" },
  N3: { claim: "Curiosity gap", figure: "An open information gap is what the brain wants to close — it drives the open", source: "Loewenstein, information-gap theory", url: "https://en.wikipedia.org/wiki/Information_gap_theory_of_curiosity" },

  // — Personal Brand pillar (why it matters) —
  P1: { claim: "Authority is conferred, not claimed", figure: "Authoritativeness comes from third parties (press, bylines, citations) — Google E-E-A-T", source: "Google Search, People-First Content guidance", url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" },
  P2: { claim: "Journalists check LinkedIn", figure: "62% of journalists use LinkedIn professionally; 33% rank it their single most valuable platform", source: "Cision State of the Media 2026", url: "https://www.cision.com/resources/guides-and-reports/sotm/" },

  // — Newsroom-Ready (the new category) —
  NR1: { claim: "Data is the top want", figure: "47% of journalists want more data/research from PR — the #1 single request", source: "Cision State of the Media 2026", url: "https://www.cision.com/resources/guides-and-reports/sotm/" },
  NR2: { claim: "Original data + source access", figure: "40% value original data; 58% want access to credible sources/interviews", source: "Muck Rack State of Journalism 2026", url: "https://muckrack.com/resources/research/state-of-journalism" },
  NR3: { claim: "Exclusivity", figure: "39% say the ideal pitch contains exclusive research", source: "Fractl publisher survey (500+)", url: "https://www.frac.tl/work/marketing-research/earned-media-content-types/" },
  NR4: { claim: "Visuals + timeliness", figure: "Journalists want strong visuals/ready-to-use assets; ideal pitch is <200 words, sent before noon, one timely follow-up", source: "Muck Rack 2026; Cision 2026", url: "https://muckrack.com/resources/research/state-of-journalism" },
};

/** Which evidence key backs each Layer-1 signal (for the "why?" affordance).
 *  Kept for back-compat; superseded by DIMENSION_EVIDENCE below (step 3 will migrate callers). */
export const SIGNAL_EVIDENCE = {
  wordCount: ["A1", "A3", "A4", "A5"],
  subjectWords: ["A2"],
  readingGrade: ["A6"],
  questions: ["A7"],
  relevance: ["A9", "A10"],
} as const;

/** Evidence keys behind EVERY scored dimension — drives the per-dimension "why this matters"
 *  evidence cards in the v2 output. Surfaced by the UI in step 3. */
export const DIMENSION_EVIDENCE: Record<string, string[]> = {
  relevance: ["A9", "A10"],
  objective: ["A1", "A2", "A5", "A6", "A7"],
  checklist: ["A9", "A11", "A3"],
  storytelling: ["S1", "S2"],
  neuromarketing: ["N1", "N2", "N3", "A2"],
  personalBrand: ["P1", "P2"],
  newsroomReady: ["NR1", "NR2", "NR3", "NR4"],
};

/** The four Newsroom-Ready sub-signals (scored by the model in step 3; shown as a ✓/✗
 *  checklist in the UI). "original data" is migrated here OUT of Neuromarketing (decision D-B). */
export interface NewsroomSignal {
  key: string;
  label: string;
  evidence: string[];
}

export const NEWSROOM_SIGNALS: NewsroomSignal[] = [
  { key: "originalData", label: "Original / exclusive data or research (not a Googleable third-party stat)", evidence: ["NR1", "NR2", "NR3"] },
  { key: "sourceAccess", label: "A named, credentialed source offered for quote or interview", evidence: ["NR2"] },
  { key: "assets", label: "Ready-to-use asset — chart, data viz, image, or screenshot", evidence: ["NR4"] },
  { key: "timeliness", label: "Timely / newsworthy hook; respects any stated deadline, embargo, format or word limit", evidence: ["NR4"] },
];
