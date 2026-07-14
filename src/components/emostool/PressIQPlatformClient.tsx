"use client";

/**
 * PressIQ Platform — authenticated dashboard surface (THIN WRAPPER, Phase P6).
 *
 * The full scoring experience (2-step form, live mechanics, the 4 result views,
 * PDF) now comes from the shared core (components/pressiq/PressIQToolCore) — the
 * exact same component the public /tools/pressiq page uses. This closes the old
 * parity gap (the dashboard used to show only a compact score panel with no
 * gauge, breakdown, evidence, live mechanics or PDF).
 *
 * This wrapper owns ONLY the platform-surface concerns:
 *   - transport to the Clerk-guarded /api/emostool/pitch-score route
 *     (no Turnstile, no quota — platform scores are unmetered + auto-stored)
 *   - "Track this pitch in CoverageIQ" (createPitch) — the PressIQ→CoverageIQ handoff
 *   - the saved Score History table below the tool
 *   - the PDF report (ungated parity)
 */

import React, { useState, useTransition } from "react";
import Script from "next/script";
import { createPitch } from "@/app/emos-platform/actions/coverageiq";
import { getJsPDF } from "@/lib/pdf/house-style";
import { buildPressIqReport } from "@/lib/pdf/pressiq-report";
import PressIQToolCore from "@/components/pressiq/PressIQToolCore";
import { PIQ_CSS } from "@/components/pressiq/core-css";
import type { ScoreResponse } from "@/lib/pitch/types";

// ── design tokens ──────────────────────────────────────────────────────────────
const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

// ── types ──────────────────────────────────────────────────────────────────────
interface DbScore {
  id: string;
  pitch_text: string | null;
  journalist_query: string | null;
  platform: string | null;
  composite_score: number;
  tier: string;
  layer1_score: number | null;
  layer2_score: number | null;
  layer3_score: number | null;
  authenticity_risk: boolean;
  outcome: string | null;
  scored_at: string;
}

function fmt(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

function daysAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}

