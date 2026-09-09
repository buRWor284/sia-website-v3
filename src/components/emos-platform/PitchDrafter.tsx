"use client";

/**
 * PitchDrafter — write pitches for saved journalists, one or many at a time.
 *
 * Added 2026-09-09 at Irfan's request: "draft pitches for each journalist one
 * by one, or draft them all for multiple journalists, or all journalists for
 * one company." The company filter is what the CRM context layer (phase 5)
 * exists to make possible — before it, journalists carried no company at all.
 *
 * Drafts are deliberately NOT persisted. They are cheap to regenerate on
 * Sonnet, and the thing worth keeping is the SCORE, which already persists with
 * the journalist and asset attached. "Score this one" is the handoff.
 */

import React, { useMemo, useState } from "react";
import { useCompanyOptional } from "./CompanyProvider";
import type { DbJournalist } from "@/lib/coverageiq/types";
import type { DbAsset } from "@/app/emos-platform/actions/assetiq";

const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const RED    = "#c14a32";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

const MAX_BATCH = 10;

interface Draft {
  journalistId: string;
  journalistName: string;
  subject: string;
  body: string;
  error?: string;
}

const LABEL: React.CSSProperties = {
  fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em",
  textTransform: "uppercase", color: INK, background: YEL, padding: "3px 7px", flexShrink: 0,
};
const FIELD_LABEL: React.CSSProperties = {
  display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8,
  letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 4,
};
const LINK: React.CSSProperties = {
  background: "none", border: "none", padding: 0, cursor: "pointer",
  fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em",
  textTransform: "uppercase", color: INK55, borderBottom: `1px solid ${INK35}`, lineHeight: 1,
};

