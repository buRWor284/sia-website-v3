import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  Flag,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
  SiaLogo,
} from "@/components/bureau/primitives";
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

const TIMELINE = [
  { year: "2004", text: "Bachelor in IT, Pakistan" },
  { year: "2007", text: "Best Recruitment Campaign · Adecco, Fortune 500" },
  { year: "2007", text: "SIFE National Cup Sweden · 2nd place" },
  { year: "2007", text: "Affiliate Prophet, USA — MarTech startup, remote" },
  { year: "2007", text: "InfoShare, Copenhagen — software development company" },
  { year: "2007", text: "M.Sc. International Business & Entrepreneurship, Mälardalen University, Sweden" },
  { year: "2007", text: "Marcus Evans, Stockholm — international business intelligence and events" },
  { year: "2008", text: "Invited Judge, SIFE Competition — Students In Free Enterprise" },
  { year: "2010", text: "Co-founded Silk Route Interactive, Peshawar — spatial intelligence, Head of Marketing" },
  { year: "2013", text: "i2i Innovation to Impact, Finalist — Crime Mapper recognized for civic technology" },
  { year: "2013", text: "P@SHA Best Startup Award — Crime Mapper; 34% crime reduction in 3 months" },
  { year: "2013", text: "Founded DMR.agency — digital PR and earned media; 300+ clients served" },
  { year: "2016", text: "Speaking debut, Dubai — AstroLabs · IK Institute · MPS2016 (500 attendees, WTC Dubai)" },
  { year: "2016", text: "DMSS Conference, Bali — Media Hacks workshop, ~200 attendees" },
  { year: "2017", text: "Panel: Arabian Travel Market, Dubai — with Tim Soulo (Ahrefs)" },
  { year: "2018", text: "Speaking tour: IN5 Dubai · Durshal KP — Media Hacks and Personal Branding workshops" },
  { year: "2018", text: "Launched The SIA Business Podcast — three seasons, twenty-nine episodes" },
  { year: "2021", text: "SIA Enterprises Inc. — incorporated in Wyoming as a C-Corp" },
  { year: "2026", text: "EMOS · Earned Media OS — productized the bureau's earned-media playbook" },
];

const PRESS = [
  "Forbes",
  "Harvard Business Review",
  "HuffPost",
  "The Next Web (TNW)",
  "Entrepreneur",
  "Reader's Digest",
  "CNET",
  "Virgin Startup",
  "Search Engine Journal",
  "SEMrush Blog",
  "Business.com",
  "SERPed",
  "Spin Sucks",
  "GrowMap",
  "Aurora",
  "The World Bank Blog",
  "GBG · Google Business Group",
];

