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
    style={{
      margin: 0,
      textAlign: "center",
      fontFamily: SERIF,
      fontWeight: 700,
      fontSize: 124,
      color: INK,
      lineHeight: 1.02,
      letterSpacing: "-0.028em",
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

const ISSUE_ITEMS: ReadonlyArray<[string, string, string]> = [
  ["P. 02", "Three ways to work, plainly stated",     "Departments"],
  ["P. 04", "Casework, what the numbers did",         "Case Studies"],
  ["P. 07", "What clients have said, on the record",  "Letters"],
  ["P. 10", "Stages across four countries",           "Touring"],
  ["P. 14", "The latest dispatches",                  "The Wire"],
  ["P. 16", "A letter from the editor",               "Subscriptions"],
];

const STATS: ReadonlyArray<[string, string]> = [
  ["$2.3M", "PR campaign ROI · case study"],
  ["№ 4",   "on Google for a 160K/mo keyword"],
  ["100+",  "clients across 20+ countries"],
  ["22+",   "years in marketing & press"],
];

export const Hero = () => (
  <section style={{ background: PAPER, padding: "40px 56px 56px" }}>
    <div style={{ textAlign: "center", marginBottom: 26 }}>
      <SCaps color={INK70} size={12} ls="0.28em">{GROWTH.eyebrow}</SCaps>
    </div>

    <HeroHeadline lines={GROWTH.lines} />

    <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
      <SCaps size={11.5} ls="0.22em" color={INK55}>
        By Syed Irfan Ajmal &nbsp;·&nbsp; Fractional CMO, Speaker
        &nbsp;·&nbsp; <span style={{ color: INK }}>Filed from Peshawar</span>
      </SCaps>
    </div>

    <DoubleRule style={{ margin: "40px 0" }} />

    {/* Lead — three columns: body / portrait / sidebar */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1.6fr",
        gap: 40,
      }}
    >
      {/* Body */}
      <div
        style={{
          columnCount: 2,
          columnGap: 28,
          fontFamily: SERIF,
          fontSize: 17.5,
          color: INK,
          lineHeight: 1.5,
          textAlign: "justify",
        }}
      >
        <p style={{ margin: 0, textIndent: 0 }}>
          <span
            style={{
              float: "left",
              fontFamily: SERIF,
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: 92,
              lineHeight: 0.78,
              marginRight: 10,
              marginTop: 6,
              color: INK,
              background: YEL,
              padding: "6px 8px 2px 8px",
            }}
          >
            F
          </span>
          or twenty-two years I have run a quiet experiment in the back rooms
          of digital marketing: <em>what if the most reliable path to growth
          was not advertising at all, but earning the right to be quoted?</em>
        </p>
        <p style={{ marginTop: "0.7em" }}>
          The answer, repeated across one hundred clients in twenty-plus
          countries, is yes, and it is repeatable. This is the case for
          editorial coverage, a working bureau to deliver it, and a
          productized OS to run it in-house.
        </p>
        <p style={{ marginTop: "0.7em", fontStyle: "italic" }}>
          Routed through Sweden: a masters at Mälardalen, work at Marcus
          Evans and InfoShare across Stockholm and Copenhagen, a spatial
          intelligence company in Peshawar, a Silicon Valley accelerator,
          before settling the bureau in Peshawar, where it has been
          published since 2010.
        </p>
      </div>

      {/* Portrait */}
      <figure
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
          {ISSUE_ITEMS.map(([p, title, dept], i) => (
            <li
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "54px 1fr auto",
                gap: 12,
                padding: "12px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
              }}
            >
              <SCaps size={10.5} ls="0.16em" color={INK70}>{p}</SCaps>
              <div style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 500 }}>
                {title}
              </div>
              <SCaps size={9.5} ls="0.16em" color={INK55}>{dept}</SCaps>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 14px",
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
          <a
            href="/podcast"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 14px",
              background: YEL,
              color: INK,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            The podcast
          </a>
        </div>
      </aside>
    </div>

    <DoubleRule style={{ margin: "44px 0 24px" }} />

    {/* Stat strip */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
      {STATS.map(([n, l], i) => (
        <div
          key={n}
          style={{
            padding: "8px 28px",
            borderRight: i < 3 ? `1px solid ${INK35}` : "none",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 64,
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.02em",
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 32,
        alignItems: "baseline",
        padding: "22px 0 4px",
      }}
    >
      <Pill size={11} ls="0.20em">Provenance</Pill>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "4px 22px",
            fontFamily: SERIF,
            fontSize: 17,
            color: INK,
            lineHeight: 1.5,
          }}
        >
          <SCaps
            size={10.5}
            ls="0.18em"
            color={INK55}
            style={{ marginRight: 8 }}
          >
            Clients across
          </SCaps>
          <span><Flag c="US" />North America</span>
          <span style={{ color: INK35 }}>·</span>
          <span><Flag c="EU" />Europe</span>
          <span style={{ color: INK35 }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 11.5,
                letterSpacing: "0.10em",
                padding: "2px 8px",
                background: INK,
                color: PAPER,
                marginRight: 8,
              }}
            >
              AE
            </span>
            MENA
          </span>
          <span style={{ color: INK35 }}>·</span>
          <span><Flag c="PK" />South Asia</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "4px 22px",
            fontFamily: SERIF,
            fontSize: 17,
            color: INK,
            lineHeight: 1.5,
          }}
        >
          <SCaps
            size={10.5}
            ls="0.18em"
            color={INK55}
            style={{ marginRight: 8 }}
          >
            Education &amp; lineage
          </SCaps>
          <span>
            <Flag c="SE" />
            <strong style={{ fontWeight: 700 }}>M.Sc. Mälardalen</strong>
          </span>
          <span style={{ color: INK35 }}>·</span>
          <span><Flag c="SE" />Stockholm</span>
          <span style={{ color: INK35 }}>·</span>
          <span><Flag c="DK" />Copenhagen</span>
          <span style={{ color: INK35 }}>·</span>
          <span><Flag c="US" />BlackBox Connect, SV</span>
        </div>
      </div>
    </div>
  </section>
);
