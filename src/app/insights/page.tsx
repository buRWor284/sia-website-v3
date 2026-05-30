import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
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
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ─── Data ─────────────────────────────────────────────────────────────────────

const INTERNAL_SLUGS = new Set(["personal-branding", "storytelling", "neuromarketing", "writing-tips"]);

const ART = (slug: string): string =>
  INTERNAL_SLUGS.has(slug)
    ? `/insights/${slug}`
    : `https://syedirfanajmal.com/${slug}/`;

const isInternal = (slug: string) => INTERNAL_SLUGS.has(slug);

type Feature = { tag: string; no: string; title: string; sub: string; blurb: string; slug: string; wc: string; read: string };
const FEATURES: ReadonlyArray<Feature> = [
  {
    tag: "101 series", no: "01",
    title: "Personal Branding 101",
    sub: "How to brand yourself for success.",
    blurb: "A long-form guide to building a personal brand that opens doors. Five pillars: clarity, consistency, content, community, credibility. Updated for 2021.",
    slug: "personal-branding", wc: "~6,000 words", read: "24 min",
  },
  {
    tag: "101 series", no: "02",
    title: "Storytelling 101",
    sub: "Elevate your brand.",
    blurb: "The neurological case for stories, the hero's journey applied to brand narrative, and practical frameworks for weaving storytelling through content, decks, and pitches.",
    slug: "storytelling", wc: "~5,500 words", read: "21 min",
  },
  {
    tag: "101 series", no: "03",
    title: "Neuromarketing 101",
    sub: "What it is and how it works.",
    blurb: "Anchoring, the power of free, loss aversion, social proof, the decoy effect. Red Bull, Porsche, Coke vs. Pepsi. Real research, practical applications.",
    slug: "neuromarketing", wc: "~3,200 words", read: "13 min",
  },
];

type Article = { title: string; slug: string; cat: string; y: string; updated?: string };
const ARTICLES: ReadonlyArray<Article> = [
  { title: "100+ Writing Tips to Become a Great Writer", slug: "writing-tips",                                         cat: "Craft",       y: "2016", updated: "2022" },
  { title: "How to Become a Good Writer",                slug: "become-a-good-writer",                                 cat: "Craft",       y: "—" },
  { title: "6 Productivity Hacks for Entrepreneurs",     slug: "6-productivity-hacks-entrepreneurs",                   cat: "Operating",   y: "2021" },
  { title: "6 Must-Have Digital Tools for Writers",      slug: "digital-tools-writers-editors",                       cat: "Tools",       y: "2020" },
  { title: "5 Google Analytics Metrics for Content",     slug: "google-analytics-content-marketing",                   cat: "Measurement", y: "2020" },
  { title: "How To Maximize eCommerce Conversions",      slug: "maximize-ecommerce-conversions-using-product-discovery", cat: "Strategy",  y: "—" },
];

type Infographic = { title: string; slug: string; y: string; updated?: string; href?: string };
const INFOGRAPHICS: ReadonlyArray<Infographic> = [
  { title: "Top 11 Scientific Benefits of Writing",        slug: "top-11-scientific-benefits-writing-infographic",       y: "2019", href: "/infographics/writing-benefits" },
  { title: "The Journo Outreach Checklist",                slug: "journo-outreach-checklist",                            y: "2026", href: "/infographics/journo-outreach-checklist" },
  { title: "Managing Remote Teams with HubStaff",          slug: "managing-remote-teams-with-hubstaff-time-tracking",    y: "2016", updated: "2021" },
  { title: "How to Form Writing Habits for Success",       slug: "form-writing-habits-success-infographic",              y: "—" },
  { title: "Getting Content Ideas from Your Customers",    slug: "content-ideas-from-customers-infographic",             y: "—" },
];

