import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";

export const metadata: Metadata = {
  title: "Podcast · The SIA Show",
  description:
    "38 episodes across 4 seasons: conversations with founders, marketers, and operators on SEO, PR, link building, remote work, and growth. Hosted by Syed Irfan Ajmal.",
  openGraph: {
    title: "The SIA Show · Podcast",
    description: "Conversations on SEO, PR, link building, and growth with founders and operators.",
  },
  alternates: { canonical: "/podcast" },
};
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
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";
import { getEpisodeIndex } from "@/lib/podcast";
import { EpisodeIndex, type IndexSeason } from "./EpisodeIndex";

const SITE = "https://www.syedirfanajmal.com";
const RSS_URL = "https://anchor.fm/s/1515a1c/podcast/rss";

// ─── Data ─────────────────────────────────────────────────────────────────────

// episode tuple: [code, title, guest, slug, featured?]
type Episode = [string, string, string, string, true?];

type Season = {
  label: string;
  year: string;
  count: number;
  episodes: ReadonlyArray<Episode>;
};

const SEASONS: ReadonlyArray<Season> = [
  {
    label: "Season 4", year: "2021–22", count: 8,
    episodes: [
      ["S04E09", "Guest Post Pitch Tear Down: Avoid These 11 Mistakes Like the Plague",                      "Solo",               "guest-post-pitch-tear-down-11-mistakes"],
      ["S04E08", "Boomerang Review — Our Agency's Favourite Tool for Pitching and Email Management",         "Solo",               "boomerang-review-email-pitching-tool"],
      ["S04E07", "Two Methods for Finding No-Follow Links — And Why One of Them Isn't Too Good",             "Solo",               "finding-no-follow-links-two-methods"],
      ["S04E06", "Quantifying Backlinks Quality — The Bare Minimum",                                         "Solo",               "quantifying-backlinks-quality-bare-minimum"],
      ["S04E05", "Reviewing SEO KPIs of Target Websites",                                                    "Solo",               "reviewing-seo-kpis-target-websites"],
      ["S04E04", "The Difference Between Creating Links vs Earning Links",                                   "Solo",               "creating-links-vs-earning-links"],
      ["S04E02", "Brendon Burchard's High Performance Planner — My 1 Year Experience",                       "Solo",               "brendon-burchard-high-performance-planner"],
      ["S04E01", "Lead Scraping With Ahrefs — Operation: Competitor Spying",                                 "Solo",               "lead-scraping-ahrefs-competitor-spying"],
    ],
  },
  {
    label: "Season 3", year: "2020", count: 10,
    episodes: [
      ["S03E10", "Our Agency's 3-Step Client Onboarding Process",                                            "Solo",               "agency-3-step-client-onboarding-process"],
      ["S03E09", "Discussing HARO Outreach, SEO Agency Business, and Backlinks Management with Greg Heilers", "Greg Heilers",      "greg-heilers-interview", true],
      ["S03E08", "#SEObacklinks Tutorial — Type 3 Backlinks",                                                "Solo",               "seo-backlinks-type3"],
      ["S03E07", "#SEObacklinks Tutorial — Type 2 Backlinks",                                                "Solo",               "seo-backlinks-type2"],
      ["S03E06", "#SEObacklinks Tutorial — Type 1 Backlinks",                                                "Solo",               "seo-backlinks-tutorial"],
      ["S03E05", "SEO Outreach Project Management Made Easy",                                                "Solo",               "seo-project-management"],
      ["S03E04", "HARO Outreach vs Conventional Outreach for Quality Backlinks",                             "Solo",               "haro-outreach-vs-conventional-outreach"],
      ["S03E03", "Faisal Khan on Remote Team Management, Inbound Leads, Working Smarter",                   "Faisal Khan",        "faisal-khan-interview"],
      ["S03E02", "Remote Work Productivity: Our Top 7 Tools",                                                "Solo",               "remote-work-productivity-tools"],
      ["S03E01", "Fighting the Corona Recession: Our 7-Pronged Business Plan",                               "Solo",               "fighting-corona-recession-our-plan"],
    ],
  },
  {
    label: "Season 2", year: "2019", count: 10,
    episodes: [
      ["S02E10", "Unleashing Your Inner Sales Warrior With Jason Forrest",                             "Jason Forrest",           "jason-forrest"],
      ["S02E09", "Finding Your Unfair Advantage With Ash Ali & Hasan Kubba",                          "Ash Ali & Hasan Kubba",   "ash-ali-hasan-kubba"],
      ["S02E08", "Automated Outreach: Why I (Kind of) Changed My Mind",                               "Solo",                    "automated-outreach-insights"],
      ["S02E07", "Standing Out in the Crowd With This Simple Hack I'd Used in Denmark",               "Solo",                    "standing-out-hack-s02e07"],
      ["S02E06", "Collab Link Building",                                                               "Solo",                    "collab-link-building-s02e06"],
      ["S02E05", "Digital PR Vs SEO: Key Similarities and Differences",                               "Solo",                    "digital-pr-vs-seo-key-s02e05"],
      ["S02E04", "Leveraging Newsjacking for Content Promotion",                                       "Solo",                    "newsjacking-s02e04"],
      ["S02E03", "Ron Carucci on Power, Leadership, and Persuasion",                                   "Ron Carucci",             "ron-carucci-power-leadership"],
      ["S02E02", "Top 3 Mistakes of My ~6 Year Speaking Career",                                       "Solo",                    "mistakes-of-speaking-career-s02e02"],
      ["S02E01", "Recap of Season 1 + Introduction of Season 2",                                       "Solo",                    "recap-and-intro-s02e01"],
    ],
  },
  {
    label: "Season 1", year: "2018", count: 10,
    episodes: [
      ["S01E10", "How Negating Conventional Wisdom Led Me to Massive Success",              "Solo",          "negating-conventional-wisdom-massive-success"],
      ["S01E09", "My Productivity Hacks of 2018",                                           "Solo",          "2-game-changing-productivity-hacks-2018"],
      ["S01E08", "Melanie Martin on a $2.3 Million ROI PR Campaign",                        "Melanie Martin","melanie-marten-public-relations", true],
      ["S01E07", "Unique Twist to HARO Outreach for IMPROVED Backlinks",                    "Solo",          "haro-outreach-twist-for-better-backlinks"],
      ["S01E06", "Publicity & Backlinks Using HARO",                                        "Solo",          "publicity-backlinks-haro-s01e06"],
      ["S01E05", "SEO Myths",                                                               "Solo",          "top-3-seo-myths-sia-s01e05"],
      ["S01E04", "Elvin Zhang on Startups",                                                 "Elvin Zhang",   "elvin-zhang-startups-sia-s01e04"],
      ["S01E03", "Lisa Zahran on Copywriting",                                              "Lisa Zahran",   "lisa-zahran-copywriting-sia-01e03"],
      ["S01E02", "Liam Martin on Productivity & Remote Management",                         "Liam Martin",   "liam-martin-productivity-remote-employee-management-fighting-distraction-economy-s01e02"],
      ["S01E01", "Peter Gould on Branding",                                                 "Peter Gould",   "peter-gould-s01e01"],
    ],
  },
];

