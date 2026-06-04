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
  private?: boolean;
  beta?: boolean;
  underReview?: boolean;
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
  },

  // ── TOOLS ────────────────────────────────────────────────────────────────
  {
    id: "tool-collabiq",
    type: "tool",
    badge: "Interactive Tool",
    beta: true,
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
    beta: true,
    topics: ["pr", "strategy"],
    title: "Authority ROI Calculator",
    sub: "Renting credibility vs. owning it. The real numbers.",
    blurb:
      "What do agency retainers, bought links, and sponsored placements actually cost over a year? Calculate your ROI versus owning authority through earned media.",
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
    id: "art-digital-tools",
    type: "article",
    badge: "Article",
    topics: ["writing", "content-marketing"],
    title: "6 Must-Have Digital Tools for Writers",
    slug: "digital-tools-writers-editors",
    cat: "Tools",
    y: "2020",
    external: true,
    private: true,
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
    private: true,
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
    private: true,
    newsHeadline: "The Conversion Code",
    newsDeck: "How product discovery turns browsers into buyers",
  },

  // ── VISUAL ESSAYS ────────────────────────────────────────────────────────
  {
    id: "ve-hubstaff",
    type: "visual-essay",
    badge: "Visual Essay",
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
    private: true,
    newsHeadline: "Rituals of the Masters",
    newsDeck: "The daily habits that made Hemingway, King, and Didion",
  },
  {
    id: "ve-content-ideas",
    type: "visual-essay",
    badge: "Visual Essay",
    topics: ["content-marketing", "strategy"],
    private: true,
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

const TYPE_ACCENT: Record<ContentType, string> = {
  "kit":           "#f5b81f",
  "tool":          "#C17817",
  "calculator":    "#5B8A72",
  "quiz":          "#8B6B99",
  "playbook":      INK,
  "article":       INK55,
  "visual-essay":  "#A0522D",
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
// NEWSPAPER SNIPPET
// ─────────────────────────────────────────────────────────────────────────────

function NewspaperSnippet({ headline, deck }: { headline: string; deck: string }) {
  return (
    <div
      aria-hidden
      style={{
        flex: 1,
        minHeight: 72,
        background: PAPER2,
        border: `1px solid ${INK}`,
        padding: "8px 10px",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 6, letterSpacing: "0.28em", textTransform: "uppercase", color: INK55 }}>
          Irfan Ajmal
        </span>
        <span style={{ fontFamily: GROT, fontSize: 6, color: "rgba(26,20,16,.32)", letterSpacing: "0.12em" }}>
          MMXXVI
        </span>
      </div>
      <div style={{ borderTop: `2px solid ${INK}`, marginBottom: 2 }} />
      <div style={{ borderTop: `0.75px solid ${INK}`, marginBottom: 7 }} />
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 12, color: INK, lineHeight: 1.15, textTransform: "uppercase", letterSpacing: "-0.005em", marginBottom: 5 }}>
        {headline}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 7px", borderTop: "0.5px solid rgba(26,20,16,.2)", paddingTop: 4 }}>
        <div style={{ fontFamily: SERIF, fontSize: 7, color: INK55, lineHeight: 1.5 }}>{deck}</div>
        <div style={{ fontFamily: SERIF, fontSize: 7, color: "rgba(26,20,16,.3)", lineHeight: 1.5 }}>
          syedirfanajmal.com
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: get card details for expand
// ─────────────────────────────────────────────────────────────────────────────

function getCardBlurb(item: ContentItem): string | null {
  if (item.type === "article") return null;
  return item.blurb;
}

function getCardSub(item: ContentItem): string | null {
  if (item.type === "article" || item.type === "visual-essay") return null;
  return item.sub;
}

function getCardHref(item: ContentItem): string | null {
  if (item.type === "playbook") return `/resources/${item.slug}`;
  if (item.type === "article") {
    return item.external
      ? `https://syedirfanajmal.com/${item.slug}/`
      : `/resources/${item.slug}`;
  }
  if (item.type === "visual-essay") return item.href;
  // interactive
  const interactive = item as InteractiveContent;
  if (interactive.comingSoon) return null;
  return interactive.href;
}

function getCardCta(item: ContentItem): string {
  if (item.type === "playbook") return "Read the Guide";
  if (item.type === "article") return "Read";
  if (item.type === "visual-essay") return "View Original";
  const interactive = item as InteractiveContent;
  return interactive.cta;
}

function isComingSoon(item: ContentItem): boolean {
  if (item.type === "kit" || item.type === "tool" || item.type === "calculator" || item.type === "quiz") {
    return !!(item as InteractiveContent).comingSoon;
  }
  return false;
}

function isExternal(item: ContentItem): boolean {
  if (item.type === "visual-essay") return true;
  if (item.type === "article") return !!(item as ArticleContent).external;
  if (item.type === "kit" || item.type === "tool" || item.type === "calculator" || item.type === "quiz") {
    return (item as InteractiveContent).href.startsWith("http");
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────────────────────

function IndexLabel({ index }: { index: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 7px 4px",
        background: YEL,
        color: INK,
        fontFamily: GROT,
        fontWeight: 800,
        fontSize: 8.5,
        letterSpacing: "0.16em",
        lineHeight: 1,
      }}
    >
      § {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function BetaBadge({ open }: { open?: boolean }) {
  return (
    <span
      style={{
        padding: "2px 7px",
        background: "#D4A017",
        color: INK,
        fontFamily: GROT,
        fontWeight: 800,
        fontSize: 7.5,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      Beta
    </span>
  );
}

function UnderReviewBadge({ open }: { open?: boolean }) {
  return (
    <span
      style={{
        padding: "3px 8px",
        background: open ? "rgba(250,250,250,.15)" : "rgba(26,20,16,.1)",
        color: open ? "rgba(250,250,250,.55)" : INK55,
        fontFamily: GROT,
        fontWeight: 800,
        fontSize: 8,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        border: `1px solid ${open ? "rgba(250,250,250,.2)" : INK15}`,
      }}
    >
      Under Review
    </span>
  );
}

function ComingSoonBadge({ open }: { open?: boolean }) {
  return (
    <span
      style={{
        padding: "3px 8px",
        background: open ? "rgba(250,250,250,.15)" : INK,
        color: open ? "rgba(250,250,250,.55)" : PAPER,
        fontFamily: GROT,
        fontWeight: 800,
        fontSize: 8,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      Coming Soon
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE CARD — unified expandable card
// ─────────────────────────────────────────────────────────────────────────────

function ResourceCard({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: ContentItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [hover, setHover] = useState(false);
  const accent = TYPE_ACCENT[item.type];
  const blurb = getCardBlurb(item);
  const sub = getCardSub(item);
  const href = getCardHref(item);
  const ctaText = getCardCta(item);
  const coming = isComingSoon(item);
  const ext = isExternal(item);

  // Badge label
  let badgeLabel = item.badge;
  if (item.type === "article") {
    badgeLabel = `Article · ${(item as ArticleContent).cat}`;
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: isOpen ? INK : hover ? PAPER2 : PAPER,
        cursor: "pointer",
        transition: "background .22s, color .22s",
        minHeight: isOpen ? undefined : 280,
        height: "100%",
      }}
      onClick={onToggle}
    >
      {/* ── Snippet row + toggle button ───────────────────────────────── */}
      <div
        style={{
          display: isOpen ? "none" : "flex",
          gap: 8,
          padding: "16px 16px 0",
          alignItems: "stretch",
        }}
      >
        <NewspaperSnippet headline={item.newsHeadline} deck={item.newsDeck} />
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            border: `1px solid ${INK}`,
            background: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 14,
            color: INK,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            lineHeight: 1,
          }}
          aria-label="Expand card"
        >
          +
        </button>
      </div>

      {/* ── Toggle button when open (top right) ──────────────────────── */}
      {isOpen && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            style={{
              width: 22,
              height: 22,
              flexShrink: 0,
              border: `1px solid ${PAPER}`,
              background: "none",
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 14,
              color: PAPER,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Collapse card"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Type row (badge row) ──────────────────────────────────────── */}
      <div
        style={{
          borderTop: `1px solid ${isOpen ? "rgba(250,250,250,.25)" : INK}`,
          borderBottom: `1px solid ${isOpen ? "rgba(250,250,250,.25)" : INK}`,
          borderLeft: `3px solid ${isOpen ? "rgba(250,250,250,.25)" : accent}`,
          padding: "10px 20px",
          marginTop: isOpen ? 8 : 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IndexLabel index={index} />
          <Pill size={10} ls="0.18em">{badgeLabel}</Pill>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {item.beta && <BetaBadge open={isOpen} />}
          {item.underReview && <UnderReviewBadge open={isOpen} />}
          {coming && <ComingSoonBadge open={isOpen} />}
        </div>
      </div>

      {/* ── Title + sub ──────────────────────────────────────────────── */}
      <div style={{ padding: "14px 20px 0" }}>
        <h3
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 21,
            letterSpacing: "-0.015em",
            lineHeight: 1.1,
            color: isOpen ? PAPER : INK,
          }}
        >
          {item.title}
        </h3>
        {sub && (
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14.5,
              color: isOpen ? "rgba(250,250,250,.55)" : INK55,
              marginTop: 5,
            }}
          >
            {sub}
          </div>
        )}
      </div>

      {/* ── Closed footer ────────────────────────────────────────────── */}
      {!isOpen && (
        <div
          style={{
            marginTop: "auto",
            borderTop: `1px solid ${INK15}`,
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontFamily: GROT,
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: INK55,
            }}
          >
            {item.y}{item.updated ? ` · upd. ${item.updated}` : ""}
          </span>
          {!coming && href && (
            <span
              style={{
                fontFamily: GROT,
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: INK,
              }}
            >
              {ctaText} ↗
            </span>
          )}
        </div>
      )}

      {/* ── Open body: blurb, topics, CTA ────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            padding: "14px 20px 20px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {blurb && (
            <p
              style={{
                margin: "0 0 18px",
                fontFamily: SERIF,
                fontSize: 15.5,
                color: "rgba(250,250,250,.78)",
                lineHeight: 1.65,
              }}
            >
              {blurb}
            </p>
          )}

          {/* Topic tags */}
          {item.topics.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {item.topics.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "4px 9px 5px",
                    border: "1px solid rgba(250,250,250,.2)",
                    fontFamily: GROT,
                    fontWeight: 700,
                    fontSize: 8.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(250,250,250,.45)",
                  }}
                >
                  {TOPIC_LABEL[t]}
                </span>
              ))}
            </div>
          )}

          {/* CTA row */}
          <div
            style={{
              borderTop: "1px solid rgba(250,250,250,.15)",
              paddingTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: "auto",
            }}
          >
            {coming ? (
              <span
                style={{
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(250,250,250,.35)",
                }}
              >
                Available Soon
              </span>
            ) : href ? (
              <a
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener noreferrer" : undefined}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: "10px 18px",
                  border: `1px solid ${PAPER}`,
                  background: "transparent",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: PAPER,
                  textDecoration: "none",
                  transition: "background .15s, color .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = PAPER;
                  e.currentTarget.style.color = INK;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = PAPER;
                }}
              >
                {ctaText} ↗
              </a>
            ) : null}
            <span
              style={{
                fontFamily: GROT,
                fontSize: 9,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(250,250,250,.3)",
              }}
            >
              {item.y}{item.updated ? ` · upd. ${item.updated}` : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
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
          borderBottom: "1px solid rgba(250,250,250,.10)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", paddingRight: 20, marginRight: 4, flexShrink: 0, borderRight: "1px solid rgba(250,250,250,.12)" }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(250,250,250,.3)" }}>
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
                color: isActive ? YEL : "rgba(250,250,250,.48)",
                borderBottom: isActive ? `2px solid ${YEL}` : "2px solid transparent",
                marginBottom: -2, whiteSpace: "nowrap",
                transition: "color 0.12s, border-color 0.12s",
              }}
            >
              {tab.label}
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", color: isActive ? YEL : "rgba(250,250,250,.22)" }}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 2 — Topic pills */}
      <div style={{ display: "flex", alignItems: "center", padding: "7px 20px", gap: 7, overflowX: "auto" }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(250,250,250,.28)", flexShrink: 0, marginRight: 4 }}>
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
                border: `1px solid ${isActive ? YEL : "rgba(250,250,250,.18)"}`,
                background: isActive ? YEL : "transparent",
                color: isActive ? INK : "rgba(250,250,250,.5)",
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
              color: "rgba(250,250,250,.4)",
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            ✕ Clear
          </button>
        )}
        <span style={{ marginLeft: "auto", flexShrink: 0, fontFamily: GROT, fontWeight: 600, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,250,250,.22)" }}>
          {count}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT GRID
// ─────────────────────────────────────────────────────────────────────────────

function ContentGrid({
  filtered,
  activeType,
  openId,
  setOpenId,
}: {
  filtered: ContentItem[];
  activeType: "all" | ContentType;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const liveItems = filtered.filter((c) => !c.private);
  const comingBackItems = filtered.filter((c) => c.private);

  if (liveItems.length === 0 && comingBackItems.length === 0) {
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
      {liveItems.length > 0 && (
        <div
          className="res-card-grid"
          style={{
            display: "grid",
            gap: "28px",
          }}
        >
          {liveItems.map((item, i) => {
            const cardOpen = openId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  overflow: "visible",
                  border: `1px solid ${INK}`,
                }}
              >
                <ResourceCard
                  item={item}
                  index={i}
                  isOpen={cardOpen}
                  onToggle={() => setOpenId(cardOpen ? null : item.id)}
                />
              </div>
            );
          })}
        </div>
      )}
      {comingBackItems.length > 0 && (
        <ComingBackSection items={comingBackItems} />
      )}
    </div>
  );
}