const PRESS_OUTLETS: ReadonlyArray<[string, string]> = [
  ["Forbes",                   "Contributor & featured"],
  ["Harvard Business Review",  "Guest contributor"],
  ["HuffPost",                 "Contributor"],
  ["The Next Web (TNW)",       "Featured"],
  ["Entrepreneur",             "Contributor"],
  ["Search Engine Journal",    "Contributor"],
  ["SEMrush Blog",             "Contributor"],
  ["Business.com",             "Contributor"],
  ["Reader's Digest",          "Featured"],
  ["Virgin Startup",           "Contributor"],
  ["The World Bank Blog",      "Contributor"],
  ["CNET",                     "Featured"],
  ["SERPed",                   "Contributor"],
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 56, paddingBottom: 70 }}>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <SCaps color={INK70} size={12} ls="0.28em">
        Long-form writing &nbsp;·&nbsp; Essays, infographics, bylines
      </SCaps>
    </div>
    <h1
      className="hero-h1"
      style={{ fontFamily: SERIF, fontWeight: 700, color: INK }}
    >
      <span style={{ display: "block" }}>Selected</span>
      <span style={{ display: "block", fontStyle: "italic", fontWeight: 600 }}>
        <Mark>writing.</Mark>
      </span>
    </h1>
    <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
      <SCaps size={11.5} ls="0.22em" color={INK55}>
        Forty-plus essays &nbsp;·&nbsp; five infographics &nbsp;·&nbsp;
        <span style={{ color: INK }}>thirteen-plus publications</span>
      </SCaps>
    </div>
    <DoubleRule style={{ margin: "44px 0 0" }} />
  </section>
);

// ─── §01 · Featured (101 Series) ─────────────────────────────────────────────

