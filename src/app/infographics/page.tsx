"use client";

import { Colophon, Subscriptions } from "@/components/bureau";
import { DoubleRule, HRule, SCaps, SectionMast } from "@/components/bureau/primitives";
import {
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// =========================================================================
// DATA
// =========================================================================
interface InfographicCard {
  n: string;
  tag: string;
  title: string;
  blurb: string;
  href: string;
  year: string;
  status: "live" | "coming";
}

const INFOGRAPHICS: InfographicCard[] = [
  {
    n: "01",
    tag: "Interactive",
    title: "Top 11 Scientific Benefits of Writing",
    blurb:
      "Reduced anxiety, stronger memory, sharper thinking — the research-backed case " +
      "for writing as a daily practice. Eleven findings, each with its study and a " +
      "prescription you can follow this week.",
    href: "/infographics/writing-benefits",
    year: "2019 · Updated 2026",
    status: "live",
  },
  {
    n: "02",
    tag: "Interactive",
    title: "The Journo Outreach Checklist",
    blurb:
      "Seven steps to a pitch reporters actually paste in. The SIA system for " +
      "working HARO, Qwoted, Source of Sources, Featured, and Help a B2B Writer — " +
      "with copy-clip snippets, an interactive progress meter, and a print mode.",
    href: "/infographics/journo-outreach-checklist",
    year: "2026",
    status: "live",
  },
  {
    n: "03",
    tag: "Infographic",
    title: "Managing Remote Teams with HubStaff",
    blurb:
      "Time tracking, trust, and async communication across distributed teams. " +
      "Originally produced in partnership with HubStaff.",
    href: "https://syedirfanajmal.com/managing-remote-teams-with-hubstaff-time-tracking/",
    year: "2016 · Updated 2021",
    status: "coming",
  },
  {
    n: "04",
    tag: "Infographic",
    title: "How to Form Writing Habits for Success",
    blurb:
      "The science of habit formation applied specifically to a daily writing practice — " +
      "cues, routines, rewards, and the research behind each.",
    href: "https://syedirfanajmal.com/form-writing-habits-success-infographic/",
    year: "—",
    status: "coming",
  },
  {
    n: "05",
    tag: "Infographic",
    title: "Getting Content Ideas from Your Customers",
    blurb:
      "Listening systems, surveys, and social mining — how to extract an endless " +
      "editorial calendar from the people already talking to your business.",
    href: "https://syedirfanajmal.com/content-ideas-from-customers-infographic/",
    year: "—",
    status: "coming",
  },
];

// =========================================================================
// HERO
// =========================================================================
const Hero = () => (
  <section style={{ background: PAPER, padding: "56px 56px 40px" }}>
    <div style={{ textAlign: "center" }}>
      <SCaps size={11.5} ls="0.32em" color={INK70}>
        The Infographics Desk &nbsp;·&nbsp; Visual research
      </SCaps>
    </div>

    <h1
      style={{
        margin: "28px 0 0",
        textAlign: "center",
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: "clamp(56px, 8vw, 96px)",
        lineHeight: 0.95,
        letterSpacing: "-0.03em",
        color: INK,
      }}
    >
      Research made<br />
      <span style={{ fontStyle: "italic" }}>visible.</span>
    </h1>

    <div style={{ maxWidth: 640, margin: "24px auto 0", textAlign: "center" }}>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 19,
          color: INK70,
          lineHeight: 1.55,
          fontStyle: "italic",
        }}
      >
        Long-form research compressed into a single image — or in the case of
        the newest edition, an interactive page with citations, prescriptions,
        and a dose calculator.
      </p>
    </div>

    <div
      style={{
        marginTop: 40,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0,
        borderTop: `1px solid ${INK}`,
        borderBottom: `1px solid ${INK}`,
      }}
    >
      {([
        ["5", "Infographics"],
        ["2", "Interactive editions"],
        ["2019", "First published"],
      ] as [string, string][]).map(([k, v], i) => (
        <div
          key={i}
          style={{
            padding: "20px 20px",
            borderLeft: i ? `1px solid ${INK35}` : "none",
            textAlign: "center",
          }}
        >
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
            {k}
          </div>
          <div style={{ marginTop: 6 }}>
            <SCaps size={10.5} ls="0.18em" color={INK70}>{v}</SCaps>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// =========================================================================
// CARD
// =========================================================================
const InfographicCard = ({ card }: { card: InfographicCard }) => {
  const isExternal = card.href.startsWith("http");
  return (
    <a
      href={card.href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      style={{
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${INK}`,
        background: card.status === "live" ? INK : PAPER,
        color: card.status === "live" ? PAPER : INK,
        textDecoration: "none",
        padding: "28px 28px 24px",
        transition: "opacity .2s",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            color: card.status === "live" ? YEL : INK55,
          }}
        >
          Nº {card.n}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span
            style={{
              padding: "4px 10px",
              background: card.status === "live" ? YEL : PAPER2,
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK,
            }}
          >
            {card.tag}
          </span>
          {card.status === "coming" && (
            <SCaps size={10} ls="0.14em" color={INK55}>Redesign coming</SCaps>
          )}
        </div>
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          color: card.status === "live" ? PAPER : INK,
        }}
      >
        {card.title}
      </h2>

      <p
        style={{
          margin: "12px 0 0",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 15.5,
          lineHeight: 1.5,
          color: card.status === "live" ? "rgba(241,235,222,.72)" : INK70,
          flex: 1,
        }}
      >
        {card.blurb}
      </p>

      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: `1px solid ${card.status === "live" ? "rgba(241,235,222,.25)" : INK15}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <SCaps
          size={10}
          ls="0.14em"
          color={card.status === "live" ? "rgba(241,235,222,.5)" : INK55}
        >
          {card.year}
        </SCaps>
        <span
          style={{
            fontFamily: GROT,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: card.status === "live" ? YEL : INK,
          }}
        >
          {card.status === "live" ? "View →" : "View original →"}
        </span>
      </div>
    </a>
  );
};

// =========================================================================
// GRID
// =========================================================================
const Grid = () => (
  <section style={{ background: PAPER, padding: "0 56px 80px" }}>
    <SectionMast n="01" label="All infographics" />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 1,
        background: INK,
        border: `1px solid ${INK}`,
      }}
    >
      {INFOGRAPHICS.map((card) => (
        <InfographicCard key={card.n} card={card} />
      ))}
    </div>
    <div style={{ marginTop: 20 }}>
      <SCaps size={10.5} ls="0.16em" color={INK55}>
        Infographics marked "Redesign coming" link to the original WordPress edition while the new interactive version is in production.
      </SCaps>
    </div>
  </section>
);

// =========================================================================
// PAGE
// =========================================================================
export default function InfographicsPage() {
  return (
    <div style={{ background: PAPER, minHeight: "100vh" }}>
      <Hero />
      <Grid />
      <Subscriptions sectionNumber="02" />
      <Colophon />
    </div>
  );
}
