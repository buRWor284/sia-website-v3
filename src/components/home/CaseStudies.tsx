import {
  GROT,
  INK,
  INK15,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";
import { HRule, Mark, SCaps, SectionMast } from "@/components/bureau/primitives";

type Case = {
  industry: string;
  title: string;
  blurb: string;
  metrics: ReadonlyArray<{ v: string; l: string }>;
  href: string;
  featured?: boolean;
};

const CASES: ReadonlyArray<Case> = [
  {
    industry: "Platform · Ridesharing",
    title: "Ridester: 0 → 1.5M monthly visitors",
    blurb:
      "460% organic growth through digital PR, visual content, and " +
      "pay-for-performance journalist outreach.",
    metrics: [
      { v: "460%",  l: "Traffic growth" },
      { v: "1.5M",  l: "Monthly visitors" },
      { v: "50+",   l: "High-authority links" },
    ],
    href: "https://dmr.agency/case-studies/ridester-seo",
  },
  {
    industry: "Finance · Authority",
    title: "Physicians Thrive: 734 → 29,000+ visitors",
    blurb:
      "A high-trust financial consultancy built durable organic visibility " +
      "through strategic earned media and journalist outreach.",
    metrics: [
      { v: "40×",   l: "Visitor growth" },
      { v: "500+",  l: "High-quality links" },
      { v: "DR 57", l: "Domain rating (from 33)" },
    ],
    href: "https://dmr.agency/case-studies/physicians-thrive",
    featured: true,
  },
  {
    industry: "E-commerce · Tyres",
    title: "$0.535M in revenue, in 5 weeks",
    blurb:
      "Through SEO and content marketing, this e-commerce store cleared " +
      "half a million USD in revenue inside five weeks.",
    metrics: [
      { v: "$535K", l: "Revenue earned" },
      { v: "5 wks", l: "Timeline" },
      { v: "#4",    l: "160K/mo keyword" },
    ],
    href: "https://dmr.agency/case-studies/tyres-ecommerce-seo/",
  },
];

export const CaseStudies = () => (
  <section style={{ background: PAPER, padding: "90px 56px" }}>
    <SectionMast n="02" label="Casework · What the numbers did" />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: 60,
        alignItems: "baseline",
        marginBottom: 48,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 76,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Selected casework,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>biggest numbers first.</Mark>
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
        A small selection of recent work, all delivered through DMR.agency.
        Click any card for the full write-up: traffic, links, revenue,
        domain rating, and the methods that moved them.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0,
        border: `1px solid ${INK}`,
      }}
    >
      {CASES.map((c, i) => (
        <a
          key={c.title}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "28px 28px 26px",
            borderRight: i < 2 ? `1px solid ${INK}` : "none",
            background: c.featured ? PAPER2 : PAPER,
            display: "flex",
            flexDirection: "column",
            minHeight: 460,
            position: "relative",
            textDecoration: "none",
            color: INK,
          }}
        >
          {c.featured && (
            <div
              style={{
                position: "absolute",
                top: -1,
                right: -1,
                padding: "7px 14px",
                background: YEL,
                color: INK,
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                border: `1px solid ${INK}`,
              }}
            >
              Featured
            </div>
          )}

          <SCaps size={10.5} ls="0.20em" color={INK70}>
            Case Nº {String(i + 1).padStart(2, "0")} · {c.industry}
          </SCaps>

          <h3
            style={{
              margin: "14px 0 0",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 30,
              color: INK,
              lineHeight: 1.08,
              letterSpacing: "-0.015em",
            }}
          >
            {c.title}
          </h3>

          <HRule style={{ margin: "18px 0" }} />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {c.metrics.map((m, j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  paddingBottom: 10,
                  borderBottom:
                    j < c.metrics.length - 1 ? `1px solid ${INK15}` : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 44,
                    color: INK,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    flexShrink: 0,
                    minWidth: 110,
                  }}
                >
                  {m.v}
                </div>
                <div>
                  <SCaps size={10.5} ls="0.14em" color={INK70}>{m.l}</SCaps>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 15.5,
              color: INK70,
              lineHeight: 1.55,
              fontStyle: "italic",
              flex: 1,
            }}
          >
            {c.blurb}
          </p>

          <div
            style={{
              marginTop: 18,
              alignSelf: "flex-start",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 17,
              color: INK,
              fontWeight: 600,
            }}
          >
            <Mark>Read the case study ↗</Mark>
          </div>
        </a>
      ))}
    </div>

    <div style={{ textAlign: "center", marginTop: 36 }}>
      <a
        href="https://dmr.agency/case-studies/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 24px",
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
        See all case studies on DMR.agency ↗
      </a>
    </div>
  </section>
);
