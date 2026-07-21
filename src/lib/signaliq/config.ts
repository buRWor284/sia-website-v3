/**
 * SignalIQ — config-as-code. Tune beats, scoring weights, bands, gating, and the
 * tasteful-newsjacking guardrail here without touching logic. (Mirrors the
 * src/lib/pitch/config.ts approach used by PressIQ.)
 */
import type { Beat, BeatId, OppBand, SourceId } from "./types";
import { QUOTA_LIMITS } from "@/lib/gate/quota-limits";

/** Working product name — rename in ONE place (RFP D-1). */
export const PRODUCT = "SignalIQ";

/** Model for asset-pack generation (env-overridable). Mirrors PressIQ. */
export const SIGNALIQ_MODEL = process.env.SIGNALIQ_MODEL || "claude-sonnet-4-6";

// Freemium caps — single source of truth is lib/gate/quota-limits.ts (Phase P2).
// Re-exported here so SignalIQ UI copy and the scan/pack routes read the same numbers.
export const FREE_SCANS = QUOTA_LIMITS["signaliq-scan"].anonymous; // anonymous scans / month
export const EMAIL_SCANS = QUOTA_LIMITS["signaliq-scan"].email; // with email
export const FREE_PACKS = QUOTA_LIMITS["signaliq-pack"].anonymous; // anonymous asset packs / month
export const EMAIL_PACKS = QUOTA_LIMITS["signaliq-pack"].email; // with email

/** How many opportunities a scan returns. */
export const MAX_OPPORTUNITIES = 12;

/**
 * Seed slots per selected beat, keyed by how many beats the user chose (total
 * always ≤ MAX_SEEDS=18 in scan.ts). Weighted, NOT even: the primary beat keeps
 * most of the budget so a single-focus scan stays coherent, while a secondary /
 * tertiary beat is additive breadth rather than dilution. One multi-beat scan is
 * still one /api/signaliq/scan call (one quota decrement) — the extra beats just
 * widen the candidate pool the same 18 slots sample from.
 */
export const BEAT_SLOTS: Record<number, number[]> = {
  1: [18],
  2: [12, 6],
  3: [10, 5, 3],
};

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
  magnitude: 0.22,   // was .25 — raw SEC filing volume over-rewarded big-industry terms
  velocity: 0.2,
  coverageGap: 0.28,
  fit: 0.06,         // beat fit (minor; startup relevance below does the heavy lifting)
  credibility: 0.1,
  corroborationBonus: 0.14, // max added on top, scaled by # independent sources
} as const;

/**
 * Startup-relevance multiplier. When a company profile is present, the whole
 * base score is scaled by:  RELEVANCE_FLOOR + (1 - RELEVANCE_FLOOR) * relevance
 * …so an industry-loud but off-target signal (e.g. "clinical trial", 1,200+
 * filings) can't rank as a "Hot lead" for a company it doesn't fit.
 * With NO profile, relevance is neutral (multiplier = 1) — the public-tool default.
 */
