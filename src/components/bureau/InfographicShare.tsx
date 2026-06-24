"use client";

import { useState, type FormEvent } from "react";
import { SCaps } from "@/components/bureau/primitives";
import { GROT, INK, INK15, INK70, MONO, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";

// Static asset the gated download and the embed point at. Drop the exported
// image here when ready: public/infographics/bing-seo-2026-infographic.png
const PAGE_URL = "https://www.syedirfanajmal.com/infographics/bing-seo";
const IMG_URL  = "https://www.syedirfanajmal.com/infographics/bing-seo-2026-infographic.png";
const DOWNLOAD = "/infographics/bing-seo-2026-infographic.png";

const EMBED = [
  `<a href="${PAGE_URL}">`,
  `  <img src="${IMG_URL}" alt="How to Win on Bing in 2026: guide and infographic by Syed Irfan Ajmal" width="800" style="max-width:100%;height:auto;border:0;" />`,
  `</a>`,
  `<p style="font:14px/1.6 sans-serif">Infographic: <a href="${PAGE_URL}">How to Win on Bing in 2026</a> by Syed Irfan Ajmal.</p>`,
].join("\n");

export function InfographicShare() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg]       = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setMsg("");
    try {
      const r = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tag: "bing-seo-infographic" }),
      });
      const d = (await r.json()) as { success?: boolean; error?: string };
      if (r.ok && d.success) {
        setStatus("done");
      } else {
        setStatus("error");
        setMsg(d.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  function copyEmbed() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(EMBED).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const cardBase: React.CSSProperties = { border: `1px solid ${INK}`, background: PAPER, padding: "22px 24px 24px" };

  return (
    <div style={{ marginTop: 36 }}>
      <SCaps size={11} ls="0.2em">{`Take the infographic with you`}</SCaps>
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>

        {/* Email-gated static download */}
        <div style={cardBase}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, lineHeight: 1.2, color: INK }}>{`Get the static infographic`}</div>
          <p style={{ margin: "8px 0 14px", fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: INK70 }}>{`A high-resolution version you can save, print, or drop into a deck. Enter your email and it is yours.`}</p>
          {status === "done" ? (
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 16, color: INK, lineHeight: 1.5 }}>{`Thanks. Your download is ready, and you are on the SIA Wire list.`}</div>
              <a href={DOWNLOAD} download style={{ display: "inline-block", marginTop: 12, padding: "11px 18px", background: INK, color: PAPER, textDecoration: "none", fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>{`Download the infographic ↓`}</a>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                aria-label="Email address"
                style={{ flex: "1 1 200px", minWidth: 0, padding: "11px 12px", border: `1px solid ${INK}`, background: PAPER, fontFamily: SERIF, fontSize: 15, color: INK }}
              />
              <button type="submit" disabled={status === "loading"} style={{ padding: "11px 18px", background: status === "loading" ? INK70 : INK, color: PAPER, border: "none", cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {status === "loading" ? "Sending" : "Email it to me"}
              </button>
              {status === "error" && (
                <div style={{ flexBasis: "100%", fontFamily: SERIF, fontSize: 13.5, color: "#a4441a" }}>{msg}</div>
              )}
            </form>
          )}
        </div>

        {/* Open embed code (ungated, to encourage backlinks) */}
        <div style={cardBase}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, lineHeight: 1.2, color: INK }}>{`Embed it on your site`}</div>
            <button onClick={copyEmbed} style={{ padding: "6px 12px", background: copied ? YEL : "transparent", color: INK, border: `1px solid ${INK}`, cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p style={{ margin: "8px 0 12px", fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: INK70 }}>{`Free to use, with a link back to this page. Paste this where you want the infographic to appear.`}</p>
          <textarea
            readOnly
            value={EMBED}
            rows={6}
            aria-label="Infographic embed code"
            onFocus={(e) => e.currentTarget.select()}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: `1px solid ${INK15}`, background: PAPER2, fontFamily: MONO, fontSize: 12, lineHeight: 1.5, color: INK, resize: "vertical" }}
          />
        </div>
      </div>
    </div>
  );
}
