import { Colophon, Mast, Subscriptions } from "@/components/bureau";
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
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

const INFOGRAPHICS: ReadonlyArray<{
  n: string;
  title: string;
  subtitle: string;
  description: string;
  stats: ReadonlyArray<{ value: string; label: string }>;
  tags: ReadonlyArray<string>;
}> = [
  {
    n: "01",
    title: "The EMOS Framework",
    subtitle: "Earned Media Operating System — Visual Guide",
    description:
      "The complete six-step system for landing press coverage without a PR agency. From positioning audit to placement amplification. Used by DMR.agency clients across the US, EU, and MENA.",
    stats: [
      { value: "6", label: "Steps" },
      { value: "90d", label: "To first placement" },
      { value: "300%", label: "Avg. inbound lift" },
    ],
    tags: ["Earned Media", "PR", "Framework"],
  },
  {
    n: "02",
    title: "Personal Brand Pyramid",
    subtitle: "The Five Layers of a Defensible Personal Brand",
    description:
      "A visual model for building a personal brand that compounds. From core positioning at the base to media presence and speaking authority at the apex. Each layer enables the next.",
    stats: [
      { value: "5", label: "Layers" },
      { value: "12–18mo", label: "To full build" },
      { value: "∞", label: "Compounding value" },
    ],
    tags: ["Personal Branding", "Positioning", "Authority"],
  },
  {
    n: "03",
    title: "Content Marketing Flywheel",
    subtitle: "How Long-Form Content Drives Compounding Growth",
    description:
      "The virtuous cycle: research-backed content → SEO rankings → organic traffic → press opportunities → authority → more inbound. Most brands break the cycle at step three.",
    stats: [
      { value: "7", label: "Flywheel stages" },
      { value: "6–12mo", label: "To see compounding" },
      { value: "40%", label: "Avg. organic lift Y2" },
    ],
    tags: ["Content Strategy", "SEO", "Flywheel"],
  },
  {
    n: "04",
    title: "Neuromarketing Cheat Sheet",
    subtitle: "12 Cognitive Biases Every Marketer Must Know",
    description:
      "A one-page visual reference for the most commercially relevant cognitive biases — from social proof and scarcity to anchoring and the IKEA effect. With real-world application examples.",
    stats: [
      { value: "12", label: "Biases covered" },
      { value: "3", label: "Categories" },
      { value: "100%", label: "Peer-reviewed sources" },
    ],
    tags: ["Neuromarketing", "Psychology", "Copywriting"],
  },
  {
    n: "05",
    title: "The Authority Content Matrix",
    subtitle: "Mapping Content Types to Buying Stages",
    description:
      "A 2×2 matrix mapping content formats (long-form, short-form, visual, spoken) against the buyer journey (awareness, consideration, decision, advocacy). With format recommendations for each quadrant.",
    stats: [
      { value: "4", label: "Quadrants" },
      { value: "16", label: "Content formats" },
      { value: "B2B/B2C", label: "Applicable" },
    ],
    tags: ["Content Strategy", "Buyer Journey", "Planning"],
  },
];

export default function InfographicsPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px 56px" }}>
        <SectionMast n="00" label="Visual Desk · Infographics & Frameworks" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "end",
            marginBottom: 48,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
            }}
          >
            5 frameworks.
            <br />
            <span style={{ fontStyle: "italic" }}>
              <Mark>One page each.</Mark>
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: INK70 }}>
            Visual frameworks and reference guides distilling years of research
            into one-page formats. Built for marketers, founders, and consultants
            who want to understand complex ideas fast.
          </p>
        </div>
      </section>

      <HRule />

      {/* ── Infographics ─────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="01" label="The Collection · All Five" />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {INFOGRAPHICS.map(({ n, title, subtitle, description, stats, tags }, i) => (
            <div
              key={n}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 280px",
                gap: 48,
                padding: "48px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "start",
              }}
            >
              {/* Number */}
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 52,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: INK15,
                    fontFamily: SERIF,
                  }}
                >
                  {n}
                </div>
              </div>

              {/* Content */}
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {tags.map((tag) => (
                    <Pill key={tag} size={9.5} ls="0.12em">{tag}</Pill>
                  ))}
                </div>
                <h2
                  style={{
                    margin: "0 0 6px",
                    fontWeight: 700,
                    fontSize: 32,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </h2>
                <div style={{ marginBottom: 16 }}>
                  <SCaps size={10.5} ls="0.14em" color={YEL}>{subtitle}</SCaps>
                </div>
                <HRule />
                <p
                  style={{
                    margin: "16px 0 0",
                    fontSize: 16.5,
                    lineHeight: 1.65,
                    color: INK70,
                    maxWidth: 560,
                  }}
                >
                  {description}
                </p>
                <a
                  href={`#infographic-${n}`}
                  style={{
                    marginTop: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: GROT,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: INK,
                    textDecoration: "none",
                  }}
                >
                  View infographic →
                </a>
              </div>

              {/* Stats */}
              <div
                style={{
                  background: PAPER2,
                  padding: "24px",
                  border: `1px solid ${INK15}`,
                }}
              >
                <SCaps size={10.5} ls="0.16em" style={{ display: "block", marginBottom: 16 }}>
                  At a glance
                </SCaps>
                {stats.map(({ value, label }) => (
                  <div
                    key={label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      padding: "10px 0",
                      borderBottom: `1px solid ${INK15}`,
                      alignItems: "baseline",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 22,
                        lineHeight: 1,
                        letterSpacing: "-0.01em",
                        color: YEL,
                        fontFamily: SERIF,
                      }}
                    >
                      {value}
                    </div>
                    <SCaps size={10} ls="0.12em" color={INK55}>{label}</SCaps>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Coming up ────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="02" label="In Production · Coming Next" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 20px",
                fontWeight: 700,
                fontSize: 48,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
              }}
            >
              More on the{" "}
              <span style={{ fontStyle: "italic" }}>press.</span>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              Subscribe to the bureau newsletter to receive new infographics
              before they&rsquo;re published here. Two emails a month — no filler.
            </p>
          </div>

          <div>
            {[
              "The SEO Authority Pyramid",
              "Writing Formats by Reading Level",
              "The B2B Buyer Journey Map",
              "PR Pitch Formula Reference Card",
            ].map((title, i) => (
              <div
                key={title}
                style={{
                  padding: "14px 0",
                  borderBottom: `1px solid ${INK15}`,
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 80px",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <SCaps size={10.5} ls="0.12em" color={INK35}>
                  {String(i + 6).padStart(2, "0")}.
                </SCaps>
                <div style={{ fontFamily: SERIF, fontSize: 16, color: INK70, fontStyle: "italic" }}>
                  {title}
                </div>
                <Pill size={9} ls="0.10em">Soon</Pill>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Subscriptions sectionNumber="03" />
      <Colophon />
    </div>
  );
}
