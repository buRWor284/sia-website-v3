import type { Metadata } from "next";
import Link from "next/link";
import { Colophon } from "@/components/bureau";
import { Pill } from "@/components/bureau/primitives";
import { GROT, INK, INK55, INK70, PAPER, SERIF } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Privacy Policy · AI Visibility Checker by EMOS",
  description:
    "The AI Visibility Checker Chrome extension collects nothing, transmits nothing and stores nothing outside your own browser. What it reads, what it keeps locally, and the three permissions it asks for.",
  alternates: { canonical: "/ai-visibility/privacy" },
  robots: { index: true, follow: true },
};

const RULE = "#d8d2c4";

const POINTS: { h: string; p: string }[] = [
  { h: "It runs only on the tab you click", p: "Chrome's activeTab permission grants access to the current tab, and only after you click the icon. The extension has no host permissions, so it cannot read any website in the background." },
  { h: "What it fetches, and from where", p: "From the website you are already on, it requests robots.txt, llms.txt, llms-full.txt, the page's own HTML and the site's sitemap. Those requests go from your browser to that website, exactly as if you had opened the files yourself. Nothing is sent to us or to anyone else." },
  { h: "Where the analysis happens", p: "Scores, verdicts, the answer-readiness grade, the on-page highlights, the share card and the downloadable report are all computed inside the popup on your computer. There is no backend, no analytics, no telemetry, no cookies and no account." },
  { h: "What it keeps on your computer", p: "The Compare feature keeps your last 20 results (domain, scores, grade, date) in Chrome's local extension storage on your own machine. They are never transmitted and are deleted when you remove the extension." },
  { h: "What the answer-readiness checks see", p: "The page-shape checks run inside the page like everything else. The popup receives counts and short excerpts of at most 160 characters per section heading and opening, never the full page text." },
  { h: "The only things that leave the extension", p: "Actions you take yourself: copying text to your clipboard, downloading the share card or report, or clicking the \"How do I fix this?\" button. That button opens syedirfanajmal.com with public facts about the public page you checked in the link: the domain, the score, the bot verdicts, the part scores, the grade letter and up to five fix codes. Nothing personal travels." },
];

export default function AiVisibilityPrivacyPage() {
  return (
    <>
      <section style={{ background: PAPER, padding: "56px 20px 24px", textAlign: "center" }}>
        <Pill size={11} ls="0.22em">Chrome Extension</Pill>
        <h1 style={{ marginTop: 22, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.025em", color: INK }}>
          Privacy policy
        </h1>
        <p style={{ marginTop: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK70, maxWidth: 560, lineHeight: 1.55, margin: "14px auto 0" }}>
          AI Visibility Checker by EMOS collects nothing, transmits nothing and
          stores nothing outside your own browser.
        </p>
        <p style={{ marginTop: 14, fontFamily: GROT, fontSize: 12.5, color: INK55 }}>
          Effective 28 August 2026 · Applies to extension version 0.7 and later
        </p>
      </section>

      <section style={{ background: PAPER, padding: "8px 20px 56px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gap: 10 }}>
          {POINTS.map((pt) => (
            <div key={pt.h} style={{ border: `1px solid ${RULE}`, background: "#fff", padding: "16px 18px" }}>
              <h2 style={{ fontFamily: GROT, fontWeight: 800, fontSize: 15, color: INK, margin: 0 }}>{pt.h}</h2>
              <p style={{ fontFamily: GROT, fontSize: 14, color: INK70, lineHeight: 1.6, margin: "6px 0 0" }}>{pt.p}</p>
            </div>
          ))}
          <div style={{ border: `1px solid ${RULE}`, background: "#fff", padding: "16px 18px" }}>
            <h2 style={{ fontFamily: GROT, fontWeight: 800, fontSize: 15, color: INK, margin: 0 }}>The three permissions it asks for</h2>
            <p style={{ fontFamily: GROT, fontSize: 14, color: INK70, lineHeight: 1.6, margin: "6px 0 0" }}>
              <strong style={{ color: INK }}>activeTab</strong>: read the page you are checking, after your click.{" "}
              <strong style={{ color: INK }}>scripting</strong>: run the checker inside that page so its fetches are same-origin, and paint the optional on-page highlights.{" "}
              <strong style={{ color: INK }}>storage</strong>: keep your recent scores on your own computer for the Compare view. No host permissions.
            </p>
          </div>
          <p style={{ fontFamily: GROT, fontSize: 13.5, color: INK70, lineHeight: 1.6, margin: "10px 0 0", textAlign: "center" }}>
            Questions: <Link href="/contact" style={{ color: INK, fontWeight: 700 }}>contact Syed Irfan Ajmal</Link>. Back to the{" "}
            <Link href="/ai-visibility" style={{ color: INK, fontWeight: 700 }}>AI Visibility Checker</Link>.
          </p>
        </div>
      </section>

      <Colophon />
    </>
  );
}
