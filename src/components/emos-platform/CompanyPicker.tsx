"use client";

/**
 * CompanyPicker — the one control that says which company the tool below is
 * working for. Sits at the top of every EMOS dashboard tool that reads company
 * context (SignalIQ, AssetIQ, JournoCollabIQ).
 *
 * Selection persists per device; the companies themselves are org-scoped rows,
 * so a second browser or a teammate sees the same list.
 */

import React, { useState } from "react";
import { useCompanyOptional } from "./CompanyProvider";
import { COMPANY_CONTEXT_MAX } from "@/lib/company-types";

const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";

const LABEL: React.CSSProperties = {
  fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em",
  textTransform: "uppercase", color: INK, background: YEL, padding: "3px 7px",
  flexShrink: 0,
};

const FIELD: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`,
  color: INK, fontFamily: SERIF, fontSize: 13.5, padding: "8px 11px", outline: "none",
};

export default function CompanyPicker({ note }: { note?: string }) {
  const ctx = useCompanyOptional();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);

  // No provider (public tools) — render nothing rather than half a control.
  if (!ctx) return null;

  const { companies, company, saving, setActive, addCompany } = ctx;

  async function handleAdd() {
    if (!name.trim() || busy) return;
    setBusy(true);
    const created = await addCompany({ name, context });
    setBusy(false);
    if (created) { setName(""); setContext(""); setAdding(false); }
  }

  const empty = companies.length === 0;

  return (
    <div style={{ border: `1px solid ${INK}`, marginBottom: 22, background: PAPER2 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 14px", borderBottom: adding ? `1px solid ${INK15}` : "none",
      }}>
        <span style={LABEL}>Working for</span>

        {empty ? (
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
            No company saved yet. Add one and every EMOS tool will use it.
          </span>
        ) : (
          <select
            value={company?.id ?? ""}
            onChange={e => setActive(e.target.value)}
            style={{
              background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT,
              fontWeight: 700, fontSize: 10, letterSpacing: ".06em", padding: "6px 11px",
              outline: "none", cursor: "pointer", maxWidth: 280,
            }}
          >
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        <button
          onClick={() => setAdding(a => !a)}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em",
            textTransform: "uppercase", color: INK55, borderBottom: `1px solid ${INK15}`,
            lineHeight: 1.4,
          }}
        >
          {adding ? "Cancel" : "+ Add company"}
        </button>

        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {saving && (
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
              Saving…
            </span>
          )}
          {!saving && company?.id && (
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: GREEN }}>
              ✓ Saved to your account
            </span>
          )}
          {note && (
            <span style={{ fontFamily: GROT, fontSize: 8.5, letterSpacing: ".1em", textTransform: "uppercase", color: INK55 }}>
              {note}
            </span>
          )}
        </span>
      </div>

      {adding && (
        <div style={{ padding: "13px 14px", display: "grid", gap: 9 }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Company name"
            style={FIELD}
          />
          <textarea
            value={context}
            onChange={e => setContext(e.target.value.slice(0, COMPANY_CONTEXT_MAX))}
            rows={2}
            placeholder="What they do, who they serve, what makes them quotable. This is what every tool reads."
            style={{ ...FIELD, fontStyle: "italic", lineHeight: 1.55, resize: "none" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleAdd}
              disabled={!name.trim() || busy}
              style={{
                background: name.trim() && !busy ? INK : "transparent",
                color: name.trim() && !busy ? PAPER : INK55,
                border: `1px solid ${name.trim() && !busy ? INK : INK15}`,
                padding: "7px 15px", fontFamily: GROT, fontWeight: 800, fontSize: 9,
                letterSpacing: ".14em", textTransform: "uppercase",
                cursor: name.trim() && !busy ? "pointer" : "default",
              }}
            >
              {busy ? "Saving…" : "Save company"}
            </button>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
              {context.length}/{COMPANY_CONTEXT_MAX}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
