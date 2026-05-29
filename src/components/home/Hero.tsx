import {
  CALENDLY,
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  PAPER,
  SERIF,
  YEL,
} from "@/lib/tokens";
import { DoubleRule, Flag, Mark, Pill, SCaps } from "@/components/bureau/primitives";

// ── Stat strip data ──────────────────────────────────────────────────────────
// [display number, descriptor label, italic citation]
const STATS: ReadonlyArray<[string, string, string]> = [
  ["$1.2M",    "organic revenue",       "NTA · $160K → $1.2M · 12 mo"],
  ["1.5M /mo", "monthly visitors",      "Ridester · 0 → 1.5M · 12 mo"],
  ["300+",     "clients served",        ""],
  ["22+",      "years in the field",    ""],
];

// ── Right-panel dispatch items ───────────────────────────────────────────────
// [name, sub-label, anchor]
const DISPATCH: ReadonlyArray<[string, string, string]> = [
  ["Press",      "Earned Media OS · The Method",        "/emos"],
  ["Speaking",   "Stages & Workshops · 4 Countries",    "/speaking"],
  ["Resources",  "Playbooks, Kits & Podcast",           "/resources"],
  ["Casework",   "What the numbers did",                "#casework"],
];

export const Hero = () => (
  <section style={{ background: PAPER }}>

    {/* ── Stat strip ── */}
    <div className="sx">
      <div className="hero-double-rule-top" />
      <div className="grid-stats" style={{ border: `1px solid ${INK}`, borderTop: "none" }}>
        {STATS.map(([n, l, cite], i) => (
          <div
            key={i}
            className="stat-item"
            style={{ padding: "22px 20px 26px", textAlign: "center" }}
          >
            <div className="stat-number" style={{ fontFamily: SERIF, color: INK }}>
              {n}
            </div>
            <div style={{ marginTop: 7 }}>
              <SCaps size={10.5} ls="0.16em" color={INK70}>{l}</SCaps>
            </div>
            {cite && (
              <div style={{
                marginTop: 8,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 13,
                color: INK55,
                lineHeight: 1.3,
              }}>
                {cite}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ── Newspaper 3-col grid ── */}
    <div className="sx">
      <div className="grid-hero-newspaper" style={{ borderTop: `1px solid ${INK}` }}>

        {/* LEFT — photo + stat */}
        <div className="hero-np-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/headshot-circle.png"
            alt="Syed Irfan Ajmal"
            style={{
              width: "100%",
              maxWidth: 180,
              display: "block",
              position: "relative",
              zIndex: 1,
            }}
          />

          <div>
            <div className="hero-stat-number">22<span style={{ fontSize: "0.50em", fontStyle: "italic", verticalAlign: "0.10em" }}>+</span></div>
            <div className="hero-stat-label">
              <strong style={{ color: INK }}>Years</strong><br />
              in the field
            </div>
          </div>

        </div>

        {/* CENTER — headline */}
        <div className="hero-np-center">
          <h1
            className="hero-h1"
            style={{ fontFamily: SERIF, fontWeight: 700, color: INK }}
          >
            <span style={{ display: "block" }}>Why pay for attention</span>
            <span style={{ display: "block", fontStyle: "italic", fontWeight: 600 }}>
              when you can <Mark>earn it?</Mark>
            </span>
          </h1>

          {/* Rule + CTAs */}
          <div style={{
            borderTop: `1px solid ${INK35}`,
            margin: "32px 0 0",
            paddingTop: 22,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "12px 20px",
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
              Book a discovery call →
            </a>
            <a
              href="/emos"
              style={{
                padding: "12px 20px",
                background: YEL,
                color: INK,
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              See the EMOS
            </a>
          </div>
        </div>

        {/* RIGHT — dispatch (hidden below 1100px) */}
        <div className="hero-np-right hero-np-right-hide" style={{ flexDirection: "column" }}>
          <div style={{
            fontFamily: GROT,
            fontWeight: 700,
            fontSize: 9.5,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: INK55,
            marginBottom: 14,
          }}>
            In This Dispatch
          </div>
          <div style={{ borderTop: `1px solid ${INK}` }} />
          <div style={{ marginTop: 3, borderTop: `3px solid ${INK}`, marginBottom: 0 }} />

          {DISPATCH.map(([name, sub, href]) => (
            <a
              key={name}
              href={href}
              className="hero-dispatch-item"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1.1,
                color: INK,
              }}>
                {name}
              </div>
              <div style={{
                marginTop: 3,
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color: INK55,
              }}>
                {sub}
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>

    {/* ── What I do card ── */}
    <div className="sx">
      <div style={{
        background: INK,
        padding: "40px 44px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        borderLeft: `1px solid ${INK}`,
        borderRight: `1px solid ${INK}`,
        borderBottom: `1px solid ${INK}`,
      }}>
        {/* Overline */}
        <div style={{
          fontFamily: GROT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          color: "rgba(241,235,222,.45)",
        }}>
          The Work
        </div>

        {/* Statement */}
        <p style={{
          margin: 0,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: "clamp(22px, 3.2vw, 38px)",
          color: PAPER,
          lineHeight: 1.25,
          letterSpacing: "-0.015em",
          maxWidth: 820,
        }}>
          I help founders and brands get covered, get found,
          and get customers — without paying for attention.
        </p>

        {/* Pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {([
            ["Earned Media OS",  "/emos"],
            ["Speaking",         "/speaking"],
            ["Resources",        "/resources"],
          ] as const).map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{
                padding: "10px 18px",
                border: `1px solid rgba(241,235,222,.35)`,
                color: PAPER,
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = YEL;
                (e.currentTarget as HTMLElement).style.color = INK;
                (e.currentTarget as HTMLElement).style.borderColor = YEL;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = PAPER;
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(241,235,222,.35)";
              }}
            >
              {label} →
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* ── Provenance band ── */}
    <div className="sx">
      <DoubleRule style={{ margin: "40px 0 0" }} />
      <div style={{ padding: "20px 0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <Pill size={11} ls="0.20em">Background</Pill>
          <div style={{ flex: 1, height: 1, background: INK35 }} />
        </div>

        <div style={{ border: `1px solid ${INK}` }}>
          {/* Row 1 — Clients */}
          <div className="provenance-row" style={{ borderBottom: `1px solid ${INK35}` }}>
            <div
              className="provenance-label"
              style={{ padding: "14px 20px", background: "#e8e0cc", display: "flex", alignItems: "center" }}
            >
              <SCaps size={10.5} ls="0.18em" color={INK55}>Since 2004 · Clients across</SCaps>
            </div>
            <div style={{
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px 20px",
              fontFamily: SERIF,
              fontSize: 16.5,
              color: INK,
            }}>
              <span><Flag c="US" />North America</span>
              <span style={{ color: INK35 }}>·</span>
              <span><Flag c="EU" />Europe</span>
              <span style={{ color: INK35 }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <span style={{
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10.5,
                  letterSpacing: "0.10em",
                  padding: "2px 7px",
                  background: INK,
                  color: PAPER,
                }}>AE</span>
                MENA
              </span>
            </div>
          </div>

          {/* Row 2 — Education */}
          <div className="provenance-row">
            <div
              className="provenance-label"
              style={{ padding: "14px 20px", background: "#e8e0cc", display: "flex", alignItems: "center" }}
            >
              <SCaps size={10.5} ls="0.18em" color={INK55}>Prior Work + Education</SCaps>
            </div>
            <div style={{
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px 20px",
              fontFamily: SERIF,
              fontSize: 16.5,
              color: INK,
            }}>
              <span><Flag c="PK" />Peshawar</span>
              <span style={{ color: INK35 }}>·</span>
              <span><Flag c="SE" />Stockholm</span>
              <span style={{ color: INK35 }}>·</span>
              <span><Flag c="DK" />Copenhagen</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom padding */}
    <div style={{ paddingBottom: 56 }} />
  </section>
);
