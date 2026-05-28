import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
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

const GUIDES: ReadonlyArray<{
  n: string;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  stats: ReadonlyArray<{ value: string; label: string }>;
}> = [
  {
    n: "I",
    title: "Personal Branding",
    subtitle: "The Complete Playbook",
    body: "What personal branding is and why it matters, examples from Gates, Branson, Jobs and Musk, top 10 personal branding statistics, and a step-by-step plan: find your niche, build authority through content, leverage social media, get PR coverage, speak publicly.",
    href: "/writing/personal-branding",
    stats: [
      { value: "12", label: "chapters" },
      { value: "~5,500", label: "words" },
      { value: "22 min", label: "read" },
    ],
  },
  {
    n: "II",
    title: "Neuromarketing",
    subtitle: "The Marketer's Field Guide",
    body: "What neuromarketing is, how it works, and three real-world case studies (Red Bull, Porsche, Coke vs Pepsi). Five actionable techniques: anchoring, the power of free, fear of loss, social proof, and the decoy effect.",
    href: "/writing/neuromarketing",
    stats: [
      { value: "10", label: "chapters" },
      { value: "~4,500", label: "words" },
      { value: "18 min", label: "read" },
    ],
  },
  {
    n: "III",
    title: "Storytelling",
    subtitle: "For Business & Brand",
    body: "The neuroscience of why stories work, five elements of a compelling brand story, the Hero's Journey applied to brand narrative, examples from Dove, Airbnb, and TOMS, and three practical storytelling frameworks for content, pitch decks, and keynotes.",
    href: "/writing/storytelling",
    stats: [
      { value: "9", label: "chapters" },
      { value: "~6,500", label: "words" },
      { value: "24 min", label: "read" },
    ],
  },
  {
    n: "IV",
    title: "Writing Tips",
    subtitle: "100+ Tips · Craft & Clarity",
    body: "A working list sharpened over a decade. 100+ tips across four categories: writing quality content (85 tips drawing on Hemingway, Stephen King, Seth Godin), writing environment, grammar, and tools including Grammarly and Hemingway Editor.",
    href: "/writing/writing-tips",
    stats: [
      { value: "100+", label: "tips" },
      { value: "4", label: "categories" },
      { value: "22 min", label: "read" },
    ],
  },
];

const RECENT_ARTICLES = [
  { title: "How to Become a Good Writer", category: "Writing", href: "https://syedirfanajmal.com/become-a-good-writer/" },
  { title: "6 Must-Have Digital Tools for Writers and Editors", category: "Tools", href: "https://syedirfanajmal.com/digital-tools-writers-editors/" },
  { title: "6 Productivity Hacks for Entrepreneurs", category: "Productivity", href: "https://syedirfanajmal.com/6-productivity-hacks-entrepreneurs/" },
  { title: "5 Google Analytics Metrics for Your Content Marketing Dashboard", category: "Analytics", href: "https://syedirfanajmal.com/google-analytics-content-marketing/" },
  { title: "How To Maximize eCommerce Conversions Using Product Discovery", category: "eCommerce", href: "https://syedirfanajmal.com/maximize-ecommerce-conversions-using-product-discovery/" },
];

