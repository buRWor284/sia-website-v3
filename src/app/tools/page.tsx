import type { Metadata } from "next";
import Link from "next/link";
import { Colophon, Subscriptions } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { GROT, INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";

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

type Status = "live" | "platform";

interface PipelineTool {
  step: string;
  name: string;
  role: string;
  blurb: string;
  href: string;
  status: Status;
}

const PIPELINE: PipelineTool[] = [
  {
    step: "01",
    name: "SignalIQ",
    role: "Find the story",
    blurb:
      "Scans open, primary-source signals — SEC filings, research preprints, search and news-coverage data — and ranks the stories rising fastest before the press catches up.",
    href: "/tools/signaliq",
    status: "live",
  },
  {
    step: "02",
    name: "AssetIQ",
    role: "Build the asset",
    blurb:
      "Turns a SignalIQ opportunity into a linkable asset — report, calculator, or quiz — with a 6-step builder engine.",
    href: "/tools/assetiq",
    status: "platform",
  },
  {
    step: "03",
    name: "FactCheckIQ",
    role: "Verify the claims",
    blurb:
      "Runs every claim and stat in the asset through a 10-step verification pipeline before a journalist can poke a hole in it.",
    href: "/tools/factcheckiq",
    status: "platform",
  },
  {
    step: "04",
    name: "JournoCollabIQ",
    role: "Find the journalist",
    blurb:
      "Surfaces the journalists who actively cover your topic, scores their fit, and drafts a tailored pitch angle for each.",
    href: "/tools/journocollabiq",
    status: "live",
  },
  {
    step: "05",
    name: "PressIQ",
    role: "Score the pitch",
    blurb:
      "Scores a HARO, Qwoted, or Featured pitch against a 32-point system and the EMOS framework, with the three fixes that move it most.",
    href: "/tools/pressiq",
    status: "live",
  },
  {
    step: "06",
    name: "CoverageIQ",
    role: "Track the placement",
    blurb:
      "Logs every pitch from drafted to placed, tracks journalist relationships and follow-ups, and shows your PESO coverage mix.",
    href: "/tools/coverageiq",
    status: "live",
  },
];

const ADJACENT = [
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

function StatusTag({ status }: { status: Status }) {
  return (
    <span
      style={{
        fontFamily: GROT,
        fontWeight: 800,
        fontSize: 8.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "3px 7px",
        background: status === "live" ? "#3e6b45" : INK,
        color: status === "live" ? "#fff" : YEL,
      }}
    >
      {status === "live" ? "Live · Free" : "Teaser · Inside EMOS"}
    </span>
  );
}

export default function ToolsIndexPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: PAPER, borderBottom: `1px solid ${INK}`, padding: "56px 56px 44px" }}>
        <div style={{ maxWidth: 900 }}>
          <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: INK55, marginBottom: 16 }}>
            EMOS Tools · Free · Public · No login
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(32px,4.2vw,52px)", lineHeight: 1.05, letterSpacing: "-0.025em", color: INK, margin: "0 0 20px" }}>
            The earned-media pipeline, <em>one tool at a time.</em>
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: INK70, maxWidth: 620, margin: "0 0 28px" }}>
            Six tools, in the order they&rsquo;re meant to be used — find the story, build the asset, verify it, find the journalist, score the pitch, track the placement. Each one here is a free, self-serve taste of a module inside the paid <Link href="/emos" style={{ color: INK }}>EMOS Platform</Link>, which sequences all six for you.
          </p>
          <a href="/emos" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
            Explore the full EMOS system →
          </a>
        </div>
      </section>

      {/* ── Pipeline grid ────────────────────────────────────────────────── */}
      <section style={{ padding: "48px 56px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK }}>The Pipeline</span>
          <div style={{ flex: 1, height: 1, background: INK15 }} />
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55 }}>6 Steps</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: INK15, border: `1px solid ${INK15}` }}>
          {PIPELINE.map((tool, i) => (
            <a
              key={tool.name}
              href={tool.href}
              style={{
                display: "block",
                background: PAPER,
                padding: "22px 22px 24px",
                textDecoration: "none",
                color: INK,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK35, letterSpacing: "-0.02em" }}>{tool.step}</span>
                <StatusTag status={tool.status} />
              </div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, color: INK, marginBottom: 4 }}>{tool.name}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>{tool.role}</div>
              <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: INK70, margin: 0 }}>{tool.blurb}</p>
              {i < PIPELINE.length - 1 && (
                <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", fontFamily: SERIF, fontSize: 14, color: INK35, background: PAPER, border: `1px solid ${INK15}`, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                  →
                </div>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* ── Adjacent tools ───────────────────────────────────────────────── */}
      <section style={{ padding: "20px 56px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55 }}>Also Public · Outside This Pipeline</span>
          <div style={{ flex: 1, height: 1, background: INK15 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {ADJACENT.map((tool) => (
            <a key={tool.name} href={tool.href} style={{ display: "block", border: `1px solid ${INK15}`, background: PAPER2, padding: "18px 20px 20px", textDecoration: "none", color: INK }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17 }}>{tool.name}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, margin: "4px 0 8px" }}>{tool.role}</div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: INK70, margin: 0 }}>{tool.blurb}</p>
            </a>
          ))}
        </div>
      </section>

      <Subscriptions sectionNumber="07" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
