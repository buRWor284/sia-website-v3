import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSignals } from "@/app/emostool/actions/signaliq";
import SignalIQPlatformClient from "@/components/emostool/SignalIQPlatformClient";
import PipelineNav from "@/components/emostool/PipelineNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "SignalIQ | EMOS Platform",
};

// ── design tokens ──────────────────────────────────────────────────────────────
const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK15  = "rgba(26,20,16,.15)";
const INK55  = "rgba(26,20,16,.55)";
const YEL    = "#f5b81f";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";

export default async function SignalIQPlatformPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const signals = await getSignals();

  // Build next-tool href: point to AssetIQ with most recent saved signal
  const latestSignal = signals.find(s => s.status === "saved") ?? signals[0];
  const assetIQHref = latestSignal
    ? `/emostool/dashboard/assetiq?signal=${latestSignal.id}&headline=${encodeURIComponent(latestSignal.headline)}`
    : "/emostool/dashboard/assetiq";

  const counts = {
    new:      signals.filter(s => s.status === "new").length,
    saved:    signals.filter(s => s.status === "saved").length,
    pitched:  signals.filter(s => s.status === "pitched").length,
    archived: signals.filter(s => s.status === "archived").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>

      {/* Header */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/emostool/dashboard" style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}>← EMOS</a>
            <span style={{ color: "rgba(241,235,222,.2)" }}>|</span>
            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>Signal<span style={{ color: YEL }}>IQ</span></span>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>Story Detection</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
          {(["new","saved","pitched","archived"] as const).map((s, i) => (
            <div key={s} style={{ padding: "16px 14px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em" }}>{counts[s]}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: INK55, marginTop: 4 }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Client shell: scan UI + library */}
        <SignalIQPlatformClient initialSignals={signals} />

        <PipelineNav current="signal" nextHref={assetIQHref} />
      </div>
    </div>
  );
}