const Featured = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 90 }}>
    <SectionMast n="01" label="The 101 Series · Three long-form guides" />

    <div className="grid-intro">
      <h2
        className="h2-xl"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Three guides
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
        The 101 Series: three of the most-read pieces on the site, each a
        complete guide to a subject I have spent years putting into practice.
        Updated annually; bookmark-worthy.
      </p>
    </div>

    <div
      className="grid-cards-3"
      style={{ border: `1px solid ${INK}` }}
    >
      {FEATURES.map((f, i) => (
        <a
          key={f.title}
          href={ART(f.slug)}
          target={isInternal(f.slug) ? undefined : "_blank"}
          rel={isInternal(f.slug) ? undefined : "noopener noreferrer"}
          className="card-border"
          style={{
            padding: "32px 28px 28px",
            background: i === 1 ? PAPER2 : PAPER,
            textDecoration: "none",
            color: INK,
            display: "flex",
            flexDirection: "column",
            minHeight: 460,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Pill size={10.5} ls="0.20em">{f.tag}</Pill>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 42,
                color: INK,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {f.no}
            </div>
          </div>
          <h3
            style={{
              margin: "20px 0 0",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 34,
              color: INK,
              lineHeight: 1.05,
              letterSpacing: "-0.018em",
            }}
          >
            {f.title}
          </h3>
          <div
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 19,
              color: INK70,
              lineHeight: 1.3,
            }}
          >
            {f.sub}
          </div>
          <HRule style={{ margin: "18px 0" }} />
          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 15.5,
              color: INK,
              lineHeight: 1.55,
              flex: 1,
              textAlign: "justify",
            }}
          >
            {f.blurb}
          </p>
          <div
            style={{
              marginTop: 24,
              paddingTop: 14,
              borderTop: `1px solid ${INK15}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <SCaps size={10.5} ls="0.14em" color={INK70}>
              {f.wc} &nbsp;·&nbsp; {f.read}
            </SCaps>
            <SCaps size={10.5} ls="0.16em" color={INK}>Read the guide ↗</SCaps>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ─── §02 · All Articles ───────────────────────────────────────────────────────

const AllArticles = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 90 }}>
    <SectionMast n="02" label="From the archives · Selected articles" />

    <ol
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        borderTop: `2px solid ${INK}`,
      }}
    >
      {ARTICLES.map((a, i) => (
        <li
          key={a.slug}
          className="article-row"
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
            {String(i + 1).padStart(2, "0")}.
          </div>
          <a
            href={ART(a.slug)}
            target={isInternal(a.slug) ? undefined : "_blank"}
            rel={isInternal(a.slug) ? undefined : "noopener noreferrer"}
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 21,
              color: INK,
              textDecoration: "none",
              lineHeight: 1.25,
            }}
          >
            {a.title}
          </a>
          <div className="article-cat">
            <SCaps size={10.5} ls="0.14em" color={INK70}>{a.cat}</SCaps>
          </div>
          <div
            className="article-year"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: INK55,
            }}
          >
            {a.y}{a.updated ? ` · upd. ${a.updated}` : ""}
          </div>
          <div className="article-read" style={{ textAlign: "right" }}>
            <SCaps size={10.5} ls="0.14em" color={INK55}>Read ↗</SCaps>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

// ─── §03 · Infographics ───────────────────────────────────────────────────────

const Infographics = () => (
  <section
    className="sx"
    style={{
      background: PAPER2,
      paddingTop: 90,
      paddingBottom: 90,
      borderTop: `1px solid ${INK}`,
      borderBottom: `1px solid ${INK}`,
    }}
  >
    <SectionMast n="03" label="Infographics · Visual essays" />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Five infographics,
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>widely republished.</Mark>
        </span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18.5,
          color: INK70,
          lineHeight: 1.55,
          maxWidth: 540,
        }}
      >
        Each of these started as a research project and ended up reprinted on
        a half-dozen other sites. Two are being redesigned for the new site;
        the others remain in their original form for now.
      </p>
    </div>

    <div
      className="grid-5col"
      style={{ border: `1px solid ${INK}` }}
    >
      {INFOGRAPHICS.map((ig, i) => (
        <a
          key={ig.slug}
          href={ig.href ?? `https://syedirfanajmal.com/${ig.slug}/`}
          {...(!ig.href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="card-border-5"
          style={{
            padding: "22px 18px 20px",
            background: PAPER,
            textDecoration: "none",
            color: INK,
            display: "flex",
            flexDirection: "column",
            minHeight: 200,
          }}
        >
          <SCaps size={10.5} ls="0.18em" color={INK55}>
            Nº {String(i + 1).padStart(2, "0")}
          </SCaps>
          {/* Placeholder visual */}
          <div
            aria-hidden
            style={{
              margin: "14px 0 14px",
              height: 64,
              background: `repeating-linear-gradient(135deg, ${YEL} 0 6px, transparent 6px 12px)`,
              border: `1px solid ${INK}`,
            }}
          />
          <h4
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 17,
              color: INK,
              lineHeight: 1.25,
              letterSpacing: "-0.005em",
            }}
          >
            {ig.title}
          </h4>
          <div style={{ flex: 1 }} />
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${INK15}`,
            }}
          >
            <SCaps size={10} ls="0.12em" color={INK70}>
              {ig.y}{ig.updated ? ` · upd. ${ig.updated}` : ""}
            </SCaps>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ─── §04 · Press ─────────────────────────────────────────────────────────────

const Press = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90 }}>
    <SectionMast n="04" label="Bylines & citations · Selected publications" />

    <div className="grid-intro">
      <h2
        className="h2-lg"
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          color: INK,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
        }}
      >
        Where the
        <br />
        <span style={{ fontStyle: "italic" }}>
          <Mark>writing has gone.</Mark>
        </span>
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 18.5,
          color: INK70,
          lineHeight: 1.55,
          maxWidth: 540,
        }}
      >
        Publications I have written for, been quoted in, or been featured by.
        A fuller index lives on the About page.
      </p>
    </div>

    <div
      className="grid-press-2"
      style={{ border: `1px solid ${INK}` }}
    >
      {PRESS_OUTLETS.map(([n, note]) => (
        <div
          key={n}
          className="press-cell"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            padding: "16px 26px",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 21,
              color: INK,
            }}
          >
            {n}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: INK70,
              textAlign: "right",
            }}
          >
            {note}
          </div>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 36, textAlign: "center" }}>
      <a
        href="/about#press"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 22px",
          background: INK,
          color: PAPER,
          textDecoration: "none",
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        See the full press archive →
      </a>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Hero />
      <Featured />
      <AllArticles />
      <Infographics />
      <Press />
      <Subscriptions sectionNumber="05" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
