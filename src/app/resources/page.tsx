import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import { TocBar } from "@/components/resources/TocBar";
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

// ─── Data ─────────────────────────────────────────────────────────────────────

type Kit = {
  no: string; badge: string; title: string; sub: string;
  blurb: string; href: string; y: string; updated?: string;
};
const KITS: ReadonlyArray<Kit> = [
  {
    no: "01", badge: "Interactive Kit",
    title: "Top 11 Scientific Benefits of Writing",
    sub: "Eleven findings. Each with a prescription.",
    blurb: "Reduced anxiety, stronger memory, sharper thinking — the research-backed case for writing as a daily practice. Eleven findings, each with its study and a prescription you can follow this week.",
    href: "/infographics/writing-benefits",
    y: "2019", updated: "2026",
  },
  {
    no: "02", badge: "Interactive Kit",
    title: "The Journo Outreach Checklist",
    sub: "Seven steps to a pitch reporters actually paste in.",
    blurb: "The SIA system for working HARO, Qwoted, Source of Sources, Featured, and Help a B2B Writer — with copy-clip snippets, an interactive progress meter, and a print mode.",
    href: "/infographics/journo-outreach-checklist",
    y: "2026",
  },
];

// ─── Tools data ───────────────────────────────────────────────────────────────

type Tool = {
  no: string; badge: string; title: string; sub: string;
  blurb: string; href: string; accent: string;
};
const GREEN = "#3e6b45";
const TOOLS: ReadonlyArray<Tool> = [
  {
    no: "01", badge: "ROI Calculator",
    title: "The Authority Cost Calculator",
    sub: "Stop renting. See the cost of renting credibility vs. owning it.",
    blurb: "Enter your monthly agency spend or link budget, your traffic, and your AOV — and see the one-year financial case for owning the capability instead of renting it forever. Discover the solution at the end.",
    href: "/tools/authority-calculator",
    accent: GREEN,
  },
];

