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
import { useCompanyContext } from "@/hooks/useCompanyContext";
import { useCompanyName } from "@/hooks/useCompanyName";
import { BEATS } from "@/lib/signaliq/config";
import { coverageState } from "@/lib/signaliq/score";
import { saveSignalFromScan, updateSignalStatus, deleteSignal } from "@/app/emostool/actions/signaliq";
import type { BeatId, Opportunity, ScanResponse, OppBand, AssetPack } from "@/lib/signaliq/types";
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

const FIT_COLOR: Record<NonNullable<Opportunity["fit"]>, string> = { high: GREEN, medium: AMBER, low: RED };
const FIT_LABEL: Record<NonNullable<Opportunity["fit"]>, string> = { high: "High fit", medium: "Medium fit", low: "Low fit" };

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

/** Small note explaining a non-"normal" coverage-gap reading — see coverageState()
 * in lib/signaliq/score.ts. Keeps "no data" and "cooling" from silently looking
 * like a real medium/narrow reading. */
function CoverageNote({ opp }: { opp: Opportunity }) {
  const state = coverageState(opp);
  if (state === "no-data") {
    return (
      <p style={{ margin: "3px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: INK55 }}>
        No press data returned for this topic (GDELT) — neutral default, not a real reading.
      </p>
    );
  }
  if (state === "cooling") {
    return (
      <p style={{ margin: "3px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: INK55 }}>
        Coverage is falling and nothing here is rising — discounted, not real whitespace.
      </p>
    );
  }
  return null;
}

function GapBar({ opp }: { opp: Opportunity }) {
  const value = opp.components.coverageGap;
  const pct = Math.round(value * 100);
  const state = coverageState(opp);
  const label =
    state === "no-data" ? "No data" :
    state === "cooling" ? "Cooling" :
    value >= 0.7 ? "Wide" : value >= 0.4 ? "Medium" : "Narrow";
  const c =
    state === "no-data" ? INK35 :
    state === "cooling" ? AMBER :
    value >= 0.7 ? GREEN : value >= 0.4 ? AMBER : RED;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: INK }}>Coverage gap</span>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, color: c }}>{label}</span>
      </div>
      <div style={{ height: 5, background: "rgba(26,20,16,.08)" }}>
        {state !== "no-data" && <div style={{ height: "100%", width: `${pct}%`, background: c }} />}
      </div>
      <CoverageNote opp={opp} />
    </div>
  );
}

function CompBar({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".1em", textTransform: "uppercase", color: INK55 }}>{label}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 10, color: accent ? AMBER : INK }}>{pct}</span>
      </div>
      <div style={{ height: 4, background: "rgba(26,20,16,.08)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: accent ? AMBER : INK }} />
      </div>
    </div>
  );
}

// ── Scan result card ───────────────────────────────────────────────────────────

