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
    body: "How to build a personal brand that positions you as the authority in your field — from crafting your positioning statement to landing your first press mention and building a LinkedIn following that converts.",
    href: "/writing/personal-branding",
    stats: [
      { value: "12", label: "chapters" },
      { value: "8,400", label: "words" },
      { value: "22 min", label: "read" },
    ],
  },
  {
    n: "II",
    title: "Neuromarketing",
    subtitle: "The Marketer's Field Guide",
    body: "The applied science of persuasion. Twelve cognitive biases with real-world marketing applications, social proof mechanics, emotional triggers in copywriting, and the psychology of trust signals.",
    href: "/writing/neuromarketing",
    stats: [
      { value: "10", label: "chapters" },
      { value: "7,200", label: "words" },
      { value: "19 min", label: "read" },
    ],
  },
  {
    n: "III",
    title: "Storytelling",
    subtitle: "For Business & Brand",
    body: "Why stories work neurologically, the hero's journey adapted for brand narratives, the three-act structure for case studies, and how to write origin stories, keynotes, and sales narratives that move people.",
    href: "/writing/storytelling",
    stats: [
      { value: "9", label: "chapters" },
      { value: "6,800", label: "words" },
      { value: "17 min", label: "read" },
    ],
  },
  {
    n: "IV",
    title: "Writing Tips",
    subtitle: "Craft & Clarity",
    body: "The mechanics of clear, compelling writing. Research before writing, the inverted pyramid, active voice, headline formulas, the 10-minute rewrite, and how to develop a writing habit that compounds over years.",
    href: "/writing/writing-tips",
    stats: [
      { value: "11", label: "chapters" },
      { value: "5,600", label: "words" },
      { value: "14 min", label: "read" },
    ],
  },
];

const RECENT_ARTICLES = [
  { title: "How We Got Covered in Forbes Without a PR Agency", category: "Earned Media", date: "May 2026" },
  { title: "The Five-Year Personal Brand: Why Playing the Long Game Wins", category: "Personal Branding", date: "Apr 2026" },
  { title: "Why Long-Form Still Wins: A Data-Backed Case for 3,000-Word Posts", category: "Content Strategy", date: "Apr 2026" },
  { title: "HARO Mastery: Getting 10 Press Mentions a Month", category: "PR", date: "Mar 2026" },
  { title: "The Topical Authority Framework", category: "SEO", date: "Mar 2026" },
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
              Four comprehensive guides. Twenty-nine long-form articles. Five
              visual frameworks. All built around one belief: that the best
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
            { stat: "29", label: "Long-form articles" },
            { stat: "5", label: "Visual frameworks" },
            { stat: "9+", label: "Years of research" },
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
          {RECENT_ARTICLES.map(({ title, category, date }, i) => (
            <a
              key={title}
              href="/blog"
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 140px 80px",
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
              <div style={{ textAlign: "right" }}>
                <SCaps size={10} ls="0.10em" color={INK55}>{date}</SCaps>
              </div>
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
              All 29 articles →
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
            "EMOS Framework",
            "Personal Brand Pyramid",
            "Content Flywheel",
            "Neuromarketing Cheat Sheet",
            "Authority Content Matrix",
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
