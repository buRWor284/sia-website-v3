"use client";

import { useCallback, useMemo, useState } from "react";
import { Mark, SCaps, SectionMast } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK55, INK70, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ContentType =
  | "kit"
  | "tool"
  | "quiz"
  | "playbook"
  | "guide"
  | "infographic"
  | "video";

type TopicKey =
  | "pr"
  | "seo"
  | "backlinks"
  | "content-marketing"
  | "personal-branding"
  | "writing"
  | "strategy"
  | "neuromarketing";

interface ContentBase {
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

interface InteractiveContent extends ContentBase {
  type: "kit" | "tool" | "quiz";
  sub: string;
  blurb: string;
  href: string;
  comingSoon?: boolean;
  newsHeadline: string;
  newsDeck: string;
  cta: string;
}

interface PlaybookContent extends ContentBase {
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

interface GuideContent extends ContentBase {
  type: "guide";
  slug?: string;
  cat?: string;
  external?: boolean;
  href?: string;
  newsHeadline: string;
  newsDeck: string;
}

interface InfographicContent extends ContentBase {
  type: "infographic";
  blurb: string;
  href: string;
  newsHeadline: string;
  newsDeck: string;
}

interface VideoContent extends ContentBase {
  type: "video";
  blurb: string;
  youtubeId: string;
  newsHeadline: string;
  newsDeck: string;
}

type ContentItem =
  | InteractiveContent
  | PlaybookContent
  | GuideContent
  | InfographicContent
  | VideoContent;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT DATA
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT: ContentItem[] = [
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
    type: "kit",
    badge: "Interactive Kit",
    beta: true,
    topics: ["pr", "seo"],
    title: "The Journo Outreach Checklist",
    sub: "Seven steps to a pitch reporters actually use.",
    blurb:
      "The SIA system for HARO, Qwoted, Source of Sources, Featured, and Help a B2B Writer — with copy-clip snippets, a progress meter, and print mode.",
    href: "/infographics/journo-outreach-checklist",
    y: "2026",
    newsHeadline: "Pitch Perfect",
    newsDeck: "The seven-step system that gets reporters to say yes",
    cta: "Open the Kit",
    hook: "Seven steps most founders quietly skip",
  },

