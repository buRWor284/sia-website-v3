/**
 * SignalIQ — config-as-code. Tune beats, scoring weights, bands, gating, and the
 * tasteful-newsjacking guardrail here without touching logic. (Mirrors the
 * src/lib/pitch/config.ts approach used by PressIQ.)
 */
import type { Beat, BeatId, OppBand, SourceId } from "./types";

/** Working product name — rename in ONE place (RFP D-1). */
export const PRODUCT = "SignalIQ";

/** Model for asset-pack generation (env-overridable). Mirrors PressIQ. */
export const SIGNALIQ_MODEL = process.env.SIGNALIQ_MODEL || "claude-sonnet-4-6";

/** Freemium gating (mirrors PressIQ's pp_tier cookie pattern; see API routes). */
export const FREE_SCANS = 3; // anonymous scans / month
export const EMAIL_SCANS = 10; // with email
export const FREE_PACKS = 1; // anonymous asset packs / month
export const EMAIL_PACKS = 5; // with email

/** How many opportunities a scan returns. */
export const MAX_OPPORTUNITIES = 12;

/** Source credibility weights (0..1) — a federal filing outranks a forum. */
export const SOURCE_CREDIBILITY: Record<SourceId, number> = {
  sec: 0.95,
  gdelt: 0.8,
  arxiv: 0.8,
  wikipedia: 0.65,
  hackernews: 0.55,
};

/**
 * Opportunity score weights. The first five sum to ~1.0; corroboration is a
 * bonus added on top. CoverageGap is the heaviest — the signal-vs-coverage gap
 * is the whole differentiator (RFP §6).
 */
export const WEIGHTS = {
  magnitude: 0.25,
  velocity: 0.22,
  coverageGap: 0.3,
  fit: 0.13,
  credibility: 0.1,
  corroborationBonus: 0.15, // max added on top, scaled by # independent sources
} as const;

/** Score → band thresholds (honest language: lead/whitespace, not probability). */
export const BANDS: { min: number; band: OppBand; label: string }[] = [
  { min: 80, band: "hot", label: "Hot lead" },
  { min: 60, band: "look", label: "Worth a look" },
  { min: 40, band: "early", label: "Early" },
  { min: 0, band: "noise", label: "Noise / late" },
];

export function bandFor(score: number): { min: number; band: OppBand; label: string } {
  return BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];
}

/**
 * Tasteful-newsjacking guardrail (RFP §11.4, D-13): never frame human tragedy
 * as an "opportunity." Matched items are flagged `sensitive` and demoted below
 * all non-sensitive opportunities in the ranking.
 */
export const SENSITIVE_TERMS = [
  "death", "died", "dead", "killed", "killing", "casualt", "fatal", "fatalities",
  "shooting", "massacre", "terror", "bombing", "earthquake", "wildfire",
  "hurricane", "flood victim", "disaster", "suicide", "abuse", "assault",
  "war crime", "genocide", "hostage", "murder", "overdose death",
];

export function isSensitive(text: string): boolean {
  const t = text.toLowerCase();
  return SENSITIVE_TERMS.some((w) => t.includes(w));
}

/** Preset founder beats (MVP). Pro/custom beats are a v2 upgrade. */
export const BEATS: Beat[] = [
  {
    id: "saas",
    label: "SaaS & startups",
    seeds: [
      "product-led growth", "developer tools", "B2B software pricing", "vertical SaaS", "startup layoffs",
      "SaaS churn", "no-code platform", "API economy", "enterprise software consolidation", "cloud cost optimization",
      "platform engineering", "open source monetization", "SaaS valuation", "developer experience", "startup funding",
      "B2B marketplace", "software security breach", "subscription fatigue", "AI productivity software", "startup acquisition",
    ],
    blurb: "Software, product, and go-to-market stories.",
  },
  {
    id: "fintech",
    label: "Fintech",
    seeds: [
      "earned wage access", "buy now pay later", "stablecoin", "neobank", "payments fraud",
      "embedded finance", "open banking", "crypto regulation", "financial inclusion", "credit scoring AI",
      "insurtech", "remittance", "banking as a service", "BNPL regulation", "central bank digital currency",
      "fraud detection", "payroll fintech", "wealth management AI", "debit card startup", "lending discrimination",
    ],
    blurb: "Payments, lending, crypto-adjacent, and consumer-finance stories.",
  },
  {
    id: "health",
    label: "Health & wellness",
    seeds: [
      "GLP-1 drugs", "telehealth", "digital therapeutics", "health insurance denial", "longevity",
      "chronic disease management", "mental health app", "wearable health", "FDA approval", "hospital consolidation",
      "drug pricing", "clinical AI", "remote patient monitoring", "health data privacy", "obesity treatment",
      "clinical trial", "biosensor", "patient engagement", "preventive care", "personalized medicine",
    ],
    blurb: "Care delivery, digital health, and consumer-health stories.",
  },
  {
    id: "climate",
    label: "Climate & energy",
    seeds: [
      "grid battery storage", "carbon removal", "heat pump adoption", "EV charging", "data center power",
      "offshore wind", "nuclear energy", "green hydrogen", "carbon credit", "ESG investing",
      "climate risk", "circular economy", "sustainable packaging", "water technology", "solar panel",
      "grid modernization", "clean transportation", "methane reduction", "biodiversity loss", "climate litigation",
    ],
    blurb: "Energy, sustainability, and the physical economy (great for mapographics).",
  },
  {
    id: "ai",
    label: "AI",
    seeds: [
      "AI agents", "open-source LLM", "AI regulation", "AI in hiring", "AI energy use",
      "foundation model", "AI safety", "generative AI copyright", "AI bias", "autonomous vehicles",
      "AI chip shortage", "enterprise AI adoption", "AI governance", "RAG retrieval", "AI in healthcare",
      "AI hallucination", "model fine-tuning", "AI in education", "AI surveillance", "AI product liability",
    ],
    blurb: "Models, applications, and the policy fight around them.",
  },
];

export function beatById(id: BeatId): Beat {
  return BEATS.find((b) => b.id === id) ?? BEATS[0];
}
