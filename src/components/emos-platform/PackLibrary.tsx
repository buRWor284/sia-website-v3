"use client";

/**
 * PackLibrary — saved SignalIQ asset packs.
 *
 * Pipeline state layer, phase 2 (2026-09-09). Every pack generated before this
 * existed only in the browser tab that asked for it: closing the tab destroyed
 * the pitch angle, the sourced brief, the journalist shortlist and the
 * cautions, and getting them back cost another Opus call.
 *
 * Rows are collapsed to a headline; expanding shows the whole pack. Copy puts
 * it on the clipboard as Markdown, which is how it gets into a doc or an email.
 */

import React, { useState } from "react";
import { deleteAssetPack } from "@/app/emos-platform/actions/asset-packs";
import type { DbAssetPack } from "@/lib/asset-pack-types";
import { clipWords } from "@/lib/clip-words";

const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const INK70  = "rgba(26,20,16,.72)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const RED     = "#c14a32";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

function fmt(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

const SECTION_LABEL: React.CSSProperties = {
  fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".14em",
  textTransform: "uppercase", color: INK55, marginBottom: 5,
};

const LINK_BTN: React.CSSProperties = {
  background: "none", border: "none", padding: 0, cursor: "pointer",
  fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em",
  textTransform: "uppercase", color: INK55, borderBottom: `1px solid ${INK35}`,
  lineHeight: 1,
};

/** The pack as Markdown — what lands on the clipboard. */
function packToMarkdown(p: DbAssetPack): string {
  const lines: string[] = [];
  lines.push(`# ${p.headline ?? "Asset pack"}`);
  if (p.company_name) lines.push(`**Company:** ${p.company_name}`);
  if (p.beat_label) lines.push(`**Beat:** ${p.beat_label}`);
  lines.push(`**Generated:** ${fmt(p.created_at)}`);
  lines.push("");
  if (p.subject_line)       lines.push(`## Suggested subject line\n${p.subject_line}\n`);
  if (p.pitch_angle)        lines.push(`## Pitch angle\n${p.pitch_angle}\n`);
  if (p.story_brief)        lines.push(`## Data brief\n${p.story_brief}\n`);
  if (p.linkable_asset_idea) lines.push(`## Linkable asset idea\n${p.linkable_asset_idea}\n`);
  if (p.journalist_recs?.length) {
    lines.push("## Journalists");
    for (const j of p.journalist_recs) {
      lines.push(`- **${j.name}** — ${j.outlet}${j.beat ? ` (${j.beat})` : ""}${j.why ? `: ${j.why}` : ""}`);
    }
    lines.push("");
  }
  if (p.cautions?.length) {
    lines.push("## Before you pitch");
    for (const c of p.cautions) lines.push(`- ${c}`);
    lines.push("");
  }
  if (p.sources?.length) {
    lines.push("## Sources");
    for (const s of p.sources) lines.push(`- [${s.label}](${s.url})`);
  }
  return lines.join("\n");
}

function PackDetail({ pack }: { pack: DbAssetPack }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(packToMarkdown(pack));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const buildHref =
    `/emos-platform/dashboard/assetiq?headline=${encodeURIComponent(pack.headline ?? "")}` +
    `&assetIdea=${encodeURIComponent(pack.linkable_asset_idea ?? "")}` +
    `&dataBrief=${encodeURIComponent(clipWords(pack.story_brief ?? "", 400))}` +
    `&pitchAngle=${encodeURIComponent(clipWords(pack.pitch_angle ?? "", 300))}` +
    (pack.signal_id ? `&signal=${pack.signal_id}` : "");

  return (
    <div style={{ padding: "16px 18px", background: PAPER2, borderTop: `1px solid ${INK15}` }}>
      {pack.subject_line && (
        <div style={{ marginBottom: 14 }}>
          <div style={SECTION_LABEL}>Suggested subject line</div>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14, color: INK }}>{pack.subject_line}</p>
        </div>
      )}

      {pack.pitch_angle && (
        <div style={{ marginBottom: 14 }}>
          <div style={SECTION_LABEL}>Pitch angle</div>
          <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: INK70 }}>
            {pack.pitch_angle}
          </p>
        </div>
      )}

      {pack.story_brief && (
        <div style={{ marginBottom: 14 }}>
          <div style={SECTION_LABEL}>Data brief</div>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13, lineHeight: 1.6, color: INK70, whiteSpace: "pre-wrap" }}>
            {pack.story_brief}
          </p>
        </div>
      )}

      {pack.linkable_asset_idea && (
        <div style={{ marginBottom: 14 }}>
          <div style={SECTION_LABEL}>Linkable asset idea</div>
          <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: INK70 }}>
            {pack.linkable_asset_idea}
          </p>
        </div>
      )}

      {!!pack.journalist_recs?.length && (
        <div style={{ marginBottom: 14 }}>
          <div style={SECTION_LABEL}>Journalists</div>
          <div style={{ display: "grid", gap: 7 }}>
            {pack.journalist_recs.map((j, i) => (
              <div key={i} style={{ border: `1px solid ${INK15}`, background: PAPER, padding: "8px 11px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13.5, color: INK }}>{j.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, color: INK55 }}>{j.outlet}</span>
                  {j.beat && (
                    <span style={{ fontFamily: GROT, fontSize: 8, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: INK55, border: `1px solid ${INK15}`, padding: "1px 5px" }}>
                      {j.beat}
                    </span>
                  )}
                </div>
                {j.why && (
                  <p style={{ margin: "4px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12, lineHeight: 1.45, color: INK55 }}>
                    {j.why}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!!pack.cautions?.length && (
        <div style={{ marginBottom: 14 }}>
          <div style={SECTION_LABEL}>Before you pitch</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.6, color: INK70 }}>
            {pack.cautions.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {!!pack.sources?.length && (
        <div style={{ marginBottom: 14 }}>
          <div style={SECTION_LABEL}>Sources</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pack.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: MONO, fontSize: 10, color: INK55, borderBottom: `1px solid ${INK35}`, textDecoration: "none" }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
        <button onClick={handleCopy} style={{ ...LINK_BTN, color: copied ? GREEN : INK55, borderBottomColor: copied ? GREEN : INK35 }}>
          {copied ? "✓ Copied" : "Copy as Markdown"}
        </button>
        <a href={buildHref} style={{ ...LINK_BTN, textDecoration: "none", display: "inline-block" }}>
          Build the asset →
        </a>
      </div>
    </div>
  );
}

export default function PackLibrary({ initialPacks }: { initialPacks: DbAssetPack[] }) {
  const [packs, setPacks] = useState<DbAssetPack[]>(initialPacks);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusyId(id);
    const ok = await deleteAssetPack(id);
    setBusyId(null);
    if (ok) {
      setPacks(prev => prev.filter(p => p.id !== id));
      setConfirmId(null);
      if (openId === id) setOpenId(null);
    }
  }

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>
          Pitch Packs
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK }}>{packs.length}</span>
        <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>saved</span>
      </div>

      {packs.length === 0 ? (
        <div style={{ padding: "32px 24px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
          <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55 }}>
            No packs yet. Run a scan, pick an opportunity and generate the pitch pack at step 5 — it is kept here from now on.
          </p>
        </div>
      ) : (
        <div style={{ border: `1px solid ${INK}` }}>
          {packs.map((p, idx) => {
            const open = openId === p.id;
            return (
              <div key={p.id} style={{ borderBottom: idx < packs.length - 1 ? `1px solid ${INK15}` : "none", opacity: busyId === p.id ? 0.45 : 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 15px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setOpenId(open ? null : p.id)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", flex: 1, minWidth: 240 }}
                  >
                    <div style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, lineHeight: 1.3, color: INK }}>
                      {open ? "▾ " : "▸ "}{p.headline ?? "Untitled pack"}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5, alignItems: "center" }}>
                      {p.company_name && (
                        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".08em", textTransform: "uppercase", color: INK, background: YEL, padding: "2px 6px" }}>
                          {p.company_name}
                        </span>
                      )}
                      {p.beat_label && (
                        <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: INK55, border: `1px solid ${INK15}`, padding: "2px 6px" }}>
                          {p.beat_label}
                        </span>
                      )}
                      <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".06em", color: INK55 }}>{fmt(p.created_at)}</span>
                      {!!p.journalist_recs?.length && (
                        <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".06em", color: INK55 }}>
                          · {p.journalist_recs.length} journalist{p.journalist_recs.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </button>

                  {confirmId === p.id ? (
                    <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button onClick={() => handleDelete(p.id)} disabled={busyId === p.id}
                        style={{ ...LINK_BTN, color: RED, borderBottomColor: RED }}>
                        {busyId === p.id ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button onClick={() => setConfirmId(null)} style={LINK_BTN}>Keep</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmId(p.id)} style={{ ...LINK_BTN, color: RED, borderBottomColor: RED }}>
                      Delete
                    </button>
                  )}
                </div>

                {open && <PackDetail pack={p} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
