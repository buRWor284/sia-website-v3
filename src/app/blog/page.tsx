import { Colophon, Subscriptions } from "@/components/bureau";
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

// Real flagship guides — live at /resources/*
const GUIDES: ReadonlyArray<{
  n: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  published: string;
  href: string;
}> = [
  {
    n: "01",
    category: "Personal Branding",
    title: "Personal Branding 101: How to Brand Yourself for Success",
    excerpt:
      "A complete guide on personal branding — covering what it is, why it matters, and a step-by-step plan for finding your niche, building authority through content, getting press coverage, and speaking to audiences that include your ideal clients.",
    readTime: "22 min read",
    published: "June 2016 · Revised Dec 2021",
    href: "/writing/personal-branding",
  },
  {
    n: "02",
    category: "Neuromarketing",
    title: "Neuromarketing 101: What Is Neuromarketing And How Does It Work?",
    excerpt:
      "What neuromarketing is, how it works, and how to apply it. Includes real-world case studies (Red Bull, Porsche, Coke vs Pepsi) and five practical techniques: anchoring, the power of free, fear of loss, social proof, and the decoy effect.",
    readTime: "18 min read",
    published: "Nov 2017 · Revised Jul 2021",
    href: "/writing/neuromarketing",
  },
  {
    n: "03",
    category: "Storytelling",
    title: "Storytelling 101: Elevate Your Brand",
    excerpt:
      "The neuroscience of why stories work, the five elements of a compelling brand story, the Hero's Journey applied to brand narrative, how to find your brand's story, and practical storytelling frameworks for content, pitch decks, and keynotes.",
    readTime: "24 min read",
    published: "Apr 2020 · Revised Jul 2021",
    href: "/writing/storytelling",
  },
  {
    n: "04",
    category: "Writing Craft",
    title: "100+ Writing Tips to Become a Great Writer",
    excerpt:
      "A working list sharpened over a decade of writing. Covers 100+ tips across four categories: writing quality content (85 tips), writing environment (7 tips), grammar (4 tips), and tools (4 tips). Drawn from Hemingway, Stephen King, Seth Godin, and Irfan's own practice.",
    readTime: "22 min read",
    published: "Feb 2016 · Revised Aug 2022",
    href: "/writing/writing-tips",
  },
];

// Real archived articles — from the original site
const ARCHIVED: ReadonlyArray<{
  n: string;
  category: string;
  title: string;
  readTime: string;
  author: string;
  href: string;
}> = [
  {
    n: "05",
    category: "Writing",
    title: "How to Become a Good Writer",
    readTime: "~6 min",
    author: "Syed Irfan Ajmal",
    href: "https://syedirfanajmal.com/become-a-good-writer/",
  },
  {
    n: "06",
    category: "Tools",
    title: "6 Must-Have Digital Tools for Writers and Editors",
    readTime: "~8 min",
    author: "Azza Shahid",
    href: "https://syedirfanajmal.com/digital-tools-writers-editors/",
  },
  {
    n: "07",
    category: "Productivity",
    title: "6 Productivity Hacks for Entrepreneurs",
    readTime: "~7 min",
    author: "Jocelyn Brown",
    href: "https://syedirfanajmal.com/6-productivity-hacks-entrepreneurs/",
  },
  {
    n: "08",
    category: "Analytics",
    title: "5 Google Analytics Metrics to Include in Your Content Marketing Dashboard",
    readTime: "~6 min",
    author: "Azza Shahid",
    href: "https://syedirfanajmal.com/google-analytics-content-marketing/",
  },
  {
    n: "09",
    category: "eCommerce",
    title: "How To Maximize eCommerce Conversions Using Product Discovery",
    readTime: "~8 min",
    author: "Syed Irfan Ajmal",
    href: "https://syedirfanajmal.com/maximize-ecommerce-conversions-using-product-discovery/",
  },
];

export default function BlogPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <section style={{ padding: "72px 56px 56px" }}>
        <SectionMast n="00" label="Articles · Essays & Guides" />
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
            Long-form.
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
              Research-backed guides on personal branding, neuromarketing,
              storytelling, and the craft of writing. Each piece is built to be
              the definitive resource on its topic.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Personal Branding", "Neuromarketing", "Storytelling", "Writing Craft", "Productivity"].map((cat) => (
                <Pill key={cat} size={9.5} ls="0.12em">
                  {cat}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Flagship guides ───────────────────────────────────── */}
      <section style={{ padding: "72px 56px" }}>
        <SectionMast n="01" label="Flagship Guides · The 101 Series" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}
        >
          {GUIDES.map(({ n, category, title, excerpt, readTime, published, href }) => (
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
                  fontSize: 20,
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
                <SCaps size={10} ls="0.12em" color={INK55}>{published}</SCaps>
                <a
                  href={href}
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

      {/* ── Archived articles ─────────────────────────────────── */}
      <section style={{ padding: "72px 56px", background: PAPER2 }}>
        <SectionMast n="02" label="Archive · Articles from the Original Site" />

        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: INK55, maxWidth: 680, fontStyle: "italic" }}>
            These articles remain available on the original site while the full blog migration is in progress.
          </p>
        </div>

        <div>
          {ARCHIVED.map(({ n, category, title, readTime, author, href }) => (
            <a
              key={n}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "48px 120px 1fr 120px 80px",
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
                {author}
              </SCaps>
              <div style={{ textAlign: "right" }}>
                <SCaps size={10} ls="0.10em" color={INK35}>
                  {readTime}
                </SCaps>
              </div>
            </a>
          ))}
        </div>
      </section>

      <Subscriptions sectionNumber="03" />
      <Colophon />
    </div>
  );
}
