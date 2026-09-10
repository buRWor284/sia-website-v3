"use client";

/**
 * CompanyBriefPanel — the Company Brief for the selected company (2026-09-10).
 *
 * Three ways in: "Research their website" (EMOS reads it), "Upload .md / .txt"
 * or paste (EMOS rewrites it under the fixed headings), or write it by hand
 * from a blank template. Whatever comes back is a DRAFT; the tools only use it
 * after "Approve". Opened from CompanyPicker → Manage → Company brief.
 */

import React, { useEffect, useRef, useState } from "react";
import { getCompanyBrief, saveCompanyBrief } from "@/app/emos-platform/actions/company-briefs";
import {
  BRIEF_MAX, BRIEF_UPLOAD_MAX, blankBrief, selfServePrompt, type CompanyBrief,
} from "@/lib/company-brief-types";

const PAPER  = "#f1ebde";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const RED    = "#c14a32";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono, ui-monospace, monospace)";

const BTN = (primary: boolean, enabled = true): React.CSSProperties => ({
  background: primary && enabled ? INK : "transparent",
  color: !enabled ? INK55 : primary ? PAPER : INK,
  border: `1px solid ${enabled ? INK : INK15}`,
  padding: "7px 13px", fontFamily: GROT, fontWeight: 800, fontSize: 9,
  letterSpacing: ".12em", textTransform: "uppercase",
  cursor: enabled ? "pointer" : "default",
});

const NOTE: React.CSSProperties = { fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55, lineHeight: 1.5 };

type Busy = null | "load" | "research" | "condense" | "save";
type Pending = null | { kind: "research" } | { kind: "condense"; text: string; fileName: string };

