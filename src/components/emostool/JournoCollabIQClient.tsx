"use client";

/**
 * JournoCollabIQ Platform — AI journalist discovery wizard + CRM
 *
 * Layout:
 *   ① Story setup form (pre-fillable from SignalIQ/AssetIQ context)
 *   ② AI journalist suggestions — 8 journalists ranked by fit
 *   ③ Per journalist: why they'd cover it, angle generator, "Save to CRM →"
 *   ④ Saved journalist CRM list below
 */

import React, { useState, useTransition, useEffect } from "react";
import { useCompanyContext } from "@/hooks/useCompanyContext";
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
const AMBER  = "#d99211";
const RED    = "#c14a32";
const BLUE   = "#2d5393";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

const TIER_COLOR: Record<string, string> = { A: GREEN, B: BLUE, C: AMBER };

const STRATEGIES = [
  { id: "discount",    label: "Expert commentary",  desc: "A quotable expert take for a story they're already writing — the classic reactive source pitch." },
  { id: "institution", label: "Exclusive data",     desc: "Original data or research offered as an exclusive or embargo — the path to Tier-1 features." },
  { id: "badge",       label: "Trend reaction",     desc: "A timely reaction tied to a breaking trend or news hook. Newsjacking, done right." },
];

// 8-criteria fit self-check — identical to the public tool's V2_SCORECARD so
// both surfaces score journalists the same way. Each answer is 0/1/2, so a
// perfect score is length*2. The per-card score feeds that card's AI angle.
const V2_SCORECARD = [
  { q: "Do they cover this beat?",                    sub: "Is this squarely in the topics they write about?" },
  { q: "Have they written about it recently?",        sub: "A relevant article in the last few months." },
  { q: "Does the outlet have real authority?",        sub: "Reach and domain strength (check the outlet)." },
  { q: "Is your angle genuinely newsworthy to them?", sub: "A story their readers need — not an ad." },
  { q: "Can you offer something specific?",            sub: "Expert take, exclusive data, or a timely hook." },
  { q: "Are they open to pitches?",                   sub: "Some reporters say how to pitch them." },
  { q: "Can you find a public contact?",              sub: "X handle or section desk, not a guessed email." },
  { q: "Is the outlet brand-safe for you?",           sub: "You'll be associated with it." },
];

interface AIJournalist {
  name: string;
  url: string;
  why: string;
  linkPage: string;
  contact: string;
  contactLinkedIn: string;
  seoNote: string;
  tier: "A" | "B" | "C";
}

// ── Story form ─────────────────────────────────────────────────────────────────

