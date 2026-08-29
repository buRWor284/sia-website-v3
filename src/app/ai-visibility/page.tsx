import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Colophon } from "@/components/bureau";
import { ScrollButtons } from "@/components/ScrollButtons";
import { Pill, SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK55, INK70, MONO, PAPER, SERIF, YEL } from "@/lib/tokens";
import { ResultClient } from "./ResultClient";
import { CHECKS, COMPARE, EXAMPLES, REFUSALS, SITE_PARTS, SOURCES, TYPICAL_SET } from "./evidence";

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
const UPDATED = "29 August 2026";

const JUMP = [
  { href: "#receipts", label: "What a result looks like" },
  { href: "#how", label: "How it scores" },
  { href: "#checks", label: "The 10 checks" },
  { href: "#ignores", label: "What it ignores" },
  { href: "#compare", label: "Compared" },
  { href: "#sources", label: "Sources" },
];

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

const GRADES: { g: string; from: string; color: string }[] = [
  { g: "A", from: "80+", color: GREEN },
  { g: "B", from: "65", color: "#3f8f5a" },
  { g: "C", from: "50", color: AMBER },
  { g: "D", from: "35", color: "#c04a1e" },
  { g: "E", from: "under 35", color: RED },
];

/* Page-scoped CSS: the site styles inline, but responsive tables, the sticky
   jump bar and hover states need real rules. Prefixed aiv- to stay out of
   everyone else's way. */
