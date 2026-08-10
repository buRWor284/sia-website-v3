import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";

export const metadata: Metadata = {
  title: "Resources · Playbooks, Guides & Tools",
  description:
    "Free playbooks: personal branding, neuromarketing, storytelling, and SEO-PR tools. Practical guides from a fractional CMO with 22+ years in digital marketing.",
  openGraph: {
    title: "Resources · Playbooks, Guides & Tools",
    description: "Free playbooks and tools on personal branding, neuromarketing, storytelling, and SEO-PR.",
  },
  alternates: { canonical: "/resources" },
};
import { ResourcesClientShell, RESOURCE_COUNT } from "@/components/resources/ResourcesClientShell";
import { getAllEpisodes } from "@/lib/podcast";
import { GROT, INK, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";
import { ScrollButtons } from "@/components/ScrollButtons";

// ─── Hero ─────────────────────────────────────────────────────────────────────
// Compact single-bar masthead — badge + headline + short subhead + CTA, one row.
// (Previous version was a 3-col newspaper grid with a vanity stat block and a
// duplicate topic index that just re-teased the filters already in the shell below.)

const Hero = () => (
  <section
    style={{
      background: PAPER,
      borderBottom: `1px solid ${INK}`,
      padding: "18px 56px",
      display: "flex",
      alignItems: "center",
      gap: 20,
      flexWrap: "wrap",
    }}
  >
    <span style={{ display: "inline-block", padding: "4px 9px 5px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", flexShrink: 0 }}>
      {/* Derived from CONTENT in ResourcesClientShell.tsx — cannot go stale */}
      {RESOURCE_COUNT} Resources
    </span>

    <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(20px,2.3vw,28px)", lineHeight: 1.15, letterSpacing: "-0.02em", color: INK, margin: 0, flexShrink: 0 }}>
      The frameworks <em style={{ fontStyle: "italic" }}>behind the bylines.</em>
    </h1>

    <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: INK70, margin: 0, maxWidth: 340, flex: "1 1 260px" }}>
      Interactive tools, playbooks, and original research on media, PR, and SEO.
    </p>

    <a
      href="#resources"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", flexShrink: 0, marginLeft: "auto" }}
    >
      Browse All →
    </a>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Hero />
      <ResourcesClientShell episodeCount={getAllEpisodes().length} />
      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
