"use client";

import { useState } from "react";

/* ── Design tokens ────────────────────────────────────────────────────────── */
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

/* ── Content ──────────────────────────────────────────────────────────────── */
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
    tag: "REPORT",
  },
  {
    title: "Marketing & Distribution Plan",
    body: "How the tools become a growth engine: embeddable widgets, WCI placement, KevinMD/Medscape pitches, annual report press events, and the physician shortage data story.",
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

/* ── Types ────────────────────────────────────────────────────────────────── */
type SectionId = "tools" | "potential" | "strategy" | "data" | "roadmap";

const TOC: { id: SectionId; label: string; count?: number }[] = [
  { id: "tools",     label: "Active Tools",          count: LIVE_TOOLS.length },
  { id: "potential", label: "Other Potential Tools",  count: COMING_TOOLS.length },
  { id: "strategy",  label: "Strategy Assets",        count: STRATEGY_ASSETS.length },
  { id: "data",      label: "Data Foundation" },
  { id: "roadmap",   label: "Roadmap",                count: ROADMAP.length },
];

/* ── Section toggle header ────────────────────────────────────────────────── */
function SectionToggle({
  label, count, isOpen, onToggle, dark,
}: {
  label: string; count?: number; isOpen: boolean; onToggle: () => void; dark?: boolean;
}) {
  const muted  = dark ? "rgba(250,250,250,.20)" : INK35;
  const text   = dark ? "rgba(250,250,250,.45)" : INK55;
  const accent = dark ? "rgba(250,250,250,.06)" : INK15;

  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "20px 48px",
        background: "transparent", border: "none",
        borderBottom: isOpen ? `1px solid ${accent}` : "none",
        cursor: "pointer", textAlign: "left",
      }}
    >
      <span style={{
        fontFamily: GROT, fontWeight: 800, fontSize: 9,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: INK, background: YEL, padding: "3px 8px", flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flexGrow: 1, height: 1, background: muted }} />
      {count !== undefined && (
        <span style={{ fontFamily: MONO, fontSize: 9, color: text, flexShrink: 0 }}>
          {count} items
        </span>
      )}
      <span style={{
        fontFamily: MONO, fontSize: 13,
        color: isOpen ? YEL : text,
        flexShrink: 0, marginLeft: 4,
      }}>
        {isOpen ? "▾" : "▸"}
      </span>
    </button>
  );
}

/* ── Double rule (shown when section is expanded) ─────────────────────────── */
function DoubleRule() {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ height: 1, background: INK }} />
      <div style={{ height: 3, marginTop: 3, background: INK }} />
    </div>
  );
}

