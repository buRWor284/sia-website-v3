import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
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

// ── Episode data — The SIA Business Podcast (2018–2020, 29 episodes) ──

type Season = {
  label: string;
  year: string;
  count: number;
  episodes: ReadonlyArray<[string, string, string, string, boolean?]>;
  // [code, title, guest, slug, isFeatured?]
};

const SEASONS: ReadonlyArray<Season> = [
  {
    label: "Season 3",
    year: "2020",
    count: 9,
    episodes: [
      ["S03E09", "Discussing HARO Outreach, SEO Agency Business, and Backlinks Management with Greg Heilers", "Greg Heilers", "greg-heilers-interview"],
      ["S03E08", "#SEObacklinks Tutorial — Type 3 Backlinks", "Solo", "seo-backlinks-type3"],
      ["S03E07", "#SEObacklinks Tutorial — Type 2 Backlinks", "Solo", "seo-backlinks-type2"],
      ["S03E06", "#SEObacklinks Tutorial — Type 1 Backlinks", "Solo", "seo-backlinks-tutorial"],
      ["S03E05", "SEO Outreach Project Management Made Easy", "Solo", "seo-project-management"],
      ["S03E04", "HARO Outreach vs Conventional Outreach for Quality Backlinks", "Solo", "haro-outreach-vs-conventional-outreach"],
      ["S03E03", "Faisal Khan on Remote Team Management, Inbound Leads, Working Smarter", "Faisal Khan", "faisal-khan-interview"],
      ["S03E02", "Remote Work Productivity: Our Top 7 Tools", "Solo", "remote-work-productivity-tools"],
      ["S03E01", "Fighting the Corona Recession: Our 7-Pronged Business Plan", "Solo", "fighting-corona-recession-our-plan"],
    ],
  },
  {
    label: "Season 2",
    year: "2019",
    count: 10,
    episodes: [
      ["S02E10", "Unleashing Your Inner Sales Warrior With Jason Forrest", "Jason Forrest", "jason-forrest"],
      ["S02E09", "Finding Your Unfair Advantage With Ash Ali & Hasan Kubba", "Ash Ali & Hasan Kubba", "ash-ali-hasan-kubba"],
      ["S02E08", "Automated Outreach: Why I (Kind of) Changed My Mind", "Solo", "automated-outreach-insights"],
      ["S02E07", "Standing Out in the Crowd With This Simple Hack I'd Used in Denmark", "Solo", "standing-out-hack-s02e07"],
      ["S02E06", "Collab Link Building", "Solo", "collab-link-building-s02e06"],
      ["S02E05", "Digital PR Vs SEO: Key Similarities and Differences", "Solo", "digital-pr-vs-seo-key-s02e05"],
      ["S02E04", "Leveraging Newsjacking for Content Promotion", "Solo", "newsjacking-s02e04"],
      ["S02E03", "Ron Carucci on Power, Leadership, and Persuasion", "Ron Carucci", "ron-carucci-power-leadership"],
      ["S02E02", "Top 3 Mistakes of My ~6 Year Speaking Career", "Solo", "mistakes-of-speaking-career-s02e02"],
      ["S02E01", "Recap of Season 1 + Introduction of Season 2", "Solo", "recap-and-intro-s02e01"],
    ],
  },
  {
    label: "Season 1",
    year: "2018",
    count: 10,
    episodes: [
      ["S01E10", "How Negating Conventional Wisdom Led Me to Massive Success", "Solo", "negating-conventional-wisdom-massive-success"],
      ["S01E09", "My Productivity Hacks of 2018", "Solo", "2-game-changing-productivity-hacks-2018"],
      ["S01E08", "Melanie Martin on a $2.3 Million ROI PR Campaign", "Melanie Martin", "melanie-marten-public-relations", true],
      ["S01E07", "Unique Twist to HARO Outreach for IMPROVED Backlinks", "Solo", "haro-outreach-twist-for-better-backlinks"],
      ["S01E06", "Publicity & Backlinks Using HARO", "Solo", "publicity-backlinks-haro-s01e06"],
      ["S01E05", "SEO Myths", "Solo", "top-3-seo-myths-sia-s01e05"],
      ["S01E04", "Elvin Zhang on Startups", "Elvin Zhang", "elvin-zhang-startups-sia-s01e04"],
      ["S01E03", "Lisa Zahran on Copywriting", "Lisa Zahran", "lisa-zahran-copywriting-sia-01e03"],
      ["S01E02", "Liam Martin on Productivity & Remote Management", "Liam Martin", "liam-martin-productivity-remote-employee-management-fighting-distraction-economy-s01e02"],
      ["S01E01", "Peter Gould on Branding", "Peter Gould", "peter-gould-s01e01"],
    ],
  },
];

