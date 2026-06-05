"use client";

/**
 * SignalIQ — /tools/signaliq
 * Proactive-PR radar: pick a beat → scan open-data signals → rank opportunities
 * by signal-vs-coverage gap → generate a newsjacking asset pack. Light theme,
 * mirrors the PressIQ / CollabIQ conventions. Working name "SignalIQ" (rename in
 * src/lib/signaliq/config.ts → PRODUCT).
 *
 * Honesty: scores are a lead/whitespace measure, never a prediction. Said so on-page.
 */

import React, { useState } from "react";
import { Subscriptions, ToolFooter, ToolHeader } from "@/components/bureau";
import { DoubleRule, Mark, SCaps, SiaLogo } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";
import { BEATS, EMAIL_SCANS, FREE_SCANS, PRODUCT } from "@/lib/signaliq/config";
import type { AssetPack, BeatId, Opportunity, OppBand, ScanResponse } from "@/lib/signaliq/types";

// ── spot colours ──────────────────────────────────────────────────────────────
const GREEN = "#3e6b45";
const AMBER = "#d99211";
const RED = "#c14a32";
const BLUE = "#2d5393";
const hexA = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const bandColor = (b: OppBand): string =>
  b === "hot" ? GREEN : b === "look" ? BLUE : b === "early" ? AMBER : INK55;

const EMOS_URL = "/emos";
const EMOS_APPLY = "/emos/apply";

// ── small atoms ─────────────────────────────────────────────────────────────────
function ScoreMeter({ score, color, size = 120 }: { score: number; color: string; size?: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, score)) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke={INK15} strokeWidth="7" />
      <circle
        cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="60" y="58" textAnchor="middle" fill={INK} fontFamily="Georgia, serif" fontSize="34" fontWeight="700">{score}</text>
      <text x="60" y="76" textAnchor="middle" fill={INK55} fontFamily="Georgia, serif" fontSize="11">/ 100</text>
    </svg>
  );
}

function GapBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const label = value >= 0.7 ? "Wide" : value >= 0.4 ? "Medium" : "Narrow";
  const c = value >= 0.7 ? GREEN : value >= 0.4 ? AMBER : RED;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <SCaps size={9.5} ls="0.12em" color={INK}>Coverage gap</SCaps>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: c }}>{label}</span>
      </div>
      <div style={{ height: 6, background: PAPER2, border: `1px solid ${INK15}` }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c }} />
      </div>
    </div>
  );
}

function CompBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const c = pct >= 70 ? GREEN : pct >= 40 ? AMBER : RED;
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <SCaps size={9.5} ls="0.1em" color={INK}>{label}</SCaps>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 13, color: c }}>{pct}</span>
      </div>
      <div style={{ height: 6, background: PAPER2, border: `1px solid ${INK15}` }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c }} />
      </div>
    </div>
  );
}

function SourceChips({ opp }: { opp: Opportunity }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {opp.signals.map((s, i) => (
        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: INK70, textDecoration: "none", border: `1px solid ${INK15}`, padding: "3px 7px", background: PAPER }}>
          {s.source} ↗
        </a>
      ))}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────────
