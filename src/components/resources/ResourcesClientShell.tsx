"use client";

import { useCallback, useMemo, useState } from "react";
import { Mark, Pill, SCaps, SectionMast } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK55, INK70, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ContentType =
  | "kit"
  | "tool"
  | "calculator"
  | "quiz"
  | "playbook"
  | "article"
  | "visual-essay";

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
}

interface InteractiveContent extends ContentBase {
  type: "kit" | "tool" | "calculator" | "quiz";
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

interface ArticleContent extends ContentBase {
  type: "article";
  slug: string;
  cat: string;
  external?: boolean;
  newsHeadline: string;
  newsDeck: string;
}

interface VisualEssayContent extends ContentBase {
  type: "visual-essay";
  blurb: string;
  href: string;
  newsHeadline: string;
  newsDeck: string;
}

type ContentItem =
  | InteractiveContent
  | PlaybookContent
  | ArticleContent
  | VisualEssayContent;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT DATA
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT: ContentItem[] = [
  // ── KITS ────────────────────────────────────────────────────────────────
  {
    id: "kit-writing",
    type: "kit",
    badge: "Interactive Kit",
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
  },
  {
    id: "kit-journo",
    type: "kit",
    badge: "Interactive Kit",
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
  },

  // ── TOOLS ────────────────────────────────────────────────────────────────
  {
    id: "tool-collabiq",
    type: "tool",
    badge: "Interactive Tool",
    topics: ["backlinks", "seo", "strategy"],
    title: "CollabIQ — Partnership Intelligence Tool",
    sub: "Find partnership, co-marketing, and distribution opportunities by industry.",
    blurb:
      "Go beyond link building. Surface co-marketing allies, content collaborators, referral networks, and distribution partners — with qualification scoring and outreach templates. 15+ industries mapped.",
    href: "/tools/collabiq",
    y: "2026",
    newsHeadline: "The Partnership Desk",
    newsDeck: "Co-marketing, distribution, and link opportunities across every industry, mapped",
    cta: "Use the Tool",
  },

  // ── CALCULATORS ─────────────────────────────────────────────────────────
  {
    id: "calc-authority",
    type: "calculator",
    badge: "Calculator",
    topics: ["pr", "strategy"],
    title: "The Authority Cost Calculator",
    sub: "Renting credibility vs. owning it — the real numbers.",
    blurb:
      "What do agency retainers, bought links, and sponsored placements actually cost over a year? Calculate your number versus owning authority through earned media.",
    href: "/tools/authority-calculator",
    y: "2025",
    newsHeadline: "Renting vs. Owning",
    newsDeck: "Calculate what credibility really costs you over twelve months",
    cta: "Run the Calculator",
  },

  // ── QUIZZES ─────────────────────────────────────────────────────────────
  {
    id: "quiz-founder-press",
    type: "quiz",
    badge: "Score Quiz",
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
  },
  {
    id: "quiz-personal-brand",
    type: "quiz",
    badge: "Brand Quiz",
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
  },

  // ── ARTICLES ─────────────────────────────────────────────────────────────
  {
    id: "art-writing-tips",
    type: "article",
    badge: "Article",
    topics: ["writing", "content-marketing"],
    title: "100+ Writing Tips to Become a Great Writer",
    slug: "writing-tips",
    cat: "Craft",
    y: "2016",
    updated: "2022",
    newsHeadline: "The Writer's Rulebook",
    newsDeck: "Every rule serious writers live by, in one place",
  },
  {
    id: "art-good-writer",
    type: "article",
    badge: "Article",
    topics: ["writing"],
    title: "How to Become a Good Writer",
    slug: "become-a-good-writer",
    cat: "Craft",
    y: "—",
    external: true,
    newsHeadline: "Made, Not Born",
    newsDeck: "The habits and disciplines that turn anyone into a writer",
  },
  {
    id: "art-productivity",
    type: "article",
    badge: "Article",
    topics: ["strategy"],
    title: "6 Productivity Hacks for Entrepreneurs",
    slug: "6-productivity-hacks-entrepreneurs",
    cat: "Operating",
    y: "2021",
    external: true,
    newsHeadline: "The Founder's Edge",
    newsDeck: "Six habits that give entrepreneurs an unfair time advantage",
  },
  {
    id: "art-digital-tools",
    type: "article",
    badge: "Article",
    topics: ["writing", "content-marketing"],
    title: "6 Must-Have Digital Tools for Writers",
    slug: "digital-tools-writers-editors",
    cat: "Tools",
    y: "2020",
    external: true,
    newsHeadline: "Tools of the Trade",
    newsDeck: "Six digital tools that make writing faster and sharper",
  },
  {
    id: "art-analytics",
    type: "article",
    badge: "Article",
    topics: ["seo", "content-marketing"],
    title: "5 Google Analytics Metrics for Content Marketers",
    slug: "google-analytics-content-marketing",
    cat: "Measurement",
    y: "2020",
    external: true,
    newsHeadline: "Read the Numbers",
    newsDeck: "The five analytics signals that tell you if your content is working",
  },
  {
    id: "art-ecommerce",
    type: "article",
    badge: "Article",
    topics: ["strategy", "content-marketing"],
    title: "How To Maximize eCommerce Conversions",
    slug: "maximize-ecommerce-conversions-using-product-discovery",
    cat: "Strategy",
    y: "—",
    external: true,
    newsHeadline: "The Conversion Code",
    newsDeck: "How product discovery turns browsers into buyers",
  },

  // ── VISUAL ESSAYS ────────────────────────────────────────────────────────
  {
    id: "ve-hubstaff",
    type: "visual-essay",
    badge: "Visual Essay",
    topics: ["strategy"],
    title: "Managing Remote Teams with HubStaff",
    blurb:
      "Time tracking, trust, and async communication across distributed teams. Originally produced in partnership with HubStaff.",
    href: "https://syedirfanajmal.com/managing-remote-teams-with-hubstaff-time-tracking/",
    y: "2016",
    updated: "2021",
    newsHeadline: "The Great Dispersal",
    newsDeck: "Data on where work went and what it cost everyone",
  },
  {
    id: "ve-writing-habits",
    type: "visual-essay",
    badge: "Visual Essay",
    topics: ["writing"],
    title: "How to Form Writing Habits for Success",
    blurb:
      "The science of habit formation applied to a daily writing practice — cues, routines, rewards, and the research behind each.",
    href: "https://syedirfanajmal.com/form-writing-habits-success-infographic/",
    y: "—",
    newsHeadline: "Rituals of the Masters",
    newsDeck: "The daily habits that made Hemingway, King, and Didion",
  },
  {
    id: "ve-content-ideas",
    type: "visual-essay",
    badge: "Visual Essay",
    topics: ["content-marketing", "strategy"],
    title: "Getting Content Ideas from Your Customers",
    blurb:
      "Listening systems, surveys, and social mining — how to extract an endless editorial calendar from the people already talking to your business.",
    href: "https://syedirfanajmal.com/content-ideas-from-customers-infographic/",
    y: "—",
    newsHeadline: "The Voice in the Reviews",
    newsDeck: "Mining your audience for content angles that convert",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTER CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_TABS: { key: "all" | ContentType; label: string }[] = [
  { key: "all",           label: "All Resources" },
  { key: "kit",           label: "Kits" },
  { key: "tool",          label: "Tools" },
  { key: "calculator",    label: "Calculators" },
  { key: "quiz",          label: "Quizzes" },
  { key: "playbook",      label: "Playbooks" },
  { key: "article",       label: "Articles" },
  { key: "visual-essay",  label: "Visual Essays" },
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
  "kit", "tool", "calculator", "quiz", "playbook", "article", "visual-essay",
];

const GROUP_LABEL: Record<ContentType, string> = {
  "kit":           "Kits · Interactive tools & checklists",
  "tool":          "Tools · Use them right now",
  "calculator":    "Calculators · Run the numbers",
  "quiz":          "Quizzes · Score your position",
  "playbook":      "Playbooks · Deep-dive guides",
  "article":       "Articles · From the archives",
  "visual-essay":  "Visual Essays · Research made visible",
};

// ─────────────────────────────────────────────────────────────────────────────
// NEWSPAPER SNIPPET
// ─────────────────────────────────────────────────────────────────────────────

function NewspaperSnippet({ headline, deck }: { headline: string; deck: string }) {
  return (
    <div
      aria-hidden
      style={{
        height: 82,
        marginBottom: 20,
        background: PAPER2,
        border: `1px solid ${INK}`,
        padding: "8px 11px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 6, letterSpacing: "0.28em", textTransform: "uppercase", color: INK55 }}>
          Bureau Gazette
        </span>
        <span style={{ fontFamily: GROT, fontSize: 6, color: "rgba(26,20,16,.32)", letterSpacing: "0.12em" }}>
          MMXXVI
        </span>
      </div>
      <div style={{ borderTop: "2px solid", borderTopColor: INK, marginBottom: 2 }} />
      <div style={{ borderTop: "0.75px solid", borderTopColor: INK, marginBottom: 7 }} />
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 12.5, color: INK, lineHeight: 1.15, textTransform: "uppercase", letterSpacing: "-0.005em", marginBottom: 6 }}>
        {headline}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 7px", borderTop: "0.5px solid rgba(26,20,16,.2)", paddingTop: 4 }}>
        <div style={{ fontFamily: SERIF, fontSize: 7, color: INK55, lineHeight: 1.5 }}>{deck}</div>
        <div style={{ fontFamily: SERIF, fontSize: 7, color: "rgba(26,20,16,.3)", lineHeight: 1.5 }}>
          The SIA Bureau · Research desk · syedirfanajmal.com
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARDS
// ─────────────────────────────────────────────────────────────────────────────

function InteractiveCard({ item }: { item: InteractiveContent }) {
  const [hover, setHover] = useState(false);
  const isExternal = item.href.startsWith("http");

  if (item.comingSoon) {
    return (
      <div
        style={{
          display: "flex", flexDirection: "column",
          padding: "28px 24px 22px",
          background: PAPER,
          minHeight: 340, height: "100%",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <Pill size={10} ls="0.18em">{item.badge}</Pill>
          <span style={{ padding: "3px 8px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Coming Soon
          </span>
        </div>
        <NewspaperSnippet headline={item.newsHeadline} deck={item.newsDeck} />
        <h3 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em" }}>
          {item.title}
        </h3>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: INK70, lineHeight: 1.35, flex: 1 }}>
          {item.sub}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${INK15}` }}>
          <SCaps size={10} ls="0.12em" color={INK55}>{item.y}</SCaps>
        </div>
      </div>
    );
  }

  return (
    <a
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column",
        padding: "28px 24px 22px",
        background: hover ? PAPER2 : PAPER,
        textDecoration: "none", color: INK,
        transition: "background 0.14s",
        minHeight: 340, height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <Pill size={10} ls="0.18em">{item.badge}</Pill>
      </div>
      <NewspaperSnippet headline={item.newsHeadline} deck={item.newsDeck} />
      <h3 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em" }}>
        {item.title}
      </h3>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: INK70, lineHeight: 1.35, marginBottom: 12, flex: 1 }}>
        {item.sub}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <SCaps size={10} ls="0.12em" color={INK55}>
          {item.y}{item.updated ? ` · upd. ${item.updated}` : ""}
        </SCaps>
        <SCaps size={10.5} ls="0.16em" color={INK}>{item.cta} ↗</SCaps>
      </div>
    </a>
  );
}

function PlaybookCard({ item }: { item: PlaybookContent }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={`/resources/${item.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column",
        padding: "28px 24px 22px",
        background: hover ? PAPER2 : PAPER,
        textDecoration: "none", color: INK,
        transition: "background 0.14s",
        minHeight: 320, height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <Pill size={10} ls="0.18em">{item.badge}</Pill>
      </div>
      <NewspaperSnippet headline={item.newsHeadline} deck={item.newsDeck} />
      <h3 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em" }}>
        {item.title}
      </h3>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: INK70, lineHeight: 1.35, marginBottom: 12, flex: 1 }}>
        {item.sub}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <SCaps size={10} ls="0.12em" color={INK55}>{item.wc} · {item.read}</SCaps>
        <SCaps size={10.5} ls="0.16em" color={INK}>Read the guide ↗</SCaps>
      </div>
    </a>
  );
}

function ArticleCard({ item }: { item: ArticleContent }) {
  const [hover, setHover] = useState(false);
  const href = item.external
    ? `https://syedirfanajmal.com/${item.slug}/`
    : `/resources/${item.slug}`;
  return (
    <a
      href={href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column",
        padding: "28px 24px 22px",
        background: hover ? PAPER2 : PAPER,
        textDecoration: "none", color: INK,
        transition: "background 0.14s",
        minHeight: 340, height: "100%",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Pill size={9.5} ls="0.18em">Article · {item.cat}</Pill>
      </div>
      <NewspaperSnippet headline={item.newsHeadline} deck={item.newsDeck} />
      <h4 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: 21, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em", flex: 1 }}>
        {item.title}
      </h4>
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <SCaps size={9} ls="0.13em" color="rgba(26,20,16,.42)">
          {item.y}{item.updated ? ` · upd. ${item.updated}` : ""}
        </SCaps>
        <SCaps size={10} ls="0.16em" color={INK}>Read ↗</SCaps>
      </div>
    </a>
  );
}

function VisualEssayCard({ item }: { item: VisualEssayContent }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column",
        padding: "28px 24px 22px",
        background: hover ? PAPER2 : PAPER,
        textDecoration: "none", color: INK,
        transition: "background 0.14s",
        minHeight: 320, height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <Pill size={9.5} ls="0.14em">Visual Essay</Pill>
      </div>
      <NewspaperSnippet headline={item.newsHeadline} deck={item.newsDeck} />
      <h4 style={{ margin: "0 0 10px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em" }}>
        {item.title}
      </h4>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14.5, color: INK70, lineHeight: 1.5, flex: 1 }}>
        {item.blurb}
      </p>
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <SCaps size={9} ls="0.12em" color={INK55}>{item.y}{item.updated ? ` · upd. ${item.updated}` : ""}</SCaps>
        <SCaps size={10} ls="0.16em" color={INK}>View Original ↗</SCaps>
      </div>
    </a>
  );
}

function ResourceCard({ item }: { item: ContentItem }) {
  const INTERACTIVE: ContentType[] = ["kit", "tool", "calculator", "quiz"];
  if (INTERACTIVE.includes(item.type)) return <InteractiveCard item={item as InteractiveContent} />;
  if (item.type === "playbook")         return <PlaybookCard item={item as PlaybookContent} />;
  if (item.type === "article")          return <ArticleCard item={item as ArticleContent} />;
  if (item.type === "visual-essay")     return <VisualEssayCard item={item as VisualEssayContent} />;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// BORDER HELPER
// ─────────────────────────────────────────────────────────────────────────────

function cellBorder(i: number, n: number, cols = 3): React.CSSProperties {
  return {
    borderRight: (i + 1) % cols !== 0 ? `1px solid ${INK}` : "none",
    borderBottom:
      Math.floor(i / cols) < Math.floor((n - 1) / cols)
        ? `1px solid ${INK}`
        : "none",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BAR
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
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: INK, borderBottom: `2px solid ${YEL}` }}>
      {/* Row 1 — Type tabs */}
      <div
        style={{
          display: "flex", alignItems: "stretch",
          padding: "0 20px",
          overflowX: "auto",
          borderBottom: "1px solid rgba(241,235,222,.10)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", paddingRight: 20, marginRight: 4, flexShrink: 0, borderRight: "1px solid rgba(241,235,222,.12)" }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(241,235,222,.3)" }}>
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
                color: isActive ? YEL : "rgba(241,235,222,.5)",
                borderBottom: isActive ? `2px solid ${YEL}` : "2px solid transparent",
                marginBottom: -2, whiteSpace: "nowrap",
                transition: "color 0.12s, border-color 0.12s",
              }}
            >
              {tab.label}
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", color: isActive ? YEL : "rgba(241,235,222,.22)" }}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 2 — Topic pills */}
      <div style={{ display: "flex", alignItems: "center", padding: "7px 20px", gap: 7, overflowX: "auto" }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(241,235,222,.28)", flexShrink: 0, marginRight: 4 }}>
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
                border: `1px solid ${isActive ? YEL : "rgba(241,235,222,.18)"}`,
                background: isActive ? YEL : "transparent",
                color: isActive ? INK : "rgba(241,235,222,.52)",
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
              color: "rgba(241,235,222,.4)",
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            ✕ Clear
          </button>
        )}
        <span style={{ marginLeft: "auto", flexShrink: 0, fontFamily: GROT, fontWeight: 600, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(241,235,222,.22)" }}>
          {count} of {CONTENT.length}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT GRID
// ─────────────────────────────────────────────────────────────────────────────

function ContentGrid({ filtered, activeType }: { filtered: ContentItem[]; activeType: "all" | ContentType }) {
  if (filtered.length === 0) {
    return (
      <div className="sx" style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center", borderTop: `1px solid ${INK}` }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: INK55, margin: 0 }}>
          No resources match this filter.
        </p>
        <p style={{ marginTop: 10, fontFamily: GROT, fontSize: 10.5, color: "rgba(26,20,16,.32)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Try clearing a topic filter or selecting a different type.
        </p>
      </div>
    );
  }

  return (
    <div className="sx" style={{ paddingTop: 48, paddingBottom: 80, borderTop: `1px solid ${INK}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `1px solid ${INK}` }}>
        {filtered.map((item, i) => (
          <div key={item.id} style={cellBorder(i, filtered.length)}>
            <ResourceCard item={item} />
          </div>
        ))}
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
      className="sx"
      style={{ background: INK, color: PAPER, paddingTop: 90, paddingBottom: 90, borderTop: `3px solid ${YEL}` }}
    >
      <SectionMast n="08" label="Podcast · 39 Episodes" dark />
      <div className="grid-intro">
        <div>
          <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: PAPER, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
            The show<br />
            <span style={{ fontStyle: "italic" }}><Mark>on the air.</Mark></span>
          </h2>
          <p style={{ marginTop: 22, fontFamily: SERIF, fontSize: 19, color: "rgba(241,235,222,.72)", lineHeight: 1.55, maxWidth: 480 }}>
            39 episodes on earned media, SEO-PR, content marketing, and building a brand that gets found.
          </p>
        </div>
        <div>
          <div style={{ border: "1px solid rgba(241,235,222,.2)", padding: 32, marginBottom: 16 }}>
            <SCaps size={10.5} ls="0.18em" color={YEL}>Browse the archive</SCaps>
            <p style={{ margin: "14px 0 24px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: PAPER, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
              All 39 episodes — tactics, case studies, and conversations with marketing leaders.
            </p>
            <a href="/podcast" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px", background: YEL, color: INK, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Go to the Podcast →
            </a>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[{ name: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466" }, { name: "Spotify", href: "#" }].map((p) => (
              <a key={p.name} href={p.href} target={p.href !== "#" ? "_blank" : undefined} rel={p.href !== "#" ? "noopener noreferrer" : undefined}
                style={{ padding: "10px 16px", border: "1px solid rgba(241,235,222,.25)", color: "rgba(241,235,222,.6)", textDecoration: "none", fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {p.name} ↗
              </a>
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
    <section id="res-press" className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}` }}>
      <SectionMast n="09" label="Bylines & Citations · Selected publications" />
      <div className="grid-intro" style={{ marginBottom: 40 }}>
        <h2 className="h2-lg" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
          Where the<br />
          <span style={{ fontStyle: "italic" }}><Mark>writing has gone.</Mark></span>
        </h2>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
          Publications I have written for, been quoted in, or been featured by. A fuller index lives on the About page.
        </p>
      </div>
      <div className="grid-press-2" style={{ border: `1px solid ${INK}` }}>
        {PRESS_OUTLETS.map(([n, note]) => (
          <div key={n} className="press-cell" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "16px 26px", alignItems: "baseline" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, color: INK }}>{n}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, textAlign: "right" }}>{note}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 36, textAlign: "center" }}>
        <a href="/about#press" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          See the full press archive →
        </a>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function ResourcesClientShell() {
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

  const clearTopics = useCallback(() => setActiveTopics(new Set()), []);

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
      <FilterBar
        activeType={activeType}
        setActiveType={handleSetType}
        activeTopics={activeTopics}
        toggleTopic={toggleTopic}
        clearTopics={clearTopics}
        count={filtered.length}
      />
      <ContentGrid filtered={filtered} activeType={activeType} />
      <PodcastTeaser />
      <PressSection />
    </>
  );
}
