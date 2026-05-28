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

const FEATURED_EPISODES: ReadonlyArray<{
  n: string;
  title: string;
  guest: string;
  topic: string;
  duration: string;
  date: string;
}> = [
  {
    n: "40",
    title: "The Earned Media Playbook: How to Get in Forbes Without a PR Agency",
    guest: "Solo",
    topic: "Earned Media · PR",
    duration: "48 min",
    date: "May 2026",
  },
  {
    n: "39",
    title: "Personal Branding for Founders: The Five-Year Framework",
    guest: "Solo",
    topic: "Personal Branding",
    duration: "42 min",
    date: "Apr 2026",
  },
  {
    n: "38",
    title: "Neuromarketing Deep Dive: The Psychology Behind Viral Content",
    guest: "Solo",
    topic: "Neuromarketing",
    duration: "51 min",
    date: "Apr 2026",
  },
  {
    n: "37",
    title: "SEO in 2026: What Changed, What Didn't, What Works",
    guest: "Solo",
    topic: "SEO · Content",
    duration: "44 min",
    date: "Mar 2026",
  },
  {
    n: "36",
    title: "The Fractional CMO Model: How It Works for Founders",
    guest: "Solo",
    topic: "Fractional CMO",
    duration: "38 min",
    date: "Mar 2026",
  },
  {
    n: "35",
    title: "HARO Mastery: Getting 10 Press Mentions a Month",
    guest: "Solo",
    topic: "Earned Media",
    duration: "45 min",
    date: "Feb 2026",
  },
];

const ALL_EPISODES: ReadonlyArray<{
  n: string;
  title: string;
  topic: string;
  duration: string;
}> = [
  { n: "34", title: "LinkedIn Authority: The 90-Day Blueprint", topic: "Personal Branding", duration: "36 min" },
  { n: "33", title: "The Long-Form Content Moat", topic: "Content Strategy", duration: "41 min" },
  { n: "32", title: "Storytelling for Business: The Three-Act Structure", topic: "Storytelling", duration: "39 min" },
  { n: "31", title: "Building a Writing Habit That Compounds", topic: "Writing", duration: "33 min" },
  { n: "30", title: "From Zero to Forbes: A Case Study", topic: "Earned Media", duration: "52 min" },
  { n: "29", title: "Pricing Your Expertise: The Authority Premium", topic: "Consulting", duration: "44 min" },
  { n: "28", title: "The Podcast Guest Playbook", topic: "Podcast · PR", duration: "37 min" },
  { n: "27", title: "Why Your Blog Isn't Working (And How to Fix It)", topic: "Content", duration: "43 min" },
  { n: "26", title: "Data Storytelling: Numbers That Persuade", topic: "Writing · Data", duration: "40 min" },
  { n: "25", title: "How to Write an Op-Ed That Gets Published", topic: "Writing · PR", duration: "35 min" },
  { n: "24", title: "The Consulting Funnel: Earned Media to Clients", topic: "Business Development", duration: "46 min" },
  { n: "23", title: "Cognitive Biases Every Marketer Should Know", topic: "Neuromarketing", duration: "50 min" },
];

const PLATFORMS = [
  { name: "Apple Podcasts", url: "#" },
  { name: "Spotify", url: "#" },
  { name: "YouTube", url: "#" },
  { name: "RSS Feed", url: "#" },
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

        <SectionMast n="00" label="The Bureau Podcast · Audio Desk" dark />

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
              Marketing,{" "}
              <span style={{ fontStyle: "italic", color: YEL }}>media</span>
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
              The Bureau Podcast is where Syed Irfan Ajmal thinks out loud about
              earned media, personal branding, content strategy, and the craft of
              building authority in public. No guests — just research, cases, and
              honest takes. Forty episodes and counting.
            </p>

            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {PLATFORMS.map(({ name, url }) => (
                <a
                  key={name}
                  href={url}
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
              { stat: "40", label: "Episodes" },
              { stat: "Solo", label: "Format" },
              { stat: "35–55", label: "Minutes avg." },
              { stat: "2021", label: "Launched" },
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
        <SectionMast n="01" label="Recent Episodes · The Latest Six" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {FEATURED_EPISODES.map(({ n, title, topic, duration, date }) => (
            <div key={n} style={{ borderTop: `2px solid ${INK}` }}>
              <div
                style={{
                  padding: "14px 0 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <Pill size={9.5} ls="0.14em">Ep. {n}</Pill>
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
                  margin: "0 0 12px",
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
              <HRule />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <SCaps size={10} ls="0.12em" color={INK55}>{date}</SCaps>
                <a
                  href="#"
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

      {/* ── All episodes list ─────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="02" label="The Archive · All Episodes" />
        <div>
          {ALL_EPISODES.map(({ n, title, topic, duration }, i) => (
            <div
              key={n}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 160px 80px",
                gap: 24,
                padding: "20px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
              }}
            >
              <SCaps size={11} ls="0.14em" color={INK35}>
                {n}.
              </SCaps>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  fontWeight: 600,
                  color: INK,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
              <SCaps size={10} ls="0.12em" color={YEL}>
                {topic}
              </SCaps>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SCaps size={10} ls="0.10em" color={INK35}>
                  {duration}
                </SCaps>
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: 32,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            <SCaps size={11} ls="0.18em" color={INK55}>
              Episodes 1–22 available on Apple Podcasts, Spotify, and YouTube
            </SCaps>
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Guest appearances ─────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="03" label="Guest Circuit · 15+ Appearances" />
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
              In addition to the Bureau Podcast, Syed has appeared as a guest
              on 15+ podcasts in the US and UK — talking content marketing,
              earned media, personal branding, and the business of consulting.
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
              book a 15-minute speaker enquiry call.
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
              "Content marketing strategy and why most brands get it wrong",
              "Earned media: the underrated growth channel",
              "Building a personal brand as a consultant",
              "The long-form writing habit and how it compounds",
              "HARO and the art of the perfect pitch",
              "From Peshawar to Forbes: the global marketing bureau",
              "Neuromarketing principles every marketer should know",
              "Why SEO and PR belong in the same team",
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