function ComingBackSection({ items }: { items: ContentItem[] }) {
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55 }}>
          Being Updated
        </span>
        <div style={{ flex: 1, height: 1, background: INK15 }} />
        <span style={{ fontFamily: GROT, fontWeight: 600, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,20,16,.28)" }}>
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: INK15, border: `1px solid ${INK15}` }}>
        {items.map((item) => (
          <div key={item.id} style={{ background: PAPER, padding: "16px 18px 14px", opacity: 0.55, borderLeft: `3px solid ${TYPE_ACCENT[item.type]}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Pill size={8} ls="0.16em">{item.badge}</Pill>
              <span style={{ marginLeft: "auto", padding: "2px 6px", background: "rgba(26,20,16,.08)", fontFamily: GROT, fontWeight: 700, fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55 }}>
                Updating
              </span>
            </div>
            <h5 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: INK, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {item.title}
            </h5>
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
          <p style={{ marginTop: 22, fontFamily: SERIF, fontSize: 19, color: "rgba(250,250,250,.72)", lineHeight: 1.55, maxWidth: 480 }}>
            39 episodes on earned media, SEO-PR, content marketing, and building a brand that gets found.
          </p>
        </div>
        <div>
          <div style={{ border: "1px solid rgba(250,250,250,.2)", padding: 32, marginBottom: 16 }}>
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
                style={{ padding: "10px 16px", border: "1px solid rgba(250,250,250,.25)", color: "rgba(250,250,250,.6)", textDecoration: "none", fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
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
// RESPONSIVE STYLES (injected once)
// ─────────────────────────────────────────────────────────────────────────────

function ResponsiveGridStyle() {
  return (
    <style>{`
      .res-card-grid {
        grid-template-columns: repeat(2, 1fr);
        max-width: 960px;
        margin: 0 auto;
      }
      @media (max-width: 660px) {
        .res-card-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function ResourcesClientShell() {
  const [activeType, setActiveType] = useState<"all" | ContentType>("all");
  const [activeTopics, setActiveTopics] = useState<Set<TopicKey>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleTopic = useCallback((topicId: TopicKey) => {
    setActiveTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
    setOpenId(null);
  }, []);

  const clearTopics = useCallback(() => {
    setActiveTopics(new Set());
    setOpenId(null);
  }, []);

  const handleSetType = useCallback((type: "all" | ContentType) => {
    setActiveType(type);
    setActiveTopics(new Set());
    setOpenId(null);
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
      <ResponsiveGridStyle />
      <FilterBar
        activeType={activeType}
        setActiveType={handleSetType}
        activeTopics={activeTopics}
        toggleTopic={toggleTopic}
        clearTopics={clearTopics}
        count={filtered.length}
      />
      <ContentGrid
        filtered={filtered}
        activeType={activeType}
        openId={openId}
        setOpenId={setOpenId}
      />
      <PodcastTeaser />
      <PressSection />
    </>
  );
}
