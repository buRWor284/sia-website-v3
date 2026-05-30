"use client";

import { useEffect, useState } from "react";
import {
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  GROT,
  INK,
  INK15,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ─── Filter Dimensions ────────────────────────────────────────────────────────

const TOPICS = [
  "SEO / GEO Backlinking",
  "Digital PR",
  "Content Marketing",
] as const;

const FORMATS = [
  "Kit",
  "Playbook",
  "Long-form Essay",
  "Short Article",
  "Infographic",
  "Tool",
] as const;

const EXPERIENCES = ["Interactive", "Calculator", "Quiz"] as const;

type Topic = (typeof TOPICS)[number];
type Format = (typeof FORMATS)[number];
type Experience = (typeof EXPERIENCES)[number];

interface Meta {
  topics?: Topic[];
  formats: Format[];
  experiences?: Experience[];
}

function matches(
  item: Meta,
  t: Topic | null,
  f: Format | null,
  e: Experience | null
): boolean {
  if (t && !(item.topics ?? []).includes(t)) return false;
  if (f && !item.formats.includes(f)) return false;
  if (e && !(item.experiences ?? []).includes(e)) return false;
  return true;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type Kit = Meta & {
  no: string;
  badge: string;
  title: string;
  sub: string;
  blurb: string;
  href: string;
  y: string;
  updated?: string;
  isBeta?: boolean;
};

const KITS: Kit[] = [
  {
    no: "01",
    badge: "Interactive Kit",
    title: "Top 11 Scientific Benefits of Writing",
    sub: "Eleven findings. Each with a prescription.",
    blurb:
      "Reduced anxiety, stronger memory, sharper thinking — the research-backed case for writing as a daily practice. Eleven findings, each with its study and a prescription you can follow this week.",
    href: "/infographics/writing-benefits",
    y: "2019",
    updated: "2026",
    isBeta: true,
    topics: ["Content Marketing"],
    formats: ["Kit"],
    experiences: ["Interactive"],
  },
  {
    no: "02",
    badge: "Interactive Kit",
    title: "The Journo Outreach Checklist",
    sub: "Seven steps to a pitch reporters actually paste in.",
    blurb:
      "The SIA system for working HARO, Qwoted, Source of Sources, Featured, and Help a B2B Writer — with copy-clip snippets, an interactive progress meter, and a print mode.",
    href: "/infographics/journo-outreach-checklist",
    y: "2026",
    isBeta: true,
    topics: ["Digital PR", "SEO / GEO Backlinking"],
    formats: ["Kit"],
    experiences: ["Interactive"],
  },
  {
    no: "03",
    badge: "Tool",
    title: "Authority Score Calculator",
    sub: "How much authority does your domain actually have?",
    blurb:
      "Enter your domain and get an instant read on your earned authority — built for SEO practitioners and digital PR teams who want a fast signal before pitching or prospecting.",
    href: "https://www.syedirfanajmal.com/tools/authority-calculator",
    y: "2026",
    isBeta: true,
    topics: ["SEO / GEO Backlinking"],
    formats: ["Kit", "Tool"],
    experiences: ["Calculator", "Interactive"],
  },
];

type Playbook = Meta & {
  tag: string;
  no: string;
  title: string;
  sub: string;
  blurb: string;
  slug: string;
  wc: string;
  read: string;
};

const PLAYBOOKS: Playbook[] = [
  {
    tag: "101 series",
    no: "01",
    title: "Personal Branding 101",
    sub: "How to brand yourself for success.",
    blurb:
      "A long-form guide to building a personal brand that opens doors. Five pillars: clarity, consistency, content, community, credibility. Updated for 2021.",
    slug: "personal-branding",
    wc: "~6,000 words",
    read: "24 min",
    topics: ["Content Marketing"],
    formats: ["Playbook", "Long-form Essay"],
  },
  {
    tag: "101 series",
    no: "02",
    title: "Storytelling 101",
    sub: "Elevate your brand.",
    blurb:
      "The neurological case for stories, the hero's journey applied to brand narrative, and practical frameworks for weaving storytelling through content, decks, and pitches.",
    slug: "storytelling",
    wc: "~5,500 words",
    read: "21 min",
    topics: ["Content Marketing"],
    formats: ["Playbook", "Long-form Essay"],
  },
  {
    tag: "101 series",
    no: "03",
    title: "Neuromarketing 101",
    sub: "What it is and how it works.",
    blurb:
      "Anchoring, the power of free, loss aversion, social proof, the decoy effect. Red Bull, Porsche, Coke vs. Pepsi. Real research, practical applications.",
    slug: "neuromarketing",
    wc: "~3,200 words",
    read: "13 min",
    topics: ["Content Marketing"],
    formats: ["Playbook", "Long-form Essay"],
  },
];

type Article = Meta & {
  title: string;
  slug: string;
  cat: string;
  y: string;
  updated?: string;
  external?: boolean;
};

const ARTICLES: Article[] = [
  {
    title: "100+ Writing Tips to Become a Great Writer",
    slug: "writing-tips",
    cat: "Craft",
    y: "2016",
    updated: "2022",
    topics: ["Content Marketing"],
    formats: ["Long-form Essay"],
  },
  {
    title: "How to Become a Good Writer",
    slug: "become-a-good-writer",
    cat: "Craft",
    y: "—",
    external: true,
    topics: ["Content Marketing"],
    formats: ["Short Article"],
  },
  {
    title: "6 Productivity Hacks for Entrepreneurs",
    slug: "6-productivity-hacks-entrepreneurs",
    cat: "Operating",
    y: "2021",
    external: true,
    formats: ["Short Article"],
  },
  {
    title: "6 Must-Have Digital Tools for Writers",
    slug: "digital-tools-writers-editors",
    cat: "Tools",
    y: "2020",
    external: true,
    topics: ["Content Marketing"],
    formats: ["Short Article", "Tool"],
  },
  {
    title: "5 Google Analytics Metrics for Content",
    slug: "google-analytics-content-marketing",
    cat: "Measurement",
    y: "2020",
    external: true,
    topics: ["Content Marketing"],
    formats: ["Short Article"],
  },
  {
    title: "How To Maximize eCommerce Conversions",
    slug: "maximize-ecommerce-conversions-using-product-discovery",
    cat: "Strategy",
    y: "—",
    external: true,
    formats: ["Short Article"],
  },
];

const ART = (a: Article) =>
  a.external ? `https://syedirfanajmal.com/${a.slug}/` : `/resources/${a.slug}`;

type VisualEssay = Meta & {
  no: string;
  title: string;
  blurb: string;
  href: string;
  y: string;
  updated?: string;
};

const VISUAL_ESSAYS: VisualEssay[] = [
  {
    no: "03",
    title: "Managing Remote Teams with HubStaff",
    blurb:
      "Time tracking, trust, and async communication across distributed teams. Originally produced in partnership with HubStaff.",
    href: "https://syedirfanajmal.com/managing-remote-teams-with-hubstaff-time-tracking/",
    y: "2016",
    updated: "2021",
    formats: ["Infographic"],
  },
  {
    no: "04",
    title: "How to Form Writing Habits for Success",
    blurb:
      "The science of habit formation applied specifically to a daily writing practice — cues, routines, rewards, and the research behind each.",
    href: "https://syedirfanajmal.com/form-writing-habits-success-infographic/",
    y: "—",
    topics: ["Content Marketing"],
    formats: ["Infographic"],
  },
  {
    no: "05",
    title: "Getting Content Ideas from Your Customers",
    blurb:
      "Listening systems, surveys, and social mining — how to extract an endless editorial calendar from the people already talking to your business.",
    href: "https://syedirfanajmal.com/content-ideas-from-customers-infographic/",
    y: "—",
    topics: ["Content Marketing"],
    formats: ["Infographic"],
  },
];

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

// ─── Tag Pill (on cards) ──────────────────────────────────────────────────────

function TagPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 8px 3px",
        border: "1px solid rgba(26,20,16,.14)",
        background: "rgba(26,20,16,.04)",
        fontFamily: GROT,
        fontWeight: 600,
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase" as const,
        color: INK55,
        lineHeight: 1.4,
      }}
    >
      {label}
    </span>
  );
}

