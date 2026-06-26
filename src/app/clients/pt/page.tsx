import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools Ecosystem & Growth Strategy · Physicians Thrive",
  description: "Private client workspace — tools, strategy assets, and data advantage.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/pt" },
};

/* ── Design tokens (SIA editorial) ────────────────────────────────────────── */
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
const P25    = "rgba(250,250,250,.25)";
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
      <style>{`.doc-cta:hover { opacity: 0.85 !important; }`}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ background: INK, padding: "56px 40px 64px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "stretch", marginBottom: 24, width: "fit-content" }}>
            <span style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: INK, background: YEL, padding: "5px 10px",
            }}>
              PRIVATE WORKSPACE
            </span>
            <span style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: P60, border: `1px solid ${P25}`, padding: "5px 12px",
            }}>
              Physicians Thrive
            </span>
          </div>

          <h1 style={{
            fontFamily: SERIF, fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 0.96, letterSpacing: "-0.03em",
            color: PAPER, marginBottom: 18,
          }}>
            Tools ecosystem<br />
            <em>&amp; growth strategy</em>
          </h1>

          <p style={{
            fontFamily: SERIF, fontWeight: 400, fontSize: 17,
            lineHeight: 1.6, color: P60, maxWidth: 520, margin: 0,
          }}>
            A proposal-in-demo form: two live tools, four in development, plus a competitor analysis and marketing plan — all powered by PT&rsquo;s annual compensation data.
          </p>
        </div>
      </section>

      {/* ── Live Tools ────────────────────────────────────────────────────── */}
      <section style={{ background: PAPER, padding: "48px 40px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <SectionMast label="Active Tools" count={LIVE_TOOLS.length} />
          <div style={{ border: `1px solid ${INK}` }}>
            {LIVE_TOOLS.map((tool, i) => (
              <div
                key={tool.title}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  gap: 24, padding: "32px 36px", alignItems: "start",
                  borderBottom: i < LIVE_TOOLS.length - 1 ? `1px solid ${INK}` : "none",
                }}
              >
                <div>
                  <h2 style={{
                    fontFamily: SERIF, fontWeight: 700, fontSize: 24,
                    lineHeight: 1.15, letterSpacing: "-0.01em",
                    color: INK, marginBottom: 10,
                  }}>
                    {tool.title}
                  </h2>
                  <p style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 15,
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
                      background: INK, color: PAPER, padding: "12px 20px",
                      textDecoration: "none",
                    }}
                  >
                    {tool.cta}
                  </a>
                </div>
                <span style={{
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: INK, background: YEL,
                  border: `1px solid ${INK}`, padding: "5px 10px",
                  whiteSpace: "nowrap",
                }}>
                  {tool.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── In Development ────────────────────────────────────────────────── */}
      <section style={{ background: PAPER2, padding: "48px 40px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <SectionMast label="In Development" count={COMING_TOOLS.length} />
          <div style={{ border: `1px solid ${INK35}` }}>
            {COMING_TOOLS.map((tool, i) => (
              <div
                key={tool.title}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  gap: 24, padding: "28px 36px", alignItems: "start",
                  borderBottom: i < COMING_TOOLS.length - 1 ? `1px solid ${INK35}` : "none",
                  opacity: 0.65,
                }}
              >
                <div>
                  <h2 style={{
                    fontFamily: SERIF, fontWeight: 700, fontSize: 20,
                    lineHeight: 1.2, letterSpacing: "-0.01em",
                    color: INK, marginBottom: 8,
                  }}>
                    {tool.title}
                  </h2>
                  <p style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                    lineHeight: 1.6, color: INK55, margin: 0,
                  }}>
                    {tool.body}
                  </p>
                </div>
                <span style={{
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: INK55, background: PAPER2,
                  border: `1px solid ${INK35}`, padding: "5px 10px",
                  whiteSpace: "nowrap",
                }}>
                  COMING SOON
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Strategy Assets ───────────────────────────────────────────────── */}
      <section style={{ background: PAPER, padding: "48px 40px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <SectionMast label="Strategy Assets" count={STRATEGY_ASSETS.length} />
          <div style={{ border: `1px solid ${INK}` }}>
            {STRATEGY_ASSETS.map((asset, i) => (
              <div
                key={asset.title}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  gap: 24, padding: "32px 36px", alignItems: "start",
                  borderBottom: i < STRATEGY_ASSETS.length - 1 ? `1px solid ${INK}` : "none",
                }}
              >
                <div>
                  <h2 style={{
                    fontFamily: SERIF, fontWeight: 700, fontSize: 24,
                    lineHeight: 1.15, letterSpacing: "-0.01em",
                    color: INK, marginBottom: 10,
                  }}>
                    {asset.title}
                  </h2>
                  <p style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 15,
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
                      background: INK, color: PAPER, padding: "12px 20px",
                      textDecoration: "none",
                    }}
                  >
                    {asset.cta}
                  </a>
                </div>
                <span style={{
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: INK55, background: PAPER2,
                  border: `1px solid ${INK35}`, padding: "5px 10px",
                  whiteSpace: "nowrap",
                }}>
                  {asset.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Foundation ───────────────────────────────────────────────── */}
      <section style={{ background: INK, padding: "56px 40px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "stretch", marginBottom: 24, width: "fit-content" }}>
            <span style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: INK, background: YEL, padding: "5px 10px",
            }}>
              DATA FOUNDATION
            </span>
          </div>

          <h2 style={{
            fontFamily: SERIF, fontWeight: 700,
            fontSize: "clamp(24px, 3vw, 38px)",
            lineHeight: 1.05, letterSpacing: "-0.02em",
            color: PAPER, marginBottom: 14,
          }}>
            The data asset behind everything
          </h2>

          <p style={{
            fontFamily: SERIF, fontWeight: 400, fontSize: 16,
            lineHeight: 1.7, color: P60, maxWidth: 580, marginBottom: 36,
          }}>
            PT&rsquo;s multi-year compensation dataset is the only free, source-cited, longitudinal physician compensation resource in the market.{" "}
            <em>No competitor has 4 years of clean, citable data.</em>
          </p>

          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
            {[
              { label: "2021 Report", done: true },
              { label: "2022 Report", done: true },
              { label: "2023 Report", done: true },
              { label: "2024 Report", done: true },
              { label: "2025 · In Progress", done: false },
            ].map((y, i) => (
              <div key={y.label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div style={{ width: 32, height: 1, background: y.done ? YEL : P25 }} />
                )}
                <span style={{
                  fontFamily: MONO, fontSize: 10,
                  color: y.done ? YEL : INK55,
                  border: `1px solid ${y.done ? YEL : "rgba(250,250,250,.18)"}`,
                  padding: "5px 10px", whiteSpace: "nowrap",
                }}>
                  {y.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ───────────────────────────────────────────────────────── */}
      <section style={{ background: PAPER2, padding: "48px 40px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <SectionMast label="Roadmap" count={ROADMAP.length} />
          <div style={{ border: `1px solid ${INK35}` }}>
            {ROADMAP.map((item, i) => (
              <div
                key={item.title}
                style={{
                  padding: "24px 36px",
                  borderBottom: i < ROADMAP.length - 1 ? `1px solid ${INK35}` : "none",
                }}
              >
                <h3 style={{
                  fontFamily: SERIF, fontWeight: 700, fontSize: 18,
                  letterSpacing: "-0.01em", color: INK, marginBottom: 6,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontFamily: SERIF, fontWeight: 400, fontSize: 14,
                  lineHeight: 1.6, color: INK55, margin: 0,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        background: PAPER2, borderTop: `1px solid ${INK15}`,
        padding: "20px 40px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: 24,
      }}>
        <p style={{
          fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
          fontSize: 12.5, lineHeight: 1.5, color: INK55,
          margin: 0, maxWidth: 520,
        }}>
          All materials prepared exclusively for Physicians Thrive. Built on the EMOS framework by Syed Irfan Ajmal &mdash; shared privately for review.
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
