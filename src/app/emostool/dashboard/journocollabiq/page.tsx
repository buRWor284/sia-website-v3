import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getJournalists } from "@/app/emostool/actions/coverageiq";
import JournoCollabIQClient from "@/components/emostool/JournoCollabIQClient";
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

export default async function JournoCollabIQPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  const journalists = await getJournalists();

  const pitchesTotal = journalists.reduce((s, j) => s + j.pitches_sent, 0);
  const placementsTotal = journalists.reduce((s, j) => s + j.placements, 0);
  const conversionRate = pitchesTotal > 0
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
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>Journalist CRM</span>
          </div>
          <a href="/emostool/dashboard/pressiq"
            style={{ padding: "6px 14px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none" }}>
            Score a pitch →
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
          {[
            { num: journalists.length, label: "Journalists" },
            { num: pitchesTotal,       label: "Pitches Sent" },
            { num: placementsTotal,    label: "Placements" },
            { num: avgDR > 0 ? avgDR : "—", label: "Avg DR" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "18px 16px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginTop: 5 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Conversion rate banner */}
        {pitchesTotal >= 5 && (
          <div style={{ background: INK, color: PAPER, padding: "12px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em" }}>{conversionRate}%</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "rgba(241,235,222,.7)" }}>
              placement conversion rate across {pitchesTotal} pitches to {journalists.length} journalist{journalists.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <JournoCollabIQClient initialJournalists={journalists} />

      </div>
    </div>
  );
}
