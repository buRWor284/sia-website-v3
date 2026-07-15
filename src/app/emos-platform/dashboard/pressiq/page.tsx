import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import PressIQPlatformClient from "@/components/emostool/PressIQPlatformClient";
import PipelineNav from "@/components/emostool/PipelineNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "PressIQ | EMOS Platform",
};

const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK15  = "rgba(26,20,16,.15)";
const INK55  = "rgba(26,20,16,.55)";
const YEL    = "#f5b81f";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

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

export default async function PressIQPlatformPage({
  searchParams,
}: {
  searchParams: Promise<{ beat?: string; journalist?: string; assetTitle?: string; assetType?: string; assetIdea?: string }>;
}) {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/emos-platform/signin");

  const params = await searchParams;
  const assetTitle = params.assetTitle ? decodeURIComponent(params.assetTitle) : null;
  const assetType  = params.assetType  ? decodeURIComponent(params.assetType)  : null;
  const assetIdea  = params.assetIdea  ? decodeURIComponent(params.assetIdea)  : null;

  // Build query pre-fill: beat + journalist + asset context combined
  const beatPart      = params.beat       ? decodeURIComponent(params.beat)       : "";
  const journalistPart = params.journalist ? decodeURIComponent(params.journalist) : "";
  const assetPart     = assetTitle        ? `, pitching asset: ${assetTitle}`    : "";
  const initialQuery  = beatPart
    ? `${beatPart}${assetPart}`
    : journalistPart
    ? `${journalistPart}${assetPart}`
    : "";

  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");

  const { data: scores } = await db
    .from("pressiq_scores")
    .select("id, pitch_text, journalist_query, platform, composite_score, tier, layer1_score, layer2_score, layer3_score, authenticity_risk, outcome, scored_at")
    .order("scored_at", { ascending: false })
    .limit(50);

  const rows = (scores ?? []) as DbScore[];

  const avgScore = rows.length ? Math.round(rows.reduce((s, r) => s + r.composite_score, 0) / rows.length) : 0;
  const eliteCount = rows.filter(r => r.tier === "Elite" || r.tier === "Strong").length;
  const placedCount = rows.filter(r => r.outcome === "placed").length;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>

      {/* Header */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/emos-platform/dashboard" style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}>← EMOS</a>
            <span style={{ color: "rgba(241,235,222,.2)" }}>|</span>
            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>Press<span style={{ color: YEL }}>IQ</span></span>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>Pitch Scorer</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>

        {/* Asset context banner — shown when arriving from JournoCollabIQ */}
        {assetTitle && (
          <div style={{ background: "rgba(245,184,31,.12)", border: `1px solid ${YEL}`, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: INK, background: YEL, padding: "3px 8px", flexShrink: 0 }}>Scoring pitches for</span>
            <div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, color: INK }}>{assetTitle}</div>
              {assetType && <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, marginTop: 2 }}>{assetType.replace(/_/g, " ")}</div>}
              {assetIdea && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, marginTop: 4, lineHeight: 1.45 }}>{assetIdea}</div>}
            </div>
            <a href="/emos-platform/dashboard/assetiq" style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, textDecoration: "none", borderBottom: "1px solid rgba(26,20,16,.2)", flexShrink: 0 }}>
              ← Back to AssetIQ
            </a>
          </div>
        )}

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
          {[
            { num: rows.length,  label: "Scores Saved" },
            { num: avgScore,     label: "Avg Score" },
            { num: eliteCount,   label: "Elite / Strong" },
            { num: placedCount,  label: "Confirmed Placed" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "18px 16px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginTop: 5 }}>{item.label}</div>
            </div>
          ))}
        </div>

        <PressIQPlatformClient initialScores={rows} initialQuery={initialQuery} />

        <PipelineNav
          current="press"
          nextHref={
            rows[0]?.journalist_query
              ? `/emos-platform/dashboard/coverageiq?pitch=${encodeURIComponent(rows[0].journalist_query.slice(0, 200))}`
              : undefined
          }
        />
      </div>
    </div>
  );
}