type Playbook = { tag: string; no: string; title: string; sub: string; blurb: string; slug: string; wc: string; read: string };
const PLAYBOOKS: ReadonlyArray<Playbook> = [
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

type Article = { title: string; slug: string; cat: string; y: string; updated?: string; external?: boolean };
const ARTICLES: ReadonlyArray<Article> = [
  { title: "100+ Writing Tips to Become a Great Writer", slug: "writing-tips",         cat: "Craft",       y: "2016", updated: "2022" },
  { title: "How to Become a Good Writer",                slug: "become-a-good-writer", cat: "Craft",       y: "—",    external: true },
  { title: "6 Productivity Hacks for Entrepreneurs",     slug: "6-productivity-hacks-entrepreneurs",              cat: "Operating",   y: "2021", external: true },
  { title: "6 Must-Have Digital Tools for Writers",      slug: "digital-tools-writers-editors",                   cat: "Tools",       y: "2020", external: true },
  { title: "5 Google Analytics Metrics for Content",     slug: "google-analytics-content-marketing",              cat: "Measurement", y: "2020", external: true },
  { title: "How To Maximize eCommerce Conversions",      slug: "maximize-ecommerce-conversions-using-product-discovery", cat: "Strategy", y: "—",  external: true },
];

const ART = (a: Article) =>
  a.external ? `https://syedirfanajmal.com/${a.slug}/` : `/resources/${a.slug}`;

type VisualEssay = { no: string; title: string; blurb: string; href: string; y: string; updated?: string };
const VISUAL_ESSAYS: ReadonlyArray<VisualEssay> = [
  {
    no: "03",
    title: "Managing Remote Teams with HubStaff",
    blurb: "Time tracking, trust, and async communication across distributed teams. Originally produced in partnership with HubStaff.",
    href: "https://syedirfanajmal.com/managing-remote-teams-with-hubstaff-time-tracking/",
    y: "2016", updated: "2021",
  },
  {
    no: "04",
    title: "How to Form Writing Habits for Success",
    blurb: "The science of habit formation applied specifically to a daily writing practice — cues, routines, rewards, and the research behind each.",
    href: "https://syedirfanajmal.com/form-writing-habits-success-infographic/",
    y: "—",
  },
  {
    no: "05",
    title: "Getting Content Ideas from Your Customers",
    blurb: "Listening systems, surveys, and social mining — how to extract an endless editorial calendar from the people already talking to your business.",
    href: "https://syedirfanajmal.com/content-ideas-from-customers-infographic/",
    y: "—",
  },
];

const PRESS_OUTLETS: ReadonlyArray<[string, string]> = [
  ["Forbes",                  "Contributor & featured"],
  ["Harvard Business Review", "Guest contributor"],
  ["HuffPost",                "Contributor"],
  ["The Next Web (TNW)",      "Featured"],
  ["Entrepreneur",            "Contributor"],
  ["Search Engine Journal",   "Contributor"],
  ["SEMrush Blog",            "Contributor"],
  ["Business.com",            "Contributor"],
  ["Reader's Digest",         "Featured"],
  ["Virgin Startup",          "Contributor"],
  ["The World Bank Blog",     "Contributor"],
  ["CNET",                    "Featured"],
  ["SERPed",                  "Contributor"],
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 56, paddingBottom: 70 }}>
    {/* Category pills */}
    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
      {[
        { label: "Playbooks", active: true },
        { label: "Kits",      active: true },
        { label: "Podcast",   active: true },
        { label: "Tools",     active: true },
      ].map((cat) => (
        <span
          key={cat.label}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 14px 6px",
            border: `1px solid ${cat.active ? INK : "rgba(26,20,16,.28)"}`,
            fontFamily: GROT, fontWeight: 700, fontSize: 11,
            letterSpacing: "0.20em", textTransform: "uppercase",
            color: cat.active ? INK : INK55,
          }}
        >
          {cat.label}
        </span>
      ))}
    </div>

    <h1 className="hero-h1" style={{ fontFamily: SERIF, fontWeight: 700, color: INK }}>
      <span style={{ display: "block" }}>Practical</span>
      <span style={{ display: "block", fontStyle: "italic", fontWeight: 600 }}>
        <Mark>resources.</Mark>
      </span>
    </h1>

    <p style={{
      margin: "24px auto 0", textAlign: "center",
      fontFamily: SERIF, fontSize: 20, color: INK70,
      lineHeight: 1.6, maxWidth: 580,
    }}>
      Content you can start applying in your business today — interactive Kits,
      deep-dive Playbooks, 39 podcast episodes, and bylines across 13+ publications.
    </p>

    <DoubleRule style={{ margin: "44px 0 0" }} />
  </section>
);

// ─── §01 · Tools ─────────────────────────────────────────────────────────────

const Tools = () => (
  <section id="res-tools" className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 90 }}>
    <SectionMast n="01" label="Tools · Calculators & decision aids" />

    <div className="grid-intro" style={{ marginBottom: 48 }}>
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Run the numbers.<br />
        <span style={{ fontStyle: "italic" }}><Mark>Then decide.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        Interactive calculators that turn your real inputs into a financial case.
        No guesswork — the answer comes from your own numbers.
      </p>
    </div>

    <div style={{ border: `1px solid ${INK}` }}>
      {TOOLS.map((tool) => (
        <a
          key={tool.title}
          href={tool.href}
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 140px",
            textDecoration: "none", color: INK, background: PAPER,
          }}
        >
          {/* number column */}
          <div style={{
            padding: "32px 0", display: "flex", alignItems: "flex-start",
            justifyContent: "center", borderRight: `1px solid ${INK}`,
          }}>
            <div style={{
              fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: INK,
              lineHeight: 1, letterSpacing: "-0.02em",
            }}>
              Nº {tool.no}
            </div>
          </div>
          {/* content column */}
          <div style={{ padding: "32px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Pill size={10.5} ls="0.18em">{tool.badge}</Pill>
            </div>
            {/* hatched accent */}
            <div
              aria-hidden
              style={{
                height: 6, marginBottom: 18, width: 120,
                background: `repeating-linear-gradient(90deg, ${tool.accent} 0 6px, transparent 6px 12px)`,
              }}
            />
            <h3 style={{
              margin: "0 0 10px", fontFamily: SERIF, fontWeight: 700,
              fontSize: 28, color: INK, lineHeight: 1.1, letterSpacing: "-0.015em",
            }}>
              {tool.title}
            </h3>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK70, lineHeight: 1.35, marginBottom: 14 }}>
              {tool.sub}
            </div>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15.5, color: INK, lineHeight: 1.55 }}>
              {tool.blurb}
            </p>
          </div>
          {/* cta column */}
          <div style={{
            padding: "32px 24px", display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "flex-end",
            borderLeft: `1px solid ${INK15}`,
          }}>
            <div style={{
              padding: "14px 18px", border: `1.5px solid ${INK}`,
              background: INK, color: PAPER,
              fontFamily: SERIF, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em",
              textAlign: "center", lineHeight: 1.3,
            }}>
              Run the<br />calculator ↗
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ─── §02 · Kits ──────────────────────────────────────────────────────────────