export const RELEVANCE_FLOOR = 0.5;

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
      // — widened 2026-07-10 (Fix B1) —
      "usage-based pricing", "remote work software", "product analytics", "customer success", "sales automation",
      "marketing automation", "workflow automation", "AI copilot", "app store fees", "SOC 2 compliance",
      "venture capital", "seed funding", "micro SaaS", "integration platform", "low-code development", "tech IPO",
      // - widened 2026-07-21 (Irfan: client-work + geography coverage) -
      "staff augmentation", "IT outsourcing", "Pakistan startups",
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
      // — widened 2026-07-10 (Fix B1) —
      "digital wallet", "real-time payments", "cross-border payments", "mortgage technology", "robo-advisor",
      "small business lending", "invoice financing", "expense management", "financial compliance", "KYC verification",
      "anti-money laundering", "interchange fees", "crypto custody", "tokenized assets", "financial literacy", "credit builder",
      // - widened 2026-07-21 (royalty/private-markets angle for the BioPalace conversation) -
      "private credit", "alternative assets",
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
      // — widened 2026-07-10 (Fix B1) —
      "gene therapy", "genetic testing", "allergy treatment", "asthma", "fertility treatment",
      "women's health", "sleep health", "medical devices", "vaccine development", "rare disease",
      "cancer screening", "immunotherapy", "microbiome", "eldercare", "home health care",
      "medical imaging", "hospital staffing shortage", "addiction treatment",
      // - widened 2026-07-21 (BioPalace biotech-royalty conversation + wellness/longevity cluster) -
      "biotech royalties", "royalty financing", "biotech funding", "drug licensing",
      "oncology", "cardiovascular disease",
      "healthy aging", "anti-aging", "skincare", "skin rejuvenation",
      "dietary supplements", "strength training", "intermittent fasting", "nutrition",
      "peptides", "botox", "age reversal", "creatine", "hormone therapy", "sunscreen",
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
      // — widened 2026-07-10 (Fix B1) —
      "battery recycling", "geothermal energy", "small modular reactor", "carbon capture", "climate insurance",
      "precision agriculture", "alternative protein", "food waste", "vertical farming", "microgrid",
      "green building", "sustainable aviation fuel", "e-waste recycling", "carbon accounting", "climate disclosure",
      "EV battery supply chain", "energy efficiency",
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
      // — widened 2026-07-10 (Fix B1) —
      "AI coding assistant", "AI video generation", "small language model", "edge AI", "GPU cloud",
      "synthetic data", "multimodal AI", "AI companion apps", "AI in legal", "AI drug discovery",
      "humanoid robot", "robotics automation", "deepfake detection", "AI inference cost", "AI talent shortage", "AI evaluation",
    ],
    blurb: "Models, applications, and the policy fight around them.",
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity & Privacy",
    seeds: [
      "SIM swap attack", "SS7 vulnerability", "telecom data breach", "account takeover fraud",
      "eSIM security", "phone number hijacking", "two-factor authentication bypass", "mobile identity theft",
      "AI voice scam", "identity verification bypass", "cryptocurrency theft hack", "zero trust mobile",
      "mobile carrier fraud", "data broker privacy", "cybersecurity insurance", "biometric authentication",
      "social engineering attack", "digital privacy regulation", "MVNO market growth", "password manager breach",
      // — widened 2026-07-10 (Fix B1) —
      "ransomware", "phishing", "supply chain attack", "passkey adoption", "API security",
      "IoT security", "children's online privacy", "age verification", "facial recognition", "spyware",
      "encrypted messaging", "post-quantum encryption", "bug bounty", "insider threat", "critical infrastructure security", "cloud security",
      // - widened 2026-07-21 (Efani conversation) -
      "mobile security", "phone scam", "digital identity",
    ],
    blurb: "Mobile security, identity fraud, privacy, and the policy fight around them.",
  },
  {
    id: "agency",
    label: "Agency & Marketing",
    // New beat 2026-07-10 (Irfan): marketing, SEO/GEO, digital PR, content, and
    // web/app-dev agency stories. Real market phrases that return SEC/news/research
    // hits (never brand/product names). Note: pure service/agency companies still
    // tend to get thinner signal than product companies — see the Stage-2 caveat.
    seeds: [
      "digital advertising", "programmatic advertising", "retail media", "influencer marketing", "creator economy",
      "content marketing", "search engine optimization", "generative engine optimization", "answer engine optimization", "AI search",
      "zero-click search", "local SEO", "digital PR", "earned media", "media relations",
      "public relations", "brand reputation", "crisis communications", "performance marketing", "growth marketing",
      "conversion rate optimization", "customer acquisition cost", "marketing attribution", "first-party data", "cookie deprecation",
      "ad fraud", "brand safety", "connected TV advertising", "web development", "app development",
      "app store optimization", "headless CMS", "web design", "user generated content", "video marketing", "email marketing",
      // - widened 2026-07-21 (Irfan: own-positioning seeds - fractional CMO offer, EMB/EME
      //   earned-media climate, FactCheckIQ credibility beat, SEO/link-building craft) -
      "fractional CMO", "fractional executive", "thought leadership", "B2B marketing", "marketing budget",
      "press release", "newsroom layoffs", "data journalism", "podcast advertising",
      "fact checking", "misinformation", "AI generated content",
      "SEO", "LLM visibility", "link building", "backlinking", "editorial backlinks", "SEO PR",
      "media pitching", "media outreach", "cold email", "cold email outreach", "brand mentions",
    ],
    blurb: "Marketing, SEO/GEO, digital PR, content, and web/app agency stories.",
  },
];

export function beatById(id: BeatId): Beat {
  return BEATS.find((b) => b.id === id) ?? BEATS[0];
}
