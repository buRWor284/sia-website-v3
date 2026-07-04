import type { Metadata } from "next";
import Link from "next/link";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { GROT, INK, PAPER, SERIF, YEL, INK70 } from "@/lib/tokens";
import { ToolsClientShell, type PipelineTool, type AdjacentTool } from "@/components/tools/ToolsClientShell";

const OG_TITLE = "EMOS Tools · The Earned-Media Pipeline, Free";
const OG_DESC =
  "Six free tools, in the order they're meant to be used: find the story, build the asset, verify it, find the journalist, score the pitch, track the placement. Each is a free taste of the EMOS Platform.";

export const metadata: Metadata = {
  title: "EMOS Tools · The Earned-Media Pipeline, Free",
  description: OG_DESC,
  alternates: { canonical: "/tools" },
  openGraph: { type: "website", title: OG_TITLE, description: OG_DESC, url: "https://www.syedirfanajmal.com/tools" },
  twitter: { card: "summary_large_image", title: OG_TITLE, description: OG_DESC },
};

const PIPELINE: PipelineTool[] = [
  {
    step: "01",
    name: "SignalIQ",
    role: "Find the story",
    blurb:
      "Scans open, primary-source signals — SEC filings, research preprints, search and news-coverage data — and ranks the stories rising fastest before the press catches up.",
    href: "/tools/signaliq",
    howItWorksHref: "/tools/signaliq/how-it-works",
    status: "live",
  },
  {
    step: "02",
    name: "AssetIQ",
    role: "Build the asset",
    blurb:
      "Turns a SignalIQ opportunity into a linkable asset — report, calculator, or quiz — with a 6-step builder engine.",
    href: "/tools/assetiq",
    howItWorksHref: "/tools/assetiq",
    status: "platform",
  },
  {
    step: "03",
    name: "FactCheckIQ",
    role: "Verify the claims",
    blurb:
      "Runs every claim and stat in the asset through a 10-step verification pipeline before a journalist can poke a hole in it.",
    href: "/tools/factcheckiq",
    howItWorksHref: "/tools/factcheckiq",
    status: "platform",
  },
  {
    step: "04",
    name: "JournoCollabIQ",
    role: "Find the journalist",
    blurb:
      "Surfaces the journalists who actively cover your topic, scores their fit, and drafts a tailored pitch angle for each.",
    href: "/tools/journocollabiq",
    howItWorksHref: "/tools/journocollabiq/how-it-works",
    status: "live",
  },
  {
    step: "05",
    name: "PressIQ",
    role: "Score the pitch",
    blurb:
      "Scores a HARO, Qwoted, or Featured pitch against a 32-point system and the EMOS framework, with the three fixes that move it most.",
    href: "/tools/pressiq",
    howItWorksHref: "/tools/pressiq/how-it-works",
    status: "live",
  },
  {
    step: "06",
    name: "CoverageIQ",
    role: "Track the placement",
    blurb:
      "Logs every pitch from drafted to placed, tracks journalist relationships and follow-ups, and shows your PESO coverage mix.",
    href: "/tools/coverageiq",
    howItWorksHref: "/tools/coverageiq/how-it-works",
    status: "live",
  },
];

const ADJACENT: AdjacentTool[] = [
  {
    name: "PartnerCollabIQ",
    role: "Partnership Intelligence",
    blurb:
      "Discover non-obvious co-marketing partners, score them, generate personalised outreach, and export a 90-day campaign brief.",
    href: "/tools/partnercollabiq",
  },
  {
    name: "Authority ROI Calculator",
    role: "Renting vs. owning",
    blurb:
      "What agency retainers, bought links, and sponsored placements actually cost over a year, versus owning authority through earned media.",
    href: "/tools/authority-calculator",
  },
];

export default function ToolsIndexPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {/* Compact single-bar masthead — matches /resources hero pattern. */}
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
          6 Tools · Free
        </span>

        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(20px,2.3vw,28px)", lineHeight: 1.15, letterSpacing: "-0.02em", color: INK, margin: 0, flexShrink: 0 }}>
          The earned-media pipeline, <em style={{ fontStyle: "italic" }}>one tool at a time.</em>
        </h1>

        <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: INK70, margin: 0, maxWidth: 340, flex: "1 1 260px" }}>
          Six free tools, in the order they&rsquo;re meant to be used. <Link href="/emos" style={{ color: INK }}>EMOS Academy</Link> sequences all six for you, guided.
        </p>

        <a
          href="/emos"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", flexShrink: 0, marginLeft: "auto" }}
        >
          Explore EMOS Academy →
        </a>
      </section>

      <ToolsClientShell pipeline={PIPELINE} adjacent={ADJACENT} />

      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
