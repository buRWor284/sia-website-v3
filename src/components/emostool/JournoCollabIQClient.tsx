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
    biz: string; desc: string; industry: string;
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Brand / company name</label>
          <input value={form.biz} onChange={e => set("biz", e.target.value)} placeholder="Acme Corp" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
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

      <button
        onClick={() => onSearch(form)}
        disabled={searching || !form.audDesc.trim() || !form.industry.trim()}
        style={{ padding: "12px 28px", border: "none", background: searching || !form.audDesc.trim() ? "rgba(26,20,16,.12)" : INK, color: searching || !form.audDesc.trim() ? INK55 : PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", cursor: searching || !form.audDesc.trim() ? "wait" : "pointer" }}
      >
        {searching ? "Finding journalists…" : "Find journalists →"}
      </button>
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

  async function getAngle() {
    setAngleError(null);
    setLoadingAngle(true);
    try {
      const res = await fetch("/api/emostool/journo-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email-writer",
          data: { ...formData, partner: j.name, partnerCat: `${j.url} · ${j.seoNote}`, scorePct: 0 },
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
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: INK55 }}>Contact: {j.contact}</span>
          )}
          {j.linkPage && j.linkPage !== "" && (
            <a href={j.linkPage} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK55, textDecoration: "none", borderBottom: `1px solid ${INK35}` }}>
              Recent coverage ↗
            </a>
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
        <div style={{ marginBottom: 20, padding: "12px 16px", border: `1px solid ${RED}`, background: "rgba(193,74,50,.06)", fontFamily: SERIF, fontSize: 14, color: INK }}>
          {searchError}
        </div>
      )}

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