function StoryForm({
  initial,
  onSearch,
  searching,
}: {
  initial: {
    biz: string; domain: string; desc: string; industry: string;
    audDesc: string; geo: string; strategy: string;
  };
  onSearch: (form: typeof initial) => void;
  searching: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "20px 24px", marginBottom: 28 }}>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 16 }}>
        Tell us about your story
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Brand / company name</label>
          <input value={form.biz} onChange={e => set("biz", e.target.value)} placeholder="Acme Corp" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Website</label>
          <input value={form.domain} onChange={e => set("domain", e.target.value)} placeholder="acme.com" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Geography</label>
          <input value={form.geo} onChange={e => set("geo", e.target.value)} placeholder="UK, US, Global…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>What you do <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none" }}>(1-2 sentences)</span></label>
        <textarea value={form.desc} onChange={e => set("desc", e.target.value)} rows={2} placeholder="We help SMBs access working capital through AI-driven lending decisions…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.55, padding: "9px 12px", resize: "none", outline: "none" }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Beat / topic journalists should cover</label>
        <input value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="Fintech, SMB lending, alternative finance…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>The story / angle you're pitching</label>
        <textarea value={form.audDesc} onChange={e => set("audDesc", e.target.value)} rows={3} placeholder="We have proprietary data on 10,000+ lending decisions showing SMBs are being rejected at 3x the rate they were in 2022, despite lower default rates…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, padding: "9px 12px", resize: "vertical", outline: "none" }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>What you're offering journalists</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STRATEGIES.map(s => (
            <button key={s.id} onClick={() => set("strategy", s.id)}
              style={{ flex: 1, minWidth: 160, padding: "10px 14px", textAlign: "left", background: form.strategy === s.id ? INK : PAPER, border: `1px solid ${form.strategy === s.id ? INK : INK15}`, cursor: "pointer" }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: form.strategy === s.id ? PAPER : INK, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: form.strategy === s.id ? "rgba(241,235,222,.6)" : INK55, lineHeight: 1.35 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => onSearch(form)}
          disabled={searching || !form.audDesc.trim() || !form.industry.trim()}
          style={{ padding: "12px 28px", border: "none", background: searching || !form.audDesc.trim() ? "rgba(26,20,16,.12)" : INK, color: searching || !form.audDesc.trim() ? INK55 : PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", cursor: searching || !form.audDesc.trim() ? "wait" : "pointer" }}
        >
          {searching ? "Finding journalists…" : "Find journalists →"}
        </button>
        <button
          onClick={() => setForm(p => ({ ...p, biz: "", domain: "", desc: "", industry: "", audDesc: "", geo: "" }))}
          disabled={searching}
          style={{ padding: "12px 20px", border: `1px solid ${INK15}`, background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", cursor: searching ? "not-allowed" : "pointer" }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// ── Journalist card ────────────────────────────────────────────────────────────

function JournalistCard({
  j,
  formData,
  savedNames,
  onSaved,
  prefillAssetTitle,
  prefillAssetType,
  prefillAssetIdea,
}: {
  j: AIJournalist;
  formData: Record<string, string>;
  savedNames: Set<string>;
  onSaved: (name: string, journalist: DbJournalist) => void;
  prefillAssetTitle?: string;
  prefillAssetType?: string;
  prefillAssetIdea?: string;
}) {
  const [saving, startSave] = useTransition();
  const [angle, setAngle] = useState<string | null>(null);
  const [loadingAngle, setLoadingAngle] = useState(false);
  const [angleError, setAngleError] = useState<string | null>(null);
  const alreadySaved = savedNames.has(j.name);
  const tc = TIER_COLOR[j.tier] ?? INK55;

  // Per-card fit self-check. Compact + collapsed by default; expanding it lets
  // the user score this journalist against the 8 criteria, and that score is
  // fed into this card's AI angle call (replacing the old hardcoded 0).
  const [showScorecard, setShowScorecard] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});
  const scoreTotal = Object.values(scores).reduce((a, b) => a + b, 0);
  const answered   = Object.keys(scores).length;
  const scorePct   = Math.round((scoreTotal / (V2_SCORECARD.length * 2)) * 100);
  const verdict    = answered === 0 ? null
    : scorePct >= 70 ? { t: "Strong fit — prioritise this journalist", c: GREEN }
    : scorePct >= 45 ? { t: "Moderate fit — worth a shot", c: AMBER }
    : { t: "Weak fit — consider a stronger target", c: RED };

  async function getAngle() {
    setAngleError(null);
    setLoadingAngle(true);
    try {
      const res = await fetch("/api/emostool/journo-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email-writer",
          data: { ...formData, partner: j.name, partnerCat: `${j.url} · ${j.seoNote}`, scorePct: answered > 0 ? scorePct : 0 },
        }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (!res.ok || data.error) { setAngleError(data.error ?? "Failed to generate angle."); return; }
      setAngle(data.result ?? null);
    } catch {
      setAngleError("Network error — please try again.");
    } finally {
      setLoadingAngle(false);
    }
  }

  function handleSave() {
    startSave(async () => {
      // Parse the outlet authority score out of seoNote ("DA 94 · national
      // business desk · …") so AI saves stop landing with domain_rating null —
      // which left the CRM's DR column showing "—" and silently excluded every
      // AI-saved journalist from the dashboard's avg-DR stat.
      const drMatch = /\b(?:DA|DR)\s*:?\s*(\d{1,3})\b/i.exec(j.seoNote ?? "");
      const parsedDr = drMatch ? Math.min(100, parseInt(drMatch[1], 10)) : null;
      const input: CreateJournalistInput = {
        name: j.name,
        outlet: j.url,
        beat: formData.industry || null,
        email: null,
        twitter_handle: j.contact?.startsWith("@") ? j.contact : null,
        domain_rating: parsedDr,
        notes: j.why,
        data_source: "JournoCollabIQ",
      };
      const created = await createJournalist(input);
      // Only mark saved + insert into the CRM list when the write actually
      // succeeded (createJournalist returns null on failure). Prepending the new
      // row makes it appear in the CRM table instantly — no page refresh needed.
      if (created?.id) {
        onSaved(j.name, {
          id:             created.id,
          name:           input.name,
          outlet:         input.outlet ?? null,
          beat:           input.beat ?? null,
          email:          input.email ?? null,
          twitter_handle: input.twitter_handle ?? null,
          domain_rating:  input.domain_rating ?? null,
          last_contact:   null,
          pitches_sent:   0,
          placements:     0,
          notes:          input.notes ?? null,
          tags:           input.tags ?? [],
        });
      }
    });
  }

  return (
    <div style={{ border: `1px solid ${INK15}`, background: PAPER, marginBottom: 12 }}>
      {/* Header */}
      <div style={{ background: INK, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".08em", color: PAPER }}>{j.name}</span>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".08em", color: "rgba(241,235,222,.55)" }}>{j.url}</span>
        <span style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: tc, border: `1px solid ${tc}`, padding: "2px 7px" }}>
          TIER {j.tier}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.55 }}>{j.why}</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {j.seoNote && (
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: INK55 }}>{j.seoNote}</span>
          )}
          {j.contact && (
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: INK55 }}>
              Contact: {j.contact} · <a href={j.contactLinkedIn ? `https://${j.contactLinkedIn.replace(/^https?:\/\//, "")}` : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(j.name)}`} target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none" }}>{j.contactLinkedIn ? "LinkedIn ↗" : "Find on LinkedIn ↗"}</a>
            </span>
          )}
          {j.linkPage && j.linkPage !== "" && (
            <a href={j.linkPage} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, textDecoration: "none", borderBottom: `1px solid ${INK35}` }}>
              Recent coverage ↗
            </a>
          )}
        </div>
        {j.contact && (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: AMBER }}>
            ⚠ Contact is AI-suggested — verify before you pitch.
          </div>
        )}

        {/* Fit self-check — compact, expandable; the score sharpens this card's angle */}
        <div style={{ border: `1px solid ${INK15}`, background: PAPER2 }}>
          <button onClick={() => setShowScorecard(s => !s)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55 }}>Fit check</span>
              {answered > 0
                ? <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, color: verdict?.c ?? INK }}>{scorePct}% · {answered}/8</span>
                : <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK35 }}>optional — score to sharpen the angle</span>}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: INK55 }}>{showScorecard ? "▲" : "▼"}</span>
          </button>
          {showScorecard && (
            <div style={{ padding: "2px 12px 12px" }}>
              {V2_SCORECARD.map((q, i) => {
                const val = scores[i];
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${INK15}`, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 170 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 12.5, fontWeight: 600, color: INK }}>{q.q}</div>
                      <div style={{ fontFamily: GROT, fontSize: 10, color: INK55, marginTop: 1 }}>{q.sub}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {([["No", 0], ["Partly", 1], ["Yes", 2]] as [string, number][]).map(([lab, v]) => {
                        const on = val === v;
                        return (
                          <button key={lab} onClick={() => setScores(p => ({ ...p, [i]: v }))}
                            style={{ padding: "5px 10px", fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", border: `1px solid ${on ? INK : INK15}`, background: on ? INK : "transparent", color: on ? PAPER : INK55, cursor: "pointer" }}>
                            {lab}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {verdict && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, padding: "10px 14px", background: PAPER, border: `1px solid ${INK15}` }}>
                  <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: verdict.c }}>{scorePct}%</span>
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: INK }}>{verdict.t}</div>
                    <div style={{ fontFamily: GROT, fontSize: 10, color: INK55 }}>{answered}/8 answered · feeds the AI angle</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Angle */}
        {angle && (
          <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "12px 14px" }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>Tailored pitch angle</div>
            <pre style={{ margin: 0, fontFamily: SERIF, fontSize: 13, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{angle}</pre>
            <a
              href={`/emostool/dashboard/pressiq?beat=${encodeURIComponent(formData.industry ?? "")}&journalist=${encodeURIComponent(j.name)}${prefillAssetTitle ? `&assetTitle=${encodeURIComponent(prefillAssetTitle)}` : ""}${prefillAssetType ? `&assetType=${encodeURIComponent(prefillAssetType)}` : ""}${prefillAssetIdea ? `&assetIdea=${encodeURIComponent(prefillAssetIdea.slice(0, 300))}` : ""}`}
              style={{ display: "inline-block", marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK, textDecoration: "none", borderBottom: `1px solid ${INK35}` }}>
              Score this pitch in PressIQ →
            </a>
          </div>
        )}
        {angleError && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: RED }}>{angleError}</div>}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!angle && (
            <button onClick={getAngle} disabled={loadingAngle}
              style={{ padding: "8px 16px", border: `1px solid ${INK15}`, background: PAPER2, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: loadingAngle ? "wait" : "pointer" }}>
              {loadingAngle ? "Generating…" : "Get pitch angle →"}
            </button>
          )}
          <button onClick={handleSave} disabled={saving || alreadySaved}
            style={{ padding: "8px 16px", border: "none", background: alreadySaved ? PAPER2 : YEL, color: alreadySaved ? INK55 : INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: alreadySaved ? "default" : saving ? "wait" : "pointer" }}>
            {saving ? "Saving…" : alreadySaved ? "✓ Saved to CRM" : "Save to CRM →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CRM list ───────────────────────────────────────────────────────────────────

function CRMList({ journalists, onDelete }: { journalists: DbJournalist[]; onDelete: (id: string) => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  function fmt(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  if (journalists.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
          No journalists saved yet. Run a search and save the ones you want to pitch.
        </p>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 60px 52px 52px 90px", background: INK, color: PAPER }}>
        {["Journalist", "Outlet / Beat", "DR", "Sent", "Won", "Last contact"].map((h, i) => (
          <div key={h} style={{ padding: "10px 12px", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", borderRight: i < 5 ? "1px solid rgba(241,235,222,.12)" : "none" }}>{h}</div>
        ))}
      </div>

      {journalists.map((j, idx) => (
        <div key={j.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 60px 52px 52px 90px", borderBottom: idx < journalists.length - 1 ? `1px solid ${INK15}` : "none" }}>
          <div style={{ padding: "11px 13px" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13.5, color: INK }}>{j.name}</div>
            {j.notes && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 2, lineHeight: 1.35 }}>{j.notes.slice(0, 80)}{j.notes.length > 80 ? "…" : ""}</div>}
          </div>
          <div style={{ padding: "11px 10px", borderLeft: `1px solid ${INK15}` }}>
            {j.outlet && <div style={{ fontFamily: GROT, fontSize: 10, fontWeight: 700, color: INK }}>{j.outlet}</div>}
            {j.beat && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 10.5, color: INK55, marginTop: 1 }}>{j.beat}</div>}
          </div>
          <div style={{ padding: "11px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: j.domain_rating ? INK : INK35 }}>{j.domain_rating ?? "—"}</span>
          </div>
          <div style={{ padding: "11px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13 }}>{j.pitches_sent}</span>
          </div>
          <div style={{ padding: "11px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: j.placements > 0 ? GREEN : INK35 }}>{j.placements}</span>
          </div>
          <div style={{ padding: "11px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: GROT, fontSize: 9, color: INK55 }}>{fmt(j.last_contact)}</span>
            {deletingId === j.id ? (
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => { startDelete(async () => { await deleteJournalist(j.id); onDelete(j.id); setDeletingId(null); }); }} disabled={deleting}
                  style={{ padding: "3px 7px", border: `1px solid ${RED}`, background: "transparent", color: RED, fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".10em", cursor: deleting ? "wait" : "pointer" }}>
                  {deleting ? "…" : "Yes"}
                </button>
                <button onClick={() => setDeletingId(null)} style={{ padding: "3px 6px", border: `1px solid ${INK15}`, background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 7.5, cursor: "pointer" }}>No</button>
              </div>
            ) : (
              <button onClick={() => setDeletingId(j.id)} style={{ padding: "3px 7px", border: `1px solid ${INK15}`, background: "transparent", color: INK35, fontFamily: GROT, fontWeight: 700, fontSize: 7.5, cursor: "pointer" }}>✕</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Loading panel (ported from the public tool — the search runs 30-60s on Opus
// and the dashboard used to just sit on a disabled button) ──────────────────────
const LOADING_LINES = [
  { h: "Scanning coverage on your beat…",    s: "Finding who's writing about this topic now." },
  { h: "Matching reporters to your story…",  s: "Ranking by beat fit and recent coverage." },
  { h: "Checking outlet authority & reach…", s: "Only surfacing journalists worth your time." },
  { h: "Profiling how to reach them…",       s: "Handles and section desks — verify before pitching." },
  { h: "Almost there.",                      s: "Compiling a media list that would take an agency a week." },
];

function LoadingPanel() {
  const [idx, setIdx] = useState(0);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setIdx(i => (i + 1) % LOADING_LINES.length), 2200);
    const b = setInterval(() => setSecs(s => s + 1), 1000);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  const line = LOADING_LINES[idx];
  return (
    <div style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "28px 24px", textAlign: "center", marginBottom: 28 }}>
      <span style={{ display: "inline-block", width: 16, height: 16, border: `2px solid ${INK15}`, borderTopColor: YEL, borderRadius: "50%", animation: "jciqspin .7s linear infinite", marginBottom: 12 }} />
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: INK }}>{line.h}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, marginTop: 3 }}>{line.s}</div>
      <div style={{ fontFamily: MONO, fontSize: 9.5, color: INK35, marginTop: 10, letterSpacing: ".08em" }}>ELAPSED {secs}s · TYPICALLY 30–60s</div>
      <style>{"@keyframes jciqspin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function JournoCollabIQClient({
  initialJournalists,
  prefillBeat,
  prefillStory,
  prefillAssetTitle,
  prefillAssetType,
  prefillAssetIdea,
}: {
  initialJournalists: DbJournalist[];
  prefillBeat: string;
  prefillStory: string;
  prefillAssetTitle?: string;
  prefillAssetType?: string;
  prefillAssetIdea?: string;
}) {
  const [companyContext] = useCompanyContext();
  const [journalists, setJournalists] = useState<DbJournalist[]>(initialJournalists);
  const [results, setResults] = useState<AIJournalist[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedNames, setSavedNames] = useState<Set<string>>(new Set());
  const [brief, setBrief] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [lastForm, setLastForm] = useState<Record<string, string> | null>(null);
  const [formBiz, setFormBiz] = useState("");
  const [formDesc, setFormDesc] = useState("");

  // Pre-fill brand/desc from persisted company context after hydration
  useEffect(() => {
    if (companyContext) {
      // Extract first sentence as desc, rest as biz (heuristic)
      const firstSentence = companyContext.split(/[.!?]/)[0]?.trim() ?? "";
      if (!formBiz && !formDesc) {
        setFormDesc(companyContext);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyContext]);

  // Build enriched story text from asset context
  const enrichedStory = prefillAssetTitle
    ? [
        prefillAssetTitle && `We are building a ${prefillAssetType?.replace(/_/g, " ") ?? "linkable asset"} titled "${prefillAssetTitle}".`,
        prefillAssetIdea && `The asset: ${prefillAssetIdea}`,
        prefillStory && `Pitch angle: ${prefillStory}`,
      ].filter(Boolean).join(" ")
    : prefillStory;

  const defaultForm = {
    biz: formBiz,
    domain: "",
    desc: formDesc || companyContext,
    industry: prefillBeat,
    audDesc: enrichedStory,
    geo: "",
    strategy: "institution",
  };

  async function handleSearch(form: typeof defaultForm) {
    setSearchError(null);
    setResults(null);
    setBrief(null);
    setSearching(true);
    setLastForm(form);
    try {
      const res = await fetch("/api/emostool/journo-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partner-suggestions",
          data: {
            ...form,
            signalContext: prefillStory,
            assetContext: prefillAssetTitle
              ? `Asset being built: ${prefillAssetType?.replace(/_/g, " ") ?? "linkable asset"} — "${prefillAssetTitle}". ${prefillAssetIdea ?? ""}`
              : undefined,
            companyContext: companyContext || undefined,
          },
        }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (!res.ok || data.error) { setSearchError(data.error ?? "Search failed."); return; }

      const raw = data.result?.trim() ?? "";
      // Strip markdown fences if present
      const json = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim() : raw;
      const parsed = JSON.parse(json) as AIJournalist[];
      setResults(parsed);
    } catch (e) {
      console.error("journo search error:", e);
      setSearchError("Could not parse journalist results. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function generateBrief() {
    if (!lastForm) return;
    setLoadingBrief(true);
    try {
      const res = await fetch("/api/emostool/journo-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "campaign-brief",
          data: {
            ...lastForm,
            selNiches: results?.map(j => `${j.name} (${j.url})`).slice(0, 5) ?? [],
          },
        }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (data.result) setBrief(data.result);
    } catch { /* non-fatal */ }
    finally { setLoadingBrief(false); }
  }

  return (
    <div style={{ fontFamily: SERIF }}>

      {/* Story form */}
      <StoryForm initial={defaultForm} onSearch={handleSearch} searching={searching} />

      {searchError && (
        <div style={{ marginBottom: 20, padding: "12px 16px", border: `1px solid ${RED}`, background: "rgba(193,74,50,.06)", fontFamily: SERIF, fontSize: 14, color: INK, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>{searchError}</span>
          {lastForm && (
            <button onClick={() => handleSearch(lastForm as typeof defaultForm)}
              style={{ padding: "7px 14px", border: `1px solid ${RED}`, background: "transparent", color: RED, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
              Retry →
            </button>
          )}
        </div>
      )}

      {searching && <LoadingPanel />}

      {/* Results */}
      {results && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>
                {results.length} journalists found
              </span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                Ranked by fit · verify before pitching
              </span>
            </div>
            <button onClick={generateBrief} disabled={loadingBrief}
              style={{ padding: "8px 16px", border: `1px solid ${INK15}`, background: PAPER2, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: loadingBrief ? "wait" : "pointer" }}>
              {loadingBrief ? "Generating…" : "Generate media brief →"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "rgba(245,184,31,.07)", border: `1px solid rgba(245,184,31,.3)`, padding: "10px 13px", marginBottom: 16 }}>
            <span style={{ background: YEL, fontFamily: GROT, fontSize: 8, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 7px", color: INK, flexShrink: 0 }}>AI</span>
            <span style={{ fontFamily: SERIF, fontSize: 12, color: INK70, lineHeight: 1.5 }}>Each journalist is scored against 8 fit criteria: beat match, recent coverage, outlet authority, audience fit, responsiveness, exclusivity fit, contact findability, and brand-safety fit.</span>
          </div>

          {brief && (
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "18px 22px", marginBottom: 24 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".16em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>Media targeting brief</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{brief}</div>
            </div>
          )}

          {results.map((j, i) => (
            <JournalistCard
              key={i}
              j={j}
              formData={lastForm ?? {}}
              savedNames={savedNames}
              onSaved={(name, nj) => {
                setSavedNames(prev => new Set([...prev, name]));
                setJournalists(prev => [nj, ...prev]);
              }}
              prefillAssetTitle={prefillAssetTitle}
              prefillAssetType={prefillAssetType}
              prefillAssetIdea={prefillAssetIdea}
            />
          ))}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
            {([["A", "Highest priority", GREEN], ["B", "Strong candidate", BLUE], ["C", "Good to include", AMBER]] as [string, string, string][]).map(([t, l, c]) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: c, border: `1px solid ${c}`, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "2px 7px" }}>Tier {t}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: INK55 }}>{l}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CRM */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>Journalist CRM</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK }}>{journalists.length}</span>
          <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>saved</span>
        </div>
        <CRMList
          journalists={journalists}
          onDelete={id => setJournalists(prev => prev.filter(j => j.id !== id))}
        />
      </div>

    </div>
  );
}
