import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools Ecosystem & Growth Strategy · Physicians Thrive",
  description: "Private client workspace — tools, strategy assets, and data advantage.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/pt" },
};

/* ── Design tokens ─────────────────────────────────────────────────────────── */
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
const LIVE_TOOLS = [
  {
    title: "Negotiation Leverage Score",
    body: "Pick a specialty, region, and career stage. The engine returns a 0–100 bargaining-power score with ranked negotiation levers — every figure traced to a page in the Physicians Thrive Compensation Report.",
    cta: "Open Live Demo →",
    href: "/clients/pt/leverage-score.html",
    tag: "LIVE DEMO",
  },
  {
    title: "Physician Salary Estimator",
    body: "30+ specialties × 8 regions. Every salary figure is tagged Reported, Derived, or Estimated — with the source page. Includes YoY salary trends, incentive bonuses by specialty, gender pay gap data, and first-year total comp.",
    cta: "Open Live Demo →",
    href: "/clients/pt/salary-estimator.html",
    tag: "LIVE DEMO",
  },
] as const;

const COMING_TOOLS = [
  {
    title: "Contract Benchmarker",
    body: "Paste an offer letter's key terms. Get a market-rate comparison for salary, signing bonus, RVU conversion factor, and benefits — all benchmarked against the 2024 PT report.",
  },
  {
    title: "Gender Pay Gap Checker",
    body: "Enter specialty and gender. See the documented pay gap for your specialty, how it's trended since 2021, and which contract terms close it fastest.",
  },
  {
    title: "Offer Comparison Calculator",
    body: "Side-by-side analysis of up to 3 job offers with total compensation including base, signing bonus, RVU incentive, benefits value, and relocation.",
  },
  {
    title: "Total Comp + Benefits Scorer",
    body: "Score a full benefits package: disability insurance, 401k, malpractice, CME, relocation. Converts everything into a first-year dollar value.",
  },
] as const;

const STRATEGY_ASSETS = [
  {
    title: "Competitor Analysis",
    body: "How PT's tool suite compares to Resolve, Contract Diagnostics, Contract Rx, WealthKeel, and FastRVU across 8 dimensions — with head-to-head scorecards and market positioning.",
    cta: "View Analysis →",
    href: "/clients/pt/competitor-analysis.html",
    tag: "REPORT",
  },
  {
    title: "Marketing & Distribution Plan",
    body: "How the tools become a growth engine: embeddable widgets, WCI placement, KevinMD/Medscape pitches, annual report press events, and the physician shortage data story.",
    cta: "View Plan →",
    href: "/clients/pt/marketing-plan.html",
    tag: "STRATEGY DOC",
  },
] as const;

const ROADMAP = [
  {
    title: "Specialty Leverage Trend",
    desc: "4-year trajectory of bargaining power by specialty — which are gaining leverage, which are losing it, and why.",
  },
  {
    title: "Embeddable Widget Suite",
    desc: "Both tools as iframes for residency programs, specialty societies, and physician blogs. Every embed is a backlink and a lead.",
  },
  {
    title: "Annual Report Interactive Hub",
    desc: "Turn each year's PDF into a searchable, filterable data explorer. The tool becomes the report.",
  },
] as const;