const CSS = `
.aiv-hero{display:grid;grid-template-columns:1fr;gap:28px;align-items:center;max-width:1040px;margin:0 auto}
.aiv-hero-text{text-align:center}
.aiv-hero-shot{max-width:420px;margin:0 auto;width:100%}
.aiv-hero-shot img{display:block;width:100%;height:auto;border:1px solid ${RULE};box-shadow:0 18px 44px rgba(26,20,16,.16);border-radius:6px}
@media (min-width:900px){.aiv-hero{grid-template-columns:1.15fr .85fr}.aiv-hero-text{text-align:left}.aiv-hero-text p,.aiv-hero-text h1{margin-left:0}.aiv-hero-cta{justify-content:flex-start}}
.aiv-hero-cta{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:22px}
.aiv-btn{display:inline-block;font-family:${GROT};font-weight:800;font-size:14px;padding:12px 18px;text-decoration:none;border-radius:2px;line-height:1.2}
.aiv-btn-primary{background:${YEL};color:${INK}}
.aiv-btn-ghost{background:transparent;color:${INK};border:1.5px solid ${INK}}
.aiv-btn:hover{filter:brightness(.96)}
.aiv-jump{position:sticky;top:0;z-index:20;background:${PAPER};border-top:1px solid ${RULE};border-bottom:1px solid ${RULE}}
.aiv-jump-inner{max-width:980px;margin:0 auto;display:flex;gap:4px;overflow-x:auto;padding:8px 12px;scrollbar-width:none}
.aiv-jump-inner::-webkit-scrollbar{display:none}
.aiv-jump a{white-space:nowrap;font-family:${GROT};font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${INK70};text-decoration:none;padding:8px 10px;border-radius:3px}
.aiv-jump a:hover{background:#fff;color:${INK}}
.aiv-src{display:inline-flex;align-items:center;justify-content:center;min-width:24px;min-height:24px;padding:0 6px;margin:0 1px;font-family:${GROT};font-size:11px;font-weight:700;color:${INK70};background:rgba(26,20,16,.06);border-radius:12px;text-decoration:none;vertical-align:middle}
.aiv-src:hover{background:${YEL};color:${INK}}
.aiv-table-wrap{overflow-x:auto;border:1px solid ${RULE}}
.aiv-cards{display:grid;gap:10px}
@media (min-width:721px){.aiv-cards{display:none}}
@media (max-width:720px){.aiv-table-wrap{display:none}}
.aiv-card{border:1px solid ${RULE};background:#fff;padding:14px 16px}
.aiv-sources{columns:1;column-gap:28px}
@media (min-width:800px){.aiv-sources{columns:2}}
.aiv-sources li{break-inside:avoid}
.aiv-details summary{cursor:pointer;list-style:none;font-family:${GROT};font-weight:800;font-size:14px;color:${INK};padding:14px 16px;border:1px solid ${RULE};background:#fff;text-align:center}
.aiv-details summary::-webkit-details-marker{display:none}
.aiv-details[open] summary{border-bottom:0}
.aiv-details summary::after{content:" +";color:${INK55}}
.aiv-details[open] summary::after{content:" \\2013"}
section[id]{scroll-margin-top:56px}
`;

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
    <span style={{ whiteSpace: "nowrap" }}>
      {ids.map((id) => (
        <a key={id} href={`#src-${id}`} className="aiv-src" title={`Source ${id}`}>
          {id}
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

const TH = { textAlign: "left" as const, padding: "10px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const };

/* Two boxes: the site and the page. Inline SVG so it inherits the page palette. */
function SitePageDiagram() {
  return (
    <svg viewBox="0 0 560 150" role="img" aria-label="One click returns a score for the whole site and a grade for the page you are on" style={{ width: "100%", maxWidth: 560, height: "auto", display: "block", margin: "0 auto 22px" }}>
      <rect x="1" y="1" width="250" height="148" rx="4" fill="#fff" stroke={RULE} />
      <text x="16" y="28" fontFamily="var(--font-grot)" fontSize="10" fontWeight="800" letterSpacing="1.5" fill={INK55}>WHOLE SITE · 0 TO 100</text>
      <text x="16" y="70" fontFamily="var(--font-grot)" fontSize="40" fontWeight="800" fill={INK}>100</text>
      <text x="16" y="98" fontFamily="var(--font-grot)" fontSize="12" fill={INK70}>robots.txt · JavaScript · llms.txt</text>
      <text x="16" y="116" fontFamily="var(--font-grot)" fontSize="12" fill={INK70}>metadata · sitemap</text>
      <text x="16" y="138" fontFamily="var(--font-grot)" fontSize="11" fontWeight="700" fill={GREEN}>Same on every page</text>
      <rect x="309" y="1" width="250" height="148" rx="4" fill="#fff" stroke={YEL} strokeWidth="2" />
      <text x="324" y="28" fontFamily="var(--font-grot)" fontSize="10" fontWeight="800" letterSpacing="1.5" fill={INK55}>THIS PAGE · A TO E</text>
      <rect x="324" y="44" width="58" height="32" rx="3" fill={AMBER} />
      <text x="353" y="66" textAnchor="middle" fontFamily="var(--font-grot)" fontSize="16" fontWeight="800" fill="#fff">C</text>
      <text x="324" y="98" fontFamily="var(--font-grot)" fontSize="12" fill={INK70}>answer shape · substance · trust</text>
      <text x="324" y="116" fontFamily="var(--font-grot)" fontSize="12" fill={INK70}>ten checks, each with evidence</text>
      <text x="324" y="138" fontFamily="var(--font-grot)" fontSize="11" fontWeight="700" fill={AMBER}>Changes page by page</text>
      <path d="M255 75 H305" stroke={INK55} strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="280" y="66" textAnchor="middle" fontFamily="var(--font-grot)" fontSize="10" fontWeight="700" fill={INK55}>one click</text>
    </svg>
  );
}

export default function AiVisibilityPage() {
  const gradeTotal = CHECKS.reduce((a, c) => a + c.pts, 0);
  return (
    <>
      <style>{CSS}</style>

      {/* Hero */}
      <section style={{ background: PAPER, padding: "52px 20px 28px" }}>
        <div className="aiv-hero">
          <div className="aiv-hero-text">
            <Pill size={11} ls="0.22em">Free Chrome Extension</Pill>
            <h1 style={{ marginTop: 22, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(32px, 4.4vw, 56px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK, maxWidth: 560, margin: "22px auto 0" }}>
              Can AI see your website?
            </h1>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: INK70, maxWidth: 520, lineHeight: 1.55, margin: "16px auto 0" }}>
              Many of the sites we check on stage turn out to be partly or fully
              invisible to ChatGPT, Claude and Perplexity, and their owners had no
              idea. One click shows the score, the reasons and the fixes. And of the
              16 other checkers we reviewed, this is the only one that shows the
              study behind each rule.
            </p>
            <div className="aiv-hero-cta">
              <Link href="/contact" className="aiv-btn aiv-btn-primary">Get early access →</Link>
              <a href="#checks" className="aiv-btn aiv-btn-ghost">See how it scores</a>
            </div>
            <p style={{ fontFamily: GROT, fontSize: 12.5, color: INK55, margin: "18px auto 0", maxWidth: 520 }}>
              By <Link href="/about" style={{ color: INK, fontWeight: 700, textDecoration: "none" }}>Syed Irfan Ajmal</Link>, Fractional CMO · Updated {UPDATED} · Runs in your browser, nothing leaves it
            </p>
          </div>
          <div className="aiv-hero-shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ai-visibility/score-popup.png" width={800} height={1110} alt="The extension popup: a 100 out of 100 site score for syedirfanajmal.com, a grade C for the page, and a Show on page button" loading="eager" />
          </div>
        </div>
      </section>

      <section style={{ background: PAPER, padding: "0 20px 36px" }}>
        <ResultClient />
      </section>

      {/* Sticky jump bar */}
      <nav className="aiv-jump" aria-label="On this page">
        <div className="aiv-jump-inner">
          {JUMP.map((j) => (
            <a key={j.href} href={j.href}>{j.label}</a>
          ))}
        </div>
      </nav>

      {/* Receipts, first: the most distinctive thing about the tool */}
      <section id="receipts" style={{ background: "#fff", borderBottom: `1px solid ${RULE}`, padding: "44px 20px" }}>
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

      {/* Site vs page */}
      <section id="how" style={{ background: PAPER, padding: "44px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Two results, one click</Eyebrow>
          <H2>A score for the site, a grade for the page</H2>
          <Lede>
            Visibility is a property of the whole site: robots.txt, llms.txt and the
            sitemap are the same on every page. Whether AI would quote you is a
            property of one page. Merging them would punish a homepage for not being
            an article, so the extension reports them separately.
          </Lede>
          <SitePageDiagram />
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
        </div>
      </section>

      {/* The ten checks */}
      <section id="checks" style={{ background: "#fff", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: "44px 20px" }}>
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

          {/* Grade scale */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 18 }}>
            {GRADES.map((g) => (
              <div key={g.g} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${RULE}`, background: PAPER, padding: "6px 10px 6px 6px" }}>
                <span style={{ background: g.color, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 13, width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>{g.g}</span>
                <span style={{ fontFamily: GROT, fontSize: 12, color: INK70 }}>{g.from} of {gradeTotal}</span>
              </div>
            ))}
          </div>

          <div className="aiv-table-wrap">
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontFamily: GROT, fontSize: 13, background: PAPER }}>
              <thead>
                <tr style={{ background: INK, color: PAPER }}>
                  <th style={TH}>Check</th>
                  <th style={{ ...TH, textAlign: "right" }}>Points</th>
                  <th style={TH}>What it looks for</th>
                  <th style={TH}>What the data found</th>
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
                    Answer shape carries 45 points, substance 30, trust 25.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Phone layout: one card per check */}
          <div className="aiv-cards">
            {CHECKS.map((c) => (
              <div key={c.code} className="aiv-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 14, color: INK }}>{c.label}</div>
                  <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, color: INK, whiteSpace: "nowrap" }}>{c.pts} pts</div>
                </div>
                <div style={{ fontFamily: GROT, fontSize: 13, color: INK70, lineHeight: 1.5, marginTop: 6 }}>{c.looks}</div>
                <div style={{ fontFamily: GROT, fontSize: 13, color: INK, lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${RULE}` }}>
                  <strong>Data:</strong> {c.finding} <Src ids={c.src} />
                </div>
              </div>
            ))}
            <div className="aiv-card" style={{ background: PAPER, fontFamily: GROT, fontSize: 12.5, color: INK55 }}>Total {gradeTotal}: answer shape 45, substance 30, trust 25.</div>
          </div>

          <p style={{ marginTop: 14, fontFamily: GROT, fontSize: 12.5, color: INK55, lineHeight: 1.55, maxWidth: 760, margin: "14px auto 0", textAlign: "center" }}>
            The biggest factor of all, how often other websites mention you, cannot be read
            from one page: across 75,000 brands it correlates with AI Overview presence at
            0.66, three times more than backlinks <Src ids={[10]} />. That is the question the
            Earned Media OS exists to answer.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <Link href="/contact" className="aiv-btn aiv-btn-primary">Check my site: get early access →</Link>
          </div>
        </div>
      </section>

      {/* Refusals */}
      <section id="ignores" style={{ background: PAPER, padding: "44px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Equally important</Eyebrow>
          <H2>What it refuses to score, and why</H2>
          <Lede>
            Most AI-visibility tools still reward things the data says do not matter.
            This one lists them, gives them zero points, and says so on every result.
          </Lede>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
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
            This is also how the tool itself changed. An external review pointed at the llms.txt
            data and its weight dropped from 10 points to 5. The answer-readiness spec started
            with a 30-point schema bucket and a question-heading check; the research pass killed
            both before a line was built.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" style={{ background: "#fff", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: "44px 20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Eyebrow>How it compares</Eyebrow>
          <H2>Against Adobe&rsquo;s checker and the typical AEO extension</H2>
          <Lede>
            Adobe&rsquo;s AI Content Visibility Checker does one thing well: it shows how much
            of a page survives with JavaScript off. The small AEO and GEO extensions on the
            Chrome Web Store mostly hand back a number. Check by check:
          </Lede>
          <div className="aiv-table-wrap">
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontFamily: GROT, fontSize: 13, background: PAPER }}>
              <thead>
                <tr style={{ background: INK, color: PAPER }}>
                  <th style={TH}>Check</th>
                  <th style={{ ...TH, background: YEL, color: INK }}>AI Visibility Checker</th>
                  <th style={TH}>Adobe</th>
                  <th style={TH}>Typical AEO extension</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.check} style={{ borderTop: `1px solid ${RULE}`, verticalAlign: "top" }}>
                    <td style={{ padding: "11px 12px", color: INK, fontWeight: 600, lineHeight: 1.45 }}>
                      {r.check}
                      {r.note ? <div style={{ fontWeight: 400, fontSize: 12, color: INK55, marginTop: 2 }}>{r.note}</div> : null}
                    </td>
                    <td style={{ padding: "11px 12px", color: cellColor(r.ours), fontWeight: 800, background: "rgba(245,184,31,.12)" }}>{r.ours}</td>
                    <td style={{ padding: "11px 12px", color: cellColor(r.adobe), fontWeight: 700 }}>{r.adobe}</td>
                    <td style={{ padding: "11px 12px", color: cellColor(r.typical), fontWeight: 700 }}>{r.typical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="aiv-cards">
            {COMPARE.map((r) => (
              <div key={r.check} className="aiv-card">
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 14, color: INK, lineHeight: 1.4 }}>{r.check}</div>
                {r.note ? <div style={{ fontFamily: GROT, fontSize: 12, color: INK55, marginTop: 2 }}>{r.note}</div> : null}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 10px", marginTop: 8, fontFamily: GROT, fontSize: 13 }}>
                  <span style={{ color: INK55 }}>This tool</span><span style={{ color: cellColor(r.ours), fontWeight: 800 }}>{r.ours}</span>
                  <span style={{ color: INK55 }}>Adobe</span><span style={{ color: cellColor(r.adobe), fontWeight: 700 }}>{r.adobe}</span>
                  <span style={{ color: INK55 }}>Typical</span><span style={{ color: cellColor(r.typical), fontWeight: 700 }}>{r.typical}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontFamily: GROT, fontSize: 12, color: INK55, lineHeight: 1.55, maxWidth: 800, margin: "12px auto 0" }}>
            <strong style={{ color: INK }}>Who is in the &ldquo;typical&rdquo; column:</strong> {TYPICAL_SET}
          </p>
          <p style={{ marginTop: 10, fontFamily: GROT, fontSize: 12.5, color: INK55, lineHeight: 1.55, maxWidth: 760, margin: "10px auto 0", textAlign: "center" }}>
            Fair is fair: Adobe&rsquo;s rendering check is polished and its paid parent product tracks
            real AI answers at scale, which this extension deliberately does not. If you need
            answer tracking, that is the EMOS platform, not a browser button.
          </p>
        </div>
      </section>

      {/* Ladder */}
      <section style={{ background: PAPER, padding: "44px 20px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Eyebrow>Three ways to fix your score</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 8 }}>
            {LADDER.map((s) => (
              <div key={s.n} style={{ border: `1px solid ${RULE}`, background: "#fff", padding: "20px 18px", display: "flex", flexDirection: "column" }}>
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
      <section id="sources" style={{ background: "#fff", borderTop: `1px solid ${RULE}`, padding: "44px 20px 20px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          <Eyebrow>Sources</Eyebrow>
          <H2>The studies behind every number on this page</H2>
          <Lede>
            All of these are correlation studies unless noted; only the Ahrefs schema test
            approaches a controlled design. Sample sizes are given so you can weigh them yourself.
          </Lede>
          <details className="aiv-details">
            <summary>Show the {SOURCES.length} sources</summary>
            <ol className="aiv-sources" style={{ listStyle: "none", padding: "12px 16px", margin: 0, border: `1px solid ${RULE}`, borderTop: 0, background: PAPER }}>
              {SOURCES.map((s) => (
                <li key={s.id} id={`src-${s.id}`} style={{ display: "flex", gap: 10, fontFamily: GROT, fontSize: 13, color: INK70, lineHeight: 1.5, padding: "7px 0", borderBottom: `1px solid ${RULE}`, scrollMarginTop: 64 }}>
                  <span style={{ fontWeight: 800, color: INK, flex: "0 0 28px", fontVariantNumeric: "tabular-nums" }}>[{s.id}]</span>
                  <span>
                    <strong style={{ color: INK }}>{s.who}.</strong> {s.what}.{" "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: INK, fontWeight: 600, wordBreak: "break-all" }}>
                      {s.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 56)}{s.url.replace(/^https?:\/\/(www\.)?/, "").length > 56 ? "…" : ""}
                    </a>
                  </span>
                </li>
              ))}
            </ol>
          </details>
          <p style={{ textAlign: "center", marginTop: 14 }}>
            <a href="#checks" style={{ fontFamily: GROT, fontSize: 12.5, fontWeight: 700, color: INK }}>↑ Back to the checks</a>
          </p>
        </div>
      </section>

      <section style={{ background: "#fff", textAlign: "center", padding: "20px 20px 56px" }}>
        <SCaps size={10} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 12 }}>
          Get the extension
        </SCaps>
        <p style={{ fontFamily: GROT, fontSize: 14, color: INK70, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          The AI Visibility Checker is heading to the Chrome Web Store. Until the listing
          is live, catch it in action at Irfan&apos;s talks and workshops, or ask for early access.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <Link href="/contact" className="aiv-btn aiv-btn-primary">Get early access →</Link>
          <Link href="/ai-visibility/privacy" className="aiv-btn aiv-btn-ghost">Privacy policy</Link>
        </div>
      </section>

      <Colophon />
      <ScrollButtons />
    </>
  );
}
