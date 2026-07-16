"use client";

/**
 * SignalIQ Platform — authenticated dashboard surface (THIN WRAPPER, Phase P6)
 *
 * The full 5-step tool experience (Beat → Context → Radar → Angle → Pack) now
 * comes from the shared core (components/signaliq/SignalIQToolCore.tsx) — the
 * exact same component the public /tools/signaliq page uses, which closes the
 * old parity gap (the dashboard used to show a stub pack with no data brief,
 * no loader, no angle view, and sat on a 30s pack timeout).
 *
 * This wrapper owns ONLY the platform-surface concerns:
 *   - transport to the Clerk-guarded /api/emos-platform/signaliq/* routes
 *     (no Turnstile, no quota — platform scans are unmetered)
 *   - company name + context persistence across the EMOS pipeline
 *     (useCompanyName / useCompanyContext localStorage hooks)
 *   - "Save to EMOS" via the saveSignalFromScan server action
 *   - the saved-signals library below the tool
 *   - AssetIQ / dashboard-PressIQ handoff links (its place in the
 *     SignalIQ → PressIQ → JournoCollabIQ → CoverageIQ flow)
 */

import React, { useState } from "react";
import Script from "next/script";
import { useCompanyContext } from "@/hooks/useCompanyContext";
import { useCompanyName } from "@/hooks/useCompanyName";
import { getJsPDF } from "@/lib/pdf/house-style";
import { buildSignalIqReport } from "@/lib/pdf/signaliq-report";
import { BEATS } from "@/lib/signaliq/config";
import SignalIQToolCore, { type SiqPdfContext } from "@/components/signaliq/SignalIQToolCore";
import { SIQ_CSS } from "@/components/signaliq/core-css";
import { saveSignalFromScan, updateSignalStatus, deleteSignal } from "@/app/emos-platform/actions/signaliq";
import type { BeatId, Opportunity, AssetPack } from "@/lib/signaliq/types";
import type { DbSignal } from "@/app/emos-platform/actions/signaliq";

// ── design tokens ──────────────────────────────────────────────────────────────
const PAPER   = "#f1ebde";
const PAPER2  = "#e8e0cc";
const INK     = "#1a1410";
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

const FIT_COLOR: Record<NonNullable<DbSignal["fit"]>, string> = { high: GREEN, medium: AMBER, low: RED };

function fmt(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
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
                    href={`/emos-platform/dashboard/assetiq?signal=${sig.id}&headline=${encodeURIComponent(sig.headline)}`}
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
  // Ordered beat selection (primary first), length 1–3.
  const [beats, setBeats] = useState<BeatId[]>(["saas"]);
  const [companyContext, setCompanyContext] = useCompanyContext();
  const [companyName, setCompanyName] = useCompanyName();
  const [refreshKey, setRefreshKey] = useState(0);

  // ── transport: Clerk-guarded platform routes (no Turnstile, no quota) ──────
  const api = {
    scan: async (body: { beats: BeatId[]; companyContext?: string }) => {
      const res = await fetch("/api/emos-platform/signaliq/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    },
    pack: async (body: { opportunity: Opportunity; companyContext?: string }) => {
      const res = await fetch("/api/emos-platform/signaliq/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    },
  };

  // ── Save to EMOS (server action; same JWT/RLS path as before P6) ───────────
  async function handleSaveOpportunity(opp: Opportunity, beatLabel: string) {
    const result = await saveSignalFromScan(opp, beatLabel, companyContext, companyName);
    if (result.ok) setRefreshKey(k => k + 1);
    return result;
  }

  // ── PDF report (parity upgrade: dashboard users get it too, ungated) ───────
  function handleDownloadPDF(ctx: SiqPdfContext) {
    const JsPDF = getJsPDF();
    if (!JsPDF) { alert("PDF library still loading — try again in a moment."); return; }
    try {
      const doc = new JsPDF({ unit: "mm", format: "a4" });
      buildSignalIqReport(doc, {
        beatLabel: ctx.beats.map((id) => BEATS.find((b) => b.id === id)?.label ?? String(id)).join(" + "),
        companyContext: ctx.companyContext,
        opportunities: ctx.opportunities,
        selected: ctx.selected,
        pack: ctx.pack,
        generatedAt: ctx.generatedAt ?? new Date().toISOString(),
      });
      doc.save(`signaliq-report-${Date.now()}.pdf`);
    } catch {
      alert("Could not generate the PDF. Please try again.");
    }
  }

  return (
    <div style={{ fontFamily: SERIF }}>
      <style>{SIQ_CSS}</style>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />

      {/* ── The shared 5-step tool core (full parity with the public tool) ── */}
      <SignalIQToolCore
        api={api}
        beats={beats}
        onBeatsChange={setBeats}
        companyContext={companyContext}
        onCompanyContextChange={setCompanyContext}
        profile={{
          collectName: true,
          companyName,
          onCompanyNameChange: setCompanyName,
          contextRequired: true,
          contextMaxLength: 600,
        }}
        quotaUi={null}
        scanNote="Platform scan — unlimited, tailored to your company"
        onSaveOpportunity={handleSaveOpportunity}
        packActions={{
          onDownloadPDF: handleDownloadPDF,
          pressIqHref: "/emos-platform/dashboard/pressiq",
          buildAssetHref: (opp: Opportunity, pack: AssetPack) =>
            `/emos-platform/dashboard/assetiq?headline=${encodeURIComponent(opp.headline)}&assetIdea=${encodeURIComponent(pack.linkableAssetIdea ?? "")}&dataBrief=${encodeURIComponent((pack.brief ?? "").slice(0, 400))}&pitchAngle=${encodeURIComponent((pack.angle ?? "").slice(0, 300))}`,
        }}
        // No onExit: the dashboard has no landing screen, so the stage-1 back
        // button is hidden. The dashboard header's "← EMOS" covers leaving.
        stickyTop={0}
      />

      {/* ── Saved signals library ─────────────────────────────────────────── */}
      <div style={{ marginTop: 40 }}>
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
