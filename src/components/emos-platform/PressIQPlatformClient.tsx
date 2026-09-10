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
 *   - transport to the Clerk-guarded /api/emos-platform/pitch-score route
 *     (no Turnstile, no public quota; platform scores count against the monthly allowance + auto-stored)
 *   - "Track this pitch in CoverageIQ" (createPitch) — the PressIQ→CoverageIQ handoff
 *   - the saved Score History table below the tool
 *   - the PDF report (ungated parity)
 */

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createPitch } from "@/app/emos-platform/actions/coverageiq";
import { getJsPDF } from "@/lib/pdf/house-style";
import { buildPressIqReport } from "@/lib/pdf/pressiq-report";
import PressIQToolCore from "@/components/pressiq/PressIQToolCore";
import { PIQ_CSS } from "@/components/pressiq/core-css";
import type { ScoreResponse } from "@/lib/pitch/types";
import type { DbJournalist } from "@/lib/coverageiq/types";
import type { DbAsset } from "@/app/emos-platform/actions/assetiq";
import { useCompanyOptional } from "@/components/emos-platform/CompanyProvider";
import CompanyPicker from "@/components/emos-platform/CompanyPicker";
import PitchDrafter from "@/components/emos-platform/PitchDrafter";
import PriorContact from "@/components/emos-platform/PriorContact";
import type { JournalistHistory } from "@/lib/journalist-history-types";
import type { DbPitchDraft } from "@/lib/pitch-draft-types";
import ScoreTargets from "@/components/pressiq/ScoreTargets";

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
  // 2026-09-09 (state layer): who and what the pitch was for, plus the stored
  // ScoreResponse that makes reopening it exact rather than reconstructed.
  journalist_id: string | null;
  journalist_name: string | null;
  journalist_outlet: string | null;
  asset_id: string | null;
  asset_title: string | null;
  score_response: unknown | null;
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
function TrackCTA({
  result, pitchSubject, journalist, asset,
}: {
  result: ScoreResponse;
  pitchSubject: string;
  journalist: DbJournalist | null;
  asset: DbAsset | null;
}) {
  const [tracking, startTrack] = useTransition();
  const [tracked, setTracked] = useState<string | null>(null);

  function handleTrack() {
    startTrack(async () => {
      const subject = pitchSubject.slice(0, 120) || "Pitch from PressIQ";
      // journalist_id has been accepted by createPitch since CoverageIQ was
      // built; PressIQ simply never passed one, so a tracked pitch arrived in
      // the CRM with no person attached. It does now.
      const notes = [
        `PressIQ score: ${result.composite}/100 (${result.tier.label})`,
        journalist ? `Pitched to ${journalist.name}${journalist.outlet ? ` at ${journalist.outlet}` : ""}` : null,
        asset ? `Asset: ${asset.title}` : null,
      ].filter(Boolean).join(" · ");

      const draft = await createPitch({
        subject,
        data_source: "PressIQ",
        stage: "drafted",
        journalist_id: journalist?.id ?? null,
        notes,
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
        {journalist
          ? `Creates a drafted pitch in CoverageIQ, attached to ${journalist.name}`
          : "Creates a drafted pitch in CoverageIQ with this score in notes"}
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

function ScoreHistory({
  scores, newCount, onReopen, openId,
}: {
  scores: DbScore[];
  newCount: number;
  /** 2026-09-09: a scored pitch could not be reopened — the row sat in the DB
   * with its full breakdown and nothing could get back to it. */
  onReopen: (score: DbScore) => void;
  openId: string | null;
}) {
  if (scores.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55 }}>
          No scores yet. Score your first pitch in the Score tab.
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
          const reopenable = !!row.score_response;
          const isOpen = openId === row.id;
          return (
            <div key={row.id} style={{
              display: "grid", gridTemplateColumns: "1fr 72px 72px 72px 72px 90px",
              borderBottom: idx < scores.length - 1 ? `1px solid ${INK15}` : "none",
              background: isOpen ? "rgba(245,184,31,.14)" : "transparent",
            }}>
              <div style={{ padding: "12px 14px", overflow: "hidden", minWidth: 0 }}>
                {reopenable ? (
                  <button
                    onClick={() => onReopen(row)}
                    title="Reopen this score"
                    style={{
                      background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer",
                      textAlign: "left", width: "100%", fontFamily: SERIF, fontSize: 13.5,
                      color: INK, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden",
                      textOverflow: "ellipsis", borderBottom: `1px solid ${INK35}`,
                    }}
                  >
                    {preview}
                  </button>
                ) : (
                  <div style={{ fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {preview}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
                  {row.journalist_name && (
                    <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".08em", textTransform: "uppercase", color: INK, background: YEL, padding: "2px 6px" }}>
                      {row.journalist_name}{row.journalist_outlet ? ` · ${row.journalist_outlet}` : ""}
                    </span>
                  )}
                  {row.asset_title && (
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: INK55, border: `1px solid ${INK15}`, padding: "2px 6px" }}>
                      {row.asset_title.length > 34 ? row.asset_title.slice(0, 34) + "…" : row.asset_title}
                    </span>
                  )}
                  {row.authenticity_risk && (
                    <span style={{ fontFamily: GROT, fontSize: 8, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, background: PAPER2, padding: "2px 5px", display: "inline-block" }}>
                      ⚠ AUTHENTICITY FLAG
                    </span>
                  )}
                  {!reopenable && (
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 10.5, color: INK35 }}>
                      scored before reopening was added
                    </span>
                  )}
                </div>
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

// ── Tabs ───────────────────────────────────────────────────────────────────────
/**
 * 2026-09-09: the page was one long scroll — scorer, then score history, then
 * the drafter — so getting back to the scorer after reading a draft meant
 * scrolling past everything. Three tabs instead.
 *
 * The panels are hidden with CSS rather than unmounted. Unmounting would throw
 * away a half-typed pitch the moment you glanced at your drafts, which is worse
 * than any rendering cost.
 */
type Tab = "score" | "drafts" | "history";

function Tabs({
  tab, onChange, draftCount, scoreCount,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  draftCount: number;
  scoreCount: number;
}) {
  const items: { id: Tab; label: string; count: number | null }[] = [
    { id: "score",   label: "Score",   count: null },
    { id: "drafts",  label: "Drafts",  count: draftCount },
    { id: "history", label: "History", count: scoreCount },
  ];

  return (
    <div role="tablist" aria-label="PressIQ sections" style={{ display: "flex", borderBottom: `1px solid ${INK}`, marginBottom: 22 }}>
      {items.map(it => {
        const on = tab === it.id;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.id)}
            style={{
              display: "flex", alignItems: "baseline", gap: 7,
              padding: "9px 18px",
              background: on ? INK : "transparent",
              color: on ? PAPER : INK55,
              border: `1px solid ${on ? INK : INK15}`,
              borderBottom: "none",
              marginBottom: -1,
              marginRight: 4,
              fontFamily: GROT, fontWeight: 800, fontSize: 9.5,
              letterSpacing: ".16em", textTransform: "uppercase",
              cursor: on ? "default" : "pointer",
            }}
          >
            {it.label}
            {it.count != null && it.count > 0 && (
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: 0, color: on ? YEL : INK35 }}>
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PressIQPlatformClient({
  initialScores,
  initialQuery = "",
  initialJournalists,
  initialAssets,
  initialHistory,
  initialDrafts,
}: {
  initialScores: DbScore[];
  initialQuery?: string;
  /** Saved CRM journalists and linkable assets, so a pitch can be aimed at a
   * person and pointed at a thing (state layer, 2026-09-09). */
  initialJournalists: DbJournalist[];
  initialAssets: DbAsset[];
  /** Prior contact per journalist, for the duplicate-pitch warning. */
  initialHistory: JournalistHistory[];
  initialDrafts: DbPitchDraft[];
}) {
  const [scoreSubject, setScoreSubject] = useState("");
  const [newScoreCount, setNewScoreCount] = useState(0);
  const [journalistId, setJournalistId] = useState<string>("");
  const [assetId, setAssetId] = useState<string>("");
  // Reopening remounts the tool core with a stored result, so the whole result
  // view comes back exactly as scored rather than being rebuilt from parts.
  const [reopened, setReopened] = useState<DbScore | null>(null);
  const [draft, setDraft] = useState<{ pitch: string; subject: string } | null>(null);
  const [coreKey, setCoreKey] = useState(0);
  const [tab, setTab] = useState<Tab>("score");
  const companyCtx = useCompanyOptional();
  const router = useRouter();

  const historyById = useMemo(
    () => new Map(initialHistory.map(h => [h.journalistId, h])),
    [initialHistory],
  );
  const journalist = initialJournalists.find(j => j.id === journalistId) ?? null;
  const asset = initialAssets.find(a => a.id === assetId) ?? null;

  /** Both "use this draft" and "reopen this score" land in the Score tab with
   * the tool primed. Tabbing there is a jump rather than the old scroll, so
   * the destination announces itself: the reopened banner, or the draft
   * already sitting in step 2. */
  function toScoreTab() {
    setTab("score");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUseDraft(d: { journalistId: string; subject: string; body: string }) {
    setReopened(null);
    setJournalistId(d.journalistId);
    setDraft({ pitch: d.body, subject: d.subject });
    setCoreKey(k => k + 1);
    toScoreTab();
  }

  function handleReopen(score: DbScore) {
    setReopened(score);
    setDraft(null);
    setJournalistId(score.journalist_id ?? "");
    setAssetId(score.asset_id ?? "");
    setCoreKey(k => k + 1);
    toScoreTab();
  }

  // 2026-09-09: clear the "n new scores this session" hint once a refresh has
  // actually brought the new rows down, so the hint never outlives its own fix.
  // Adjusted during render rather than in an effect — the effect version was a
  // react-hooks/set-state-in-effect error and cost an extra render pass.
  const [seenScoreCount, setSeenScoreCount] = useState(initialScores.length);
  if (seenScoreCount !== initialScores.length) {
    setSeenScoreCount(initialScores.length);
    setNewScoreCount(0);
  }

  // ── transport: Clerk-guarded platform route (no Turnstile, no quota) ────────
  const api = {
    score: async (body: Record<string, unknown>) => {
      // Dashboard-only context. Deliberately added here rather than inside the
      // shared tool core, which is also the public /tools/pressiq component and
      // has no CRM, no assets and no company rows behind it.
      const res = await fetch("/api/emos-platform/pitch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          journalistId: journalistId || undefined,
          assetId: assetId || undefined,
          companyId: companyCtx?.company?.id || undefined,
        }),
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

      {/* ── One context bar: company, journalist, asset ───────────────────
             Until 2026-09-09 this page opened with two stacked full-width
             bars (WORKING FOR, then PITCHING TO) plus the stats strip above
             them — roughly 400px of chrome before the tool itself. They are
             one bar now, and the picker's own add/edit/delete links moved
             behind "Manage". ────────────────────────────────────────────── */}
      <CompanyPicker
        note="Used by every EMOS tool"
        extra={
          <>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: INK, background: YEL, padding: "3px 7px", flexShrink: 0 }}>
              Pitching to
            </span>

            {initialJournalists.length === 0 ? (
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
                No saved journalists yet — find some in JournoCollabIQ.
              </span>
            ) : (
              <select
                value={journalistId}
                onChange={e => setJournalistId(e.target.value)}
                style={{ background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", padding: "6px 11px", outline: "none", cursor: "pointer", maxWidth: 260 }}
              >
                <option value="">Nobody in particular</option>
                {initialJournalists.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.name}{j.outlet ? ` · ${j.outlet}` : ""}{j.beat ? ` · ${j.beat}` : ""}
                  </option>
                ))}
              </select>
            )}

            {initialAssets.length > 0 && (
              <>
                <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>
                  about
                </span>
                <select
                  value={assetId}
                  onChange={e => setAssetId(e.target.value)}
                  style={{ background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", padding: "6px 11px", outline: "none", cursor: "pointer", maxWidth: 240 }}
                >
                  <option value="">No particular asset</option>
                  {initialAssets.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </>
            )}
          </>
        }
        detail={journalist ? (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "baseline" }}>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: INK }}>{journalist.name}</span>
            {journalist.outlet && <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: INK55 }}>{journalist.outlet}</span>}
            {journalist.beat && (
              <span style={{ fontFamily: GROT, fontSize: 8, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: INK55, border: `1px solid ${INK15}`, padding: "1px 6px" }}>
                {journalist.beat}
              </span>
            )}
            {journalist.domain_rating != null && (
              <span style={{ fontFamily: MONO, fontSize: 10, color: INK55 }}>DR {journalist.domain_rating}</span>
            )}
            {journalist.pitches_sent > 0 && (
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
                {journalist.pitches_sent} pitched · {journalist.placements} placed
              </span>
            )}
            <PriorContact
              history={historyById.get(journalist.id)}
              activeCompanyId={companyCtx?.company?.id ?? null}
            />
          </div>
        ) : null}
      />

      <Tabs
        tab={tab}
        onChange={setTab}
        draftCount={initialDrafts.length}
        scoreCount={initialScores.length}
      />

      {/* ── Score ─────────────────────────────────────────────────────────── */}
      <div role="tabpanel" hidden={tab !== "score"}>
        {/* What to aim for (2026-09-10): the same targets the scorer and the
            drafter use, visible where the pitch is written. Collapsed by
            default so it never pushes the tool down. */}
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: "pointer", fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(26,20,16,.55)", padding: "6px 0" }}>
            What a sendable pitch looks like (aim for 85+)
          </summary>
          <div style={{ marginTop: 8 }}>
            <ScoreTargets compact />
          </div>
        </details>
        {reopened && (
          <div style={{ border: `1px solid ${YEL}`, background: "rgba(245,184,31,.12)", padding: "10px 14px", marginBottom: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: INK, background: YEL, padding: "3px 7px" }}>
              Reopened
            </span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
              Showing the score from {fmt(reopened.scored_at)}, exactly as it was returned.
            </span>
            <button
              onClick={() => { setReopened(null); setCoreKey(k => k + 1); }}
              style={{ marginLeft: "auto", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, borderBottom: `1px solid ${INK35}` }}
            >
              Score a new pitch
            </button>
          </div>
        )}

        {/* The shared tool core — full parity with the public tool. */}
        <PressIQToolCore
          key={coreKey}
          api={api}
          initial={{
            // A saved journalist's beat now seeds the relevance field. Before
            // 2026-09-10 only ?beat= did, so "Score this one" on a draft for a
            // named journalist scored with NO beat and the result said
            // "relevance wasn't assessed" while the bar above showed the beat
            // (found in the Efani test run). Seeded on remount only (use draft,
            // reopen), never on a dropdown change, so a half-typed pitch is kept.
            journalistBeat: reopened
              ? (reopened.journalist_query ?? "")
              : (initialQuery || journalist?.beat || ""),
            pitchMode: (initialQuery || journalist?.beat) ? "standalone" : undefined,
            result: (reopened?.score_response as ScoreResponse | undefined) ?? undefined,
            pitch: draft?.pitch ?? reopened?.pitch_text ?? undefined,
            subject: draft?.subject ?? undefined,
            step: draft ? 2 : undefined,
          }}
          hideMasthead
          showStoreToggle={false}
          quotaLine={<>Score a pitch · no rate limit · auto-saves to your history</>}
          pdfAction={handleDownloadPdf}
          splitResetActions
          onScored={(scored, ctx) => {
            setScoreSubject(ctx.subject);
            setNewScoreCount(c => c + 1);
            // 2026-09-09 (gate-03 finding): the score is written by the API route
            // the moment it is produced, but Score History and the stat tiles are
            // server-rendered at page load and nothing told them to look again —
            // so a customer scored a pitch and read "No scores yet". Worse, the
            // "refresh the page" hint below only renders when scores.length > 0,
            // so the FIRST score, the one a new subscriber makes, got no hint at
            // all. actions/signaliq.ts calls revalidatePath for exactly this
            // reason; the pitch path is an API route, so it refreshes from here.
            router.refresh();
            void scored;
          }}
          scoreTabCta={(r) => (
            <TrackCTA result={r} pitchSubject={scoreSubject} journalist={journalist} asset={asset} />
          )}
        />
      </div>

      {/* ── Drafts ────────────────────────────────────────────────────────── */}
      <div role="tabpanel" hidden={tab !== "drafts"}>
        <PitchDrafter
          journalists={initialJournalists}
          assets={initialAssets}
          history={initialHistory}
          savedDrafts={initialDrafts}
          onUseDraft={handleUseDraft}
        />
      </div>

      {/* ── History ───────────────────────────────────────────────────────── */}
      <div role="tabpanel" hidden={tab !== "history"}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>Score History</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK }}>{initialScores.length}</span>
          <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>saved</span>
        </div>
        <ScoreHistory
          scores={initialScores}
          newCount={newScoreCount}
          onReopen={handleReopen}
          openId={reopened?.id ?? null}
        />
      </div>

    </div>
  );
}