const FEATURED = {
  code:     "S01E08",
  title:    "Melanie Martin on a $2.3 Million ROI PR Campaign",
  guest:    "Melanie Martin",
  blurb:    "The single most-listened episode of the show. Melanie walks through a public relations campaign that returned $2.3M in measurable ROI, and what most companies still get wrong about earned media.",
  duration: "52 min",
  slug:     "melanie-marten-public-relations",
  spotifyEmbedId: "7ox7Vo94iyqs4IjHQhhwpR",
};

type Guest = { name: string; role: string; topic: string; ep: string; slug: string };
const NOTABLE_GUESTS: ReadonlyArray<Guest> = [
  { name: "Liam Martin",           role: "Co-founder, Time Doctor",             topic: "Productivity & remote management",              ep: "S01E02", slug: "liam-martin-productivity-remote-employee-management-fighting-distraction-economy-s01e02" },
  { name: "Peter Gould",           role: "Founder, Adventures",                 topic: "Branding for purpose-driven companies",          ep: "S01E01", slug: "peter-gould-s01e01" },
  { name: "Ron Carucci",           role: "Author · Forbes contributor",          topic: "Power, leadership, persuasion",                  ep: "S02E03", slug: "ron-carucci-power-leadership" },
  { name: "Jason Forrest",         role: "CEO, Forrest Performance",             topic: "Unleashing your inner sales warrior",            ep: "S02E10", slug: "jason-forrest" },
  { name: "Ash Ali & Hasan Kubba", role: "Co-authors, The Unfair Advantage",     topic: "Finding your unfair advantage",                  ep: "S02E09", slug: "ash-ali-hasan-kubba" },
  { name: "Melanie Martin",        role: "Publicist",                            topic: "$2.3M ROI PR campaign",                         ep: "S01E08", slug: "melanie-marten-public-relations" },
];

