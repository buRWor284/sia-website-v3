"use client";

/**
 * PressIQ Platform — full authenticated scoring interface.
 *
 * Layout:
 *   ① Score panel — pitch textarea + optional journalist query + platform selector
 *   ② Results — composite score, tier, top fixes, "Track this pitch →" CTA
 *   ③ Score history table (server-loaded, refreshes hint after new score)
 */

import React, { useState, useTransition } from "react";
import { PLATFORMS } from "@/lib/pitch/config";
import { createPitch } from "@/app/emostool/actions/coverageiq";
import type { Platform, ScoreResponse } from "@/lib/pitch/types";

// ── design tokens ──────────────────────────────────────────────────────────────
const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK70  = "rgba(26,20,16,.70)";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const AMBER  = "#d99211";
const RED    = "#c14a32";
const BLUE   = "#2d5393";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

// ── tier helpers ───────────────────────────────────────────────────────────────
function tierStyle(score: number): { color: string; label: string; bg: string; fg: string } {
  if (score >= 85) return { color: GREEN, label: "Elite",      bg: YEL,           fg: INK   };
  if (score >= 65) return { color: BLUE,  label: "Strong",     bg: INK,           fg: YEL   };
  if (score >= 40) return { color: AMBER, label: "Developing", bg: "transparent", fg: INK   };
  return              { color: RED,   label: "Needs Work", bg: PAPER2,        fg: INK55 };
}

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

// ── Score result panel ─────────────────────────────────────────────────────────