// ── Track this pitch → CoverageIQ (docked inside the core's Score tab) ──────────
function TrackCTA({ result, pitchSubject }: { result: ScoreResponse; pitchSubject: string }) {
  const [tracking, startTrack] = useTransition();
  const [tracked, setTracked] = useState<string | null>(null);

  function handleTrack() {
    startTrack(async () => {
      const subject = pitchSubject.slice(0, 120) || "Pitch from PressIQ";
      const draft = await createPitch({
        subject,
        data_source: "PressIQ",
        stage: "drafted",
        notes: `PressIQ score: ${result.composite}/100 (${result.tier.label})`,
      });
      if (draft?.id) setTracked(draft.id);
    });
  }

  return (
    <div style={{ marginTop: 20, border: `1px solid ${INK}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      {tracked ? (
        <a
          href="/emos-platform/dashboard/coverageiq"
          style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: GREEN, textDecoration: "none", borderBottom: `1px solid ${GREEN}` }}
        >
          ✓ Pitch created in CoverageIQ →
        </a>
      ) : (
        <button
          onClick={handleTrack}
          disabled={tracking}
          style={{
            padding: "10px 20px", border: "none",
            background: tracking ? PAPER2 : YEL,
            color: INK,
            fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
            cursor: tracking ? "wait" : "pointer",
          }}
        >
          {tracking ? "Creating draft…" : "Track this pitch in CoverageIQ →"}
        </button>
      )}
      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>
        Creates a drafted pitch in CoverageIQ with this score in notes
      </span>
    </div>
  );
}

// ── Score history table ────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, { bg: string; fg: string }> = {
  Elite:        { bg: YEL,           fg: INK   },
  Strong:       { bg: INK,           fg: YEL   },
  Developing:   { bg: "transparent", fg: INK   },
  "Needs Work": { bg: PAPER2,        fg: INK55 },
};

function ScoreHistory({ scores, newCount }: { scores: DbScore[]; newCount: number }) {
  if (scores.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55 }}>
          No scores yet. Score your first pitch above.
        </p>
      </div>
    );
  }

  return (
    <>
      {newCount > 0 && (
        <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: GREEN }}>
          ✓ {newCount} new score{newCount > 1 ? "s" : ""} this session — refresh the page to see them here
        </p>
      )}
      <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 72px 72px 72px 90px", background: INK, color: PAPER }}>
          {["Pitch", "Score", "L1", "L2", "L3", "Scored"].map((h, i) => (
            <div key={h} style={{ padding: "10px 12px", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", borderRight: i < 5 ? "1px solid rgba(241,235,222,.12)" : "none" }}>
              {h}
            </div>
          ))}
        </div>
        {scores.map((row, idx) => {
          const ts2 = TIER_COLORS[row.tier] ?? TIER_COLORS["Needs Work"];
          const preview = row.pitch_text
            ? row.pitch_text.replace(/\n/g, " ").substring(0, 90)
            : "(text not stored)";
          return (
            <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 72px 72px 72px 72px 90px", borderBottom: idx < scores.length - 1 ? `1px solid ${INK15}` : "none" }}>
              <div style={{ padding: "12px 14px", overflow: "hidden", minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {preview}
                </div>
                {row.authenticity_risk && (
                  <span style={{ fontFamily: GROT, fontSize: 8, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, background: PAPER2, padding: "2px 5px", marginTop: 3, display: "inline-block" }}>
                    ⚠ AUTHENTICITY FLAG
                  </span>
                )}
              </div>
              <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16 }}>{row.composite_score}</span>
                <span style={{
                  display: "inline-block", padding: "2px 5px 3px",
                  background: ts2.bg, color: ts2.fg,
                  border: ts2.bg === "transparent" ? `1px solid ${INK35}` : "none",
                  fontFamily: GROT, fontWeight: 800, fontSize: 7, letterSpacing: ".12em", textTransform: "uppercase",
                }}>
                  {row.tier}
                </span>
              </div>
              {[row.layer1_score, row.layer2_score, row.layer3_score].map((s, i) => (
                <div key={i} style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: s != null ? INK : INK35 }}>{s ?? "—"}</span>
                </div>
              ))}
              <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>{fmt(row.scored_at)}</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: INK55, marginTop: 1 }}>{daysAgo(row.scored_at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PressIQPlatformClient({
  initialScores,
  initialQuery = "",
}: {
  initialScores: DbScore[];
  initialQuery?: string;
}) {
  const [scoreSubject, setScoreSubject] = useState("");
  const [newScoreCount, setNewScoreCount] = useState(0);

  // ── transport: Clerk-guarded platform route (no Turnstile, no quota) ────────
  const api = {
    score: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/emostool/pitch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    },
  };

  // ── PDF report (parity upgrade: dashboard users get it too, ungated) ────────
  function handleDownloadPdf(result: ScoreResponse, ctx: { pitch: string; subject: string }) {
    const JsPDF = getJsPDF();
    if (!JsPDF) { alert("PDF library still loading — try again in a moment."); return; }
    try {
      const doc = new JsPDF({ unit: "mm", format: "a4" });
      buildPressIqReport(doc, { result, pitch: ctx.pitch, subject: ctx.subject });
      doc.save(`PressIQ-Report-${Date.now()}.pdf`);
    } catch {
      alert("Could not generate the PDF. Please try again.");
    }
  }

  return (
    <div style={{ fontFamily: SERIF }}>
      <style>{PIQ_CSS}</style>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />

      {/* ── The shared tool core (full parity with the public tool) ── */}
      <PressIQToolCore
        api={api}
        initial={{ journalistBeat: initialQuery, pitchMode: initialQuery ? "standalone" : undefined }}
        hideMasthead
        showStoreToggle={false}
        quotaLine={<>Score a pitch · no rate limit · auto-saves to your history</>}
        pdfAction={handleDownloadPdf}
        onScored={(scored, ctx) => { setScoreSubject(ctx.subject); setNewScoreCount(c => c + 1); void scored; }}
        scoreTabCta={(r) => <TrackCTA result={r} pitchSubject={scoreSubject} />}
      />

      {/* ── Score history ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>Score History</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK }}>{initialScores.length}</span>
          <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>saved</span>
        </div>
        <ScoreHistory scores={initialScores} newCount={newScoreCount} />
      </div>
    </div>
  );
}
