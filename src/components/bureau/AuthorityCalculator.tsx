"use client";

import { useState, useEffect, useRef } from "react";

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  INK: "#1a1410",
  INK70: "rgba(26,20,16,.70)",
  INK55: "rgba(26,20,16,.55)",
  INK35: "rgba(26,20,16,.32)",
  INK15: "rgba(26,20,16,.15)",
  PAPER: "#f1ebde",
  PAP2: "#e8e0cc",
  YEL: "#f5b81f",
  GREEN: "#3e6b45",
  RED: "#c14a32",
  SERIF: "var(--font-serif)",
  GROT: "var(--font-grot)",
  MONO: "var(--font-mono)",
};

// ── Constants ─────────────────────────────────────────────────────────────────
const A_LOCKED = { placements: 2, equityPer: 600, cvrFrom: 0.01, cvrTo: 0.05, horizon: 12 };
const LINK_EQ_YR = A_LOCKED.placements * A_LOCKED.equityPer * A_LOCKED.horizon; // $14,400

const CALC_MODES: Record<string, { label: string; short: string; min: number; max: number; step: number; def: number; hint: string }> = {
  agency: { label: "Monthly agency retainer", short: "Agency spend", min: 0, max: 10000, step: 500, def: 2000,
            hint: "Boutique SEO from $2K/mo · mid-market agencies $3K to $5K/mo · link-building add-ons $1K to $3K/mo." },
  links:  { label: "Link-buying spend / month", short: "Link spend", min: 0, max: 10000, step: 200, def: 1200,
            hint: "Typically $300 to $800 per link by DR and niche. $1,200/mo works out to roughly two links per month at $600 each." },
};

const CALC_TIERS = [
  { id: "foundation", name: "Foundation", fee: 2000, sub: "4 weeks · 1 placement in 60 days" },
  { id: "accelerate", name: "Accelerate", fee: 3500, sub: "8 weeks · 2 placements · done-with-you" },
];

// ── Compute ───────────────────────────────────────────────────────────────────
function calcCompute(mode: string, spend: number, traffic: number, aov: number, tierId: string) {
  const fee = CALC_TIERS.find(t => t.id === tierId)!.fee;
  const spendYr = spend * 12;
  const revNow = traffic * A_LOCKED.cvrFrom * aov * 12;
  const revWith = traffic * A_LOCKED.cvrTo * aov * 12;
  const netRent = revNow - spendYr;
  const netOwn = revWith + LINK_EQ_YR - fee;
  const diff = netOwn - netRent;
  const roi = fee > 0 ? (diff / fee) * 100 : 0;
  const moGain = diff / 12;
  return { fee, spendYr, revNow, revWith, netRent, netOwn, diff, roi, moGain };
}

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtUSD(n: number) {
  const neg = n < 0;
  return (neg ? "−$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-US");
}
function fmtUSDk(n: number) {
  const neg = n < 0; const v = Math.abs(n); const s = neg ? "−$" : "$";
  if (v >= 1e6) return s + (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1e4) return s + Math.round(v / 1e3) + "K";
  return s + Math.round(v).toLocaleString("en-US");
}
function fmtPayback(fee: number, moGain: number) {
  if (moGain <= 0) return "n/a";
  const mo = fee / moGain;
  if (mo < 1) { const w = Math.max(1, Math.round(mo * 4.345)); return w + (w === 1 ? " wk" : " wks"); }
  if (mo < 12) { const m = Math.max(1, Math.round(mo)); return m + (m === 1 ? " mo" : " mos"); }
  return (mo / 12).toFixed(1) + " yrs";
}

// ── Slider ────────────────────────────────────────────────────────────────────
function CalcSlider({ label, hint, min, max, step, value, onChange, fmtFn, accent }: {
  label: string; hint?: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; fmtFn: (v: number) => string; accent?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: C.INK55 }}>{label}</span>
        <span style={{ fontFamily: C.SERIF, fontWeight: 700, fontSize: 26, color: accent || C.INK, lineHeight: 1, letterSpacing: "-0.015em" }}>{fmtFn(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", cursor: "pointer", accentColor: C.INK }} />
      {hint && <p style={{ margin: "6px 0 0", fontFamily: C.SERIF, fontStyle: "italic", fontSize: 13, color: C.INK55, lineHeight: 1.4 }}>{hint}</p>}
    </div>
  );
}