  {
    id: "tool-collabiq",
    type: "tool",
    badge: "Interactive Tool",
    beta: true,
    topics: ["backlinks", "seo", "strategy"],
    title: "Partner Collab IQ — Partnership Intelligence Tool",
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
    type: "kit",
    badge: "Interactive Kit",
    underReview: true,
    topics: ["writing", "content-marketing"],
    title: "Top 11 Scientific Benefits of Writing",
    sub: "Eleven research-backed findings. Each with a prescription.",
    blurb:
      "Reduced anxiety, stronger memory, sharper thinking — the science of writing as a daily practice. Each finding paired with a study and something you can do this week.",
    href: "/infographics/writing-benefits",
    y: "2019",
    updated: "2026",
    newsHeadline: "Writing Is Medicine",
    newsDeck: "Science confirms what the Ancients knew about the written word",
    cta: "Open the Kit",
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
    type: "guide",
    badge: "Guide + Infographic",
    topics: ["seo", "pr", "strategy"],
    title: "How to Win on Bing and the AI Answer Engines It Feeds",
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
    id: "ve-hubstaff",
    type: "infographic",
    badge: "Infographic",
    topics: ["strategy"],
    private: true,
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
    private: true,
    newsHeadline: "Rituals of the Masters",
    newsDeck: "The daily habits that made Hemingway, King, and Didion",
    hook: "Habits that made Hemingway, King, and Didion",
  },
  {
    id: "ve-content-ideas",
    type: "infographic",
    badge: "Infographic",
    topics: ["content-marketing", "strategy"],
    private: true,
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

// ─────────────────────────────────────────────────────────────────────────────
// FILTER CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_TABS: { key: "all" | ContentType; label: string }[] = [
  { key: "all",          label: "All Resources" },
  { key: "kit",          label: "Kits" },
  { key: "tool",         label: "Tools" },
  { key: "quiz",         label: "Quizzes" },
  { key: "playbook",     label: "Playbooks" },
  { key: "guide",        label: "Guides" },
  { key: "infographic",  label: "Infographics" },
  { key: "video",        label: "Videos" },
];

const TOPIC_PILLS: { id: TopicKey; label: string }[] = [
  { id: "pr",                 label: "PR & Earned Media" },
  { id: "seo",                label: "SEO" },
  { id: "backlinks",          label: "Link Building" },
  { id: "content-marketing",  label: "Content Marketing" },
  { id: "personal-branding",  label: "Personal Branding" },
  { id: "writing",            label: "Writing" },
  { id: "strategy",           label: "Strategy" },
  { id: "neuromarketing",     label: "Neuromarketing" },
];

const GROUP_ORDER: ContentType[] = [
  "video", "kit", "tool", "quiz", "playbook", "guide", "infographic",
];

const GROUP_LABEL: Record<ContentType, string> = {
  "video":        "Videos · Watch the framework in action",
  "kit":          "Kits · Interactive tools & checklists",
  "tool":         "Tools · Use them right now",
  "quiz":         "Quizzes · Score your position",
  "playbook":     "Playbooks · Deep-dive guides",
  "guide":        "Guides · From the archives",
  "infographic":  "Infographics · Research made visible",
};

const TYPE_ACCENT: Record<ContentType, string> = {
  "video":        "#C0392B",
  "kit":          "#f5b81f",
  "tool":         "#C17817",
  "quiz":         "#8B6B99",
  "playbook":     INK,
  "guide":        INK55,
  "infographic":  "#A0522D",
};

// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAIL THEME — colour variants per README Option B spec
// ─────────────────────────────────────────────────────────────────────────────

type ThumbnailTheme = { bg: string; catColor: string; hookColor: string; ruleColor: string };

const THUMB_THEME: Record<ContentType, ThumbnailTheme> = {
  video:       { bg: "#f1ebde", catColor: "rgba(26,20,16,.45)", hookColor: "#1a1410", ruleColor: "#f5b81f" },
  playbook:    { bg: "#1a1410", catColor: "rgba(241,235,222,.40)", hookColor: "#f1ebde", ruleColor: "#f5b81f" },
  tool:        { bg: "#f5b81f", catColor: "rgba(26,20,16,.60)", hookColor: "#1a1410", ruleColor: "#1a1410" },
  guide:       { bg: "#e8e0cc", catColor: "rgba(26,20,16,.45)", hookColor: "#1a1410", ruleColor: "#f5b81f" },
  kit:         { bg: "#f1ebde", catColor: "rgba(26,20,16,.45)", hookColor: "#1a1410", ruleColor: "#f5b81f" },
  quiz:        { bg: "#f1ebde", catColor: "rgba(26,20,16,.45)", hookColor: "#1a1410", ruleColor: "#f5b81f" },
  infographic: { bg: "#f1ebde", catColor: "rgba(26,20,16,.45)", hookColor: "#1a1410", ruleColor: "#f5b81f" },
};

const TOPIC_LABEL: Record<TopicKey, string> = {
  "pr":                "PR & Earned Media",
  "seo":               "SEO",
  "backlinks":         "Link Building",
  "content-marketing": "Content Marketing",
  "personal-branding": "Personal Branding",
  "writing":           "Writing",
  "strategy":          "Strategy",
  "neuromarketing":    "Neuromarketing",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getCardHref(item: ContentItem): string | null {
  if (item.type === "playbook") return `/resources/${item.slug}`;
  if (item.type === "guide") {
    const g = item as GuideContent;
    if (g.href) return g.href;
    if (g.external) return `https://syedirfanajmal.com/${g.slug}/`;
    return g.slug ? `/resources/${g.slug}` : null;
  }
  if (item.type === "infographic") return (item as InfographicContent).href;
  if (item.type === "video") return `https://youtu.be/${(item as VideoContent).youtubeId}`;
  const interactive = item as InteractiveContent;
  if (interactive.comingSoon) return null;
  return interactive.href;
}

function getCardCta(item: ContentItem): string {
  if (item.type === "playbook") return "Read the Guide";
  if (item.type === "guide") return "Read the Guide";
  if (item.type === "infographic") return "View Original";
  if (item.type === "video") return "Watch on YouTube";
  const interactive = item as InteractiveContent;
  return interactive.cta;
}

function isComingSoon(item: ContentItem): boolean {
  if (item.type === "kit" || item.type === "tool" || item.type === "quiz") {
    return !!(item as InteractiveContent).comingSoon;
  }
  return false;
}

function isExternal(item: ContentItem): boolean {
  if (item.type === "video") return true;
  if (item.type === "infographic") {
    const href = (item as InfographicContent).href;
    return href.startsWith("http");
  }
  if (item.type === "guide") {
    const g = item as GuideContent;
    if (g.href) return g.href.startsWith("http");
    return !!g.external;
  }
  if (item.type === "kit" || item.type === "tool" || item.type === "quiz") {
    return (item as InteractiveContent).href.startsWith("http");
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE THUMBNAIL — typographic 96×96 card (Option B)
// ─────────────────────────────────────────────────────────────────────────────

function ResourceThumb({ item }: { item: ContentItem }) {
  const t = THUMB_THEME[item.type];
  return (
    <div
      style={{
        width: 120,
        height: 96,
        flexShrink: 0,
        border: "1.5px solid #1a1410",
        background: t.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "8px 9px",
        alignSelf: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Category overline */}
      <div
        style={{
          fontFamily: GROT,
          fontWeight: 700,
          fontSize: 7,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: t.catColor,
          lineHeight: 1.2,
        }}
      >
        {item.badge}
      </div>
      {/* Hook / teaser */}
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 13.5,
          lineHeight: 1.25,
          color: t.hookColor,
        }}
      >
        {item.hook}
      </div>
      {/* Bottom rule */}
      <div style={{ width: "100%", height: 2, background: t.ruleColor, flexShrink: 0 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION MAST — double-rule newspaper masthead
// ─────────────────────────────────────────────────────────────────────────────

function LedgerSectionMast({ n, label, vol }: { n: string; label: string; vol: string }) {
  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ borderTop: `1px solid ${INK}` }}><div style={{ marginTop: 3, borderTop: `3px solid ${INK}` }} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0 7px" }}>
        <span style={{ display: "inline-block", padding: "4px 9px 5px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" }}>§ {n}</span>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55 }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(26,20,16,.35)" }} />
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55 }}>{vol}</span>
      </div>
      <div style={{ borderTop: `1px solid ${INK}` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEDGER ROW — newspaper-style resource row
// ─────────────────────────────────────────────────────────────────────────────

function LedgerRow({ item, n }: { item: ContentItem; n: number }) {
  const [hover, setHover] = useState(false);
  const href = getCardHref(item);
  const ext = isExternal(item);
  const coming = isComingSoon(item);
  const clickable = !!(href && !coming);

  const inner = (
    <div
      className="res-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "40px 120px 1fr 186px 36px",
        gap: 20,
        alignItems: "center",
        padding: "16px 0",
        borderBottom: `1px solid ${INK15}`,
        background: hover && clickable ? PAPER2 : "transparent",
        transition: "background 0.12s ease",
        cursor: clickable ? "pointer" : "default",
        textDecoration: "none",
        color: INK,
      }}
    >
      {/* Index */}
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.2em", color: INK55 }}>
        {String(n).padStart(2, "0")}
      </div>

      {/* Thumbnail */}
      <ResourceThumb item={item} />

      {/* Title + deck */}
      <div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, lineHeight: 1.15, letterSpacing: "-0.01em", color: INK }}>
          {item.title}
          {item.beta && <span style={{ marginLeft: 7, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", color: INK55, verticalAlign: "middle" }}>β</span>}
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.55, color: INK70, marginTop: 6 }}>
          {item.newsDeck}
        </div>
        {coming && (
          <span style={{ display: "inline-block", marginTop: 8, padding: "3px 8px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Coming Soon
          </span>
        )}
        {item.underReview && (
          <span style={{ display: "inline-block", marginTop: 8, padding: "3px 8px", border: `1px solid ${INK15}`, color: INK55, fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Under Review
          </span>
        )}
        {/* Topics */}
        {item.topics.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
            {item.topics.map((t) => (
              <span key={t} style={{ padding: "2px 7px", border: `1px solid ${INK15}`, fontFamily: GROT, fontWeight: 700, fontSize: 7.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55 }}>
                {TOPIC_LABEL[t]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Source / headline */}
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, textAlign: "right", lineHeight: 1.5 }}>
        {item.newsHeadline}
        <div style={{ marginTop: 4, fontFamily: GROT, fontWeight: 600, fontSize: 8.5, color: "rgba(26,20,16,.32)" }}>
          {item.y}{item.updated ? ` · upd. ${item.updated}` : ""}
        </div>
      </div>

      {/* CTA arrow */}
      <div className="res-cta" style={{ fontFamily: SERIF, fontSize: 22, color: hover && clickable ? YEL : INK, transition: "color 0.12s ease", textAlign: "center", lineHeight: 1 }}>
        {clickable ? "→" : ""}
      </div>
    </div>
  );

  if (clickable && href) {
    return (
      <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined} style={{ display: "block", textDecoration: "none" }}>
        {inner}
      </a>
    );
  }
  return inner;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE LEDGER — grouped newspaper ledger
// ─────────────────────────────────────────────────────────────────────────────

function ResourceLedger({
  filtered,
}: {
  filtered: ContentItem[];
}) {
  const liveItems = filtered.filter((c) => !c.private);
  const updatingItems = filtered.filter((c) => c.private);

  if (liveItems.length === 0 && updatingItems.length === 0) {
    return (
      <div style={{ padding: "80px 56px", textAlign: "center" }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: INK55, margin: 0 }}>
          No resources match this filter.
        </p>
        <p style={{ marginTop: 10, fontFamily: GROT, fontSize: 10.5, color: "rgba(26,20,16,.32)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Try clearing a topic filter or selecting a different type.
        </p>
      </div>
    );
  }

  // Group live items by type
  const groups = GROUP_ORDER
    .map((type) => ({ type, items: liveItems.filter((c) => c.type === type) }))
    .filter((g) => g.items.length > 0);

  let globalIndex = 0;

  return (
    <div id="resources" style={{ padding: "0 56px 90px" }}>
      {groups.map((group, gi) => {
        const startIndex = globalIndex;
        globalIndex += group.items.length;
        return (
          <div key={group.type}>
            {/* Category header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "28px 0 12px", borderBottom: `1px solid ${INK}` }}>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK, borderLeft: `3px solid ${TYPE_ACCENT[group.type]}`, paddingLeft: 10 }}>
                {GROUP_LABEL[group.type]}
              </span>
              <div style={{ flex: 1, height: 1, background: INK15 }} />
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(26,20,16,.35)" }}>
                {group.items.length} {group.items.length === 1 ? "item" : "items"}
              </span>
            </div>
            {group.items.map((item, i) => (
              <LedgerRow key={item.id} item={item} n={startIndex + i + 1} />
            ))}
          </div>
        );
      })}

      {/* Being Updated section */}
      {updatingItems.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55 }}>
              Being Updated
            </span>
            <div style={{ flex: 1, height: 1, background: INK15 }} />
            <span style={{ fontFamily: GROT, fontWeight: 600, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,20,16,.28)" }}>
              {updatingItems.length} {updatingItems.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: INK15, border: `1px solid ${INK15}` }}>
            {updatingItems.map((item) => (
              <div key={item.id} style={{ background: PAPER, padding: "16px 18px 14px", opacity: 0.55, borderLeft: `3px solid ${TYPE_ACCENT[item.type]}` }}>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>{item.badge}</div>
                <h5 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: INK, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                  {item.title}
                </h5>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BAR — light background, yellow active pills
// ─────────────────────────────────────────────────────────────────────────────

function FilterBar({
  activeType,
  setActiveType,
  activeTopics,
  toggleTopic,
  clearTopics,
  count,
}: {
  activeType: "all" | ContentType;
  setActiveType: (t: "all" | ContentType) => void;
  activeTopics: Set<TopicKey>;
  toggleTopic: (id: TopicKey) => void;
  clearTopics: () => void;
  count: number;
}) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: PAPER, borderBottom: `2px solid ${INK}` }}>
      {/* Row 1 — Type tabs */}
      <div
        style={{
          display: "flex", alignItems: "stretch",
          padding: "0 56px",
          overflowX: "auto",
          borderBottom: `1px solid ${INK15}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", paddingRight: 20, marginRight: 4, flexShrink: 0, borderRight: `1px solid ${INK15}` }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(26,20,16,.35)" }}>
            Type
          </span>
        </div>
        {TYPE_TABS.map((tab) => {
          const isActive = activeType === tab.key;
          const cnt = tab.key === "all" ? CONTENT.length : CONTENT.filter((c) => c.type === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "11px 14px", border: "none", cursor: "pointer",
                background: "transparent",
                fontFamily: GROT, fontWeight: isActive ? 800 : 600,
                fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase",
                color: isActive ? INK : INK55,
                borderBottom: isActive ? `2px solid ${INK}` : "2px solid transparent",
                marginBottom: -2, whiteSpace: "nowrap",
                transition: "color 0.12s, border-color 0.12s",
              }}
            >
              {tab.label}
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", color: isActive ? INK : "rgba(26,20,16,.28)" }}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 2 — Topic pills */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 56px", gap: 7, overflowX: "auto" }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(26,20,16,.32)", flexShrink: 0, marginRight: 4 }}>
          Topic
        </span>
        {TOPIC_PILLS.map((topic) => {
          const isActive = activeTopics.has(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              style={{
                padding: "5px 12px 6px",
                border: `1px solid ${isActive ? INK : "rgba(26,20,16,.25)"}`,
                background: isActive ? YEL : "transparent",
                color: isActive ? INK : INK55,
                fontFamily: GROT, fontWeight: isActive ? 800 : 600,
                fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase",
                cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.12s",
              }}
            >
              {topic.label}
            </button>
          );
        })}
        {activeTopics.size > 0 && (
          <button
            onClick={clearTopics}
            style={{
              marginLeft: 4, padding: "4px 10px",
              background: "transparent", border: "none",
              color: "rgba(26,20,16,.45)",
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            ✕ Clear
          </button>
        )}
        <span style={{ marginLeft: "auto", flexShrink: 0, fontFamily: GROT, fontWeight: 600, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,20,16,.3)" }}>
          {count} result{count !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PODCAST TEASER
// ─────────────────────────────────────────────────────────────────────────────

function PodcastTeaser() {
  return (
    <section
      id="res-podcast"
      style={{ background: INK, color: PAPER, padding: "70px 56px", borderTop: `3px solid ${YEL}` }}
    >
      {/* Section mast (dark) */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ borderTop: "1px solid rgba(241,235,222,.5)" }}><div style={{ marginTop: 3, borderTop: "3px solid rgba(241,235,222,.5)" }} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0 7px" }}>
          <span style={{ display: "inline-block", padding: "4px 9px 5px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" }}>§ 02</span>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(241,235,222,.5)" }}>Podcast · 39 Episodes</span>
          <div style={{ flex: 1, height: 1, background: "rgba(241,235,222,.25)" }} />
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(241,235,222,.35)" }}>Vol. XV · № 02</span>
        </div>
        <div style={{ borderTop: "1px solid rgba(241,235,222,.5)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
        <div>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(36px,5vw,64px)", lineHeight: 0.96, letterSpacing: "-0.03em", color: PAPER, margin: "0 0 28px" }}>
            The show<br /><em style={{ color: YEL }}>on the air.</em>
          </h2>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: "rgba(241,235,222,.7)", maxWidth: 380, margin: 0 }}>
            39 episodes on earned media, SEO-PR, content marketing, and building a brand that gets found.
          </p>
        </div>
        <div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(241,235,222,.4)", marginBottom: 14 }}>Browse the archive</div>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.65, color: "rgba(241,235,222,.7)", margin: "0 0 28px" }}>Tactics, case studies, and conversations with marketing leaders. New episodes monthly.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/podcast" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>Go to the Podcast →</a>
            {[{ name: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466" }, { name: "Spotify", href: "https://open.spotify.com/show/4ZUfaOaYVckXQ7Q9JnMS92" }].map((p) => (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "transparent", color: "rgba(241,235,222,.7)", border: "1px solid rgba(241,235,222,.35)", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>{p.name} ↗</a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESS
// ─────────────────────────────────────────────────────────────────────────────

const PRESS_OUTLETS: [string, string][] = [
  ["Forbes", "Contributor & featured"],
  ["Harvard Business Review", "Guest contributor"],
  ["HuffPost", "Contributor"],
  ["The Next Web (TNW)", "Featured"],
  ["Entrepreneur", "Contributor"],
  ["Search Engine Journal", "Contributor"],
  ["SEMrush Blog", "Contributor"],
  ["Business.com", "Contributor"],
  ["Reader's Digest", "Featured"],
  ["Virgin Startup", "Contributor"],
  ["The World Bank Blog", "Contributor"],
  ["CNET", "Featured"],
  ["SERPed", "Contributor"],
];

function PressSection() {
  return (
    <section id="res-press" style={{ background: PAPER, padding: "70px 56px", borderTop: `1px solid ${INK}` }}>
      {/* Section mast */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ borderTop: `1px solid ${INK}` }}><div style={{ marginTop: 3, borderTop: `3px solid ${INK}` }} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0 7px" }}>
          <span style={{ display: "inline-block", padding: "4px 9px 5px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" }}>§ 03</span>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55 }}>Bylines & Citations · Selected publications</span>
          <div style={{ flex: 1, height: 1, background: "rgba(26,20,16,.35)" }} />
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55 }}>Vol. XV · № 03</span>
        </div>
        <div style={{ borderTop: `1px solid ${INK}` }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 80, alignItems: "start" }}>
        <div>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px,4.5vw,58px)", lineHeight: 1.0, letterSpacing: "-0.025em", color: INK, margin: "0 0 20px" }}>
            Where the writing<br /><em>has <span style={{ background: YEL, color: INK, padding: "0 0.1em" }}>gone.</span></em>
          </h2>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.65, color: INK70, maxWidth: 360 }}>
            Publications I have written for, been quoted in, or been featured by. A fuller index lives on the About page.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {/* Left col */}
          <div>
            {PRESS_OUTLETS.slice(0, Math.ceil(PRESS_OUTLETS.length / 2)).map(([n, note]) => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 16px 12px 0", borderBottom: `1px solid ${INK15}` }}>
                <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, color: INK }}>{n}</span>
                <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: INK55 }}>{note}</span>
              </div>
            ))}
          </div>
          {/* Right col */}
          <div style={{ paddingLeft: 20, borderLeft: `1px solid ${INK15}` }}>
            {PRESS_OUTLETS.slice(Math.ceil(PRESS_OUTLETS.length / 2)).map(([n, note]) => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderBottom: `1px solid ${INK15}` }}>
                <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, color: INK }}>{n}</span>
                <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: INK55 }}>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${INK15}` }}>
        <a href="/about#press" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>See the full press archive →</a>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GUIDED PIPELINE VIEW — "The EMOS Curriculum"
// ─────────────────────────────────────────────────────────────────────────────

type StepStatus = "live" | "free" | "soon" | "method";

interface PipeStep {
  n: string;
  label: string;
  tool: string;
  cap: string;
  status: StepStatus;
  contentId?: string;
  href?: string;
  week: string;
}

const GP_GREEN = "#3e6b45";
const GP_AMBER = "#d99211";

const STATUS_META: Record<StepStatus, { label: string; bg: string; fg: string; border: string }> = {
  live: { label: "Live", bg: GP_GREEN, fg: "#fff", border: GP_GREEN },
  free: { label: "Free", bg: "transparent", fg: INK, border: INK },
  soon: { label: "Coming soon", bg: GP_AMBER, fg: "#fff", border: GP_AMBER },
  method: { label: "Method", bg: "transparent", fg: INK55, border: INK15 },
};

function StatusPill({ status }: { status: StepStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", padding: "2px 7px", background: m.bg, color: m.fg, border: `1px solid ${m.border}`, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

const PHASE1: PipeStep[] = [
  { n: "1", label: "Catch the right query", tool: "QuerySniper", cap: "Real-time monitoring of journalist queries that match your expertise.", status: "soon", week: "EMOS Wk 1 + 4" },
  { n: "2", label: "Write to the method", tool: "Journo Outreach Checklist", cap: "QA your pitch against the 7-step method + 32-point checklist.", status: "free", contentId: "kit-journo", week: "EMOS Wk 2" },
  { n: "3", label: "Score & sharpen", tool: "PressIQ", cap: "Automated pitch score on the 32-point + EMOS rubric — the 3 fixes that move it most.", status: "free", contentId: "tool-pressiq", week: "EMOS Wk 2" },
  { n: "4", label: "Track to coverage", tool: "CoverageIQ", cap: "Log every pitch, follow-up, and outcome. The tracking spreadsheet, productized.", status: "free", href: "/tools/coverageiq", week: "EMOS Wk 3" },
];

const PHASE2: PipeStep[] = [
  { n: "5", label: "Find the story first", tool: "SignalIQ", cap: "Surfaces breaking stories and coverage gaps before the press piles in.", status: "free", contentId: "tool-signaliq", week: "EMOS Wk 4 → P2" },
  { n: "6", label: "Build the linkable asset", tool: "Infographics · Quizzes · Data reports", cap: "Your own newsworthy asset. The kits and quizzes here are live demos of this step.", status: "free", href: "/infographics", week: "EMOS Wk 5–6" },
  { n: "7", label: "Target named journalists", tool: "JournoCollabIQ", cap: "Journalist Beat Matcher — who covers your topic and is most likely to bite.", status: "free", contentId: "tool-journocollabiq", week: "EMOS Wk 7" },
  { n: "8", label: "Launch & compound", tool: "Publish + pitch Tier 1", cap: "Dedicated page, Tier-1 exclusive then Tier-2 release, then fold back into the loop.", status: "method", href: "/emos", week: "EMOS Wk 8" },
];

const FOUNDATION_SCIENCE = [
  { name: "Personal Branding 101", id: "play-personal-branding" },
  { name: "Storytelling 101", id: "play-storytelling" },
  { name: "Neuromarketing 101", id: "play-neuromarketing" },
];
const FOUNDATION_CASE = [
  { name: "Authority ROI Calculator", id: "calc-authority" },
  { name: "Founder Press Readiness", id: "quiz-founder-press" },
  { name: "Personal Brand Strength", id: "quiz-personal-brand" },
];

function resolveStepHref(step: PipeStep): string | null {
  if (step.contentId) {
    const item = CONTENT.find((c) => c.id === step.contentId);
    if (item) return getCardHref(item);
  }
  return step.href ?? null;
}

function PipeStepRow({ step, accent }: { step: PipeStep; accent: "ink" | "yel" }) {
  const href = resolveStepHref(step);
  const inner = (
    <>
      <div className="gp-num" style={{ background: accent === "yel" ? YEL : "transparent" }}>{step.n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="gp-step-label">{step.label}</div>
        <div className="gp-step-tool">{step.tool}{href ? <span className="gp-arrow"> ↗</span> : null}</div>
        <div className="gp-step-cap">{step.cap}</div>
        <div className="gp-step-meta"><StatusPill status={step.status} /><span className="gp-week">{step.week}</span></div>
      </div>
    </>
  );
  return href
    ? <a className="gp-step gp-step-link" href={href}>{inner}</a>
    : <div className="gp-step">{inner}</div>;
}

function FoundationChip({ name, id }: { name: string; id: string }) {
  const item = CONTENT.find((c) => c.id === id);
  const href = item ? getCardHref(item) : null;
  const soon = item ? isComingSoon(item) : false;
  const body = (
    <>
      <span>{name}</span>
      <span className="gp-chip-tag">{soon ? "Soon" : href ? "Open ↗" : ""}</span>
    </>
  );
  return href
    ? <a className="gp-chip gp-chip-link" href={href}>{body}</a>
    : <div className="gp-chip">{body}</div>;
}

function GuidedPipeline() {
  return (
    <section style={{ background: PAPER }}>
      <style>{`
        .gp-wrap{ max-width:860px; margin:0 auto; padding:56px clamp(20px,5vw,64px) 32px; }
        .gp-head{ border-bottom:2px solid ${INK}; padding-bottom:24px; margin-bottom:40px; }
        .gp-kicker{ font-family:${GROT}; font-weight:800; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:${INK55}; }
        .gp-title{ font-family:${SERIF}; font-weight:700; font-size:clamp(30px,4vw,44px); line-height:1.02; margin:10px 0 10px; letter-spacing:-.015em; color:${INK}; }
        .gp-sub{ font-family:${SERIF}; font-size:17px; color:${INK70}; margin:0; max-width:62ch; line-height:1.6; }
        .gp-ladder{ margin-top:20px; background:${PAPER2}; border-left:3px solid ${YEL}; padding:12px 16px; font-family:${GROT}; font-size:11px; letter-spacing:.03em; color:${INK70}; }
        .gp-ladder b{ color:${INK}; }
        .gp-ladder span{ color:${INK}; font-weight:700; border-bottom:2px solid ${YEL}; }
        .gp-section-break{ display:flex; align-items:center; gap:14px; margin:48px 0 28px; }
        .gp-section-break-label{ font-family:${GROT}; font-weight:800; font-size:9px; letter-spacing:.28em; text-transform:uppercase; color:${INK55}; white-space:nowrap; }
        .gp-section-break-line{ flex:1; height:1px; background:${INK15}; }
        .gp-foundation{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:0; }
        .gp-found-grp{ background:${PAPER2}; border:1px solid ${INK15}; padding:20px 22px; }
        .gp-found-label{ font-family:${GROT}; font-weight:800; font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:${INK55}; margin-bottom:12px; }
        .gp-chips{ display:flex; flex-direction:column; }
        .gp-chip{ display:flex; justify-content:space-between; align-items:center; gap:8px; font-family:${SERIF}; font-size:16px; padding:11px 0; border-bottom:1px solid ${INK15}; color:${INK}; text-decoration:none; }
        .gp-chip:last-child{ border-bottom:none; }
        .gp-chip-link:hover .gp-chip-tag{ text-decoration:underline; }
        .gp-chip-tag{ font-family:${GROT}; font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:${INK55}; white-space:nowrap; }
        .gp-phases{ display:grid; grid-template-columns:1fr; gap:24px; }
        .gp-panel{ border:1px solid ${INK}; background:${PAPER}; }
        .gp-panel-head{ padding:20px 24px; border-bottom:1px solid ${INK}; }
        .gp-panel-reactive .gp-panel-head{ background:${INK}; }
        .gp-panel-reactive .gp-panel-n, .gp-panel-reactive .gp-panel-t{ color:${PAPER}; }
        .gp-panel-reactive .gp-panel-w{ color:rgba(250,250,250,.6); }
        .gp-panel-proactive .gp-panel-head{ background:${YEL}; }
        .gp-panel-n{ font-family:${GROT}; font-weight:800; font-size:9px; letter-spacing:.24em; text-transform:uppercase; opacity:.75; }
        .gp-panel-t{ font-family:${SERIF}; font-weight:700; font-size:24px; line-height:1.05; margin-top:4px; color:${INK}; }
        .gp-panel-w{ font-family:${GROT}; font-size:10px; letter-spacing:.06em; text-transform:uppercase; margin-top:6px; color:${INK55}; }
        .gp-panel-body{ padding:8px 24px 20px; }
        .gp-step{ display:flex; gap:16px; padding:20px 0; border-bottom:1px solid ${INK15}; text-decoration:none; color:${INK}; }
        .gp-step:last-child{ border-bottom:none; padding-bottom:4px; }
        .gp-step-link{ cursor:pointer; }
        .gp-step-link:hover .gp-step-tool{ text-decoration:underline; }
        .gp-num{ flex-shrink:0; width:30px; height:30px; border:1px solid ${INK}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:${GROT}; font-weight:800; font-size:12px; color:${INK}; margin-top:2px; }
        .gp-step-label{ font-family:${GROT}; font-weight:800; font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:${INK55}; }
        .gp-step-tool{ font-family:${SERIF}; font-weight:700; font-size:20px; line-height:1.2; margin:3px 0 6px; color:${INK}; }
        .gp-arrow{ font-family:${GROT}; font-size:13px; color:${INK55}; }
        .gp-step-cap{ font-family:${SERIF}; font-size:14.5px; color:${INK70}; line-height:1.5; }
        .gp-step-meta{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:10px; }
        .gp-week{ font-family:${GROT}; font-size:9.5px; letter-spacing:.04em; color:${INK55}; border:1px solid ${INK15}; padding:2px 7px; }
        .gp-loop{ margin-top:28px; border:1px dashed ${INK}; background:${PAPER2}; padding:16px 20px; font-family:${GROT}; font-size:11.5px; letter-spacing:.04em; color:${INK70}; }
        .gp-loop b{ color:${INK}; }
        .gp-cta{ margin-top:20px; background:${INK}; color:${PAPER}; padding:24px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; text-decoration:none; }
        .gp-cta .gp-cta-txt{ font-family:${SERIF}; font-size:19px; font-weight:700; }
        .gp-cta em{ color:${YEL}; font-style:italic; }
        .gp-cta-btn{ font-family:${GROT}; font-weight:800; font-size:11px; letter-spacing:.14em; text-transform:uppercase; background:${YEL}; color:${INK}; padding:13px 20px; white-space:nowrap; }
        @media (max-width:600px){ .gp-foundation{ grid-template-columns:1fr; } }
      `}</style>

      <div className="gp-wrap">
        <div className="gp-head">
          <div className="gp-kicker">A guided view · Organised by the EMOS curriculum</div>
          <h2 className="gp-title">The EMOS curriculum, tool by tool</h2>
          <p className="gp-sub">This view maps the free tools to the <b>EMOS</b> curriculum, so you can see how they fit together. Start with the <b>Foundation</b> — the science first, then the case for earned media — then work the <b>Reactive</b> and <b>Proactive</b> phases below. Each tool is a free, self-serve taste of one EMOS module; the full program sequences them with you. Just want the tools on their own? Switch to <b>Browse All</b> above.</p>
          <div className="gp-ladder"><b>Access</b> — every tool gives a taste <span>free</span>, more when you <span>join the newsletter</span>, and the full tool <span>inside EMOS</span>.</div>
        </div>

        <div className="gp-foundation">
          <div className="gp-found-grp">
            <div className="gp-found-label">Foundation · The science</div>
            <div className="gp-chips">{FOUNDATION_SCIENCE.map((c) => <FoundationChip key={c.id} name={c.name} id={c.id} />)}</div>
          </div>
          <div className="gp-found-grp">
            <div className="gp-found-label">Foundation · Make the case</div>
            <div className="gp-chips">{FOUNDATION_CASE.map((c) => <FoundationChip key={c.id} name={c.name} id={c.id} />)}</div>
          </div>
        </div>

        <div className="gp-section-break">
          <span className="gp-section-break-label">The Pipeline</span>
          <div className="gp-section-break-line" />
          <span className="gp-section-break-label">8 Steps</span>
        </div>

        <div className="gp-phases">
          <div className="gp-panel gp-panel-reactive">
            <div className="gp-panel-head">
              <div className="gp-panel-n">Phase 1</div>
              <div className="gp-panel-t">Reactive — Get Quoted</div>
              <div className="gp-panel-w">Sprint · Weeks 1–4 · respond to journalists</div>
            </div>
            <div className="gp-panel-body">{PHASE1.map((s) => <PipeStepRow key={s.n} step={s} accent="ink" />)}</div>
          </div>
          <div className="gp-panel gp-panel-proactive">
            <div className="gp-panel-head">
              <div className="gp-panel-n">Phase 2</div>
              <div className="gp-panel-t">Proactive — Make the News</div>
              <div className="gp-panel-w">Intensive · Weeks 5–8 · create the story</div>
            </div>
            <div className="gp-panel-body">{PHASE2.map((s) => <PipeStepRow key={s.n} step={s} accent="yel" />)}</div>
          </div>
        </div>

        <div className="gp-loop">↻ &nbsp;<b>The compounding loop</b> — every placement becomes credibility that makes the next pitch easier.</div>

        <a className="gp-cta" href="/emos">
          <span className="gp-cta-txt">Try the pieces free. <em>Want the whole sequence, done with you?</em></span>
          <span className="gp-cta-btn">Explore EMOS →</span>
        </a>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function ViewToggle({ view, setView }: { view: "guided" | "browse"; setView: (v: "guided" | "browse") => void }) {
  const tabs: { key: "guided" | "browse"; label: string }[] = [
    { key: "browse", label: "Browse All" },
    { key: "guided", label: "EMOS Curriculum" },
  ];
  return (
    <div style={{ background: PAPER, borderBottom: `1px solid ${INK15}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 56px", display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: INK55, marginRight: 4 }}>View</span>
        {tabs.map((t) => {
          const on = view === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              style={{ cursor: "pointer", background: on ? INK : "transparent", color: on ? PAPER : INK, border: `1px solid ${INK}`, padding: "9px 16px", fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function ResourcesClientShell({ defaultView = "browse" }: { defaultView?: "guided" | "browse" }) {
  const [view, setView] = useState<"guided" | "browse">(defaultView);
  const [activeType, setActiveType] = useState<"all" | ContentType>("all");
  const [activeTopics, setActiveTopics] = useState<Set<TopicKey>>(new Set());

  const toggleTopic = useCallback((topicId: TopicKey) => {
    setActiveTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const clearTopics = useCallback(() => {
    setActiveTopics(new Set());
  }, []);

  const handleSetType = useCallback((type: "all" | ContentType) => {
    setActiveType(type);
    setActiveTopics(new Set());
  }, []);

  const filtered = useMemo(() => {
    let items = CONTENT;
    if (activeType !== "all") items = items.filter((c) => c.type === activeType);
    if (activeTopics.size > 0)
      items = items.filter((c) => c.topics.some((t) => activeTopics.has(t)));
    return items;
  }, [activeType, activeTopics]);

  return (
    <>
      <ViewToggle view={view} setView={setView} />
      {view === "guided" ? (
        <GuidedPipeline />
      ) : (
        <>
          <FilterBar
            activeType={activeType}
            setActiveType={handleSetType}
            activeTopics={activeTopics}
            toggleTopic={toggleTopic}
            clearTopics={clearTopics}
            count={filtered.filter((c) => !c.private).length}
          />
          <ResourceLedger filtered={filtered} />
        </>
      )}
      <PodcastTeaser />
      <PressSection />
    </>
  );
}