function DraftCard({ draft, onUse }: { draft: Draft; onUse: (d: Draft) => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  }

  if (draft.error) {
    return (
      <div style={{ border: `1px solid ${INK15}`, padding: "12px 14px", background: PAPER }}>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13.5 }}>{draft.journalistName}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: RED, marginTop: 3 }}>{draft.error}</div>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${INK}`, background: PAPER }}>
      <div style={{ background: INK, color: PAPER, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 13.5 }}>{draft.journalistName}</span>
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9, color: "rgba(241,235,222,.6)" }}>
          {draft.body.trim().split(/\s+/).length} words
        </span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={FIELD_LABEL}>Subject</div>
        <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: INK }}>{draft.subject}</p>
        <div style={FIELD_LABEL}>Body</div>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.6, color: INK, whiteSpace: "pre-wrap" }}>{draft.body}</p>
        <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={copy} style={{ ...LINK, color: copied ? GREEN : INK55, borderBottomColor: copied ? GREEN : INK35 }}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button onClick={() => onUse(draft)} style={LINK}>Score this one →</button>
        </div>
      </div>
    </div>
  );
}

export default function PitchDrafter({
  journalists,
  assets,
  onUseDraft,
}: {
  journalists: DbJournalist[];
  assets: DbAsset[];
  /** Load a draft into the scorer above, with its journalist selected. */
  onUseDraft: (d: { journalistId: string; subject: string; body: string }) => void;
}) {
  const ctx = useCompanyOptional();
  const activeCompanyId = ctx?.company?.id ?? null;
  const activeCompanyName = ctx?.company?.name ?? null;

  const [scope, setScope] = useState<"company" | "all">("company");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assetId, setAssetId] = useState("");
  const [angle, setAngle] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);

  // "All journalists for one company" is the ask. It only works because the
  // CRM now records which company each journalist was found for.
  const pool = useMemo(() => {
    if (scope === "all" || !activeCompanyId) return journalists;
    return journalists.filter(j => j.company_id === activeCompanyId);
  }, [journalists, scope, activeCompanyId]);

  const chosen = useMemo(() => pool.filter(j => selected.has(j.id)), [pool, selected]);
  const overCap = chosen.length > MAX_BATCH;

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectAll() { setSelected(new Set(pool.slice(0, MAX_BATCH).map(j => j.id))); }
  function clearAll() { setSelected(new Set()); }

  async function run() {
    if (chosen.length === 0 || busy) return;
    setBusy(true); setError(null); setDrafts(null);
    try {
      const res = await fetch("/api/emos-platform/pitch-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalistIds: chosen.slice(0, MAX_BATCH).map(j => j.id),
          companyId: activeCompanyId,
          assetId: assetId || undefined,
          angle: angle.trim() || undefined,
        }),
      });
      const data = await res.json() as { drafts?: Draft[]; error?: string };
      if (!res.ok || data.error) { setError(data.error ?? "Could not draft the pitches."); return; }
      setDrafts(data.drafts ?? []);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const failed = drafts?.filter(d => d.error).length ?? 0;

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>
          Draft pitches
        </span>
        <button onClick={() => setOpen(o => !o)} style={LINK}>{open ? "Hide" : "Open"}</button>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>
          Write a personalised pitch for one journalist, or for all of them at once.
        </span>
      </div>

      {open && (
        <div style={{ border: `1px solid ${INK}`, background: PAPER2 }}>
          <div style={{ padding: "12px 14px", display: "grid", gap: 12 }}>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={LABEL}>Pitching for</span>
              <select
                value={scope}
                onChange={e => { setScope(e.target.value as "company" | "all"); clearAll(); }}
                style={{ background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".06em", padding: "6px 11px", outline: "none", cursor: "pointer" }}
              >
                <option value="company">
                  {activeCompanyName ? `${activeCompanyName} only` : "The selected company"}
                </option>
                <option value="all">Every journalist in the CRM</option>
              </select>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
                {pool.length} journalist{pool.length === 1 ? "" : "s"} · {chosen.length} selected
              </span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                <button onClick={selectAll} style={LINK}>Select all</button>
                <button onClick={clearAll} style={LINK}>Clear</button>
              </span>
            </div>

            {pool.length === 0 ? (
              <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                No journalists recorded against this company yet. Find some in JournoCollabIQ, or switch to
                every journalist in the CRM.
              </p>
            ) : (
              <div style={{ maxHeight: 220, overflowY: "auto", border: `1px solid ${INK15}`, background: PAPER }}>
                {pool.map(j => (
                  <label key={j.id} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "8px 11px", borderBottom: `1px solid ${INK15}`, cursor: "pointer" }}>
                    <input type="checkbox" checked={selected.has(j.id)} onChange={() => toggle(j.id)} style={{ marginTop: 3 }} />
                    <span>
                      <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13.5, color: INK }}>{j.name}</span>
                      {j.outlet && <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, color: INK55, marginLeft: 8 }}>{j.outlet}</span>}
                      {j.beat && (
                        <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 1 }}>
                          {j.beat.length > 90 ? j.beat.slice(0, 90) + "…" : j.beat}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={FIELD_LABEL}>Asset to offer <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <select
                  value={assetId}
                  onChange={e => setAssetId(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 10, padding: "7px 10px", outline: "none", cursor: "pointer" }}
                >
                  <option value="">No particular asset</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
              <div>
                <label style={FIELD_LABEL}>Batch limit</label>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: overCap ? RED : INK55, paddingTop: 7 }}>
                  {overCap
                    ? `Only the first ${MAX_BATCH} will be drafted.`
                    : `Up to ${MAX_BATCH} per run.`}
                </div>
              </div>
            </div>

            <div>
              <label style={FIELD_LABEL}>The story angle</label>
              <textarea
                value={angle}
                onChange={e => setAngle(e.target.value.slice(0, 2000))}
                rows={3}
                placeholder="The finding, the number, the dated hook. Every draft is built from this, so be specific: vague in, vague out."
                style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, padding: "9px 12px", resize: "vertical", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={run}
                disabled={chosen.length === 0 || busy}
                style={{
                  background: chosen.length && !busy ? YEL : "transparent",
                  color: chosen.length && !busy ? INK : INK55,
                  border: `1px solid ${chosen.length && !busy ? YEL : INK15}`,
                  padding: "9px 18px", fontFamily: GROT, fontWeight: 800, fontSize: 9.5,
                  letterSpacing: ".14em", textTransform: "uppercase",
                  cursor: chosen.length && !busy ? "pointer" : "default",
                }}
              >
                {busy
                  ? `Drafting ${Math.min(chosen.length, MAX_BATCH)}…`
                  : `Draft ${Math.min(chosen.length, MAX_BATCH) || ""} pitch${Math.min(chosen.length, MAX_BATCH) === 1 ? "" : "es"}`.trim()}
              </button>
              {busy && (
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>
                  Three at a time, a few seconds each.
                </span>
              )}
              {error && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: RED }}>{error}</span>}
            </div>
          </div>

          {drafts && drafts.length > 0 && (
            <div style={{ borderTop: `1px solid ${INK15}`, padding: "14px", display: "grid", gap: 12, background: PAPER2 }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
                {drafts.length - failed} drafted{failed > 0 ? `, ${failed} failed` : ""}. Read every one before you send it.
              </div>
              {drafts.map(d => (
                <DraftCard
                  key={d.journalistId}
                  draft={d}
                  onUse={() => onUseDraft({ journalistId: d.journalistId, subject: d.subject, body: d.body })}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