export default function WritingPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 56px 72px" }}>
        <SectionMast n="00" label="The Writing Desk · Guides & Articles" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "end",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 80,
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
            }}
          >
            Everything
            <br />
            <span style={{ fontStyle: "italic" }}>
              <Mark>in writing.</Mark>
            </span>
          </h1>
          <div>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 18,
                lineHeight: 1.6,
                color: INK70,
              }}
            >
              Four comprehensive guides. Nine long-form articles. Five
              infographics. All built around one belief: that the best
              marketing is earned, not bought — and the best way to earn attention
              is to be the most useful source in your category.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href="/blog"
                style={{
                  padding: "11px 18px",
                  background: INK,
                  color: PAPER,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                All articles →
              </a>
              <a
                href="/infographics"
                style={{
                  padding: "11px 18px",
                  border: `1px solid ${INK}`,
                  color: INK,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Infographics →
              </a>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 1,
            marginTop: 56,
            background: INK15,
          }}
        >
          {[
            { stat: "4", label: "Comprehensive guides" },
            { stat: "9", label: "Articles & essays" },
            { stat: "5", label: "Infographics" },
            { stat: "9+", label: "Years of writing" },
          ].map(({ stat, label }) => (
            <div key={label} style={{ padding: "28px 24px", background: PAPER }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 48,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {stat}
              </div>
              <SCaps
                size={10.5}
                ls="0.14em"
                color={INK55}
                style={{ marginTop: 8, display: "block" }}
              >
                {label}
              </SCaps>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Guides grid ──────────────────────────────────────── */}
      <section style={{ padding: "80px 56px", background: PAPER2 }}>
        <SectionMast n="01" label="The Guides · Four Definitive References" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}
        >
          {GUIDES.map(({ n, title, subtitle, body, href, stats }) => (
            <div
              key={n}
              style={{
                background: PAPER,
                padding: "32px",
                borderTop: `2px solid ${INK}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <SCaps size={11} ls="0.18em" color={YEL}>{n}.</SCaps>
                  <SCaps size={10.5} ls="0.14em">Guide</SCaps>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {stats.map(({ value, label }) => (
                    <div key={label} style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: INK,
                          lineHeight: 1,
                        }}
                      >
                        {value}
                      </div>
                      <SCaps size={9} ls="0.10em" color={INK35} style={{ marginTop: 2 }}>
                        {label}
                      </SCaps>
                    </div>
                  ))}
                </div>
              </div>

              <h2
                style={{
                  margin: "0 0 4px",
                  fontWeight: 700,
                  fontSize: 36,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h2>
              <div style={{ marginBottom: 16 }}>
                <SCaps size={11} ls="0.16em" color={INK55}>{subtitle}</SCaps>
              </div>

              <HRule />

              <p
                style={{
                  margin: "16px 0 24px",
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: INK70,
                }}
              >
                {body}
              </p>

              <a
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 18px",
                  background: INK,
                  color: PAPER,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Read the guide →
              </a>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Recent articles ──────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="02" label="Recent · From the Wire" />
        <div>
          {RECENT_ARTICLES.map(({ title, category, href }, i) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 160px",
                gap: 24,
                padding: "20px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <SCaps size={11} ls="0.14em" color={INK35}>
                {String(i + 1).padStart(2, "0")}.
              </SCaps>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: INK }}>
                {title}
              </div>
              <Pill size={9.5} ls="0.10em">{category}</Pill>
            </a>
          ))}

          <div style={{ marginTop: 28 }}>
            <a
              href="/blog"
              style={{
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 11.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: INK,
                textDecoration: "none",
              }}
            >
              All articles →
            </a>
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Infographics preview ─────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="03" label="Visual Desk · Infographics" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            "Top 11 Scientific Benefits of Writing",
            "Managing Remote Teams with HubStaff",
            "How to Form Writing Habits for Success",
            "Getting Content Ideas from Your Customers",
            "The Ultimate Bing SEO Guide",
          ].map((title, i) => (
            <div
              key={title}
              style={{
                background: PAPER,
                border: `1px solid ${INK15}`,
                padding: "28px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 32,
                  color: INK15,
                  lineHeight: 1,
                  fontFamily: SERIF,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 14.5,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: INK,
                }}
              >
                {title}
              </div>
            </div>
          ))}
        </div>
        <a
          href="/infographics"
          style={{
            fontFamily: GROT,
            fontWeight: 700,
            fontSize: 11.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: INK,
            textDecoration: "none",
          }}
        >
          View all infographics →
        </a>
      </section>

      <Subscriptions sectionNumber="04" />
      <Colophon />
    </div>
  );
}
