import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Colophon } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { Pill, SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK55, INK70, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";
import { ResultClient } from "./ResultClient";
import { CHECKS, COMPARE, EXAMPLES, REFUSALS, SITE_PARTS, SOURCES } from "./evidence";

export const metadata: Metadata = {
  title: "AI Visibility Checker · Can AI See Your Website?",
  description:
    "A free Chrome extension that scores any website 0-100 on whether ChatGPT, Claude, Perplexity and Gemini can see it, grades the page on whether AI would quote it, and shows the study behind every rule.",
  openGraph: {
    title: "AI Visibility Checker · Can AI See Your Website?",
    description:
      "One click shows which AI crawlers can read your site, whether the page is shaped like an answer AI would quote, and the evidence behind every verdict. Free, private, by Syed Irfan Ajmal | EMOS.",
    images: [{ url: "/og/headshot-card.jpg", width: 1200, height: 630, alt: "AI Visibility Checker by EMOS" }],
  },
  alternates: { canonical: "/ai-visibility" },
};

const RULE = "#d8d2c4";
const GREEN = "#1f7a3f";
const AMBER = "#9a6a0c";
const RED = "#b3261e";

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

/* Small shared bits, kept local so the page stays one file plus its data. */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", textAlign: "center", marginBottom: 10 }}>
      {children}
    </SCaps>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", lineHeight: 1.12, letterSpacing: "-0.02em", color: INK, textAlign: "center", margin: "0 auto 12px", maxWidth: 680 }}>
      {children}
    </h2>
  );
}

function Lede({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontFamily: GROT, fontSize: 15, color: INK70, lineHeight: 1.6, maxWidth: 640, margin: "0 auto 24px", textAlign: "center" }}>
      {children}
    </p>
  );
}

function Src({ ids }: { ids: number[] }) {
  return (
    <span style={{ fontFamily: GROT, fontSize: 11, color: INK55, whiteSpace: "nowrap" }}>
      {ids.map((id, i) => (
        <a key={id} href={`#src-${id}`} style={{ color: INK55, textDecoration: "none", borderBottom: `1px dotted ${INK55}`, marginLeft: i ? 4 : 0 }}>
          [{id}]
        </a>
      ))}
    </span>
  );
}

function cellColor(v: string): string {
  if (/^Yes/i.test(v)) return GREEN;
  if (/^No\b/i.test(v)) return RED;
  return AMBER;
}

