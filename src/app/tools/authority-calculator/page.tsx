"use client";

import React, { useState, useEffect } from "react";
import { Colophon, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
  SiaLogo,
} from "@/components/bureau/primitives";
import {
  CALENDLY,
  GROT,
  INK,
  INK15,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";

// ── EMOS apply URL (separate from bureau Calendly) ───────────────────────────
const EMOS_APPLY = "https://dmr.agency/earnedmediaos/apply/";

// ── Semantic spot colours ────────────────────────────────────────────────────
const GREEN = "#3e6b45";   // positive / owned / EMOS
const RED   = "#c14a32";   // cost / negative
const BLUE  = "#2d5393";   // informational
const AMBER = "#d99211";   // link-equity asset / assumption badges
const hexA  = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// ── Config ────────────────────────────────────────────────────────────────────
interface SpendOption {
  label: string; short: string; costLabel: string;
  min: number; max: number; step: number; def: number;
  hint: string;
}
const SPEND: Record<"agency" | "links", SpendOption> = {
  agency: {
    label: "I pay a monthly agency retainer",
    short: "Agency retainer", costLabel: "Agency retainer",
    min: 0, max: 10000, step: 500, def: 2000,
    hint: "HARO helpers from $1,500/mo · boutique SEO from $2,000/mo · mid-market agencies $3,000–$5,000/mo.",
  },
  links: {
    label: "I buy links individually",
    short: "Link-buying spend", costLabel: "Link-buying spend",
    min: 0, max: 10000, step: 200, def: 1200,
    hint: "Typically $300–$800 per link by DR & niche. $1,200/mo ≈ two links a month at $600 each.",
  },
};
const TRAFFIC = { min: 200, max: 50000, step: 200, def: 1500 };
const AOV     = { min: 50,  max: 10000, step: 50,  def: 200  };
interface Tier { id: string; name: string; fee: number; blurb: string }
const TIERS: Tier[] = [
  { id: "sprint", name: "Sprint Cohort",        fee: 2000, blurb: "Four live sessions · cohort format" },
  { id: "accel",  name: "Sprint + Accelerator", fee: 3500, blurb: "Everything + 1-on-1 calls · lifetime access" },
];

// Locked assumptions (shown as badge pills, not adjustable)
const A = { placements: 2, equityPer: 600, cvrFrom: 0.01, cvrTo: 0.05, horizon: 12 };
const LINK_EQUITY_YR = A.placements * A.equityPer * A.horizon; // $14,400

// ── Formatting ────────────────────────────────────────────────────────────────
const fmt = (n: number): string => {
  const neg = n < 0;
  return (neg ? "−$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-US");
};
const fmtK = (n: number): string => {
  const neg = n < 0; const v = Math.abs(n); const s = neg ? "−$" : "$";
  if (v >= 1e6) return s + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (v >= 1e4) return s + Math.round(v / 1e3) + "K";
  if (v >= 1e3) return s + (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return s + Math.round(v);
};
const paybackStr = (fee: number, gain: number): string => {
  if (gain <= 0) return "n/a";
  const mo = fee / gain;
  if (mo < 1)  { const w = Math.max(1, Math.round(mo * 4.345)); return w + (w === 1 ? " week" : " weeks"); }
  if (mo < 12) { const m = Math.max(1, Math.round(mo));          return m + (m === 1 ? " month" : " months"); }
  const y = mo / 12; return (y < 10 ? y.toFixed(1) : Math.round(y)) + " years";
};

// ── Compute ───────────────────────────────────────────────────────────────────
interface CalcState {
  mode: "agency" | "links";
  retainer: number;
  linkSpend: number;
  traffic: number;
  aov: number;
  tier: string;
}
interface CalcResult {
  fee: number; spendMo: number; currentSpendYr: number;
  custNow: number; revNowYr: number; revWithYr: number;
  netWithout: number; netWith: number; netImprovement: number;
  roi: number; monthlyGain: number;
}

// Validated defaults: $180,400 net improvement · 9,020% ROI · 1-week payback
const compute = ({ mode, retainer, linkSpend, traffic, aov, tier }: CalcState): CalcResult => {
  const fee            = TIERS.find(t => t.id === tier)!.fee;
  const spendMo        = mode === "agency" ? retainer : linkSpend;
  const currentSpendYr = spendMo * 12;
  const custNow        = traffic * A.cvrFrom;
  const revNowYr       = custNow * aov * 12;
  const revWithYr      = traffic * A.cvrTo * aov * 12;
  const netWithout     = revNowYr - currentSpendYr;
  const netWith        = revWithYr + LINK_EQUITY_YR - fee;
  const netImprovement = netWith - netWithout;
  const roi            = (netImprovement / fee) * 100;
  const monthlyGain    = netImprovement / 12;
  return { fee, spendMo, currentSpendYr, custNow, revNowYr, revWithYr,
           netWithout, netWith, netImprovement, roi, monthlyGain };
};

// ── Atoms ─────────────────────────────────────────────────────────────────────
interface SliderProps {
  label: string; hint?: string;
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  accent?: string;
}
const Slider = ({ label, hint, min, max, step, value, onChange, format, accent = INK }: SliderProps) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <SCaps size={11.5} ls="0.14em" color={INK}>{label}</SCaps>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: accent, lineHeight: 1, letterSpacing: "-0.01em" }}>
        {format(value)}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="emos-range"
      style={{ width: "100%", marginTop: 12, accentColor: INK }}
    />
    {hint && (
      <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.45, color: INK55 }}>
        {hint}
      </p>
    )}
  </div>
);