const PLATFORMS: ReadonlyArray<[string, string]> = [
  ["Apple Podcasts", "https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466"],
  ["Spotify",        "https://open.spotify.com/show/4ZUfaOaYVckXQ7Q9JnMS92"],
  ["YouTube",        "https://youtube.com/@syedirfanajmal/"],
  ["Pocket Casts",   "https://pca.st/itunes/1347540466"],
  ["RSS feed",       RSS_URL],
];

const STATS: ReadonlyArray<[string, string]> = [
  ["38",   "episodes shipped"],
  ["04",   "seasons (2018–2022)"],
  ["11",   "expert guests"],
  ["$2.3M","biggest case study covered"],
];

// ─── Episode enrichment (dates, summaries, topics from podcast data) ──────────

const TOPICS = [
  "Link building & SEO",
  "Digital PR & HARO",
  "Productivity & remote",
  "Business & growth",
] as const;

function topicsFor(title: string): string[] {
  const t = title.toLowerCase();
  const tags: string[] = [];
  if (/backlink|seo|link|ahrefs|kpi/.test(t)) tags.push(TOPICS[0]);
  if (/haro|\bpr\b|publicity|newsjack|pitch|outreach/.test(t)) tags.push(TOPICS[1]);
  if (/productiv|remote|tool|planner|boomerang|hack/.test(t)) tags.push(TOPICS[2]);
  if (/business|agency|client|sales|speak|startup|brand|copywrit|advantage|leadership|recession|wisdom|season/.test(t)) tags.push(TOPICS[3]);
  if (tags.length === 0) tags.push(TOPICS[3]);
  return tags;
}