// ── Bar ───────────────────────────────────────────────────────────────────────
function CalcBar({ label, sublabel, value, barMax, color }: {
  label: string; sublabel: string; value: number; barMax: number; color: string;
}) {
  const pct = barMax > 0 ? Math.min(100, (Math.abs(value) / barMax) * 100) : 0;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, gap: 12 }}>
        <span style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.INK55, lineHeight: 1.3 }}>{label}</span>
        <span style={{ fontFamily: C.SERIF, fontWeight: 700, fontSize: 22, color, lineHeight: 1, flexShrink: 0 }}>{fmtUSD(value)}</span>
      </div>
      <div style={{ height: 26, border: `1px solid ${C.INK}`, background: C.PAPER, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${pct}%`, background: color, opacity: 0.82, transition: "width .35s ease" }} />
      </div>
      <p style={{ margin: "5px 0 0", fontFamily: C.SERIF, fontStyle: "italic", fontSize: 12, color: C.INK55 }}>{sublabel}</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AuthorityCalculator() {
  const [mode, setMode] = useState("agency");
  const [spend, setSpend] = useState(2000);
  const [traffic, setTraffic] = useState(1500);
  const [aov, setAov] = useState(200);
  const [tier, setTier] = useState("foundation");

  // Persist
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("emos.calc.v1") || "null");
      if (s) { setMode(s.mode || "agency"); setSpend(s.spend || 2000); setTraffic(s.traffic || 1500); setAov(s.aov || 200); setTier(s.tier || "foundation"); }
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem("emos.calc.v1", JSON.stringify({ mode, spend, traffic, aov, tier })); } catch { /* noop */ }
  }, [mode, spend, traffic, aov, tier]);

  // Reset spend to mode default on mode change
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== mode) { setSpend(CALC_MODES[mode].def); prevMode.current = mode; }
  }, [mode]);

  const c = calcCompute(mode, spend, traffic, aov, tier);
  const barMax = Math.max(Math.abs(c.netOwn), Math.abs(c.netRent), 1);
  const cfg = CALC_MODES[mode];

  return (
    <div className="emos-calc" style={{ fontFamily: C.SERIF, color: C.INK }}>

      {/* ── 2-col layout ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

        {/* LEFT: all inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Mode toggle */}
          <div>
            <span style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: C.INK55, display: "block", marginBottom: 8 }}>Compare against</span>
            <div style={{ display: "flex", border: `1.5px solid ${C.INK}` }}>
              {Object.entries(CALC_MODES).map(([key, opt], i) => (
                <button key={key} onClick={() => setMode(key)} style={{
                  flex: 1, cursor: "pointer", border: "none",
                  borderLeft: i ? `1.5px solid ${C.INK}` : "none",
                  background: mode === key ? C.INK : C.PAPER,
                  color: mode === key ? C.PAPER : C.INK,
                  padding: "11px 14px",
                  fontFamily: C.GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.10em", lineHeight: 1.3, textAlign: "left",
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <CalcSlider label={cfg.label} hint={cfg.hint}
            min={cfg.min} max={cfg.max} step={cfg.step}
            value={spend} onChange={setSpend} fmtFn={fmtUSD} accent={C.RED} />

          <CalcSlider label="Monthly visitors (all channels)"
            hint="Organic, paid, direct and referral combined."
            min={200} max={50000} step={200}
            value={traffic} onChange={setTraffic} fmtFn={(v: number) => v.toLocaleString("en-US")} />

          <CalcSlider label="Average order / deal value"
            min={50} max={10000} step={50}
            value={aov} onChange={setAov} fmtFn={fmtUSD} />

          {/* Tier selector */}
          <div>
            <span style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: C.INK55, display: "block", marginBottom: 10 }}>Your track</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${C.INK}` }}>
              {CALC_TIERS.map((t, i) => (
                <button key={t.id} onClick={() => setTier(t.id)} style={{
                  cursor: "pointer", textAlign: "left", border: "none",
                  borderLeft: i ? `1px solid ${C.INK}` : "none",
                  background: tier === t.id ? C.INK : C.PAPER,
                  color: tier === t.id ? C.PAPER : C.INK,
                  padding: "14px 16px",
                }}>
                  <div style={{ fontFamily: C.SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{t.name}</div>
                  <div style={{ fontFamily: C.SERIF, fontWeight: 700, fontSize: 26, color: tier === t.id ? C.YEL : C.INK, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 6 }}>{fmtUSD(t.fee)}</div>
                  <div style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: tier === t.id ? "rgba(241,235,222,.55)" : C.INK55, marginTop: 6 }}>
                    {t.sub}{tier === t.id ? " · selected ✓" : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: all outputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Snapshot: where you stand today */}
          <div style={{ border: `1px solid ${C.INK}` }}>
            <div style={{ padding: "9px 16px", borderBottom: `1px solid ${C.INK}`, background: C.PAPER }}>
              <span style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: C.INK55 }}>Where you stand today</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", background: C.PAP2 }}>
              {([
                ["1%", "Baseline CVR", "conservative floor"],
                [Math.round(traffic * 0.01).toLocaleString() + "/mo", "Customers", "traffic × 1%"],
                [fmtUSDk(c.revNow), "Annual rev", "at 1% CVR"],
              ] as const).map(([big, label, sub], i) => (
                <div key={label} style={{ padding: "14px 16px", borderLeft: i ? `1px solid ${C.INK15}` : "none" }}>
                  <div style={{ fontFamily: C.SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1, letterSpacing: "-0.01em" }}>{big}</div>
                  <div style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: C.INK55, marginTop: 6 }}>{label}</div>
                  <p style={{ margin: "3px 0 0", fontFamily: C.SERIF, fontStyle: "italic", fontSize: 12, color: C.INK55 }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison bars */}
          <div>
            <span style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.20em", textTransform: "uppercase", color: C.INK55, display: "block", marginBottom: 18 }}>12-month net position</span>
            <CalcBar label={`Renting · ${cfg.short}`}
              sublabel={`${fmtUSDk(c.revNow)} revenue − ${fmtUSDk(c.spendYr)} annual ${cfg.short.toLowerCase()}`}
              value={c.netRent} barMax={barMax} color={c.netRent < 0 ? C.RED : C.INK} />
            <CalcBar label="Owning · EMOS (one-time)"
              sublabel={`${fmtUSDk(c.revWith)} revenue + ${fmtUSDk(LINK_EQ_YR)} link equity − one-time fee`}
              value={c.netOwn} barMax={barMax} color={C.GREEN} />
          </div>

          {/* Result card (dark) */}
          <div style={{ background: C.INK, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -10, bottom: -20, fontFamily: C.SERIF, fontWeight: 700, fontSize: 110, lineHeight: 1, letterSpacing: "-0.04em", color: "rgba(241,235,222,.04)", userSelect: "none", pointerEvents: "none" }}>ROI</div>
            <span style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(241,235,222,.50)", display: "block", marginBottom: 6 }}>Your 12-month net improvement</span>
            <div style={{ fontFamily: C.MONO, fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: "-0.025em", color: c.diff >= 0 ? "#7bbf86" : C.RED, marginBottom: 20 }}>
              {fmtUSD(c.diff)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid rgba(241,235,222,.15)" }}>
              {([
                [Math.round(c.roi).toLocaleString() + "%", "ROI on fee"],
                [fmtPayback(c.fee, c.moGain), "Payback"],
                [fmtUSDk(c.moGain) + "/mo", "Monthly gain"],
              ] as const).map(([big, lab], i) => (
                <div key={lab} style={{ padding: "12px 14px", borderRight: i < 2 ? "1px solid rgba(241,235,222,.15)" : "none" }}>
                  <div style={{ fontFamily: C.MONO, fontWeight: 700, fontSize: 20, color: "#f1ebde", lineHeight: 1 }}>{big}</div>
                  <div style={{ fontFamily: C.GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(241,235,222,.50)", marginTop: 7 }}>{lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <a href="/emos/apply/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: C.YEL, color: C.INK, fontFamily: C.GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", padding: "16px 28px", textDecoration: "none" }}>
              Submit Your Application →
            </a>
            <p style={{ margin: "8px 0 0", fontFamily: C.SERIF, fontStyle: "italic", fontSize: 13, color: C.INK55, textAlign: "center" }}>5 minutes · Decision within 48 hours</p>
          </div>

          {/* Locked assumptions */}
          <p style={{ margin: 0, fontFamily: C.SERIF, fontSize: 13, lineHeight: 1.55, color: C.INK55, borderTop: `1px solid ${C.INK15}`, paddingTop: 16 }}>
            Locked assumptions: 2 earned placements per month, $600 link-equity value each, conversion lifts 1% to 5%, 12-month horizon. Financial ROI only: does not count investor credibility, LLM citations, or sales collateral.
          </p>

        </div>
      </div>
    </div>
  );
}
