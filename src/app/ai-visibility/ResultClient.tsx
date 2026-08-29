"use client";

import { useEffect, useState } from "react";
import { GROT, INK, INK55, INK70, SERIF, YEL } from "@/lib/tokens";

/* Fix codes sent by the AI Visibility Checker extension (v0.4+).
   Keep in sync with js/score.js in the extension. */
const FIX_COPY: Record<string, { label: string; fix: string }> = {
  bs: { label: "AI search crawlers are blocked", fix: "Your robots.txt tells the crawlers behind ChatGPT, Claude and Perplexity answers to stay out. Allowing them is what puts you back in AI results." },
  bu: { label: "User-triggered AI fetchers are blocked", fix: "When a person asks an AI to open your page, your site refuses. Allow the user-triggered bots in robots.txt." },
  bt: { label: "AI training crawlers are blocked", fix: "Blocking training is a legitimate choice, but it is also where future AI models learn you exist. Decide it on purpose, not by accident." },
  js: { label: "Text needs JavaScript to exist", fix: "AI crawlers read your page before scripts run. Text that only appears through JavaScript is invisible to them: render it on the server." },
  lt: { label: "No llms.txt file", fix: "llms.txt is a one-page menu of your site written for AI readers. Publish one at yoursite.com/llms.txt." },
  lf: { label: "llms.txt has format issues", fix: "Links in llms.txt must be full https addresses, and the file should start with one title and a summary line." },
  lx: { label: "No llms-full.txt companion", fix: "Publish a full-content version at /llms-full.txt so AI readers can get everything in one fetch." },
  md: { label: "No meta description", fix: "AI answers often quote the meta description directly. Add one to every key page." },
  sd: { label: "No structured data", fix: "Schema.org JSON-LD tells AI what your pages ARE: a person, a company, an article. Add it." },
  cn: { label: "Canonical URL problems", fix: "Point each page's canonical tag at its one true https address on your own domain." },
  ni: { label: "A noindex signal is present", fix: "A robots meta tag is telling crawlers to hide this page. Remove it unless that is intended." },
  og: { label: "Thin Open Graph tags", fix: "og:title, og:description and og:image feed AI previews and share cards. Complete the set." },
  sm: { label: "No sitemap", fix: "Publish /sitemap.xml and declare it in robots.txt so crawlers can find every page." },
  sb: { label: "Sitemap unreachable", fix: "robots.txt declares a sitemap that does not load. Fix the URL." },
};

/* Answer-readiness fix codes sent by the extension (v0.6+, g= grade letter,
   a= up to two codes). Keep in sync with js/aeo-score.js in the extension. */
const AEO_COPY: Record<string, { label: string; fix: string }> = {
  af: { label: "No short, direct answer near the top of each section", fix: "AI copies a short clear sentence from near the top of a section. Open each section with one plain sentence of 6 to 20 words that answers the heading, then expand." },
  as: { label: "Sections are stubs or walls", fix: "Sections of 80 to 250 words get cited most (120 to 180 is the sweet spot). Merge stubs under 50 words into their neighbours; split anything over 250 with a new heading." },
  al: { label: "Sentences run too long", fix: "AI quotes sentences of about ten words and never one over 17. Cut the longest sentences in two, one idea per sentence." },
  ax: { label: "Too few lists, tables and definitions", fix: "Structured pages get lifted whole 2.3 times as often as prose. Turn any run of three parallel points into a list; define your key term in one 'X is a...' sentence." },
  an: { label: "Too few specific numbers", fix: "Pages with 19 or more data points get almost twice the citations. Replace vague claims with a number and its source." },
  aq: { label: "No quotes from named people", fix: "A named expert's words are something AI can attribute. Add one or two short quotes with a name and role." },
  ad: { label: "No visible, recent 'updated' date", fix: "Updated within three months nearly doubles citations on ChatGPT, Perplexity, Copilot and Gemini. Show 'Updated on' near the top, and only bump it when the content changes." },
  au: { label: "No visible author", fix: "Pages that say who wrote them and why they know get cited more. Add a byline, one sentence of credentials, and a profile link." },
  ae: { label: "Vague text, few named entities", fix: "Cited passages run about 20% proper nouns. Name the specific company, product, person or place instead of 'a leading provider'." },
  ah: { label: "Sales language", fix: "Promotional tone is the one text signal the data says gets you skipped. Cut 'game-changing', 'unlock', 'cutting-edge' and exclamation marks; state the fact." },
};
const GRADE_COLOR: Record<string, string> = { A: "#1f7a3f", B: "#3f8f5a", C: "#9a6a0c", D: "#c04a1e", E: "#b3261e" };

