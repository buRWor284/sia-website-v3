"use client";

/**
 * JournoCollabIQ Platform — journalist CRM
 *
 * Layout:
 *   ① Journalist table — name, outlet, beat, DR, pitches sent, placements, last contact
 *   ② Add/edit form (inline, shown on "+ Add" or row edit click)
 *   ③ Per-row actions: edit, delete, "Score a pitch →" (to PressIQ)
 */

import React, { useState, useTransition } from "react";
import {
  createJournalist,
  updateJournalist,
  deleteJournalist,
  type DbJournalist,
  type CreateJournalistInput,
} from "@/app/emostool/actions/coverageiq";

// ── design tokens ──────────────────────────────────────────────────────────────
const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK70  = "rgba(26,20,16,.70)";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const RED    = "#c14a32";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

// ── helpers ────────────────────────────────────────────────────────────────────
function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

// ── blank form state ───────────────────────────────────────────────────────────
const BLANK: CreateJournalistInput = {
  name: "", outlet: "", beat: "", email: "", twitter_handle: "",
  domain_rating: undefined, notes: "",
};

// ── Add/Edit form ──────────────────────────────────────────────────────────────

function JournoForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: CreateJournalistInput;
  onSave: (v: CreateJournalistInput) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [v, setV] = useState<CreateJournalistInput>(initial);
  const set = (k: keyof CreateJournalistInput, val: unknown) =>
    setV(prev => ({ ...prev, [k]: val }));

  function field(label: string, key: keyof CreateJournalistInput, placeholder = "", type = "text") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>
          {label}
        </label>
        <input
          type={type}
          value={String(v[key] ?? "")}
          onChange={e => set(key, type === "number" ? (e.target.value ? Number(e.target.value) : null) : e.target.value)}
          placeholder={placeholder}
          style={{
            background: PAPER, border: `1px solid ${INK15}`,
            color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 16 }}>
        {initial.name ? `Edit — ${initial.name}` : "Add journalist"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
        {field("Name *", "name", "Jane Smith")}
        {field("Outlet", "outlet", "TechCrunch")}
        {field("Beat", "beat", "SaaS, Fintech, AI")}
        {field("Email", "email", "jane@techcrunch.com")}
        {field("Twitter / X", "twitter_handle", "@janesmith")}
        {field("Domain Rating", "domain_rating", "82", "number")}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, display: "block", marginBottom: 4 }}>
          Notes
        </label>
        <textarea
          value={v.notes ?? ""}
          onChange={e => set("notes", e.target.value)}
          rows={3}
          placeholder="Coverage history, preferences, warm intro notes…"
          style={{
            width: "100%", boxSizing: "border-box",
            background: PAPER, border: `1px solid ${INK15}`,
            color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.6,
            padding: "10px 12px", resize: "vertical", outline: "none",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => { if (!v.name.trim()) return; onSave(v); }}
          disabled={saving || !v.name.trim()}
          style={{
            padding: "10px 22px", border: "none",
            background: saving || !v.name.trim() ? PAPER2 : INK,
            color: saving || !v.name.trim() ? INK55 : PAPER,
            fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
            cursor: saving || !v.name.trim() ? "default" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save journalist"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 18px", border: `1px solid ${INK15}`, background: "transparent",
            color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".10em",
            textTransform: "uppercase", cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function JournoCollabIQClient({
  initialJournalists,
}: {
  initialJournalists: DbJournalist[];
}) {
  const [journalists, setJournalists] = useState<DbJournalist[]>(initialJournalists);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const editingJourno = editId ? journalists.find(j => j.id === editId) : null;
  const editInitial: CreateJournalistInput = editingJourno
    ? { name: editingJourno.name, outlet: editingJourno.outlet, beat: editingJourno.beat, email: editingJourno.email, twitter_handle: editingJourno.twitter_handle, domain_rating: editingJourno.domain_rating, notes: editingJourno.notes }
    : BLANK;

  function handleAdd(v: CreateJournalistInput) {
    startSave(async () => {
      const result = await createJournalist(v);
      if (result?.id) {
        // Optimistic: add placeholder (server will have full row on next refresh)
        const optimistic: DbJournalist = {
          id: result.id,
          name: v.name,
          outlet: v.outlet ?? null,
          beat: v.beat ?? null,
          email: v.email ?? null,
          twitter_handle: v.twitter_handle ?? null,
          domain_rating: v.domain_rating ?? null,
          last_contact: null,
          pitches_sent: 0,
          placements: 0,
          notes: v.notes ?? null,
          tags: [],
        };
        setJournalists(prev => [optimistic, ...prev]);
        setShowForm(false);
      }
    });
  }

  function handleUpdate(id: string, v: CreateJournalistInput) {
    startSave(async () => {
      const ok = await updateJournalist(id, v);
      if (ok) {
        setJournalists(prev => prev.map(j =>
          j.id === id
            ? { ...j, name: v.name, outlet: v.outlet ?? null, beat: v.beat ?? null, email: v.email ?? null, twitter_handle: v.twitter_handle ?? null, domain_rating: v.domain_rating ?? null, notes: v.notes ?? null }
            : j
        ));
        setEditId(null);
      }
    });
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      const ok = await deleteJournalist(id);
      if (ok) {
        setJournalists(prev => prev.filter(j => j.id !== id));
        setDeleteConfirm(null);
      }
    });
  }

  return (
    <div style={{ fontFamily: SERIF }}>

      {/* Add button */}
      {!showForm && !editId && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "10px 22px", border: "none",
              background: INK, color: PAPER,
              fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            + Add journalist
          </button>
        </div>
      )}

      {/* Add form */}
      {showForm && !editId && (
        <JournoForm
          initial={BLANK}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {/* Edit form */}
      {editId && (
        <JournoForm
          initial={editInitial}
          onSave={(v) => handleUpdate(editId, v)}
          onCancel={() => setEditId(null)}
          saving={saving}
        />
      )}

      {/* Table */}
      {journalists.length === 0 ? (
        <div style={{ padding: "40px 24px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
          <p style={{ margin: "0 0 16px", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55 }}>
            No journalists yet. Add your first contact above.
          </p>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13, color: INK55, lineHeight: 1.55 }}>
            Tip: start with journalists who cover your beat and have covered similar stories before.
          </p>
        </div>
      ) : (
        <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 60px 52px 52px 100px", background: INK, color: PAPER }}>
            {["Journalist", "Outlet / Beat", "Email / Twitter", "DR", "Sent", "Won", "Last contact"].map((h, i) => (
              <div key={h} style={{ padding: "10px 12px", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", borderRight: i < 6 ? "1px solid rgba(241,235,222,.12)" : "none" }}>
                {h}
              </div>
            ))}
          </div>

          {journalists.map((j, idx) => {
            const expanded = expandedId === j.id;
            const confirmingDelete = deleteConfirm === j.id;

            return (
              <React.Fragment key={j.id}>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 60px 52px 52px 100px", borderBottom: `1px solid ${INK15}`, cursor: "pointer" }}
                  onClick={() => setExpandedId(expanded ? null : j.id)}
                >
                  {/* Name */}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14, color: INK }}>{j.name}</div>
                    {j.notes && (
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 2, lineHeight: 1.35, display: expanded ? "block" : "none" }}>
                        {j.notes}
                      </div>
                    )}
                  </div>
                  {/* Outlet / Beat */}
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}` }}>
                    {j.outlet && <div style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, color: INK, letterSpacing: ".04em" }}>{j.outlet}</div>}
                    {j.beat && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 2 }}>{j.beat}</div>}
                  </div>
                  {/* Email / Twitter */}
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}` }}>
                    {j.email && (
                      <a href={`mailto:${j.email}`} onClick={e => e.stopPropagation()}
                        style={{ fontFamily: MONO, fontSize: 9, color: INK55, textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {j.email}
                      </a>
                    )}
                    {j.twitter_handle && (
                      <span style={{ fontFamily: MONO, fontSize: 9, color: INK35 }}>{j.twitter_handle}</span>
                    )}
                  </div>
                  {/* DR */}
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: j.domain_rating ? INK : INK35 }}>
                      {j.domain_rating ?? "—"}
                    </span>
                  </div>
                  {/* Pitches sent */}
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{j.pitches_sent}</span>
                  </div>
                  {/* Placements */}
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: j.placements > 0 ? GREEN : INK35 }}>{j.placements}</span>
                  </div>
                  {/* Last contact */}
                  <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: GROT, fontSize: 9.5, letterSpacing: ".04em", color: INK55 }}>{fmt(j.last_contact)}</span>
                  </div>
                </div>

                {/* Expanded row — actions */}
                {expanded && (
                  <div style={{ background: PAPER2, borderBottom: `1px solid ${INK15}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {/* Score a pitch */}
                    <a
                      href={`/emostool/dashboard/pressiq?beat=${encodeURIComponent(j.beat ?? j.name)}`}
                      style={{
                        padding: "8px 16px", background: YEL, color: INK,
                        fontFamily: GROT, fontWeight: 800, fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      Score a pitch →
                    </a>

                    {/* Edit */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditId(j.id); setShowForm(false); setExpandedId(null); }}
                      style={{ padding: "8px 14px", border: `1px solid ${INK15}`, background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".10em", textTransform: "uppercase", cursor: "pointer" }}
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    {confirmingDelete ? (
                      <>
                        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: RED }}>Remove {j.name}?</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(j.id); }}
                          disabled={deleting}
                          style={{ padding: "7px 12px", border: `1px solid ${RED}`, background: "transparent", color: RED, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: deleting ? "wait" : "pointer" }}
                        >
                          {deleting ? "Removing…" : "Confirm"}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                          style={{ padding: "7px 12px", border: `1px solid ${INK15}`, background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(j.id); }}
                        style={{ padding: "8px 14px", border: `1px solid ${INK15}`, background: "transparent", color: INK35, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".10em", textTransform: "uppercase", cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {journalists.length > 0 && (
        <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
          {journalists.length} journalist{journalists.length !== 1 ? "s" : ""} in your CRM · Pitches sent and placements update automatically via CoverageIQ
        </div>
      )}
    </div>
  );
}
