// Resource library data — types + CONTENT + RESOURCE_COUNT.
// Extracted from ResourcesClientShell.tsx (2026-08-10) so light consumers
// (e.g. the homepage's "N TOTAL IN THE LIBRARY" link) can import the count
// without pulling the whole client shell into their bundle.

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ContentType =
  | "kit"
  | "tool"
  | "radar"
  | "quiz"
  | "playbook"
  | "guide"
  | "infographic"
  | "video";

export type TopicKey =
  | "pr"
  | "seo"
  | "backlinks"
  | "content-marketing"
  | "personal-branding"
  | "writing"
  | "strategy"
  | "neuromarketing"
  | "saudi-arabia";

export interface ContentBase {
  id: string;
  type: ContentType;
  badge: string;
  topics: TopicKey[];
  title: string;
  y: string;
  updated?: string;
  private?: boolean;
  beta?: boolean;
  underReview?: boolean;
  hook: string;
}

export interface InteractiveContent extends ContentBase {
  type: "kit" | "tool" | "radar" | "quiz";
  sub: string;
  blurb: string;
  href: string;
  comingSoon?: boolean;
  newsHeadline: string;
  newsDeck: string;
  cta: string;
}

export interface PlaybookContent extends ContentBase {
  type: "playbook";
  no: string;
  sub: string;
  blurb: string;
  slug: string;
  wc: string;
  read: string;
  newsHeadline: string;
  newsDeck: string;
}

export interface GuideContent extends ContentBase {
  type: "guide";
  slug?: string;
  cat?: string;
  external?: boolean;
  href?: string;
  newsHeadline: string;
  newsDeck: string;
}

export interface InfographicContent extends ContentBase {
  type: "infographic";
  blurb: string;
  href: string;
  newsHeadline: string;
  newsDeck: string;
}

export interface VideoContent extends ContentBase {
  type: "video";
  blurb: string;
  youtubeId: string;
  newsHeadline: string;
  newsDeck: string;
}

export type ContentItem =
  | InteractiveContent
  | PlaybookContent
  | GuideContent
  | InfographicContent
  | VideoContent;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT DATA
// ─────────────────────────────────────────────────────────────────────────────