/* Bot order MUST mirror js/bots.js in the extension (the b= payload is
   positional: one verdict character per bot, a=allowed x=blocked p=partial
   u=unknown; for the two opt-out tokens x means opted out). */
const BOTS: { label: string; cat: string }[] = [
  { label: "GPTBot", cat: "Training" },
  { label: "ClaudeBot", cat: "Training" },
  { label: "CCBot", cat: "Training" },
  { label: "Bytespider", cat: "Training" },
  { label: "Amazonbot", cat: "Training" },
  { label: "Meta-ExternalAgent", cat: "Training" },
  { label: "OAI-SearchBot", cat: "Search" },
  { label: "Claude-SearchBot", cat: "Search" },
  { label: "PerplexityBot", cat: "Search" },
  { label: "DuckAssistBot", cat: "Search" },
  { label: "ChatGPT-User", cat: "User-triggered" },
  { label: "Claude-User", cat: "User-triggered" },
  { label: "Perplexity-User", cat: "User-triggered" },
  { label: "Meta-ExternalFetcher", cat: "User-triggered" },
  { label: "Google-Extended", cat: "Opt-out" },
  { label: "Applebot-Extended", cat: "Opt-out" },
];
const CAT_ORDER = ["Search", "User-triggered", "Training", "Opt-out"];

const GREEN = "#1f7a3f";
const GREEN_BG = "#e2f0e6";
const AMBER = "#9a6a0c";
const AMBER_BG = "#f7ecd2";
const RED = "#b3261e";
const RED_BG = "#f8e2e0";
const RULE = "#d8d2c4";
const NEUTRAL_BG = "#ecebe7";

type Result = {
  domain: string;
  score: number;
  band: string;
  color: string;
  fixes: string[];
  verdicts: string[] | null;   // per-bot chars, positional
  parts: number[] | null;      // crawler, js, llms, meta, sitemap
  jsPct: number | null;
  grade: string | null;        // answer readiness A-E, N = not a content page
  aeoFixes: string[];
  sample?: boolean;            // true when no result travelled in the link
};

/* Shown when the page is opened without a result in the link, so visitors
   see what the extension produces instead of a blank card. Real figures from
   a run on syedirfanajmal.com/resources/authority-flywheel, 28 Aug 2026. */
const SAMPLE: Result = {
  domain: "syedirfanajmal.com", score: 100, band: "visible to AI", color: "#1f7a3f",
  fixes: [], verdicts: "aaaaaaaaaaaaaaaa".split(""), parts: [40, 30, 5, 15, 10], jsPct: 0,
  grade: "C", aeoFixes: ["ax", "an"], sample: true,
};

