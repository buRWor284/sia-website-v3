"use client";

/**
 * SignalIQ — full asset-pack rendering (Phase P6). Moved verbatim from
 * app/tools/signaliq/page.tsx and shared by both surfaces: the EMOS dashboard
 * previously showed only a stub (headline + trimmed angle + 3 journalists);
 * the data brief — the pack's core deliverable — was generated but never shown.
 *
 * Per-surface differences are props:
 *  - onDownloadPDF   → download bars render only when the wrapper wires a PDF
 *  - downloadNote    → the public wrapper's "first download asks for your email" hint
 *  - pressIqHref     → public: /tools/pressiq · dashboard: /emos-platform/dashboard/pressiq
 *  - buildAssetHref  → dashboard-only "Build asset from this pack →" AssetIQ handoff
 */

import React from "react";
import {
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  MONO,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";
import { Pill, SCaps } from "@/components/bureau/primitives";
import { hexA, AMBER, BLUE } from "./cards";
import type { AssetPack } from "@/lib/signaliq/types";

// Minimal Markdown renderer for AI-generated text (## headings, **bold**, "- " lists).
// The model output for pack.brief is lightly-formatted Markdown; this renders it
// properly instead of showing the raw "##"/"**" syntax as literal characters.
function inlineMd(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

export function MarkdownLite({ text, textColor }: { text: string; textColor: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.length > 0 && lines.every(l => /^\s*-\s+/.test(l));
        if (/^#{1,6}\s+/.test(block)) {
          const heading = block.replace(/^#{1,6}\s+/, "");
          return (
            <p key={i} style={{ margin: "14px 0 0", fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: ".02em", color: textColor }}>
              {inlineMd(heading, `h${i}`)}
            </p>
          );
        }
        if (isList) {
          return (
            <ul key={i} style={{ margin: "10px 0 0", paddingLeft: 20, color: textColor }}>
              {lines.map((l, j) => (
                <li key={j} style={{ marginTop: j === 0 ? 0 : 4, lineHeight: 1.6 }}>
                  {inlineMd(l.replace(/^\s*-\s+/, ""), `li${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: "10px 0 0", lineHeight: 1.6, color: textColor }}>
            {inlineMd(block, `p${i}`)}
          </p>
        );
      })}
    </>
  );
}

export function PackView({
  pack,
  onDownloadPDF,
  downloadNote,
  pressIqHref = "/tools/pressiq",
  buildAssetHref,
}: {
  pack: AssetPack;
  onDownloadPDF?: () => void;
  downloadNote?: string | null;
  pressIqHref?: string;
  buildAssetHref?: string;
}) {
  const copy = (text: string) => {
    try { navigator.clipboard?.writeText(text); } catch { /* noop */ }
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.1, color: INK }}>
        {pack.headline}
      </h3>

      {/* Quick download — mirrors the full report bar lower down, surfaced up top */}
      {onDownloadPDF && (
        <div style={{ marginTop: 12, marginBottom: 4, padding: "10px 14px", border: `1px solid ${INK15}`, background: PAPER2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <SCaps size={9.5} ls="0.14em" color={INK}>Download full report — opportunities, asset pack, sources, pitch angle</SCaps>
          <button
            onClick={onDownloadPDF}
            className="siq-scan-btn"
            style={{ fontSize: 11.5, padding: "9px 18px", whiteSpace: "nowrap" }}
          >
            Download PDF →
          </button>
        </div>
      )}

      {/* How to use this pack */}
      <div style={{ marginTop: 16, border: `1px solid ${INK}`, background: PAPER }}>
        <div style={{ padding: "14px 20px 0" }}>
          <SCaps size={10.5} ls="0.18em" color={INK}>How to use this pack</SCaps>
        </div>
        <div className="siq-detail-cols" style={{ padding: "12px 20px 18px", gap: 0 }}>
          {/* Path A — with EMOS & SIA tools */}
          <div style={{ paddingRight: 20, borderRight: `1px solid ${INK15}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Pill size={8} ls="0.14em">Recommended</Pill>
              <SCaps size={9} ls="0.14em" color={INK}>With EMOS &amp; SIA tools</SCaps>
            </div>
            {([
              ["01", "Score the pitch angle in PressIQ before you send it"],
              ["02", "Use the journalist shortlist in this pack, personalise your outreach to each one before sending"],
              ["03", "Build the Authority Asset using the EMOS playbook and cadence"],
              ["04", "Run the full earned-media play: EMOS handles the system around it"],
            ] as [string, string][]).map(([n, t]) => (
              <div key={n} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "baseline" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK, lineHeight: 1, borderBottom: `2px solid ${YEL}`, paddingBottom: 1, flexShrink: 0 }}>{n}</span>
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: INK70, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Path B — going solo */}
          <div style={{ paddingLeft: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <SCaps size={9} ls="0.14em" color={INK55}>Going solo</SCaps>
            </div>
            {([
              ["01", "Use the data brief as your research base: cite the numbers directly"],
              ["02", "Personalise the pitch angle for each journalist and outlet you contact"],
              ["03", "Build the Authority Asset on your site before you pitch: give them something to link to"],
              ["04", "Verify every caution and fact-check the sources before sending anything"],
            ] as [string, string][]).map(([n, t]) => (
              <div key={n} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "baseline" }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: INK55, lineHeight: 1, paddingBottom: 1, flexShrink: 0 }}>{n}</span>
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: INK55, lineHeight: 1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data brief */}
      <div style={{ marginTop: 18, padding: "18px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <SCaps size={10} ls="0.16em" color={INK}>Data brief</SCaps>
        <div style={{ fontFamily: SERIF, fontSize: 15.5 }}>
          <MarkdownLite text={pack.brief} textColor={INK70} />
        </div>
      </div>

      {/* Pitch angle */}
      <div style={{ marginTop: 16, padding: "18px 20px", border: `1px solid ${INK}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <SCaps size={10} ls="0.16em" color={INK}>Pitch angle</SCaps>
          <button onClick={() => copy(pack.angle)} className="siq-back">Copy</button>
        </div>
        <p style={{ margin: "6px 0 0", fontFamily: GROT, fontSize: 11, letterSpacing: ".03em", color: INK55 }}>
          Subject: {pack.subjectLine}
        </p>
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: INK, whiteSpace: "pre-wrap" }}>
          {pack.angle}
        </p>
        <a href={pressIqHref} className="siq-cross-link">
          Score this pitch in PressIQ →
        </a>
      </div>

      {/* Authority asset idea */}
      <div style={{ marginTop: 16, padding: "16px 20px", borderLeft: `3px solid ${YEL}`, background: hexA(YEL, 0.08) }}>
        <SCaps size={10} ls="0.16em" color={INK}>Authority Asset</SCaps>
        <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK }}>
          {pack.linkableAssetIdea}
        </p>
        {/* Dashboard-only: hand the whole pack context to AssetIQ */}
        {buildAssetHref && (
          <a
            href={buildAssetHref}
            style={{ display: "inline-block", marginTop: 12, padding: "9px 16px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Build asset from this pack →
          </a>
        )}
      </div>

      {/* Signal chart */}
      {pack.chart && (
        <div style={{ marginTop: 16, padding: "16px 20px", border: `1px solid ${INK15}`, background: PAPER2 }}>
          <SCaps size={10} ls="0.16em" color={INK}>{pack.chart.title}</SCaps>
          <div style={{ marginTop: 12 }}>
            {pack.chart.points.map((pt, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: GROT, fontSize: 10.5, letterSpacing: ".04em", color: INK70 }}>{pt.x}</span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 12.5, color: INK }}>{pt.y}</span>
                </div>
                <div style={{ height: 7, background: PAPER, border: `1px solid ${INK15}` }}>
                  <div style={{ height: "100%", width: `${pt.y}%`, background: BLUE, transition: "width .5s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>
            {pack.chart.caption}
          </p>
        </div>
      )}

      {/* Journalists */}
      {pack.journalists.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SCaps size={10} ls="0.16em" color={INK}>Who to pitch</SCaps>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {pack.journalists.map((j, i) => (
              <div key={i} style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "12px 14px" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14.5, color: INK }}>{j.name}</div>
                <div style={{ fontFamily: GROT, fontSize: 10, letterSpacing: ".04em", color: INK55, margin: "2px 0 6px" }}>
                  {j.outlet} · {j.beat}
                </div>
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.45, color: INK70 }}>{j.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cautions */}
      {pack.cautions.length > 0 && (
        <div style={{ marginTop: 16, padding: "14px 18px", border: `1px solid ${AMBER}`, background: hexA(AMBER, 0.08) }}>
          <SCaps size={10} ls="0.16em" color={INK}>Before you pitch: verify</SCaps>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {pack.cautions.map((ct, i) => (
              <li key={i} style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK70, marginBottom: 4 }}>{ct}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources — live data callout (trust differentiator) */}
      <div style={{ marginTop: 16, border: `1px solid ${INK}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <SCaps size={10} ls="0.16em" color={INK}>Sources</SCaps>
          <Pill size={8} ls="0.14em">Live · Primary data</Pill>
        </div>
        <p style={{ margin: "8px 0 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, lineHeight: 1.5 }}>
          Every signal below comes from a live, open, primary-source database,
          not stale training data. No hallucinated citations. Click through to verify.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 10, borderTop: `1px solid ${INK15}` }}>
          {pack.sources.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: INK35, flexShrink: 0 }}>
                Live
              </span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: SERIF, fontSize: 13.5, color: INK, textDecoration: "underline", textDecorationColor: INK35 }}
              >
                {s.label} ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* PDF download — the public wrapper gates the first click behind the email modal */}
      {onDownloadPDF && (
        <div style={{ marginTop: 20, padding: "16px 20px", border: `1px solid ${INK15}`, background: PAPER2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <SCaps size={10} ls="0.14em" color={INK}>Download full report</SCaps>
            <p style={{ margin: "4px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, lineHeight: 1.4 }}>
              PDF covering all three steps: opportunities, asset pack, sources, and pitch angle.
              {downloadNote ? ` ${downloadNote}` : ""}
            </p>
          </div>
          <button
            onClick={onDownloadPDF}
            className="siq-scan-btn"
            style={{ fontSize: 12, padding: "12px 22px", whiteSpace: "nowrap" }}
          >
            Download PDF →
          </button>
        </div>
      )}
    </div>
  );
}
