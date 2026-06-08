"use client";

/**
 * SignalIQ Platform — full authenticated scan interface
 *
 * Layout:
 *   ① Beat picker + Scan button (calls /api/emostool/signaliq/scan)
 *   ② Results grid — each card has "Save to EMOS →" button
 *   ③ Saved signals library (server-rendered initial, refreshes after save)
 */

import React, { useState, useTransition } from "react";
import { BEATS } from "@/lib/signaliq/config";
import { saveSignalFromScan, updateSignalStatus } from "@/app/emostool/actions/signaliq";
import type { BeatId, Opportunity, ScanResponse, OppBand } from "@/lib/signaliq/types";
import type { DbSignal } from "@/app/emostool/actions/signaliq";

// ── design tokens ──────────────────────────────────────────────────────────────
const PAPER   = "#f1ebde";
const PAPER2  = "#e8e0cc";
const INK     = "#1a1410";
const INK70   = "rgba(26,20,16,.70)";
const INK55   = "rgba(26,20,16,.55)";
const INK35   = "rgba(26,20,16,.32)";
const INK15   = "rgba(26,20,16,.15)";
const YEL     = "#f5b81f";
const GREEN   = "#3e6b45";
const AMBER   = "#d99211";
const RED     = "#c14a32";
const GROT    = "var(--font-grot)";
const SERIF   = "var(--font-serif)";
const MONO    = "var(--font-mono)";

// ── helpers ────────────────────────────────────────────────────────────────────
const bandColor = (b: OppBand) =>
  b === "hot" ? GREEN : b === "look" ? "#2d5393" : b === "early" ? AMBER : INK55;

const bandColorLight = (b: OppBand) =>
  b === "hot" ? "#6ecf7a" : b === "look" ? "#7ea8e8" : b === "early" ? "#f0c05a" : "rgba(241,235,222,.4)";

const BAND_LABEL: Record<OppBand, string> = {
  hot: "Hot lead", look: "Worth a look", early: "Early signal", noise: "Noise",
};

function fmt(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

const SRC_LABEL: Record<string, string> = {
  gdelt: "GDELT", hackernews: "Hacker News", sec: "SEC EDGAR",
  wikipedia: "Wikipedia", arxiv: "arXiv",
};

// ── sub-components ─────────────────────────────────────────────────────────────

function GapBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const label = value >= 0.7 ? "Wide" : value >= 0.4 ? "Medium" : "Narrow";
  const c = value >= 0.7 ? GREEN : value >= 0.4 ? AMBER : RED;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: INK }}>Coverage gap</span>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, color: c }}>{label}</span>
      </div>
      <div style={{ height: 5, background: "rgba(26,20,16,.08)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c }} />
      </div>
    </div>
  );
}

// ── Scan result card ───────────────────────────────────────────────────────────

