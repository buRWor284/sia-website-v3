import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
  SiaLogo,
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

// ── Real episode data — The SIA Business Podcast (2018–2020, 29 episodes) ──

const FEATURED_EPISODES: ReadonlyArray<{
  code: string;
  title: string;
  guest: string;
  topic: string;
  duration: string;
  season: number;
}> = [
  {
    code: "S03E09",
    title: "Discussing HARO Outreach, SEO Agency Business, and Backlinks Management with Greg Heilers",
    guest: "Greg Heilers · Jolly SEO",
    topic: "Outreach · SEO",
    duration: "~58 min",
    season: 3,
  },
  {
    code: "S01E08",
    title: "Melanie Martin on a $2.3 Million ROI PR Campaign",
    guest: "Melanie Martin · Publicist",
    topic: "PR · Earned Media",
    duration: "~52 min",
    season: 1,
  },
  {
    code: "S02E03",
    title: "Ron Carucci on Power, Leadership, and Persuasion",
    guest: "Ron Carucci · Navalent",
    topic: "Leadership",
    duration: "~64 min",
    season: 2,
  },
  {
    code: "S03E03",
    title: "Faisal Khan on Remote Team Management, Inbound Leads, and Working Smarter",
    guest: "Faisal Khan · Payments consultant",
    topic: "Remote Work · Business",
    duration: "~52 min",
    season: 3,
  },
  {
    code: "S02E10",
    title: "Unleashing Your Inner Sales Warrior with Jason Forrest",
    guest: "Jason Forrest · Forrest Performance Group",
    topic: "Sales · Mindset",
    duration: "~54 min",
    season: 2,
  },
  {
    code: "S02E09",
    title: "Finding Your Unfair Advantage with Ash Ali & Hasan Kubba",
    guest: "Ash Ali & Hasan Kubba · Authors",
    topic: "Entrepreneurship",
    duration: "~62 min",
    season: 2,
  },
];

const SEASON3: ReadonlyArray<{ code: string; title: string; duration: string; solo: boolean }> = [
  { code: "S03E09", title: "Discussing HARO Outreach, SEO Agency Business, and Backlinks Management with Greg Heilers", duration: "~58 min", solo: false },
  { code: "S03E08", title: "#SEObacklinks Tutorial — Type 3 Backlinks", duration: "~22 min", solo: true },
  { code: "S03E07", title: "#SEObacklinks Tutorial — Type 2 Backlinks", duration: "~24 min", solo: true },
  { code: "S03E06", title: "#SEObacklinks Tutorial — Type 1 Backlinks", duration: "~26 min", solo: true },
  { code: "S03E05", title: "SEO Outreach Project Management Made Easy", duration: "~19 min", solo: true },
  { code: "S03E04", title: "HARO Outreach vs Conventional Outreach for Quality Backlinks", duration: "~21 min", solo: true },
  { code: "S03E03", title: "Faisal Khan on Remote Team Management, Inbound Leads, and Working Smarter", duration: "~52 min", solo: false },
  { code: "S03E02", title: "Remote Work Productivity · Our Top 7 Tools", duration: "~23 min", solo: true },
  { code: "S03E01", title: "Fighting the Corona Recession · Our 7-Pronged Business Plan", duration: "~28 min", solo: true },
];

const SEASON2: ReadonlyArray<{ code: string; title: string; duration: string; solo: boolean }> = [
  { code: "S02E10", title: "Unleashing Your Inner Sales Warrior with Jason Forrest", duration: "~54 min", solo: false },
  { code: "S02E09", title: "Finding Your Unfair Advantage with Ash Ali & Hasan Kubba", duration: "~62 min", solo: false },
  { code: "S02E08", title: "Automated Outreach · Why I (Kind of) Changed My Mind", duration: "~20 min", solo: true },
  { code: "S02E07", title: "Standing Out in the Crowd with a Simple Hack I Used in Denmark", duration: "~17 min", solo: true },
  { code: "S02E06", title: "Collab Link Building", duration: "~22 min", solo: true },
  { code: "S02E05", title: "Digital PR vs SEO · Key Similarities and Differences", duration: "~25 min", solo: true },
  { code: "S02E04", title: "Leveraging Newsjacking for Content Promotion", duration: "~19 min", solo: true },
  { code: "S02E03", title: "Ron Carucci on Power, Leadership, and Persuasion", duration: "~64 min", solo: false },
  { code: "S02E02", title: "Top 3 Mistakes of My ~6 Year Speaking Career", duration: "~16 min", solo: true },
  { code: "S02E01", title: "Recap of Season 1 + Introduction of Season 2", duration: "~14 min", solo: true },
];