function shorten(text: string, max = 170): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function buildIndexData(): {
  seasons: IndexSeason[];
  jsonLd: Record<string, unknown>;
} {
  const bySlug = new Map(getEpisodeIndex().map((ep) => [ep.slug, ep]));

  const seasons: IndexSeason[] = SEASONS.map((s) => ({
    label: s.label,
    year: s.year,
    episodes: s.episodes.map(([code, title, guest, slug, featured]) => {
      const meta = bySlug.get(slug);
      return {
        code,
        title,
        guest,
        slug,
        featured: featured === true,
        solo: guest === "Solo",
        date: meta?.publication_date
          ? new Date(meta.publication_date).toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            })
          : null,
        summary: meta?.summary ? shorten(meta.summary) : null,
        topics: topicsFor(title),
      };
    }),
  }));

  const episodesLd = SEASONS.flatMap((s) =>
    s.episodes.map(([, title, , slug]) => {
      const meta = bySlug.get(slug);
      return {
        "@type": "PodcastEpisode",
        name: title,
        url: `${SITE}/podcast/${slug}`,
        ...(meta?.publication_date
          ? { datePublished: meta.publication_date }
          : {}),
      };
    })
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "The SIA Business Podcast",
    url: `${SITE}/podcast`,
    webFeed: RSS_URL,
    description:
      "Conversations on SEO, digital PR, link building, remote work, and growth with founders and operators. Hosted by Syed Irfan Ajmal.",
    author: {
      "@type": "Person",
      name: "Syed Irfan Ajmal",
      url: SITE,
    },
    numberOfEpisodes: 38,
    episode: episodesLd,
  };

  return { seasons, jsonLd };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER }}>
    <div className="res-hero-grid">

      {/* Left: count */}
      <div className="res-hero-left">
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 0.85, letterSpacing: "-0.04em", color: INK }}>
          38
        </div>
        <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, lineHeight: 1.6 }}>
          Episodes<br />four seasons
        </div>
      </div>

      {/* Centre: headline */}
      <div className="res-hero-center">
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
          PODCAST
        </div>
        <SCaps size={10} ls="0.24em" color={INK55}>
          The SIA Business Podcast &nbsp;·&nbsp; Est. 2018 &nbsp;·&nbsp; Returning 2026
        </SCaps>
        <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          Conversations on<br />
          <em style={{ fontStyle: "italic", fontWeight: 600 }}>business &amp; craft.</em>
        </h1>
        <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK70, maxWidth: 480 }}>
          Interviews, solo breakdowns, and field dispatches from the earned-media trenches.
        </p>
        <a
          href="#subscriptions"
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "10px 16px",
            background: YEL,
            border: `1px solid ${INK}`,
            color: INK,
            textDecoration: "none",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          New season in 2026 · Get notified ↓
        </a>
      </div>

      {/* Right: topic index */}
      <div className="res-hero-right">
        {[
          { label: "Season 4 · 2021–22", sub: "Link building & tools" },
          { label: "Season 3 · 2020", sub: "SEO & outreach" },
          { label: "Season 2 · 2019", sub: "Growth & strategy" },
          { label: "Season 1 · 2018", sub: "Foundations" },
        ].map(t => (
          <div key={t.label}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, lineHeight: 1.2, letterSpacing: "-0.008em" }}>{t.label}</div>
            <div style={{ marginTop: 4, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>{t.sub}</div>
          </div>
        ))}
      </div>

    </div>
  </section>
);

// ─── Podcast Lead ─────────────────────────────────────────────────────────────