function ScanCard({
  opp,
  beatLabel,
  savedIds,
  onSaved,
}: {
  opp: Opportunity;
  beatLabel: string;
  savedIds: Set<string>;
  onSaved: (oppId: string, dbId: string) => void;
}) {
  const [saving, startSave] = useTransition();
  const alreadySaved = savedIds.has(opp.id);
  const c = bandColor(opp.band);
  const cLight = bandColorLight(opp.band);

  function handleSave() {
    startSave(async () => {
      const result = await saveSignalFromScan(opp, beatLabel);
      if (result.ok && result.id) {
        onSaved(opp.id, result.id);
      }
    });
  }

  return (
    <div style={{ border: `1px solid ${INK15}`, display: "flex", flexDirection: "column" }}>
      {/* Header strip */}
      <div style={{ background: INK, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{
          fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em",
          textTransform: "uppercase",
          color: cLight,
          border: `1px solid rgba(${cLight},0.4)`,
          background: "rgba(255,255,255,0.06)",
          padding: "2px 7px",
        }}>
          {BAND_LABEL[opp.band]}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: PAPER, letterSpacing: "-0.02em" }}>{opp.score}</span>
          <span style={{ fontFamily: SERIF, fontSize: 11, color: "rgba(241,235,222,.45)" }}>/ 100</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ background: PAPER2, padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: INK }}>
          {opp.headline}
        </h3>
        <GapBar value={opp.components.coverageGap} />

        {/* Source chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {opp.signals.map((s, i) => (
            s.source === "sec" ? (
              <span key={i} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, border: `1px solid ${INK15}`, padding: "2px 6px", background: PAPER }}>
                SEC EDGAR
              </span>
            ) : (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, border: `1px solid ${INK15}`, padding: "2px 6px", background: PAPER, textDecoration: "none" }}>
                {SRC_LABEL[s.source] ?? s.source.toUpperCase()} ↗
              </a>
            )
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || alreadySaved}
        style={{
          margin: "0 14px 14px",
          padding: "11px 14px",
          border: "none",
          background: alreadySaved ? PAPER2 : YEL,
          color: alreadySaved ? INK55 : INK,
          fontFamily: GROT,
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: ".10em",
          textTransform: "uppercase",
          cursor: alreadySaved ? "default" : saving ? "wait" : "pointer",
          borderTop: `1px solid ${INK15}`,
          transition: "opacity 0.12s ease",
        }}
      >
        {saving ? "Saving…" : alreadySaved ? "✓ Saved to EMOS" : "Save to EMOS →"}
      </button>
    </div>
  );
}

// ── Signal library (saved signals) ────────────────────────────────────────────

const STATUS_STYLE: Record<DbSignal["status"], { bg: string; fg: string; label: string }> = {
  new:      { bg: YEL,           fg: INK,   label: "New" },
  saved:    { bg: INK,           fg: PAPER, label: "Saved" },
  pitched:  { bg: "transparent", fg: INK,   label: "Pitched" },
  archived: { bg: PAPER2,        fg: INK55, label: "Archived" },
};

function SignalLibrary({
  signals,
  refreshKey,
}: {
  signals: DbSignal[];
  refreshKey: number;
}) {
  void refreshKey; // used by parent to force re-render cue (actual refresh via revalidatePath)

  if (signals.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55 }}>
          No signals saved yet. Run a scan and save your first opportunity above.
        </p>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 100px 90px", background: INK, color: PAPER }}>
        {["Signal / Headline", "Beat", "Score", "Gap", "Detected", "Status"].map((h, i) => (
          <div key={h} style={{ padding: "10px 13px", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", borderRight: i < 5 ? "1px solid rgba(241,235,222,.12)" : "none" }}>
            {h}
          </div>
        ))}
      </div>

      {signals.map((sig, idx) => {
        const ss = STATUS_STYLE[sig.status];
        const scorePct = Math.min(sig.signal_score ?? 0, 100);
        const gapPct = Math.min((sig.coverage_gap ?? 0) * 100, 100);
        const scoreColor = scorePct >= 70 ? YEL : scorePct >= 45 ? INK55 : "rgba(26,20,16,.25)";
        const gapColor = gapPct >= 70 ? GREEN : gapPct >= 40 ? AMBER : RED;

        return (
          <div key={sig.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 100px 90px", borderBottom: idx < signals.length - 1 ? `1px solid ${INK15}` : "none" }}>
            {/* Headline */}
            <div style={{ padding: "13px 14px" }}>
              <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: INK }}>{sig.headline}</div>
              {sig.summary && (
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55, marginTop: 3, lineHeight: 1.4 }}>
                  {sig.summary.length > 120 ? sig.summary.slice(0, 120) + "…" : sig.summary}
                </div>
              )}
            </div>
            {/* Beat */}
            <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: INK55, textTransform: "uppercase" }}>
                {sig.beat_name ?? "—"}
              </span>
            </div>
            {/* Score */}
            <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
              {sig.signal_score != null ? (
                <div style={{ width: "100%" }}>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{sig.signal_score}</div>
                  <div style={{ height: 3, background: "rgba(26,20,16,.08)" }}>
                    <div style={{ height: "100%", width: `${scorePct}%`, background: scoreColor }} />
                  </div>
                </div>
              ) : <span style={{ fontFamily: MONO, fontSize: 12, color: INK35 }}>—</span>}
            </div>
            {/* Gap */}
            <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
              {sig.coverage_gap != null ? (
                <div style={{ width: "100%" }}>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{Math.round(sig.coverage_gap * 100)}</div>
                  <div style={{ height: 3, background: "rgba(26,20,16,.08)" }}>
                    <div style={{ height: "100%", width: `${gapPct}%`, background: gapColor }} />
                  </div>
                </div>
              ) : <span style={{ fontFamily: MONO, fontSize: 12, color: INK35 }}>—</span>}
            </div>
            {/* Detected */}
            <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".06em", color: INK55 }}>{fmt(sig.detected_at)}</span>
            </div>
            {/* Status + actions */}
            <div style={{ padding: "10px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <span style={{
                display: "inline-block", padding: "3px 8px 4px",
                background: ss.bg, color: ss.fg,
                border: ss.bg === "transparent" ? `1px solid ${INK35}` : "none",
                fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase",
              }}>
                {ss.label}
              </span>
              {/* Build asset CTA */}
              <a
                href={`/emostool/dashboard/assetiq?signal=${sig.id}`}
                style={{
                  fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em",
                  textTransform: "uppercase", color: INK55,
                  textDecoration: "none", borderBottom: `1px solid ${INK35}`,
                  lineHeight: 1,
                }}
              >
                Build asset →
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SignalIQPlatformClient({
  initialSignals,
}: {
  initialSignals: DbSignal[];
}) {
  const [beat, setBeat] = useState<BeatId>("saas");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);

  // Track which opp IDs have been saved this session
  const [savedOppIds, setSavedOppIds] = useState<Set<string>>(new Set());
  // refreshKey bumps after a save to signal library refresh (actual data from server revalidatePath)
  const [refreshKey, setRefreshKey] = useState(0);

  const currentBeat = BEATS.find(b => b.id === beat);

  async function runScan() {
    setScanError(null);
    setScanning(true);
    setScan(null);
    try {
      const res = await fetch("/api/emostool/signaliq/scan", {
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

  function handleSaved(oppId: string, _dbId: string) {
    setSavedOppIds(prev => new Set([...prev, oppId]));
    setRefreshKey(k => k + 1);
  }

  return (
    <div style={{ fontFamily: SERIF }}>

      {/* ── Scan section ──────────────────────────────────────────────────────── */}
      <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "20px 24px", marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55 }}>
            Run a new scan — no rate limit
          </span>
        </div>

        {/* Beat tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: `1px solid ${INK15}`, marginBottom: 16 }}>
          {BEATS.map((b, i) => {
            const active = b.id === beat;
            return (
              <button
                key={b.id}
                onClick={() => { setBeat(b.id); setScan(null); setScanError(null); }}
                style={{
                  padding: "10px 14px",
                  background: active ? INK : "transparent",
                  border: "none",
                  borderRight: (i % 3 !== 2) ? `1px solid ${INK15}` : "none",
                  borderBottom: i < 3 ? `1px solid ${INK15}` : "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: active ? PAPER : "rgba(26,20,16,.45)",
                  cursor: "pointer",
                  transition: "background 0.12s ease, color 0.12s ease",
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={runScan}
            disabled={scanning}
            style={{
              padding: "12px 28px",
              border: "none",
              background: scanning ? "rgba(26,20,16,.15)" : INK,
              color: scanning ? INK55 : PAPER,
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              cursor: scanning ? "wait" : "pointer",
              transition: "opacity 0.12s ease",
            }}
          >
            {scanning ? "Scanning the radar…" : `Scan ${currentBeat?.label ?? ""} →`}
          </button>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
            Platform scan — unlimited, no Turnstile
          </span>
        </div>

        {scanError && (
          <div style={{ marginTop: 14, padding: "10px 14px", border: `1px solid ${RED}`, background: "rgba(193,74,50,.06)", fontFamily: SERIF, fontSize: 14, color: INK }}>
            {scanError}
          </div>
        )}
      </div>

      {/* ── Scan results ──────────────────────────────────────────────────────── */}
      {scan && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK }}>
              Radar results
            </span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
              {scan.opportunities.length} opportunities · {currentBeat?.label} beat
            </span>
            {scan.partial && (
              <span style={{ fontFamily: MONO, fontSize: 9, color: AMBER, letterSpacing: ".08em" }}>
                Partial results — some sources timed out
              </span>
            )}
          </div>

          {scan.notes.length > 0 && (
            <p style={{ margin: "0 0 14px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, lineHeight: 1.5 }}>
              {scan.notes.join(" ")}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {scan.opportunities.map(opp => (
              <ScanCard
                key={opp.id}
                opp={opp}
                beatLabel={currentBeat?.label ?? beat}
                savedIds={savedOppIds}
                onSaved={handleSaved}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Saved signals library ─────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>
              Signal Library
            </span>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK }}>{initialSignals.length}</span>
            <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>saved</span>
          </div>
          {refreshKey > 0 && (
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: GREEN }}>
              ✓ {refreshKey} signal{refreshKey > 1 ? "s" : ""} added — refresh the page to see updated library
            </span>
          )}
        </div>

        <SignalLibrary signals={initialSignals} refreshKey={refreshKey} />
      </div>

    </div>
  );
}