const Kits = () => (
  <section id="res-kits" className="sx" style={{ background: PAPER2, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}` }}>
    <SectionMast n="02" label="Kits · Interactive tools & checklists" />

    <div className="grid-intro" style={{ marginBottom: 48 }}>
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Open them.<br />
        <span style={{ fontStyle: "italic" }}><Mark>Use them today.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        Not just content to read — interactive tools with built-in progress tracking,
        copy-clip snippets, and print modes. Open one when you have a job to do.
      </p>
    </div>

    <div className="grid-cards-2" style={{ border: `1px solid ${INK}` }}>
      {KITS.map((kit, i) => (
        <a
          key={kit.title}
          href={kit.href}
          className="card-border-2"
          style={{
            padding: "36px 32px 28px",
            background: i === 1 ? PAPER2 : PAPER,
            textDecoration: "none", color: INK,
            display: "flex", flexDirection: "column", minHeight: 380,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22 }}>
            <Pill size={10.5} ls="0.18em">{kit.badge}</Pill>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>
              Nº {kit.no}
            </div>
          </div>

          {/* Hatched accent strip */}
          <div
            aria-hidden
            style={{
              height: 72, marginBottom: 24,
              background: `repeating-linear-gradient(135deg, ${YEL} 0 8px, transparent 8px 16px)`,
              border: `1px solid ${INK}`,
            }}
          />

          <h3 style={{ margin: "0 0 10px", fontFamily: SERIF, fontWeight: 700, fontSize: 28, color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
            {kit.title}
          </h3>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK70, lineHeight: 1.35, marginBottom: 16 }}>
            {kit.sub}
          </div>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15.5, color: INK, lineHeight: 1.55, flex: 1 }}>
            {kit.blurb}
          </p>
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <SCaps size={10.5} ls="0.14em" color={INK70}>
              {kit.y}{kit.updated ? ` · upd. ${kit.updated}` : ""}
            </SCaps>
            <SCaps size={10.5} ls="0.16em" color={INK}>Open the Kit ↗</SCaps>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ─── §03 · Playbooks (101 Series) ────────────────────────────────────────────

const Playbooks = () => (
  <section id="res-playbooks" className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}` }}>
    <SectionMast n="03" label="Playbooks · Deep-dive guides" />

    <div className="grid-intro" style={{ marginBottom: 48 }}>
      <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Three guides<br />
        <span style={{ fontStyle: "italic" }}><Mark>worth your hour.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: INK70, lineHeight: 1.55, maxWidth: 560 }}>
        The 101 Series: three of the most-read pieces on the site, each a complete guide
        to a subject I have spent years putting into practice. Updated annually; bookmark-worthy.
      </p>
    </div>

    <div className="grid-cards-3" style={{ border: `1px solid ${INK}` }}>
      {PLAYBOOKS.map((f, i) => (
        <a
          key={f.title}
          href={`/resources/${f.slug}`}
          className="card-border"
          style={{
            padding: "32px 28px 28px",
            background: i === 1 ? PAPER : PAPER2,
            textDecoration: "none", color: INK,
            display: "flex", flexDirection: "column", minHeight: 460,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Pill size={10.5} ls="0.20em">{f.tag}</Pill>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>{f.no}</div>
          </div>
          <h3 style={{ margin: "20px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: INK, lineHeight: 1.05, letterSpacing: "-0.018em" }}>
            {f.title}
          </h3>
          <div style={{ marginTop: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: INK70, lineHeight: 1.3 }}>
            {f.sub}
          </div>
          <HRule style={{ margin: "18px 0" }} />
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15.5, color: INK, lineHeight: 1.55, flex: 1, textAlign: "justify" }}>
            {f.blurb}
          </p>
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${INK15}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <SCaps size={10.5} ls="0.14em" color={INK70}>{f.wc} &nbsp;·&nbsp; {f.read}</SCaps>
            <SCaps size={10.5} ls="0.16em" color={INK}>Read the guide ↗</SCaps>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// ─── §04 · Articles ───────────────────────────────────────────────────────────

const Articles = () => (
  <section id="res-articles" className="sx" style={{ background: PAPER2, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}` }}>
    <SectionMast n="04" label="From the archives · Selected articles" />
    <ol style={{ margin: 0, padding: 0, listStyle: "none", borderTop: `2px solid ${INK}` }}>
      {ARTICLES.map((a, i) => (
        <li key={a.slug} className="article-row">
          <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: "0.06em", color: INK }}>
            {String(i + 1).padStart(2, "0")}.
          </div>
          <a
            href={ART(a)}
            target={a.external ? "_blank" : undefined}
            rel={a.external ? "noopener noreferrer" : undefined}
            style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, color: INK, textDecoration: "none", lineHeight: 1.25 }}
          >
            {a.title}
          </a>
          <div className="article-cat"><SCaps size={10.5} ls="0.14em" color={INK70}>{a.cat}</SCaps></div>
          <div className="article-year" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
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

// ─── §05 · Podcast ────────────────────────────────────────────────────────────

const PodcastTeaser = () => (
  <section
    id="res-podcast"
    className="sx"
    style={{ background: INK, color: PAPER, paddingTop: 90, paddingBottom: 90, borderTop: `3px solid ${YEL}` }}
  >
    <SectionMast n="05" label="Podcast · 39 Episodes" dark />

    <div className="grid-intro">
      <div>
        <h2 className="h2-xl" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: PAPER, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
          The show<br />
          <span style={{ fontStyle: "italic" }}><Mark>on the air.</Mark></span>
        </h2>
        <p style={{ marginTop: 22, fontFamily: SERIF, fontSize: 19, color: "rgba(241,235,222,.72)", lineHeight: 1.55, maxWidth: 480 }}>
          39 episodes on earned media, SEO-PR, content marketing, and building a brand
          that gets found. Conversations with founders, journalists, and marketing leaders.
        </p>
      </div>

      <div>
        <div style={{ border: "1px solid rgba(241,235,222,.2)", padding: 32, marginBottom: 16 }}>
          <SCaps size={10.5} ls="0.18em" color={YEL}>Browse the archive</SCaps>
          <p style={{ margin: "14px 0 24px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: PAPER, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
            All 39 episodes — tactics, case studies, and conversations with marketing leaders.
          </p>
          <a
            href="/podcast"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "14px 22px", background: YEL, color: INK,
              textDecoration: "none", fontFamily: GROT, fontWeight: 800,
              fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase",
            }}
          >
            Go to the Podcast →
          </a>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { name: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466" },
            { name: "Spotify",        href: "#" },
          ].map((p) => (
            <a
              key={p.name}
              href={p.href}
              target={p.href !== "#" ? "_blank" : undefined}
              rel={p.href !== "#" ? "noopener noreferrer" : undefined}
              style={{
                padding: "10px 16px", border: "1px solid rgba(241,235,222,.25)",
                color: "rgba(241,235,222,.6)", textDecoration: "none",
                fontFamily: GROT, fontWeight: 700, fontSize: 10.5,
                letterSpacing: "0.14em", textTransform: "uppercase",
              }}
            >
              {p.name} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── §06 · Visual Essays ─────────────────────────────────────────────────────

const VisualEssays = () => (
  <section id="res-visual-essays" className="sx" style={{ background: PAPER2, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}` }}>
    <SectionMast n="06" label="Visual Essays · Infographics" />

    <div className="grid-intro" style={{ marginBottom: 48 }}>
      <h2 className="h2-lg" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Research<br />
        <span style={{ fontStyle: "italic" }}><Mark>made visible.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
        Each started as a research project and ended up reprinted across a half-dozen publications.
        Interactive redesigns are in production — the originals remain live in the meantime.
      </p>
    </div>

    <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${INK}` }}>
      {VISUAL_ESSAYS.map((ig, i) => (
        <a
          key={ig.href}
          href={ig.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "grid",
            gridTemplateColumns: "72px 1fr 130px",
            borderBottom: i < VISUAL_ESSAYS.length - 1 ? `1px solid ${INK}` : "none",
            background: i % 2 === 0 ? PAPER : PAPER2,
            textDecoration: "none", color: INK,
          }}
        >
          {/* Number */}
          <div style={{ padding: "28px 0", display: "flex", alignItems: "flex-start", justifyContent: "center", borderRight: `1px solid ${INK}` }}>
            <SCaps size={12} ls="0.06em" color={INK70}>Nº {ig.no}</SCaps>
          </div>
          {/* Content */}
          <div style={{ padding: "28px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Pill size={10} ls="0.15em">Infographic</Pill>
              <SCaps size={10} ls="0.14em" color={INK55}>Redesign in production</SCaps>
            </div>
            <h4 style={{ margin: "0 0 10px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.2, letterSpacing: "-0.008em" }}>
              {ig.title}
            </h4>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.55 }}>
              {ig.blurb}
            </p>
          </div>
          {/* Meta */}
          <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", borderLeft: `1px solid ${INK15}` }}>
            <SCaps size={10} ls="0.12em" color={INK55}>
              {ig.y}{ig.updated ? ` · upd. ${ig.updated}` : ""}
            </SCaps>
            <SCaps size={10.5} ls="0.16em" color={INK}>View original ↗</SCaps>
          </div>
        </a>
      ))}
    </div>

    <div style={{ marginTop: 28, textAlign: "center" }}>
      <a
        href="/infographics"
        style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          padding: "13px 22px", border: `1px solid ${INK}`,
          background: "transparent", color: INK, textDecoration: "none",
          fontFamily: GROT, fontWeight: 800, fontSize: 11.5,
          letterSpacing: "0.16em", textTransform: "uppercase",
        }}
      >
        View all on the Infographics desk →
      </a>
    </div>
  </section>
);

// ─── §07 · Press ─────────────────────────────────────────────────────────────

const Press = () => (
  <section id="res-press" className="sx" style={{ background: PAPER, paddingTop: 90, paddingBottom: 90, borderTop: `1px solid ${INK}` }}>
    <SectionMast n="07" label="Bylines & citations · Selected publications" />

    <div className="grid-intro" style={{ marginBottom: 40 }}>
      <h2 className="h2-lg" style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
        Where the<br />
        <span style={{ fontStyle: "italic" }}><Mark>writing has gone.</Mark></span>
      </h2>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 18.5, color: INK70, lineHeight: 1.55, maxWidth: 540 }}>
        Publications I have written for, been quoted in, or been featured by.
        A fuller index lives on the About page.
      </p>
    </div>

    <div className="grid-press-2" style={{ border: `1px solid ${INK}` }}>
      {PRESS_OUTLETS.map(([n, note]) => (
        <div
          key={n}
          className="press-cell"
          style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "16px 26px", alignItems: "baseline" }}
        >
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, color: INK }}>{n}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, textAlign: "right" }}>{note}</div>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 36, textAlign: "center" }}>
      <a
        href="/about#press"
        style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          padding: "14px 22px", background: INK, color: PAPER,
          textDecoration: "none", fontFamily: GROT, fontWeight: 800,
          fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase",
        }}
      >
        See the full press archive →
      </a>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Resources" />
      <Hero />
      <TocBar />
      <Tools />
      <Kits />
      <Playbooks />
      <Articles />
      <PodcastTeaser />
      <VisualEssays />
      <Press />
      <Subscriptions sectionNumber="08" />
      <Colophon />
    </div>
  );
}
