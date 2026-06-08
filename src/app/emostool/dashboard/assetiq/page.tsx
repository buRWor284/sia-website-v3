import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAssets } from "@/app/emostool/actions/assetiq";
import { getSignals } from "@/app/emostool/actions/signaliq";
import AssetIQClient from "@/components/emostool/AssetIQClient";
import PipelineNav from "@/components/emostool/PipelineNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "AssetIQ — EMOS Platform",
};

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

const PAPER  = "#f1ebde";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const YEL    = "#f5b81f";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";

export default async function AssetIQPage({
  searchParams,
}: {
  searchParams: Promise<{ signal?: string; headline?: string; assetIdea?: string; dataBrief?: string; pitchAngle?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  const params = await searchParams;
  const signalId    = params.signal ?? null;
  const assetIdea   = params.assetIdea   ? decodeURIComponent(params.assetIdea)   : null;
  const dataBrief   = params.dataBrief   ? decodeURIComponent(params.dataBrief)   : null;
  const pitchAngle  = params.pitchAngle  ? decodeURIComponent(params.pitchAngle)  : null;
  const signalHeadlineFromParam = params.headline ? decodeURIComponent(params.headline) : null;

  // If signal ID provided, fetch its headline from DB as backup
  let signalHeadline = signalHeadlineFromParam;
  if (signalId && !signalHeadline) {
    const signals = await getSignals();
    const sig = signals.find(s => s.id === signalId);
    if (sig) signalHeadline = sig.headline;
  }

  const assets = await getAssets();

  // Pre-fill title from asset idea (preferred) or signal headline
  const prefillTitle = assetIdea
    ? assetIdea.length > 80 ? assetIdea.slice(0, 80) : assetIdea
    : signalHeadline
    ? signalHeadline.length > 80 ? signalHeadline.slice(0, 80) + "…" : signalHeadline
    : "";

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>

      {/* Header */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", height: 52 }}>
          <a href="/emostool/dashboard" style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}>← EMOS</a>
          <span style={{ color: "rgba(241,235,222,.2)", margin: "0 12px" }}>|</span>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>Asset<span style={{ color: YEL }}>IQ</span></span>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", marginLeft: 10 }}>Linkable Asset Builder</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>

        {/* Signal context banner */}
        {signalHeadline && (
          <div style={{ background: "rgba(245,184,31,.12)", border: `1px solid ${YEL}`, padding: "12px 18px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: INK, background: YEL, padding: "3px 8px" }}>From SignalIQ</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>{signalHeadline}</span>
            <a href="/emostool/dashboard/signaliq" style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, textDecoration: "none", borderBottom: "1px solid rgba(26,20,16,.2)" }}>
              ← Back to SignalIQ
            </a>
          </div>
        )}

        <AssetIQClient
          initialAssets={assets}
          prefillTitle={prefillTitle}
          signalId={signalId}
          signalHeadline={signalHeadline}
          assetIdea={assetIdea}
          dataBrief={dataBrief}
          pitchAngle={pitchAngle}
        />

        <PipelineNav current="asset" />
      </div>
    </div>
  );
}
