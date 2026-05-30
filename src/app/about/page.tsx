import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import {
  DoubleRule,
  Flag,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import { ClientLogo } from "@/components/bureau/ClientLogo";
import { CLIENTS_PRE, CLIENTS_TIER1, type Client } from "@/data/clients";
import {
  CALENDLY,
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  MONO,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ─── Data ────────────────────────────────────────────────────────────────────

// Affiliate Prophet: US remote work signal (not in clients.ts — about page only)
const AFFILIATE_PROPHET: Client = {
  key: "affiliate-prophet",
  name: "Affiliate Prophet",
  fullName: "Affiliate Prophet · USA",
  country: "US",
  countryLabel: "Remote from Denmark",
  role: "Marketing · remote from Denmark",
  when: "2009",
  blurb:
    "A US-based MarTech startup, handled remotely from Denmark — among the " +
    "earliest remote-first engagements before distributed work was common practice.",
  wordmark: "Affiliate Prophet",
  logo: null,
};

// Override CLIENTS_PRE entries with corrected dates and display values for the about page.
// (clients.ts is shared with the clients page so we don't mutate it there.)
const PRE_AGENCY_CARDS: ReadonlyArray<Client> = [
  // GIZ: correct year is 2012, Islamabad office context
  {
    ...CLIENTS_PRE[0],
    when: "2012",
    blurb:
      "Germany's official agency for international development cooperation. " +
      "Contributed to a technology programme through their Islamabad office. " +
      "Operates in 120+ countries with EUR 3B+ annual volume, backed by the German federal government.",
  },
  // Marcus Evans: physically worked in Stockholm office of a UK-HQ'd company
  {
    ...CLIENTS_PRE[1],
    country: "SE" as any,
    countryLabel: "Stockholm, Sweden",
    fullName: "Marcus Evans Group · London HQ",
    role: "Conference producer · Stockholm office",
    blurb:
      "Premier global business intelligence and events company headquartered in London " +
      "and operating in 60+ countries. Based in their Stockholm office, producing " +
      "senior-executive conferences across major industries.",
  },
  // InfoShare: 2009, in person (not remote)
  {
    ...CLIENTS_PRE[2],
    when: "2009",
    role: "Digital / marketing · in person",
    blurb:
      "Danish digital organisation based in Copenhagen. An in-person engagement in " +
      "the Scandinavian tech scene before moving into international consulting.",
  },
  AFFILIATE_PROPHET,
];

type Testi = {
  badge: string;
  quote: string;
  name: string;
  role: string;
  place: string;
  img: string;
};

const TESTIMONIALS: ReadonlyArray<Testi> = [
  {
    badge: "0 → 1.5M MONTHLY UVs",
    quote:
      "Their expertise at doing customized outreach and earning quality whitehat backlinks day in and day out was critical to our phenomenal success and growth.",
    name: "Brett Helling",
    role: "CEO, Ridester.com / TrendlineSEO",
    place: "USA",
    img: "/assets/testimonials/brett-helling.jpeg",
  },
  {
    badge: "6× DAILY SIGNUPS",
    quote:
      "120% increase in organic traffic. Our Public Database clicks jumped 515% and impressions from 30K to 198K — resulting in six times more average daily signups.",
    name: "Imani Lea Brown",
    role: "Centriq (raised $11M)",
    place: "USA",
    img: "/assets/testimonials/imani-lea-brown.jpg",
  },
  {
    badge: "160K/mo · #4 GOOGLE",
    quote:
      "Ranked a keyword to #4 on Google that gets over 160,000 searches a month. Commercial intent. Can't thank Irfan and the team enough.",
    name: "Azzam Sheikh",
    role: "National Tyres & Autocare, UK",
    place: "Manchester",
    img: "/assets/testimonials/azzam-sheikh.jpeg",
  },
  {
    badge: "140% TRAFFIC · 3 MONTHS",
    quote:
      "Traffic increased 140% in 3 months — against a goal of 25% in 9 months. Page views up 102%. Impressions up 65%. They simply overdelivered.",
    name: "Reem El Shafaki",
    role: "DinarStandard",
    place: "UAE",
    img: "/assets/testimonials/reem-el-shafaki.jpg",
  },
  {
    badge: "DMSS.IO BALI · WORKSHOP",
    quote:
      "Syed spoke at our conference and gave me a private consultation on media exposure. An excellent public speaker with highly actionable advice. Comes highly recommended.",
    name: "Brie Moreau",
    role: "Co-founder, DMSS.io Conference",
    place: "Bali",
    img: "/assets/testimonials/brie-moreau.jpg",
  },
  {
    badge: "PODCAST GUEST",
    quote:
      "Being a great speaker takes art and science, experience, and personal clarity. Irfan delivers on all of it, and it is hard not to like the guy.",
    name: "Chuck Wang",
    role: "The MVP Marketing Podcast",
    place: "San Francisco",
    img: "/assets/testimonials/chuck-wang.jpg",
  },
];

type PressGroup = { label: string; items: ReadonlyArray<string> };
const PRESS_GROUPS: ReadonlyArray<PressGroup> = [
  {
    label: "Global business & ideas",
    items: ["Forbes", "Harvard Business Review", "HuffPost", "Entrepreneur", "Reader's Digest"],
  },
  {
    label: "Tech & startups",
    items: ["The Next Web (TNW)", "CNET", "Virgin Startup", "GBG · Google Business Group"],
  },
  {
    label: "Marketing, SEO & PR",
    items: ["SEMrush Blog", "Search Engine Journal", "SERPed", "Business.com", "Spin Sucks", "GrowMap"],
  },
  {
    label: "Regional & development",
    items: ["Aurora · Pakistan's largest marketing magazine", "The World Bank Blog"],
  },
];

type MediaItem = {
  video?: string;
  poster?: string;
  src?: string;
  cap: string;
  sub: string;
  col: string;
  row: string;
  minH: number;
  badge?: string;
};

// Abroad photos only. Istanbul slot commented — add /assets/personal/istanbul.jpg when ready.
const OFF_DESK: ReadonlyArray<MediaItem> = [
  {
    video: "/assets/personal/climb-video-1.mp4",
    poster: "/assets/personal/climb-1.jpg",
    cap: "Climbing reel · Peshawar",
    sub: "Mar 2022",
    col: "span 6",
    row: "span 2",
    minH: 280,
    badge: "Reel · 01",
  },
  {
    video: "/assets/personal/climb-video-2.mp4",
    poster: "/assets/personal/climb-2.jpg",
    cap: "Climbing reel · Peshawar",
    sub: "Mar 2022",
    col: "span 6",
    row: "span 2",
    minH: 280,
    badge: "Reel · 02",
  },
  {
    src: "/assets/personal/sweden-malardalen.jpg",
    cap: "Mälardalen campus",
    sub: "Västerås, Sweden",
    col: "span 4",
    row: "span 1",
    minH: 220,
  },
  {
    src: "/assets/personal/sweden-audience.jpg",
    cap: "SIFE competition",
    sub: "Sweden · 2007",
    col: "span 4",
    row: "span 1",
    minH: 220,
  },
  {
    src: "/assets/personal/sfo-2022.jpg",
    cap: "San Francisco",
    sub: "July 2022",
    col: "span 4",
    row: "span 1",
    minH: 220,
  },
  {
    src: "/assets/personal/sweden-waterfront.jpg",
    cap: "On the dock",
    sub: "Sweden",
    col: "span 6",
    row: "span 1",
    minH: 220,
  },
  {
    src: "/assets/personal/climb-malaysia-2.jpg",
    cap: "Climbing wall",
    sub: "Kuala Lumpur",
    col: "span 6",
    row: "span 1",
    minH: 220,
  },
  {
    src: "/assets/personal/Irfan_Istanbul_1.jpeg",
    cap: "Istanbul",
    sub: "Turkey",
    col: "span 12",
    row: "span 1",
    minH: 300,
    badge: "Istanbul",
  },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER }}>
    <div className="res-hero-grid">

      {/* Left: years count */}
      <div className="res-hero-left">
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 0.85, letterSpacing: "-0.04em", color: INK }}>
          22
        </div>
        <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, lineHeight: 1.6 }}>
          Years<br />in practice
        </div>
      </div>

      {/* Centre: headline */}
      <div className="res-hero-center">
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
          ABOUT
        </div>
        <SCaps size={10} ls="0.24em" color={INK55}>
          Entrepreneur &nbsp;·&nbsp; Marketer &nbsp;·&nbsp; Columnist &nbsp;·&nbsp; Int&apos;l Speaker
        </SCaps>
        <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          The work speaks.<br />
          <em style={{ fontStyle: "italic", fontWeight: 600 }}>The numbers confirm it.</em>
        </h1>
        <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: INK70, maxWidth: 480 }}>
          No retainer theatre. No vanity metrics. The results are on the record, and the case studies are below.
        </p>
      </div>

      {/* Right: topic index */}
      <div className="res-hero-right">
        {[
          { label: "Press",        sub: "Forbes · HBR · 13 more" },
          { label: "Case Studies", sub: "Results on the record" },
          { label: "Client words", sub: "6 testimonials on file" },
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

// ─── Stats Strip ──────────────────────────────────────────────────────────────

const STATS = [
  { num: "Est. 2004", label: "In practice", sub: "US remote clients from day one" },
  { num: "SE · DK · SV", label: "Countries, lived and worked", sub: "Peshawar and Islamabad now" },
  { num: "300+", label: "Clients served", sub: "USA · EU · MENA · APAC" },
  { num: "15+", label: "Major bylines", sub: "Forbes · HBR · HuffPost · and more" },
] as const;

const StatsStrip = () => (
  <div
    className="grid-stats"
    style={{
      borderTop: `2px solid ${INK}`,
      borderBottom: `2px solid ${INK}`,
    }}
  >
    {STATS.map((s, i) => (
      <div key={i} className="stat-item" style={{ padding: "22px 28px" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(18px, 2.5vw, 28px)", color: INK, lineHeight: 1, letterSpacing: "-0.02em", borderBottom: `2px solid ${YEL}`, paddingBottom: 4, display: "inline-block" }}>
          {s.num}
        </div>
        <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 800, fontSize: 13, color: INK, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
          {s.label}
        </div>
        {/* SE · DK · SV item: show flags */}
        {i === 1 ? (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Flag c="SE" w={18} />
            <Flag c="DK" w={18} />
            <Flag c="US" w={18} />
            <span style={{ fontFamily: MONO, fontSize: 10, color: INK55, letterSpacing: "0.06em" }}>
              SE · DK · SV · Peshawar now
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 11, color: INK70, lineHeight: 1.5, letterSpacing: "0.04em" }}>
            {s.sub}
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── § A · Pre-agency desk ────────────────────────────────────────────────────

const PreAgencyCard = ({ c }: { c: Client }) => (
  <article
    style={{
      background: PAPER,
      border: `1px solid ${INK}`,
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minHeight: 340,
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Flag c={c.country as any} w={22} />
        <SCaps size={10.5} ls="0.18em" color={INK55}>{c.countryLabel}</SCaps>
      </div>
      <SCaps size={10.5} ls="0.18em" color={INK55}>{c.when}</SCaps>
    </div>

    <div
      style={{
        flex: "0 0 auto",
        borderTop: `1px solid ${INK15}`,
        borderBottom: `1px solid ${INK15}`,
        padding: "18px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
      }}
    >
      <ClientLogo client={c} height={c.logo ? 56 : 48} maxWidth={200} />
    </div>

    <div>
      <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.015em", color: INK }}>
        {c.name}
      </h3>
      <div style={{ marginTop: 5, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }}>
        {c.fullName}
      </div>
      <div style={{ marginTop: 10 }}>
        <SCaps size={10.5} ls="0.20em" color={INK}>{c.role}</SCaps>
      </div>
    </div>

    <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.5, flex: 1 }}>
      {c.blurb}
    </p>
  </article>
);

const PreAgency = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 72 }}>
    <SectionMast n="A" label="Pre-agency desk · Before DMR.agency" />
    <div className="grid-pre-agency-4">
      {PRE_AGENCY_CARDS.map((c) => (
        <PreAgencyCard key={c.key} c={c} />
      ))}
    </div>
  </section>
);

// ─── § B · Press Archive ──────────────────────────────────────────────────────

const PressArchive = () => (
  <section className="sx" style={{ background: INK, paddingTop: 72, paddingBottom: 72 }}>
    <SectionMast n="B" label="Where the work has been read · Bylines & citations" dark />

    <div className="grid-intro" style={{ marginBottom: 48 }}>
      <h2
        className="h2-lg"
        style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: PAPER, lineHeight: 0.98, letterSpacing: "-0.025em" }}
      >
        Written for.<br />
        <span style={{ fontStyle: "italic" }}>
          <span style={{ background: YEL, color: INK, padding: "0 6px" }}>Quoted in.</span>
        </span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: "rgba(241,235,222,.65)", lineHeight: 1.55, maxWidth: 520 }}>
        Fifteen-plus publications across global business, technology, marketing,
        and development. Contributor bylines, expert citations, and a print spread
        in Forbes Middle East.
      </p>
    </div>

    {/* Forbes ME print feature */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 20,
        padding: 14,
        background: "#111",
        border: `1px solid rgba(241,235,222,.18)`,
        marginBottom: 36,
      }}
      className="forbes-spread"
    >
      <figure style={{ margin: 0, padding: 8, background: "#0a0a0a", border: `1px solid rgba(241,235,222,.12)`, display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/personal/forbes-me-print.jpg"
          alt="How Qatar Can Become The Silicon Valley Of The Arab World · Forbes Middle East print"
          style={{ width: "100%", height: "auto", maxHeight: 380, objectFit: "contain", display: "block" }}
        />
      </figure>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 4px" }}>
        <div>
          <div style={{ display: "inline-block", padding: "4px 10px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            In print · Forbes ME
          </div>
          <h3 style={{ margin: "18px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(18px, 3vw, 26px)", color: PAPER, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
            &ldquo;How Qatar Can Become The Silicon Valley<br />
            <span style={{ fontStyle: "italic", fontWeight: 600 }}>Of The Arab World.&rdquo;</span>
          </h3>
          <p style={{ marginTop: 14, fontFamily: SERIF, fontSize: 15.5, color: "rgba(241,235,222,.65)", lineHeight: 1.55, maxWidth: 520 }}>
            Published in the Forbes Middle East Guide print edition, in collaboration
            with Arab Publisher House (APH). One of a small handful of in-print Forbes
            ME bylines by a Pakistani author.
          </p>
        </div>
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid rgba(241,235,222,.12)`, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <SCaps size={10.5} ls="0.18em" color="rgba(241,235,222,.45)">Forbes ME Guide · 2017 · Print edition</SCaps>
          <SCaps size={10.5} ls="0.16em" color={PAPER}>Featured byline</SCaps>
        </div>
      </div>
    </div>

    {/* Publication groups */}
    <div className="grid-cards-2" style={{ border: `1px solid rgba(241,235,222,.18)` }}>
      {PRESS_GROUPS.map((g, gi) => (
        <div
          key={g.label}
          style={{
            padding: "28px 30px 26px",
            background: "transparent",
            borderRight: gi % 2 === 0 ? `1px solid rgba(241,235,222,.18)` : "none",
            borderBottom: gi < 2 ? `1px solid rgba(241,235,222,.18)` : "none",
          }}
        >
          <SCaps size={10.5} ls="0.20em" color="rgba(241,235,222,.45)">{g.label}</SCaps>
          <div style={{ marginTop: 14, marginBottom: 0, height: 1, background: "rgba(241,235,222,.18)" }} />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {g.items.map((name) => (
              <li
                key={name}
                style={{
                  display: "flex",
                  padding: "10px 0",
                  borderBottom: `1px solid rgba(241,235,222,.08)`,
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(15px, 2vw, 19px)", color: PAPER }}>
                  {name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

// ─── § C · Selected results ───────────────────────────────────────────────────

const CaseStudies = () => {
  // Centriq first (index 2), then NTA (0), Ridester (1)
  const cases = [CLIENTS_TIER1[2], CLIENTS_TIER1[0], CLIENTS_TIER1[1]];
  return (
    <section className="sx" style={{ background: PAPER2, paddingTop: 72, paddingBottom: 72 }}>
      <SectionMast n="C" label="Selected results · The numbers on the record" />

      <div className="grid-intro" style={{ marginBottom: 48 }}>
        <h2
          className="h2-lg"
          style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}
        >
          Numbers,<br />
          <span style={{ fontStyle: "italic" }}>
            <Mark>not promises.</Mark>
          </span>
        </h2>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.55, maxWidth: 520 }}>
          Three engagements with documented outcomes. Results are verifiable —
          case studies are linked where available. If you want to speak with a
          client directly, ask.
        </p>
      </div>

      <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
        {cases.map((c, i) => (
          <div
            key={c.key}
            className="card-border"
            style={{ padding: "36px 32px 32px", background: PAPER2, display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <SCaps size={10} ls="0.14em" color={INK55}>{c.sector}</SCaps>
              <Flag c={c.country as any} w={20} />
            </div>
            <HRule style={{ margin: "16px 0" }} />
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(28px, 4vw, 44px)", color: INK, lineHeight: 1, letterSpacing: "-0.03em" }}>
              {c.stat}
            </div>
            <div style={{ marginTop: 8, fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, lineHeight: 1.4 }}>
              {c.statLabel}
            </div>
            <div style={{ marginTop: 18, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(17px, 2vw, 21px)", color: INK, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              {c.name}
            </div>
            <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70, lineHeight: 1.5, flex: 1 }}>
              {c.blurb}
            </p>
            {c.caseStudy && (
              <a
                href={c.caseStudy}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 22, fontFamily: MONO, fontSize: 11, fontWeight: 700, color: INK, letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: `2px solid ${INK}`, paddingBottom: 3, alignSelf: "flex-start" }}
              >
                Full case study →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── § D · Testimonials ───────────────────────────────────────────────────────

const Testimonials = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 72, paddingBottom: 72 }}>
    <SectionMast n="D" label="Client words · On the record" />

    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 48 }}>
      <h2 className="h2-lg" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        What clients say.
      </h2>
      <a href="/clients" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
        ALL TESTIMONIALS →
      </a>
    </div>

    {TESTIMONIALS.map((t, i) => (
      <div key={i} className="about-testi-row" style={{ borderTop: i === 0 ? `2px solid ${INK}` : undefined }}>
        {/* Left: index + badge */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: INK70, letterSpacing: "0.08em" }}>
            № {String(i + 1).padStart(2, "0")}
          </div>
          <div style={{ display: "inline-block", padding: "6px 10px", marginTop: 12, background: INK, color: YEL, fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em" }}>
            {t.badge}
          </div>
        </div>

        {/* Centre: quote */}
        <blockquote style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(18px, 2.5vw, 26px)", lineHeight: 1.28, color: INK, letterSpacing: "-0.01em" }}>
          <span style={{ color: "rgba(26,20,16,.25)", fontFamily: SERIF, fontSize: "1.2em" }}>&ldquo;</span>
          {t.quote}
          <span style={{ color: "rgba(26,20,16,.25)", fontFamily: SERIF, fontSize: "1.2em" }}>&rdquo;</span>
        </blockquote>

        {/* Right: person */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.img}
            alt={t.name}
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", marginBottom: 12, display: "block" }}
          />
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK }}>{t.name}</div>
          <div style={{ marginTop: 5, fontFamily: MONO, fontSize: 11, color: INK70, letterSpacing: "0.04em", lineHeight: 1.5 }}>
            {t.role}<br />
            <span style={{ color: INK55 }}>{t.place}</span>
          </div>
        </div>
      </div>
    ))}
  </section>
);

// ─── § E · Off the Desk ───────────────────────────────────────────────────────

const OffTheDesk = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 72, paddingBottom: 72 }}>
    <SectionMast n="E" label="Off the desk · Filed from abroad" />

    <div className="grid-intro" style={{ marginBottom: 40 }}>
      <h2
        className="h2-lg"
        style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}
      >
        The bureau,<br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>after hours.</Mark>
        </span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18, color: INK70, lineHeight: 1.55, maxWidth: 520 }}>
        Sweden, Malaysia, San Francisco — and a climbing wall in Peshawar that
        gets more use than it should.
      </p>
    </div>

    <div className="gallery-mosaic">
      {OFF_DESK.map((p, i) => (
        <figure
          key={i}
          style={{
            margin: 0,
            gridColumn: p.col,
            gridRow: p.row,
            background: PAPER2,
            border: `1px solid ${INK}`,
            padding: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: p.minH,
              border: `1px solid ${INK}`,
              overflow: "hidden",
              background: "#1a1410",
              position: "relative",
            }}
          >
            {p.video ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={p.video}
                autoPlay
                muted
                loop
                playsInline
                poster={p.poster}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.src}
                alt={p.cap}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  // Istanbul: shift up to show face; default: center
                  objectPosition: p.badge === "Istanbul" ? "center 15%" : "center center",
                }}
              />
            )}
            {p.badge && (
              <div style={{ position: "absolute", top: 10, left: 10, background: YEL, color: INK, padding: "4px 9px", fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {p.badge}
              </div>
            )}
          </div>
          <figcaption style={{ padding: "8px 4px 2px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK, lineHeight: 1.35 }}>{p.cap}</div>
            <SCaps size={9.5} ls="0.14em" color={INK55}>{p.sub}</SCaps>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
);

// ─── § F · Editor's note ──────────────────────────────────────────────────────

const EditorNote = () => (
  <section className="sx" style={{ background: PAPER2, paddingTop: 72, paddingBottom: 72 }}>
    <SectionMast n="F" label="Editor's note · A working filter" />

    <div className="grid-intro">
      <div>
        <SCaps size={11} ls="0.22em" color={INK55}>From the desk of</SCaps>
        <div style={{ marginTop: 6, fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "-0.01em", lineHeight: 1.1, color: INK }}>
          Syed Irfan Ajmal
        </div>
        <div style={{ marginTop: 4, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }}>
          Peshawar · Founded DMR.agency 2013
        </div>
      </div>
      <div>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 20, lineHeight: 1.6, color: INK }}>
          I started my career in tech, moved into sales, then found my
          calling in SEO and earned media. The questions have stayed the
          same since 2004: who reads what, what earns trust, why this story
          now. I lived and worked in Sweden and Denmark, then built
          DMR.agency from Peshawar into a practice serving clients across
          twenty-plus countries.
        </p>
        <p style={{ marginTop: 16, fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: INK70, lineHeight: 1.6 }}>
          You can usually find me writing from Peshawar. Occasionally I am
          working remotely from California, Madinah, Kuala Lumpur, or Dubai
          — not all at once.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "12px 18px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Book a discovery call →
          </a>
          <a
            href="/emos"
            style={{ padding: "12px 18px", background: "transparent", color: INK, border: `1px solid ${INK}`, textDecoration: "none", fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            EMOS →
          </a>
          <a
            href="/fractional-cmo"
            style={{ padding: "12px 18px", background: "transparent", color: INK, border: `1px solid ${INK}`, textDecoration: "none", fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Fractional CMO →
          </a>
        </div>
      </div>
    </div>
  </section>
);

// ─── § G · Outro ──────────────────────────────────────────────────────────────

const Outro = () => (
  <section
    className="sx"
    style={{
      background: INK,
      paddingTop: 90,
      paddingBottom: 90,
      borderTop: `1px solid rgba(241,235,222,.12)`,
    }}
  >
    <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={11} ls="0.22em" color="rgba(241,235,222,.5)">A note to close</SCaps>
      <h2
        className="h2-sm"
        style={{
          margin: "18px 0 0",
          fontFamily: SERIF,
          fontWeight: 700,
          color: PAPER,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        If your business needs to be{" "}
        <span style={{ fontStyle: "italic" }}>
          <span style={{ background: YEL, color: INK, padding: "0 6px" }}>found, covered, or believed</span>
        </span>
        , you know where the bureau is.
      </h2>
      <div style={{ marginTop: 36, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href="/resources"
          style={{ padding: "16px 26px", background: PAPER, color: INK, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          Free resources →
        </a>
        <a
          href="/emos"
          style={{ padding: "16px 26px", background: YEL, color: INK, textDecoration: "none", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          EMOS →
        </a>
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          style={{ padding: "16px 26px", background: "transparent", color: PAPER, textDecoration: "none", border: `1px solid rgba(241,235,222,.35)`, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          Fractional CMO →
        </a>
      </div>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ background: PAPER }}>
      <Hero />
      <StatsStrip />
      <PreAgency />
      <PressArchive />
      <CaseStudies />
      <Testimonials />
      <OffTheDesk />
      <EditorNote />
      <Outro />
      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