export default function AiVisibilityPage() {
  const gradeTotal = CHECKS.reduce((a, c) => a + c.pts, 0);
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
          click shows your score, the reasons, and the fixes. And unlike every
          other checker we found, it shows the study behind each rule.
        </p>
      </section>

      <section style={{ background: PAPER, padding: "0 20px 44px" }}>
        <ResultClient />
      </section>

      {/* Two results, one click */}
      <section style={{ background: PAPER, padding: "0 20px 44px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Two results, one click</Eyebrow>
          <H2>A score for the site, a grade for the page</H2>
          <Lede>
            Visibility is a property of the whole site: robots.txt, llms.txt and the
            sitemap are the same on every page. Whether AI would quote you is a
            property of one page. Merging them would punish a homepage for not being
            an article, so the extension reports them separately.
          </Lede>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {SITE_PARTS.map((m) => (
              <div key={m.k} style={{ border: `1px solid ${RULE}`, background: "#fff", padding: "16px 16px 14px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, color: INK }}>{m.k}</div>
                <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 700, color: INK55, margin: "2px 0 8px" }}>{m.pts} of 100 site points</div>
                <div style={{ fontFamily: GROT, fontSize: 13, color: INK70, lineHeight: 1.55 }}>{m.d}</div>
                <div style={{ fontFamily: GROT, fontSize: 12, color: INK55, lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${RULE}`, flex: 1 }}>
                  <strong style={{ color: INK }}>Why this weight:</strong> {m.why} <Src ids={m.src} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, textAlign: "center", fontFamily: GROT, fontSize: 12.5, color: INK55 }}>
            Runs entirely in your browser. Nothing you check is sent anywhere.
          </p>
        </div>
      </section>

      {/* The ten checks */}
      <section style={{ background: "#fff", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: "44px 20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Eyebrow>The page grade, A to E</Eyebrow>
          <H2>Ten checks. Each one has a study behind it.</H2>
          <Lede>
            AI answers are assembled from pages that already look like answers. In
            2025 and 2026, several teams measured which page features actually
            correlate with being cited, across tens of millions of citations. These
            ten checks are the ones the data supports, weighted by how strong the
            evidence is. Content pages only: a homepage or pricing page shows
            &ldquo;n/a&rdquo; rather than a bad grade.
          </Lede>
          <div style={{ overflowX: "auto", border: `1px solid ${RULE}` }}>
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontFamily: GROT, fontSize: 13, background: PAPER }}>
              <thead>
                <tr style={{ background: INK, color: PAPER }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Check</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Points</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>What it looks for</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>What the data found</th>
                </tr>
              </thead>
              <tbody>
                {CHECKS.map((c) => (
                  <tr key={c.code} style={{ borderTop: `1px solid ${RULE}`, verticalAlign: "top" }}>
                    <td style={{ padding: "12px", fontWeight: 700, color: INK, width: "24%" }}>{c.label}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 800, color: INK, fontVariantNumeric: "tabular-nums" }}>{c.pts}</td>
                    <td style={{ padding: "12px", color: INK70, lineHeight: 1.5, width: "30%" }}>{c.looks}</td>
                    <td style={{ padding: "12px", color: INK70, lineHeight: 1.5 }}>
                      {c.finding} <Src ids={c.src} />
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${INK}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 800, color: INK }}>Total</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: INK }}>{gradeTotal}</td>
                  <td colSpan={2} style={{ padding: "10px 12px", color: INK55, fontSize: 12.5 }}>
                    A is 80 or more, B 65, C 50, D 35, E below 35. Answer shape carries 45 points, substance 30, trust 25.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12, fontFamily: GROT, fontSize: 12.5, color: INK55, lineHeight: 1.55, maxWidth: 760, margin: "12px auto 0", textAlign: "center" }}>
            The biggest factor of all, how often other websites mention you, cannot be read
            from one page: across 75,000 brands it correlates with AI Overview presence at
            0.66, three times more than backlinks <Src ids={[10]} />. That is the question the
            Earned Media OS exists to answer.
          </p>
        </div>
      </section>

      {/* Refusals */}
      <section style={{ background: PAPER, padding: "44px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Equally important</Eyebrow>
          <H2>What it refuses to score, and why</H2>
          <Lede>
            Most AI-visibility tools still reward things the data says do not matter.
            This one lists them, explains the evidence, and gives them zero points.
            The extension says so on every result.
          </Lede>
          <div style={{ display: "grid", gap: 10 }}>
            {REFUSALS.map((r) => (
              <div key={r.what} style={{ border: `1px solid ${RULE}`, borderLeft: `4px solid ${RED}`, background: "#fff", padding: "14px 16px" }}>
                <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14, color: INK }}>{r.what}</div>
                <div style={{ fontFamily: GROT, fontSize: 13, color: INK70, lineHeight: 1.55, marginTop: 4 }}>
                  {r.why} <Src ids={r.src} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, fontFamily: GROT, fontSize: 12.5, color: INK55, lineHeight: 1.55, maxWidth: 720, margin: "14px auto 0", textAlign: "center" }}>
            This is also how the tool itself changed. An external review of version 0.4 pointed
            at the llms.txt data; the weight dropped from 10 points to 5 in 0.5. The answer-readiness
            spec started with a 30-point schema bucket and question-heading check; the research
            pass killed both before a line was built.
          </p>
        </div>
      </section>

      {/* Receipts */}
      <section style={{ background: "#fff", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: "44px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Every line shows the receipt</Eyebrow>
          <H2>The sentence, the number and the study, not a mystery score</H2>
          <Lede>
            Real lines from real checks. Each one names the place on the page, gives the
            measurement, and cites the rule, so a writer knows what to change and a client
            can verify the reasoning.
          </Lede>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
            {EXAMPLES.map((e) => (
              <div key={e.where} style={{ border: `1px solid ${RULE}`, background: PAPER, padding: "14px 16px" }}>
                <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: INK55 }}>{e.where}</div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: INK, lineHeight: 1.5, background: "#fff", borderLeft: `3px solid ${YEL}`, padding: "8px 10px", margin: "8px 0" }}>{e.line}</div>
                <div style={{ fontFamily: GROT, fontSize: 12, color: INK55 }}>
                  Instead of: <span style={{ textDecoration: "line-through" }}>{e.instead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{ background: PAPER, padding: "44px 20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Eyebrow>How it compares</Eyebrow>
          <H2>Against Adobe&rsquo;s checker and the typical AEO extension</H2>
          <Lede>
            Adobe&rsquo;s AI Content Visibility Checker (10,000+ users) does one thing well:
            it shows how much of a page survives with JavaScript off. The two dozen small
            AEO and GEO extensions on the Chrome Web Store mostly hand back a number. Here is
            the check-by-check picture, from their public listings and documentation as of
            28 August 2026.
          </Lede>
          <div style={{ overflowX: "auto", border: `1px solid ${RULE}` }}>
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontFamily: GROT, fontSize: 13, background: "#fff" }}>
              <thead>
                <tr style={{ background: INK, color: PAPER }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Check</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Adobe</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Typical AEO extension</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: YEL, color: INK }}>AI Visibility Checker</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.check} style={{ borderTop: `1px solid ${RULE}`, verticalAlign: "top" }}>
                    <td style={{ padding: "11px 12px", color: INK, fontWeight: 600, lineHeight: 1.45 }}>
                      {r.check}
                      {r.note ? <div style={{ fontWeight: 400, fontSize: 12, color: INK55, marginTop: 2 }}>{r.note}</div> : null}
                    </td>
                    <td style={{ padding: "11px 12px", color: cellColor(r.adobe), fontWeight: 700 }}>{r.adobe}</td>
                    <td style={{ padding: "11px 12px", color: cellColor(r.typical), fontWeight: 700 }}>{r.typical}</td>
                    <td style={{ padding: "11px 12px", color: cellColor(r.ours), fontWeight: 800, background: "rgba(245,184,31,.10)" }}>{r.ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12, fontFamily: GROT, fontSize: 12.5, color: INK55, lineHeight: 1.55, maxWidth: 760, margin: "12px auto 0", textAlign: "center" }}>
            Fair is fair: Adobe&rsquo;s rendering check is polished and its paid parent product tracks
            real AI answers at scale, which this extension deliberately does not. If you need
            answer tracking, that is the EMOS platform, not a browser button.
          </p>
        </div>
      </section>

      {/* Ladder */}
      <section style={{ background: "#fff", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: "44px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Three ways to fix your score</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 8 }}>
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

      {/* Sources */}
      <section style={{ background: PAPER, padding: "44px 20px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Sources</Eyebrow>
          <H2>The studies behind every number on this page</H2>
          <Lede>
            All of these are correlation studies unless noted; only the Ahrefs schema test
            approaches a controlled design. Sample sizes are given so you can weigh them yourself.
          </Lede>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
            {SOURCES.map((s) => (
              <li key={s.id} id={`src-${s.id}`} style={{ display: "flex", gap: 10, fontFamily: GROT, fontSize: 13, color: INK70, lineHeight: 1.5, borderBottom: `1px solid ${RULE}`, padding: "6px 0" }}>
                <span style={{ fontWeight: 800, color: INK, flex: "0 0 28px", fontVariantNumeric: "tabular-nums" }}>[{s.id}]</span>
                <span>
                  <strong style={{ color: INK }}>{s.who}.</strong> {s.what}.{" "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: INK, fontWeight: 600, wordBreak: "break-all" }}>
                    {s.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}{s.url.replace(/^https?:\/\/(www\.)?/, "").length > 60 ? "…" : ""}
                  </a>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section style={{ background: PAPER, textAlign: "center", padding: "24px 20px 56px" }}>
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