function parseResult(): Result | null {
  const p = new URLSearchParams(window.location.search);
  const domain = (p.get("d") || "").toLowerCase().replace(/[^a-z0-9.-]/g, "").slice(0, 80);
  const score = parseInt(p.get("s") || "", 10);
  if (!domain || !Number.isFinite(score) || score < 0 || score > 100) return SAMPLE;
  const band = score >= 80 ? "visible to AI" : score >= 50 ? "partially visible to AI" : "invisible to AI";
  const color = score >= 80 ? GREEN : score >= 50 ? AMBER : RED;
  const fixes = (p.get("f") || "").split(",").filter((c) => FIX_COPY[c]).slice(0, 3);
  const bRaw = (p.get("b") || "").toLowerCase();
  const verdicts = /^[axpu]{16}$/.test(bRaw) ? bRaw.split("") : null;
  const pRaw = (p.get("p") || "").split(",").map((n) => parseFloat(n));
  const parts = pRaw.length === 5 && pRaw.every((n) => Number.isFinite(n) && n >= 0) ? pRaw : null;
  const jRaw = parseInt(p.get("j") || "", 10);
  const jsPct = Number.isFinite(jRaw) && jRaw >= 0 && jRaw <= 100 ? jRaw : null;
  const gRaw = (p.get("g") || "").toUpperCase();
  const grade = /^[A-EN]$/.test(gRaw) ? gRaw : null;
  const aeoFixes = grade && grade !== "N" ? (p.get("a") || "").split(",").filter((c) => AEO_COPY[c]).slice(0, 2) : [];
  return { domain, score, band, color, fixes, verdicts, parts, jsPct, grade, aeoFixes };
}

function chipStyle(ch: string, isOptout: boolean): { bg: string; fg: string; word: string } {
  if (isOptout) return { bg: NEUTRAL_BG, fg: "#52493d", word: ch === "x" ? "opted out" : "not opted out" };
  if (ch === "a") return { bg: GREEN_BG, fg: GREEN, word: "allowed" };
  if (ch === "x") return { bg: RED_BG, fg: RED, word: "blocked" };
  if (ch === "p") return { bg: AMBER_BG, fg: AMBER, word: "partial" };
  return { bg: NEUTRAL_BG, fg: "#52493d", word: "unknown" };
}

function buildMd(r: Result): string {
  const date = new Date().toISOString().slice(0, 10);
  const L: string[] = [];
  L.push(`# AI Visibility Report | ${r.domain}`);
  L.push("");
  L.push(`Date: ${date} | Score: ${r.score}/100 (${r.band})`);
  if (r.parts) L.push(`Parts: crawler access ${r.parts[0]}/40, JavaScript visibility ${r.parts[1]}/30, llms.txt ${r.parts[2]}/5, metadata ${r.parts[3]}/15, sitemap ${r.parts[4]}/10`);
  if (r.jsPct !== null) L.push(`${r.jsPct}% of the page's visible text needs JavaScript that AI crawlers do not run.`);
  if (r.grade) L.push(r.grade === "N" ? "Answer readiness: not graded (not a content page)." : `Answer readiness of the checked page: grade ${r.grade}.`);
  if (r.aeoFixes.length) {
    L.push("");
    L.push("## Answer readiness fixes");
    L.push("");
    r.aeoFixes.forEach((c) => L.push(`- ${AEO_COPY[c].label}. ${AEO_COPY[c].fix}`));
  }
  if (r.fixes.length) {
    L.push("");
    L.push("## Your biggest fixes, in order");
    L.push("");
    r.fixes.forEach((c) => L.push(`- ${FIX_COPY[c].label}. ${FIX_COPY[c].fix}`));
  }
  if (r.verdicts) {
    L.push("");
    L.push("## Bot-by-bot verdicts");
    L.push("");
    L.push("| Bot | Category | Verdict |");
    L.push("|---|---|---|");
    BOTS.forEach((b, i) => {
      const c = chipStyle(r.verdicts![i], b.cat === "Opt-out");
      L.push(`| ${b.label} | ${b.cat} | ${c.word} |`);
    });
  }
  L.push("");
  L.push("---");
  L.push("Checked with AI Visibility Checker by EMOS | syedirfanajmal.com/ai-visibility");
  L.push("Allowed is not the same as crawled or cited. This checks access, not fame.");
  return L.join("\n");
}

