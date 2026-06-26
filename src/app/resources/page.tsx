import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";

export const metadata: Metadata = {
  title: "Resources · Playbooks, Guides & Tools",
  description:
    "Free playbooks: personal branding, neuromarketing, storytelling, and SEO-PR tools. Practical guides from a fractional CMO with 20+ years in digital marketing.",
  openGraph: {
    title: "Resources · Playbooks, Guides & Tools",
    description: "Free playbooks and tools on personal branding, neuromarketing, storytelling, and SEO-PR.",
  },
  alternates: { canonical: "/resources" },
};
import { ResourcesClientShell } from "@/components/resources/ResourcesClientShell";
import { GROT, INK, INK15, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";
import { ScrollButtons } from "@/components/ScrollButtons";

// ─── Hero ─────────────────────────────────────────────────────────────────────
// Newspaper editorial layout: meta strip · 3-col grid (stat | headline | topics)

const Hero = () => (
  <section style={{ background: PAPER, borderBottom: `1px solid ${INK}` }}>

    {/* ─── Meta strip ───────────────────────────────────────────────────── */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "8px 56px",
        borderBottom: `1px solid ${INK15}`,
      }}
    >
      {(["A Working Library", "Earned Media", "Bespoke Media"] as const).map((t, i) => (
        <span key={t} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {i > 0 && <span style={{ color: "rgba(26,20,16,.35)", fontSize: 11 }}>·</span>}
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55 }}>{t}</span>
        </span>
      ))}
    </div>

    {/* ─── 3-col newspaper grid ─────────────────────────────────────────── */}
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 210px", padding: "0 56px" }}>

      {/* Left: stat */}
      <div style={{ padding: "36px 28px 36px 0", borderRight: `1px solid ${INK}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 72, lineHeight: 0.9, letterSpacing: "-0.04em", color: INK, borderBottom: `2px solid ${YEL}`, paddingBottom: 4, display: "inline-block" }}>
            20
          </div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, marginTop: 10 }}>
            Resources
          </div>
        </div>
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: `1px solid ${INK15}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {["Platforms", "Infographics"].map((l) => (
            <span key={l} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: INK55 }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Centre: headline */}
      <div style={{ padding: "48px 56px", position: "relative", overflow: "hidden", borderRight: `1px solid ${INK}` }}>
        <div aria-hidden style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px,10vw,136px)", letterSpacing: "-0.04em", color: INK, opacity: 0.03, whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", lineHeight: 1 }}>RESOURCES</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.0, letterSpacing: "-0.025em", color: INK, margin: "0 0 24px" }}>
            The frameworks<br /><em>behind the bylines.</em>
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: INK70, maxWidth: 460, margin: "0 0 32px" }}>
            Interactive tools, playbooks, and original research on media, digital PR, and SEO — packaged to use, not just read.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <a href="#resources" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>Browse All →</a>
            <a href="/about" style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, textDecoration: "none" }}>Syed Irfan Ajmal ↗</a>
          </div>
        </div>
      </div>

      {/* Right: topic index */}
      <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: `1px solid ${INK15}` }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, marginBottom: 7 }}>GEO</div>
          <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: INK70 }}>Generative Engine Optimisation — how to earn citation in AI-generated answers.</div>
        </div>
        <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: `1px solid ${INK15}` }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, marginBottom: 7 }}>SEO-PR</div>
          <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: INK70 }}>Earned media that ranks. Coverage that compounds.</div>
        </div>
        <div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, marginBottom: 7 }}>Press</div>
          <a href="#res-press" style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: INK, textDecoration: "none" }}>Where the writing has gone →</a>
        </div>
      </div>

    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Hero />
      <ResourcesClientShell />
      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