const PodcastLead = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 56, paddingBottom: 60 }}>
    <DoubleRule style={{ margin: "0 0 36px" }} />

    {/* Lead — 2-col: about the show + listen-on aside */}
    <div className="grid-hero-2col" style={{ alignItems: "start" }}>
      <div
        style={{
          columnCount: 2,
          columnGap: 28,
          fontFamily: SERIF,
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
            S
          </span>
          ince 2018, a show about the practical end of digital marketing:
          digital PR, SEO, content, agency operations, and the awkward
          economics of remote work. Four seasons, thirty-eight episodes,
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
          2026 with a fifth season focused on EMOS, earned media at scale,
          and conversations with the in-house teams running both.
        </p>
      </div>

      {/* Listen-on aside */}
      <aside style={{ background: PAPER2, border: `1px solid ${INK}`, padding: 24 }}>
        <Pill size={11} ls="0.20em">Listen on</Pill>
        <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 22, lineHeight: 1.25, color: INK, fontWeight: 700 }}>
          Wherever you
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 600 }}>get your podcasts.</span>
        </div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {PLATFORMS.map(([name, href]) => (
            <a
              key={name}
              href={href}
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
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 15,
                color: INK,
              }}
            >
              <span>{name}</span>
              <span style={{ fontFamily: GROT, fontSize: 14, color: INK70 }}>↗</span>
            </a>
          ))}
        </div>
      </aside>
    </div>

    {/* Stats strip */}
    <DoubleRule style={{ margin: "52px 0 0" }} />
    <div className="grid-stats">
      {STATS.map(([n, l], i) => (
        <div
          key={n}
          style={{
            padding: "24px 28px 6px",
            borderRight: i < 3 ? `1px solid ${INK35}` : "none",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {n}
          </div>
          <div style={{ marginTop: 8 }}>
            <SCaps size={10.5} ls="0.16em" color={INK70}>{l}</SCaps>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── §01 · Featured Episode ───────────────────────────────────────────────────

const Featured = () => (
  <section style={{ background: PAPER, padding: "90px 56px 60px" }}>
    <SectionMast n="01" label="Featured episode · Most-played" />

    <div
      className="grid-featured-dark"
      style={{
        background: INK,
        color: PAPER,
        padding: "48px 48px",
        position: "relative",
        border: `1px solid ${INK}`,
      }}
    >
      {/* Badge */}
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
        <SCaps size={11} ls="0.20em" color={YEL}>{FEATURED.code}</SCaps>
        <h2
          style={{
            margin: "14px 0 0",
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 44,
            color: PAPER,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          {FEATURED.title}
        </h2>
        <div style={{ marginTop: 22, display: "flex", gap: 24, alignItems: "baseline" }}>
          <SCaps size={10.5} ls="0.18em" color="rgba(250,250,250,.65)">
            Guest · {FEATURED.guest}
          </SCaps>
          <SCaps size={10.5} ls="0.18em" color="rgba(250,250,250,.65)">
            Run time · {FEATURED.duration}
          </SCaps>
        </div>
      </div>

      <div>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 19,
            color: "rgba(250,250,250,.85)",
            lineHeight: 1.55,
            fontStyle: "italic",
          }}
        >
          {FEATURED.blurb}
        </p>

        {/* Inline audio player */}
        <div style={{ marginTop: 24 }}>
          <iframe
            src={`https://open.spotify.com/embed/episode/${FEATURED.spotifyEmbedId}?theme=0`}
            width="100%"
            height={152}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            title={`${FEATURED.title} · audio player`}
            style={{ border: 0, display: "block" }}
          />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <a
            href={`/podcast/${FEATURED.slug}`}
            style={{
              flex: 1,
              display: "flex",
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
            }}
          >
            <span>Show notes &amp; transcript</span>
            <span style={{ fontFamily: SERIF, fontSize: 20 }}>→</span>
          </a>
        </div>
      </div>
    </div>
  </section>
);

// ─── §02 · Notable Guests ────────────────────────────────────────────────────

const Guests = () => (
  <section style={{ background: PAPER, padding: "60px 56px 90px" }}>
    <SectionMast n="02" label="Notable guests · From the desk" />

    <div className="grid-intro" style={{ marginBottom: 40 }}>
      <h2
        style={{
          margin: 0,
          fontFamily: SERIF,
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
          fontFamily: SERIF,
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
      className="grid-cards-3"
      style={{ gap: 0, border: `1px solid ${INK}` }}
    >
      {NOTABLE_GUESTS.map((g, i) => (
        <a
          key={g.name}
          href={`/podcast/${g.slug}`}
          style={{
            padding: "26px 24px",
            borderRight: i % 3 !== 2 ? `1px solid ${INK}` : "none",
            borderBottom: i < 3 ? `1px solid ${INK}` : "none",
            background: PAPER,
            display: "flex",
            flexDirection: "column",
            minHeight: 220,
            textDecoration: "none",
            color: INK,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <SCaps size={10.5} ls="0.18em" color={INK55}>{g.ep}</SCaps>
            <SCaps size={10.5} ls="0.14em" color={INK70}>Guest</SCaps>
          </div>
          <h4
            style={{
              margin: "14px 0 0",
              fontFamily: SERIF,
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
              fontFamily: SERIF,
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
              fontFamily: SERIF,
              fontSize: 15.5,
              color: INK,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            On: {g.topic}
          </p>
          <div style={{ marginTop: 14, textAlign: "right" }}>
            <SCaps size={10} ls="0.16em" color={INK55}>
              Listen ↗
            </SCaps>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PodcastPage() {
  const { seasons, jsonLd } = buildIndexData();

  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <PodcastLead />
      <Featured />
      <Guests />
      <EpisodeIndex seasons={seasons} topics={[...TOPICS]} />
      <Subscriptions sectionNumber="04" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
