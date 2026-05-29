import {
  CALENDLY,
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
import { DoubleRule, Flag, Mark, Pill, SCaps } from "@/components/bureau/primitives";

type Line = { plain?: string; highlights?: string[]; post?: string };

const GROWTH: { eyebrow: string; lines: Line[] } = {
  eyebrow: "A Marketing Bureau · Est. 2010",
  lines: [
    { highlights: ["Get found."] },
    { highlights: ["Get covered."] },
    { highlights: ["Get customers."] },
  ],
};

const HeroHeadline = ({ lines }: { lines: Line[] }) => (
  <h1
    className="hero-h1"
    style={{
      fontFamily: SERIF,
      fontWeight: 700,
      color: INK,
    }}
  >
    {lines.map((ln, i) => (
      <span key={i} style={{ display: "block" }}>
        {ln.plain && <span>{ln.plain}</span>}
        {ln.highlights?.map((h, j) => (
          <span key={j} style={{ fontStyle: "italic", fontWeight: 600 }}>
            <Mark>{h}</Mark>
          </span>
        ))}
        {ln.post && (
          <span style={{ fontStyle: "italic", fontWeight: 600 }}>{ln.post}</span>
        )}
      </span>
    ))}
  </h1>
);

// [page-label, title, dept-label, anchor-id]
const ISSUE_ITEMS: ReadonlyArray<[string, string, string, string]> = [
  ["P. 02", "Three ways to work, plainly stated",     "Departments",   "#departments"],
  ["P. 04", "Casework, what the numbers did",         "Case Studies",  "#casework"],
  ["P. 07", "What clients have said, on the record",  "Letters",       "#letters"],
  ["P. 10", "Stages across four countries",           "Touring",       "#touring"],
  ["P. 14", "The latest dispatches",                  "The Wire",      "#wire"],
  ["P. 16", "A letter from the editor",               "Subscriptions", "#subscriptions"],
];

const STATS: ReadonlyArray<[string, string]> = [
  ["$1.2M",    "NTA · $160K → $1.2M client revenue · organic · 12 months"],
  ["1.5M /mo", "Ridester · zero to 1.5M monthly visitors · earned media · 12 months"],
  ["300+",     "clients served"],
  ["22+",      "years in marketing & press"],
];

export const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 56 }}>
    <HeroHeadline lines={GROWTH.lines} />

    <DoubleRule style={{ margin: "32px 0" }} />

    {/* Lead — three columns: portrait / body / sidebar */}
    <div className="grid-hero-lead">
      {/* Portrait — first in DOM → first column on desktop, top on mobile */}
      <figure
        className="hero-portrait-order"
        style={{
          margin: 0,
          background: PAPER2,
          border: `1px solid ${INK}`,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          alignSelf: "start",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "4/3",
            border: `1px solid ${INK}`,
            background: PAPER,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/headshot.jpg"
            alt="Syed Irfan Ajmal"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              filter: "grayscale(0.15) contrast(1.02)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: YEL,
              padding: "4px 10px",
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 10.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: INK,
            }}
          >
            The Author
          </div>
        </div>
        <figcaption style={{ marginTop: 12 }}>
          <SCaps size={10} ls="0.20em" color={INK70}>Portrait, by staff</SCaps>
          <div
            style={{
              marginTop: 6,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: INK,
              lineHeight: 1.4,
            }}
          >
            The author, photographed in Peshawar, Pakistan, where
            <em> The Bureau</em> has been published since 2010.
          </div>
        </figcaption>
      </figure>

      {/* Body */}
      <div
        className="hero-body"
        style={{
          fontFamily: SERIF,
          fontSize: 17.5,
          color: INK,
          lineHeight: 1.7,
          textAlign: "left",
        }}
      >
        <p style={{ margin: 0, textIndent: 0, overflow: "hidden" }}>
          <span
            className="hero-drop-cap"
            style={{
              float: "left",
              fontFamily: SERIF,
              fontWeight: 700,
              fontStyle: "italic",
              marginRight: 10,
              marginTop: 6,
              color: INK,
              background: YEL,
              padding: "6px 8px 2px 8px",
            }}
          >
            F
          </span>
          or twenty-two years, one question has driven every engagement:{" "}
          <em>what if the most reliable path to growth was not advertising, but earning the right to be quoted?</em>
        </p>
        <p style={{ margin: "1.2em 0 0", clear: "left" }}>
          One hundred clients. Twenty-plus countries. The answer, every time, is yes — and it compounds.
        </p>
      </div>

      {/* Sidebar — In this issue */}
      <aside>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Pill size={11} ls="0.20em">In This Issue</Pill>
          <div style={{ flex: 1, height: 1, background: INK35 }} />
        </div>
        <div style={{ borderTop: `2px solid ${INK}`, marginTop: 10 }} />
        <ol
          style={{
            margin: 0,
            padding: "6px 0 0",
            listStyle: "none",
            fontFamily: SERIF,
            color: INK,
          }}
        >
          {ISSUE_ITEMS.map(([p, title, dept, anchor], i) => (
            <li key={i}>
              <a
                href={anchor}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "46px 1fr auto",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: `1px solid ${INK15}`,
                    alignItems: "baseline",
                  }}
                >
                  <SCaps size={10} ls="0.14em" color={INK70}>{p}</SCaps>
                  <div style={{ fontSize: 15, lineHeight: 1.3, fontWeight: 500 }}>
                    {title}
                  </div>
                  <SCaps size={9} ls="0.14em" color={INK55}>{dept}</SCaps>
                </div>
              </a>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 18 }}>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              padding: "14px 14px",
              background: INK,
              color: PAPER,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Book a call →
          </a>
        </div>
      </aside>
    </div>

    <DoubleRule style={{ margin: "44px 0 24px" }} />

    {/* Stat strip */}
    <div className="grid-stats" style={{ border: `1px solid ${INK}` }}>
      {STATS.map(([n, l], i) => (
        <div
          key={n}
          className="stat-item"
          style={{
            padding: "16px 20px",
            textAlign: "center",
          }}
        >
          <div
            className="stat-number"
            style={{
              fontFamily: SERIF,
              color: INK,
            }}
          >
            {n}
          </div>
          <div style={{ marginTop: 8 }}>
            <SCaps size={10.5} ls="0.16em" color={INK70}>{l}</SCaps>
          </div>
        </div>
      ))}
    </div>

    {/* Provenance band */}
    <DoubleRule style={{ margin: "40px 0 0" }} />
    <div style={{ padding: "20px 0 4px" }}>
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Pill size={11} ls="0.20em">Background</Pill>
        <div style={{ flex: 1, height: 1, background: INK35 }} />
      </div>

      {/* Two-row bordered table */}
      <div style={{ border: `1px solid ${INK}` }}>

        {/* Row 1 — Clients */}
        <div
          className="provenance-row"
          style={{ borderBottom: `1px solid ${INK35}` }}
        >
          <div
            className="provenance-label"
            style={{
              padding: "14px 20px",
              background: PAPER2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <SCaps size={10.5} ls="0.18em" color={INK55}>Since 2004 · Clients across</SCaps>
          </div>
          <div
            style={{
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px 20px",
              fontFamily: SERIF,
              fontSize: 16.5,
              color: INK,
            }}
          >
            <span><Flag c="US" />North America</span>
            <span style={{ color: INK35 }}>·</span>
            <span><Flag c="EU" />Europe</span>
            <span style={{ color: INK35 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10.5,
                  letterSpacing: "0.10em",
                  padding: "2px 7px",
                  background: INK,
                  color: PAPER,
                }}
              >
                AE
              </span>
              MENA
            </span>
          </div>
        </div>

        {/* Row 2 — Education */}
        <div className="provenance-row">
          <div
            className="provenance-label"
            style={{
              padding: "14px 20px",
              background: PAPER2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <SCaps size={10.5} ls="0.18em" color={INK55}>Prior Work + Education</SCaps>
          </div>
          <div
            style={{
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px 20px",
              fontFamily: SERIF,
              fontSize: 16.5,
              color: INK,
            }}
          >
            <span><Flag c="PK" />Peshawar</span>
            <span style={{ color: INK35 }}>·</span>
            <span><Flag c="SE" />Stockholm</span>
            <span style={{ color: INK35 }}>·</span>
            <span><Flag c="DK" />Copenhagen</span>
          </div>
        </div>

      </div>
    </div>
  </section>
);