const SEASON1: ReadonlyArray<{ code: string; title: string; duration: string; solo: boolean }> = [
  { code: "S01E10", title: "How Negating Conventional Wisdom Led Me to Massive Success", duration: "~21 min", solo: true },
  { code: "S01E09", title: "My Productivity Hacks of 2018", duration: "~18 min", solo: true },
  { code: "S01E08", title: "Melanie Martin on a $2.3 Million ROI PR Campaign", duration: "~52 min", solo: false },
  { code: "S01E07", title: "Unique Twist to HARO Outreach for IMPROVED Backlinks", duration: "~20 min", solo: true },
  { code: "S01E06", title: "Publicity & Backlinks Using HARO", duration: "~24 min", solo: true },
  { code: "S01E05", title: "SEO Myths", duration: "~17 min", solo: true },
  { code: "S01E04", title: "Elvin Zhang on Startups", duration: "~46 min", solo: false },
  { code: "S01E03", title: "Lisa Zahran on Copywriting", duration: "~48 min", solo: false },
  { code: "S01E02", title: "Liam Martin on Productivity & Remote Management", duration: "~57 min", solo: false },
  { code: "S01E01", title: "Peter Gould on Design Thinking, Branding, and Productivity", duration: "~50 min", solo: false },
];

const PLATFORMS = [
  { name: "Apple Podcasts", url: "https://podcasts.apple.com/us/podcast/the-sia-business-show/id1347540466" },
  { name: "Spotify", url: "https://open.spotify.com/show/7GxDZnNXb37gjXLF8LZmMh" },
  { name: "Anchor / RSS", url: "https://anchor.fm/syedirfanajmal/" },
  { name: "Stitcher", url: "https://www.stitcher.com/show/the-sia-business-show" },
];