const TOC = [
  { label: "Active Tools",     href: "#active-tools"     },
  { label: "In Development",   href: "#in-development"   },
  { label: "Strategy Assets",  href: "#strategy-assets"  },
  { label: "Data Foundation",  href: "#data-foundation"  },
  { label: "Roadmap",          href: "#roadmap"          },
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
export default function PtClientWorkspace() {
  return (
    <main style={{ background: INK, minHeight: "100vh" }}>
      <style>{`
        .doc-cta:hover  { opacity: 0.85 !important; }
        .doc-cta { min-height: 44px !important; display: inline-flex !important; align-items: center; }
        .pt-toc-link:hover { color: ${INK} !important; }

        /* ── Masthead ── */
        .pt-masthead {
          background: ${INK};
          padding: 16px 40px 14px;
          border-bottom: 1px solid rgba(250,250,250,.10);
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* ── Body grid ── */
        .pt-body {
          display: grid;
          grid-template-columns: 176px 1fr;
          align-items: start;
          max-width: 1120px;
          margin: 0 auto;
        }

        /* ── TOC sidebar ── */
        .pt-toc {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          background: ${PAPER2};
          border-right: 1px solid ${INK15};
          padding: 28px 20px 28px 24px;
        }
        .pt-toc-head {
          font-family: ${GROT};
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${INK55};
          margin: 0 0 14px;
          padding-bottom: 10px;
          border-bottom: 2px solid ${INK};
        }
        .pt-toc-link {
          display: block;
          font-family: ${SERIF};
          font-style: italic;
          font-size: 13px;
          line-height: 1.3;
          color: ${INK55};
          text-decoration: none;
          padding: 8px 0;
          border-bottom: 1px solid ${INK15};
          transition: color 0.1s;
        }
        .pt-toc-link:last-child { border-bottom: none; }

        /* ── Sections ── */
        .pt-section      { padding: 40px 36px 48px; }
        .pt-section-dark { padding: 40px 36px 48px; }

        .pt-card-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          padding: 28px 0;
          align-items: start;
        }
        .pt-card-row-sm {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          padding: 22px 0;
          align-items: start;
        }
        .pt-roadmap-row  { padding: 20px 0; }
        .pt-tag          { display: inline-block; }

        /* ── Footer ── */
        .pt-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding: 20px 40px;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .pt-masthead { padding: 13px 20px 11px; gap: 10px; }
          .pt-masthead-title { font-size: 17px !important; }
          .pt-body { grid-template-columns: 1fr; }
          .pt-toc  { display: none; }
          .pt-section      { padding: 28px 20px 36px; }
          .pt-section-dark { padding: 28px 20px 36px; }
          .pt-card-row    { grid-template-columns: 1fr; gap: 14px; padding: 22px 0; }
          .pt-card-row-sm { grid-template-columns: 1fr; gap: 10px; padding: 18px 0; }
          .pt-roadmap-row { padding: 16px 0; }
          .pt-footer { flex-direction: column; align-items: flex-start; padding: 20px 20px; gap: 12px; }
        }
      `}</style>

      {/* ── Compact masthead ──────────────────────────────────────────────── */}
      <header className="pt-masthead">
        <span style={{
          fontFamily: GROT, fontWeight: 800, fontSize: 8,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: INK, background: YEL, padding: "4px 8px", flexShrink: 0,
        }}>
          PRIVATE WORKSPACE
        </span>
        <h1
          className="pt-masthead-title"
          style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: 22,
            lineHeight: 1.1, letterSpacing: "-0.02em",
            color: PAPER, margin: 0, flexGrow: 1,
          }}
        >
          Tools ecosystem &amp; <em>growth strategy</em>
        </h1>
        <span style={{
          fontFamily: GROT, fontWeight: 600, fontSize: 9,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "rgba(250,250,250,.25)",
          border: "1px solid rgba(250,250,250,.12)",
          padding: "4px 9px", flexShrink: 0,
        }}>
          Physicians Thrive
        </span>
      </header>

      {/* ── Body: TOC + sections ──────────────────────────────────────────── */}
      <div className="pt-body">

        {/* TOC sidebar */}
        <nav className="pt-toc">
          <p className="pt-toc-head">Contents</p>
          {TOC.map((item) => (
            <a key={item.href} href={item.href} className="pt-toc-link">
              {item.label}
            </a>
          ))}
        </nav>

        {/* Main content */}
        <div>

          {/* ── Active Tools ────────────────────────────────────────────── */}
          <section id="active-tools" className="pt-section" style={{ background: PAPER }}>
            <SectionMast label="Active Tools" count={LIVE_TOOLS.length} />
            <div style={{ border: `1px solid ${INK}` }}>
              {LIVE_TOOLS.map((tool, i) => (
                <div
                  key={tool.title}
                  className="pt-card-row"
                  style={{
                    borderBottom: i < LIVE_TOOLS.length - 1 ? `1px solid ${INK}` : "none",
                    padding: "28px 28px",
                  }}
                >
                  <div>
                    <h2 style={{
                      fontFamily: SERIF, fontWeight: 700, fontSize: 22,
                      lineHeight: 1.15, letterSpacing: "-0.01em",
                      color: INK, marginBottom: 10,
                    }}>
                      {tool.title}
                    </h2>
                    <p style={{
                      fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                      lineHeight: 1.6, color: INK70, marginBottom: 20,
                    }}>
                      {tool.body}
                    </p>
                    <a
                      href={tool.href}
                      className="doc-cta"
                      style={{
                        display: "inline-block",
                        fontFamily: GROT, fontWeight: 700, fontSize: 10,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        background: INK, color: PAPER, padding: "11px 18px",
                        textDecoration: "none",
                      }}
                    >
                      {tool.cta}
                    </a>
                  </div>
                  <span
                    className="pt-tag"
                    style={{
                      fontFamily: GROT, fontWeight: 700, fontSize: 9,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: INK, background: YEL,
                      border: `1px solid ${INK}`, padding: "5px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tool.tag}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── In Development ──────────────────────────────────────────── */}
          <section id="in-development" className="pt-section" style={{ background: PAPER2 }}>
            <SectionMast label="In Development" count={COMING_TOOLS.length} />
            <div style={{ border: `1px solid ${INK35}` }}>
              {COMING_TOOLS.map((tool, i) => (
                <div
                  key={tool.title}
                  className="pt-card-row-sm"
                  style={{
                    borderBottom: i < COMING_TOOLS.length - 1 ? `1px solid ${INK35}` : "none",
                    padding: "22px 28px",
                    opacity: 0.65,
                  }}
                >
                  <div>
                    <h2 style={{
                      fontFamily: SERIF, fontWeight: 700, fontSize: 18,
                      lineHeight: 1.2, letterSpacing: "-0.01em",
                      color: INK, marginBottom: 7,
                    }}>
                      {tool.title}
                    </h2>
                    <p style={{
                      fontFamily: SERIF, fontWeight: 400, fontSize: 13,
                      lineHeight: 1.6, color: INK55, margin: 0,
                    }}>
                      {tool.body}
                    </p>
                  </div>
                  <span
                    className="pt-tag"
                    style={{
                      fontFamily: GROT, fontWeight: 700, fontSize: 9,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: INK55, background: PAPER2,
                      border: `1px solid ${INK35}`, padding: "5px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    COMING SOON
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Strategy Assets ─────────────────────────────────────────── */}
          <section id="strategy-assets" className="pt-section" style={{ background: PAPER }}>
            <SectionMast label="Strategy Assets" count={STRATEGY_ASSETS.length} />
            <div style={{ border: `1px solid ${INK}` }}>
              {STRATEGY_ASSETS.map((asset, i) => (
                <div
                  key={asset.title}
                  className="pt-card-row"
                  style={{
                    borderBottom: i < STRATEGY_ASSETS.length - 1 ? `1px solid ${INK}` : "none",
                    padding: "28px 28px",
                  }}
                >
                  <div>
                    <h2 style={{
                      fontFamily: SERIF, fontWeight: 700, fontSize: 22,
                      lineHeight: 1.15, letterSpacing: "-0.01em",
                      color: INK, marginBottom: 10,
                    }}>
                      {asset.title}
                    </h2>
                    <p style={{
                      fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                      lineHeight: 1.6, color: INK70, marginBottom: 20,
                    }}>
                      {asset.body}
                    </p>
                    <a
                      href={asset.href}
                      className="doc-cta"
                      style={{
                        display: "inline-block",
                        fontFamily: GROT, fontWeight: 700, fontSize: 10,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        background: INK, color: PAPER, padding: "11px 18px",
                        textDecoration: "none",
                      }}
                    >
                      {asset.cta}
                    </a>
                  </div>
                  <span
                    className="pt-tag"
                    style={{
                      fontFamily: GROT, fontWeight: 700, fontSize: 9,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: INK55, background: PAPER2,
                      border: `1px solid ${INK35}`, padding: "5px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {asset.tag}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Data Foundation ─────────────────────────────────────────── */}
          <section id="data-foundation" className="pt-section-dark" style={{ background: INK }}>
            <div style={{ display: "flex", alignItems: "stretch", marginBottom: 20, width: "fit-content" }}>
              <span style={{
                fontFamily: GROT, fontWeight: 800, fontSize: 8,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: INK, background: YEL, padding: "4px 8px",
              }}>
                DATA FOUNDATION
              </span>
            </div>
            <h2 style={{
              fontFamily: SERIF, fontWeight: 700,
              fontSize: "clamp(20px, 2.5vw, 32px)",
              lineHeight: 1.05, letterSpacing: "-0.02em",
              color: PAPER, marginBottom: 12,
            }}>
              The data asset behind everything
            </h2>
            <p style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 15,
              lineHeight: 1.7, color: P60, maxWidth: 540, marginBottom: 32,
            }}>
              PT&rsquo;s multi-year compensation dataset is the only free, source-cited, longitudinal physician compensation resource in the market.{" "}
              <em>No competitor has 4 years of clean, citable data.</em>
            </p>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 0, rowGap: 10 }}>
              {[
                { label: "2021 Report", done: true },
                { label: "2022 Report", done: true },
                { label: "2023 Report", done: true },
                { label: "2024 Report", done: true },
                { label: "2025 · In Progress", done: false },
              ].map((y, i) => (
                <div key={y.label} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && (
                    <div style={{ width: 20, height: 1, background: y.done ? YEL : "rgba(250,250,250,.18)", flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontFamily: MONO, fontSize: 10,
                    color: y.done ? YEL : INK55,
                    border: `1px solid ${y.done ? YEL : "rgba(250,250,250,.18)"}`,
                    padding: "4px 9px", whiteSpace: "nowrap",
                  }}>
                    {y.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Roadmap ─────────────────────────────────────────────────── */}
          <section id="roadmap" className="pt-section" style={{ background: PAPER2 }}>
            <SectionMast label="Roadmap" count={ROADMAP.length} />
            <div style={{ border: `1px solid ${INK35}` }}>
              {ROADMAP.map((item, i) => (
                <div
                  key={item.title}
                  className="pt-roadmap-row"
                  style={{
                    padding: "20px 28px",
                    borderBottom: i < ROADMAP.length - 1 ? `1px solid ${INK35}` : "none",
                  }}
                >
                  <h3 style={{
                    fontFamily: SERIF, fontWeight: 700, fontSize: 16,
                    letterSpacing: "-0.01em", color: INK, marginBottom: 5,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 13,
                    lineHeight: 1.6, color: INK55, margin: 0,
                  }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>{/* end main content */}
      </div>{/* end pt-body */}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="pt-footer" style={{ background: PAPER2, borderTop: `1px solid ${INK15}` }}>
        <p style={{
          fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
          fontSize: 12.5, lineHeight: 1.5, color: INK55,
          margin: 0, maxWidth: 520,
        }}>
          All materials prepared exclusively for Physicians Thrive. Built on the EMOS framework by Syed Irfan Ajmal, shared privately for review.
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
            CONFIDENTIAL
          </span>
        </div>
      </footer>
    </main>
  );
}
