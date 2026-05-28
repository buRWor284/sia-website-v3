import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SCaps, SectionMast, SiaLogo } from "@/components/bureau/primitives";

const ROWS: ReadonlyArray<[string, string, string, string]> = [
  ["Peshawar",     "Pakistan",  "2013 → present", "G-Day X · Durshal"],
  ["Kuala Lumpur", "Malaysia",  "2016 → 2019",    "Webinars · workshops"],
  ["Bali",         "Indonesia", "Nov 2016",       "DMSS · 200+ audience"],
  ["Dubai",        "UAE",       "2016 → 2018",    "ATM · IN5 · MPS2016"],
  ["Webinars",     "US / UK",   "2017 → present", "12+ sessions"],
  ["US podcasts",  "Remote",    "2018 → present", "15+ guest spots"],
];

export const SpeakingBand = () => (
  <section
    style={{
      background: INK,
      color: PAPER,
      padding: "90px 56px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: -40,
        right: -60,
        opacity: 0.06,
        pointerEvents: "none",
      }}
    >
      <SiaLogo height={320} />
    </div>

    <SectionMast n="04" label="The Touring Desk · Stages & stages" dark />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.5fr",
        gap: 80,
        position: "relative",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 68,
            color: PAPER,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          Stages across
          <br />
          <span style={{ fontStyle: "italic", color: YEL }}>four countries.</span>
        </h2>
        <p
          style={{
            marginTop: 24,
            fontFamily: SERIF,
            fontSize: 18,
            color: "rgba(241,235,222,.72)",
            lineHeight: 1.55,
            maxWidth: 440,
          }}
        >
          Keynotes for diverse audiences in Malaysia, Indonesia, the UAE, and
          Pakistan. Webinars for American and British listeners. Fifteen-plus
          guest spots on US podcasts.
        </p>
        <div style={{ marginTop: 28 }}>
          <SCaps size={11} ls="0.20em" color={YEL}>Topics on file</SCaps>
          <ol
            style={{
              margin: "10px 0 0",
              padding: 0,
              listStyle: "none",
              fontFamily: SERIF,
              fontSize: 17.5,
              lineHeight: 1.45,
              color: PAPER,
            }}
          >
            <li
              style={{
                padding: "8px 0",
                borderBottom: "1px solid rgba(241,235,222,.18)",
              }}
            >
              <span
                style={{
                  color: YEL,
                  fontFamily: GROT,
                  fontSize: 13,
                  fontWeight: 700,
                  marginRight: 10,
                }}
              >
                I.
              </span>
              The Scientific Benefits of Writing · Infographic
            </li>
            <li
              style={{
                padding: "8px 0",
                borderBottom: "1px solid rgba(241,235,222,.18)",
              }}
            >
              <span
                style={{
                  color: YEL,
                  fontFamily: GROT,
                  fontSize: 13,
                  fontWeight: 700,
                  marginRight: 10,
                }}
              >
                II.
              </span>
              Brand Yourself for Success
            </li>
            <li style={{ padding: "8px 0" }}>
              <span
                style={{
                  color: YEL,
                  fontFamily: GROT,
                  fontSize: 13,
                  fontWeight: 700,
                  marginRight: 10,
                }}
              >
                III.
              </span>
              Media Hacks · Free Publicity Online
            </li>
          </ol>
        </div>
        <a
          href="/speaking"
          style={{
            marginTop: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 22px",
            background: YEL,
            color: INK,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Speaker sheet &amp; bookings →
        </a>
      </div>

      <div>
        {ROWS.map((row, i) => (
          <div
            key={row[0]}
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1.6fr 1fr 1.4fr",
              gap: 24,
              padding: "20px 0",
              borderBottom: "1px solid rgba(241,235,222,.18)",
              alignItems: "baseline",
            }}
          >
            <SCaps size={11} ls="0.16em" color="rgba(241,235,222,.5)">
              {String(i + 1).padStart(2, "0")}.
            </SCaps>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 28,
                color: PAPER,
                letterSpacing: "-0.01em",
              }}
            >
              {row[0]}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(241,235,222,.7)",
              }}
            >
              {row[1]}
            </div>
            <div>
              <SCaps size={10.5} ls="0.14em" color="rgba(241,235,222,.55)">
                {row[2]}
              </SCaps>
              <div style={{ marginTop: 4 }}>
                <SCaps size={10.5} ls="0.10em" color={YEL}>{row[3]}</SCaps>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