/* ── Main client component ────────────────────────────────────────────────── */
export function PtWorkspace() {
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    tools:     true,
    potential: false,
    strategy:  false,
    data:      false,
    roadmap:   false,
  });

  const toggle = (id: SectionId) => setOpen(p => ({ ...p, [id]: !p[id] }));

  const scrollTo = (id: SectionId) => {
    setOpen(p => ({ ...p, [id]: true }));
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "flex-start", background: INK }}>
      <style>{`
        .doc-cta:hover { opacity: 0.85 !important; }
        .toc-btn:hover { background: rgba(245,184,31,.06) !important; }
      `}</style>

      {/* ── TOC Sidebar ─────────────────────────────────────────────────── */}
      <aside style={{
        width: 210, flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        background: "#131210",
        borderRight: "1px solid rgba(250,250,250,.07)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Identity */}
        <div style={{ padding: "28px 20px 22px", borderBottom: "1px solid rgba(250,250,250,.07)" }}>
          <div style={{
            fontFamily: GROT, fontWeight: 800, fontSize: 8,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: INK, background: YEL, padding: "3px 7px",
            display: "inline-block", marginBottom: 10,
          }}>WORKSPACE</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: PAPER, lineHeight: 1.2 }}>
            Physicians Thrive
          </div>
          <div style={{ fontFamily: GROT, fontSize: 10, color: "rgba(250,250,250,.28)", marginTop: 4 }}>
            Tools &amp; Strategy
          </div>
        </div>

        {/* TOC nav */}
        <nav style={{ flex: 1, padding: "10px 0" }}>
          {TOC.map((s, i) => {
            const active = open[s.id];
            return (
              <button
                key={s.id}
                className="toc-btn"
                onClick={() => scrollTo(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "11px 20px",
                  background: active ? "rgba(245,184,31,.08)" : "transparent",
                  border: "none",
                  borderLeft: `2px solid ${active ? YEL : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.12s",
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 8, color: active ? YEL : "rgba(250,250,250,.20)", flexShrink: 0, minWidth: 18 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{
                  fontFamily: GROT, fontWeight: active ? 700 : 400, fontSize: 9,
                  letterSpacing: "0.10em", textTransform: "uppercase",
                  color: active ? PAPER : "rgba(250,250,250,.38)",
                  flex: 1, lineHeight: 1.4,
                }}>
                  {s.label}
                </span>
                {s.count !== undefined && (
                  <span style={{ fontFamily: MONO, fontSize: 8, color: "rgba(250,250,250,.18)", flexShrink: 0 }}>
                    {s.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(250,250,250,.06)" }}>
          <div style={{ fontFamily: GROT, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,250,250,.18)" }}>
            Prepared by SIA Enterprises
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0 }}>

        {/* Hero */}
        <section style={{ background: INK, padding: "56px 48px 64px", borderBottom: "1px solid rgba(250,250,250,.06)" }}>
          <div style={{ display: "flex", alignItems: "stretch", marginBottom: 24, width: "fit-content" }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, background: YEL, padding: "5px 10px" }}>
              PRIVATE WORKSPACE
            </span>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: P60, border: `1px solid ${P25}`, padding: "5px 12px" }}>
              Physicians Thrive
            </span>
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 0.96, letterSpacing: "-0.03em", color: PAPER, marginBottom: 18 }}>
            Tools ecosystem<br /><em>&amp; growth strategy</em>
          </h1>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 17, lineHeight: 1.6, color: P60, maxWidth: 520, margin: 0 }}>
            A proposal-in-demo form: two live tools, four in development, plus a competitor analysis and marketing plan — all powered by PT&rsquo;s annual compensation data.
          </p>
        </section>

        {/* ── § 01 Active Tools ─────────────────────────────────────────── */}
        <section id="tools" style={{ background: PAPER, borderBottom: `1px solid ${INK15}` }}>
          <SectionToggle label="Active Tools" count={LIVE_TOOLS.length} isOpen={open.tools} onToggle={() => toggle("tools")} />
          {open.tools && (
            <div style={{ padding: "0 48px 48px" }}>
              <DoubleRule />
              <div style={{ border: `1px solid ${INK}` }}>
                {LIVE_TOOLS.map((tool, i) => (
                  <div key={tool.title} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, padding: "32px 36px", alignItems: "start", borderBottom: i < LIVE_TOOLS.length - 1 ? `1px solid ${INK}` : "none" }}>
                    <div>
                      <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.01em", color: INK, marginBottom: 10 }}>{tool.title}</h2>
                      <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: INK70, marginBottom: 20 }}>{tool.body}</p>
                      <a href={tool.href} className="doc-cta" style={{ display: "inline-block", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: INK, color: PAPER, padding: "12px 20px", textDecoration: "none" }}>
                        {tool.cta}
                      </a>
                    </div>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, background: YEL, border: `1px solid ${INK}`, padding: "5px 10px", whiteSpace: "nowrap" }}>
                      {tool.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── § 02 Other Potential Tools ────────────────────────────────── */}
        <section id="potential" style={{ background: PAPER2, borderBottom: `1px solid ${INK15}` }}>
          <SectionToggle label="Other Potential Tools" count={COMING_TOOLS.length} isOpen={open.potential} onToggle={() => toggle("potential")} />
          {open.potential && (
            <div style={{ padding: "0 48px 48px" }}>
              <DoubleRule />
              <div style={{ border: `1px solid ${INK35}` }}>
                {COMING_TOOLS.map((tool, i) => (
                  <div key={tool.title} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, padding: "28px 36px", alignItems: "start", borderBottom: i < COMING_TOOLS.length - 1 ? `1px solid ${INK35}` : "none", opacity: 0.65 }}>
                    <div>
                      <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.2, letterSpacing: "-0.01em", color: INK, marginBottom: 8 }}>{tool.title}</h2>
                      <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: INK55, margin: 0 }}>{tool.body}</p>
                    </div>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, background: PAPER2, border: `1px solid ${INK35}`, padding: "5px 10px", whiteSpace: "nowrap" }}>
                      COMING SOON
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── § 03 Strategy Assets ──────────────────────────────────────── */}
        <section id="strategy" style={{ background: PAPER, borderBottom: `1px solid ${INK15}` }}>
          <SectionToggle label="Strategy Assets" count={STRATEGY_ASSETS.length} isOpen={open.strategy} onToggle={() => toggle("strategy")} />
          {open.strategy && (
            <div style={{ padding: "0 48px 48px" }}>
              <DoubleRule />
              <div style={{ border: `1px solid ${INK}` }}>
                {STRATEGY_ASSETS.map((asset, i) => (
                  <div key={asset.title} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, padding: "32px 36px", alignItems: "start", borderBottom: i < STRATEGY_ASSETS.length - 1 ? `1px solid ${INK}` : "none" }}>
                    <div>
                      <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.01em", color: INK, marginBottom: 10 }}>{asset.title}</h2>
                      <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: INK70, marginBottom: 20 }}>{asset.body}</p>
                      <span style={{ display: "inline-block", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", background: INK35, color: PAPER, padding: "12px 20px", cursor: "not-allowed" }}>
                        Available Upon Request
                      </span>
                    </div>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, background: PAPER2, border: `1px solid ${INK35}`, padding: "5px 10px", whiteSpace: "nowrap" }}>
                      {asset.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── § 04 Data Foundation ──────────────────────────────────────── */}
        <section id="data" style={{ background: INK, borderBottom: "1px solid rgba(250,250,250,.06)" }}>
          <SectionToggle label="Data Foundation" isOpen={open.data} onToggle={() => toggle("data")} dark />
          {open.data && (
            <div style={{ padding: "0 48px 56px" }}>
              <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: PAPER, marginBottom: 14 }}>
                The data asset behind everything
              </h2>
              <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 16, lineHeight: 1.7, color: P60, maxWidth: 580, marginBottom: 36 }}>
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
                    {i > 0 && <div style={{ width: 32, height: 1, background: y.done ? YEL : P25 }} />}
                    <span style={{ fontFamily: MONO, fontSize: 10, color: y.done ? YEL : INK55, border: `1px solid ${y.done ? YEL : "rgba(250,250,250,.18)"}`, padding: "5px 10px", whiteSpace: "nowrap" }}>
                      {y.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── § 05 Roadmap ──────────────────────────────────────────────── */}
        <section id="roadmap" style={{ background: PAPER2, borderBottom: `1px solid ${INK15}` }}>
          <SectionToggle label="Roadmap" count={ROADMAP.length} isOpen={open.roadmap} onToggle={() => toggle("roadmap")} />
          {open.roadmap && (
            <div style={{ padding: "0 48px 48px" }}>
              <DoubleRule />
              <div style={{ border: `1px solid ${INK35}` }}>
                {ROADMAP.map((item, i) => (
                  <div key={item.title} style={{ padding: "24px 36px", borderBottom: i < ROADMAP.length - 1 ? `1px solid ${INK35}` : "none" }}>
                    <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: INK, marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: INK55, margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer style={{ background: PAPER2, borderTop: `1px solid ${INK15}`, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 12.5, lineHeight: 1.5, color: INK55, margin: 0, maxWidth: 520 }}>
            All materials prepared exclusively for Physicians Thrive. Built on the EMOS framework by Syed Irfan Ajmal &mdash; shared privately for review.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, background: YEL, border: `1.5px solid ${INK}`, borderRadius: "50%" }} />
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>CONFIDENTIAL</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
