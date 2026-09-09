"use client";

/**
 * CompanyPicker — the one control that says which company the tool below is
 * working for. Sits at the top of every EMOS dashboard tool that reads company
 * context (SignalIQ, AssetIQ, JournoCollabIQ).
 *
 * The companies are org-scoped rows and the selection lives on the user's own
 * row, so switching here switches every tool, on every browser that person
 * signs in from.
 *
 * Three panels, one open at a time: add, edit (rename / description / website),
 * and an inline delete confirm. Deliberately no window.confirm — a native
 * dialog blocks the page and reads as an alert rather than a choice.
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
const RED    = "#c14a32";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";

const LABEL: React.CSSProperties = {
  fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".14em",
  textTransform: "uppercase", color: INK, background: YEL, padding: "3px 7px",
  flexShrink: 0,
};

const LINK: React.CSSProperties = {
  background: "none", border: "none", padding: 0, cursor: "pointer",
  fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em",
  textTransform: "uppercase", color: INK55, borderBottom: `1px solid ${INK15}`,
  lineHeight: 1.4,
};

const FIELD: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`,
  color: INK, fontFamily: SERIF, fontSize: 13.5, padding: "8px 11px", outline: "none",
};

const FIELD_LABEL: React.CSSProperties = {
  display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8,
  letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 4,
};

function primaryBtn(enabled: boolean): React.CSSProperties {
  return {
    background: enabled ? INK : "transparent",
    color: enabled ? PAPER : INK55,
    border: `1px solid ${enabled ? INK : INK15}`,
    padding: "7px 15px", fontFamily: GROT, fontWeight: 800, fontSize: 9,
    letterSpacing: ".14em", textTransform: "uppercase",
    cursor: enabled ? "pointer" : "default",
  };
}

type Panel = "none" | "add" | "edit" | "confirmDelete";

/** Seeded once from the company it is given, and remounted via `key` when the
 * selection changes. That keeps the seeding out of an effect, which the
 * react-hooks/set-state-in-effect rule (correctly) rejects. */
