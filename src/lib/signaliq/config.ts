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
 * Volume normalisation reference — SignalIQ BigQuery cutover (2026-07-22).
 * Scorer reads coverage.volume as 0..1 (score.ts: 1 - coverage.volume). BigQuery
 * volume (derive.ts) is a RAW 14-day avg distinct-article count, 0..~2500 across
 * topics (live 07-08..07-21: p50 5, p90 82, p99 440, max 2544), so compress to
 * 0..1 before scoring. ~500x spread rules out a linear cap; log keeps spread:
 *   vol01 = clamp01( log10(1 + v14) / log10(1 + VOLUME_LOG_REF) )
 * REF=500 (~p99) reproduces the old DOC-era median gap (0.71), so BANDS carry over.
 */
export const VOLUME_LOG_REF = 500;

/** Compress a raw occurrence average to the 0..1 saturation the scorer expects. */
export function normalizeVolume(rawVolume: number, ref: number = VOLUME_LOG_REF): number {
  const v = Number.isFinite(rawVolume) && rawVolume > 0 ? rawVolume : 0;
  const denom = Math.log10(1 + Math.max(ref, 2));
  return Math.max(0, Math.min(1, Math.log10(1 + v) / denom));
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
/**
 * The beats offered in the public picker. Everything else in BEATS is a hidden
 * data-collection set (radars, non-English markets) that still rides the nightly
 * scan. Resolve a beat LABEL from BEATS, never from this - a saved scan may name
 * a hidden beat and must still render.
 */
export const visibleBeats = (): Beat[] => BEATS.filter((b) => !b.hidden);

export const BEATS: Beat[] = [
  {
    id: "saas",
    label: "SaaS & startups",
    seeds: [
      "product-led growth", "developer tools", "vertical SaaS",
      "no-code platform", "cloud cost optimization",
      "platform engineering", "SaaS valuation", "developer experience", "startup funding",
      "B2B marketplace", "subscription fatigue", "startup acquisition",
      // — widened 2026-07-10 (Fix B1) —
      "usage-based pricing", "remote work software", "product analytics", "customer success", "sales automation",
      "marketing automation", "workflow automation", "AI copilot", "app store fees", "SOC 2 compliance",
      "venture capital", "seed funding", "integration platform", "low-code development", "tech IPO",
      // - widened 2026-07-21 (Irfan: client-work + geography coverage) -
      "staff augmentation", "IT outsourcing",
      // - widened 2026-09-09 (B2B depth). PROBE-PENDING.
      "B2B SaaS", "enterprise software", "procurement software", "supply chain software", "ERP implementation",
      "CRM platform", "sales enablement", "revenue operations", "net revenue retention", "annual recurring revenue",
      "customer retention", "vertical software", "data warehouse", "business intelligence", "HR software",
      "payroll software", "legal tech", "proptech", "edtech", "logistics software",
      "field service software", "B2B payments",
    ],
    blurb: "Software, product, and go-to-market stories.",
  },
  {
    id: "fintech",
    label: "Fintech",
    seeds: [
      "earned wage access", "buy now pay later", "stablecoin", "neobank", "payments fraud",
      "embedded finance", "open banking", "crypto regulation", "financial inclusion",
      "insurtech", "remittance", "banking as a service", "BNPL regulation", "central bank digital currency",
      "fraud detection", "wealth management AI", "lending discrimination",
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
      // - widened 2026-09-09 (AI depth incl. compute and hardware). PROBE-PENDING.
      "AI chip", "AI data center", "AI energy demand", "model training", "inference cost",
      "open source AI", "AI talent", "AI copyright", "synthetic data", "AI benchmark",
      "reinforcement learning", "computer vision", "speech recognition", "AI drug discovery", "AI in education",
      "AI hallucination", "prompt injection", "AI red teaming", "small language model", "on-device AI",
      "quantum computing", "autonomous vehicle",
    ],
    blurb: "Models, applications, and the policy fight around them.",
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity & Privacy",
    seeds: [
      "SIM swap attack", "account takeover fraud",
      "AI voice scam",
      "cybersecurity insurance", "biometric authentication",
      "social engineering attack",
      // — widened 2026-07-10 (Fix B1) —
      "ransomware", "phishing", "supply chain attack", "passkey adoption", "API security",
      "IoT security", "children's online privacy", "age verification", "facial recognition", "spyware",
      "encrypted messaging", "post-quantum encryption", "bug bounty", "insider threat", "critical infrastructure security", "cloud security",
      // - widened 2026-07-21 (Efani conversation) -
      "mobile security", "phone scam", "digital identity",
      // - widened 2026-09-08 (US cyber / SIM-swap radar for Efani + competitors; PROBE-PENDING,
      //   replaces 14 invented-sounding seeds that returned 0 articles over 60 days) -
      "data breach", "cyberattack", "identity theft", "zero trust", "zero-day",
      "credential stuffing", "account takeover", "business email compromise", "dark web", "data leak",
      "endpoint security", "penetration testing", "vulnerability disclosure", "cyber insurance", "SIM swapping",
      "SIM swap", "port-out fraud", "smishing", "deepfake fraud", "voice cloning",
      "wire fraud", "telecom fraud", "stalkerware", "ransomware gang", "ransomware attack",
      "phishing attack", "multi-factor authentication", "two-factor authentication", "passkeys", "cybersecurity funding",
      "social engineering", "number porting",
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
      "media pitching", "media outreach", "cold email", "brand mentions",
    ],
    blurb: "Marketing, SEO/GEO, digital PR, content, and web/app agency stories.",
  },
  {
    id: "founders",
    label: "Founders / Series-A",
    // New beat 2026-07-22 (Irfan): the EMOS Academy ICP — pre-Series-A / Series-A
    // founders. Two kinds of seed: (1) topics ALREADY scanned by other beats
    // (venture capital, AI agents, …) re-grouped here so a founder can pick ONE
    // coherent beat — buildTopicMatchers de-dupes on the canonical phrase, so this
    // adds ZERO extra scan cost; (2) net-new founder/funding/AI-wave terms below
    // (probe-scan pending — drop any that GDELT doesn't actually return). This beat
    // deliberately EXCLUDES the dead startup-ops terms still in the `saas` beat
    // (product-led growth, SaaS churn, micro SaaS, B2B software pricing, …) that
    // return ~0 GDELT volume and would flat-line a movers/brief view.
    seeds: [
      // — already live (full history, shared with other beats; de-duped in cron) —
      "venture capital", "seed funding", "startup funding", "tech IPO", "private credit", "alternative assets",
      "AI agents", "foundation model", "AI governance", "AI safety", "AI regulation", "AI search",
      "enterprise AI adoption", "humanoid robot", "edge AI", "AI coding assistant", "multimodal AI",
      "developer tools", "workflow automation", "customer success", "customer acquisition cost", "usage-based pricing",
      "stablecoin", "embedded finance", "cross-border payments",
      "creator economy", "thought leadership", "content marketing",
      // — net-new 2026-07-22 (probe-scan pending) —
      "generative AI", "large language model", "AI infrastructure", "AI bubble", "tech layoffs",
      "agentic AI", "AI startup", "venture debt", "robotaxi", "sovereign AI",
      "Series A funding", "down round", "enterprise AI", "AI chatbot", "startup accelerator",
      // - widened 2026-09-08 (US founders/funding radar; PROBE-PENDING) -
      "Silicon Valley", "Y Combinator", "Series B funding", "Series C funding", "unicorn startup",
      "IPO filing", "private equity", "angel investor", "startup valuation", "term sheet",
      "product market fit", "growth equity", "startup exit", "tech valuation", "mergers and acquisitions",
      "dry powder", "bootstrapped startup",
    ],
    blurb: "Funding climate, the AI wave, and go-to-market — the stories a pre-Series-A / Series-A founder builds authority around.",
  },
  {
    id: "travel",
    label: "Travel & Hospitality",
    // New beat 2026-09-09 (Irfan: "let's go wide"). Visible in the picker.
    // PROBE-PENDING: drop whatever returns zero after the first scans.
    seeds: [
      "travel technology", "online travel agency", "hotel booking", "short-term rental", "vacation rental",
      "business travel", "corporate travel", "travel insurance", "airline loyalty", "frequent flyer",
      "low-cost carrier", "airline capacity", "airline profitability", "airport expansion", "cruise industry",
      "luxury travel", "sustainable tourism", "overtourism", "digital nomad", "remote work visa",
      "travel visa", "visa policy", "e-visa", "biometric border", "medical tourism",
      "halal tourism", "religious tourism", "pilgrimage travel", "adventure tourism", "ecotourism",
      "hotel investment", "hospitality technology", "contactless check-in", "revenue management", "destination marketing",
      "tourism board", "business events", "wellness tourism", "culinary tourism", "sports tourism",
      "hotel occupancy", "travel demand",
    ],
    blurb: "Travel, hospitality, aviation, visas and tourism demand - the global beat behind the KSA radars, the Zoom Viza visa work and the Hajj People conversations.",
  },
  {
    id: "longevity",
    label: "Longevity & Biotech",
    // New beat 2026-09-09 (Irfan: "let's go wide"). Visible in the picker.
    // PROBE-PENDING: drop whatever returns zero after the first scans.
    seeds: [
      "longevity research", "healthy lifespan", "biological age", "epigenetic clock", "senolytics",
      "cellular senescence", "rapamycin", "caloric restriction", "anti-aging", "regenerative medicine",
      "stem cell therapy", "gene therapy", "gene editing", "CRISPR", "mRNA vaccine",
      "biotech funding", "biotech IPO", "drug discovery", "clinical trial", "precision medicine",
      "biomarker testing", "microbiome", "gut health", "peptide therapy", "hormone therapy",
      "sleep science", "cold exposure", "sarcopenia", "muscle health", "cognitive decline",
      "brain health", "dementia prevention", "metabolic health", "continuous glucose monitor", "longevity clinic",
      "cell therapy", "health span",
    ],
    blurb: "Lifespan science, biotech funding and the clinical pipeline - the beat behind the BioPalace conversation.",
  },
  {
    id: "beauty",
    label: "Beauty & Skincare",
    // New beat 2026-09-09 (Irfan: "let's go wide"). Visible in the picker.
    // PROBE-PENDING: drop whatever returns zero after the first scans.
    seeds: [
      "skincare science", "skin barrier", "retinol", "sunscreen", "sun protection",
      "dermatology", "cosmetic surgery", "medical aesthetics", "injectables", "dermal filler",
      "collagen supplement", "beauty technology", "clean beauty", "K-beauty", "hair loss treatment",
      "hair transplant", "beauty retail", "prestige beauty", "indie beauty brand", "fragrance market",
      "men's grooming", "cosmetics regulation", "beauty influencer", "skin microbiome", "laser treatment",
      "acne treatment", "beauty subscription", "cosmetic ingredients", "aesthetic clinic",
    ],
    blurb: "Skincare science, aesthetics and the beauty industry - a dense consumer-PR beat adjacent to longevity.",
  },
  {
    id: "commerce",
    label: "Retail & E-commerce",
    // New beat 2026-09-09 (Irfan: "let's go wide"). Visible in the picker.
    // PROBE-PENDING: drop whatever returns zero after the first scans.
    seeds: [
      "e-commerce growth", "online retail", "marketplace seller", "direct-to-consumer", "retail media network",
      "omnichannel retail", "click and collect", "last mile delivery", "same-day delivery", "returns management",
      "supply chain disruption", "inventory management", "private label", "grocery delivery", "social commerce",
      "live shopping", "resale market", "circular fashion", "fast fashion", "luxury retail",
      "duty free", "shopping mall", "store closures", "retail footfall", "consumer confidence",
      "discount retail", "subscription commerce", "cross-border shopping", "loyalty program", "dynamic pricing",
    ],
    blurb: "Global retail and e-commerce - the worldwide counterpart to the KSA Retail radar.",
  },
  {
    id: "ksa-tourism",
    label: "KSA Tourism & Hospitality",
    hidden: true, // radar data set, not a beat a user would pick
    // New beat 2026-07-24 (Irfan): powers the /ksa-tourism-radar page + KSA
    // speaking-circuit positioning (Sep-Nov 2026 events). Destination/brand
    // names chosen over generic head-terms ("hotel") so totals stay honest.
    // NOTE: "Saudi tourism" / "Saudi hotels" ARE umbrella head-terms - keep
    // them for context but never let them headline radar totals (the 224.8K
    // lesson from /earned-media-radar). Deliberately excluded: "The Line"
    // (stop-word phrase, matcher noise), bare "Mecca" (metaphor noise:
    // "a mecca for..."), bare "hotel" (generic head-term).
    seeds: [
      // giga-projects & destinations
      "NEOM", "Red Sea Global", "AlUla", "Diriyah", "Qiddiya",
      "New Murabba", "Mukaab", "Soudah Peaks",
      // mega-events & entertainment
      "Riyadh Season", "Expo 2030", "2034 World Cup", "Saudi Grand Prix",
      "Esports World Cup", "Soundstorm", "Jeddah Season",
      // hospitality & aviation
      "Riyadh Air", "Saudia", "AROYA Cruises", "Cruise Saudi",
      "Saudi hotels", "King Salman International Airport", "Saudi tourism",
      // faith & Muslim-friendly travel
      "Hajj", "Umrah", "Makkah", "Madinah", "halal travel",
      "Muslim travelers", "Nusuk", "Haramain",
      // - variant seeds 2026-07-24: exact-phrase matching undercounted these
      //   ("Saudi Arabian Grand Prix" vs "saudi grand prix"; "Saudi hotel
      //   market/sector" vs "saudi hotels"). Forward-accruing only - no backfill.
      "Saudi Arabian Grand Prix", "Saudi hotel",
      // - calibration control 2026-07-24: a 2019 Saudi Season with no announced
      //   return. Tracked deliberately so the radar's DORMANT verdict is visible
      //   and the instrument demonstrably can say no. -
      "Sharqiah Season",
      // - Arabic probe seeds ENABLED 2026-07-24: tokenize.ts verified script-
      //   agnostic (lowercase is a no-op on Arabic; split is whitespace-only;
      //   no ASCII/Latin assumption). \uXXXX source escapes compile to Arabic.
      //   Forward-accruing probe only - NO backfill; drop any that return zero
      //   GDELT rows (founders-beat probe pattern). Glosses:
      //   NEOM / Riyadh Season / AlUla / Diriyah / Riyadh Air / Umrah
      // ★ 2026-09-08: now carry the "ar:" language prefix. They had read ZERO on
      //   every scanned day since 24 Jul for one reason - the scan hard-coded
      //   AND n.lang = 'en', so Arabic could never match. Fixed in bigquery.ts /
      //   tokenize.ts (per-seed language, zero extra cost). Their DB keys become
      //   "ar:<phrase>". VERIFY the lang literal (tokenize.ts LANGS) with the
      //   one-day probe before reading anything into these counts.
      "ar:\u0646\u064a\u0648\u0645", "ar:\u0645\u0648\u0633\u0645 \u0627\u0644\u0631\u064a\u0627\u0636", "ar:\u0627\u0644\u0639\u0644\u0627", "ar:\u0627\u0644\u062f\u0631\u0639\u064a\u0629", "ar:\u0637\u064a\u0631\u0627\u0646 \u0627\u0644\u0631\u064a\u0627\u0636", "ar:\u0627\u0644\u0639\u0645\u0631\u0629",
      // - Arabic seeds 2026-09-09 (tourism radar). Lifted from the `ar` labels already
      //   curated on every signal card in the radar content.ts files, so the
      //   wording is Irfan-reviewed, not machine-translated. Enabled by the
      //   per-seed language support (tokenize.ts LANGS); lang literal "ar"
      //   VERIFIED against webngrams 2026-09-07 (ar = 3,576,344 rows/day).
      //   Excluded as common-word traps: sal-la (basket), jahez (ready),
      //   nusuk (rite) - single everyday nouns, the "noon"/"Panda" class.
      //   ZERO history until the backfill: do NOT wire these into radar cards
      //   yet or the momentum scores will read a fake surge.
      "ar:\u0645\u0634\u0631\u0648\u0639 \u0627\u0644\u0628\u062d\u0631 \u0627\u0644\u0623\u062d\u0645\u0631", // Red Sea Global
      "ar:\u0627\u0644\u0642\u062f\u064a\u0629", // Qiddiya
      "ar:\u0627\u0644\u0645\u0631\u0628\u0639 \u0627\u0644\u062c\u062f\u064a\u062f", // New Murabba / Mukaab
      "ar:\u0642\u0645\u0645 \u0627\u0644\u0633\u0648\u062f\u0629", // Soudah Peaks
      "ar:\u0625\u0643\u0633\u0628\u0648 2030 \u0627\u0644\u0631\u064a\u0627\u0636", // Expo 2030 Riyadh
      "ar:\u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 2034", // FIFA World Cup 2034
      "ar:\u062c\u0627\u0626\u0632\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629 \u0627\u0644\u0643\u0628\u0631\u0649", // Saudi Arabian GP
      "ar:\u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 \u0644\u0644\u0631\u064a\u0627\u0636\u0627\u062a \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629", // Esports World Cup
      "ar:\u0633\u0627\u0648\u0646\u062f\u0633\u062a\u0648\u0631\u0645", // Soundstorm (MDLBEAST)
      "ar:\u0645\u0648\u0633\u0645 \u062c\u062f\u0629", // Jeddah Season
      "ar:\u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", // Saudia
      "ar:\u0623\u0631\u0648\u064a\u0627", // AROYA Cruises / Cruise Saudi
      "ar:\u0627\u0644\u062a\u0648\u0633\u0639 \u0627\u0644\u0641\u0646\u062f\u0642\u064a", // Hotel pipeline
      "ar:\u0645\u0637\u0627\u0631 \u0627\u0644\u0645\u0644\u0643 \u0633\u0644\u0645\u0627\u0646 \u0627\u0644\u062f\u0648\u0644\u064a", // King Salman Intl Airport
      "ar:\u0642\u0637\u0627\u0639 \u0641\u0639\u0627\u0644\u064a\u0627\u062a \u0627\u0644\u0623\u0639\u0645\u0627\u0644", // MICE & business events
      "ar:\u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0627\u0644\u0633\u064a\u0627\u062d\u064a", // Tourism investment
      "ar:\u0627\u0644\u062d\u062c", // Hajj operations
      "ar:\u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629", // Makkah hospitality
      "ar:\u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0627\u0644\u0645\u0646\u0648\u0631\u0629", // Madinah hospitality
      "ar:\u0627\u0644\u0633\u0641\u0631 \u0627\u0644\u0635\u062f\u064a\u0642 \u0644\u0644\u0645\u0633\u0644\u0645\u064a\u0646", // Muslim-friendly travel
      "ar:\u0642\u0637\u0627\u0631 \u0627\u0644\u062d\u0631\u0645\u064a\u0646", // Haramain high-speed rail
    ],
    blurb: "Saudi giga-projects, mega-events, hospitality, aviation, and faith-travel coverage.",
  },
  // ─── KSA category-radar probe beats (2026-08-09) ─────────────────────────
  // Three candidate categories for radar #2 (Riyadh workshop Nov 2026, Seamless /
  // Shop Arabia thread, Athar). ~30 candidate seeds each, committed together so
  // ONE 14-day backfill (2026-07-26..2026-08-08, ~$4) prices English press
  // volume for all three at once — Athar-Category-Radar-Feasibility-Answer.md §6.
  // Probe rules (founders-beat pattern): these are CANDIDATES, not keepers —
  // drop any seed returning ~0 GDELT rows before a category ships. Seeds already
  // tracked by other beats (NEOM, Expo 2030, ...) de-dupe on the canonical
  // phrase in buildTopicMatchers: zero extra scan cost, full history on arrival.
  // Noise-collision exclusions (GDELT is multilingual + exact-phrase, lowercase):
  // "noon" (time word), "Tamara" / "Nana" (first names), "Tabby" (cats),
  // "Extra" / "Panda" / "Ninja" (common words), "Danube" (the river), "Half
  // Million" (the phrase), "Alat" (Indonesian: tool), "Humain" (French: human),
  // "SAMA" (Indonesian/Malay: same), "mada" / "Sarie" / "Lendo" (word noise),
  // "PIF" (bare acronym), "The Line" / "The Rig" (stop-word phrases),
  // "Lucid Motors" (volume is US-market and would mislead a KSA radar).
  {
    id: "ksa-giga",
    label: "KSA Giga-Projects",
    hidden: true, // radar data set, not a beat a user would pick
    seeds: [
      // already live via ksa-tourism (de-duped: free, full history)
      "NEOM", "Red Sea Global", "AlUla", "Diriyah", "Qiddiya",
      "New Murabba", "Mukaab", "Soudah Peaks", "Expo 2030",
      // net-new destinations & districts
      "OXAGON", "Trojena", "Sindalah", "Amaala", "King Salman Park",
      "Sports Boulevard", "Jeddah Central", "Rua Al Madinah", "Misk City",
      "King Abdullah Financial District", "Diriyah Square",
      // developers, capital & delivery
      "Roshn", "Public Investment Fund", "Vision 2030", "Saudi Aramco",
      "Jafurah", "Ceer", "DataVolt",
      // infrastructure & umbrella context (context only, never headline totals)
      "Riyadh Metro", "Saudi Landbridge", "Saudi construction", "Saudi real estate",
    ],
    blurb: "Saudi giga-projects, developers, PIF capital, and delivery-infrastructure coverage.",
  },
  {
    id: "ksa-banking",
    label: "KSA Banking & Fintech",
    hidden: true, // radar data set, not a beat a user would pick
    seeds: [
      // institutions & regulator
      "Saudi Central Bank", "Saudi National Bank", "Al Rajhi Bank", "Riyad Bank",
      "Alinma Bank", "Banque Saudi Fransi", "Arab National Bank", "Saudi Awwal Bank",
      // markets & capital
      "Tadawul", "Saudi Exchange", "Saudi IPO", "Saudi stock market", "Saudi sukuk",
      "Saudi wealth fund", "Sanabil", "Saudi venture capital", "Saudi startups",
      // fintech & digital banks
      "Saudi fintech", "Fintech Saudi", "stc pay", "STC Bank", "D360 Bank",
      // insurance
      "Tawuniya", "Bupa Arabia", "Saudi insurance",
      // umbrella context (context only, never headline totals)
      "Saudi banks", "Saudi banking", "Islamic finance", "Islamic banking",
      "Saudi riyal", "Saudi mortgage", "Saudi economy",
    ],
    blurb: "Saudi banks, Tadawul, fintech, insurance, and Islamic-finance coverage.",
  },
  {
    id: "ksa-retail",
    label: "KSA Retail & Consumer",
    hidden: true, // radar data set, not a beat a user would pick
    seeds: [
      // e-commerce & delivery
      "Saudi e-commerce", "Salla", "HungerStation", "Jahez", "Mrsool", "Floward",
      "Saudi food delivery", "quick commerce", "White Friday",
      // retailers & consumer brands
      "Cenomi", "Jarir", "Savola", "Almarai", "BinDawood", "Lulu Hypermarket",
      "Nahdi", "Al Othaim", "Tamimi Markets", "Alshaya",
      // lifestyle, fashion & entertainment
      "Saudi fashion", "Riyadh Fashion Week", "Saudi coffee", "Saudi beauty",
      "Saudi gaming", "Savvy Games",
      // umbrella context (context only, never headline totals)
      "Saudi retail", "Saudi consumer", "Saudi consumer spending", "Saudi malls",
      "Saudi advertising",
      // - Arabic seeds 2026-09-09 (retail radar). Lifted from the `ar` labels already
      //   curated on every signal card in the radar content.ts files, so the
      //   wording is Irfan-reviewed, not machine-translated. Enabled by the
      //   per-seed language support (tokenize.ts LANGS); lang literal "ar"
      //   VERIFIED against webngrams 2026-09-07 (ar = 3,576,344 rows/day).
      //   Excluded as common-word traps: sal-la (basket), jahez (ready),
      //   nusuk (rite) - single everyday nouns, the "noon"/"Panda" class.
      //   ZERO history until the backfill: do NOT wire these into radar cards
      //   yet or the momentum scores will read a fake surge.
      "ar:\u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", // Saudi e-commerce
      "ar:\u0647\u0646\u0642\u0631\u0633\u062a\u064a\u0634\u0646", // HungerStation
      "ar:\u0627\u0644\u062c\u0645\u0639\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621", // White Friday
      "ar:\u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0633\u0631\u064a\u0639\u0629", // Quick commerce
      "ar:\u062a\u0648\u0635\u064a\u0644 \u0627\u0644\u0637\u0639\u0627\u0645 \u0641\u064a \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", // Saudi food delivery
      "ar:\u0645\u062c\u0645\u0648\u0639\u0629 \u0627\u0644\u0634\u0627\u064a\u0639", // Alshaya Group
      "ar:\u0645\u0643\u062a\u0628\u0629 \u062c\u0631\u064a\u0631", // Jarir Bookstore
      "ar:\u0633\u064a\u0646\u0648\u0645\u064a", // Cenomi (Centers + Retail)
      "ar:\u0645\u062c\u0645\u0648\u0639\u0629 \u0635\u0627\u0641\u0648\u0644\u0627", // Savola Group
      "ar:\u0627\u0644\u0645\u0631\u0627\u0639\u064a", // Almarai
      "ar:\u0644\u0648\u0644\u0648 \u0647\u0627\u064a\u0628\u0631\u0645\u0627\u0631\u0643\u062a", // Lulu Retail
      "ar:\u0635\u064a\u062f\u0644\u064a\u0627\u062a \u0627\u0644\u0646\u0647\u062f\u064a", // Nahdi Medical
      "ar:\u0627\u0644\u0623\u0632\u064a\u0627\u0621 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", // Saudi fashion
      "ar:\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0645\u0648\u0636\u0629 \u0641\u064a \u0627\u0644\u0631\u064a\u0627\u0636", // Riyadh Fashion Week
      "ar:\u0627\u0644\u0642\u0647\u0648\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", // Saudi coffee
      "ar:\u0627\u0644\u062c\u0645\u0627\u0644 \u0648\u0627\u0644\u0639\u0637\u0648\u0631 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", // Saudi beauty
      "ar:\u0645\u062c\u0645\u0648\u0639\u0629 \u0633\u0627\u0641\u064a \u0644\u0644\u0623\u0644\u0639\u0627\u0628", // Savvy Games
      "ar:\u0642\u0637\u0627\u0639 \u0627\u0644\u0623\u0644\u0639\u0627\u0628 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a", // Saudi gaming
      "ar:\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062a\u0633\u0648\u0642 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", // Saudi malls
      "ar:\u0642\u0637\u0627\u0639 \u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a", // Saudi retail
      "ar:\u0627\u0644\u0645\u0633\u062a\u0647\u0644\u0643 \u0627\u0644\u0633\u0639\u0648\u062f\u064a", // Saudi consumer
      "ar:\u0627\u0644\u0625\u0646\u0641\u0627\u0642 \u0627\u0644\u0627\u0633\u062a\u0647\u0644\u0627\u0643\u064a \u0627\u0644\u0633\u0639\u0648\u062f\u064a", // Saudi consumer spending
      "ar:\u0633\u0648\u0642 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0633\u0639\u0648\u062f\u064a", // Saudi advertising
    ],
    blurb: "Saudi retail, e-commerce, consumer brands, and lifestyle-economy coverage.",
  },
  {
    id: "energy",
    label: "Energy & Utilities (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "power grid", "grid resilience", "energy storage", "battery storage", "nuclear power",
      "small modular reactor", "offshore wind", "solar capacity", "green hydrogen", "carbon capture",
      "energy prices", "electricity demand", "data center power", "transmission lines", "energy security",
      "LNG exports", "oil demand", "refining capacity", "utility regulation", "smart meter",
      "demand response", "virtual power plant", "heat pump", "district cooling", "desalination",
      "water scarcity", "critical minerals", "lithium supply", "rare earths", "power purchase agreement",
      "energy efficiency", "fusion energy", "geothermal energy", "biofuels", "grid interconnection",
    ],
    blurb: "Energy & Utilities coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "mobility",
    label: "Automotive & Mobility (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "electric vehicle sales", "EV charging", "charging network", "battery technology", "solid-state battery",
      "autonomous driving", "ride hailing", "micromobility", "fleet electrification", "automotive tariffs",
      "car production", "used car market", "connected car", "vehicle software", "over-the-air update",
      "hydrogen vehicle", "commercial vehicles", "urban mobility", "public transit", "high-speed rail",
      "sustainable aviation fuel", "drone delivery", "urban air mobility", "automotive recall", "dealership model",
      "vehicle safety", "car subscription", "telematics",
    ],
    blurb: "Automotive & Mobility coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "property",
    label: "Real Estate & Construction (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "commercial real estate", "office vacancy", "return to office", "housing affordability", "mortgage rates",
      "rental market", "build to rent", "student housing", "data center construction", "warehouse demand",
      "industrial real estate", "REIT performance", "construction costs", "construction labour", "modular construction",
      "green building", "building retrofit", "smart building", "facility management", "real estate investment",
      "property valuation", "co-working space", "hotel development", "mixed use development", "urban planning",
      "zoning reform", "infrastructure spending", "megaproject delays", "housing supply", "real estate tokenization",
      "property management software",
    ],
    blurb: "Real Estate & Construction coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "work",
    label: "Future of Work & HR (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "remote work", "hybrid work", "employee engagement", "talent shortage", "skills gap",
      "reskilling", "upskilling", "workforce planning", "gig economy", "freelance economy",
      "contingent workforce", "employee benefits", "workplace wellbeing", "four day week", "pay transparency",
      "gender pay gap", "workplace surveillance", "AI and jobs", "job displacement", "hiring freeze",
      "graduate hiring", "employer branding", "internal mobility", "performance management", "employee retention",
      "workplace culture", "global employment", "employer of record", "payroll compliance", "work visa",
    ],
    blurb: "Future of Work & HR coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "media",
    label: "Media, Sport & Entertainment (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "streaming wars", "subscriber growth", "advertising revenue", "podcast industry", "music streaming",
      "live events", "concert touring", "box office", "film production", "video game industry",
      "esports", "sports rights", "broadcast rights", "sports sponsorship", "athlete endorsement",
      "women's sport", "sports betting", "fan engagement", "media consolidation", "local news",
      "newsroom cuts", "paywall strategy", "publisher traffic", "AI and journalism", "content licensing",
      "short form video", "celebrity brand", "stadium development", "film incentives", "sports club ownership",
    ],
    blurb: "Media, Sport & Entertainment coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "industry",
    label: "Manufacturing & Supply Chain (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "reshoring", "nearshoring", "friendshoring", "factory investment", "industrial automation",
      "industrial robots", "digital twin", "predictive maintenance", "additive manufacturing", "3D printing",
      "semiconductor fab", "chip shortage", "export controls", "trade tariffs", "port congestion",
      "freight rates", "container shipping", "air cargo", "warehouse automation", "supplier diversification",
      "raw material costs", "procurement strategy", "lean manufacturing", "industrial safety", "manufacturing PMI",
      "industrial policy", "supply chain visibility", "logistics technology", "cold chain", "customs delays",
    ],
    blurb: "Manufacturing & Supply Chain coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "food",
    label: "Food, Drink & Agriculture (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "food security", "food inflation", "crop yields", "precision agriculture", "vertical farming",
      "alternative protein", "plant based food", "cultivated meat", "food waste", "sustainable packaging",
      "food safety", "supply chain traceability", "coffee prices", "cocoa prices", "wheat exports",
      "fertiliser prices", "irrigation technology", "livestock emissions", "regenerative agriculture", "agritech funding",
      "ghost kitchen", "restaurant industry", "quick service restaurant", "grocery inflation", "functional beverages",
      "energy drinks", "non alcoholic", "food labelling", "sugar tax", "dairy alternatives",
    ],
    blurb: "Food, Drink & Agriculture coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "education",
    label: "Education & EdTech (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "higher education", "university funding", "student debt", "international students", "online learning",
      "microcredentials", "vocational training", "corporate training", "professional certification", "AI in classrooms",
      "academic integrity", "teacher shortage", "school funding", "early childhood education", "STEM education",
      "digital literacy", "learning outcomes", "education technology", "tutoring market", "language learning",
      "university rankings", "research funding", "academic publishing", "apprenticeships", "adult education",
      "skills based hiring", "campus safety", "school technology",
    ],
    blurb: "Education & EdTech coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "policy",
    label: "Policy, Trade & Development (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "trade agreement", "tariff policy", "economic sanctions", "export ban", "industrial subsidies",
      "sovereign wealth fund", "foreign direct investment", "emerging markets", "debt restructuring", "development finance",
      "climate finance", "carbon market", "carbon tax", "ESG regulation", "antitrust enforcement",
      "data localisation", "digital tax", "privacy regulation", "competition policy", "interest rate decision",
      "inflation data", "currency devaluation", "remittances", "informal economy", "public private partnership",
      "sovereign debt", "aid budget", "trade deficit",
    ],
    blurb: "Policy, Trade & Development coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "web3",
    label: "Crypto & Web3 (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan: "go even wider"). HIDDEN on purpose: these accrue
    // nightly coverage at zero extra cost and join the 1,095-day backfill, but
    // 18 picker tabs would be unusable and a beat has to prove it is rich before
    // it earns a tab. Promote to visible by deleting `hidden` - keep the visible
    // count a multiple of 3 (the tab grid is 3 columns). ALL PROBE-PENDING.
    seeds: [
      "bitcoin ETF", "digital assets", "decentralized finance", "smart contract", "blockchain adoption",
      "crypto exchange", "crypto mining", "crypto treasury", "tokenized deposits", "real world assets",
      "layer 2", "staking rewards", "crypto venture funding", "stablecoin regulation", "NFT market",
      "web3 gaming", "crypto fraud", "proof of stake", "digital asset custody", "crypto ETF inflows",
    ],
    blurb: "Crypto & Web3 coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-es",
    label: "Spanish (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan). NOT a user-facing beat: a data-collection set so
    // Spanish coverage accrues nightly at ZERO extra cost and is
    // included in the 1,095-day backfill, ready for a future non-English radar.
    // Cross-cutting product beats only (AI, funding, cyber, digital economy,
    // marketing/PR, climate) - deliberately NOT country-specific, since the
    // country still has to live in the phrase. ALL PROBE-PENDING: drop any that
    // return zero once the first scans land, per the founders-beat pattern.
    seeds: [
      "es:inteligencia artificial", "es:capital de riesgo", "es:ronda de financiaci\u00f3n",  // AI, venture capital, funding round
      "es:ciberseguridad", "es:fuga de datos", "es:protecci\u00f3n de datos",  // cybersecurity, data leak, data protection
      "es:comercio electr\u00f3nico", "es:transformaci\u00f3n digital", "es:econom\u00eda digital",  // e-commerce, digital transformation, digital economy
      "es:banca digital", "es:criptomonedas", "es:veh\u00edculo el\u00e9ctrico",  // digital banking, cryptocurrencies, electric vehicle
      "es:energ\u00edas renovables", "es:cambio clim\u00e1tico", "es:salud digital",  // renewable energy, climate change, digital health
      "es:marketing digital", "es:relaciones p\u00fablicas", "es:suplantaci\u00f3n de identidad",  // digital marketing, public relations, identity theft / phishing
    ],
    blurb: "Spanish-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-fr",
    label: "French (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan). NOT a user-facing beat: a data-collection set so
    // French coverage accrues nightly at ZERO extra cost and is
    // included in the 1,095-day backfill, ready for a future non-English radar.
    // Cross-cutting product beats only (AI, funding, cyber, digital economy,
    // marketing/PR, climate) - deliberately NOT country-specific, since the
    // country still has to live in the phrase. ALL PROBE-PENDING: drop any that
    // return zero once the first scans land, per the founders-beat pattern.
    seeds: [
      "fr:intelligence artificielle", "fr:capital-risque", "fr:lev\u00e9e de fonds",  // AI, venture capital, funding round
      "fr:cybers\u00e9curit\u00e9", "fr:fuite de donn\u00e9es", "fr:protection des donn\u00e9es",  // cybersecurity, data leak, data protection
      "fr:commerce \u00e9lectronique", "fr:transformation num\u00e9rique", "fr:\u00e9conomie num\u00e9rique",  // e-commerce, digital transformation, digital economy
      "fr:souverainet\u00e9 num\u00e9rique", "fr:cryptomonnaie", "fr:voiture \u00e9lectrique",  // digital sovereignty, cryptocurrency, electric car
      "fr:\u00e9nergies renouvelables", "fr:changement climatique", "fr:sant\u00e9 num\u00e9rique",  // renewable energy, climate change, digital health
      "fr:marketing digital", "fr:relations publiques", "fr:hame\u00e7onnage",  // digital marketing, public relations, phishing
    ],
    blurb: "French-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-id",
    label: "Indonesian (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan). NOT a user-facing beat: a data-collection set so
    // Indonesian coverage accrues nightly at ZERO extra cost and is
    // included in the 1,095-day backfill, ready for a future non-English radar.
    // Cross-cutting product beats only (AI, funding, cyber, digital economy,
    // marketing/PR, climate) - deliberately NOT country-specific, since the
    // country still has to live in the phrase. ALL PROBE-PENDING: drop any that
    // return zero once the first scans land, per the founders-beat pattern.
    seeds: [
      "id:kecerdasan buatan", "id:modal ventura", "id:pendanaan startup",  // AI, venture capital, startup funding
      "id:keamanan siber", "id:kebocoran data", "id:perlindungan data",  // cybersecurity, data leak, data protection
      "id:perdagangan elektronik", "id:transformasi digital", "id:ekonomi digital",  // e-commerce, digital transformation, digital economy
      "id:dompet digital", "id:teknologi finansial", "id:kendaraan listrik",  // digital wallet, fintech, electric vehicle
      "id:energi terbarukan", "id:perubahan iklim", "id:kesehatan digital",  // renewable energy, climate change, digital health
      "id:pemasaran digital", "id:media sosial", "id:penipuan online",  // digital marketing, social media, online fraud
    ],
    blurb: "Indonesian-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-zh",
    label: "Simplified Chinese (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan). NOT a user-facing beat: a data-collection set so
    // Simplified Chinese coverage accrues nightly at ZERO extra cost and is
    // included in the 1,095-day backfill, ready for a future non-English radar.
    // Cross-cutting product beats only (AI, funding, cyber, digital economy,
    // marketing/PR, climate) - deliberately NOT country-specific, since the
    // country still has to live in the phrase. ALL PROBE-PENDING: drop any that
    // return zero once the first scans land, per the founders-beat pattern.
    seeds: [
      "zh:\u4eba\u5de5\u667a\u80fd", "zh:\u751f\u6210\u5f0f\u4eba\u5de5\u667a\u80fd", "zh:\u5927\u8bed\u8a00\u6a21\u578b",  // AI, generative AI, large language model
      "zh:\u98ce\u9669\u6295\u8d44", "zh:\u7f51\u7edc\u5b89\u5168", "zh:\u6570\u636e\u6cc4\u9732",  // venture capital, cybersecurity, data leak
      "zh:\u4e2a\u4eba\u4fe1\u606f\u4fdd\u62a4", "zh:\u7535\u5b50\u5546\u52a1", "zh:\u8de8\u5883\u7535\u5546",  // personal data protection, e-commerce, cross-border e-commerce
      "zh:\u6570\u5b57\u5316\u8f6c\u578b", "zh:\u6570\u5b57\u7ecf\u6d4e", "zh:\u79fb\u52a8\u652f\u4ed8",  // digital transformation, digital economy, mobile payment
      "zh:\u65b0\u80fd\u6e90\u6c7d\u8f66", "zh:\u6c14\u5019\u53d8\u5316", "zh:\u534a\u5bfc\u4f53",  // new-energy vehicle, climate change, semiconductor
      "zh:\u82af\u7247\u5236\u9020", "zh:\u6570\u5b57\u8425\u9500", "zh:\u52d2\u7d22\u8f6f\u4ef6",  // chip manufacturing, digital marketing, ransomware
    ],
    blurb: "Simplified Chinese-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-th",
    label: "Thai (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan). NOT a user-facing beat: a data-collection set so
    // Thai coverage accrues nightly at ZERO extra cost and is
    // included in the 1,095-day backfill, ready for a future non-English radar.
    // Cross-cutting product beats only (AI, funding, cyber, digital economy,
    // marketing/PR, climate) - deliberately NOT country-specific, since the
    // country still has to live in the phrase. ALL PROBE-PENDING: drop any that
    // return zero once the first scans land, per the founders-beat pattern.
    seeds: [
      "th:\u0e1b\u0e31\u0e0d\u0e0d\u0e32\u0e1b\u0e23\u0e30\u0e14\u0e34\u0e29\u0e10\u0e4c", "th:\u0e04\u0e27\u0e32\u0e21\u0e1b\u0e25\u0e2d\u0e14\u0e20\u0e31\u0e22\u0e44\u0e0b\u0e40\u0e1a\u0e2d\u0e23\u0e4c", "th:\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e23\u0e31\u0e48\u0e27\u0e44\u0e2b\u0e25",  // AI, cybersecurity, data leak
      "th:\u0e40\u0e28\u0e23\u0e29\u0e10\u0e01\u0e34\u0e08\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25", "th:\u0e1e\u0e32\u0e13\u0e34\u0e0a\u0e22\u0e4c\u0e2d\u0e34\u0e40\u0e25\u0e47\u0e01\u0e17\u0e23\u0e2d\u0e19\u0e34\u0e01\u0e2a\u0e4c", "th:\u0e23\u0e16\u0e22\u0e19\u0e15\u0e4c\u0e44\u0e1f\u0e1f\u0e49\u0e32",  // digital economy, e-commerce, electric vehicle
      "th:\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e41\u0e1b\u0e25\u0e07\u0e2a\u0e20\u0e32\u0e1e\u0e20\u0e39\u0e21\u0e34\u0e2d\u0e32\u0e01\u0e32\u0e28", "th:\u0e2a\u0e15\u0e32\u0e23\u0e4c\u0e17\u0e2d\u0e31\u0e1e", "th:\u0e01\u0e32\u0e23\u0e15\u0e25\u0e32\u0e14\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25",  // climate change, startup, digital marketing
      "th:\u0e1e\u0e25\u0e31\u0e07\u0e07\u0e32\u0e19\u0e2b\u0e21\u0e38\u0e19\u0e40\u0e27\u0e35\u0e22\u0e19", "th:\u0e40\u0e17\u0e04\u0e42\u0e19\u0e42\u0e25\u0e22\u0e35\u0e17\u0e32\u0e07\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19", "th:\u0e04\u0e27\u0e32\u0e21\u0e22\u0e31\u0e48\u0e07\u0e22\u0e37\u0e19",  // renewable energy, fintech, sustainability
    ],
    blurb: "Thai-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-vi",
    label: "Vietnamese (data only)",
    hidden: true,
    // New 2026-09-09 (Irfan). NOT a user-facing beat: a data-collection set so
    // Vietnamese coverage accrues nightly at ZERO extra cost and is
    // included in the 1,095-day backfill, ready for a future non-English radar.
    // Cross-cutting product beats only (AI, funding, cyber, digital economy,
    // marketing/PR, climate) - deliberately NOT country-specific, since the
    // country still has to live in the phrase. ALL PROBE-PENDING: drop any that
    // return zero once the first scans land, per the founders-beat pattern.
    seeds: [
      "vi:tr\u00ed tu\u1ec7 nh\u00e2n t\u1ea1o", "vi:an ninh m\u1ea1ng", "vi:r\u00f2 r\u1ec9 d\u1eef li\u1ec7u",  // AI, cybersecurity, data leak
      "vi:th\u01b0\u01a1ng m\u1ea1i \u0111i\u1ec7n t\u1eed", "vi:chuy\u1ec3n \u0111\u1ed5i s\u1ed1", "vi:kinh t\u1ebf s\u1ed1",  // e-commerce, digital transformation, digital economy
      "vi:thanh to\u00e1n \u0111i\u1ec7n t\u1eed", "vi:\u0111\u1ea7u t\u01b0 m\u1ea1o hi\u1ec3m", "vi:kh\u1edfi nghi\u1ec7p",  // electronic payment, venture capital, startup
      "vi:xe \u0111i\u1ec7n", "vi:n\u0103ng l\u01b0\u1ee3ng t\u00e1i t\u1ea1o", "vi:bi\u1ebfn \u0111\u1ed5i kh\u00ed h\u1eadu",  // electric vehicle, renewable energy, climate change
      "vi:ti\u1ebfp th\u1ecb s\u1ed1", "vi:c\u00f4ng ngh\u1ec7 t\u00e0i ch\u00ednh", "vi:b\u1ea3o m\u1eadt th\u00f4ng tin",  // digital marketing, fintech, information security
      "vi:trung t\u00e2m d\u1eef li\u1ec7u",  // data centre
    ],
    blurb: "Vietnamese-language coverage for future radars. Not offered in the beat picker.",
  },
];

export function beatById(id: BeatId): Beat {
  return BEATS.find((b) => b.id === id) ?? BEATS[0];
}