const PRESS_QUOTES = [
  {
    outlet: "Azzam Sheikh · NTA UK",
    quote:
      "Ranked a keyword to #4 on Google that gets over 160,000 searches a month. Commercial intent. Can't thank Irfan and the team enough.",
    year: "Manchester",
  },
  {
    outlet: "Chuck Wang · MVP Marketing Podcast",
    quote:
      "Being a great speaker takes art and science, experience, and personal clarity. Irfan delivers on all of it, and it is hard not to like the guy.",
    year: "San Francisco",
  },
  {
    outlet: "Brett Helling · Ridester",
    quote:
      "Syed and his agency helped us grow Ridester from zero to 1.5 million monthly unique visitors. The biggest content marketing success I've been part of.",
    year: "Omaha, NE",
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="About" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 72px" }}>
        <SectionMast n="00" label="The Author · Syed Irfan Ajmal" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1.4fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          {/* Left: headline + body */}
          <div>
            <h1
              style={{
                margin: "0 0 32px",
                fontWeight: 700,
                fontSize: 88,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
              }}
            >
              Marketing,{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>Media</Mark>
              </span>{" "}
              &amp; Press.
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 18.5,
                lineHeight: 1.6,
                color: INK70,
                maxWidth: 520,
              }}
            >
              Twenty-two years of helping businesses get found, get covered, and
              get customers. The work began in Sweden — M.Sc. at Mälardalen, then
              three years across Stockholm and Copenhagen — before returning to
              Peshawar and building what became DMR.agency: a digital PR practice
              that has served roughly a hundred clients in twenty-plus countries,
              including Procter &amp; Gamble.
            </p>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: 18.5,
                lineHeight: 1.6,
                color: INK70,
                maxWidth: 520,
              }}
            >
              He is the CEO of <strong>DMR.agency</strong>, creator of the{" "}
              <em>Earned Media OS</em>, and a fractional CMO to founders who want
              senior marketing thinking without a full-time hire. In 2021 he
              incorporated SIA Enterprises in Wyoming. A book is coming.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 14 }}>
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 20px",
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
                Book a discovery call →
              </a>
              <a
                href="/speaking"
                style={{
                  padding: "12px 20px",
                  border: `1px solid ${INK}`,
                  color: INK,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Speaking →
              </a>
            </div>
          </div>

          {/* Center: portrait */}
          <div style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/headshot.jpg"
              alt="Syed Irfan Ajmal"
              style={{
                width: "100%",
                display: "block",
                filter: "sepia(0.12) contrast(1.04)",
                border: `1px solid ${INK35}`,
              }}
            />
            <div style={{ marginTop: 10 }}>
              <Pill size={10} ls="0.18em">The Author</Pill>
            </div>
            <div style={{ marginTop: 6 }}>
              <SCaps size={10.5} ls="0.16em">Filed from Peshawar, Pakistan</SCaps>
            </div>
          </div>

          {/* Right: sidebar */}
          <div>
            <Pill size={10.5} ls="0.18em">In Brief</Pill>
            {[
              ["Based in", "Peshawar, Pakistan"],
              ["Educated in", "Sweden (M.Sc., Mälardalen, 2007)"],
              ["Earlier degree", "Bachelor in IT, Pakistan (2004)"],
              ["Worked in", "Stockholm & Copenhagen (2007–10)"],
              ["Founder of", "DMR.agency · digital PR & SEO"],
              ["Speaks", "English, Urdu, Pashto"],
              ["Available for", "Fractional CMO · Speaking · Press"],
              ["Status", "Two seats open · Q3 2026"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  padding: "12px 0",
                  borderBottom: `1px solid ${INK15}`,
                }}
              >
                <SCaps size={10.5} ls="0.14em">{label}</SCaps>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 15,
                    color: INK,
                    lineHeight: 1.3,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Timeline ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="01" label="The Dispatch · Career Timeline" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
          <div>
            <h2
              style={{
                margin: "0 0 24px",
                fontWeight: 700,
                fontSize: 52,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
              }}
            >
              From Peshawar to{" "}
              <span style={{ fontStyle: "italic" }}>Stockholm</span> and back.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              A career that started in Scandinavia, circled the globe through
              keynote stages in four countries, and returned home — bringing an
              international standard of marketing practice to clients everywhere.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Flag c="PK" w={28} />
              <Flag c="SE" w={28} />
              <Flag c="DK" w={28} />
              <Flag c="EU" w={28} />
              <Flag c="US" w={28} />
            </div>
          </div>

          <div>
            {TIMELINE.map(({ year, text }, i) => (
              <div
                key={year}
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr",
                  gap: 20,
                  padding: "14px 0",
                  borderBottom:
                    i < TIMELINE.length - 1 ? `1px solid ${INK15}` : undefined,
                  alignItems: "baseline",
                }}
              >
                <SCaps size={11} ls="0.14em" color={YEL}>
                  {year}
                </SCaps>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 16,
                    color: INK,
                    lineHeight: 1.4,
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Press ────────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="02" label="The Press Room · As Reported In" />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px 40px",
            alignItems: "center",
            marginBottom: 56,
          }}
        >
          {PRESS.map((outlet) => (
            <div
              key={outlet}
              style={{
                fontFamily: SERIF,
                fontSize: 22,
                fontStyle: "italic",
                fontWeight: 700,
                color: INK55,
                letterSpacing: "-0.01em",
              }}
            >
              {outlet}
            </div>
          ))}
        </div>

        <DoubleRule />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 40,
            marginTop: 40,
          }}
        >
          {PRESS_QUOTES.map(({ outlet, quote, year }) => (
            <div key={outlet}>
              <SCaps size={11} ls="0.20em" color={YEL}>
                {outlet}
              </SCaps>
              <p
                style={{
                  margin: "14px 0 0",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 19,
                  lineHeight: 1.5,
                  color: INK,
                }}
              >
                &ldquo;{quote}&rdquo;
              </p>
              <HRule style={{ margin: "16px 0" }} />
              <SCaps size={10.5} ls="0.14em" color={INK55}>
                {year}
              </SCaps>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Personal ─────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="03" label="Beyond the Bureau · Personal" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "start",
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
              Climber. Reader.{" "}
              <span style={{ fontStyle: "italic" }}>Wanderer.</span>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              When not writing or advising clients, Syed is likely halfway up a
              rock face outside Peshawar, buried in a book on behavioural economics,
              or watching the light change over a Swedish waterfront.
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              He believes the best marketing comes from people who read widely,
              travel deliberately, and bring the full breadth of their experience
              to every brief. Curiosity is the competitive advantage.
            </p>
            <div style={{ marginTop: 32 }}>
              {[
                "Rock climbing",
                "Behavioural economics",
                "Long-form reading",
                "Travel writing",
                "Strength training",
              ].map((interest) => (
                <div
                  key={interest}
                  style={{
                    padding: "10px 0",
                    borderBottom: `1px solid ${INK15}`,
                    fontFamily: SERIF,
                    fontSize: 16,
                    color: INK70,
                  }}
                >
                  {interest}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {[
              { src: "/assets/personal/climb-1.jpg", alt: "Rock climbing" },
              { src: "/assets/personal/books.jpg", alt: "Books" },
              { src: "/assets/personal/sweden-waterfront.jpg", alt: "Sweden waterfront" },
              { src: "/assets/personal/in-the-woods.jpg", alt: "In the woods" },
              { src: "/assets/personal/sfo-2022.jpg", alt: "San Francisco, 2022" },
              { src: "/assets/personal/yoga.jpg", alt: "Yoga" },
            ].map(({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={alt}
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  display: "block",
                  filter: "sepia(0.08)",
                  border: `1px solid ${INK35}`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}
