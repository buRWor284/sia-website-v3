import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Visa SaaS · Market Scan · Hajj People",
  description: "Private working page prepared for Hajj People.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/workspace/hajj-people" },
};

/* ── Design tokens (local, mirrors the PT workspace) ───────────────────────── */
const PAPER  = "#FAFAFA";
const PAPER2 = "#F0F0EE";
const INK    = "#1a1410";
const INK70  = "rgba(26,20,16,.70)";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const SERIF  = "var(--font-serif)";
const GROT   = "var(--font-grot)";
const MONO   = "var(--font-mono)";
const P60    = "rgba(250,250,250,.60)";

/* ── Content ───────────────────────────────────────────────────────────────── */
/* TODO(scan): replace with the real market scan. Keep the shape.
   grade = the one-line read, not a score. Leave `url` empty if none. */
const SCAN: readonly {
  name: string;
  market: string;
  body: string;
  model: string;
  url: string;
}[] = [
  {
    name: "Placeholder entry",
    market: "US · EB-2 NIW",
    body: "Replace with the real finding: what the product does, how it scores an applicant, what it charges, and how it converts a free score into a paid case.",
    model: "Self-serve scoring, paid case build",
    url: "",
  },
];

const READ: readonly { title: string; body: string }[] = [
  {
    title: "Where the category actually is",
    body: "TODO(scan): the honest read on how mature this space is, who is doing it well, and what nobody has built yet.",
  },
  {
    title: "What is missing for UK visit visas",
    body: "TODO(scan): the gap. Most tooling clusters around US and Canada immigration. UK visit visas are the thin part of the market.",
  },
];

const CONCEPT: readonly { title: string; body: string }[] = [
  {
    title: "Outward: a refusal risk check",
    body: "An applicant answers a short structured set of questions and gets a banded risk read plus the specific weaknesses in their case. Free, no account, no obligation. It is the top of your funnel and it is also the thing that makes the brand feel trustworthy in a category where nobody is.",
  },
  {
    title: "Inward: triage before a human touches it",
    body: "The same engine pre-sorts inbound cases so your team is not grading every application by hand. Weak cases get flagged early, strong cases move fast, and the time per case stops rising with volume.",
  },
  {
    title: "Underneath: the data asset",
    body: "Every case graded adds to a dataset nobody else holds, what is actually causing refusals, broken down by reason, for one nationality. Published once or twice a year, that becomes the figure other people cite. It only accumulates if the schema is designed for it from the first case rather than the thousandth.",
  },
];

const TOC = [
  { label: "Brief",         href: "#brief"   },
  { label: "Market Scan",   href: "#scan"    },
  { label: "The Read",      href: "#read"    },
  { label: "Concept",       href: "#concept" },
] as const;

