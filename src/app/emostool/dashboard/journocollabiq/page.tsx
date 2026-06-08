import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getJournalists } from "@/app/emostool/actions/coverageiq";
import JournoCollabIQClient from "@/components/emostool/JournoCollabIQClient";
import PipelineNav from "@/components/emostool/PipelineNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "JournoCollabIQ — EMOS Platform",
};

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

const PAPER  = "#f1ebde";
const INK    = "#1a1410";
const INK15  = "rgba(26,20,16,.15)";
const INK55  = "rgba(26,20,16,.55)";
const YEL    = "#f5b81f";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

export default async function JournoCollabIQPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string; topic?: string; beat?: string; story?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  const params = await searchParams;

  // Pre-fill from AssetIQ or SignalIQ context
  const prefillBeat  = params.topic  ? decodeURIComponent(params.topic)
                     : params.beat   ? decodeURIComponent(params.beat)
                     : "";
  const prefillStory = params.story  ? decodeURIComponent(params.story)  : "";

  const journalists = await getJournalists();

  const pitchesTotal    = journalists.reduce((s, j) => s + j.pitches_sent, 0);
  const placementsTotal = journalists.reduce((s, j) => s + j.placements, 0);
  const conversionRate  = pitchesTotal > 0
    ? Math.round((placementsTotal / pitchesTotal) * 100)
    : 0;
  const avgDR = journalists.filter(j => j.domain_rating).length > 0
    ? Math.round(journalists.filter(j => j.domain_rating).reduce((s, j) => s + (j.domain_rating ?? 0), 0) / journalists.filter(j => j.domain_rating).length)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>

      {/* Header */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/emostool/dashboard" style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}>← EMOS</a>
            <span style={{ color: "rgba(241,235,222,.2)" }}>|</span>
            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>JournoCollab<span style={{ color: YEL }}>IQ</span></span>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>Journalist Discovery</span>
          </div>
          <a href="/emostool/dashboard/pressiq"
            style={{ padding: "6px 14px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none" }}>
            Score a pitch →
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>

        {/* Context banner */}
        {(prefillBeat || prefillStory) && (
          <div style={{ background: "rgba(245,184,31,.10)", border: `1px solid ${YEL}`, padding: "10px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", background: YEL, color: INK, padding: "2px 7px" }}>From pipeline</span>
            {prefillBeat && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}><strong>Beat:</strong> {prefillBeat}</span>}
            {prefillStory && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}><strong>Story:</strong> {prefillStory.slice(0, 100)}{prefillStory.length > 100 ? "…" : ""}</span>}
          </div>
        )}

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
          {[
            { num: journalists.length, label: "In CRM" },
            { num: pitchesTotal,       label: "Pitches sent" },
            { num: placementsTotal,    label: "Placements" },
            { num: avgDR > 0 ? avgDR : "—", label: "Avg DR" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "16px 16px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: INK55, marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {conversionRate > 0 && pitchesTotal >= 5 && (
          <div style={{ background: INK, color: PAPER, padding: "10px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em" }}>{conversionRate}%</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.65)" }}>
              placement rate across {pitchesTotal} pitches
            </span>
          </div>
        )}

        <JournoCollabIQClient
          initialJournalists={journalists}
          prefillBeat={prefillBeat}
          prefillStory={prefillStory}
        />

        <PipelineNav current="collab" />
      </div>
    </div>
  );
}