const Badge = ({ children, color = AMBER }: { children: React.ReactNode; color?: string }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 7,
    border: `1px solid ${color}`, background: hexA(color, 0.1),
    color: INK, padding: "6px 11px",
    fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.04em",
  }}>
    <span style={{ width: 7, height: 7, background: color, flexShrink: 0 }} />
    {children}
  </span>
);

const Line = ({
  label, value, color = INK, tag, strong,
}: {
  label: string; value: string; color?: string; tag?: string; strong?: boolean;
}) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    gap: 12, padding: "11px 0", borderTop: `1px solid ${INK15}`,
  }}>
    <span style={{ fontFamily: SERIF, fontSize: 15.5, color: INK, display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
      {label}
      {tag && (
        <span style={{
          border: `1px solid ${AMBER}`, color: AMBER, padding: "1px 6px",
          fontFamily: GROT, fontWeight: 800, fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>{tag}</span>
      )}
    </span>
    <span style={{ fontFamily: SERIF, fontWeight: strong ? 700 : 500, fontSize: strong ? 19 : 16, color }}>
      {value}
    </span>
  </div>
);

// ── §00 Hero ──────────────────────────────────────────────────────────────────
// Frames the problem (renting vs. owning) without naming EMOS upfront.
const Hero = () => (
  <section style={{ background: PAPER, padding: "clamp(32px,5vw,52px) clamp(22px,5vw,56px) 26px" }}>
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <SCaps color={INK70} size={12} ls="0.30em">The Authority Cost Calculator · Rent vs. Own</SCaps>
    </div>
    <h1 style={{
      margin: 0, textAlign: "center", fontFamily: SERIF, fontWeight: 700, color: INK,
      lineHeight: 0.95, letterSpacing: "-0.03em",
      fontSize: "clamp(40px, 7vw, 88px)",
    }}>
      Stop <em>renting</em> authority.<br />
      <Mark>Own it.</Mark>
    </h1>
    <p style={{
      margin: "22px auto 0", maxWidth: 760, textAlign: "center",
      fontFamily: SERIF, fontStyle: "italic",
      fontSize: "clamp(17px, 2.4vw, 23px)", color: INK70, lineHeight: 1.4,
    }}>
      Every month you pay an agency or buy links, you&rsquo;re renting credibility.
      The moment you stop paying, the authority stops.
      Enter your numbers to see exactly what that costs — and what you gain by owning it instead.
    </p>
    <DoubleRule style={{ margin: "32px 0 0" }} />
  </section>
);

// ── §01 Inputs ────────────────────────────────────────────────────────────────
const Inputs = ({ st, set }: { st: CalcState; set: (p: Partial<CalcState>) => void }) => {
  const cfg = SPEND[st.mode];
  const c   = compute(st);
  return (
    <section style={{ background: PAPER, padding: "8px clamp(22px,5vw,56px) 0" }}>
      <SectionMast n="01" label="Your numbers · Adjust to your reality" />

      <SCaps size={11} ls="0.16em" color={INK} style={{ display: "block", marginBottom: 10 }}>
        How you currently earn links
      </SCaps>
      {/* spend mode toggle */}
      <div style={{ display: "flex", border: `1.5px solid ${INK}`, maxWidth: 560 }}>
        {(Object.entries(SPEND) as [string, SpendOption][]).map(([key, opt], i) => (
          <button
            key={key}
            onClick={() => set({ mode: key as "agency" | "links" })}
            style={{
              flex: 1, cursor: "pointer", border: "none",
              borderLeft: i ? `1.5px solid ${INK}` : "none",
              background: st.mode === key ? INK : PAPER,
              color: st.mode === key ? PAPER : INK,
              padding: "13px 14px", fontFamily: GROT, fontWeight: 800,
              fontSize: 12, letterSpacing: "0.06em", lineHeight: 1.2,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* sliders + live snapshot */}
      <div className="calc-grid2" style={{ marginTop: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <Slider
            label={cfg.costLabel + " / month"} hint={cfg.hint}
            min={cfg.min} max={cfg.max} step={cfg.step}
            value={st.mode === "agency" ? st.retainer : st.linkSpend}
            onChange={(v) => set(st.mode === "agency" ? { retainer: v } : { linkSpend: v })}
            format={fmt} accent={RED}
          />
          <Slider
            label="All-channel monthly visitors"
            hint="Organic, paid, direct, referral — every channel combined."
            min={TRAFFIC.min} max={TRAFFIC.max} step={TRAFFIC.step}
            value={st.traffic} onChange={(v) => set({ traffic: v })}
            format={(n) => n.toLocaleString("en-US")}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Slider
            label="Average order / deal value"
            min={AOV.min} max={AOV.max} step={AOV.step}
            value={st.aov} onChange={(v) => set({ aov: v })} format={fmt}
          />
          {/* live current-revenue snapshot */}
          <div style={{ border: `1px solid ${INK}`, background: PAPER2 }}>
            <div style={{ padding: "9px 14px", borderBottom: `1px solid ${INK}`, background: PAPER }}>
              <SCaps size={10} ls="0.16em" color={INK70}>Where you stand today</SCaps>
            </div>
            <div className="calc-snap">
              {([
                ["1%",                                         "Conversion rate", "conservative baseline"],
                [Math.round(c.custNow).toLocaleString("en-US"), "Customers / mo",  "traffic × 1%"],
                [fmtK(c.revNowYr),                             "Annual revenue",   "at 1% CVR"],
              ] as [string, string, string][]).map(([big, lab, sub], i) => (
                <div key={lab} style={{ padding: 14, borderLeft: i ? `1px solid ${INK15}` : "none" }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: INK, lineHeight: 1, letterSpacing: "-0.02em" }}>{big}</div>
                  <SCaps size={9.5} ls="0.12em" color={INK} style={{ display: "block", marginTop: 8 }}>{lab}</SCaps>
                  <p style={{ margin: "3px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── §02 Comparison ────────────────────────────────────────────────────────────
const NetBar = ({ label, value, max, color, sub }: {
  label: string; value: number; max: number; color: string; sub: string;
}) => {
  const pct = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <SCaps size={11} ls="0.14em" color={INK}>{label}</SCaps>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color, lineHeight: 1 }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 26, border: `1px solid ${INK}`, background: PAPER, position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0,
          width: `${pct}%`, background: color, transition: "width .3s ease",
        }} />
      </div>
      <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>{sub}</p>
    </div>
  );
};

const Comparison = ({ st }: { st: CalcState }) => {
  const c      = compute(st);
  const cfg    = SPEND[st.mode];
  const maxAbs = Math.max(Math.abs(c.netWith), Math.abs(c.netWithout), 1);
  return (
    <section style={{ background: PAPER, padding: "64px clamp(22px,5vw,56px) 0" }}>
      <SectionMast n="02" label="Renting vs. owning · one-year net position" />

      <div style={{ border: `1.5px solid ${INK}`, background: PAPER2, padding: "20px 24px", marginBottom: 26 }}>
        <NetBar
          label={`Renting authority — keep paying ${cfg.short.toLowerCase()}`}
          value={c.netWithout} max={maxAbs}
          color={c.netWithout < 0 ? RED : INK}
          sub={`${fmtK(c.revNowYr)} revenue − ${fmtK(c.currentSpendYr)} spend, every year you keep renting`}
        />
        <NetBar
          label="Owning the capability — one-time investment"
          value={c.netWith} max={maxAbs}
          color={GREEN}
          sub={`${fmtK(c.revWithYr)} revenue + ${fmtK(LINK_EQUITY_YR)} link equity − one-time fee`}
        />
        <p style={{ margin: "4px 0 0", fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.5 }}>
          The leap is the conversion lift shown working, not asserted:{" "}
          <strong>{fmtK(c.revNowYr)}</strong> today at a 1% rate →{" "}
          <strong>{fmtK(c.revWithYr)}</strong> at 5%, the level editorial trust signals support across every channel.
        </p>
      </div>

      <div className="calc-grid2">
        {/* renting column */}
        <div style={{ border: `1px solid ${INK}`, padding: "4px 22px 18px" }}>
          <div style={{ padding: "16px 0 4px" }}>
            <SCaps size={11} ls="0.16em" color={INK}>Renting authority</SCaps>
            <p style={{ margin: "4px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
              Paying indefinitely — owning nothing
            </p>
          </div>
          <Line label="Revenue from traffic" value={fmt(c.revNowYr)} />
          <Line label={cfg.costLabel}         value={fmt(-c.currentSpendYr)} color={RED} />
          <Line label="Net position / year"   value={fmt(c.netWithout)} color={c.netWithout < 0 ? RED : INK} strong />
        </div>
        {/* owning column */}
        <div style={{ border: `1.5px solid ${INK}`, padding: "4px 22px 18px", background: hexA(GREEN, 0.06) }}>
          <div style={{ padding: "16px 0 4px" }}>
            <SCaps size={11} ls="0.16em" color={GREEN}>Owning the capability</SCaps>
            <p style={{ margin: "4px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
              One investment. Yours permanently.
            </p>
          </div>
          <Line label="Revenue at 5% conversion" value={fmt(c.revWithYr)}          color={GREEN} />
          <Line label={cfg.costLabel}             value="$0"                         color={BLUE}  />
          <Line label="Link equity earned"        value={"+" + fmt(LINK_EQUITY_YR)} color={AMBER} tag="asset, not spend" />
          <Line label="One-time investment"       value={fmt(-c.fee)}               color={RED}   />
          <Line label="Net position / year"       value={fmt(c.netWith)}            color={GREEN} strong />
        </div>
      </div>
    </section>
  );
};

// ── EMOS Reveal ───────────────────────────────────────────────────────────────
// Introduces EMOS AFTER the visitor has seen the rent-vs-own math.
const EMOSReveal = ({ st, set }: { st: CalcState; set: (p: Partial<CalcState>) => void }) => (
  <section style={{ background: PAPER, padding: "48px clamp(22px,5vw,56px) 0" }}>
    <div style={{ border: `2px solid ${INK}`, background: PAPER2, padding: "clamp(22px,4vw,40px) clamp(22px,4vw,40px)" }}>

      {/* headline + rent counter */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ flex: "1 1 380px" }}>
          <SCaps size={12} ls="0.26em" color={GREEN} style={{ display: "block", marginBottom: 12 }}>
            The way out of the rent cycle
          </SCaps>
          <h2 style={{
            margin: 0, fontFamily: SERIF, fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 48px)",
            color: INK, lineHeight: 0.97, letterSpacing: "-0.028em",
          }}>
            EMOS — The Earned<br />Media Operating System
          </h2>
          <p style={{
            margin: "16px 0 0", fontFamily: SERIF,
            fontSize: 18, color: INK70, lineHeight: 1.55, maxWidth: 580,
          }}>
            A <strong>guided implementation system for founders 3–12 months from a raise</strong>.
            Gives you the exact process, journalist contacts, and pitch system used to land
            features in Forbes, HBR, HuffPost, and 50+ publications — in-house, permanently.
            No retainer. No ongoing spend.
          </p>
          <p style={{
            margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic",
            fontSize: 15, color: INK55, lineHeight: 1.4,
          }}>
            Not a course. No agency retainers. No ad spend. No platform dependency.
          </p>
          <div style={{
            marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
            background: hexA(GREEN, 0.1), border: `1px solid ${GREEN}`,
            padding: "8px 14px",
          }}>
            <span style={{ fontFamily: GROT, fontSize: 14 }}>🛡</span>
            <span style={{ fontFamily: SERIF, fontSize: 14, color: INK }}>
              <strong>1 verified placement in 60 days</strong> — or every dollar back.
            </span>
          </div>
        </div>
        {/* rent counter */}
        <div style={{
          flexShrink: 0, border: `1.5px solid ${INK}`,
          background: PAPER, padding: "20px 26px", textAlign: "center", alignSelf: "flex-start",
        }}>
          <SCaps size={10.5} ls="0.18em" color={INK55}>you currently pay</SCaps>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(36px,5vw,48px)",
            color: RED, lineHeight: 1, letterSpacing: "-0.025em", marginTop: 6,
          }}>
            {fmt(compute(st).currentSpendYr)}
          </div>
          <SCaps size={10} ls="0.14em" color={INK55} style={{ display: "block", marginTop: 6 }}>
            per year to rent authority
          </SCaps>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${INK15}` }}>
            <SCaps size={10} ls="0.14em" color={GREEN}>EMOS costs</SCaps>
            <div style={{
              fontFamily: SERIF, fontWeight: 700, fontSize: 28,
              color: GREEN, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 4,
            }}>
              {fmt(TIERS.find(t => t.id === st.tier)!.fee)}
            </div>
            <SCaps size={9.5} ls="0.12em" color={GREEN} style={{ display: "block", marginTop: 4 }}>
              once, total
            </SCaps>
          </div>
        </div>
      </div>

      {/* what you get — three cards */}
      <div style={{ marginBottom: 28 }}>
        <SCaps size={11} ls="0.18em" color={INK} style={{ display: "block", marginBottom: 14 }}>
          What one cohort gives you
        </SCaps>
        <div className="calc-grid3" style={{ border: `1px solid ${INK}`, background: PAPER }}>
          {([
            ["The system",   "The exact 7-step pitch process used to land coverage in tier-one and mid-tier outlets. Yours to run internally, forever, with no agency in the loop."],
            ["The contacts", "A curated journalist database — updated each cohort, sorted by niche and beat. No cold-guessing who to pitch or what they cover."],
            ["Live results", "You earn your first real media placements during the cohort itself. Results before it ends, not months after you've paid and waited."],
          ] as [string, string][]).map(([h, b], i) => (
            <div key={h} style={{
              padding: "20px 22px",
              borderLeft: i ? `1px solid ${INK}` : "none",
              position: "relative",
            }}>
              <div aria-hidden style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 3, background: GREEN, opacity: 0.6,
              }} />
              <SCaps size={11} ls="0.14em" color={GREEN}>{String(i + 1).padStart(2, "0")}</SCaps>
              <h3 style={{
                margin: "8px 0 0", fontFamily: SERIF, fontWeight: 700,
                fontSize: 20, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em",
              }}>{h}</h3>
              <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.5, color: INK70 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* tier selector */}
      <SCaps size={11} ls="0.18em" color={INK} style={{ display: "block", marginBottom: 14 }}>
        Choose your EMOS investment — see your number update below
      </SCaps>
      <div className="calc-grid2">
        {TIERS.map((t) => {
          const on = st.tier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => set({ tier: t.id })}
              style={{
                cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${INK}`,
                background: on ? INK : PAPER,
                color: on ? PAPER : INK,
                padding: "20px 22px",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16,
              }}
            >
              <div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 23, lineHeight: 1.05, letterSpacing: "-0.015em" }}>
                  {t.name}
                </div>
                <div style={{
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, marginTop: 6,
                  color: on ? "rgba(241,235,222,.7)" : INK55,
                }}>{t.blurb}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1, color: on ? YEL : INK }}>
                  {fmt(t.fee)}
                </div>
                <SCaps size={9} ls="0.14em"
                  color={on ? "rgba(241,235,222,.65)" : INK55}
                  style={{ display: "block", marginTop: 6 }}>
                  {on ? "Selected ✓" : "one-time"}
                </SCaps>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

// ── Hero Result + CTA ─────────────────────────────────────────────────────────
const Result = ({ st }: { st: CalcState }) => {
  const c      = compute(st);
  const roiStr = Math.round(c.roi).toLocaleString("en-US") + "%";
  return (
    <section style={{ background: PAPER, padding: "40px clamp(22px,5vw,56px) 8px" }}>
      <div style={{
        border: `1.5px solid ${INK}`, background: INK, color: PAPER,
        padding: "40px 44px", position: "relative", overflow: "hidden",
      }}>
        <div aria-hidden style={{ position: "absolute", top: -40, right: -50, opacity: 0.06, pointerEvents: "none" }}>
          <SiaLogo height={260} />
        </div>
        <div style={{ position: "relative" }}>
          <SCaps size={11.5} ls="0.20em" color={YEL}>Your first-year net improvement with EMOS</SCaps>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, lineHeight: 0.9,
            letterSpacing: "-0.035em", marginTop: 6,
            fontSize: "clamp(54px, 11vw, 104px)",
            color: "#7bbf86",
          }}>
            {fmt(c.netImprovement)}
          </div>
          <p style={{
            margin: "14px 0 0", fontFamily: SERIF, fontStyle: "italic",
            fontSize: 16.5, color: "rgba(241,235,222,.72)", maxWidth: 620, lineHeight: 1.45,
          }}>
            Even a partial lift to 2.5% conversion matches the revenue of doubling your traffic budget —
            this is the conservative full case.
          </p>

          {/* stat cards */}
          <div className="calc-herostats" style={{ marginTop: 30 }}>
            {([
              [roiStr,                           "Return on the EMOS fee"],
              [paybackStr(c.fee, c.monthlyGain), "Payback period"],
              [fmt(c.monthlyGain),               "Average monthly gain"],
            ] as [string, string][]).map(([big, lab]) => (
              <div key={lab} style={{ border: "1px solid rgba(241,235,222,.25)", padding: "18px 20px" }}>
                <div style={{
                  fontFamily: SERIF, fontWeight: 700,
                  fontSize: "clamp(28px,4vw,40px)", color: PAPER,
                  lineHeight: 1, letterSpacing: "-0.02em",
                }}>{big}</div>
                <SCaps size={10} ls="0.14em"
                  color={"rgba(241,235,222,.6)"}
                  style={{ display: "block", marginTop: 9 }}>{lab}</SCaps>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── CTA Block — reused twice (after Result, and after BelowFold) ──────────────
// variant "mid"  — lighter, tied to the number they just saw
// variant "close" — heavier close after all the evidence
const CTABlock = ({ st, variant }: { st: CalcState; variant: "mid" | "close" }) => {
  const c = compute(st);
  const isMid = variant === "mid";
  return (
    <section style={{
      background: isMid ? PAPER2 : GREEN,
      borderTop: `${isMid ? 1 : 4}px solid ${isMid ? INK : YEL}`,
      borderBottom: isMid ? "none" : `6px solid ${PAPER}`,
      padding: "clamp(40px,6vw,72px) clamp(22px,5vw,56px)",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {isMid ? (
          // ── Mid CTA (after result) ──────────────────────────────────────────
          <>
            <SCaps size={11.5} ls="0.22em" color={GREEN} style={{ display: "block", marginBottom: 14 }}>
              Your numbers are ready
            </SCaps>
            <h2 style={{
              margin: 0, fontFamily: SERIF, fontWeight: 700,
              fontSize: "clamp(32px,5vw,60px)",
              color: INK, lineHeight: 0.97, letterSpacing: "-0.028em",
            }}>
              {fmt(c.netImprovement)} says it&rsquo;s time<br />
              <em>to stop renting.</em>
            </h2>
            <p style={{
              margin: "18px 0 32px", fontFamily: SERIF, fontSize: 18,
              color: INK70, lineHeight: 1.55, maxWidth: 620,
            }}>
              That figure is yours — built from your traffic, your spend, your deal value.
              EMOS is the one-time investment that gets you there.
              Cohorts are small and run on a fixed calendar. Apply now to hold your spot.
            </p>
            <a href={EMOS_APPLY} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 18,
              background: INK, color: PAPER, textDecoration: "none",
              padding: "clamp(16px,2vw,22px) clamp(22px,3vw,36px)",
              fontFamily: GROT, fontWeight: 800,
              fontSize: "clamp(13px,1.8vw,17px)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span>Submit Your Application</span>
              <span style={{ fontFamily: SERIF, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 400 }}>→</span>
            </a>
            <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
              5 minutes · Decision within 48 hours · 5 seats per cohort
            </p>
          </>
        ) : (
          // ── Close CTA (after all the evidence) ─────────────────────────────
          <>
            <div style={{ position: "relative" }}>
              <div aria-hidden style={{ position: "absolute", top: -20, right: 0, opacity: 0.08, pointerEvents: "none" }}>
                <SiaLogo height={200} />
              </div>
              <SCaps size={11.5} ls="0.22em" color={YEL} style={{ display: "block", marginBottom: 14 }}>
                Ready to own it?
              </SCaps>
              <h2 style={{
                margin: 0, fontFamily: SERIF, fontWeight: 700,
                fontSize: "clamp(36px,6vw,72px)",
                color: PAPER, lineHeight: 0.95, letterSpacing: "-0.03em",
              }}>
                One cohort.<br />
                <em style={{ color: YEL }}>No retainer.</em><br />
                Yours forever.
              </h2>
              <p style={{
                margin: "22px 0 0", fontFamily: SERIF, fontSize: 19,
                color: "rgba(241,235,222,.85)", lineHeight: 1.55, maxWidth: 600,
              }}>
                The system, the contacts, and the live placements — all in one cohort.
                Alumni have gone on to land Forbes, HBR, HuffPost, and 50+ publications
                without ever paying an agency again.
              </p>
              <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <a href={EMOS_APPLY} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 18,
                  background: YEL, color: INK, textDecoration: "none",
                  padding: "clamp(18px,2.5vw,26px) clamp(26px,4vw,44px)",
                  fontFamily: GROT, fontWeight: 800,
                  fontSize: "clamp(14px,2vw,18px)", letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  <span>Submit Your Application</span>
                  <span style={{ fontFamily: SERIF, fontSize: "clamp(22px,3vw,28px)", fontWeight: 400 }}>→</span>
                </a>
                <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "rgba(241,235,222,.6)" }}>
                  5 minutes · Decision within 48 hours · 5 seats per cohort
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

// ── Below the fold ────────────────────────────────────────────────────────────
// Aligned with the EMOS 5-Return Framework from dmr.agency/earnedmediaos/
const BENEFITS: [string, string][] = [
  ["Investor proof",
   "VCs Google you before the first meeting. A Tier 1 citation answers the credibility question before it's asked — and shapes the conversation before you're in the room."],
  ["SEO authority",
   "A DA 80+ backlink lifts your domain rating; target pages rank higher for the keywords your buyers use. The agency invoice stops; the domain authority stays."],
  ["AI / LLM citations",
   "ChatGPT, Perplexity, and Google AI Overviews cite credible publications. Cited brands surface in AI answers about their space — a channel growing faster than any other."],
  ["Permanent sales collateral",
   "\"As seen in Forbes\" on your homepage, deck, and email signature. Bought once, used indefinitely — in investor materials, sales calls, and conference bios."],
  ["Social signal & referral traffic",
   "Each placement is shareable content for LinkedIn and X, and sends direct visitors for years at zero cost-per-click. The agency invoice never stops; the referral traffic never bills."],
  ["Compounding credentials",
   "Mid-tier placements open tier-one doors. Acceptance rates rise, cost-per-placement falls, and the momentum — the journalist relationships, the byline history — is yours to keep."],
];

const BelowFold = () => (
  <section style={{ background: PAPER, padding: "64px clamp(22px,5vw,56px) 8px" }}>
    <SectionMast n="03" label="Why conversion climbs · 1% → 5%" />
    <p style={{ margin: 0, maxWidth: 880, fontFamily: SERIF, fontSize: "clamp(18px,2.4vw,24px)", lineHeight: 1.45, color: INK }}>
      Blended conversion improves as editorial trust signals compound across every channel —
      not a paid-ad-specific claim.
    </p>
    <div className="calc-grid3" style={{ marginTop: 24, border: `1px solid ${INK}` }}>
      {([
        ["Trust badges",           '"As seen in Forbes" lifts conversion 15–30% (ConversionXL).'],
        ["Higher-intent visitors", "Backlinks build rankings that bring readers already looking to buy."],
        ["Branded search",         "Coverage raises branded searches, which convert 5–10× generic traffic."],
      ] as [string, string][]).map(([h, b], i) => (
        <div key={h} style={{ padding: "20px 22px", borderLeft: i ? `1px solid ${INK15}` : "none" }}>
          <SCaps size={10.5} ls="0.14em" color={INK}>{h}</SCaps>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.45, color: INK70 }}>{b}</p>
        </div>
      ))}
    </div>
    <p style={{ margin: "18px 0 0", maxWidth: 880, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK55 }}>
      Even a partial improvement to 2.5% matches doubling your traffic budget —
      and organic leads cost roughly 50% less per acquisition than paid.
    </p>

    {/* locked assumptions */}
    <div style={{ marginTop: 40 }}>
      <SCaps size={11} ls="0.18em" color={INK} style={{ display: "block", marginBottom: 14 }}>
        The locked assumptions behind every figure
      </SCaps>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Badge>2 linked placements / month — 24 a year</Badge>
        <Badge>$600 link-equity value per placement</Badge>
        <Badge>Conversion 1% → 5%</Badge>
        <Badge>12-month horizon</Badge>
      </div>
    </div>

    {/* benefit cards */}
    <div style={{ marginTop: 48 }}>
      <SectionMast n="04" label="What the calculator can't count · and still counts" />
      <div className="calc-benefits">
        {BENEFITS.map(([h, b], i) => (
          <div key={h} style={{
            padding: "24px 26px",
            borderTop:  i > 1 ? `1px solid ${INK}` : "none",
            borderLeft: i % 2  ? `1px solid ${INK}` : "none",
            position: "relative",
          }}>
            <div aria-hidden style={{
              position: "absolute", left: 0, top: i > 1 ? -1 : 0, bottom: 0,
              width: 4, background: GREEN, opacity: 0.55,
            }} />
            <SCaps size={11} ls="0.14em" color={GREEN}>{String(i + 1).padStart(2, "0")}</SCaps>
            <h3 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.1, letterSpacing: "-0.015em" }}>
              {h}
            </h3>
            <p style={{ margin: "9px 0 0", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.5, color: INK70 }}>{b}</p>
          </div>
        ))}
      </div>
    </div>

    {/* footnote */}
    <div style={{ marginTop: 40, borderTop: `3px solid ${INK}`, paddingTop: 18, maxWidth: 980 }}>
      <SCaps size={10} ls="0.16em" color={INK55}>On the numbers</SCaps>
      <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: INK55 }}>
        The 1% blended conversion baseline is a conservative floor. The 1%→5% range reflects the aggregate
        effect of editorial trust signals across all channels, not a paid-ad-specific figure (paid search
        averages ~7%, Keywords Everywhere 2024 — the organic argument is about cost-per-acquisition, not
        raw conversion rate). $600 per placement reflects conservative mid-market link rates. Sources:
        Nielsen Global Trust in Advertising · ConversionXL CRO research · Keywords Everywhere 2024.
      </p>
    </div>

    <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, paddingBottom: 16 }}>
      <SCaps size={10.5} ls="0.16em" color={INK55}>Syed Irfan Ajmal · www.syedirfanajmal.com</SCaps>
      <SCaps size={10.5} ls="0.16em" color={INK55}>EMOS · The Earned Media Operating System</SCaps>
    </div>
  </section>
);

// ── Page styles (scoped via className) ───────────────────────────────────────
const PAGE_STYLES = `
  .emos-range {
    -webkit-appearance: none; appearance: none;
    height: 4px; background: rgba(26,20,16,0.22); outline: none;
    cursor: pointer; border-radius: 0; display: block;
  }
  .emos-range::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 20px; height: 28px; background: #1a1410; cursor: pointer; border-radius: 0;
  }
  .emos-range::-moz-range-thumb {
    width: 20px; height: 28px; background: #1a1410; cursor: pointer;
    border-radius: 0; border: none;
  }
  .calc-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .calc-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); }
  .calc-herostats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .calc-benefits { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #1a1410; }
  .calc-snap { display: grid; grid-template-columns: 1fr 1fr 1fr; }
  @media (max-width: 820px) {
    .calc-grid2 { grid-template-columns: 1fr; }
    .calc-herostats { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .calc-grid3 { grid-template-columns: 1fr; }
    .calc-herostats { grid-template-columns: 1fr; }
    .calc-benefits { grid-template-columns: 1fr; }
    .calc-snap { grid-template-columns: 1fr 1fr; }
  }
  @media print { .emos-range { display: none; } }
`;

// ── Page defaults & localStorage ─────────────────────────────────────────────
const DEFAULTS: CalcState = {
  mode: "agency", retainer: SPEND.agency.def,
  linkSpend: SPEND.links.def, traffic: TRAFFIC.def,
  aov: AOV.def, tier: "sprint",
};
const STORE_KEY = "sia.emos.roi.v1";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AuthorityCalculatorPage() {
  const [st, setSt] = useState<CalcState>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setSt({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch { /* ignore */ }
  }, [st]);

  const set = (patch: Partial<CalcState>) => setSt(s => ({ ...s, ...patch }));

  return (
    <>
      <style>{PAGE_STYLES}</style>
      <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
        <Hero />
        <Inputs st={st} set={set} />
        <Comparison st={st} />
        <EMOSReveal st={st} set={set} />
        <Result st={st} />
        <CTABlock st={st} variant="mid" />
        <BelowFold />
        <CTABlock st={st} variant="close" />
        <Subscriptions sectionNumber="05" />
        <Colophon />
      </div>
    </>
  );
}