export default function PodcastPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Podcast" />

      {/* ── Dark hero ─────────────────────────────────────────── */}
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

        <SectionMast n="00" label="The SIA Business Podcast · Audio Desk" dark />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            position: "relative",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 76,
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
                color: PAPER,
              }}
            >
              SEO, HARO,{" "}
              <span style={{ fontStyle: "italic", color: YEL }}>outreach</span>
              <br />
              &amp; the long game.
            </h1>
            <p
              style={{
                marginTop: 28,
                fontSize: 18,
                lineHeight: 1.55,
                color: "rgba(241,235,222,.72)",
                maxWidth: 500,
              }}
            >
              The SIA Business Podcast ran for three seasons (2018–2020),
              covering earned media, link building, SEO outreach, and business
              growth. 29 episodes across solo deep-dives and guest interviews
              with practitioners from around the world.
            </p>

            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {PLATFORMS.map(({ name, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 16px",
                    border: "1px solid rgba(241,235,222,.3)",
                    color: "rgba(241,235,222,.8)",
                    textDecoration: "none",
                    fontFamily: GROT,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {name} →
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {[
              { stat: "29", label: "Episodes" },
              { stat: "3", label: "Seasons" },
              { stat: "10", label: "Guest interviews" },
              { stat: "2018", label: "Launched" },
            ].map(({ stat, label }) => (
              <div
                key={label}
                style={{
                  padding: "28px 24px",
                  border: "1px solid rgba(241,235,222,.14)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 40,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: YEL,
                  }}
                >
                  {stat}
                </div>
                <SCaps
                  size={10.5}
                  ls="0.14em"
                  color="rgba(241,235,222,.55)"
                  style={{ marginTop: 8, display: "block" }}
                >
                  {label}
                </SCaps>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured episodes ─────────────────────────────────── */}
      <section style={{ padding: "80px 56px" }}>
        <SectionMast n="01" label="Featured Episodes · Guest Interviews & Highlights" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {FEATURED_EPISODES.map(({ code, title, guest, topic, duration, season }) => (
            <div key={code} style={{ borderTop: `2px solid ${INK}` }}>
              <div
                style={{
                  padding: "14px 0 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <Pill size={9.5} ls="0.14em">{code}</Pill>
                  <SCaps size={10} ls="0.12em" color={YEL}>
                    {topic}
                  </SCaps>
                </div>
                <SCaps size={10} ls="0.10em" color={INK35}>
                  {duration}
                </SCaps>
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
              <div
                style={{
                  fontFamily: GROT,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: INK55,
                  marginBottom: 12,
                  fontStyle: "italic",
                }}
              >
                {guest}
              </div>
              <HRule />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <SCaps size={10} ls="0.12em" color={INK55}>Season {season}</SCaps>
                <a
                  href={PLATFORMS[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: GROT,
                    fontWeight: 700,
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: INK,
                    textDecoration: "none",
                  }}
                >
                  Listen →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Season archive ────────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="02" label="Full Archive · All 29 Episodes by Season" />

        {/* Season 3 */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: INK,
              }}
            >
              Season 3
            </div>
            <SCaps size={10.5} ls="0.18em" color={INK55}>2020 · 9 episodes</SCaps>
          </div>
          {SEASON3.map(({ code, title, duration, solo }) => (
            <div
              key={code}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 80px 80px",
                gap: 24,
                padding: "16px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
              }}
            >
              <Pill size={9} ls="0.12em">{code}</Pill>
              <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: INK, lineHeight: 1.35 }}>
                {title}
              </div>
              <SCaps size={10} ls="0.10em" color={solo ? INK55 : YEL}>
                {solo ? "Solo" : "Guest"}
              </SCaps>
              <SCaps size={10} ls="0.10em" color={INK35} style={{ textAlign: "right" }}>
                {duration}
              </SCaps>
            </div>
          ))}
        </div>

        {/* Season 2 */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: INK,
              }}
            >
              Season 2
            </div>
            <SCaps size={10.5} ls="0.18em" color={INK55}>2019 · 10 episodes</SCaps>
          </div>
          {SEASON2.map(({ code, title, duration, solo }) => (
            <div
              key={code}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 80px 80px",
                gap: 24,
                padding: "16px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
              }}
            >
              <Pill size={9} ls="0.12em">{code}</Pill>
              <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: INK, lineHeight: 1.35 }}>
                {title}
              </div>
              <SCaps size={10} ls="0.10em" color={solo ? INK55 : YEL}>
                {solo ? "Solo" : "Guest"}
              </SCaps>
              <SCaps size={10} ls="0.10em" color={INK35} style={{ textAlign: "right" }}>
                {duration}
              </SCaps>
            </div>
          ))}
        </div>

        {/* Season 1 */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: `2px solid ${INK}`,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: INK,
              }}
            >
              Season 1
            </div>
            <SCaps size={10.5} ls="0.18em" color={INK55}>2018 · 10 episodes</SCaps>
          </div>
          {SEASON1.map(({ code, title, duration, solo }) => (
            <div
              key={code}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 80px 80px",
                gap: 24,
                padding: "16px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
              }}
            >
              <Pill size={9} ls="0.12em">{code}</Pill>
              <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: INK, lineHeight: 1.35 }}>
                {title}
              </div>
              <SCaps size={10} ls="0.10em" color={solo ? INK55 : YEL}>
                {solo ? "Solo" : "Guest"}
              </SCaps>
              <SCaps size={10} ls="0.10em" color={INK35} style={{ textAlign: "right" }}>
                {duration}
              </SCaps>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Guest appearances ─────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="03" label="Guest Circuit · Appearances on Other Shows" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
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
              On other people&rsquo;s{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>mics.</Mark>
              </span>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              In addition to hosting the SIA Business Podcast, Syed has appeared
              as a guest on podcasts in the US and UK — including the 12 Min Convos
              Podcast with Engel Jones — talking content marketing, earned media,
              personal branding, and the business of consulting.
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              To invite Syed as a guest on your podcast, use the contact form or
              book a speaker enquiry call.
            </p>
            <a
              href="/contact"
              style={{
                marginTop: 24,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 11.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: INK,
                textDecoration: "none",
                borderBottom: `1px solid ${INK}`,
                paddingBottom: 2,
              }}
            >
              Invite Syed as a guest →
            </a>
          </div>

          <div>
            {[
              "HARO and the art of the perfect pitch",
              "Earned media: the underrated growth channel for B2B",
              "Link building strategy for SEO agencies",
              "Building a personal brand as a consultant",
              "Content marketing for service businesses",
              "Remote team management lessons from DMR.agency",
              "Neuromarketing principles every marketer should know",
              "The SIA Business Podcast — Season 1 retrospective",
            ].map((topic, i) => (
              <div
                key={topic}
                style={{
                  padding: "14px 0",
                  borderBottom: `1px solid ${INK15}`,
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: 16,
                  alignItems: "baseline",
                }}
              >
                <SCaps size={10.5} ls="0.12em" color={INK35}>
                  {String(i + 1).padStart(2, "0")}.
                </SCaps>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 15.5,
                    color: INK70,
                    lineHeight: 1.4,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{topic}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}