/* ── Section mast helper ───────────────────────────────────────────────────── */
function SectionMast({ label, count }: { label: string; count?: number }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{
          fontFamily: GROT, fontWeight: 800, fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: INK, background: YEL, padding: "3px 8px", flexShrink: 0,
        }}>
          {label}
        </span>
        <div style={{ flexGrow: 1, height: 1, background: INK35 }} />
        {count !== undefined && (
          <span style={{ fontFamily: MONO, fontSize: 9, color: INK55, flexShrink: 0 }}>
            {count} {count === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ height: 1, background: INK }} />
        <div style={{ height: 3, marginTop: 3, background: INK }} />
      </div>
    </>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function HajjPeopleWorkspacePage() {
  return (
    <main style={{ background: INK, minHeight: "100vh" }}>
      <style>{`
        .doc-cta:hover { opacity: 0.85 !important; }
        .doc-cta { min-height: 44px !important; display: inline-flex !important; align-items: center; }
        .hp-toc-link:hover { color: ${INK} !important; }

        .hp-masthead {
          background: ${INK};
          padding: 16px 40px 14px;
          border-bottom: 1px solid rgba(250,250,250,.10);
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .hp-body {
          display: grid; grid-template-columns: 176px 1fr;
          align-items: start; max-width: 1120px; margin: 0 auto;
        }
        .hp-toc {
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
          background: ${PAPER2}; border-right: 1px solid ${INK15};
          padding: 28px 20px 28px 24px;
        }
        .hp-toc-head {
          font-family: ${GROT}; font-size: 8px; font-weight: 800;
          letter-spacing: 0.18em; text-transform: uppercase; color: ${INK55};
          margin: 0 0 14px; padding-bottom: 10px; border-bottom: 2px solid ${INK};
        }
        .hp-toc-link {
          display: block; font-family: ${SERIF}; font-style: italic;
          font-size: 13px; line-height: 1.3; color: ${INK55};
          text-decoration: none; padding: 8px 0;
          border-bottom: 1px solid ${INK15}; transition: color 0.1s;
        }
        .hp-toc-link:last-child { border-bottom: none; }

        .hp-section      { padding: 40px 36px 48px; }
        .hp-section-dark { padding: 40px 36px 48px; }
        .hp-card-row {
          display: grid; grid-template-columns: 1fr auto;
          gap: 20px; padding: 28px; align-items: start;
        }
        .hp-tag { display: inline-block; }
        .hp-footer {
          display: flex; justify-content: space-between; align-items: center;
          gap: 24px; padding: 20px 40px;
        }

        @media (max-width: 640px) {
          .hp-masthead { padding: 13px 20px 11px; gap: 10px; }
          .hp-masthead-title { font-size: 17px !important; }
          .hp-body { grid-template-columns: 1fr; }
          .hp-toc  { display: none; }
          .hp-section      { padding: 28px 20px 36px; }
          .hp-section-dark { padding: 28px 20px 36px; }
          .hp-card-row { grid-template-columns: 1fr; gap: 14px; padding: 22px 20px; }
          .hp-tag { justify-self: start; }
          .hp-footer { flex-direction: column; align-items: flex-start; padding: 20px; gap: 12px; }
        }
      `}</style>

      {/* ── Compact masthead ──────────────────────────────────────────────── */}
      <header className="hp-masthead">
        <span style={{
          fontFamily: GROT, fontWeight: 800, fontSize: 8,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: INK, background: YEL, padding: "4px 8px", flexShrink: 0,
        }}>
          PREPARED FOR
        </span>
        <h1
          className="hp-masthead-title"
          style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: 22,
            lineHeight: 1.1, letterSpacing: "-0.02em",
            color: PAPER, margin: 0, flexGrow: 1,
          }}
        >
          UK visa SaaS &mdash; <em>market scan</em>
        </h1>
        <span style={{
          fontFamily: GROT, fontWeight: 600, fontSize: 9,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "rgba(250,250,250,.25)",
          border: "1px solid rgba(250,250,250,.12)",
          padding: "4px 9px", flexShrink: 0,
        }}>
          Hajj People
        </span>
      </header>

      <div className="hp-body">
        <nav className="hp-toc">
          <p className="hp-toc-head">Contents</p>
          {TOC.map((item) => (
            <a key={item.href} href={item.href} className="hp-toc-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div>
          {/* ── Brief ───────────────────────────────────────────────────── */}
          <section id="brief" className="hp-section" style={{ background: PAPER }}>
            <SectionMast label="Brief" />
            <p style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 15,
              lineHeight: 1.7, color: INK70, maxWidth: 620, marginBottom: 16,
            }}>
              Mohsin, Faisal, this is the scan I said I would put together after our call.
              It covers the companies already selling visa and immigration assessment as a
              self-serve product, what each one actually does, and where the gap is for
              UK visit visas.
            </p>
            <p style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 15,
              lineHeight: 1.7, color: INK70, maxWidth: 620, margin: 0,
            }}>
              Nothing here is a proposal. It is the market as it stands, plus the read I would
              give you if you were already a client.
            </p>
          </section>

          {/* ── Market scan ─────────────────────────────────────────────── */}
          <section id="scan" className="hp-section" style={{ background: PAPER2 }}>
            <SectionMast label="Market Scan" count={SCAN.length} />
            <div style={{ border: `1px solid ${INK}` }}>
              {SCAN.map((co, i) => (
                <div
                  key={co.name}
                  className="hp-card-row"
                  style={{ borderBottom: i < SCAN.length - 1 ? `1px solid ${INK}` : "none" }}
                >
                  <div>
                    <h2 style={{
                      fontFamily: SERIF, fontWeight: 700, fontSize: 22,
                      lineHeight: 1.15, letterSpacing: "-0.01em",
                      color: INK, marginBottom: 6,
                    }}>
                      {co.name}
                    </h2>
                    <p style={{
                      fontFamily: MONO, fontSize: 10, color: INK55,
                      letterSpacing: "0.06em", marginBottom: 12,
                    }}>
                      {co.model}
                    </p>
                    <p style={{
                      fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                      lineHeight: 1.6, color: INK70, marginBottom: co.url ? 20 : 0,
                    }}>
                      {co.body}
                    </p>
                    {co.url && (
                      <a
                        href={co.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-cta"
                        style={{
                          display: "inline-block",
                          fontFamily: GROT, fontWeight: 700, fontSize: 10,
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          background: INK, color: PAPER, padding: "11px 18px",
                          textDecoration: "none",
                        }}
                      >
                        Visit site &rarr;
                      </a>
                    )}
                  </div>
                  <span
                    className="hp-tag"
                    style={{
                      fontFamily: GROT, fontWeight: 700, fontSize: 9,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: INK, background: YEL,
                      border: `1px solid ${INK}`, padding: "5px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {co.market}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── The read ────────────────────────────────────────────────── */}
          <section id="read" className="hp-section" style={{ background: PAPER }}>
            <SectionMast label="The Read" count={READ.length} />
            <div style={{ border: `1px solid ${INK35}` }}>
              {READ.map((item, i) => (
                <div
                  key={item.title}
                  style={{
                    padding: "22px 28px",
                    borderBottom: i < READ.length - 1 ? `1px solid ${INK35}` : "none",
                  }}
                >
                  <h3 style={{
                    fontFamily: SERIF, fontWeight: 700, fontSize: 18,
                    letterSpacing: "-0.01em", color: INK, marginBottom: 7,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                    lineHeight: 1.6, color: INK70, margin: 0,
                  }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Concept ─────────────────────────────────────────────────── */}
          <section id="concept" className="hp-section-dark" style={{ background: INK }}>
            <div style={{ display: "flex", alignItems: "stretch", marginBottom: 20, width: "fit-content" }}>
              <span style={{
                fontFamily: GROT, fontWeight: 800, fontSize: 8,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: INK, background: YEL, padding: "4px 8px",
              }}>
                CONCEPT
              </span>
            </div>
            <h2 style={{
              fontFamily: SERIF, fontWeight: 700,
              fontSize: "clamp(20px, 2.5vw, 32px)",
              lineHeight: 1.05, letterSpacing: "-0.02em",
              color: PAPER, marginBottom: 12,
            }}>
              One engine, three jobs
            </h2>
            <p style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 15,
              lineHeight: 1.7, color: P60, maxWidth: 560, marginBottom: 32,
            }}>
              The version of this worth building does not just score applicants.{" "}
              <em>It brings them in, sorts them before a human touches the case, and quietly
              builds the only dataset in the category.</em>
            </p>
            <div style={{ border: "1px solid rgba(250,250,250,.18)" }}>
              {CONCEPT.map((item, i) => (
                <div
                  key={item.title}
                  style={{
                    padding: "22px 28px",
                    borderBottom: i < CONCEPT.length - 1 ? "1px solid rgba(250,250,250,.18)" : "none",
                  }}
                >
                  <h3 style={{
                    fontFamily: SERIF, fontWeight: 700, fontSize: 17,
                    letterSpacing: "-0.01em", color: YEL, marginBottom: 7,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                    lineHeight: 1.65, color: P60, margin: 0,
                  }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="hp-footer" style={{ background: PAPER2, borderTop: `1px solid ${INK15}` }}>
        <p style={{
          fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
          fontSize: 12.5, lineHeight: 1.5, color: INK55,
          margin: 0, maxWidth: 520,
        }}>
          Prepared for Mohsin Tutla and Faisal Khan at Hajj People by Syed Irfan Ajmal.
          Shared privately, not indexed, and not for circulation.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 8, height: 8, background: YEL,
            border: `1.5px solid ${INK}`, borderRadius: "50%",
          }} />
          <span style={{
            fontFamily: GROT, fontWeight: 700, fontSize: 9,
            letterSpacing: "0.16em", textTransform: "uppercase", color: INK55,
          }}>
            PRIVATE
          </span>
        </div>
      </footer>
    </main>
  );
}