export default function SignalIQPage() {
  const [beat, setBeat] = useState<BeatId>("fintech");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);

  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [packing, setPacking] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [pack, setPack] = useState<AssetPack | null>(null);

  const [email, setEmail] = useState("");
  const [emailDone, setEmailDone] = useState(false);

  async function runScan() {
    setScanError(null);
    setScanning(true);
    setScan(null);
    setSelected(null);
    setPack(null);
    try {
      const res = await fetch("/api/signaliq/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beat }),
      });
      const data = await res.json();
      if (!res.ok) setScanError(data.error || "Scan failed.");
      else setScan(data as ScanResponse);
    } catch {
      setScanError("Network error — please try again.");
    } finally {
      setScanning(false);
    }
  }

  async function generatePack(opp: Opportunity) {
    setSelected(opp);
    setPack(null);
    setPackError(null);
    setPacking(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch("/api/signaliq/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: opp, store: true }),
      });
      const data = await res.json();
      if (!res.ok) setPackError(data.error || "Could not generate the pack.");
      else setPack(data as AssetPack);
    } catch {
      setPackError("Network error — please try again.");
    } finally {
      setPacking(false);
    }
  }

  async function unlockEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch { /* non-fatal */ }
    document.cookie = `pp_tier=email; path=/; max-age=${60 * 60 * 24 * 365}`;
    setEmailDone(true);
  }

  return (
    <>
      <style>{PAGE_CSS}</style>
      <ToolHeader toolName={`${PRODUCT} · Story Radar`} />
      <div style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section style={{ padding: "clamp(30px,5vw,52px) clamp(22px,5vw,56px) 18px", textAlign: "center" }}>
          <SCaps color={INK70} size={12} ls="0.28em">{PRODUCT} · Proactive-PR radar</SCaps>
          <h1 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, color: INK, lineHeight: 0.96, letterSpacing: "-0.03em", fontSize: "clamp(36px,6vw,72px)" }}>
            See the story<br /><Mark>before it breaks.</Mark>
          </h1>
          <p style={{ margin: "20px auto 0", maxWidth: 680, fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(16px,2.2vw,22px)", color: INK70, lineHeight: 1.45 }}>
            SignalIQ scans open, primary-source data — filings, research, search and forum surges — and ranks the
            stories rising fastest <em>before the press has caught up</em>. Then it drafts the pitch.
          </p>
          <p style={{ margin: "12px auto 0", maxWidth: 560, fontFamily: SERIF, fontSize: 13.5, color: INK55, lineHeight: 1.5 }}>
            Early signals, not predictions — every opportunity links back to its source.
          </p>
          <DoubleRule style={{ margin: "26px 0 0" }} />
        </section>

        {/* ── Detail + pack (top when an opportunity is selected) ─────────── */}
        {selected && (
          <Detail
            opp={selected}
            pack={pack}
            packing={packing}
            packError={packError}
            onBack={() => { setSelected(null); setPack(null); setPackError(null); }}
            onRetry={() => generatePack(selected)}
            email={email}
            setEmail={setEmail}
            emailDone={emailDone}
            unlockEmail={unlockEmail}
          />
        )}

        {/* ── Radar (beat picker + opportunity cards) ─────────────────────── */}
        {!selected && (
          <section style={{ padding: "8px clamp(22px,5vw,56px) 40px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 18 }}>
              {BEATS.map((b) => {
                const on = b.id === beat;
                return (
                  <button key={b.id} onClick={() => setBeat(b.id)}
                    style={{ cursor: "pointer", padding: "9px 16px", border: `1px solid ${on ? INK : INK15}`, background: on ? INK : PAPER, color: on ? PAPER : INK70, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: "0.04em" }}>
                    {b.label}
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={runScan} disabled={scanning}
                style={{ padding: "15px 30px", border: "none", background: scanning ? INK15 : INK, color: scanning ? INK55 : PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", cursor: scanning ? "wait" : "pointer" }}>
                {scanning ? "Scanning the radar…" : `Scan ${BEATS.find((b) => b.id === beat)?.label} →`}
              </button>
              <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
                {FREE_SCANS} free scans / month · {EMAIL_SCANS} with your email · live open-data sources
              </p>
            </div>

            {scanError && (
              <div style={{ maxWidth: 620, margin: "20px auto 0", padding: "12px 14px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK, textAlign: "center" }}>
                {scanError}
              </div>
            )}

            {scan && scan.notes.length > 0 && (
              <p style={{ maxWidth: 620, margin: "18px auto 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, textAlign: "center" }}>
                {scan.notes.join(" ")}
              </p>
            )}

            {scan && scan.opportunities.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", maxWidth: 1100, margin: "30px auto 12px", flexWrap: "wrap", gap: 8 }}>
                  <SCaps size={11} ls="0.18em" color={INK}>{scan.opportunities.length} opportunities · ranked by signal-vs-coverage</SCaps>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
                    {scan.usage.remaining} scan{scan.usage.remaining === 1 ? "" : "s"} left this month
                  </span>
                </div>
                <div className="px-cards">
                  {scan.opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opp={opp} onGenerate={() => generatePack(opp)} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <ToolFooter />
      </div>
    </>
  );
}

// ── Opportunity card ───────────────────────────────────────────────────────────
function OpportunityCard({ opp, onGenerate }: { opp: Opportunity; onGenerate: () => void }) {
  const c = bandColor(opp.band);
  return (
    <div style={{ border: `1px solid ${INK15}`, background: PAPER2, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", borderBottom: `1px solid ${INK15}` }}>
        <div style={{ flexShrink: 0 }}><ScoreMeter score={opp.score} color={c} size={74} /></div>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: "inline-block", padding: "2px 9px", border: `1px solid ${c}`, color: c, fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
            {opp.bandLabel}
          </span>
          <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.18, color: INK }}>{opp.headline}</h3>
        </div>
      </div>

      <div style={{ padding: "13px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <GapBar value={opp.components.coverageGap} />
        <SourceChips opp={opp} />
        {opp.sensitive && (
          <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: RED, lineHeight: 1.4 }}>
            Sensitive topic — handle with care. Not for opportunistic newsjacking.
          </p>
        )}
      </div>

      <button onClick={onGenerate}
        style={{ margin: "0 16px 16px", padding: "11px 14px", border: "none", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
        Generate asset pack →
      </button>
    </div>
  );
}

// ── Detail + asset pack ────────────────────────────────────────────────────────
function Detail({
  opp, pack, packing, packError, onBack, onRetry, email, setEmail, emailDone, unlockEmail,
}: {
  opp: Opportunity;
  pack: AssetPack | null;
  packing: boolean;
  packError: string | null;
  onBack: () => void;
  onRetry: () => void;
  email: string;
  setEmail: (v: string) => void;
  emailDone: boolean;
  unlockEmail: (e: React.FormEvent) => void;
}) {
  const c = bandColor(opp.band);
  return (
    <section style={{ padding: "10px clamp(22px,5vw,56px) 32px" }}>
      <button onClick={onBack} className="px-link" style={{ marginBottom: 16 }}>← Back to the radar</button>

      {/* opportunity header */}
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", gap: "clamp(16px,3vw,32px)", flexWrap: "wrap", alignItems: "center" }}>
        <ScoreMeter score={opp.score} color={c} />
        <div style={{ flex: 1, minWidth: 260 }}>
          <span style={{ display: "inline-block", padding: "3px 11px", border: `1px solid ${c}`, color: c, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
            {opp.bandLabel} · {opp.beat}
          </span>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3.6vw,38px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }}>{opp.headline}</h2>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55, lineHeight: 1.4 }}>
            A lead/whitespace score — how far ahead of the coverage you are. Not a prediction the story breaks.
          </p>
        </div>
      </div>

      {/* score breakdown + receipts */}
      <div className="px-detail-grid" style={{ maxWidth: 880, margin: "22px auto 0" }}>
        <div style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "16px 18px" }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>Why SignalIQ flagged this</SCaps>
          <div style={{ marginTop: 12 }}>
            <CompBar label="Magnitude" value={opp.components.magnitude} />
            <CompBar label="Velocity" value={opp.components.velocity} />
            <CompBar label="Coverage gap" value={opp.components.coverageGap} />
            <CompBar label="Beat fit" value={opp.components.fit} />
            <CompBar label="Corroboration" value={opp.components.corroboration} />
          </div>
        </div>
        <div style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "16px 18px" }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>The receipts</SCaps>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 11 }}>
            {opp.signals.map((s, i) => (
              <div key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 14.5, color: INK, textDecoration: "underline", textDecorationColor: INK35, lineHeight: 1.35 }}>
                  {s.title} ↗
                </a>
                {s.detail && <div style={{ fontFamily: GROT, fontSize: 10.5, letterSpacing: "0.04em", color: INK55, marginTop: 2 }}>{s.source.toUpperCase()} · {s.detail}</div>}
              </div>
            ))}
            {opp.coverage && (
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, paddingTop: 6, borderTop: `1px solid ${INK15}` }}>
                Press coverage so far: {Math.round(opp.coverage.volume * 100)}% of saturation (GDELT).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* pack */}
      <div style={{ maxWidth: 880, margin: "26px auto 0" }}>
        {packing && (
          <div style={{ padding: "30px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }}>
            Building your asset pack — brief, pitch angle, and reporter desks…
          </div>
        )}
        {packError && !packing && (
          <div style={{ padding: "16px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK, textAlign: "center" }}>
            {packError} <button onClick={onRetry} className="px-link" style={{ marginLeft: 8 }}>Retry →</button>
          </div>
        )}
        {pack && !packing && (
          <PackView pack={pack} email={email} setEmail={setEmail} emailDone={emailDone} unlockEmail={unlockEmail} />
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <Subscriptions sectionNumber="—" />
      </div>
    </section>
  );
}

// ── Asset pack view ────────────────────────────────────────────────────────────
function PackView({
  pack, email, setEmail, emailDone, unlockEmail,
}: {
  pack: AssetPack;
  email: string;
  setEmail: (v: string) => void;
  emailDone: boolean;
  unlockEmail: (e: React.FormEvent) => void;
}) {
  const copy = (text: string) => { try { navigator.clipboard?.writeText(text); } catch { /* noop */ } };
  const briefParas = pack.brief.split(/\n{2,}/).filter(Boolean);

  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.1, color: INK }}>{pack.headline}</h3>
      <SCaps size={10} ls="0.16em" color={INK55}>Your asset pack</SCaps>

      {/* brief */}
      <div style={{ marginTop: 18, padding: "18px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <SCaps size={10.5} ls="0.16em" color={INK}>Data brief</SCaps>
        {briefParas.map((p, i) => (
          <p key={i} style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: INK70 }}>{p}</p>
        ))}
      </div>

      {/* pitch angle */}
      <div style={{ marginTop: 16, padding: "18px 20px", border: `1px solid ${INK}`, background: PAPER }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>Pitch angle</SCaps>
          <button onClick={() => copy(pack.angle)} className="px-link">Copy</button>
        </div>
        <p style={{ margin: "6px 0 0", fontFamily: GROT, fontSize: 11, letterSpacing: "0.03em", color: INK55 }}>Subject: {pack.subjectLine}</p>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: INK, whiteSpace: "pre-wrap" }}>{pack.angle}</p>
        <a href="/tools/pressiq" style={{ display: "inline-block", marginTop: 12, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: INK, textDecoration: "underline", textDecorationColor: INK35 }}>
          Score this pitch in PressIQ →
        </a>
      </div>

      {/* linkable asset idea */}
      <div style={{ marginTop: 16, padding: "16px 20px", borderLeft: `3px solid ${YEL}`, background: hexA(YEL, 0.08) }}>
        <SCaps size={10.5} ls="0.16em" color={INK}>Linkable asset to build</SCaps>
        <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK }}>{pack.linkableAssetIdea}</p>
      </div>

      {/* signal chart */}
      {pack.chart && (
        <div style={{ marginTop: 16, padding: "16px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>{pack.chart.title}</SCaps>
          <div style={{ marginTop: 12 }}>
            {pack.chart.points.map((pt, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: GROT, fontSize: 10.5, letterSpacing: "0.04em", color: INK70 }}>{pt.x}</span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 12.5, color: INK }}>{pt.y}</span>
                </div>
                <div style={{ height: 7, background: PAPER, border: `1px solid ${INK15}` }}>
                  <div style={{ height: "100%", width: `${pt.y}%`, background: BLUE }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>{pack.chart.caption}</p>
        </div>
      )}

      {/* journalist desks */}
      {pack.journalists.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>Who to pitch</SCaps>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {pack.journalists.map((j, i) => (
              <div key={i} style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "12px 14px" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14.5, color: INK }}>{j.name}</div>
                <div style={{ fontFamily: GROT, fontSize: 10.5, letterSpacing: "0.04em", color: INK55, margin: "2px 0 6px" }}>{j.outlet} · {j.beat}</div>
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.45, color: INK70 }}>{j.why}</p>
              </div>
            ))}
          </div>
          <a href="/tools/journocollabiq" style={{ display: "inline-block", marginTop: 12, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: INK, textDecoration: "underline", textDecorationColor: INK35 }}>
            Find the actual reporters in JournoCollabIQ →
          </a>
        </div>
      )}

      {/* cautions */}
      {pack.cautions.length > 0 && (
        <div style={{ marginTop: 16, padding: "14px 18px", border: `1px solid ${AMBER}`, background: hexA(AMBER, 0.08) }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>Before you pitch — verify</SCaps>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {pack.cautions.map((c, i) => (
              <li key={i} style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, marginBottom: 4 }}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* sources */}
      <div style={{ marginTop: 16 }}>
        <SCaps size={10} ls="0.16em" color={INK55}>Sources</SCaps>
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          {pack.sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 13, color: INK70, textDecoration: "underline", textDecorationColor: INK35 }}>{s.label} ↗</a>
          ))}
        </div>
      </div>

      {/* email unlock */}
      {!emailDone ? (
        <form onSubmit={unlockEmail} style={{ marginTop: 22, padding: "18px 20px", border: `1px solid ${INK}`, background: PAPER2 }}>
          <SCaps size={10.5} ls="0.16em" color={INK}>Unlock more scans & packs</SCaps>
          <p style={{ margin: "6px 0 12px", fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.5 }}>
            Add your email for {EMAIL_SCANS} scans/month and SIA&rsquo;s earned-media playbooks. One list, unsubscribe anytime.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={{ flex: 1, minWidth: 200, background: PAPER, border: `1px solid ${INK}`, color: INK, fontFamily: SERIF, fontSize: 15, padding: "11px 13px", outline: "none" }} />
            <button type="submit" style={{ padding: "11px 20px", border: "none", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Unlock →</button>
          </div>
        </form>
      ) : (
        <div style={{ marginTop: 22, padding: "14px 20px", border: `1px solid ${GREEN}`, background: hexA(GREEN, 0.06), fontFamily: SERIF, fontSize: 14.5, color: INK }}>
          ✓ Unlocked — {EMAIL_SCANS} scans a month. Check your inbox.
        </div>
      )}

      {/* EMOS CTA */}
      <div style={{ marginTop: 24, background: INK, color: PAPER, padding: "clamp(22px,4vw,38px)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", top: -30, right: -40, opacity: 0.06 }}><SiaLogo height={200} /></div>
        <div style={{ position: "relative" }}>
          <SCaps size={11} ls="0.2em" color={YEL}>Where this fits</SCaps>
          <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px,3.2vw,34px)", lineHeight: 1.06, color: PAPER }}>
            SignalIQ finds the story.<br /><span style={{ fontStyle: "italic", color: YEL }}>EMOS</span> turns it into coverage.
          </h3>
          <p style={{ margin: "14px 0 22px", fontFamily: SERIF, fontSize: 16, color: "rgba(250,250,250,.72)", lineHeight: 1.55, maxWidth: 560 }}>
            SignalIQ powers two of the three EMOS pillars — <strong style={{ color: PAPER }}>Linkable Assets</strong> and{" "}
            <strong style={{ color: PAPER }}>Proactive PR</strong>. The full Earned Media Operating System gives your
            team the playbooks, journalist system, and guarantee to earn coverage in-house.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={EMOS_APPLY} style={{ display: "inline-flex", alignItems: "center", gap: 12, background: YEL, color: INK, textDecoration: "none", padding: "14px 24px", fontFamily: GROT, fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Apply to EMOS <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400 }}>↗</span>
            </a>
            <a href={EMOS_URL} style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid rgba(250,250,250,.3)", color: PAPER, textDecoration: "none", padding: "14px 22px", fontFamily: GROT, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Explore EMOS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── scoped CSS ───────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  .px-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; max-width: 1100px; margin: 0 auto; }
  .px-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .px-link { background: none; border: none; cursor: pointer; font-family: ${GROT}; font-weight: 700; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: ${INK}; }
  input:focus { border-color: ${YEL} !important; box-shadow: 0 0 0 2px ${hexA(YEL, 0.25)}; }
  @media (max-width: 720px) { .px-detail-grid { grid-template-columns: 1fr; } }
`;