export const CONTENT: ContentItem[] = [
  // ── VIDEOS ───────────────────────────────────────────────────────────────
  {
    id: "video-pressiq-explainer",
    type: "video",
    badge: "Video",
    topics: ["pr", "personal-branding", "neuromarketing"],
    title: "How PressIQ Works",
    blurb:
      "A 4-minute walkthrough of PressIQ — how the 32-point scoring engine works, what the 7 dimensions measure, and how to use the Top Fixes tab to rewrite before you send.",
    youtubeId: "HaXSuks2l54",
    y: "2026",
    newsHeadline: "PressIQ Explainer",
    newsDeck: "See the pitch-scoring engine in action",
    hook: "Watch it score a pitch in real time",
  },
  // ── TOOLS ────────────────────────────────────────────────────────────────
  {
    id: "tool-pressiq",
    type: "tool",
    badge: "Interactive Tool",
    beta: true,
    topics: ["pr", "personal-branding", "neuromarketing"],
    title: "PressIQ — Journalist Pitch Score",
    sub: "Will a journalist actually paste your pitch in?",
    blurb:
      "Paste a HARO, Qwoted, or Featured pitch and score it against a 32-point system and the EMOS framework — storytelling, neuromarketing, and authority — with the three fixes that move it most. Backed by published journalist research.",
    href: "/tools/pressiq",
    y: "2026",
    newsHeadline: "The Pitch Desk",
    newsDeck: "Score any media pitch against the system that earns the placement",
    cta: "Score a Pitch",
    hook: "Score your pitch in under 60 seconds",
  },
  {
    id: "tool-signaliq",
    type: "tool",
    badge: "Interactive Tool",
    beta: true,
    topics: ["pr", "strategy", "neuromarketing"],
    title: "SignalIQ — Proactive PR Radar",
    sub: "See the story before it breaks, then pitch it first.",
    blurb:
      "Scans open, primary-source signals — SEC filings, research preprints, and search, forum, and news-coverage data — and ranks the stories rising fastest before the press catches up, then drafts the brief, the pitch angle, and who to send it to.",
    href: "/tools/signaliq",
    y: "2026",
    newsHeadline: "The Foresight Desk",
    newsDeck: "Find the data story the press hasn't written yet — and arrive first",
    cta: "Open the Radar",
    hook: "Find the story the press hasn't filed yet",
  },

  {
    id: "tool-journocollabiq",
    type: "tool",
    badge: "Interactive Tool",
    beta: true,
    topics: ["pr", "strategy"],
    title: "JournoCollabIQ — Journalist Beat Matcher",
    sub: "Find the reporters most likely to cover your story.",
    blurb:
      "Enter your business, beat, and story angle — JournoCollabIQ surfaces the journalists who actively cover your topic, scores their fit, and drafts a tailored pitch angle for each. Built on the same EMOS logic as PressIQ.",
    href: "/tools/journocollabiq",
    y: "2026",
    newsHeadline: "The Media List",
    newsDeck: "Who covers your beat — and how to land in their inbox",
    cta: "Find Journalists",
    hook: "Find the reporter before your rivals do",
  },

  {
    id: "tool-earned-media-radar",
    type: "radar",
    badge: "Live Radar",
    beta: true,
    topics: ["pr", "seo", "strategy"],
    title: "Earned Media Radar — Live Coverage Map",
    sub: "See which PR, earned-media, SEO, and GEO beats are heating up right now.",
    blurb:
      "A live radar of press-coverage momentum across the beats that matter, built on the same SignalIQ data that powers the pipeline. Filter by lens to see what's saturated and what's still ownable.",
    href: "/earned-media-radar",
    y: "2026",
    newsHeadline: "The Coverage Radar",
    newsDeck: "Watch press momentum shift across your beats in real time",
    cta: "Open the Radar",
    hook: "See what's heating up before it saturates",
  },

  {
    id: "tool-founder-movers",
    type: "radar",
    badge: "Live Radar",
    beta: true,
    topics: ["pr", "strategy", "personal-branding"],
    title: "Founder Movers — Weekly Topic Rankings",
    sub: "Which founder and Series-A topics are gaining press momentum this week.",
    blurb:
      "Weekly rankings of founder and Series-A topics by press-coverage change, powered by SignalIQ. See what's heating up, what's cooling down, and what's spiking today versus normal, so you pitch into rising attention instead of a saturated narrative.",
    href: "/founder-movers",
    y: "2026",
    newsHeadline: "The Founder Leaderboard",
    newsDeck: "Founders who compound attention are early, not louder",
    cta: "See This Week's Movers",
    hook: "Founders who compound attention are early, not louder",
  },

  {
    id: "radar-ksa-tourism",
    type: "radar",
    badge: "Live Radar",
    topics: ["pr", "strategy", "saudi-arabia"],
    title: "KSA Tourism & Hospitality Radar",
    sub: "What is moving in Saudi tourism now, and which narratives nobody owns yet.",
    blurb:
      "28 sourced signals on Saudi tourism: giga-projects, mega-events, hospitality and aviation, and faith travel. Curated from official statistics and named industry reports, wired to live press-coverage data via SignalIQ.",
    href: "/ksa-tourism-radar",
    y: "2026",
    newsHeadline: "The Saudi Desk",
    newsDeck: "Saudi tourism's rise, tracked signal by signal, every number linked to its source",
    cta: "Open the Radar",
    hook: "The 2030 story, tracked before it saturates",
  },

  {
    id: "radar-ksa-retail",
    type: "radar",
    badge: "Live Radar",
    topics: ["pr", "strategy", "saudi-arabia"],
    title: "KSA Retail & Consumer Radar",
    sub: "A consumer economy approaching $294B, and the coverage nobody is filing.",
    blurb:
      "25 sourced signals on Saudi Arabia's consumer economy: e-commerce and delivery, retail groups and brands, lifestyle retail, and the macro picture. Curated from official statistics and named reports, wired to live press-coverage data via SignalIQ.",
    href: "/ksa-retail-radar",
    y: "2026",
    newsHeadline: "The Consumer Desk",
    newsDeck: "Saudi retail's numbers run far ahead of its coverage; this radar shows exactly where",
    cta: "Open the Radar",
    hook: "The whitespace market, mapped before the desks arrive",
  },

  // ── CALCULATORS ─────────────────────────────────────────────────────────
  {
    id: "calc-authority",
    type: "tool",
    badge: "Calculator",
    beta: true,
    topics: ["pr", "strategy"],
    title: "SIA Authority ROI Calculator",
    sub: "Renting credibility vs. owning it. The real numbers.",
    blurb:
      "What do agency retainers, bought links, and sponsored placements actually cost over a year? Calculate your ROI versus owning authority through earned media.",
    href: "/tools/authority-calculator",
    y: "2025",
    newsHeadline: "Renting vs. Owning",
    newsDeck: "Calculate what credibility really costs you over twelve months",
    cta: "Run the Calculator",
    hook: "Renting credibility costs more than you think",
  },

  // ── KITS ────────────────────────────────────────────────────────────────
  {
    id: "kit-journo",
    type: "infographic",
    badge: "Interactive Kit",
    beta: true,
    topics: ["pr", "seo"],
    title: "The Journo Outreach Checklist",
    blurb:
      "The SIA system for HARO, Qwoted, Source of Sources, Featured, and Help a B2B Writer — with copy-clip snippets, a progress meter, and print mode.",
    href: "/infographics/journo-outreach-checklist",
    y: "2026",
    newsHeadline: "Pitch Perfect",
    newsDeck: "The seven-step system that gets reporters to say yes",
    hook: "Seven steps most founders quietly skip",
  },

  {
    id: "tool-collabiq",
    type: "tool",
    badge: "Interactive Tool",
    beta: true,
    topics: ["backlinks", "seo", "strategy"],
    title: "PartnerCollabIQ — Partnership Intelligence Tool",
    sub: "Find co-marketing and distribution opportunities by industry.",
    blurb:
      "Surface co-marketing allies, content collaborators, referral networks, and distribution partners — with qualification scoring and outreach templates. 15+ industries mapped.",
    href: "/tools/partnercollabiq",
    y: "2026",
    newsHeadline: "The Partnership Desk",
    newsDeck: "Co-marketing, distribution, and link opportunities across every industry, mapped",
    cta: "Use the Tool",
    hook: "Your best partner hasn't heard of you yet",
  },

  // ── QUIZZES ─────────────────────────────────────────────────────────────
  {
    id: "quiz-founder-press",
    type: "quiz",
    badge: "Score Quiz",
    private: true,
    topics: ["pr", "personal-branding"],
    title: "Founder Press Readiness Score",
    sub: "How press-ready is your personal brand?",
    blurb:
      "Eight dimensions. Five minutes. Coverage volume, media relationships, narrative clarity, spokesperson readiness — scored with prescriptions for each gap.",
    href: "/tools/founder-press-score",
    comingSoon: true,
    y: "2026",
    newsHeadline: "Your Press Score",
    newsDeck: "Eight dimensions of founder media readiness, scored and prescribed",
    cta: "Take the Quiz",
    hook: "How press-ready is your brand, really",
  },
  {
    id: "kit-writing",
    type: "infographic",
    badge: "Interactive Kit",
    topics: ["writing", "content-marketing"],
    title: "Top 11 Scientific Benefits of Writing",
    blurb:
      "Reduced anxiety, stronger memory, sharper thinking — the science of writing as a daily practice. Each finding paired with a study and something you can do this week.",
    href: "/infographics/writing-benefits",
    y: "2019",
    updated: "2026",
    newsHeadline: "Writing Is Medicine",
    newsDeck: "Science confirms what the Ancients knew about the written word",
    hook: "Science says writing rewires the brain",
  },
  {
    id: "quiz-personal-brand",
    type: "quiz",
    badge: "Brand Quiz",
    private: true,
    topics: ["personal-branding", "content-marketing"],
    title: "Personal Brand Strength Quiz",
    sub: "The five-pillar brand assessment.",
    blurb:
      "Niche clarity, content consistency, audience trust, online visibility, storytelling — assess across five pillars and receive a personalised prescription.",
    href: "/tools/personal-brand-quiz",
    comingSoon: true,
    y: "2026",
    newsHeadline: "Who Are You, Really?",
    newsDeck: "A five-pillar personal brand assessment for founders and builders",
    cta: "Take the Quiz",
    hook: "Five pillars. Which one is your weak spot",
  },

  // ── PLAYBOOKS ────────────────────────────────────────────────────────────
  {
    id: "play-personal-branding",
    type: "playbook",
    badge: "101 Series",
    no: "01",
    topics: ["personal-branding", "content-marketing"],
    title: "Personal Branding 101",
    sub: "How to brand yourself for success.",
    blurb:
      "Five pillars: clarity, consistency, content, community, credibility. A complete guide to building a personal brand that opens doors. Updated for 2021.",
    slug: "personal-branding",
    wc: "~6,000 words",
    read: "24 min",
    y: "2021",
    newsHeadline: "The Authority Playbook",
    newsDeck: "The complete system for building a recognisable expert brand in public",
    hook: "Most founders get this completely wrong",
  },
  {
    id: "play-storytelling",
    type: "playbook",
    badge: "101 Series",
    no: "02",
    topics: ["content-marketing", "strategy"],
    title: "Storytelling 101",
    sub: "Elevate your brand through narrative.",
    blurb:
      "The neurological case for stories, the hero's journey applied to brand narrative, and practical frameworks for content, decks, and pitches.",
    slug: "storytelling",
    wc: "~5,500 words",
    read: "21 min",
    y: "2020",
    newsHeadline: "The Narrative Framework",
    newsDeck: "The story structures behind every message that lands",
    hook: "The structure that makes every message stick",
  },
  {
    id: "play-neuromarketing",
    type: "playbook",
    badge: "101 Series",
    no: "03",
    topics: ["neuromarketing", "strategy"],
    title: "Neuromarketing 101",
    sub: "What it is and how it actually works.",
    blurb:
      "Anchoring, the power of free, loss aversion, social proof, the decoy effect. Red Bull, Porsche, Coke vs. Pepsi. Real research, practical applications.",
    slug: "neuromarketing",
    wc: "~3,200 words",
    read: "13 min",
    y: "2020",
    newsHeadline: "The Persuasion Code",
    newsDeck: "What cognitive science tells us about why some messages work",
    hook: "Your brain decides long before you do",
  },

  // ── GUIDES ───────────────────────────────────────────────────────────────
  {
    id: "art-writing-tips",
    type: "guide",
    badge: "Guide",
    topics: ["writing", "content-marketing"],
    title: "100+ Writing Tips to Become a Great Writer",
    slug: "writing-tips",
    cat: "Craft",
    y: "2016",
    updated: "2022",
    newsHeadline: "The Writer's Rulebook",
    newsDeck: "Every rule serious writers live by, in one place",
    hook: "100 tips. One place. No filler",
  },
  {
    id: "art-digital-tools",
    type: "guide",
    badge: "Guide",
    topics: ["writing", "content-marketing"],
    title: "6 Must-Have Digital Tools for Writers",
    slug: "digital-tools-writers-editors",
    cat: "Tools",
    y: "2020",
    external: true,
    private: true,
    newsHeadline: "Tools of the Trade",
    newsDeck: "Six digital tools that make writing faster and sharper",
    hook: "Six tools that make sharper writers faster",
  },
  {
    id: "art-analytics",
    type: "guide",
    badge: "Guide",
    topics: ["seo", "content-marketing"],
    title: "5 Google Analytics Metrics for Content Marketers",
    slug: "google-analytics-content-marketing",
    cat: "Measurement",
    y: "2020",
    external: true,
    private: true,
    newsHeadline: "Read the Numbers",
    newsDeck: "The five analytics signals that tell you if your content is working",
    hook: "Five numbers that reveal if content is working",
  },
  {
    id: "art-ecommerce",
    type: "guide",
    badge: "Guide",
    topics: ["strategy", "content-marketing"],
    title: "How To Maximize eCommerce Conversions",
    slug: "maximize-ecommerce-conversions-using-product-discovery",
    cat: "Strategy",
    y: "—",
    external: true,
    private: true,
    newsHeadline: "The Conversion Code",
    newsDeck: "How product discovery turns browsers into buyers",
    hook: "The product discovery trick that converts browsers",
  },
  {
    id: "guide-bing-seo-2026",
    type: "infographic",
    badge: "Guide + Infographic",
    topics: ["seo", "pr", "strategy"],
    title: "How to Win on Bing and the AI Answer Engines It Feeds",
    blurb:
      "Bing now feeds Microsoft Copilot and the AI answer engines. The 2026 field guide to submitting your site, earning the right links, and diversifying formats, with the illustrated original restored in full.",
    href: "/infographics/bing-seo",
    y: "2026",
    newsHeadline: "The Bing Desk",
    newsDeck: "The 2026 field guide to Bing SEO and AI search visibility",
    hook: "The search engine quietly running AI answers",
  },
  {
    id: "guide-bing-seo-2015",
    type: "guide",
    badge: "Archive · Guide + Infographic",
    topics: ["seo"],
    title: "Bing SEO: The 2015 Original",
    href: "/infographics/bing-seo-2015",
    y: "2015",
    updated: "2021",
    newsHeadline: "The Archive",
    newsDeck: "The original 2015 Bing SEO guide, faithfully restored",
    hook: "The 2015 rules that still hold today",
  },

  // ── INFOGRAPHICS ─────────────────────────────────────────────────────────
  {
    id: "ig-authority-flywheel",
    type: "infographic",
    badge: "Interactive Infographic",
    topics: ["pr", "strategy", "personal-branding"],
    title: "The Authority Flywheel",
    blurb:
      "Six compounding returns of earned media in one interactive model: reputation, visibility, conversions, brand equity, magnetism, and liberty, and why each turn of the wheel makes the next one easier.",
    href: "/resources/authority-flywheel",
    y: "2026",
    newsHeadline: "The Compounding Machine",
    newsDeck: "Why earned media keeps paying long after the story runs",
    hook: "Press begets press. Here is the mechanism",
  },
  {
    id: "ve-hubstaff",
    type: "infographic",
    badge: "Infographic",
    topics: ["strategy"],
    underReview: true,
    title: "Managing Remote Teams with HubStaff",
    blurb:
      "Time tracking, trust, and async communication across distributed teams. Originally produced in partnership with HubStaff.",
    href: "https://syedirfanajmal.com/managing-remote-teams-with-hubstaff-time-tracking/",
    y: "2016",
    updated: "2021",
    newsHeadline: "The Great Dispersal",
    newsDeck: "Data on where work went and what it cost everyone",
    hook: "Data on where work went and what it cost",
  },
  {
    id: "ve-writing-habits",
    type: "infographic",
    badge: "Infographic",
    topics: ["writing"],
    title: "How to Form Writing Habits for Success",
    blurb:
      "The science of habit formation applied to a daily writing practice — cues, routines, rewards, and the research behind each.",
    href: "https://syedirfanajmal.com/form-writing-habits-success-infographic/",
    y: "—",
    underReview: true,
    newsHeadline: "Rituals of the Masters",
    newsDeck: "The daily habits that made Hemingway, King, and Didion",
    hook: "Habits that made Hemingway, King, and Didion",
  },
  {
    id: "ve-content-ideas",
    type: "infographic",
    badge: "Infographic",
    topics: ["content-marketing", "strategy"],
    underReview: true,
    title: "Getting Content Ideas from Your Customers",
    blurb:
      "Listening systems, surveys, and social mining — how to extract an endless editorial calendar from the people already talking to your business.",
    href: "https://syedirfanajmal.com/content-ideas-from-customers-infographic/",
    y: "—",
    newsHeadline: "The Voice in the Reviews",
    newsDeck: "Mining your audience for content angles that convert",
    hook: "Your audience is writing your editorial calendar",
  },
];

// Single source of truth for the hero badge on /resources — includes the
// "Being Updated" (private) items, which still render on the page.
export const RESOURCE_COUNT = CONTENT.length;