const FEATURED = {
  code: "S01E08",
  title: "Melanie Martin on a $2.3 Million ROI PR Campaign",
  guest: "Melanie Martin",
  blurb:
    "The single most-listened episode of the show. Melanie walks through a public relations campaign that returned $2.3M in measurable ROI — and what most companies still get wrong about earned media.",
  duration: "52 min",
};

const NOTABLE_GUESTS: ReadonlyArray<{
  name: string;
  role: string;
  topic: string;
  ep: string;
}> = [
  { name: "Liam Martin", role: "Co-founder, Time Doctor", topic: "Productivity & remote management", ep: "S01E02" },
  { name: "Peter Gould", role: "Founder, Adventures", topic: "Branding for purpose-driven companies", ep: "S01E01" },
  { name: "Ron Carucci", role: "Author · Forbes contributor", topic: "Power, leadership, persuasion", ep: "S02E03" },
  { name: "Jason Forrest", role: "CEO, Forrest Performance", topic: "Unleashing your inner sales warrior", ep: "S02E10" },
  { name: "Ash Ali & Hasan Kubba", role: "Co-authors, The Unfair Advantage", topic: "Finding your unfair advantage", ep: "S02E09" },
  { name: "Melanie Martin", role: "Publicist", topic: "$2.3M ROI PR campaign", ep: "S01E08" },
];

const PLATFORMS = [
  { name: "Apple Podcasts", url: "https://podcasts.apple.com/us/podcast/the-sia-business-show/id1347540466" },
  { name: "Spotify", url: "https://open.spotify.com/show/7GxDZnNXb37gjXLF8LZmMh" },
  { name: "YouTube", url: "#" },
  { name: "Google Podcasts", url: "#" },
  { name: "RSS feed", url: "https://anchor.fm/syedirfanajmal/" },
];

