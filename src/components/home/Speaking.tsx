import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SCaps, SectionMast, SiaLogo } from "@/components/bureau/primitives";

// [city, country, venue/notes] — dates removed intentionally
const ROWS: ReadonlyArray<[string, string, string]> = [
  ["Peshawar",     "Pakistan",  "G-Day X · Durshal"],
  ["Kuala Lumpur", "Malaysia",  "Webinars · workshops"],
  ["Bali",         "Indonesia", "DMSS · 200+ audience"],
  ["Dubai",        "UAE",       "ATM · IN5 · MPS2016"],
  ["Webinars",     "US / UK",   "12+ sessions"],
  ["US podcasts",  "Remote",    "15+ guest spots"],
];

type PodcastEp = { code: string; title: string; slug: string };
const FEATURED_EPISODES: ReadonlyArray<PodcastEp> = [
  {
    code: "S02E09",
    title: "Finding Your Unfair Advantage",
    slug: "ash-ali-hasan-kubba",
  },
  {
    code: "S02E05",
    title: "Digital PR vs SEO: Key Similarities & Differences",
    slug: "digital-pr-vs-seo-key-s02e05",
  },
  {
    code: "S03E09",
    title: "HARO Outreach, SEO Agency Business & Backlinks",
    slug: "greg-heilers-interview",
  },
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

    <SectionMast n="04" label="The Touring Desk · Stages & stages" dark />

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
          Pakistan. Webinars for American and British listeners. Fifteen-plus
          guest spots on US podcasts.
        </p>
        <div style={{ marginTop: 28 }}>
          <SCaps size={11} ls="0.20em" color={YEL}>From the podcast</SCaps>
          <ol
            style={{
              margin: "10px 0 0",
              padding: 0,
              listStyle: "none",
              fontFamily: SERIF,
              fontSize: 16,
              lineHeight: 1.45,
              color: PAPER,
            }}
          >
            {FEATURED_EPISODES.map((ep, idx) => (
              <li
                key={ep.slug}
                style={{
                  padding: "8px 0",
                  borderBottom: idx < FEATURED_EPISODES.length - 1
                    ? "1px solid rgba(241,235,222,.18)"
                    : "none",
                }}
              >
                <a
                  href={`/podcast/${ep.slug}`}
                  style={{ textDecoration: "none", color: "inherit", display: "flex", gap: 12, alignItems: "baseline" }}
                >
                  <SCaps size={10} ls="0.14em" color={YEL} style={{ flexShrink: 0 }}>
                    {ep.code}
                  </SCaps>
                  <span>{ep.title} →</span>
                </a>
              </li>
            ))}
          </ol>
          <a
            href="/ventures"
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(241,235,222,.55)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(241,235,222,.25)",
              paddingBottom: 2,
            }}
          >
            View ventures →
          </a>
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
