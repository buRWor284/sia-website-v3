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

const GREEN = "#1f7a3f";
const AMBER = "#9a6a0c";
const RED = "#b3261e";
const RULE = "#d8d2c4";

type Result = { domain: string; score: number; band: string; color: string; fixes: string[] };

export function ResultClient() {
  const [res, setRes] = useState<Result | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const domain = (p.get("d") || "").toLowerCase().replace(/[^a-z0-9.-]/g, "").slice(0, 80);
      const score = parseInt(p.get("s") || "", 10);
      if (domain && Number.isFinite(score) && score >= 0 && score <= 100) {
        const band = score >= 80 ? "visible to AI" : score >= 50 ? "partially visible to AI" : "invisible to AI";
        const color = score >= 80 ? GREEN : score >= 50 ? AMBER : RED;
        const fixes = (p.get("f") || "").split(",").filter((c) => FIX_COPY[c]).slice(0, 3);
        setRes({ domain, score, band, color, fixes });
      }
    } catch {
      /* no params, no problem */
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!res) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", border: `1px solid ${RULE}`, background: "#fff", padding: "28px 28px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: SERIF, fontSize: 19, color: INK, lineHeight: 1.5 }}>
          Run the checker on your site and the &quot;How do I fix this?&quot; button
          brings your score and your three biggest fixes to this page.
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

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", border: `1px solid ${RULE}`, borderTop: `6px solid ${res.color}`, background: "#fff", padding: "28px 28px 24px" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 150, height: 150, flex: "0 0 auto" }}>
          <svg viewBox="0 0 200 200" style={{ width: 150, height: 150, transform: "rotate(135deg)" }} role="img" aria-label={`Score ${res.score} out of 100`}>
            <circle cx="100" cy="100" r="84" fill="none" stroke={RULE} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${ARC} ${CIRC}`} />
            <circle cx="100" cy="100" r="84" fill="none" stroke={res.color} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${ARC * frac} ${CIRC}`} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 52, lineHeight: 1, color: INK }}>{res.score}</span>
            <span style={{ fontFamily: GROT, fontSize: 11, color: INK55, marginTop: 2 }}>of 100</span>
          </div>
        </div>
        <div style={{ minWidth: 220, textAlign: "left" }}>
          <div style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: INK55 }}>AI VISIBILITY SCORE</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: INK, margin: "4px 0 10px", wordBreak: "break-all" }}>{res.domain}</div>
          <span style={{ display: "inline-block", background: res.color, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 3 }}>
            {res.band}
          </span>
        </div>
      </div>

      {res.fixes.length > 0 && (
        <div style={{ marginTop: 26, textAlign: "left" }}>
          <div style={{ fontFamily: GROT, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: INK70, borderBottom: `2px solid ${INK}`, paddingBottom: 6, marginBottom: 12 }}>
            Your biggest fixes, in order
          </div>
          {res.fixes.map((code) => (
            <div key={code} style={{ padding: "10px 0", borderBottom: `1px solid ${RULE}` }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 15, color: INK }}>{FIX_COPY[code].label}</div>
              <div style={{ fontFamily: GROT, fontSize: 13.5, color: INK70, lineHeight: 1.55, marginTop: 3 }}>{FIX_COPY[code].fix}</div>
            </div>
          ))}
          <p style={{ marginTop: 14, fontFamily: GROT, fontSize: 12.5, color: INK55, lineHeight: 1.55 }}>
            The extension&apos;s full report (Download report button) carries every
            finding plus a corrected robots.txt and a starter llms.txt, ready to
            hand to whoever runs your site. Below: three ways to get it fixed,
            from free to done-for-you.
          </p>
        </div>
      )}

      <div style={{ marginTop: 18, background: YEL, padding: "12px 16px", textAlign: "left" }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 13.5, color: INK, lineHeight: 1.5 }}>
          Allowed is not the same as cited. This score measures whether AI CAN
          see you. Getting AI to talk about you is the next ladder rung, and it
          is what the Earned Media OS is for.
        </span>
      </div>
    </div>
  );
}
