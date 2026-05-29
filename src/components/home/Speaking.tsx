import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SCaps, SectionMast, SiaLogo } from "@/components/bureau/primitives";

// [city, country, venue/notes] — dates removed intentionally
// Peshawar is 3rd (not 1st, 2nd, or last)
const ROWS: ReadonlyArray<[string, string, string]> = [
  ["Bali",         "Indonesia", "DMSS · 200+ audience"],
  ["Kuala Lumpur", "Malaysia",  "MaGIC"],
  ["Peshawar",     "Pakistan",  "G-Day X · Startup Grind · GDG + others"],
  ["Dubai",        "UAE",       "ATM · IN5 · AstroLabs"],
  ["Islamabad",    "Pakistan",  "NIC"],
  ["Remote",       "US · UK",   "40+ sessions"],
];

export const SpeakingBand = () => (
  <section
    id="touring"
    className="sx"
    style={{
      background: INK,
      color: PAPER,
      paddingTop: 90,
      paddingBottom: 90,
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

    <SectionMast n="04" label="The Touring Desk · Stages & Sessions" dark />

    <div className="grid-speaking" style={{ position: "relative" }}>
      {/* Left: Headline + copy + CTA */}
      <div>
        <h2
          className="h2-md"
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
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
          Pakistan. 40+ webinars, live trainings, and appearances on US/UK
          podcasts and YouTube shows.
        </p>
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

      {/* Right: Venues table */}
      <div>
        {ROWS.map((row, i) => (
          <div
            key={row[0]}
            className="speaking-row"
            style={{
              borderBottom: "1px solid rgba(241,235,222,.18)",
              alignItems: "baseline",
            }}
          >
            <div className="speaking-index">
              <SCaps
                size={11}
                ls="0.16em"
                color="rgba(241,235,222,.5)"
              >
                {String(i + 1).padStart(2, "0")}.
              </SCaps>
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: "clamp(18px, 3vw, 28px)",
                color: PAPER,
                letterSpacing: "-0.01em",
              }}
            >
              {row[0]}
            </div>
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "rgba(241,235,222,.7)",
                }}
              >
                {row[1]}
              </div>
              <div style={{ marginTop: 4 }}>
                <SCaps size={10} ls="0.10em" color={YEL}>{row[2]}</SCaps>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