// ─── Filter Pill (in bar) ─────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 11px 5px",
        border: `1px solid ${active ? YEL : "rgba(241,235,222,.22)"}`,
        background: active ? YEL : "transparent",
        color: active ? INK : "rgba(241,235,222,.65)",
        fontFamily: GROT,
        fontWeight: active ? 800 : 600,
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase" as const,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
        flexShrink: 0,
        lineHeight: 1,
        transition: "background 0.1s, color 0.1s, border-color 0.1s",
      }}
    >
      {label}
    </button>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const TOC_ITEMS = [
  { id: "res-kits", label: "Kits" },
  { id: "res-playbooks", label: "Playbooks" },
  { id: "res-articles", label: "Articles" },
  { id: "res-podcast", label: "Podcast" },
  { id: "res-visual-essays", label: "Visual Essays" },
  { id: "res-press", label: "Press" },
];

function FilterBar({
  activeTopic,
  activeFormat,
  activeExperience,
  activeSection,
  onTopic,
  onFormat,
  onExperience,
  onClear,
}: {
  activeTopic: Topic | null;
  activeFormat: Format | null;
  activeExperience: Experience | null;
  activeSection: string;
  onTopic: (t: Topic | null) => void;
  onFormat: (f: Format | null) => void;
  onExperience: (e: Experience | null) => void;
  onClear: () => void;
}) {
  const hasFilters = activeTopic || activeFormat || activeExperience;

  const DIVIDER: React.CSSProperties = {
    width: 1,
    height: 18,
    background: "rgba(241,235,222,.15)",
    flexShrink: 0,
    alignSelf: "center",
  };

  const GROUP_LABEL: React.CSSProperties = {
    fontFamily: GROT,
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(241,235,222,.32)",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: INK,
        borderBottom: `2px solid ${YEL}`,
      }}
    >
      {/* Row 1 — Section anchors */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          padding: "0 20px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch" as never,
          borderBottom: "1px solid rgba(241,235,222,.10)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingRight: 20,
            marginRight: 6,
            flexShrink: 0,
            borderRight: "1px solid rgba(241,235,222,.12)",
          }}
        >
          <span
            style={{
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(241,235,222,.35)",
            }}
          >
            Resources
          </span>
        </div>

        {TOC_ITEMS.map((item, i) => {
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 14px",
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: isActive ? 800 : 600,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isActive ? YEL : "rgba(241,235,222,.50)",
                borderBottom: isActive
                  ? `2px solid ${YEL}`
                  : "2px solid transparent",
                marginBottom: -2,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  color: isActive ? YEL : "rgba(241,235,222,.25)",
                }}
              >
                §0{i + 1}
              </span>
              {item.label}
            </a>
          );
        })}
      </div>

      {/* Row 2 — Filters */}
      <div
        style={{
          padding: "8px 20px 9px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch" as never,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            minWidth: "max-content",
          }}
        >
          <span style={GROUP_LABEL}>Topic</span>
          {TOPICS.map((t) => (
            <FilterPill
              key={t}
              label={t}
              active={activeTopic === t}
              onClick={() => onTopic(activeTopic === t ? null : t)}
            />
          ))}

          <div style={DIVIDER} />

          <span style={GROUP_LABEL}>Format</span>
          {FORMATS.map((f) => (
            <FilterPill
              key={f}
              label={f}
              active={activeFormat === f}
              onClick={() => onFormat(activeFormat === f ? null : f)}
            />
          ))}

          <div style={DIVIDER} />

          <span style={GROUP_LABEL}>Experience</span>
          {EXPERIENCES.map((e) => (
            <FilterPill
              key={e}
              label={e}
              active={activeExperience === e}
              onClick={() => onExperience(activeExperience === e ? null : e)}
            />
          ))}

          {hasFilters && (
            <>
              <div style={DIVIDER} />
              <button
                onClick={onClear}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 12px 5px",
                  border: "1px solid rgba(241,235,222,.30)",
                  background: "transparent",
                  color: "rgba(241,235,222,.55)",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  cursor: "pointer",
                  whiteSpace: "nowrap" as const,
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                × Clear
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "52px 0",
        textAlign: "center",
        border: `1px solid rgba(26,20,16,.1)`,
      }}
    >
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 17,
          color: INK55,
          margin: 0,
        }}
      >
        No {label} match the active filters.
      </p>
    </div>
  );
}

