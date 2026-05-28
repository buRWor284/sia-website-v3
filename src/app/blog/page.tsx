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

const FEATURED: ReadonlyArray<{
  n: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  slug: string;
}> = [
  {
    n: "01",
    category: "Earned Media",
    title: "How We Got Our Client Covered in Forbes Without a PR Agency",
    excerpt:
      "A step-by-step case study of the pitch, the hook, and the follow-up that landed a mid-market B2B brand on Forbes.com — and drove $180K in inbound pipeline in 90 days.",
    readTime: "12 min read",
    date: "May 2026",
    slug: "forbes-without-pr-agency",
  },
  {
    n: "02",
    category: "Personal Branding",
    title: "The Five-Year Personal Brand: Why Playing the Long Game Wins",
    excerpt:
      "Short-term tactics get you followers. A five-year personal brand strategy gets you a waiting list, speaking fees, and the ability to raise prices without losing clients.",
    readTime: "9 min read",
    date: "Apr 2026",
    slug: "five-year-personal-brand",
  },
  {
    n: "03",
    category: "Content Strategy",
    title: "Why Long-Form Still Wins: A Data-Backed Case for 3,000-Word Posts",
    excerpt:
      "Every year someone declares long-form dead. Every year the data proves them wrong. Here's what the numbers actually say — and how to write long-form that people finish.",
    readTime: "11 min read",
    date: "Apr 2026",
    slug: "long-form-content-wins",
  },
];

const ALL_ARTICLES: ReadonlyArray<{
  n: string;
  category: string;
  title: string;
  readTime: string;
  date: string;
}> = [
  { n: "04", category: "HARO", title: "HARO Mastery: Getting 10 Press Mentions a Month Without a PR Team", readTime: "14 min", date: "Mar 2026" },
  { n: "05", category: "SEO", title: "The Topical Authority Framework: How to Rank for Every Keyword in Your Niche", readTime: "16 min", date: "Mar 2026" },
  { n: "06", category: "Neuromarketing", title: "The 7 Cognitive Biases Every Content Marketer Should Exploit", readTime: "10 min", date: "Feb 2026" },
  { n: "07", category: "Consulting", title: "How to Price Your Expertise: The Authority Premium Framework", readTime: "8 min", date: "Feb 2026" },
  { n: "08", category: "LinkedIn", title: "The 90-Day LinkedIn Authority Blueprint: From 500 to 5,000 Followers", readTime: "13 min", date: "Jan 2026" },
  { n: "09", category: "Writing", title: "How to Write an Op-Ed That Gets Published in Major Publications", readTime: "11 min", date: "Jan 2026" },
  { n: "10", category: "Storytelling", title: "The Three-Act Structure for Business Case Studies (With Templates)", readTime: "9 min", date: "Dec 2025" },
  { n: "11", category: "Fractional CMO", title: "When You Need a Fractional CMO (And When You Don't)", readTime: "7 min", date: "Dec 2025" },
  { n: "12", category: "Earned Media", title: "The Anatomy of a Perfect Media Pitch: What Editors Actually Want", readTime: "12 min", date: "Nov 2025" },
  { n: "13", category: "Content Strategy", title: "Building a Content Moat: The 180-Day Strategy That Compounds", readTime: "15 min", date: "Nov 2025" },
  { n: "14", category: "Personal Branding", title: "The Positioning Statement Formula: How to Define What You Stand For", readTime: "8 min", date: "Oct 2025" },
  { n: "15", category: "SEO", title: "Internal Linking Architecture: The Hidden SEO Lever Most Blogs Ignore", readTime: "10 min", date: "Oct 2025" },
  { n: "16", category: "Writing", title: "Editing for Clarity: The 10-Minute Rewrite Method", readTime: "7 min", date: "Sep 2025" },
  { n: "17", category: "Neuromarketing", title: "Social Proof Science: Which Types Actually Influence Purchase Decisions", readTime: "11 min", date: "Sep 2025" },
  { n: "18", category: "Earned Media", title: "Podcast Guest Playbook: How to Get on 20 Shows in 90 Days", readTime: "9 min", date: "Aug 2025" },
  { n: "19", category: "Content Strategy", title: "The Editorial Calendar That Drives 40% of Our Client Inbound Leads", readTime: "8 min", date: "Aug 2025" },
];

const CATEGORIES = [
  "All",
  "Earned Media",
  "Personal Branding",
  "Content Strategy",
  "SEO",
  "Neuromarketing",
  "Writing",
  "Consulting",
];

export default function BlogPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast active="Writing" />

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px 56px" }}>
        <SectionMast n="00" label="The Wire · Long-Form Articles" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "end",
            marginBottom: 48,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
            }}
          >
            29 articles.
            <br />
            <span style={{ fontStyle: "italic" }}>
              <Mark>No filler.</Mark>
            </span>
          </h1>
          <div>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 18,
                lineHeight: 1.6,
                color: INK70,
              }}
            >
              Research-backed guides on earned media, personal branding, content
              strategy, SEO, and the craft of writing. Each piece is built to be
              the definitive resource on its topic.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.slice(1).map((cat) => (
                <Pill key={cat} size={9.5} ls="0.12em">
                  {cat}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Featured 3 ───────────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="01" label="Featured · Editor's Picks" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {FEATURED.map(({ n, category, title, excerpt, readTime, date }) => (
            <article key={n} style={{ borderTop: `2px solid ${INK}` }}>
              <div
                style={{
                  padding: "14px 0 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Pill size={9.5} ls="0.12em">{category}</Pill>
                <SCaps size={10} ls="0.10em" color={INK35}>
                  {readTime}
                </SCaps>
              </div>
              <h2
                style={{
                  margin: "0 0 14px",
                  fontWeight: 700,
                  fontSize: 22,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h2>
              <HRule />
              <p
                style={{
                  margin: "14px 0 20px",
                  fontSize: 15.5,
                  lineHeight: 1.6,
                  color: INK70,
                }}
              >
                {excerpt}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <SCaps size={10} ls="0.12em" color={INK55}>{date}</SCaps>
                <a
                  href={`/blog/${n}`}
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
                  Read →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── All articles ─────────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="02" label="The Archive · All Articles" />
        <div>
          {ALL_ARTICLES.map(({ n, category, title, readTime, date }, i) => (
            <a
              key={n}
              href={`/blog/${n}`}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 100px 1fr 80px 80px",
                gap: 24,
                padding: "20px 0",
                borderBottom: `1px solid ${INK15}`,
                alignItems: "baseline",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <SCaps size={11} ls="0.14em" color={INK35}>
                {n}.
              </SCaps>
              <Pill size={9} ls="0.10em">{category}</Pill>
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
              <SCaps size={10} ls="0.10em" color={INK55}>
                {date}
              </SCaps>
              <div style={{ textAlign: "right" }}>
                <SCaps size={10} ls="0.10em" color={INK35}>
                  {readTime}
                </SCaps>
              </div>
            </a>
          ))}

          <div
            style={{
              marginTop: 32,
              padding: "16px 0",
              textAlign: "center",
            }}
          >
            <SCaps size={11} ls="0.18em" color={INK55}>
              Articles 20–29 available via the newsletter archive
            </SCaps>
          </div>
        </div>
      </section>

      <Subscriptions sectionNumber="03" />
      <Colophon />
    </div>
  );
}