function ScoreResult({
  result,
  pitchSubject,
}: {
  result: ScoreResponse;
  pitchSubject: string;
}) {
  const [tracking, startTrack] = useTransition();
  const [tracked, setTracked] = useState<string | null>(null);
  const ts = tierStyle(result.composite);

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
    <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
      {/* Score header */}
      <div style={{ background: INK, color: PAPER, padding: "20px 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: "-0.03em" }}>{result.composite}</div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", marginTop: 4 }}>/ 100</div>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{
            display: "inline-block", padding: "4px 12px 5px",
            background: ts.bg, color: ts.fg,
            border: ts.bg === "transparent" ? `1px solid ${INK35}` : "none",
            fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {ts.label}
          </span>
          {result.authenticityRisk?.flagged && (
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: AMBER, marginBottom: 6 }}>
              ⚠ {result.authenticityRisk.note ?? "This pitch reads as templated — personalise before sending."}
            </div>
          )}
          {result.strongestLine && (
            <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.7)", lineHeight: 1.4 }}>
              &ldquo;{result.strongestLine}&rdquo;
            </p>
          )}
        </div>
        {/* Layer scores */}
        <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
          {[
            { label: "Mechanics", score: result.areas.objective.score },
            { label: "SIA 7-Step", score: result.areas.checklist.score },
            { label: "EMOS", score: result.areas.emos
                ? Math.round(((result.areas.emos.storytelling?.score ?? 0) + (result.areas.emos.neuromarketing?.score ?? 0) + (result.areas.emos.personalBrand?.score ?? 0)) / 3)
                : null },
          ].map(({ label, score }) => (
            score != null ? (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, lineHeight: 1, color: PAPER }}>{score}</div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 7.5, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", marginTop: 3 }}>{label}</div>
              </div>
            ) : null
          ))}
        </div>
      </div>

      {/* Top fixes */}
      {result.topFixes.length > 0 && (
        <div style={{ background: PAPER2, padding: "16px 24px", borderBottom: `1px solid ${INK15}` }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>
            Top fixes
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.topFixes.slice(0, 3).map((fix, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: RED, lineHeight: 1.1, flexShrink: 0 }}>↑</span>
                <div>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: INK, marginBottom: 2 }}>
                    {fix.area}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.45 }}>{fix.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dimension bars */}
      {result.radar && result.radar.length > 0 && (
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${INK15}` }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>
            Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.radar.map(axis => {
              const pct = Math.min(axis.score, 100);
              const c = pct >= 75 ? GREEN : pct >= 45 ? AMBER : RED;
              return (
                <div key={axis.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: INK }}>{axis.label}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, color: c }}>{axis.score}</span>
                  </div>
                  <div style={{ height: 4, background: INK15 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: c, transition: "width .5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Track CTA */}
      <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        {tracked ? (
          <a
            href="/emostool/dashboard/coverageiq"
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
}: {
  initialScores: DbScore[];
}) {
  const [pitch, setPitch] = useState("");
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("haro");
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [newScoreCount, setNewScoreCount] = useState(0);

  async function handleScore() {
    if (!pitch.trim() || pitch.trim().length < 40) {
      setScoreError("Paste a pitch of at least a few sentences.");
      return;
    }
    setScoreError(null);
    setScoring(true);
    setResult(null);
    try {
      const res = await fetch("/api/emostool/pitch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch, query: query.trim() || undefined, platform, store: true }),
      });
      const data = await res.json();
      if (!res.ok) { setScoreError(data.error || "Scoring failed."); return; }
      setResult(data as ScoreResponse);
      setNewScoreCount(c => c + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setScoreError("Network error — please try again.");
    } finally {
      setScoring(false);
    }
  }

  // Extract a subject from the pitch for the CoverageIQ draft
  const pitchSubject = (() => {
    const lines = pitch.split("\n").map(l => l.trim()).filter(Boolean);
    const subjectLine = lines.find(l => /^subject:/i.test(l));
    if (subjectLine) return subjectLine.replace(/^subject:\s*/i, "");
    return lines[0]?.slice(0, 100) ?? "Pitch from PressIQ";
  })();

  return (
    <div style={{ fontFamily: SERIF }}>

      {/* ── Result (shown above scorer after a successful score) ──────────── */}
      {result && (
        <div style={{ marginBottom: 32 }}>
          <ScoreResult result={result} pitchSubject={pitchSubject} />
        </div>
      )}

      {/* ── Score panel ───────────────────────────────────────────────────── */}
      <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "20px 24px", marginBottom: 32 }}>
        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 16 }}>
          Score a pitch — no rate limit
        </div>

        {/* Platform selector */}
        <div style={{ display: "flex", gap: 0, border: `1px solid ${INK15}`, marginBottom: 14, width: "fit-content" }}>
          {PLATFORMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              style={{
                padding: "8px 14px",
                background: platform === p.id ? INK : "transparent",
                color: platform === p.id ? PAPER : INK55,
                border: "none",
                borderRight: i < PLATFORMS.length - 1 ? `1px solid ${INK15}` : "none",
                fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Journalist beat / query (optional) */}
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Journalist beat or HARO query (optional — improves relevance score)"
          style={{
            width: "100%", boxSizing: "border-box",
            background: PAPER, border: `1px solid ${INK15}`,
            color: INK, fontFamily: SERIF, fontSize: 14, padding: "10px 13px",
            marginBottom: 12, outline: "none",
          }}
        />

        {/* Pitch textarea */}
        <textarea
          value={pitch}
          onChange={e => setPitch(e.target.value)}
          rows={10}
          placeholder="Paste your pitch here (subject line, body, sign-off)…"
          style={{
            width: "100%", boxSizing: "border-box",
            background: PAPER, border: `1px solid ${INK15}`,
            color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.6,
            padding: "13px 14px", resize: "vertical", outline: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          <button
            onClick={handleScore}
            disabled={scoring}
            style={{
              padding: "12px 28px", border: "none",
              background: scoring ? "rgba(26,20,16,.12)" : INK,
              color: scoring ? INK55 : PAPER,
              fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase",
              cursor: scoring ? "wait" : "pointer",
            }}
          >
            {scoring ? "Scoring…" : "Score this pitch →"}
          </button>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
            Score auto-saves to your history below
          </span>
        </div>

        {scoreError && (
          <div style={{ marginTop: 12, padding: "10px 14px", border: `1px solid ${RED}`, background: "rgba(193,74,50,.06)", fontFamily: SERIF, fontSize: 14, color: INK }}>
            {scoreError}
          </div>
        )}
      </div>

      {/* ── Score history ─────────────────────────────────────────────────── */}
      <div>
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