// ─── §01 · Kits ──────────────────────────────────────────────────────────────

function KitsSection({ items }: { items: Kit[] }) {
  return (
    <section
      id="res-kits"
      className="sx"
      style={{ background: PAPER, paddingTop: 0, paddingBottom: 90 }}
    >
      <SectionMast n="01" label="Kits & Tools · Interactive resources" />

      <div className="grid-intro" style={{ marginBottom: 48 }}>
        <h2
          className="h2-xl"
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            color: INK,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          Open them.
          <br />
          <span style={{ fontStyle: "italic" }}>
            <Mark>Use them today.</Mark>
          </span>
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 19,
            color: INK70,
            lineHeight: 1.55,
            maxWidth: 560,
          }}
        >
          Not just content to read — interactive tools with built-in progress
          tracking, copy-clip snippets, and print modes. Open one when you have
          a job to do.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState label="kits" />
      ) : (
        <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
          {items.map((kit, i) => (
            <a
              key={kit.title}
              href={kit.href}
              target={kit.href.startsWith("http") ? "_blank" : undefined}
              rel={
                kit.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="card-border"
              style={{
                padding: "36px 28px 28px",
                background: i % 2 === 0 ? PAPER : PAPER2,
                textDecoration: "none",
                color: INK,
                display: "flex",
                flexDirection: "column",
                minHeight: 360,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 22,
                }}
              >
                {/* Badge + Beta */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Pill size={10.5} ls="0.18em">{kit.badge}</Pill>
                  {kit.isBeta && (
                    <span
                      style={{
                        padding: "2px 7px 3px",
                        background: YEL,
                        color: INK,
                        fontFamily: GROT,
                        fontWeight: 800,
                        fontSize: 8.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      Beta
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 42,
                    color: INK,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Nº {kit.no}
                </div>
              </div>

              <div
                aria-hidden
                style={{
                  height: 72,
                  marginBottom: 24,
                  background: `repeating-linear-gradient(135deg, ${YEL} 0 8px, transparent 8px 16px)`,
                  border: `1px solid ${INK}`,
                }}
              />

              <h3
                style={{
                  margin: "0 0 10px",
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 28,
                  color: INK,
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                }}
              >
                {kit.title}
              </h3>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 18,
                  color: INK70,
                  lineHeight: 1.35,
                  marginBottom: 16,
                }}
              >
                {kit.sub}
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 15.5,
                  color: INK,
                  lineHeight: 1.55,
                  flex: 1,
                }}
              >
                {kit.blurb}
              </p>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                }}
              >
                {kit.topics?.map((t) => <TagPill key={t} label={t} />)}
                {kit.formats.map((f) => <TagPill key={f} label={f} />)}
                {kit.experiences?.map((e) => <TagPill key={e} label={e} />)}
              </div>

              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: `1px solid ${INK15}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <SCaps size={10.5} ls="0.14em" color={INK70}>
                  {kit.y}
                  {kit.updated ? ` · upd. ${kit.updated}` : ""}
                </SCaps>
                <SCaps size={10.5} ls="0.16em" color={INK}>
                  {kit.formats.includes("Tool") ? "Open the Tool ↗" : "Open the Kit ↗"}
                </SCaps>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── §02 · Playbooks ─────────────────────────────────────────────────────────

function PlaybooksSection({ items }: { items: Playbook[] }) {
  return (
    <section
      id="res-playbooks"
      className="sx"
      style={{
        background: PAPER2,
        paddingTop: 90,
        paddingBottom: 90,
        borderTop: `1px solid ${INK}`,
      }}
    >
      <SectionMast n="02" label="Playbooks · Deep-dive guides" />

      <div className="grid-intro" style={{ marginBottom: 48 }}>
        <h2
          className="h2-xl"
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            color: INK,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          Three guides
          <br />
          <span style={{ fontStyle: "italic" }}>
            <Mark>worth your hour.</Mark>
          </span>
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 19,
            color: INK70,
            lineHeight: 1.55,
            maxWidth: 560,
          }}
        >
          The 101 Series: three of the most-read pieces on the site, each a
          complete guide to a subject I have spent years putting into practice.
          Updated annually; bookmark-worthy.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState label="playbooks" />
      ) : (
        <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
          {items.map((f, i) => (
            <a
              key={f.title}
              href={`/resources/${f.slug}`}
              className="card-border"
              style={{
                padding: "32px 28px 28px",
                background: i === 1 ? PAPER : PAPER2,
                textDecoration: "none",
                color: INK,
                display: "flex",
                flexDirection: "column",
                minHeight: 460,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <Pill size={10.5} ls="0.20em">{f.tag}</Pill>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 42,
                    color: INK,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {f.no}
                </div>
              </div>
              <h3
                style={{
                  margin: "20px 0 0",
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 34,
                  color: INK,
                  lineHeight: 1.05,
                  letterSpacing: "-0.018em",
                }}
              >
                {f.title}
              </h3>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 19,
                  color: INK70,
                  lineHeight: 1.3,
                }}
              >
                {f.sub}
              </div>
              <HRule style={{ margin: "18px 0" }} />
              <p
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 15.5,
                  color: INK,
                  lineHeight: 1.55,
                  flex: 1,
                  textAlign: "justify",
                }}
              >
                {f.blurb}
              </p>
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                }}
              >
                {f.topics?.map((t) => <TagPill key={t} label={t} />)}
                {f.formats.map((fmt) => <TagPill key={fmt} label={fmt} />)}
              </div>
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: `1px solid ${INK15}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <SCaps size={10.5} ls="0.14em" color={INK70}>
                  {f.wc} &nbsp;·&nbsp; {f.read}
                </SCaps>
                <SCaps size={10.5} ls="0.16em" color={INK}>
                  Read the guide ↗
                </SCaps>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── §03 · Articles ──────────────────────────────────────────────────────────

function ArticlesSection({ items }: { items: Article[] }) {
  return (
    <section
      id="res-articles"
      className="sx"
      style={{
        background: PAPER,
        paddingTop: 90,
        paddingBottom: 90,
        borderTop: `1px solid ${INK}`,
      }}
    >
      <SectionMast n="03" label="From the archives · Selected articles" />

      {items.length === 0 ? (
        <EmptyState label="articles" />
      ) : (
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            borderTop: `2px solid ${INK}`,
          }}
        >
          {items.map((a, i) => (
            <li key={a.slug} className="article-row">
              <div
                style={{
                  fontFamily: GROT,
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  color: INK,
                }}
              >
                {String(i + 1).padStart(2, "0")}.
              </div>
              <div>
                <a
                  href={ART(a)}
                  target={a.external ? "_blank" : undefined}
                  rel={a.external ? "noopener noreferrer" : undefined}
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 21,
                    color: INK,
                    textDecoration: "none",
                    lineHeight: 1.25,
                    display: "block",
                  }}
                >
                  {a.title}
                </a>
                <div
                  style={{
                    marginTop: 7,
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                  }}
                >
                  {a.topics?.map((t) => <TagPill key={t} label={t} />)}
                  {a.formats.map((f) => <TagPill key={f} label={f} />)}
                </div>
              </div>
              <div className="article-cat">
                <SCaps size={10.5} ls="0.14em" color={INK70}>{a.cat}</SCaps>
              </div>
              <div
                className="article-year"
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 14,
                  color: INK55,
                }}
              >
                {a.y}
                {a.updated ? ` · upd. ${a.updated}` : ""}
              </div>
              <div className="article-read" style={{ textAlign: "right" }}>
                <SCaps size={10.5} ls="0.14em" color={INK55}>Read ↗</SCaps>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ─── §04 · Podcast ────────────────────────────────────────────────────────────

function PodcastTeaser() {
  return (
    <section
      id="res-podcast"
      className="sx"
      style={{
        background: INK,
        color: PAPER,
        paddingTop: 90,
        paddingBottom: 90,
        borderTop: `3px solid ${YEL}`,
      }}
    >
      <SectionMast n="04" label="Podcast · 39 Episodes" dark />

      <div className="grid-intro">
        <div>
          <h2
            className="h2-xl"
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 700,
              color: PAPER,
              lineHeight: 0.98,
              letterSpacing: "-0.025em",
            }}
          >
            The show
            <br />
            <span style={{ fontStyle: "italic" }}>
              <Mark>on the air.</Mark>
            </span>
          </h2>
          <p
            style={{
              marginTop: 22,
              fontFamily: SERIF,
              fontSize: 19,
              color: "rgba(241,235,222,.72)",
              lineHeight: 1.55,
              maxWidth: 480,
            }}
          >
            39 episodes on earned media, SEO-PR, content marketing, and
            building a brand that gets found. Conversations with founders,
            journalists, and marketing leaders.
          </p>
        </div>

        <div>
          <div
            style={{
              border: "1px solid rgba(241,235,222,.2)",
              padding: 32,
              marginBottom: 16,
            }}
          >
            <SCaps size={10.5} ls="0.18em" color={YEL}>Browse the archive</SCaps>
            <p
              style={{
                margin: "14px 0 24px",
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 22,
                color: PAPER,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              All 39 episodes — tactics, case studies, and conversations with
              marketing leaders.
            </p>
            <a
              href="/podcast"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 22px",
                background: YEL,
                color: INK,
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 11.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Go to the Podcast →
            </a>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              {
                name: "Apple Podcasts",
                href: "https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466",
              },
              { name: "Spotify", href: "#" },
            ].map((p) => (
              <a
                key={p.name}
                href={p.href}
                target={p.href !== "#" ? "_blank" : undefined}
                rel={p.href !== "#" ? "noopener noreferrer" : undefined}
                style={{
                  padding: "10px 16px",
                  border: "1px solid rgba(241,235,222,.25)",
                  color: "rgba(241,235,222,.6)",
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {p.name} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── §05 · Visual Essays ─────────────────────────────────────────────────────

function VisualEssaysSection({ items }: { items: VisualEssay[] }) {
  return (
    <section
      id="res-visual-essays"
      className="sx"
      style={{
        background: PAPER2,
        paddingTop: 90,
        paddingBottom: 90,
        borderTop: `1px solid ${INK}`,
      }}
    >
      <SectionMast n="05" label="Visual Essays · Infographics" />

      <div className="grid-intro" style={{ marginBottom: 48 }}>
        <h2
          className="h2-lg"
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            color: INK,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          Research
          <br />
          <span style={{ fontStyle: "italic" }}>
            <Mark>made visible.</Mark>
          </span>
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 18.5,
            color: INK70,
            lineHeight: 1.55,
            maxWidth: 540,
          }}
        >
          Each started as a research project and ended up reprinted across a
          half-dozen publications. Interactive redesigns are in production —
          the originals remain live in the meantime.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState label="visual essays" />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: `1px solid ${INK}`,
          }}
        >
          {items.map((ig, i) => (
            <a
              key={ig.href}
              href={ig.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr 130px",
                borderBottom:
                  i < items.length - 1 ? `1px solid ${INK}` : "none",
                background: i % 2 === 0 ? PAPER : PAPER2,
                textDecoration: "none",
                color: INK,
              }}
            >
              <div
                style={{
                  padding: "28px 0",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  borderRight: `1px solid ${INK}`,
                }}
              >
                <SCaps size={12} ls="0.06em" color={INK70}>Nº {ig.no}</SCaps>
              </div>
              <div style={{ padding: "28px 28px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <Pill size={10} ls="0.15em">Infographic</Pill>
                  <SCaps size={10} ls="0.14em" color={INK55}>
                    Redesign in production
                  </SCaps>
                </div>
                <h4
                  style={{
                    margin: "0 0 10px",
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 22,
                    color: INK,
                    lineHeight: 1.2,
                    letterSpacing: "-0.008em",
                  }}
                >
                  {ig.title}
                </h4>
                <p
                  style={{
                    margin: "0 0 14px",
                    fontFamily: SERIF,
                    fontSize: 15.5,
                    color: INK70,
                    lineHeight: 1.55,
                  }}
                >
                  {ig.blurb}
                </p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {ig.topics?.map((t) => <TagPill key={t} label={t} />)}
                  {ig.formats.map((f) => <TagPill key={f} label={f} />)}
                </div>
              </div>
              <div
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  borderLeft: `1px solid ${INK15}`,
                }}
              >
                <SCaps size={10} ls="0.12em" color={INK55}>
                  {ig.y}
                  {ig.updated ? ` · upd. ${ig.updated}` : ""}
                </SCaps>
                <SCaps size={10.5} ls="0.16em" color={INK}>View original ↗</SCaps>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ marginTop: 28, textAlign: "center" }}>
        <a
          href="/infographics"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "13px 22px",
            border: `1px solid ${INK}`,
            background: "transparent",
            color: INK,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 11.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          View all on the Infographics desk →
        </a>
      </div>
    </section>
  );
}

// ─── §06 · Press ─────────────────────────────────────────────────────────────

function PressSection() {
  return (
    <section
      id="res-press"
      className="sx"
      style={{
        background: PAPER,
        paddingTop: 90,
        paddingBottom: 90,
        borderTop: `1px solid ${INK}`,
      }}
    >
      <SectionMast n="06" label="Bylines & citations · Selected publications" />

      <div className="grid-intro" style={{ marginBottom: 40 }}>
        <h2
          className="h2-lg"
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            color: INK,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          Where the
          <br />
          <span style={{ fontStyle: "italic" }}>
            <Mark>writing has gone.</Mark>
          </span>
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 18.5,
            color: INK70,
            lineHeight: 1.55,
            maxWidth: 540,
          }}
        >
          Publications I have written for, been quoted in, or been featured by.
          A fuller index lives on the About page.
        </p>
      </div>

      <div className="grid-press-2" style={{ border: `1px solid ${INK}` }}>
        {PRESS_OUTLETS.map(([n, note]) => (
          <div
            key={n}
            className="press-cell"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
              padding: "16px 26px",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 21,
                color: INK,
              }}
            >
              {n}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                color: INK70,
                textAlign: "right",
              }}
            >
              {note}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36, textAlign: "center" }}>
        <a
          href="/about#press"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 22px",
            background: INK,
            color: PAPER,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          See the full press archive →
        </a>
      </div>
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ResourcesClientShell() {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeFormat, setActiveFormat] = useState<Format | null>(null);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);
  const [activeSection, setActiveSection] = useState("res-kits");

  useEffect(() => {
    const sections = TOC_ITEMS.map((t) =>
      document.getElementById(t.id)
    ).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-10% 0px -75% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const visibleKits = KITS.filter((k) =>
    matches(k, activeTopic, activeFormat, activeExperience)
  );
  const visiblePlaybooks = PLAYBOOKS.filter((p) =>
    matches(p, activeTopic, activeFormat, activeExperience)
  );
  const visibleArticles = ARTICLES.filter((a) =>
    matches(a, activeTopic, activeFormat, activeExperience)
  );
  const visibleVisualEssays = VISUAL_ESSAYS.filter((v) =>
    matches(v, activeTopic, activeFormat, activeExperience)
  );

  return (
    <>
      <FilterBar
        activeTopic={activeTopic}
        activeFormat={activeFormat}
        activeExperience={activeExperience}
        activeSection={activeSection}
        onTopic={(t) => setActiveTopic(t)}
        onFormat={(f) => setActiveFormat(f)}
        onExperience={(e) => setActiveExperience(e)}
        onClear={() => {
          setActiveTopic(null);
          setActiveFormat(null);
          setActiveExperience(null);
        }}
      />
      <KitsSection items={visibleKits} />
      <PlaybooksSection items={visiblePlaybooks} />
      <ArticlesSection items={visibleArticles} />
      <PodcastTeaser />
      <VisualEssaysSection items={visibleVisualEssays} />
      <PressSection />
    </>
  );
}