function EditCompanyForm({
  name: initialName,
  context: initialContext,
  website: initialWebsite,
  busy,
  onSave,
}: {
  name: string;
  context: string;
  website: string;
  busy: boolean;
  onSave: (patch: { name: string; context: string; website: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [context, setContext] = useState(initialContext);
  const [website, setWebsite] = useState(initialWebsite);

  return (
    <div style={{ padding: "13px 14px", display: "grid", gap: 9 }}>
      <div>
        <label style={FIELD_LABEL}>Company name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} style={FIELD} />
      </div>
      <div>
        <label style={FIELD_LABEL}>What they do</label>
        <textarea
          value={context}
          onChange={e => setContext(e.target.value.slice(0, COMPANY_CONTEXT_MAX))}
          rows={3}
          style={{ ...FIELD, fontStyle: "italic", lineHeight: 1.55, resize: "vertical" }}
        />
      </div>
      <div>
        <label style={FIELD_LABEL}>Website <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
        <input type="text" value={website} onChange={e => setWebsite(e.target.value)}
          placeholder="acme.com" style={FIELD} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => onSave({ name, context, website })}
          disabled={!name.trim() || busy}
          style={primaryBtn(!!name.trim() && !busy)}
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
          {context.length}/{COMPANY_CONTEXT_MAX} · renaming does not change signals already saved under the old name
        </span>
      </div>
    </div>
  );
}

export default function CompanyPicker({ note }: { note?: string }) {
  const ctx = useCompanyOptional();
  const [panel, setPanel] = useState<Panel>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [addName, setAddName] = useState("");
  const [addContext, setAddContext] = useState("");
  const [addWebsite, setAddWebsite] = useState("");

  const company = ctx?.company ?? null;
  const companyId = company?.id ?? "";

  // No provider (public tools) — render nothing rather than half a control.
  if (!ctx) return null;

  const { companies, saving, setActive, addCompany, editCompany, removeCompany } = ctx;
  const empty = companies.length === 0;
  const saved = !!company?.id;

  function toggle(p: Panel) {
    setError(null);
    setPanel(cur => (cur === p ? "none" : p));
  }

  async function handleAdd() {
    if (!addName.trim() || busy) return;
    setBusy(true); setError(null);
    const created = await addCompany({ name: addName, context: addContext, website: addWebsite });
    setBusy(false);
    if (!created) { setError("Could not save that company. Please try again."); return; }
    setAddName(""); setAddContext(""); setAddWebsite(""); setPanel("none");
  }

  async function handleSaveEdit(patch: { name: string; context: string; website: string }) {
    if (!companyId || !patch.name.trim() || busy) return;
    setBusy(true); setError(null);
    const updated = await editCompany(companyId, patch);
    setBusy(false);
    if (!updated) { setError("Could not save those changes. Please try again."); return; }
    setPanel("none");
  }

  async function handleDelete() {
    if (!companyId || busy) return;
    setBusy(true); setError(null);
    const ok = await removeCompany(companyId);
    setBusy(false);
    if (!ok) { setError("Could not delete that company. Please try again."); return; }
    setPanel("none");
  }

  return (
    <div style={{ border: `1px solid ${INK}`, marginBottom: 22, background: PAPER2 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 14px", borderBottom: panel === "none" ? "none" : `1px solid ${INK15}`,
      }}>
        <span style={LABEL}>Working for</span>

        {empty ? (
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
            No company saved yet. Add one and every EMOS tool will use it.
          </span>
        ) : (
          <select
            value={companyId}
            onChange={e => { setPanel("none"); setError(null); setActive(e.target.value); }}
            style={{
              background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT,
              fontWeight: 700, fontSize: 10, letterSpacing: ".06em", padding: "6px 11px",
              outline: "none", cursor: "pointer", maxWidth: 280,
            }}
          >
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        <button onClick={() => toggle("add")} style={LINK}>
          {panel === "add" ? "Cancel" : "+ Add company"}
        </button>

        {saved && (
          <button onClick={() => toggle("edit")} style={LINK}>
            {panel === "edit" ? "Cancel" : "Edit"}
          </button>
        )}

        {saved && (
          <button
            onClick={() => toggle("confirmDelete")}
            style={{ ...LINK, color: RED, borderBottomColor: RED }}
          >
            {panel === "confirmDelete" ? "Cancel" : "Delete"}
          </button>
        )}

        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {saving && (
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
              Saving…
            </span>
          )}
          {!saving && saved && (
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: GREEN }}>
              ✓ Saved to your account
            </span>
          )}
          {!empty && (
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
              Switching here switches every tool.
            </span>
          )}
          {note && (
            <span style={{ fontFamily: GROT, fontSize: 8.5, letterSpacing: ".1em", textTransform: "uppercase", color: INK55 }}>
              {note}
            </span>
          )}
        </span>
      </div>

      {error && (
        <div style={{
          padding: "9px 14px", background: PAPER, borderBottom: `1px solid ${INK15}`,
          fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: RED,
        }}>
          {error}
        </div>
      )}

      {panel === "add" && (
        <div style={{ padding: "13px 14px", display: "grid", gap: 9 }}>
          <div>
            <label style={FIELD_LABEL}>Company name</label>
            <input type="text" value={addName} onChange={e => setAddName(e.target.value)}
              placeholder="Acme Corp" style={FIELD} />
          </div>
          <div>
            <label style={FIELD_LABEL}>What they do</label>
            <textarea
              value={addContext}
              onChange={e => setAddContext(e.target.value.slice(0, COMPANY_CONTEXT_MAX))}
              rows={2}
              placeholder="What they do, who they serve, what makes them quotable. This is what every tool reads."
              style={{ ...FIELD, fontStyle: "italic", lineHeight: 1.55, resize: "none" }}
            />
          </div>
          <div>
            <label style={FIELD_LABEL}>Website <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <input type="text" value={addWebsite} onChange={e => setAddWebsite(e.target.value)}
              placeholder="acme.com" style={FIELD} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={handleAdd} disabled={!addName.trim() || busy} style={primaryBtn(!!addName.trim() && !busy)}>
              {busy ? "Saving…" : "Save company"}
            </button>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
              {addContext.length}/{COMPANY_CONTEXT_MAX}
            </span>
          </div>
        </div>
      )}

      {panel === "edit" && company && (
        <EditCompanyForm
          key={companyId}
          name={company.name}
          context={company.context}
          website={company.website ?? ""}
          busy={busy}
          onSave={handleSaveEdit}
        />
      )}

      {panel === "confirmDelete" && (
        <div style={{ padding: "13px 14px", display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: INK }}>
            Delete <strong>{company?.name}</strong>? Signals, assets and pitches already saved are
            kept, and stay findable under this name in the library filter. Only the profile the tools
            read goes away.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleDelete}
              disabled={busy}
              style={{
                background: busy ? "transparent" : RED, color: busy ? INK55 : PAPER,
                border: `1px solid ${busy ? INK15 : RED}`, padding: "7px 15px",
                fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em",
                textTransform: "uppercase", cursor: busy ? "default" : "pointer",
              }}
            >
              {busy ? "Deleting…" : "Yes, delete it"}
            </button>
            <button onClick={() => setPanel("none")} style={LINK}>Keep it</button>
          </div>
        </div>
      )}
    </div>
  );
}
