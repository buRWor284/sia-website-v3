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

/** Seeds sampled in ONE user scan (mirrors MAX_SEEDS in scan.ts). Exported so
 *  public copy derives the number instead of hardcoding it: /tools/signaliq/about
 *  claimed "20 seeds per beat" for months while the real cap was 18 and a beat's
 *  pool had grown past 50. */
export const MAX_SEEDS_PER_SCAN = 18;

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

/** Highest score a topic can show when EVERY signal behind it is a too-small
 * sample (2026-09-10). 59 = top of "Early", so a single SEC filing plus a
 * Wikipedia blip can no longer be labelled a "Hot lead". */
export const THIN_EVIDENCE_MAX_SCORE = 59;

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
    id: "intl-pt",
    label: "Portuguese (data only)",
    hidden: true,
    // New 2026-09-10 (Irfan). Data-collection only, ~100 seeds on the same
    // 10-theme grid used for every language. PROBE-PENDING.
    seeds: [
      "pt:intelig\u00eancia artificial", "pt:modelo de linguagem", "pt:centro de dados", "pt:semicondutores",
      "pt:computa\u00e7\u00e3o em nuvem", "pt:ataque cibern\u00e9tico", "pt:vazamento de dados", "pt:roubo de identidade",
      "pt:autentica\u00e7\u00e3o biom\u00e9trica", "pt:capital de risco", "pt:rodada de investimento", "pt:abertura de capital",
      "pt:fus\u00f5es e aquisi\u00e7\u00f5es", "pt:startup unic\u00f3rnio", "pt:aceleradora de startups", "pt:avalia\u00e7\u00e3o de empresas",
      "pt:investimento estrangeiro", "pt:fundo soberano", "pt:demiss\u00f5es na tecnologia", "pt:com\u00e9rcio eletr\u00f4nico",
      "pt:com\u00e9rcio varejista", "pt:cadeia de suprimentos", "pt:\u00faltima milha", "pt:marca pr\u00f3pria",
      "pt:shopping center", "pt:consumo das fam\u00edlias", "pt:log\u00edstica", "pt:armaz\u00e9m automatizado",
      "pt:com\u00e9rcio transfronteiri\u00e7o", "pt:banco digital", "pt:pagamento instant\u00e2neo", "pt:criptomoedas",
      "pt:moeda digital", "pt:inclus\u00e3o financeira", "pt:seguros digitais", "pt:cr\u00e9dito imobili\u00e1rio",
      "pt:taxa de juros", "pt:lavagem de dinheiro", "pt:remessas", "pt:transi\u00e7\u00e3o energ\u00e9tica",
      "pt:energias renov\u00e1veis", "pt:energia solar", "pt:energia nuclear", "pt:armazenamento de energia",
      "pt:rede el\u00e9trica", "pt:hidrog\u00eanio verde", "pt:pre\u00e7o da energia", "pt:captura de carbono",
      "pt:escassez de \u00e1gua", "pt:ve\u00edculo el\u00e9trico", "pt:bateria el\u00e9trica", "pt:dire\u00e7\u00e3o aut\u00f4noma",
      "pt:transporte p\u00fablico", "pt:trem de alta velocidade", "pt:mobilidade urbana", "pt:companhias a\u00e9reas",
      "pt:turismo sustent\u00e1vel", "pt:setor hoteleiro", "pt:reserva de voos", "pt:sa\u00fade digital",
      "pt:telemedicina", "pt:ensaio cl\u00ednico", "pt:terapia g\u00e9nica", "pt:medicina de precis\u00e3o",
      "pt:envelhecimento saud\u00e1vel", "pt:sa\u00fade mental", "pt:ind\u00fastria farmac\u00eautica", "pt:dispositivos m\u00e9dicos",
      "pt:dermatologia", "pt:marketing digital", "pt:rela\u00e7\u00f5es p\u00fablicas", "pt:publicidade program\u00e1tica",
      "pt:meios de comunica\u00e7\u00e3o", "pt:economia dos criadores", "pt:desinforma\u00e7\u00e3o", "pt:jornalismo de dados",
      "pt:reputa\u00e7\u00e3o da marca", "pt:otimiza\u00e7\u00e3o de busca", "pt:conte\u00fado gerado por IA", "pt:trabalho remoto",
      "pt:mercado de trabalho", "pt:escassez de talentos", "pt:desigualdade salarial", "pt:sindicatos",
      "pt:forma\u00e7\u00e3o profissional", "pt:ensino superior", "pt:universidade p\u00fablica", "pt:seguran\u00e7a no trabalho",
      "pt:produtividade do trabalho", "pt:pol\u00edtica comercial", "pt:tarifas de importa\u00e7\u00e3o", "pt:regula\u00e7\u00e3o digital",
      "pt:prote\u00e7\u00e3o de dados", "pt:defesa da concorr\u00eancia", "pt:mudan\u00e7as clim\u00e1ticas", "pt:seguran\u00e7a alimentar",
      "pt:infla\u00e7\u00e3o", "pt:d\u00edvida p\u00fablica", "pt:habita\u00e7\u00e3o acess\u00edvel",
    ],
    blurb: "Portuguese-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-de",
    label: "German (data only)",
    hidden: true,
    // New 2026-09-10 (Irfan). Data-collection only, ~100 seeds on the same
    // 10-theme grid used for every language. PROBE-PENDING.
    seeds: [
      "de:k\u00fcnstliche Intelligenz", "de:gro\u00dfes Sprachmodell", "de:Rechenzentrum", "de:Halbleiter",
      "de:Cloud-Computing", "de:Cyberangriff", "de:Datenleck", "de:Erpressungssoftware",
      "de:Identit\u00e4tsdiebstahl", "de:biometrische Authentifizierung", "de:Wagniskapital", "de:Finanzierungsrunde",
      "de:B\u00f6rsengang", "de:Fusionen und \u00dcbernahmen", "de:Einhorn-Startup", "de:Startup-Accelerator",
      "de:Unternehmensbewertung", "de:ausl\u00e4ndische Investitionen", "de:Staatsfonds", "de:Stellenabbau in der Tech-Branche",
      "de:elektronischer Handel", "de:Einzelhandel", "de:Lieferkette", "de:letzte Meile",
      "de:Eigenmarke", "de:Einkaufszentrum", "de:privater Konsum", "de:Logistik",
      "de:automatisiertes Lager", "de:grenz\u00fcberschreitender Handel", "de:digitales Banking", "de:Echtzeitzahlung",
      "de:Kryptow\u00e4hrung", "de:digitaler Euro", "de:finanzielle Inklusion", "de:digitale Versicherung",
      "de:Immobilienkredit", "de:Leitzins", "de:Geldw\u00e4sche", "de:Auslands\u00fcberweisungen",
      "de:Energiewende", "de:erneuerbare Energien", "de:Solarenergie", "de:Kernkraft",
      "de:Energiespeicher", "de:Stromnetz", "de:gr\u00fcner Wasserstoff", "de:Strompreis",
      "de:CO2-Abscheidung", "de:Wasserknappheit", "de:Elektroauto", "de:Batteriezelle",
      "de:autonomes Fahren", "de:\u00f6ffentlicher Nahverkehr", "de:Hochgeschwindigkeitszug", "de:urbane Mobilit\u00e4t",
      "de:Fluggesellschaften", "de:nachhaltiger Tourismus", "de:Hotelbranche", "de:Flugbuchung",
      "de:digitale Gesundheit", "de:Telemedizin", "de:klinische Studie", "de:Gentherapie",
      "de:personalisierte Medizin", "de:gesundes Altern", "de:psychische Gesundheit", "de:Pharmaindustrie",
      "de:Medizintechnik", "de:Dermatologie", "de:digitales Marketing", "de:\u00d6ffentlichkeitsarbeit",
      "de:programmatische Werbung", "de:Nachrichtenmedien", "de:Kreativwirtschaft", "de:Desinformation",
      "de:Datenjournalismus", "de:Markenreputation", "de:Suchmaschinenoptimierung", "de:KI-generierte Inhalte",
      "de:Homeoffice", "de:Arbeitsmarkt", "de:Fachkr\u00e4ftemangel", "de:Lohnl\u00fccke",
      "de:Gewerkschaften", "de:berufliche Weiterbildung", "de:Hochschulbildung", "de:staatliche Universit\u00e4t",
      "de:Arbeitssicherheit", "de:Arbeitsproduktivit\u00e4t", "de:Handelspolitik", "de:Einfuhrz\u00f6lle",
      "de:Digitalregulierung", "de:Datenschutz", "de:Wettbewerbsrecht", "de:Klimawandel",
      "de:Ern\u00e4hrungssicherheit", "de:Inflation", "de:Staatsverschuldung", "de:bezahlbarer Wohnraum",
    ],
    blurb: "German-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-tr",
    label: "Turkish (data only)",
    hidden: true,
    // New 2026-09-10 (Irfan). Data-collection only, ~100 seeds on the same
    // 10-theme grid used for every language. PROBE-PENDING.
    seeds: [
      "tr:yapay zeka", "tr:b\u00fcy\u00fck dil modeli", "tr:veri merkezi", "tr:yar\u0131 iletken",
      "tr:bulut bili\u015fim", "tr:siber sald\u0131r\u0131", "tr:veri ihlali", "tr:fidye yaz\u0131l\u0131m\u0131",
      "tr:kimlik h\u0131rs\u0131zl\u0131\u011f\u0131", "tr:biyometrik do\u011frulama", "tr:risk sermayesi", "tr:yat\u0131r\u0131m turu",
      "tr:halka arz", "tr:birle\u015fme ve sat\u0131n alma", "tr:unicorn giri\u015fim", "tr:giri\u015fim h\u0131zland\u0131r\u0131c\u0131",
      "tr:\u015firket de\u011ferlemesi", "tr:do\u011frudan yabanc\u0131 yat\u0131r\u0131m", "tr:varl\u0131k fonu", "tr:teknoloji i\u015ften \u00e7\u0131karmalar\u0131",
      "tr:elektronik ticaret", "tr:perakende sat\u0131\u015f", "tr:tedarik zinciri", "tr:son kilometre teslimat",
      "tr:\u00f6zel markal\u0131 \u00fcr\u00fcn", "tr:al\u0131\u015fveri\u015f merkezi", "tr:hanehalk\u0131 t\u00fcketimi", "tr:lojistik",
      "tr:otomatik depo", "tr:s\u0131n\u0131r \u00f6tesi ticaret", "tr:dijital bankac\u0131l\u0131k", "tr:anl\u0131k \u00f6deme",
      "tr:kripto para", "tr:dijital para", "tr:finansal eri\u015fim", "tr:dijital sigortac\u0131l\u0131k",
      "tr:konut kredisi", "tr:faiz karar\u0131", "tr:kara para aklama", "tr:yurt d\u0131\u015f\u0131 transferi",
      "tr:enerji d\u00f6n\u00fc\u015f\u00fcm\u00fc", "tr:yenilenebilir enerji", "tr:g\u00fcne\u015f enerjisi", "tr:n\u00fckleer enerji",
      "tr:enerji depolama", "tr:elektrik \u015febekesi", "tr:ye\u015fil hidrojen", "tr:elektrik fiyat\u0131",
      "tr:karbon yakalama", "tr:su k\u0131tl\u0131\u011f\u0131", "tr:elektrikli ara\u00e7", "tr:batarya teknolojisi",
      "tr:otonom s\u00fcr\u00fc\u015f", "tr:toplu ta\u015f\u0131ma", "tr:y\u00fcksek h\u0131zl\u0131 tren", "tr:kentsel ula\u015f\u0131m",
      "tr:havayolu \u015firketleri", "tr:s\u00fcrd\u00fcr\u00fclebilir turizm", "tr:otelcilik sekt\u00f6r\u00fc", "tr:u\u00e7u\u015f rezervasyonu",
      "tr:dijital sa\u011fl\u0131k", "tr:telet\u0131p", "tr:klinik deney", "tr:gen tedavisi",
      "tr:ki\u015fiselle\u015ftirilmi\u015f t\u0131p", "tr:sa\u011fl\u0131kl\u0131 ya\u015flanma", "tr:ruh sa\u011fl\u0131\u011f\u0131", "tr:ila\u00e7 sekt\u00f6r\u00fc",
      "tr:t\u0131bbi cihaz", "tr:dermatoloji", "tr:dijital pazarlama", "tr:halkla ili\u015fkiler",
      "tr:programatik reklam", "tr:haber medyas\u0131", "tr:i\u00e7erik \u00fcreticileri", "tr:dezenformasyon",
      "tr:veri gazetecili\u011fi", "tr:marka itibar\u0131", "tr:arama motoru optimizasyonu", "tr:yapay zeka i\u00e7eri\u011fi",
      "tr:uzaktan \u00e7al\u0131\u015fma", "tr:i\u015fg\u00fcc\u00fc piyasas\u0131", "tr:nitelikli eleman a\u00e7\u0131\u011f\u0131", "tr:\u00fccret fark\u0131",
      "tr:sendikalar", "tr:mesleki e\u011fitim", "tr:y\u00fcksek\u00f6\u011fretim", "tr:devlet \u00fcniversitesi",
      "tr:i\u015f g\u00fcvenli\u011fi", "tr:i\u015fg\u00fcc\u00fc verimlili\u011fi", "tr:ticaret politikas\u0131", "tr:ithalat vergisi",
      "tr:dijital d\u00fczenleme", "tr:ki\u015fisel verilerin korunmas\u0131", "tr:rekabet kurumu", "tr:iklim de\u011fi\u015fikli\u011fi",
      "tr:g\u0131da g\u00fcvenli\u011fi", "tr:enflasyon", "tr:kamu borcu", "tr:uygun fiyatl\u0131 konut",
    ],
    blurb: "Turkish-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-ja",
    label: "Japanese (data only)",
    hidden: true,
    // New 2026-09-10. ~100 seeds on the shared 10-theme grid. PROBE-PENDING.
    seeds: [
      "ja:\u4eba\u5de5\u77e5\u80fd", "ja:\u5927\u898f\u6a21\u8a00\u8a9e\u30e2\u30c7\u30eb", "ja:\u30c7\u30fc\u30bf\u30bb\u30f3\u30bf\u30fc", "ja:\u534a\u5c0e\u4f53",
      "ja:\u30af\u30e9\u30a6\u30c9\u30b3\u30f3\u30d4\u30e5\u30fc\u30c6\u30a3\u30f3\u30b0", "ja:\u30b5\u30a4\u30d0\u30fc\u653b\u6483", "ja:\u60c5\u5831\u6f0f\u3048\u3044", "ja:\u30e9\u30f3\u30b5\u30e0\u30a6\u30a7\u30a2",
      "ja:\u306a\u308a\u3059\u307e\u3057\u88ab\u5bb3", "ja:\u751f\u4f53\u8a8d\u8a3c", "ja:\u30d9\u30f3\u30c1\u30e3\u30fc\u30ad\u30e3\u30d4\u30bf\u30eb", "ja:\u8cc7\u91d1\u8abf\u9054",
      "ja:\u65b0\u898f\u682a\u5f0f\u516c\u958b", "ja:\u4f01\u696d\u8cb7\u53ce", "ja:\u30e6\u30cb\u30b3\u30fc\u30f3\u4f01\u696d", "ja:\u30b9\u30bf\u30fc\u30c8\u30a2\u30c3\u30d7\u652f\u63f4",
      "ja:\u4f01\u696d\u4fa1\u5024\u8a55\u4fa1", "ja:\u5bfe\u5185\u76f4\u63a5\u6295\u8cc7", "ja:\u653f\u5e9c\u7cfb\u30d5\u30a1\u30f3\u30c9", "ja:\u4eba\u54e1\u524a\u6e1b",
      "ja:\u96fb\u5b50\u5546\u53d6\u5f15", "ja:\u5c0f\u58f2\u696d\u754c", "ja:\u4f9b\u7d66\u7db2", "ja:\u30e9\u30b9\u30c8\u30ef\u30f3\u30de\u30a4\u30eb",
      "ja:\u30d7\u30e9\u30a4\u30d9\u30fc\u30c8\u30d6\u30e9\u30f3\u30c9", "ja:\u5546\u696d\u65bd\u8a2d", "ja:\u500b\u4eba\u6d88\u8cbb", "ja:\u7269\u6d41\u696d\u754c",
      "ja:\u81ea\u52d5\u5316\u5009\u5eab", "ja:\u8d8a\u5883\u96fb\u5b50\u5546\u53d6\u5f15", "ja:\u30c7\u30b8\u30bf\u30eb\u9280\u884c", "ja:\u5373\u6642\u6c7a\u6e08",
      "ja:\u6697\u53f7\u8cc7\u7523", "ja:\u4e2d\u592e\u9280\u884c\u30c7\u30b8\u30bf\u30eb\u901a\u8ca8", "ja:\u91d1\u878d\u5305\u6442", "ja:\u4fdd\u967a\u30c6\u30c3\u30af",
      "ja:\u4f4f\u5b85\u30ed\u30fc\u30f3", "ja:\u653f\u7b56\u91d1\u5229", "ja:\u8cc7\u91d1\u6d17\u6d44", "ja:\u6d77\u5916\u9001\u91d1",
      "ja:\u30a8\u30cd\u30eb\u30ae\u30fc\u8ee2\u63db", "ja:\u518d\u751f\u53ef\u80fd\u30a8\u30cd\u30eb\u30ae\u30fc", "ja:\u592a\u967d\u5149\u767a\u96fb", "ja:\u539f\u5b50\u529b\u767a\u96fb",
      "ja:\u84c4\u96fb\u6c60", "ja:\u9001\u96fb\u7db2", "ja:\u30b0\u30ea\u30fc\u30f3\u6c34\u7d20", "ja:\u96fb\u6c17\u6599\u91d1",
      "ja:\u4e8c\u9178\u5316\u70ad\u7d20\u56de\u53ce", "ja:\u6c34\u4e0d\u8db3", "ja:\u96fb\u6c17\u81ea\u52d5\u8eca", "ja:\u8eca\u8f09\u96fb\u6c60",
      "ja:\u81ea\u52d5\u904b\u8ee2", "ja:\u516c\u5171\u4ea4\u901a\u6a5f\u95a2", "ja:\u9ad8\u901f\u9244\u9053", "ja:\u90fd\u5e02\u4ea4\u901a",
      "ja:\u822a\u7a7a\u4f1a\u793e", "ja:\u6301\u7d9a\u53ef\u80fd\u306a\u89b3\u5149", "ja:\u30db\u30c6\u30eb\u696d\u754c", "ja:\u822a\u7a7a\u5238\u4e88\u7d04",
      "ja:\u30c7\u30b8\u30bf\u30eb\u30d8\u30eb\u30b9", "ja:\u9060\u9694\u533b\u7642", "ja:\u81e8\u5e8a\u8a66\u9a13", "ja:\u907a\u4f1d\u5b50\u6cbb\u7642",
      "ja:\u7cbe\u5bc6\u533b\u7642", "ja:\u5065\u5eb7\u5bff\u547d", "ja:\u30e1\u30f3\u30bf\u30eb\u30d8\u30eb\u30b9", "ja:\u88fd\u85ac\u696d\u754c",
      "ja:\u533b\u7642\u6a5f\u5668", "ja:\u76ae\u819a\u79d1", "ja:\u30c7\u30b8\u30bf\u30eb\u30de\u30fc\u30b1\u30c6\u30a3\u30f3\u30b0", "ja:\u5e83\u5831\u6d3b\u52d5",
      "ja:\u30d7\u30ed\u30b0\u30e9\u30de\u30c6\u30a3\u30c3\u30af\u5e83\u544a", "ja:\u5831\u9053\u6a5f\u95a2", "ja:\u30af\u30ea\u30a8\u30a4\u30bf\u30fc\u30a8\u30b3\u30ce\u30df\u30fc", "ja:\u507d\u60c5\u5831",
      "ja:\u30c7\u30fc\u30bf\u30b8\u30e3\u30fc\u30ca\u30ea\u30ba\u30e0", "ja:\u30d6\u30e9\u30f3\u30c9\u8a55\u4fa1", "ja:\u691c\u7d22\u30a8\u30f3\u30b8\u30f3\u6700\u9069\u5316", "ja:\u751f\u6210AI\u30b3\u30f3\u30c6\u30f3\u30c4",
      "ja:\u5728\u5b85\u52e4\u52d9", "ja:\u52b4\u50cd\u5e02\u5834", "ja:\u4eba\u624b\u4e0d\u8db3", "ja:\u8cc3\u91d1\u683c\u5dee",
      "ja:\u52b4\u50cd\u7d44\u5408", "ja:\u8077\u696d\u8a13\u7df4", "ja:\u9ad8\u7b49\u6559\u80b2", "ja:\u56fd\u7acb\u5927\u5b66",
      "ja:\u52b4\u50cd\u5b89\u5168", "ja:\u52b4\u50cd\u751f\u7523\u6027", "ja:\u901a\u5546\u653f\u7b56", "ja:\u8f38\u5165\u95a2\u7a0e",
      "ja:\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u898f\u5236", "ja:\u500b\u4eba\u60c5\u5831\u4fdd\u8b77", "ja:\u72ec\u5360\u7981\u6b62\u6cd5", "ja:\u6c17\u5019\u5909\u52d5",
      "ja:\u98df\u6599\u5b89\u5168\u4fdd\u969c", "ja:\u7269\u4fa1\u4e0a\u6607", "ja:\u653f\u5e9c\u50b5\u52d9", "ja:\u4f4f\u5b85\u4fa1\u683c",
    ],
    blurb: "Japanese-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-ko",
    label: "Korean (data only)",
    hidden: true,
    // New 2026-09-10. ~100 seeds on the shared 10-theme grid. PROBE-PENDING.
    seeds: [
      "ko:\uc778\uacf5\uc9c0\ub2a5", "ko:\uac70\ub300 \uc5b8\uc5b4 \ubaa8\ub378", "ko:\ub370\uc774\ud130 \uc13c\ud130", "ko:\ubc18\ub3c4\uccb4",
      "ko:\ud074\ub77c\uc6b0\ub4dc \ucef4\ud4e8\ud305", "ko:\uc0ac\uc774\ubc84 \uacf5\uaca9", "ko:\ub370\uc774\ud130 \uc720\ucd9c", "ko:\ub79c\uc12c\uc6e8\uc5b4",
      "ko:\uba85\uc758 \ub3c4\uc6a9", "ko:\uc0dd\uccb4 \uc778\uc99d", "ko:\ubca4\ucc98 \uce90\ud53c\ud138", "ko:\ud22c\uc790 \uc720\uce58",
      "ko:\uae30\uc5c5 \uacf5\uac1c", "ko:\uc778\uc218 \ud569\ubcd1", "ko:\uc720\ub2c8\ucf58 \uae30\uc5c5", "ko:\ucc3d\uc5c5 \uc9c0\uc6d0",
      "ko:\uae30\uc5c5 \uac00\uce58", "ko:\uc678\uad6d\uc778 \ud22c\uc790", "ko:\uad6d\ubd80 \ud380\ub4dc", "ko:\uc778\ub825 \uac10\ucd95",
      "ko:\uc804\uc790 \uc0c1\uac70\ub798", "ko:\uc18c\ub9e4 \uc720\ud1b5", "ko:\uacf5\uae09\ub9dd", "ko:\ub9c8\uc9c0\ub9c9 \ubc30\uc1a1",
      "ko:\uc790\uccb4 \ube0c\ub79c\ub4dc", "ko:\ubcf5\ud569 \uc1fc\ud551\ubab0", "ko:\ubbfc\uac04 \uc18c\ube44", "ko:\ubb3c\ub958 \uc0b0\uc5c5",
      "ko:\uc790\ub3d9\ud654 \ubb3c\ub958\ucc3d\uace0", "ko:\ud574\uc678 \uc9c1\uad6c", "ko:\ub514\uc9c0\ud138 \uc740\ud589", "ko:\uc2e4\uc2dc\uac04 \uacb0\uc81c",
      "ko:\uac00\uc0c1 \uc790\uc0b0", "ko:\uc911\uc559\uc740\ud589 \ub514\uc9c0\ud138\ud654\ud3d0", "ko:\uae08\uc735 \ud3ec\uc6a9", "ko:\ub514\uc9c0\ud138 \ubcf4\ud5d8",
      "ko:\uc8fc\ud0dd \ub2f4\ubcf4 \ub300\ucd9c", "ko:\uae30\uc900 \uae08\ub9ac", "ko:\uc790\uae08 \uc138\ud0c1", "ko:\ud574\uc678 \uc1a1\uae08",
      "ko:\uc5d0\ub108\uc9c0 \uc804\ud658", "ko:\uc7ac\uc0dd \uc5d0\ub108\uc9c0", "ko:\ud0dc\uc591\uad11 \ubc1c\uc804", "ko:\uc6d0\uc790\ub825 \ubc1c\uc804",
      "ko:\uc5d0\ub108\uc9c0 \uc800\uc7a5", "ko:\uc804\ub825\ub9dd", "ko:\uadf8\ub9b0 \uc218\uc18c", "ko:\uc804\uae30 \uc694\uae08",
      "ko:\ud0c4\uc18c \ud3ec\uc9d1", "ko:\ubb3c \ubd80\uc871", "ko:\uc804\uae30\ucc28", "ko:\ubc30\ud130\ub9ac \uc0b0\uc5c5",
      "ko:\uc790\uc728 \uc8fc\ud589", "ko:\ub300\uc911 \uad50\ud1b5", "ko:\uace0\uc18d \ucca0\ub3c4", "ko:\ub3c4\uc2dc \uad50\ud1b5",
      "ko:\ud56d\uacf5\uc0ac", "ko:\uc9c0\uc18d \uac00\ub2a5\ud55c \uad00\uad11", "ko:\ud638\ud154 \uc0b0\uc5c5", "ko:\ud56d\uacf5\uad8c \uc608\uc57d",
      "ko:\ub514\uc9c0\ud138 \ud5ec\uc2a4\ucf00\uc5b4", "ko:\uc6d0\uaca9 \uc758\ub8cc", "ko:\uc784\uc0c1 \uc2dc\ud5d8", "ko:\uc720\uc804\uc790 \uce58\ub8cc",
      "ko:\uc815\ubc00 \uc758\ub8cc", "ko:\uac74\uac15 \uc218\uba85", "ko:\uc815\uc2e0 \uac74\uac15", "ko:\uc81c\uc57d \uc0b0\uc5c5",
      "ko:\uc758\ub8cc \uae30\uae30", "ko:\ud53c\ubd80\uacfc", "ko:\ub514\uc9c0\ud138 \ub9c8\ucf00\ud305", "ko:\ud64d\ubcf4 \ud65c\ub3d9",
      "ko:\ud504\ub85c\uadf8\ub798\ub9e4\ud2f1 \uad11\uace0", "ko:\uc5b8\ub860\uc0ac", "ko:\ud06c\ub9ac\uc5d0\uc774\ud130 \uc774\ucf54\ub178\ubbf8", "ko:\ud5c8\uc704 \uc815\ubcf4",
      "ko:\ub370\uc774\ud130 \uc800\ub110\ub9ac\uc998", "ko:\ube0c\ub79c\ub4dc \ud3c9\ud310", "ko:\uac80\uc0c9 \uc5d4\uc9c4 \ucd5c\uc801\ud654", "ko:\uc0dd\uc131\ud615 AI \ucf58\ud150\uce20",
      "ko:\uc7ac\ud0dd \uadfc\ubb34", "ko:\ub178\ub3d9 \uc2dc\uc7a5", "ko:\uc778\ub825 \ubd80\uc871", "ko:\uc784\uae08 \uaca9\ucc28",
      "ko:\ub178\ub3d9 \uc870\ud569", "ko:\uc9c1\uc5c5 \ud6c8\ub828", "ko:\uace0\ub4f1 \uad50\uc721", "ko:\uad6d\ub9bd \ub300\ud559",
      "ko:\uc0b0\uc5c5 \uc548\uc804", "ko:\ub178\ub3d9 \uc0dd\uc0b0\uc131", "ko:\ud1b5\uc0c1 \uc815\ucc45", "ko:\uc218\uc785 \uad00\uc138",
      "ko:\ud50c\ub7ab\ud3fc \uaddc\uc81c", "ko:\uac1c\uc778\uc815\ubcf4 \ubcf4\ud638", "ko:\uacf5\uc815 \uac70\ub798", "ko:\uae30\ud6c4 \ubcc0\ud654",
      "ko:\uc2dd\ub7c9 \uc548\ubcf4", "ko:\ubb3c\uac00 \uc0c1\uc2b9", "ko:\uad6d\uac00 \ubd80\ucc44", "ko:\uc8fc\ud0dd \uacf5\uae09",
    ],
    blurb: "Korean-language coverage for future radars. Not offered in the beat picker.",
  },
  {
    id: "intl-ar",
    label: "Arabic business (data only)",
    hidden: true,
    // New 2026-09-10. The 50 Arabic seeds on the KSA radar beats are SIGNAL
    // names (NEOM, Jarir, Hajj); these are the cross-cutting business vocabulary
    // on the same 10-theme grid as every other language. Arabic is PROVEN live
    // (2026-09-09: ar:\u0627\u0644\u062d\u062c 48 articles). PROBE-PENDING.
    seeds: [
      "ar:\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a", "ar:\u0646\u0645\u0648\u0630\u062c \u0644\u063a\u0648\u064a \u0643\u0628\u064a\u0631", "ar:\u0645\u0631\u0643\u0632 \u0628\u064a\u0627\u0646\u0627\u062a", "ar:\u0623\u0634\u0628\u0627\u0647 \u0627\u0644\u0645\u0648\u0635\u0644\u0627\u062a",
      "ar:\u0627\u0644\u062d\u0648\u0633\u0628\u0629 \u0627\u0644\u0633\u062d\u0627\u0628\u064a\u0629", "ar:\u0647\u062c\u0648\u0645 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a", "ar:\u062a\u0633\u0631\u064a\u0628 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", "ar:\u0628\u0631\u0627\u0645\u062c \u0627\u0644\u0641\u062f\u064a\u0629",
      "ar:\u0633\u0631\u0642\u0629 \u0627\u0644\u0647\u0648\u064a\u0629", "ar:\u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u0627\u0644\u0628\u064a\u0648\u0645\u062a\u0631\u064a\u0629", "ar:\u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644 \u0627\u0644\u062c\u0631\u064a\u0621", "ar:\u062c\u0648\u0644\u0629 \u062a\u0645\u0648\u064a\u0644\u064a\u0629",
      "ar:\u0627\u0644\u0637\u0631\u062d \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u0623\u0648\u0644\u064a", "ar:\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0627\u0646\u062f\u0645\u0627\u062c \u0648\u0627\u0644\u0627\u0633\u062a\u062d\u0648\u0627\u0630", "ar:\u0634\u0631\u0643\u0629 \u0646\u0627\u0634\u0626\u0629", "ar:\u062d\u0627\u0636\u0646\u0629 \u0623\u0639\u0645\u0627\u0644",
      "ar:\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0634\u0631\u0643\u0627\u062a", "ar:\u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0627\u0644\u0623\u062c\u0646\u0628\u064a", "ar:\u0635\u0646\u062f\u0648\u0642 \u0633\u064a\u0627\u062f\u064a", "ar:\u062a\u0633\u0631\u064a\u062d \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646",
      "ar:\u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629", "ar:\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u062a\u062c\u0632\u0626\u0629", "ar:\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062a\u0648\u0631\u064a\u062f", "ar:\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0627\u0644\u0633\u0631\u064a\u0639",
      "ar:\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062e\u0627\u0635\u0629", "ar:\u0645\u0631\u0643\u0632 \u062a\u0633\u0648\u0642", "ar:\u0627\u0644\u0625\u0646\u0641\u0627\u0642 \u0627\u0644\u0627\u0633\u062a\u0647\u0644\u0627\u0643\u064a", "ar:\u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0644\u0648\u062c\u0633\u062a\u064a\u0629",
      "ar:\u0645\u0633\u062a\u0648\u062f\u0639 \u0622\u0644\u064a", "ar:\u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0639\u0628\u0631 \u0627\u0644\u062d\u062f\u0648\u062f", "ar:\u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0645\u0635\u0631\u0641\u064a\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629", "ar:\u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0627\u0644\u0641\u0648\u0631\u064a\u0629",
      "ar:\u0627\u0644\u0639\u0645\u0644\u0627\u062a \u0627\u0644\u0645\u0634\u0641\u0631\u0629", "ar:\u0627\u0644\u0639\u0645\u0644\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629", "ar:\u0627\u0644\u0634\u0645\u0648\u0644 \u0627\u0644\u0645\u0627\u0644\u064a", "ar:\u0627\u0644\u062a\u0623\u0645\u064a\u0646 \u0627\u0644\u0631\u0642\u0645\u064a",
      "ar:\u0627\u0644\u062a\u0645\u0648\u064a\u0644 \u0627\u0644\u0639\u0642\u0627\u0631\u064a", "ar:\u0633\u0639\u0631 \u0627\u0644\u0641\u0627\u0626\u062f\u0629", "ar:\u063a\u0633\u0644 \u0627\u0644\u0623\u0645\u0648\u0627\u0644", "ar:\u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0627\u0644\u064a\u0629",
      "ar:\u062a\u062d\u0648\u0644 \u0627\u0644\u0637\u0627\u0642\u0629", "ar:\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062a\u062c\u062f\u062f\u0629", "ar:\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629", "ar:\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0646\u0648\u0648\u064a\u0629",
      "ar:\u062a\u062e\u0632\u064a\u0646 \u0627\u0644\u0637\u0627\u0642\u0629", "ar:\u0634\u0628\u0643\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621", "ar:\u0627\u0644\u0647\u064a\u062f\u0631\u0648\u062c\u064a\u0646 \u0627\u0644\u0623\u062e\u0636\u0631", "ar:\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621",
      "ar:\u0627\u062d\u062a\u062c\u0627\u0632 \u0627\u0644\u0643\u0631\u0628\u0648\u0646", "ar:\u0646\u062f\u0631\u0629 \u0627\u0644\u0645\u064a\u0627\u0647", "ar:\u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629", "ar:\u0628\u0637\u0627\u0631\u064a\u0627\u062a \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a",
      "ar:\u0627\u0644\u0642\u064a\u0627\u062f\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629", "ar:\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0639\u0627\u0645", "ar:\u0627\u0644\u0642\u0637\u0627\u0631 \u0627\u0644\u0633\u0631\u064a\u0639", "ar:\u0627\u0644\u062a\u0646\u0642\u0644 \u0627\u0644\u062d\u0636\u0631\u064a",
      "ar:\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0637\u064a\u0631\u0627\u0646", "ar:\u0627\u0644\u0633\u064a\u0627\u062d\u0629 \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645\u0629", "ar:\u0642\u0637\u0627\u0639 \u0627\u0644\u0641\u0646\u0627\u062f\u0642", "ar:\u062d\u062c\u0632 \u0627\u0644\u0631\u062d\u0644\u0627\u062a",
      "ar:\u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629", "ar:\u0627\u0644\u0637\u0628 \u0639\u0646 \u0628\u0639\u062f", "ar:\u0627\u0644\u062a\u062c\u0627\u0631\u0628 \u0627\u0644\u0633\u0631\u064a\u0631\u064a\u0629", "ar:\u0627\u0644\u0639\u0644\u0627\u062c \u0627\u0644\u062c\u064a\u0646\u064a",
      "ar:\u0627\u0644\u0637\u0628 \u0627\u0644\u062f\u0642\u064a\u0642", "ar:\u0627\u0644\u0634\u064a\u062e\u0648\u062e\u0629 \u0627\u0644\u0635\u062d\u064a\u0629", "ar:\u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0646\u0641\u0633\u064a\u0629", "ar:\u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u0623\u062f\u0648\u064a\u0629",
      "ar:\u0627\u0644\u0623\u062c\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064a\u0629", "ar:\u0627\u0644\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u062c\u0644\u062f\u064a\u0629", "ar:\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0631\u0642\u0645\u064a", "ar:\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0627\u0645\u0629",
      "ar:\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0642\u0645\u064a\u0629", "ar:\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0645", "ar:\u0627\u0642\u062a\u0635\u0627\u062f \u0627\u0644\u0645\u062d\u062a\u0648\u0649", "ar:\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0636\u0644\u0644\u0629",
      "ar:\u0635\u062d\u0627\u0641\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", "ar:\u0633\u0645\u0639\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629", "ar:\u062a\u062d\u0633\u064a\u0646 \u0645\u062d\u0631\u0643\u0627\u062a \u0627\u0644\u0628\u062d\u062b", "ar:\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",
      "ar:\u0627\u0644\u0639\u0645\u0644 \u0639\u0646 \u0628\u0639\u062f", "ar:\u0633\u0648\u0642 \u0627\u0644\u0639\u0645\u0644", "ar:\u0646\u0642\u0635 \u0627\u0644\u0645\u0648\u0627\u0647\u0628", "ar:\u0641\u062c\u0648\u0629 \u0627\u0644\u0623\u062c\u0648\u0631",
      "ar:\u0627\u0644\u062a\u062f\u0631\u064a\u0628 \u0627\u0644\u0645\u0647\u0646\u064a", "ar:\u0627\u0644\u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u0639\u0627\u0644\u064a", "ar:\u0627\u0644\u062c\u0627\u0645\u0639\u0627\u062a \u0627\u0644\u062d\u0643\u0648\u0645\u064a\u0629", "ar:\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0645\u0647\u0646\u064a\u0629",
      "ar:\u0625\u0646\u062a\u0627\u062c\u064a\u0629 \u0627\u0644\u0639\u0645\u0644", "ar:\u062a\u0648\u0637\u064a\u0646 \u0627\u0644\u0648\u0638\u0627\u0626\u0641", "ar:\u0627\u0644\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629", "ar:\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062c\u0645\u0631\u0643\u064a\u0629",
      "ar:\u062a\u0646\u0638\u064a\u0645 \u0627\u0644\u0645\u0646\u0635\u0627\u062a", "ar:\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", "ar:\u0645\u0643\u0627\u0641\u062d\u0629 \u0627\u0644\u0627\u062d\u062a\u0643\u0627\u0631", "ar:\u062a\u063a\u064a\u0631 \u0627\u0644\u0645\u0646\u0627\u062e",
      "ar:\u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u063a\u0630\u0627\u0626\u064a", "ar:\u0627\u0644\u062a\u0636\u062e\u0645", "ar:\u0627\u0644\u062f\u064a\u0646 \u0627\u0644\u0639\u0627\u0645", "ar:\u0627\u0644\u0625\u0633\u0643\u0627\u0646 \u0627\u0644\u0645\u064a\u0633\u0631",
    ],
    blurb: "Arabic-language business coverage for future radars. Not offered in the beat picker.",
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
      // - widened 2026-09-10 to ~100 (Irfan: go wide, prune on evidence).
      //   Same 10-theme grid in every language so gaps are visible. PROBE-PENDING.
      "es:modelo de lenguaje", "es:centro de datos", "es:semiconductores", "es:computaci\u00f3n en la nube",
      "es:ciberataque", "es:filtraci\u00f3n de datos", "es:ransomware", "es:robo de identidad",
      "es:autenticaci\u00f3n biom\u00e9trica", "es:salida a bolsa", "es:fusiones y adquisiciones", "es:startup unicornio",
      "es:aceleradora de startups", "es:valoraci\u00f3n de empresas", "es:inversi\u00f3n extranjera", "es:fondo soberano",
      "es:despidos tecnol\u00f3gicos", "es:venta minorista", "es:cadena de suministro", "es:\u00faltima milla",
      "es:marca blanca", "es:centro comercial", "es:consumo privado", "es:log\u00edstica",
      "es:almac\u00e9n automatizado", "es:comercio transfronterizo", "es:pagos instant\u00e1neos", "es:moneda digital",
      "es:inclusi\u00f3n financiera", "es:seguros digitales", "es:hipotecas", "es:tipos de inter\u00e9s",
      "es:blanqueo de capitales", "es:remesas", "es:transici\u00f3n energ\u00e9tica", "es:energ\u00eda solar",
      "es:energ\u00eda nuclear", "es:almacenamiento de energ\u00eda", "es:red el\u00e9ctrica", "es:hidr\u00f3geno verde",
      "es:precio de la electricidad", "es:captura de carbono", "es:escasez de agua", "es:bater\u00eda el\u00e9ctrica",
      "es:conducci\u00f3n aut\u00f3noma", "es:transporte p\u00fablico", "es:tren de alta velocidad", "es:movilidad urbana",
      "es:aerol\u00edneas", "es:turismo sostenible", "es:sector hotelero", "es:reserva de vuelos",
      "es:telemedicina", "es:ensayo cl\u00ednico", "es:terapia g\u00e9nica", "es:medicina personalizada",
      "es:envejecimiento saludable", "es:salud mental", "es:industria farmac\u00e9utica", "es:dispositivos m\u00e9dicos",
      "es:dermatolog\u00eda", "es:publicidad program\u00e1tica", "es:medios de comunicaci\u00f3n", "es:econom\u00eda de creadores",
      "es:desinformaci\u00f3n", "es:periodismo de datos", "es:reputaci\u00f3n de marca", "es:posicionamiento web",
      "es:contenido generado por IA", "es:teletrabajo", "es:mercado laboral", "es:escasez de talento",
      "es:brecha salarial", "es:sindicatos", "es:formaci\u00f3n profesional", "es:educaci\u00f3n superior",
      "es:universidad p\u00fablica", "es:seguridad laboral", "es:productividad laboral", "es:pol\u00edtica comercial",
      "es:aranceles", "es:regulaci\u00f3n digital", "es:competencia desleal", "es:seguridad alimentaria",
      "es:inflaci\u00f3n", "es:deuda p\u00fablica", "es:vivienda asequible",
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
      // - widened 2026-09-10 to ~100 (Irfan: go wide, prune on evidence).
      //   Same 10-theme grid in every language so gaps are visible. PROBE-PENDING.
      "fr:mod\u00e8le de langage", "fr:centre de donn\u00e9es", "fr:semi-conducteurs", "fr:informatique en nuage",
      "fr:cyberattaque", "fr:ran\u00e7ongiciel", "fr:usurpation d'identit\u00e9", "fr:authentification biom\u00e9trique",
      "fr:introduction en bourse", "fr:fusions et acquisitions", "fr:licorne technologique", "fr:acc\u00e9l\u00e9rateur de startups",
      "fr:valorisation d'entreprise", "fr:investissement \u00e9tranger", "fr:fonds souverain", "fr:licenciements dans la tech",
      "fr:commerce de d\u00e9tail", "fr:cha\u00eene d'approvisionnement", "fr:dernier kilom\u00e8tre", "fr:marque de distributeur",
      "fr:centre commercial", "fr:consommation des m\u00e9nages", "fr:logistique", "fr:entrep\u00f4t automatis\u00e9",
      "fr:commerce transfrontalier", "fr:banque en ligne", "fr:paiement instantan\u00e9", "fr:monnaie num\u00e9rique",
      "fr:inclusion financi\u00e8re", "fr:assurance en ligne", "fr:cr\u00e9dit immobilier", "fr:taux d'int\u00e9r\u00eat",
      "fr:blanchiment d'argent", "fr:transferts de fonds", "fr:transition \u00e9nerg\u00e9tique", "fr:\u00e9nergie solaire",
      "fr:\u00e9nergie nucl\u00e9aire", "fr:stockage d'\u00e9nergie", "fr:r\u00e9seau \u00e9lectrique", "fr:hydrog\u00e8ne vert",
      "fr:prix de l'\u00e9lectricit\u00e9", "fr:captage du carbone", "fr:p\u00e9nurie d'eau", "fr:batterie \u00e9lectrique",
      "fr:conduite autonome", "fr:transport public", "fr:train \u00e0 grande vitesse", "fr:mobilit\u00e9 urbaine",
      "fr:compagnies a\u00e9riennes", "fr:tourisme durable", "fr:secteur h\u00f4telier", "fr:r\u00e9servation de vols",
      "fr:t\u00e9l\u00e9m\u00e9decine", "fr:essai clinique", "fr:th\u00e9rapie g\u00e9nique", "fr:m\u00e9decine personnalis\u00e9e",
      "fr:vieillissement en bonne sant\u00e9", "fr:sant\u00e9 mentale", "fr:industrie pharmaceutique", "fr:dispositifs m\u00e9dicaux",
      "fr:dermatologie", "fr:publicit\u00e9 programmatique", "fr:m\u00e9dias d'information", "fr:\u00e9conomie des cr\u00e9ateurs",
      "fr:d\u00e9sinformation", "fr:journalisme de donn\u00e9es", "fr:r\u00e9putation de marque", "fr:r\u00e9f\u00e9rencement naturel",
      "fr:contenu g\u00e9n\u00e9r\u00e9 par IA", "fr:t\u00e9l\u00e9travail", "fr:march\u00e9 du travail", "fr:p\u00e9nurie de talents",
      "fr:\u00e9cart salarial", "fr:syndicats", "fr:formation professionnelle", "fr:enseignement sup\u00e9rieur",
      "fr:universit\u00e9 publique", "fr:s\u00e9curit\u00e9 au travail", "fr:productivit\u00e9 du travail", "fr:politique commerciale",
      "fr:droits de douane", "fr:r\u00e9gulation num\u00e9rique", "fr:concurrence d\u00e9loyale", "fr:s\u00e9curit\u00e9 alimentaire",
      "fr:inflation", "fr:dette publique", "fr:logement abordable",
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
      // - widened 2026-09-10 to ~100 (Irfan: go wide, prune on evidence).
      //   Same 10-theme grid in every language so gaps are visible. PROBE-PENDING.
      "id:model bahasa besar", "id:pusat data", "id:semikonduktor", "id:komputasi awan",
      "id:serangan siber", "id:perangkat pemeras", "id:pencurian identitas", "id:autentikasi biometrik",
      "id:penawaran saham perdana", "id:merger dan akuisisi", "id:startup unicorn", "id:akselerator startup",
      "id:valuasi perusahaan", "id:investasi asing", "id:dana kekayaan negara", "id:pemutusan hubungan kerja",
      "id:perdagangan ritel", "id:rantai pasok", "id:pengiriman jarak dekat", "id:merek pribadi",
      "id:pusat perbelanjaan", "id:konsumsi rumah tangga", "id:logistik", "id:gudang otomatis",
      "id:perdagangan lintas negara", "id:perbankan digital", "id:pembayaran instan", "id:mata uang kripto",
      "id:mata uang digital", "id:inklusi keuangan", "id:asuransi digital", "id:kredit pemilikan rumah",
      "id:suku bunga", "id:pencucian uang", "id:pengiriman uang", "id:transisi energi",
      "id:tenaga surya", "id:pembangkit listrik tenaga nuklir", "id:penyimpanan energi", "id:jaringan listrik",
      "id:hidrogen hijau", "id:harga listrik", "id:penangkapan karbon", "id:krisis air",
      "id:baterai kendaraan", "id:mengemudi otonom", "id:transportasi umum", "id:kereta cepat",
      "id:mobilitas perkotaan", "id:maskapai penerbangan", "id:pariwisata berkelanjutan", "id:industri perhotelan",
      "id:pemesanan tiket", "id:telemedisin", "id:uji klinis", "id:terapi gen",
      "id:pengobatan presisi", "id:penuaan sehat", "id:kesehatan mental", "id:industri farmasi",
      "id:alat kesehatan", "id:perawatan kulit", "id:hubungan masyarakat", "id:iklan terprogram",
      "id:media massa", "id:ekonomi kreator", "id:misinformasi", "id:jurnalisme data",
      "id:reputasi merek", "id:optimisasi mesin pencari", "id:konten buatan AI", "id:kerja jarak jauh",
      "id:pasar tenaga kerja", "id:kekurangan talenta", "id:kesenjangan upah", "id:serikat pekerja",
      "id:pelatihan vokasi", "id:pendidikan tinggi", "id:universitas negeri", "id:keselamatan kerja",
      "id:produktivitas kerja", "id:kebijakan perdagangan", "id:tarif impor", "id:regulasi digital",
      "id:persaingan usaha", "id:ketahanan pangan", "id:inflasi", "id:utang negara",
      "id:perumahan terjangkau",
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
      // - widened 2026-09-10 to ~100 on the shared 10-theme grid. PROBE-PENDING.
      "zh:\u6570\u636e\u4e2d\u5fc3", "zh:\u4e91\u8ba1\u7b97", "zh:\u8eab\u4efd\u76d7\u7a83", "zh:\u751f\u7269\u8bc6\u522b",
      "zh:\u878d\u8d44\u8f6e\u6b21", "zh:\u9996\u6b21\u516c\u5f00\u52df\u80a1", "zh:\u5e76\u8d2d\u4ea4\u6613", "zh:\u72ec\u89d2\u517d\u4f01\u4e1a",
      "zh:\u521b\u4e1a\u5b75\u5316\u5668", "zh:\u4f01\u4e1a\u4f30\u503c", "zh:\u5916\u5546\u6295\u8d44", "zh:\u4e3b\u6743\u57fa\u91d1",
      "zh:\u79d1\u6280\u88c1\u5458", "zh:\u96f6\u552e\u4e1a", "zh:\u4f9b\u5e94\u94fe", "zh:\u6700\u540e\u4e00\u516c\u91cc",
      "zh:\u81ea\u6709\u54c1\u724c", "zh:\u8d2d\u7269\u4e2d\u5fc3", "zh:\u5c45\u6c11\u6d88\u8d39", "zh:\u7269\u6d41\u884c\u4e1a",
      "zh:\u81ea\u52a8\u5316\u4ed3\u5e93", "zh:\u6570\u5b57\u94f6\u884c", "zh:\u5373\u65f6\u652f\u4ed8", "zh:\u52a0\u5bc6\u8d27\u5e01",
      "zh:\u6570\u5b57\u8d27\u5e01", "zh:\u666e\u60e0\u91d1\u878d", "zh:\u4e92\u8054\u7f51\u4fdd\u9669", "zh:\u4f4f\u623f\u8d37\u6b3e",
      "zh:\u5229\u7387\u51b3\u8bae", "zh:\u53cd\u6d17\u94b1", "zh:\u8de8\u5883\u6c47\u6b3e", "zh:\u80fd\u6e90\u8f6c\u578b",
      "zh:\u53ef\u518d\u751f\u80fd\u6e90", "zh:\u592a\u9633\u80fd\u53d1\u7535", "zh:\u6838\u7535\u7ad9", "zh:\u50a8\u80fd\u6280\u672f",
      "zh:\u7535\u7f51\u5efa\u8bbe", "zh:\u7eff\u8272\u6c22\u80fd", "zh:\u7535\u4ef7\u4e0a\u6da8", "zh:\u78b3\u6355\u96c6",
      "zh:\u6c34\u8d44\u6e90\u77ed\u7f3a", "zh:\u52a8\u529b\u7535\u6c60", "zh:\u81ea\u52a8\u9a7e\u9a76", "zh:\u516c\u5171\u4ea4\u901a",
      "zh:\u9ad8\u901f\u94c1\u8def", "zh:\u57ce\u5e02\u4ea4\u901a", "zh:\u822a\u7a7a\u516c\u53f8", "zh:\u53ef\u6301\u7eed\u65c5\u6e38",
      "zh:\u9152\u5e97\u884c\u4e1a", "zh:\u673a\u7968\u9884\u8ba2", "zh:\u6570\u5b57\u533b\u7597", "zh:\u8fdc\u7a0b\u533b\u7597",
      "zh:\u4e34\u5e8a\u8bd5\u9a8c", "zh:\u57fa\u56e0\u6cbb\u7597", "zh:\u7cbe\u51c6\u533b\u7597", "zh:\u5065\u5eb7\u8001\u9f84\u5316",
      "zh:\u5fc3\u7406\u5065\u5eb7", "zh:\u533b\u836f\u884c\u4e1a", "zh:\u533b\u7597\u5668\u68b0", "zh:\u76ae\u80a4\u79d1",
      "zh:\u516c\u5171\u5173\u7cfb", "zh:\u7a0b\u5e8f\u5316\u5e7f\u544a", "zh:\u65b0\u95fb\u5a92\u4f53", "zh:\u521b\u4f5c\u8005\u7ecf\u6d4e",
      "zh:\u865a\u5047\u4fe1\u606f", "zh:\u6570\u636e\u65b0\u95fb", "zh:\u54c1\u724c\u58f0\u8a89", "zh:\u641c\u7d22\u5f15\u64ce\u4f18\u5316",
      "zh:\u4eba\u5de5\u667a\u80fd\u751f\u6210\u5185\u5bb9", "zh:\u8fdc\u7a0b\u529e\u516c", "zh:\u52b3\u52a8\u529b\u5e02\u573a", "zh:\u4eba\u624d\u77ed\u7f3a",
      "zh:\u85aa\u916c\u5dee\u8ddd", "zh:\u5de5\u4f1a\u7ec4\u7ec7", "zh:\u804c\u4e1a\u57f9\u8bad", "zh:\u9ad8\u7b49\u6559\u80b2",
      "zh:\u516c\u7acb\u5927\u5b66", "zh:\u751f\u4ea7\u5b89\u5168", "zh:\u52b3\u52a8\u751f\u4ea7\u7387", "zh:\u8d38\u6613\u653f\u7b56",
      "zh:\u8fdb\u53e3\u5173\u7a0e", "zh:\u5e73\u53f0\u76d1\u7ba1", "zh:\u6570\u636e\u4fdd\u62a4", "zh:\u53cd\u5784\u65ad",
      "zh:\u7cae\u98df\u5b89\u5168", "zh:\u901a\u8d27\u81a8\u80c0", "zh:\u653f\u5e9c\u503a\u52a1", "zh:\u4fdd\u969c\u6027\u4f4f\u623f",
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
      // - widened 2026-09-10 to ~100 on the shared 10-theme grid. PROBE-PENDING.
      "th:\u0e41\u0e1a\u0e1a\u0e08\u0e33\u0e25\u0e2d\u0e07\u0e20\u0e32\u0e29\u0e32\u0e02\u0e19\u0e32\u0e14\u0e43\u0e2b\u0e0d\u0e48", "th:\u0e28\u0e39\u0e19\u0e22\u0e4c\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25", "th:\u0e40\u0e0b\u0e21\u0e34\u0e04\u0e2d\u0e19\u0e14\u0e31\u0e01\u0e40\u0e15\u0e2d\u0e23\u0e4c", "th:\u0e04\u0e25\u0e32\u0e27\u0e14\u0e4c\u0e04\u0e2d\u0e21\u0e1e\u0e34\u0e27\u0e15\u0e34\u0e49\u0e07",
      "th:\u0e01\u0e32\u0e23\u0e42\u0e08\u0e21\u0e15\u0e35\u0e17\u0e32\u0e07\u0e44\u0e0b\u0e40\u0e1a\u0e2d\u0e23\u0e4c", "th:\u0e21\u0e31\u0e25\u0e41\u0e27\u0e23\u0e4c\u0e40\u0e23\u0e35\u0e22\u0e01\u0e04\u0e48\u0e32\u0e44\u0e16\u0e48", "th:\u0e01\u0e32\u0e23\u0e02\u0e42\u0e21\u0e22\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27", "th:\u0e01\u0e32\u0e23\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e15\u0e31\u0e27\u0e15\u0e19\u0e14\u0e49\u0e27\u0e22\u0e0a\u0e35\u0e27\u0e21\u0e34\u0e15\u0e34",
      "th:\u0e40\u0e07\u0e34\u0e19\u0e23\u0e48\u0e27\u0e21\u0e25\u0e07\u0e17\u0e38\u0e19", "th:\u0e01\u0e32\u0e23\u0e23\u0e30\u0e14\u0e21\u0e17\u0e38\u0e19", "th:\u0e01\u0e32\u0e23\u0e40\u0e2a\u0e19\u0e2d\u0e02\u0e32\u0e22\u0e2b\u0e38\u0e49\u0e19", "th:\u0e01\u0e32\u0e23\u0e04\u0e27\u0e1a\u0e23\u0e27\u0e21\u0e01\u0e34\u0e08\u0e01\u0e32\u0e23",
      "th:\u0e2a\u0e15\u0e32\u0e23\u0e4c\u0e17\u0e2d\u0e31\u0e1e\u0e22\u0e39\u0e19\u0e34\u0e04\u0e2d\u0e23\u0e4c\u0e19", "th:\u0e28\u0e39\u0e19\u0e22\u0e4c\u0e1a\u0e48\u0e21\u0e40\u0e1e\u0e32\u0e30\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08", "th:\u0e21\u0e39\u0e25\u0e04\u0e48\u0e32\u0e01\u0e34\u0e08\u0e01\u0e32\u0e23", "th:\u0e01\u0e32\u0e23\u0e25\u0e07\u0e17\u0e38\u0e19\u0e08\u0e32\u0e01\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28",
      "th:\u0e01\u0e2d\u0e07\u0e17\u0e38\u0e19\u0e04\u0e27\u0e32\u0e21\u0e21\u0e31\u0e48\u0e07\u0e04\u0e31\u0e48\u0e07", "th:\u0e01\u0e32\u0e23\u0e40\u0e25\u0e34\u0e01\u0e08\u0e49\u0e32\u0e07\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19", "th:\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08\u0e04\u0e49\u0e32\u0e1b\u0e25\u0e35\u0e01", "th:\u0e2b\u0e48\u0e27\u0e07\u0e42\u0e0b\u0e48\u0e2d\u0e38\u0e1b\u0e17\u0e32\u0e19",
      "th:\u0e01\u0e32\u0e23\u0e08\u0e31\u0e14\u0e2a\u0e48\u0e07\u0e1e\u0e31\u0e2a\u0e14\u0e38", "th:\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e41\u0e1a\u0e23\u0e19\u0e14\u0e4c\u0e15\u0e31\u0e27\u0e40\u0e2d\u0e07", "th:\u0e28\u0e39\u0e19\u0e22\u0e4c\u0e01\u0e32\u0e23\u0e04\u0e49\u0e32", "th:\u0e01\u0e32\u0e23\u0e1a\u0e23\u0e34\u0e42\u0e20\u0e04\u0e20\u0e32\u0e04\u0e04\u0e23\u0e31\u0e27\u0e40\u0e23\u0e37\u0e2d\u0e19",
      "th:\u0e42\u0e25\u0e08\u0e34\u0e2a\u0e15\u0e34\u0e01\u0e2a\u0e4c", "th:\u0e04\u0e25\u0e31\u0e07\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34", "th:\u0e01\u0e32\u0e23\u0e04\u0e49\u0e32\u0e02\u0e49\u0e32\u0e21\u0e1e\u0e23\u0e21\u0e41\u0e14\u0e19", "th:\u0e18\u0e19\u0e32\u0e04\u0e32\u0e23\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25",
      "th:\u0e01\u0e32\u0e23\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19\u0e17\u0e31\u0e19\u0e17\u0e35", "th:\u0e2a\u0e01\u0e38\u0e25\u0e40\u0e07\u0e34\u0e19\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25", "th:\u0e40\u0e07\u0e34\u0e19\u0e1a\u0e32\u0e17\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25", "th:\u0e01\u0e32\u0e23\u0e40\u0e02\u0e49\u0e32\u0e16\u0e36\u0e07\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e17\u0e32\u0e07\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19",
      "th:\u0e1b\u0e23\u0e30\u0e01\u0e31\u0e19\u0e20\u0e31\u0e22\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25", "th:\u0e2a\u0e34\u0e19\u0e40\u0e0a\u0e37\u0e48\u0e2d\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e2d\u0e32\u0e28\u0e31\u0e22", "th:\u0e2d\u0e31\u0e15\u0e23\u0e32\u0e14\u0e2d\u0e01\u0e40\u0e1a\u0e35\u0e49\u0e22", "th:\u0e01\u0e32\u0e23\u0e1f\u0e2d\u0e01\u0e40\u0e07\u0e34\u0e19",
      "th:\u0e01\u0e32\u0e23\u0e42\u0e2d\u0e19\u0e40\u0e07\u0e34\u0e19\u0e23\u0e30\u0e2b\u0e27\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28", "th:\u0e01\u0e32\u0e23\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e1c\u0e48\u0e32\u0e19\u0e1e\u0e25\u0e31\u0e07\u0e07\u0e32\u0e19", "th:\u0e1e\u0e25\u0e31\u0e07\u0e07\u0e32\u0e19\u0e41\u0e2a\u0e07\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c", "th:\u0e42\u0e23\u0e07\u0e44\u0e1f\u0e1f\u0e49\u0e32\u0e19\u0e34\u0e27\u0e40\u0e04\u0e25\u0e35\u0e22\u0e23\u0e4c",
      "th:\u0e01\u0e32\u0e23\u0e01\u0e31\u0e01\u0e40\u0e01\u0e47\u0e1a\u0e1e\u0e25\u0e31\u0e07\u0e07\u0e32\u0e19", "th:\u0e42\u0e04\u0e23\u0e07\u0e02\u0e48\u0e32\u0e22\u0e44\u0e1f\u0e1f\u0e49\u0e32", "th:\u0e44\u0e2e\u0e42\u0e14\u0e23\u0e40\u0e08\u0e19\u0e2a\u0e35\u0e40\u0e02\u0e35\u0e22\u0e27", "th:\u0e04\u0e48\u0e32\u0e44\u0e1f\u0e1f\u0e49\u0e32",
      "th:\u0e01\u0e32\u0e23\u0e14\u0e31\u0e01\u0e08\u0e31\u0e1a\u0e04\u0e32\u0e23\u0e4c\u0e1a\u0e2d\u0e19", "th:\u0e01\u0e32\u0e23\u0e02\u0e32\u0e14\u0e41\u0e04\u0e25\u0e19\u0e19\u0e49\u0e33", "th:\u0e41\u0e1a\u0e15\u0e40\u0e15\u0e2d\u0e23\u0e35\u0e48\u0e23\u0e16\u0e22\u0e19\u0e15\u0e4c", "th:\u0e23\u0e16\u0e22\u0e19\u0e15\u0e4c\u0e02\u0e31\u0e1a\u0e40\u0e04\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34",
      "th:\u0e23\u0e30\u0e1a\u0e1a\u0e02\u0e19\u0e2a\u0e48\u0e07\u0e2a\u0e32\u0e18\u0e32\u0e23\u0e13\u0e30", "th:\u0e23\u0e16\u0e44\u0e1f\u0e04\u0e27\u0e32\u0e21\u0e40\u0e23\u0e47\u0e27\u0e2a\u0e39\u0e07", "th:\u0e01\u0e32\u0e23\u0e08\u0e23\u0e32\u0e08\u0e23\u0e43\u0e19\u0e40\u0e21\u0e37\u0e2d\u0e07", "th:\u0e2a\u0e32\u0e22\u0e01\u0e32\u0e23\u0e1a\u0e34\u0e19",
      "th:\u0e01\u0e32\u0e23\u0e17\u0e48\u0e2d\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e27\u0e22\u0e31\u0e48\u0e07\u0e22\u0e37\u0e19", "th:\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08\u0e42\u0e23\u0e07\u0e41\u0e23\u0e21", "th:\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07\u0e15\u0e31\u0e4b\u0e27\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e1a\u0e34\u0e19", "th:\u0e2a\u0e38\u0e02\u0e20\u0e32\u0e1e\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25",
      "th:\u0e01\u0e32\u0e23\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e17\u0e32\u0e07\u0e44\u0e01\u0e25", "th:\u0e01\u0e32\u0e23\u0e17\u0e14\u0e25\u0e2d\u0e07\u0e17\u0e32\u0e07\u0e04\u0e25\u0e34\u0e19\u0e34\u0e01", "th:\u0e22\u0e35\u0e19\u0e1a\u0e33\u0e1a\u0e31\u0e14", "th:\u0e01\u0e32\u0e23\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e41\u0e21\u0e48\u0e19\u0e22\u0e33",
      "th:\u0e01\u0e32\u0e23\u0e2a\u0e39\u0e07\u0e27\u0e31\u0e22\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e21\u0e35\u0e2a\u0e38\u0e02\u0e20\u0e32\u0e1e", "th:\u0e2a\u0e38\u0e02\u0e20\u0e32\u0e1e\u0e08\u0e34\u0e15", "th:\u0e2d\u0e38\u0e15\u0e2a\u0e32\u0e2b\u0e01\u0e23\u0e23\u0e21\u0e22\u0e32", "th:\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e21\u0e37\u0e2d\u0e41\u0e1e\u0e17\u0e22\u0e4c",
      "th:\u0e1c\u0e34\u0e27\u0e2b\u0e19\u0e31\u0e07", "th:\u0e01\u0e32\u0e23\u0e1b\u0e23\u0e30\u0e0a\u0e32\u0e2a\u0e31\u0e21\u0e1e\u0e31\u0e19\u0e18\u0e4c", "th:\u0e42\u0e06\u0e29\u0e13\u0e32\u0e14\u0e34\u0e08\u0e34\u0e17\u0e31\u0e25", "th:\u0e2a\u0e37\u0e48\u0e2d\u0e21\u0e27\u0e25\u0e0a\u0e19",
      "th:\u0e40\u0e28\u0e23\u0e29\u0e10\u0e01\u0e34\u0e08\u0e04\u0e23\u0e35\u0e40\u0e2d\u0e40\u0e15\u0e2d\u0e23\u0e4c", "th:\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e1a\u0e34\u0e14\u0e40\u0e1a\u0e37\u0e2d\u0e19", "th:\u0e27\u0e32\u0e23\u0e2a\u0e32\u0e23\u0e28\u0e32\u0e2a\u0e15\u0e23\u0e4c\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25", "th:\u0e0a\u0e37\u0e48\u0e2d\u0e40\u0e2a\u0e35\u0e22\u0e07\u0e41\u0e1a\u0e23\u0e19\u0e14\u0e4c",
      "th:\u0e01\u0e32\u0e23\u0e17\u0e33\u0e40\u0e2d\u0e2a\u0e2d\u0e35\u0e42\u0e2d", "th:\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e2b\u0e32\u0e17\u0e35\u0e48\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e14\u0e49\u0e27\u0e22\u0e40\u0e2d\u0e44\u0e2d", "th:\u0e01\u0e32\u0e23\u0e17\u0e33\u0e07\u0e32\u0e19\u0e17\u0e32\u0e07\u0e44\u0e01\u0e25", "th:\u0e15\u0e25\u0e32\u0e14\u0e41\u0e23\u0e07\u0e07\u0e32\u0e19",
      "th:\u0e01\u0e32\u0e23\u0e02\u0e32\u0e14\u0e41\u0e04\u0e25\u0e19\u0e41\u0e23\u0e07\u0e07\u0e32\u0e19", "th:\u0e04\u0e27\u0e32\u0e21\u0e40\u0e2b\u0e25\u0e37\u0e48\u0e2d\u0e21\u0e25\u0e49\u0e33\u0e04\u0e48\u0e32\u0e08\u0e49\u0e32\u0e07", "th:\u0e2a\u0e2b\u0e20\u0e32\u0e1e\u0e41\u0e23\u0e07\u0e07\u0e32\u0e19", "th:\u0e2d\u0e32\u0e0a\u0e35\u0e27\u0e28\u0e36\u0e01\u0e29\u0e32",
      "th:\u0e01\u0e32\u0e23\u0e2d\u0e38\u0e14\u0e21\u0e28\u0e36\u0e01\u0e29\u0e32", "th:\u0e21\u0e2b\u0e32\u0e27\u0e34\u0e17\u0e22\u0e32\u0e25\u0e31\u0e22\u0e23\u0e31\u0e10", "th:\u0e04\u0e27\u0e32\u0e21\u0e1b\u0e25\u0e2d\u0e14\u0e20\u0e31\u0e22\u0e43\u0e19\u0e01\u0e32\u0e23\u0e17\u0e33\u0e07\u0e32\u0e19", "th:\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e32\u0e1e\u0e41\u0e23\u0e07\u0e07\u0e32\u0e19",
      "th:\u0e19\u0e42\u0e22\u0e1a\u0e32\u0e22\u0e01\u0e32\u0e23\u0e04\u0e49\u0e32", "th:\u0e20\u0e32\u0e29\u0e35\u0e19\u0e33\u0e40\u0e02\u0e49\u0e32", "th:\u0e01\u0e32\u0e23\u0e01\u0e33\u0e01\u0e31\u0e1a\u0e14\u0e39\u0e41\u0e25\u0e41\u0e1e\u0e25\u0e15\u0e1f\u0e2d\u0e23\u0e4c\u0e21", "th:\u0e01\u0e32\u0e23\u0e04\u0e38\u0e49\u0e21\u0e04\u0e23\u0e2d\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2a\u0e48\u0e27\u0e19\u0e1a\u0e38\u0e04\u0e04\u0e25",
      "th:\u0e01\u0e32\u0e23\u0e41\u0e02\u0e48\u0e07\u0e02\u0e31\u0e19\u0e17\u0e32\u0e07\u0e01\u0e32\u0e23\u0e04\u0e49\u0e32", "th:\u0e04\u0e27\u0e32\u0e21\u0e21\u0e31\u0e48\u0e19\u0e04\u0e07\u0e17\u0e32\u0e07\u0e2d\u0e32\u0e2b\u0e32\u0e23", "th:\u0e40\u0e07\u0e34\u0e19\u0e40\u0e1f\u0e49\u0e2d", "th:\u0e2b\u0e19\u0e35\u0e49\u0e2a\u0e32\u0e18\u0e32\u0e23\u0e13\u0e30",
      "th:\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e2d\u0e32\u0e28\u0e31\u0e22\u0e23\u0e32\u0e04\u0e32\u0e1b\u0e23\u0e30\u0e2b\u0e22\u0e31\u0e14",
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
      // - widened 2026-09-10 to ~100 (Irfan: go wide, prune on evidence).
      //   Same 10-theme grid in every language so gaps are visible. PROBE-PENDING.
      "vi:m\u00f4 h\u00ecnh ng\u00f4n ng\u1eef l\u1edbn", "vi:ch\u1ea5t b\u00e1n d\u1eabn", "vi:\u0111i\u1ec7n to\u00e1n \u0111\u00e1m m\u00e2y", "vi:t\u1ea5n c\u00f4ng m\u1ea1ng",
      "vi:m\u00e3 \u0111\u1ed9c t\u1ed1ng ti\u1ec1n", "vi:\u0111\u00e1nh c\u1eafp danh t\u00ednh", "vi:x\u00e1c th\u1ef1c sinh tr\u1eafc h\u1ecdc", "vi:v\u00f2ng g\u1ecdi v\u1ed1n",
      "vi:ph\u00e1t h\u00e0nh c\u1ed5 phi\u1ebfu l\u1ea7n \u0111\u1ea7u", "vi:mua b\u00e1n s\u00e1p nh\u1eadp", "vi:k\u1ef3 l\u00e2n c\u00f4ng ngh\u1ec7", "vi:v\u01b0\u1eddn \u01b0\u01a1m kh\u1edfi nghi\u1ec7p",
      "vi:\u0111\u1ecbnh gi\u00e1 doanh nghi\u1ec7p", "vi:\u0111\u1ea7u t\u01b0 n\u01b0\u1edbc ngo\u00e0i", "vi:qu\u1ef9 \u0111\u1ea7u t\u01b0 qu\u1ed1c gia", "vi:c\u1eaft gi\u1ea3m nh\u00e2n s\u1ef1",
      "vi:b\u00e1n l\u1ebb hi\u1ec7n \u0111\u1ea1i", "vi:chu\u1ed7i cung \u1ee9ng", "vi:giao h\u00e0ng ch\u1eb7ng cu\u1ed1i", "vi:nh\u00e3n h\u00e0ng ri\u00eang",
      "vi:trung t\u00e2m th\u01b0\u01a1ng m\u1ea1i", "vi:ti\u00eau d\u00f9ng n\u1ed9i \u0111\u1ecba", "vi:h\u1eadu c\u1ea7n", "vi:kho t\u1ef1 \u0111\u1ed9ng",
      "vi:th\u01b0\u01a1ng m\u1ea1i xuy\u00ean bi\u00ean gi\u1edbi", "vi:ng\u00e2n h\u00e0ng s\u1ed1", "vi:thanh to\u00e1n t\u1ee9c th\u1eddi", "vi:ti\u1ec1n m\u00e3 h\u00f3a",
      "vi:ti\u1ec1n k\u1ef9 thu\u1eadt s\u1ed1", "vi:t\u00e0i ch\u00ednh to\u00e0n di\u1ec7n", "vi:b\u1ea3o hi\u1ec3m s\u1ed1", "vi:t\u00edn d\u1ee5ng b\u1ea5t \u0111\u1ed9ng s\u1ea3n",
      "vi:l\u00e3i su\u1ea5t \u0111i\u1ec1u h\u00e0nh", "vi:r\u1eeda ti\u1ec1n", "vi:ki\u1ec1u h\u1ed1i", "vi:chuy\u1ec3n d\u1ecbch n\u0103ng l\u01b0\u1ee3ng",
      "vi:\u0111i\u1ec7n m\u1eb7t tr\u1eddi", "vi:\u0111i\u1ec7n h\u1ea1t nh\u00e2n", "vi:l\u01b0u tr\u1eef n\u0103ng l\u01b0\u1ee3ng", "vi:l\u01b0\u1edbi \u0111i\u1ec7n qu\u1ed1c gia",
      "vi:hydro xanh", "vi:gi\u00e1 \u0111i\u1ec7n", "vi:thu gi\u1eef carbon", "vi:thi\u1ebfu n\u01b0\u1edbc",
      "vi:c\u00f4ng ngh\u1ec7 pin", "vi:xe t\u1ef1 l\u00e1i", "vi:giao th\u00f4ng c\u00f4ng c\u1ed9ng", "vi:\u0111\u01b0\u1eddng s\u1eaft cao t\u1ed1c",
      "vi:giao th\u00f4ng \u0111\u00f4 th\u1ecb", "vi:h\u00e3ng h\u00e0ng kh\u00f4ng", "vi:du l\u1ecbch b\u1ec1n v\u1eefng", "vi:ng\u00e0nh kh\u00e1ch s\u1ea1n",
      "vi:\u0111\u1eb7t v\u00e9 m\u00e1y bay", "vi:y t\u1ebf s\u1ed1", "vi:kh\u00e1m b\u1ec7nh t\u1eeb xa", "vi:th\u1eed nghi\u1ec7m l\u00e2m s\u00e0ng",
      "vi:li\u1ec7u ph\u00e1p gen", "vi:y h\u1ecdc ch\u00ednh x\u00e1c", "vi:l\u00e3o h\u00f3a kh\u1ecfe m\u1ea1nh", "vi:s\u1ee9c kh\u1ecfe t\u00e2m th\u1ea7n",
      "vi:ng\u00e0nh d\u01b0\u1ee3c ph\u1ea9m", "vi:thi\u1ebft b\u1ecb y t\u1ebf", "vi:da li\u1ec5u", "vi:quan h\u1ec7 c\u00f4ng ch\u00fang",
      "vi:qu\u1ea3ng c\u00e1o l\u1eadp tr\u00ecnh", "vi:b\u00e1o ch\u00ed truy\u1ec1n th\u00f4ng", "vi:kinh t\u1ebf s\u00e1ng t\u1ea1o", "vi:th\u00f4ng tin sai l\u1ec7ch",
      "vi:b\u00e1o ch\u00ed d\u1eef li\u1ec7u", "vi:uy t\u00edn th\u01b0\u01a1ng hi\u1ec7u", "vi:t\u1ed1i \u01b0u c\u00f4ng c\u1ee5 t\u00ecm ki\u1ebfm", "vi:n\u1ed9i dung do AI t\u1ea1o",
      "vi:l\u00e0m vi\u1ec7c t\u1eeb xa", "vi:th\u1ecb tr\u01b0\u1eddng lao \u0111\u1ed9ng", "vi:thi\u1ebfu h\u1ee5t nh\u00e2n l\u1ef1c", "vi:ch\u00eanh l\u1ec7ch l\u01b0\u01a1ng",
      "vi:c\u00f4ng \u0111o\u00e0n", "vi:\u0111\u00e0o t\u1ea1o ngh\u1ec1", "vi:gi\u00e1o d\u1ee5c \u0111\u1ea1i h\u1ecdc", "vi:tr\u01b0\u1eddng c\u00f4ng l\u1eadp",
      "vi:an to\u00e0n lao \u0111\u1ed9ng", "vi:n\u0103ng su\u1ea5t lao \u0111\u1ed9ng", "vi:ch\u00ednh s\u00e1ch th\u01b0\u01a1ng m\u1ea1i", "vi:thu\u1ebf nh\u1eadp kh\u1ea9u",
      "vi:qu\u1ea3n l\u00fd n\u1ec1n t\u1ea3ng s\u1ed1", "vi:b\u1ea3o v\u1ec7 d\u1eef li\u1ec7u", "vi:c\u1ea1nh tranh l\u00e0nh m\u1ea1nh", "vi:an ninh l\u01b0\u01a1ng th\u1ef1c",
      "vi:l\u1ea1m ph\u00e1t", "vi:n\u1ee3 c\u00f4ng", "vi:nh\u00e0 \u1edf x\u00e3 h\u1ed9i",
    ],
    blurb: "Vietnamese-language coverage for future radars. Not offered in the beat picker.",
  },
];

export function beatById(id: BeatId): Beat {
  return BEATS.find((b) => b.id === id) ?? BEATS[0];
}
