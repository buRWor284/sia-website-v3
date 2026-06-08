import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "PressIQ — EMOS Platform",
};

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

const PAPER   = "#f1ebde";
const PAPER2  = "#e8e0cc";
const INK     = "#1a1410";
const INK70   = "rgba(26,20,16,.70)";
const INK55   = "rgba(26,20,16,.55)";
const INK35   = "rgba(26,20,16,.32)";
const INK15   = "rgba(26,20,16,.15)";
const YEL     = "#f5b81f";

const TIER_COLORS: Record<string, { bg: string; fg: string }> = {
  Elite:        { bg: YEL,         fg: INK },
  Strong:       { bg: INK,         fg: YEL },
  Developing:   { bg: "transparent", fg: INK },
  "Needs Work": { bg: PAPER2,      fg: INK55 },
};

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

export default async function PressIQPlatformPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");

  const { data: scores, error } = await db
    .from("pressiq_scores")
    .select("id, pitch_text, journalist_query, platform, composite_score, tier, layer1_score, layer2_score, layer3_score, authenticity_risk, outcome, scored_at")
    .order("scored_at", { ascending: false })
    .limit(50);

  const rows = (scores ?? []) as DbScore[];

  // Stats
  const avgScore = rows.length ? Math.round(rows.reduce((s, r) => s + r.composite_score, 0) / rows.length) : 0;
  const eliteCount = rows.filter(r => r.tier === "Elite" || r.tier === "Strong").length;
  const placedCount = rows.filter(r => r.outcome === "placed").length;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "var(--font-serif)" }}>

      {/* Header */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/emostool/dashboard" style={{ fontFamily: "var(--font-grot)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}>← EMOS</a>
            <span style={{ color: "rgba(241,235,222,.2)" }}>|</span>
            <span style={{ fontFamily: "var(--font-grot)", fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Press<span style={{ color: YEL }}>IQ</span></span>
            <span style={{ fontFamily: "var(--font-grot)", fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>Score History</span>
          </div>
          <a href="/tools/pressiq" target="_blank" rel="noopener noreferrer"
            style={{ padding: "7px 16px", background: YEL, color: INK, fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
            Score a Pitch ↗
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>

        {/* Explainer */}
        <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "14px 20px", marginBottom: 32 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: INK70 }}>
            Every pitch you score at <strong>/tools/pressiq</strong> while logged in is saved here automatically. Scores are the raw input to the EMOS outcome flywheel.
          </span>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "#fff0f0", border: "1px solid #ffcccc", marginBottom: 24, fontFamily: "var(--font-grot)", fontSize: 12 }}>
            Could not load scores: {error.message}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
          {[
            { num: rows.length,  label: "Scores Saved" },
            { num: avgScore,     label: "Avg Score" },
            { num: eliteCount,   label: "Elite / Strong" },
            { num: placedCount,  label: "Confirmed Placed" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "20px 16px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 28, lineHeight: 1, color: INK, letterSpacing: "-0.02em" }}>{item.num}</div>
              <div style={{ fontFamily: "var(--font-grot)", fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: "48px 32px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
            <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16, color: INK55, margin: "0 0 16px" }}>
              No scores yet. Score your first pitch to start building the flywheel.
            </p>
            <a href="/tools/pressiq" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", padding: "10px 24px", background: INK, color: PAPER, fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
              Open PressIQ →
            </a>
          </div>
        ) : (
          <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 72px 72px 72px 80px 90px", background: INK, color: PAPER }}>
              {["Pitch", "Score", "L1", "L2", "L3", "Platform", "Scored"].map((h, i) => (
                <div key={h} style={{ padding: "11px 12px", fontFamily: "var(--font-grot)", fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", borderRight: i < 6 ? "1px solid rgba(241,235,222,.15)" : "none" }}>
                  {h}
                </div>
              ))}
            </div>

            {rows.map((row, idx) => {
              const tierStyle = TIER_COLORS[row.tier] ?? TIER_COLORS["Needs Work"];
              const pitchPreview = row.pitch_text
                ? row.pitch_text.replace(/\n/g, " ").substring(0, 80)
                : "(stored without text)";
              return (
                <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 72px 72px 72px 72px 80px 90px", borderBottom: idx < rows.length - 1 ? `1px solid ${INK15}` : "none" }}>
                  <div style={{ padding: "12px 14px", overflow: "hidden", minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: INK, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pitchPreview}
                    </div>
                    {row.authenticity_risk && (
                      <span style={{ fontFamily: "var(--font-grot)", fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, background: PAPER2, padding: "2px 6px", marginTop: 4, display: "inline-block" }}>
                        ⚠ AUTHENTICITY FLAG
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>{row.composite_score}</span>
                    <span style={{ display: "inline-block", padding: "2px 6px 3px", background: tierStyle.bg, color: tierStyle.fg, border: tierStyle.bg === "transparent" ? `1px solid ${INK35}` : "none", fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      {row.tier}
                    </span>
                  </div>
                  {[row.layer1_score, row.layer2_score, row.layer3_score].map((s, i) => (
                    <div key={i} style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: s !== null ? INK : INK35 }}>
                        {s !== null ? s : "—"}
                      </span>
                    </div>
                  ))}
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-grot)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>
                      {row.platform ?? "—"}
                    </span>
                  </div>
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{fmt(row.scored_at)}</span>
                    <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 10, color: INK55, marginTop: 1 }}>{daysAgo(row.scored_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {rows.length > 0 && (
          <div style={{ marginTop: 12, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: INK55 }}>
            {rows.length} score{rows.length !== 1 ? "s" : ""} saved · Outcomes back-fill automatically when pitches are marked placed in CoverageIQ
          </div>
        )}
      </div>
    </div>
  );
}