function ScanCard({
  opp,
  beatLabel,
  companyContext,
  companyName,
  savedIds,
  onSaved,
}: {
  opp: Opportunity;
  beatLabel: string;
  companyContext: string;
  companyName: string;
  savedIds: Set<string>;
  onSaved: (oppId: string, dbId: string) => void;
}) {
  const [saving, startSave] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [packing, setPacking] = useState(false);
  const [pack, setPack] = useState<AssetPack | null>(null);
  const [packError, setPackError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const alreadySaved = savedIds.has(opp.id);
  const c = bandColor(opp.band);
  const cLight = bandColorLight(opp.band);

  function handleSave() {
    setSaveError(null);
    startSave(async () => {
      try {
        const result = await saveSignalFromScan(opp, beatLabel, companyContext, companyName);
        if (result.ok && result.id) {
          onSaved(opp.id, result.id);
        } else {
          setSaveError(result.error ?? "Save failed — check Vercel logs");
        }
      } catch (e) {
        setSaveError("Network error — please try again");
        console.error("saveSignalFromScan error:", e);
      }
    });
  }

  async function handleGeneratePack() {
    setPackError(null);
    setPack(null);
    setPacking(true);
    try {
      const res = await fetch("/api/emostool/signaliq/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: opp, companyContext: companyContext.trim() || undefined }),
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
        {opp.fit && (
          <span style={{ alignSelf: "flex-start", fontFamily: GROT, fontWeight: 800, fontSize: 8.5, letterSpacing: ".1em", textTransform: "uppercase", color: FIT_COLOR[opp.fit], border: `1px solid ${FIT_COLOR[opp.fit]}`, padding: "2px 7px" }}>
            {FIT_LABEL[opp.fit]}
          </span>
        )}
        <GapBar opp={opp} />

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

        {/* Why this score — expandable breakdown (parity with the public tool) */}
        <button
          onClick={() => setShowDetail(v => !v)}
          style={{ alignSelf: "flex-start", background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55 }}
        >
          {showDetail ? "Hide details ▴" : "Why this score ▾"}
        </button>
        {showDetail && (
          <div style={{ background: PAPER, border: `1px solid ${INK15}`, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>Score breakdown</span>
              {opp.tailored && (
                <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".12em", textTransform: "uppercase", color: GREEN, border: `1px solid ${GREEN}`, padding: "1px 5px" }}>Tailored to you</span>
              )}
            </div>
            <CompBar label="Magnitude" value={opp.components.magnitude} />
            <CompBar label="Velocity" value={opp.components.velocity} />
            <CompBar label="Coverage gap" value={opp.components.coverageGap} />
            <CoverageNote opp={opp} />
            <CompBar label="Startup relevance" value={opp.components.relevance} accent />
            <CompBar label="Beat fit" value={opp.components.fit} />
            <CompBar label="Corroboration" value={opp.components.corroboration} />
            {opp.fit && (
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55, lineHeight: 1.4 }}>
                Score is signal strength; company fit is <strong>{FIT_LABEL[opp.fit]}</strong> and is used to rank these, not to lower the number.
              </div>
            )}
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: INK55, marginTop: 2 }}>Receipts</div>
            {opp.signals.map((s, i) => (
              <div key={i} style={{ fontFamily: SERIF, fontSize: 12, color: INK70, lineHeight: 1.4 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: INK55 }}>{(SRC_LABEL[s.source] ?? s.source).toUpperCase()}</span>{" "}
                {s.detail || s.title}
                {s.source !== "sec" && s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: INK55, marginLeft: 4 }}>↗</a>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Asset pack inline */}
        {packing && (
          <div style={{ padding: "10px 12px", background: PAPER, border: `1px solid ${INK15}`, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
            Building asset pack…
          </div>
        )}
        {packError && (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: RED }}>{packError}</div>
        )}
        {pack && !packing && (
          <div style={{ background: PAPER, border: `1px solid ${INK15}`, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>Asset pack</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: INK, lineHeight: 1.3 }}>{pack.headline}</div>
            {pack.linkableAssetIdea && (
              <div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 3 }}>Linkable asset to build</div>
                <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK70, lineHeight: 1.45 }}>{pack.linkableAssetIdea}</p>
              </div>
            )}
            {pack.angle && (
              <div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 3 }}>Pitch angle</div>
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13, color: INK70, lineHeight: 1.5 }}>{pack.angle.slice(0, 300)}{pack.angle.length > 300 ? "…" : ""}</p>
              </div>
            )}
            {pack.journalists.length > 0 && (
              <div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Who to pitch</div>
                {pack.journalists.slice(0, 3).map((j, i) => (
                  <div key={i} style={{ fontFamily: SERIF, fontSize: 12, color: INK70, marginBottom: 3 }}>
                    <strong>{j.name}</strong> · {j.outlet} · {j.beat}
                  </div>
                ))}
              </div>
            )}
            {/* Build asset from this pack — passes all context to AssetIQ */}
            <a
              href={`/emostool/dashboard/assetiq?headline=${encodeURIComponent(opp.headline)}&assetIdea=${encodeURIComponent(pack.linkableAssetIdea ?? "")}&dataBrief=${encodeURIComponent((pack.brief ?? "").slice(0, 400))}&pitchAngle=${encodeURIComponent((pack.angle ?? "").slice(0, 300))}`}
              style={{ display: "inline-block", padding: "8px 14px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none", marginTop: 2 }}
            >
              Build asset from this pack →
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ margin: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Generate asset pack */}
        {!pack && (
          <button
            onClick={handleGeneratePack}
            disabled={packing}
            style={{
              padding: "9px 14px",
              border: `1px solid ${INK15}`,
              background: PAPER,
              color: packing ? INK55 : INK,
              fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".10em", textTransform: "uppercase",
              cursor: packing ? "wait" : "pointer",
            }}
          >
            {packing ? "Building pack…" : "Generate asset pack →"}
          </button>
        )}

        {/* Save to EMOS */}
        <button
          onClick={handleSave}
          disabled={saving || alreadySaved}
          style={{
            padding: "11px 14px",
            border: "none",
            background: alreadySaved ? PAPER2 : YEL,
            color: alreadySaved ? INK55 : INK,
            fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".10em", textTransform: "uppercase",
            cursor: alreadySaved ? "default" : saving ? "wait" : "pointer",
            borderTop: `1px solid ${INK15}`,
          }}
        >
          {saving ? "Saving…" : alreadySaved ? "✓ Saved to EMOS" : "Save to EMOS →"}
        </button>
        {saveError && (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: RED, lineHeight: 1.4 }}>
            ✗ {saveError}
          </div>
        )}
      </div>
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
  void refreshKey; // parent re-render cue (server refresh via revalidatePath)

  const GRID = "1fr 78px 84px 84px 92px 156px";
  const [statusFilter, setStatusFilter] = useState<"all" | DbSignal["status"]>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [localStatus, setLocalStatus] = useState<Record<string, DbSignal["status"]>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const statusOf = (s: DbSignal): DbSignal["status"] => localStatus[s.id] ?? s.status;
  const live = signals.filter(s => !removed.has(s.id));
  const companies = Array.from(new Set(live.map(s => s.company_name).filter(Boolean) as string[]));
  const counts = {
    all: live.length,
    saved: live.filter(s => statusOf(s) === "saved").length,
    pitched: live.filter(s => statusOf(s) === "pitched").length,
    archived: live.filter(s => statusOf(s) === "archived").length,
  };
  const visible = live.filter(s =>
    (statusFilter === "all" || statusOf(s) === statusFilter) &&
    (companyFilter === "all" || s.company_name === companyFilter),
  );

  async function handleDelete(id: string) {
    if (typeof window !== "undefined" && !window.confirm("Delete this saved signal? This can't be undone.")) return;
    setBusyId(id);
    const ok = await deleteSignal(id);
    setBusyId(null);
    if (ok) setRemoved(prev => new Set(prev).add(id));
  }
  async function handleArchive(id: string) {
    setBusyId(id);
    const ok = await updateSignalStatus(id, "archived");
    setBusyId(null);
    if (ok) setLocalStatus(prev => ({ ...prev, [id]: "archived" }));
  }

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
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        {([["all", "All"], ["saved", "Saved"], ["pitched", "Pitched"], ["archived", "Archived"]] as const).map(([k, label]) => {
          const active = statusFilter === k;
          return (
            <button key={k} onClick={() => setStatusFilter(k)}
              style={{ padding: "5px 11px", border: `1px solid ${active ? INK : INK15}`, background: active ? INK : "transparent",
                color: active ? PAPER : INK55, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".1em",
                textTransform: "uppercase", cursor: "pointer" }}>
              {label} · {counts[k]}
            </button>
          );
        })}
        {companies.length > 0 && (
          <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
            style={{ marginLeft: "auto", padding: "5px 10px", border: `1px solid ${INK15}`, background: PAPER,
              color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" }}>
            <option value="all">All companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: GRID, background: INK, color: PAPER }}>
          {["Signal / scanned for", "Fit", "Score", "Gap", "Detected", "Status"].map((h, i) => (
            <div key={h} style={{ padding: "10px 13px", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", borderRight: i < 5 ? "1px solid rgba(241,235,222,.12)" : "none" }}>
              {h}
            </div>
          ))}
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
            Nothing matches this filter.
          </div>
        ) : visible.map((sig, idx) => {
          const st = statusOf(sig);
          const ss = STATUS_STYLE[st];
          const scorePct = Math.min(sig.signal_score ?? 0, 100);
          const gapPct = Math.min((sig.coverage_gap ?? 0) * 100, 100);
          const scoreColor = scorePct >= 70 ? YEL : scorePct >= 45 ? INK55 : "rgba(26,20,16,.25)";
          const gapColor = gapPct >= 70 ? GREEN : gapPct >= 40 ? AMBER : RED;

          return (
            <div key={sig.id} style={{ display: "grid", gridTemplateColumns: GRID, borderBottom: idx < visible.length - 1 ? `1px solid ${INK15}` : "none", opacity: busyId === sig.id ? 0.45 : 1 }}>
              {/* Headline + attribution */}
              <div style={{ padding: "13px 14px" }}>
                <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: INK }}>{sig.headline}</div>
                {(sig.company_name || sig.scan_category) && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
                    {sig.company_name && (
                      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".08em", textTransform: "uppercase", color: INK, background: YEL, padding: "2px 6px" }}>
                        {sig.company_name}
                      </span>
                    )}
                    {sig.scan_category && (
                      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: INK55, border: `1px solid ${INK15}`, padding: "2px 6px" }}>
                        {sig.scan_category}
                      </span>
                    )}
                  </div>
                )}
                {sig.summary && (
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55, marginTop: 5, lineHeight: 1.4 }}>
                    {sig.summary.length > 110 ? sig.summary.slice(0, 110) + "…" : sig.summary}
                  </div>
                )}
              </div>
              {/* Fit */}
              <div style={{ padding: "13px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                {sig.fit ? (
                  <span style={{
                    fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase",
                    color: FIT_COLOR[sig.fit], border: `1px solid ${FIT_COLOR[sig.fit]}`,
                    padding: "2px 6px", whiteSpace: "nowrap",
                  }}>
                    {sig.fit === "high" ? "High" : sig.fit === "medium" ? "Med" : "Low"}
                  </span>
                ) : (
                  <span style={{ fontFamily: MONO, fontSize: 12, color: INK35 }}>—</span>
                )}
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
              <div style={{ padding: "10px 11px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 7 }}>
                <span style={{
                  display: "inline-block", padding: "3px 8px 4px",
                  background: ss.bg, color: ss.fg,
                  border: ss.bg === "transparent" ? `1px solid ${INK35}` : "none",
                  fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase",
                }}>
                  {ss.label}
                </span>
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
                  <a
                    href={`/emostool/dashboard/assetiq?signal=${sig.id}&headline=${encodeURIComponent(sig.headline)}`}
                    style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, textDecoration: "none", borderBottom: `1px solid ${INK35}`, lineHeight: 1 }}
                  >
                    Build →
                  </a>
                  {st !== "archived" && (
                    <button onClick={() => handleArchive(sig.id)} disabled={busyId === sig.id}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, borderBottom: `1px solid ${INK35}`, lineHeight: 1 }}>
                      Archive
                    </button>
                  )}
                  <button onClick={() => handleDelete(sig.id)} disabled={busyId === sig.id}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: RED, borderBottom: `1px solid ${RED}`, lineHeight: 1 }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SignalIQPlatformClient({
  initialSignals,
}: {
  initialSignals: DbSignal[];
}) {
  // Ordered beat selection (primary first), length 1–3. All tiers are free.
  const [beats, setBeats] = useState<BeatId[]>(["saas"]);
  const beat = beats[0]; // derived primary
  const secondary = beats[1] as BeatId | undefined;
  const tertiary = beats[2] as BeatId | undefined;
  const [companyContext, setCompanyContext] = useCompanyContext();
  const [companyName, setCompanyName] = useCompanyName();
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);

  const [savedOppIds, setSavedOppIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const currentBeat = BEATS.find(b => b.id === beat);

  // Multi-beat selection handlers (mirror the public tool). Setting primary keeps
  // any secondary/tertiary that don't collide; removing secondary drops tertiary.
  const clearScan = () => { setScan(null); setScanError(null); };
  const setPrimary = (id: BeatId) => { setBeats([id, ...beats.slice(1).filter(b => b !== id)]); clearScan(); };
  const secondaryOptions = BEATS.filter(b => b.id !== beat && b.id !== tertiary);
  const tertiaryOptions = BEATS.filter(b => b.id !== beat && b.id !== secondary);
  const addSecondary = () => { const f = secondaryOptions[0]; if (f) { setBeats([beat, f.id]); clearScan(); } };
  const changeSecondary = (id: BeatId) => { setBeats([beat, id, ...(tertiary && tertiary !== id ? [tertiary] : [])]); clearScan(); };
  const removeSecondary = () => { setBeats([beat]); clearScan(); };
  const addTertiary = () => { const f = tertiaryOptions[0]; if (f && secondary) { setBeats([beat, secondary, f.id]); clearScan(); } };
  const changeTertiary = (id: BeatId) => { if (secondary) { setBeats([beat, secondary, id]); clearScan(); } };
  const removeTertiary = () => { if (secondary) { setBeats([beat, secondary]); clearScan(); } };

  // The server now personalises + ranks by relevance to the company profile,
  // so we render its ordering directly (no more client-side re-rank).
  const rankedOpps = scan?.opportunities ?? [];

  async function runScan() {
    setScanError(null);
    setScanning(true);
    setScan(null);
    try {
      const res = await fetch("/api/emostool/signaliq/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beats, companyContext: companyContext.trim() || undefined }),
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
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55 }}>
            Run a new scan — personalised to your company
          </span>
        </div>
        <p style={{ margin: "0 0 16px", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, lineHeight: 1.5, borderLeft: `2px solid ${YEL}`, paddingLeft: 10 }}>
          Works best when your company operates <em>inside</em> one of these beats — health, fintech, SaaS, AI, etc. — where SEC filings, research, and news actually discuss your space. Service or agency businesses (e.g. a marketing/PR firm) will see thinner results.
        </p>

        {/* Step 1 — company profile (required; drives the scan) */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>
            Step 1 · Your company <span style={{ color: RED }}>*</span>
            <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}> — what you do, who you serve, your edge. This tailors what we scan and how we score relevance.</span>
          </label>
          <input
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            maxLength={80}
            placeholder="Company name (e.g. SIA Health OS) — saved with each signal"
            style={{
              width: "100%", boxSizing: "border-box", marginBottom: 8,
              background: PAPER, border: `1px solid ${INK15}`,
              color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 12,
              padding: "9px 12px", outline: "none",
            }}
          />
          <textarea
            value={companyContext}
            onChange={e => setCompanyContext(e.target.value)}
            maxLength={600}
            rows={3}
            placeholder="e.g. 'SIA Health is a journaling app for people with chronic, overlapping conditions — asthma, allergies, CKD, hypertension. Users log symptoms, triggers, meds and sleep, and the app surfaces the patterns connecting them.'"
            style={{
              width: "100%", boxSizing: "border-box",
              background: PAPER, border: `1px solid ${companyContext.trim().length >= 12 ? INK15 : RED}`,
              color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.6,
              padding: "10px 13px", resize: "vertical", outline: "none",
            }}
          />
          <div style={{ marginTop: 5, fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: companyContext.trim().length >= 12 ? GREEN : INK55 }}>
            {companyContext.trim().length >= 12
              ? "✓ We'll expand this into tailored topics and score every result by fit to your company."
              : "Add a sentence or two about your company — relevance scoring needs it before you can scan."}
          </div>
        </div>

        {/* Step 2 — beat(s) */}
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>
          Step 2 · Pick your main beat <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}> — the general area we explore; add up to two more if you straddle categories (still one scan)</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", border: `1px solid ${INK15}`, marginBottom: 12 }}>
          {BEATS.map((b, i) => {
            const active = b.id === beat;
            return (
              <button
                key={b.id}
                onClick={() => setPrimary(b.id)}
                style={{
                  padding: "10px 14px",
                  background: active ? INK : "transparent",
                  border: "none",
                  borderRight: (i % 3 !== 2) ? `1px solid ${INK15}` : "none",
                  borderBottom: i < 3 ? `1px solid ${INK15}` : "none",
                  fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase",
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

        {/* Secondary / tertiary beats — progressive disclosure (all tiers free) */}
        {(() => {
          const rowStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${INK15}`, padding: "5px 6px 5px 10px" };
          const lblStyle: React.CSSProperties = { fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 };
          const selStyle: React.CSSProperties = { fontFamily: GROT, fontWeight: 700, fontSize: 11, color: INK, background: PAPER, border: `1px solid ${INK15}`, padding: "5px 8px", cursor: "pointer", outline: "none" };
          const xStyle: React.CSSProperties = { width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", fontSize: 16, lineHeight: 1, color: INK55, cursor: "pointer" };
          const addStyle: React.CSSProperties = { background: "transparent", border: `1px dashed ${INK15}`, padding: "7px 12px", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: INK55, cursor: "pointer" };
          return (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 14px", marginBottom: 18 }}>
              {!secondary ? (
                <button type="button" style={addStyle} onClick={addSecondary}>+ Add a secondary beat <span style={{ opacity: 0.6, fontWeight: 600 }}>(optional)</span></button>
              ) : (
                <div style={rowStyle}>
                  <span style={lblStyle}>Secondary</span>
                  <select style={selStyle} value={secondary} onChange={(e) => changeSecondary(e.target.value as BeatId)}>
                    {secondaryOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                  <button type="button" style={xStyle} onClick={removeSecondary} aria-label="Remove secondary beat">×</button>
                </div>
              )}
              {secondary && (!tertiary ? (
                <button type="button" style={addStyle} onClick={addTertiary}>+ Add a third beat <span style={{ opacity: 0.6, fontWeight: 600 }}>(optional)</span></button>
              ) : secondary && tertiary ? (
                <div style={rowStyle}>
                  <span style={lblStyle}>Tertiary</span>
                  <select style={selStyle} value={tertiary} onChange={(e) => changeTertiary(e.target.value as BeatId)}>
                    {tertiaryOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                  <button type="button" style={xStyle} onClick={removeTertiary} aria-label="Remove third beat">×</button>
                </div>
              ) : null)}
            </div>
          );
        })()}

        {/* Step 3 — scan */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={runScan}
            disabled={scanning || companyContext.trim().length < 12}
            style={{
              padding: "12px 28px", border: "none",
              background: (scanning || companyContext.trim().length < 12) ? "rgba(26,20,16,.15)" : INK,
              color: (scanning || companyContext.trim().length < 12) ? INK55 : PAPER,
              fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase",
              cursor: scanning ? "wait" : companyContext.trim().length < 12 ? "not-allowed" : "pointer",
            }}
          >
            {scanning ? "Scanning the radar…" : beats.length > 1 ? `Scan ${beats.length} beats →` : `Scan ${currentBeat?.label ?? ""} →`}
          </button>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
            {scanning ? "Expanding your profile + scanning sources…" : "Platform scan — unlimited, tailored to your company"}
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
              {scan.opportunities.length} opportunities · {(scan.beats ?? beats).map((id) => BEATS.find((b) => b.id === id)?.label ?? id).join(" + ")}
              {companyContext.trim() && " · personalised to your startup"}
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
            {rankedOpps.map(opp => (
              <ScanCard
                key={opp.id}
                opp={opp}
                beatLabel={BEATS.find((b) => b.id === opp.beat)?.label ?? currentBeat?.label ?? beat}
                companyContext={companyContext}
                companyName={companyName}
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
