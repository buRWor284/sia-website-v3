/**
 * PressIQ — the EMOS-teaching feedback engine.
 * The *frame* (mechanism name + why it matters + essay link) is templated here so it
 * is consistent, on-brand, and never hallucinated. The *specifics* (what this pitch did)
 * come from the model. The page composes: emosFrame(dimension, band) + AI note.
 */

import { ESSAYS } from "./config";

export type Band = "strong" | "weak" | "missing";

export interface EmosFrame {
  mechanism: string;
  learn: string;
  text: string;
}

type FrameMap = Record<Band, EmosFrame>;

export const FEEDBACK: Record<string, FrameMap> = {
  relevance: {
    strong: {
      mechanism: "Relevance — the #1 filter",
      learn: ESSAYS.checklist,
      text: "You answered the actual question. Relevance is the single biggest driver of placement — 88% of journalists delete anything off-beat (Muck Rack 2026) — and you cleared the bar most pitches fail.",
    },
    weak: {
      mechanism: "Relevance — the #1 filter",
      learn: ESSAYS.checklist,
      text: "Your pitch is good but drifts from what the journalist actually asked. 82–88% of journalists reject off-beat pitches (Cision 2026; Muck Rack 2026). Mirror the query's exact angle, format, and constraints in your first two lines.",
    },
    missing: {
      mechanism: "Relevance — the #1 filter",
      learn: ESSAYS.checklist,
      text: "This reads as a generic pitch, not an answer to this query. Relevance outranks every other factor — name the journalist's specific angle up top, or this gets deleted unread.",
    },
  },
  storytelling: {
    strong: {
      mechanism: "Narrative transportation",
      learn: ESSAYS.storytelling,
      text: "You put a character in a real situation. That's narrative transportation (Green & Brock) — immersion quietly suppresses a reader's skepticism, and character-driven stories trigger the oxytocin response that builds trust.",
    },
    weak: {
      mechanism: "Narrative transportation",
      learn: ESSAYS.storytelling,
      text: "There's a hint of a story, but it's thin. Open on the moment the problem bit — a specific person, a specific stake. Narrative transportation is what disarms a journalist's defenses; a flat claim leaves them switched on.",
    },
    missing: {
      mechanism: "The oxytocin effect",
      learn: ESSAYS.storytelling,
      text: "This is a credential dump — titles and claims, no character in a scene. Journalists stay skeptical of assertions. A problem→insight→resolution arc with a real protagonist triggers empathy (the oxytocin effect) and makes the pitch land.",
    },
  },
  neuromarketing: {
    strong: {
      mechanism: "System 1 + original data",
      learn: ESSAYS.neuromarketing,
      text: "Your hook passes the 2-second System 1 test and you lead with something a journalist can't just Google. Original data and a distinct POV beat borrowed stats every time.",
    },
    weak: {
      mechanism: "Original data > borrowed stats",
      learn: ESSAYS.neuromarketing,
      text: "You lean on stats a journalist could find themselves. They can Google a statistic; they can't Google your proprietary data or your contrarian take. Lead with what's uniquely yours, and frame the stakes (loss aversion), not just the upside.",
    },
    missing: {
      mechanism: "System 1 credibility",
      learn: ESSAYS.neuromarketing,
      text: "Nothing here triggers a fast 'this is credible' read. Engineer the subject line and opening for System 1 (Kahneman): specificity, a concrete number that's yours, or a loss frame. Editorial-grade proof beats salesy hype.",
    },
  },
  personalBrand: {
    strong: {
      mechanism: "E-E-A-T & the halo effect",
      learn: ESSAYS.personalBranding,
      text: "Your pitch signals verifiable authority in-line. Journalists won't Google you mid-skim — putting the proof in the pitch lets familiarity and the halo effect lower their threshold to say yes.",
    },
    weak: {
      mechanism: "E-E-A-T & the halo effect",
      learn: ESSAYS.personalBranding,
      text: "You have real authority but the pitch barely signals it. Surface one concrete proof point (a byline, a result, a stage) where it counts — that's the E-E-A-T signal that makes the next 'yes' easier.",
    },
    missing: {
      mechanism: "Verifiable authority",
      learn: ESSAYS.personalBranding,
      text: "The pitch carries no credibility signal a journalist can verify. When SEMrush accepted a pitch, they said they'd Googled the author and found the proof. Put a verifiable signal — site, byline, result — into the pitch itself.",
    },
  },
  checklist: {
    strong: {
      mechanism: "SIA 7-step journo-outreach checklist",
      learn: ESSAYS.checklist,
      text: "You're hitting most of the 34-point system. Tighten the few remaining steps and this is a pitch a journalist can paste in.",
    },
    weak: {
      mechanism: "SIA 7-step journo-outreach checklist",
      learn: ESSAYS.checklist,
      text: "Several steps of the proven 7-step system are missing. Each one is a documented reason journalists ignore or accept a pitch — close the gaps flagged below.",
    },
    missing: {
      mechanism: "SIA 7-step journo-outreach checklist",
      learn: ESSAYS.checklist,
      text: "Most of the 34-point system is missing. Work the checklist top to bottom — research, subject, intro, the answer, the close, the signature.",
    },
  },
  objective: {
    strong: {
      mechanism: "Mechanics (Respondable-style)",
      learn: ESSAYS.writingTips,
      text: "Length, reading level, and your closing question are in the evidence-backed sweet spot. The mechanics won't cost you the reply.",
    },
    weak: {
      mechanism: "Mechanics (Respondable-style)",
      learn: ESSAYS.writingTips,
      text: "The structural mechanics need work — see the meters. Pitches of ~80–200 words, at a grade-7 reading level, ending on one question, get materially more responses.",
    },
    missing: {
      mechanism: "Mechanics (Respondable-style)",
      learn: ESSAYS.writingTips,
      text: "The basics are off — length, readability, or the closing question. These are the cheapest points to win; fix the meters first.",
    },
  },
  newsroomReady: {
    strong: {
      mechanism: "Newsroom-ready — publishable raw material",
      learn: ESSAYS.checklist,
      text: "You handed the journalist something they can actually run — original data, a named source, an asset, or a timely hook. After relevance, this is the #1 thing journalists ask for: 47% want more data/research (Cision 2026) and 58% want source access (Muck Rack 2026).",
    },
    weak: {
      mechanism: "Newsroom-ready — publishable raw material",
      learn: ESSAYS.checklist,
      text: "Competent, but thin on publishable material. Add one thing a journalist can't get elsewhere — a proprietary number, an exclusive, a named expert for interview, or a ready-to-use chart. 40% of journalists specifically value original data (Muck Rack 2026).",
    },
    missing: {
      mechanism: "Newsroom-ready — publishable raw material",
      learn: ESSAYS.checklist,
      text: "There's nothing here a journalist can build a story on — no original data, no source to interview, no asset, no timely hook. A clean pitch with no raw material is the 'competitive but forgettable' one that gets ignored. Lead with something exclusive — data/research is journalists' #1 want (Cision 2026).",
    },
  },
};

/** D-C: a soft, non-scored nudge shown when a pitch reads templated/generic.
 *  Deliberately frames it as "reads templated", never "this is AI" (PressIQ is itself AI). */
export const AUTHENTICITY_NUDGE: EmosFrame = {
  mechanism: "Reads templated",
  learn: ESSAYS.writingTips,
  text: "This reads like a template a hundred others could send. Add a first-hand detail or a number only you have — 53% of journalists distrust generic, AI-sounding pitches (Cision 2026), so one specific, human line is what sets you apart.",
};

export function bandFor(score: number): Band {
  if (score >= 75) return "strong";
  if (score >= 45) return "weak";
  return "missing";
}

export function emosFrame(dimension: keyof typeof FEEDBACK, score: number): EmosFrame {
  return FEEDBACK[dimension][bandFor(score)];
}
