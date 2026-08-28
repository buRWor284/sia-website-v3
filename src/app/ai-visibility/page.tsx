import type { Metadata } from "next";
import Link from "next/link";
import { Colophon } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { Pill, SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";
import { ResultClient } from "./ResultClient";

export const metadata: Metadata = {
  title: "AI Visibility Checker · Can AI See Your Website?",
  description:
    "A free Chrome extension that scores any website 0-100 on whether ChatGPT, Claude, Perplexity and Gemini can actually see it, and shows exactly how to fix it.",
  openGraph: {
    title: "AI Visibility Checker · Can AI See Your Website?",
    description:
      "One click on any page shows which AI crawlers can read it, why, and how to fix it. Free, private, by Syed Irfan Ajmal | EMOS.",
    images: [{ url: "/og/headshot-card.jpg", width: 1200, height: 630, alt: "AI Visibility Checker by EMOS" }],
  },
  alternates: { canonical: "/ai-visibility" },
};

const RULE = "#d8d2c4";

const LADDER = [
  {
    n: "01",
    title: "Fix it yourself, free",
    body: "The extension hands you a corrected robots.txt and a starter llms.txt on the spot, and the downloadable report explains every finding in plain words. Most sites can be fixed in an afternoon.",
    cta: "Browse the free playbooks",
    href: "/resources",
  },
  {
    n: "02",
    title: "Learn the system",
    body: "Being visible is step one. Being cited by AI when buyers ask is the game. EMOS Academy teaches founders the Earned Media OS: how coverage, authority and AI visibility compound.",
    cta: "See EMOS Academy",
    href: "/emos-academy",
  },
  {
    n: "03",
    title: "Have it done for you",
    body: "A fractional CMO engagement puts 22+ years of earned-media practice on your team: the fixes, the strategy and the coverage that makes AI quote you.",
    cta: "Book a discovery call",
    href: "/strategy-call",
  },
];

const MEASURES = [
  { k: "Crawler access", v: "40 pts", d: "Does your robots.txt let the 16 AI crawlers in, or tell them to stay out?" },
  { k: "JavaScript visibility", v: "30 pts", d: "AI reads your page before scripts run. How much of your text is invisible ink?" },
  { k: "llms.txt", v: "5 pts", d: "The menu card for AI and agent readers: a nicety today, not a ranking lever." },
  { k: "Metadata and sitemap", v: "25 pts", d: "Titles, descriptions, structured data and a working sitemap: the filing system robots rely on." },
];

export default function AiVisibilityPage() {
  return (
    <>
      <section style={{ background: PAPER, textAlign: "center", padding: "60px 20px 36px" }}>
        <Pill size={11} ls="0.22em">Free Chrome Extension</Pill>
        <h1 style={{ marginTop: 24, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
          Can AI see your website?
        </h1>
        <p style={{ marginTop: 16, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK70, maxWidth: 560, lineHeight: 1.55, margin: "16px auto 0" }}>
          Half the sites we check on stage are partly or fully invisible to
          ChatGPT, Claude and Perplexity, and their owners had no idea. One
          click shows your score, the reasons, and the fixes.
        </p>
      </section>

      <section style={{ background: PAPER, padding: "0 20px 44px" }}>
        <ResultClient />
      </section>

      <section style={{ background: PAPER, padding: "0 20px 44px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", textAlign: "center", marginBottom: 18 }}>
            What the score measures
          </SCaps>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {MEASURES.map((m) => (
              <div key={m.k} style={{ border: `1px solid ${RULE}`, background: "#fff", padding: "16px 16px 14px" }}>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, color: INK }}>{m.k}</div>
                <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 700, color: INK55, margin: "2px 0 8px" }}>{m.v}</div>
                <div style={{ fontFamily: GROT, fontSize: 13, color: INK70, lineHeight: 1.55 }}>{m.d}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, textAlign: "center", fontFamily: GROT, fontSize: 12.5, color: INK55 }}>
            Runs entirely in your browser. Nothing you check is sent anywhere.
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: "44px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", textAlign: "center", marginBottom: 18 }}>
            Three ways to fix your score
          </SCaps>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {LADDER.map((s) => (
              <div key={s.n} style={{ border: `1px solid ${RULE}`, background: PAPER, padding: "20px 18px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, color: INK55 }}>{s.n}</div>
                <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: INK, margin: "6px 0 10px" }}>{s.title}</h2>
                <p style={{ fontFamily: GROT, fontSize: 13.5, color: INK70, lineHeight: 1.6, flex: 1 }}>{s.body}</p>
                <Link href={s.href} style={{ marginTop: 16, display: "inline-block", background: s.n === "03" ? YEL : INK, color: s.n === "03" ? INK : PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 13, padding: "10px 14px", textDecoration: "none", textAlign: "center" }}>
                  {s.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: PAPER, textAlign: "center", padding: "40px 20px 56px" }}>
        <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 12 }}>
          Get the extension
        </SCaps>
        <p style={{ fontFamily: GROT, fontSize: 14, color: INK70, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          The AI Visibility Checker is heading to the Chrome Web Store. Until
          the listing is live, catch it in action at Irfan&apos;s talks and
          workshops, or <Link href="/contact" style={{ color: INK, fontWeight: 700 }}>ask for early access</Link>.
        </p>
      </section>

      <Colophon />
      <ScrollButtons />
    </>
  );
}