export default function CompanyBriefPanel({
  companyId, companyName, website,
}: { companyId: string; companyName: string; website: string | null }) {
  const [brief, setBrief] = useState<CompanyBrief | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<Busy>("load");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [paste, setPaste] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    getCompanyBrief(companyId).then(b => {
      if (!live) return;
      setBrief(b);
      setText(b?.content ?? "");
      setBusy(null);
    });
    return () => { live = false; };
  }, [companyId]);

  const dirty = text !== (brief?.content ?? "");
  const hasContent = !!(brief?.content ?? "").trim();

  function run(p: Exclude<Pending, null>) {
    // Replacing existing work needs a second click, never a native dialog.
    if (hasContent || text.trim()) { setPending(p); return; }
    void execute(p);
  }

  async function execute(p: Exclude<Pending, null>) {
    setPending(null); setError(null); setInfo(null);
    setBusy(p.kind);
    try {
      const res = await fetch("/api/emos-platform/company-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p.kind === "research"
          ? { companyId, mode: "research" }
          : { companyId, mode: "condense", text: p.text, fileName: p.fileName }),
      });
      const data = (await res.json().catch(() => ({}))) as { brief?: CompanyBrief; error?: string };
      if (!res.ok || !data.brief) { setError(data.error || "Something went wrong. Please try again."); return; }
      setBrief(data.brief);
      setText(data.brief.content);
      setPasteOpen(false); setPaste("");
      setInfo("Draft ready. Read it, fix anything wrong, then approve it so the tools can use it.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!/\.(md|markdown|txt)$/i.test(f.name)) { setError("Upload a .md or .txt file."); return; }
    if (f.size > BRIEF_UPLOAD_MAX * 2) { setError("That file is too large."); return; }
    const content = await f.text();
    run({ kind: "condense", text: content.slice(0, BRIEF_UPLOAD_MAX), fileName: f.name });
  }

  async function save(status: "draft" | "approved") {
    setBusy("save"); setError(null); setInfo(null);
    const saved = await saveCompanyBrief(companyId, text, status);
    setBusy(null);
    if (!saved && text.trim()) { setError("Could not save. Please try again."); return; }
    setBrief(saved);
    setText(saved?.content ?? "");
    setInfo(!saved ? "Brief removed." : status === "approved"
      ? "Approved. SignalIQ, AssetIQ, JournoCollabIQ and the pitch drafter now use it for this company."
      : "Saved as a draft. The tools won't use it until you approve it.");
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(selfServePrompt(companyName));
      setInfo("Prompt copied. Paste it into your own AI (or the client's), then upload or paste what it writes.");
    } catch {
      setError("Couldn't copy automatically. Your browser blocked it.");
    }
  }

  const status = brief?.status ?? null;
  const working = busy === "research" || busy === "condense";

  return (
    <div style={{ padding: "13px 14px", display: "grid", gap: 11, borderTop: `1px solid ${INK15}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: INK }}>
          Company brief · {companyName}
        </span>
        <span style={{
          fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase",
          padding: "3px 7px",
          background: status === "approved" ? GREEN : status === "draft" ? YEL : "transparent",
          color: status === "approved" ? PAPER : INK,
          border: status ? "none" : `1px solid ${INK15}`,
        }}>
          {status === "approved" ? "Approved · in use" : status === "draft" ? "Draft · not in use yet" : "None yet"}
        </span>
      </div>

      <p style={{ ...NOTE, margin: 0 }}>
        What only this company knows: goals, challenges, customer truth, proof points, assets it already has,
        what counts as a good or bad result, and what is off limits. Once approved, SignalIQ, AssetIQ,
        JournoCollabIQ and the pitch drafter use it to pick better stories and journalists, and to stop
        suggesting things the company already has.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => run({ kind: "research" })} disabled={!website || !!busy} style={BTN(true, !!website && !busy)}>
          {busy === "research" ? "Reading their website…" : "Research their website"}
        </button>
        <button onClick={() => fileRef.current?.click()} disabled={!!busy} style={BTN(false, !busy)}>
          {busy === "condense" ? "Reading your document…" : "Upload .md / .txt"}
        </button>
        <input ref={fileRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={onFile} style={{ display: "none" }} />
        <button onClick={() => setPasteOpen(o => !o)} disabled={!!busy} style={BTN(false, !busy)}>
          {pasteOpen ? "Close paste" : "Paste notes"}
        </button>
        <button onClick={() => { setText(blankBrief(companyName)); setInfo("Blank template added. Fill in what you know, then save or approve."); }} disabled={!!busy} style={BTN(false, !busy)}>
          Blank template
        </button>
        <button onClick={copyPrompt} style={{ ...BTN(false), border: "none", textDecoration: "underline", padding: "7px 4px" }}>
          Copy prompt for your own AI
        </button>
      </div>

      <p style={{ ...NOTE, margin: 0, fontSize: 11.5 }}>
        {website
          ? <>Research reads up to 10 pages of <strong>{website}</strong> and costs about as much as one pitch score in AI fees (a few cents). Upload or paste costs about the same. Both replace the current draft and nothing is used until you approve it.</>
          : <>Add the company&apos;s website (Manage → Edit) to use Research. Upload, paste or the template work without it.</>}
      </p>

      {pending && (
        <div style={{ border: `1px solid ${YEL}`, background: "rgba(245,184,31,.10)", padding: "9px 12px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: SERIF, fontSize: 13, color: INK }}>
            This replaces the brief below with a new draft{hasContent && status === "approved" ? " and takes it out of use until you approve again" : ""}.
          </span>
          <button onClick={() => void execute(pending)} style={BTN(true)}>Replace it</button>
          <button onClick={() => setPending(null)} style={{ ...BTN(false), border: "none" }}>Cancel</button>
        </div>
      )}

      {pasteOpen && (
        <div style={{ display: "grid", gap: 8 }}>
          <textarea
            value={paste}
            onChange={e => setPaste(e.target.value.slice(0, BRIEF_UPLOAD_MAX))}
            rows={6}
            placeholder="Paste anything about the company: an existing brief, notes from a call, what their own AI wrote…"
            style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 13, padding: "8px 11px", lineHeight: 1.5, resize: "vertical" }}
          />
          <div>
            <button
              onClick={() => run({ kind: "condense", text: paste, fileName: "pasted notes" })}
              disabled={paste.trim().length < 40 || !!busy}
              style={BTN(true, paste.trim().length >= 40 && !busy)}
            >
              Turn into a brief
            </button>
          </div>
        </div>
      )}

      {working && (
        <p style={{ ...NOTE, margin: 0, color: INK }}>
          {busy === "research" ? "Reading their pages and writing the brief. This takes 20 to 60 seconds." : "Rewriting your document under the brief's headings. About 20 to 40 seconds."}
        </p>
      )}
      {error && <p style={{ ...NOTE, margin: 0, color: RED }}>{error}</p>}
      {info && !error && <p style={{ ...NOTE, margin: 0, color: GREEN }}>{info}</p>}

      {busy === "load" ? (
        <p style={{ ...NOTE, margin: 0 }}>Loading…</p>
      ) : (text || brief) ? (
        <>
          {brief?.source === "research" && brief.status === "draft" && !dirty && (
            <p style={{ ...NOTE, margin: 0, color: INK }}>
              Check it before approving: everything here came from their website, and their claims about themselves are marked self-reported.
            </p>
          )}
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, BRIEF_MAX))}
            rows={18}
            style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK}`, color: INK, fontFamily: MONO, fontSize: 12, padding: "10px 12px", lineHeight: 1.55, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => void save("approved")} disabled={!!busy || !text.trim()} style={BTN(true, !busy && !!text.trim())}>
              {status === "approved" && !dirty ? "Approved" : "Approve and use"}
            </button>
            <button onClick={() => void save("draft")} disabled={!!busy || (!dirty && status === "draft")} style={BTN(false, !busy && (dirty || status !== "draft"))}>
              {status === "approved" ? "Stop using (keep as draft)" : "Save draft"}
            </button>
            <span style={{ ...NOTE, fontSize: 11.5 }}>
              {text.length.toLocaleString()}/{BRIEF_MAX.toLocaleString()}{dirty ? " · unsaved changes" : ""}
            </span>
          </div>
          {!!brief?.sources?.length && (
            <details>
              <summary style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, cursor: "pointer" }}>
                Read from {brief.sources.length} {brief.sources.length === 1 ? "source" : "sources"}
              </summary>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontFamily: MONO, fontSize: 11, color: INK55, lineHeight: 1.6 }}>
                {brief.sources.map(s => <li key={s}>{s}</li>)}
              </ul>
            </details>
          )}
        </>
      ) : (
        <p style={{ ...NOTE, margin: 0 }}>No brief yet. Pick one of the options above.</p>
      )}
    </div>
  );
}