export default function PodcastPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Podcast" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ background: PAPER, padding: "56px 56px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <SCaps color={INK70} size={12} ls="0.28em">
            The SIA Business Podcast &nbsp;·&nbsp; 29 episodes &nbsp;·&nbsp; 3
            seasons &nbsp;·&nbsp; since 2018
          </SCaps>
        </div>
        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontWeight: 700,
            fontSize: 132,
            color: INK,
            lineHeight: 1.0,
            letterSpacing: "-0.028em",
          }}
        >
          <span style={{ display: "block" }}>The SIA</span>
          <span
            style={{
              display: "block",
              fontStyle: "italic",
              fontWeight: 600,
            }}
          >
            <Mark>Business Podcast.</Mark>
          </span>
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 22,
          }}
        >
          <SCaps size={11.5} ls="0.22em" color={INK55}>
            Hosted by Syed Irfan Ajmal &nbsp;·&nbsp;
            <span style={{ color: INK }}>Filed from Peshawar &amp; remote</span>
          </SCaps>
        </div>

        <DoubleRule style={{ margin: "44px 0 36px" }} />

        {/* Lead — 2-col: about the show + listen-on aside */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div
            style={{
              columnCount: 2,
              columnGap: 28,
              fontSize: 17.5,
              color: INK,
              lineHeight: 1.55,
              textAlign: "justify",
            }}
          >
            <p style={{ margin: 0 }}>
              <span
                style={{
                  float: "left",
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
                S
              </span>
              ince 2018, a show about the practical end of digital marketing:
              digital PR, SEO, content, agency operations, and the awkward
              economics of remote work. Three seasons, twenty-nine episodes,
              most of them with guests, all of them under an hour.
            </p>
            <p style={{ marginTop: "0.7em" }}>
              The roster has included Liam Martin (Time Doctor), Peter Gould,
              Ron Carucci, Jason Forrest, Ash Ali, Melanie Martin, and a handful
              of operators less famous but more useful. The solo episodes are
              tactical: HARO, link building, the difference between digital PR
              and SEO, the seven productivity tools that survived ten years on
              my desk.
            </p>
            <p style={{ marginTop: "0.7em", fontStyle: "italic" }}>
              On pause through 2024–25 while DMR.agency grew. Returning in late
              2026 with a fourth season focused on EMOS, earned media at scale,
              and conversations with the in-house teams running both.
            </p>
          </div>

          {/* Listen-on aside */}
          <aside
            style={{
              background: PAPER2,
              border: `1px solid ${INK}`,
              padding: 24,
            }}
          >
            <Pill size={11} ls="0.20em">
              Listen on
            </Pill>
            <div
              style={{
                marginTop: 14,
                fontSize: 22,
                lineHeight: 1.25,
                color: INK,
                fontWeight: 700,
              }}
            >
              Wherever you
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 600 }}>
                get your podcasts.
              </span>
            </div>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {PLATFORMS.map(({ name, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: PAPER,
                    border: `1px solid ${INK}`,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 15,
                    color: INK,
                  }}
                >
                  <span>{name}</span>
                  <span
                    style={{
                      fontFamily: GROT,
                      fontSize: 14,
                      color: INK70,
                    }}
                  >
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </aside>
        </div>

        {/* Stats bar */}
        <DoubleRule style={{ margin: "52px 0 0" }} />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}
        >
          {[
            ["29", "episodes shipped"],
            ["03", "seasons (2018–2020)"],
            ["12+", "expert guests"],
            ["$2.3M", "biggest case study covered"],
          ].map(([n, l], i) => (
            <div
              key={n}
              style={{
                padding: "24px 28px 6px",
                borderRight: i < 3 ? `1px solid ${INK35}` : "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 60,
                  color: INK,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {n}
              </div>
              <div style={{ marginTop: 8 }}>
                <SCaps size={10.5} ls="0.16em" color={INK70}>
                  {l}
                </SCaps>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured episode ──────────────────────────────────── */}
      <section style={{ background: PAPER, padding: "90px 56px 60px" }}>
        <SectionMast n="01" label="Featured episode · Most-played" />

        <div
          style={{
            background: INK,
            color: PAPER,
            padding: "48px 48px",
            display: "grid",
            gridTemplateColumns: "1fr 1.3fr",
            gap: 56,
            alignItems: "center",
            position: "relative",
            border: `1px solid ${INK}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -1,
              right: -1,
              padding: "8px 16px",
              background: YEL,
              color: INK,
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              border: `1px solid ${INK}`,
            }}
          >
            Most-played
          </div>

          <div>
            <SCaps size={11} ls="0.20em" color={YEL}>
              {FEATURED.code}
            </SCaps>
            <h2
              style={{
                margin: "14px 0 0",
                fontWeight: 700,
                fontSize: 44,
                color: PAPER,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              {FEATURED.title}
            </h2>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                gap: 24,
                alignItems: "baseline",
              }}
            >
              <SCaps
                size={10.5}
                ls="0.18em"
                color="rgba(241,235,222,.65)"
              >
                Guest · {FEATURED.guest}
              </SCaps>
              <SCaps
                size={10.5}
                ls="0.18em"
                color="rgba(241,235,222,.65)"
              >
                Run time · {FEATURED.duration}
              </SCaps>
            </div>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: 19,
                color: "rgba(241,235,222,.85)",
                lineHeight: 1.55,
                fontStyle: "italic",
              }}
            >
              &ldquo;{FEATURED.blurb}&rdquo;
            </p>
            <div style={{ marginTop: 28 }}>
              <a
                href="/podcast/melanie-marten-public-relations"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 22px",
                  background: YEL,
                  color: INK,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  gap: 16,
                }}
              >
                <span>View episode →</span>
                <span style={{ fontSize: 20 }}>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Notable guests ────────────────────────────────────── */}
      <section style={{ background: PAPER, padding: "60px 56px 90px" }}>
        <SectionMast n="02" label="Notable guests · From the desk" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 60,
            alignItems: "baseline",
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 72,
              color: INK,
              lineHeight: 0.98,
              letterSpacing: "-0.025em",
            }}
          >
            Six conversations
            <br />
            <span style={{ fontStyle: "italic" }}>
              <Mark>worth your hour.</Mark>
            </span>
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 19,
              color: INK70,
              lineHeight: 1.55,
              maxWidth: 560,
            }}
          >
            A small selection from the guest roster. Authors, operators,
            publicists, and one or two whose names you would not have heard
            but whose ideas have aged better than most.
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
          {NOTABLE_GUESTS.map((g, i) => (
            <div
              key={g.name}
              style={{
                padding: "26px 24px",
                borderRight: i % 3 !== 2 ? `1px solid ${INK}` : "none",
                borderBottom: i < 3 ? `1px solid ${INK}` : "none",
                background: PAPER,
                display: "flex",
                flexDirection: "column",
                minHeight: 220,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <SCaps size={10.5} ls="0.18em" color={INK55}>
                  {g.ep}
                </SCaps>
                <SCaps size={10.5} ls="0.14em" color={INK70}>
                  Guest
                </SCaps>
              </div>
              <h4
                style={{
                  margin: "14px 0 0",
                  fontWeight: 700,
                  fontSize: 24,
                  color: INK,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {g.name}
              </h4>
              <div
                style={{
                  marginTop: 6,
                  fontStyle: "italic",
                  fontSize: 14,
                  color: INK70,
                }}
              >
                {g.role}
              </div>
              <HRule style={{ margin: "14px 0" }} />
              <p
                style={{
                  margin: 0,
                  fontSize: 15.5,
                  color: INK,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                On: {g.topic}
              </p>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── All episodes by season ────────────────────────────── */}
      <section style={{ background: PAPER, padding: "0 56px 90px" }}>
        <SectionMast n="03" label="All episodes · Chronological index" />

        {SEASONS.map((s, si) => (
          <div
            key={s.label}
            style={{ marginBottom: si < SEASONS.length - 1 ? 56 : 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottom: `2px solid ${INK}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 18,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 44,
                    color: INK,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.label}
                </h3>
                <SCaps size={11} ls="0.18em" color={INK70}>
                  {s.year} &nbsp;·&nbsp; {s.count} episodes
                </SCaps>
              </div>
              <SCaps size={11} ls="0.18em" color={INK55}>
                Reverse chronological
              </SCaps>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {s.episodes.map(([code, title, guest, slug, isFeatured]) => (
                <li
                  key={code}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 160px 60px",
                    gap: 20,
                    padding: "18px 0",
                    borderBottom: `1px solid ${INK15}`,
                    alignItems: "baseline",
                  }}
                >
                  <div
                    style={{
                      fontFamily: GROT,
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: "0.06em",
                      color: INK,
                    }}
                  >
                    {code}
                  </div>
                  <a
                    href={`/podcast/${slug}`}
                    style={{
                      fontWeight: 600,
                      fontSize: 19,
                      color: INK,
                      lineHeight: 1.3,
                      textDecoration: "none",
                    }}
                  >
                    {isFeatured && (
                      <span
                        style={{
                          background: YEL,
                          padding: "0 6px",
                          marginRight: 8,
                        }}
                      >
                        Featured
                      </span>
                    )}
                    {title}
                  </a>
                  <div
                    style={{
                      fontStyle: "italic",
                      fontSize: 14.5,
                      color: INK70,
                    }}
                  >
                    {guest}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <a
                      href={`/podcast/${slug}`}
                      style={{
                        textDecoration: "none",
                      }}
                    >
                      <SCaps size={11} ls="0.14em" color={INK55}>
                        View ↗
                      </SCaps>
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}