export function ResultClient() {
  const [res, setRes] = useState<Result | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setRes(parseResult());
    } catch {
      /* no params, no problem */
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!res) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", border: `1px solid ${RULE}`, background: "#fff", padding: "28px 28px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: SERIF, fontSize: 19, color: INK, lineHeight: 1.5 }}>
          Run the checker on your site and the &quot;How do I fix this?&quot; button
          brings your score, your bot verdicts and your three biggest fixes to
          this page.
        </p>
        <p style={{ marginTop: 12, fontFamily: GROT, fontSize: 13, color: INK55, lineHeight: 1.6 }}>
          No score attached yet: this is the general page. Your result never
          touches a server; it travels in the link itself.
        </p>
      </div>
    );
  }

  const ARC = 2 * Math.PI * 84 * 0.75;
  const CIRC = 2 * Math.PI * 84;
  const frac = Math.max(0.02, res.score / 100);
  const partDefs = res.parts
    ? [
        { k: "Crawler access", v: res.parts[0], max: 40 },
        { k: "JavaScript visibility", v: res.parts[1], max: 30 },
        { k: "llms.txt", v: res.parts[2], max: 5 },
        { k: "Metadata", v: res.parts[3], max: 15 },
        { k: "Sitemap", v: res.parts[4], max: 10 },
      ]
    : null;

  const downloadMd = () => {
    const blob = new Blob([buildMd(res)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ai-visibility-${res.domain.replace(/[^a-z0-9.-]/g, "_")}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  return (
    <div id="result-card" style={{ maxWidth: 780, margin: "0 auto", border: `1px solid ${RULE}`, borderTop: `6px solid ${res.color}`, background: "#fff", padding: "28px 28px 24px", position: "relative" }}>
      {res.sample && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: `1px dashed ${RULE}` }}>
          <span style={{ background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 3 }}>Sample result</span>
          <span style={{ fontFamily: GROT, fontSize: 13, color: INK70, lineHeight: 1.5 }}>
            Not your site: this is what the extension produced on syedirfanajmal.com/resources/authority-flywheel on 28 Aug 2026. Run it on your own site and the &quot;How do I fix this?&quot; button brings your result here.
          </span>
        </div>
      )}
      <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 160, height: 160, flex: "0 0 auto" }}>
          <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, transform: "rotate(135deg)" }} role="img" aria-label={`Score ${res.score} out of 100`}>
            <circle cx="100" cy="100" r="84" fill="none" stroke={RULE} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${ARC} ${CIRC}`} />
            <circle cx="100" cy="100" r="84" fill="none" stroke={res.color} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${ARC * frac} ${CIRC}`} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 56, lineHeight: 1, color: INK }}>{res.score}</span>
            <span style={{ fontFamily: GROT, fontSize: 11, color: INK55, marginTop: 2 }}>of 100</span>
          </div>
        </div>
        <div style={{ minWidth: 240, textAlign: "left", flex: 1 }}>
          <div style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: INK55 }}>AI VISIBILITY SCORE</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, color: INK, margin: "4px 0 10px", wordBreak: "break-all" }}>{res.domain}</div>
          <span style={{ display: "inline-block", background: res.color, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 3 }}>
            {res.band}
          </span>
          {res.grade && (
            <span title="Answer readiness of the page that was checked: is it shaped like something an AI answer would quote?" style={{ display: "inline-block", marginLeft: 8, background: GRADE_COLOR[res.grade] || "#52493d", color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 3 }}>
              {res.grade === "N" ? "Answer readiness: n/a" : `Answer readiness: ${res.grade}`}
            </span>
          )}
          {partDefs && (
            <div style={{ marginTop: 16 }}>
              {partDefs.map((pd) => (
                <div key={pd.k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: GROT, fontSize: 11, color: INK70, width: 130, flex: "0 0 auto" }}>{pd.k}</span>
                  <span style={{ flex: 1, height: 6, background: NEUTRAL_BG, borderRadius: 3, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.min(100, (pd.v / pd.max) * 100)}%`, background: pd.v / pd.max >= 0.8 ? GREEN : pd.v / pd.max >= 0.5 ? AMBER : RED }} />
                  </span>
                  <span style={{ fontFamily: GROT, fontSize: 11, fontWeight: 700, color: INK, width: 46, textAlign: "right" }}>{pd.v}/{pd.max}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {res.verdicts && (
        <div style={{ marginTop: 24, textAlign: "left" }}>
          <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: INK70, borderBottom: `2px solid ${INK}`, paddingBottom: 6, marginBottom: 10 }}>
            Which AI bots can see {res.domain}
          </div>
          {CAT_ORDER.map((cat) => (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>
                {cat === "Opt-out" ? "Training opt-out tokens" : cat + " crawlers"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {BOTS.map((b, i) =>
                  b.cat !== cat ? null : (() => {
                    const c = chipStyle(res.verdicts![i], cat === "Opt-out");
                    return (
                      <span key={b.label} title={c.word} style={{ background: c.bg, color: c.fg, fontFamily: GROT, fontWeight: 600, fontSize: 11.5, padding: "4px 9px", borderRadius: 3 }}>
                        {b.label}
                      </span>
                    );
                  })()
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {res.fixes.length > 0 && (
        <div style={{ marginTop: 20, textAlign: "left" }}>
          <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: INK70, borderBottom: `2px solid ${INK}`, paddingBottom: 6, marginBottom: 6 }}>
            Your biggest fixes, in order
          </div>
          {res.fixes.map((code) => (
            <div key={code} style={{ padding: "10px 0", borderBottom: `1px solid ${RULE}` }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 15, color: INK }}>{FIX_COPY[code].label}</div>
              <div style={{ fontFamily: GROT, fontSize: 13.5, color: INK70, lineHeight: 1.55, marginTop: 3 }}>{FIX_COPY[code].fix}</div>
            </div>
          ))}
        </div>
      )}

      {res.aeoFixes.length > 0 && (
        <div style={{ marginTop: 20, textAlign: "left" }}>
          <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: INK70, borderBottom: `2px solid ${INK}`, paddingBottom: 6, marginBottom: 6 }}>
            Answer readiness: what to change on that page
          </div>
          {res.aeoFixes.map((code) => (
            <div key={code} style={{ padding: "10px 0", borderBottom: `1px solid ${RULE}` }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 15, color: INK }}>{AEO_COPY[code].label}</div>
              <div style={{ fontFamily: GROT, fontSize: 13.5, color: INK70, lineHeight: 1.55, marginTop: 3 }}>{AEO_COPY[code].fix}</div>
            </div>
          ))}
          <div style={{ fontFamily: GROT, fontSize: 12, color: INK55, lineHeight: 1.5, marginTop: 8 }}>
            The grade checks the shape of one page: a short direct sentence up top, real sections, lists and numbers, a named author, a fresh date. It cannot see how often the web mentions you, which is the bigger factor.
          </div>
        </div>
      )}

      <div className="aivis-actions" style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        <a href="/strategy-call" style={{ background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 14, padding: "12px 20px", textDecoration: "none", flex: "1 1 100%", textAlign: "center" }}>
          Get these fixed for me: book a discovery call →
        </a>
        <button type="button" onClick={downloadMd} style={{ background: INK, color: "#f1ebde", fontFamily: GROT, fontWeight: 700, fontSize: 13, padding: "10px 16px", border: "none", cursor: "pointer" }}>
          Download report (.md)
        </button>
        <button type="button" onClick={() => window.print()} style={{ background: INK, color: "#f1ebde", fontFamily: GROT, fontWeight: 700, fontSize: 13, padding: "10px 16px", border: "none", cursor: "pointer" }}>
          Save as PDF
        </button>
      </div>

      <div style={{ marginTop: 16, background: YEL, padding: "12px 16px", textAlign: "left" }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 13.5, color: INK, lineHeight: 1.5 }}>
          Allowed is not the same as cited. This score measures whether AI CAN
          see you. Getting AI to talk about you is the next ladder rung, and it
          is what the Earned Media OS is for.
        </span>
      </div>
    </div>
  );
}
