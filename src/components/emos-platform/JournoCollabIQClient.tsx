"use client";

/**
 * JournoCollabIQ Platform — AI journalist discovery wizard + journalist list
 *
 * Layout:
 *   ① Story setup form (pre-fillable from SignalIQ/AssetIQ context)
 *   ② AI journalist suggestions — 8 journalists ranked by fit
 *   ③ Per journalist: why they'd cover it, angle generator, "Save to list →"
 *   ④ Saved journalist CRM list below
 */

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCompanyContext } from "@/hooks/useCompanyContext";
import CompanyPicker from "@/components/emos-platform/CompanyPicker";
import { useCompanyOptional } from "@/components/emos-platform/CompanyProvider";
import {
  createJournalist,
  updateJournalist,
  deleteJournalist,
  refreshDomainRatings,
} from "@/app/emos-platform/actions/coverageiq";
import { DrAttribution } from "@/components/coverageiq/primitives";
import type { DbJournalist, CreateJournalistInput } from "@/lib/coverageiq/types";
import { beatToTags } from "@/lib/journo/beat-tags";
import Markdown from "@/components/emos-platform/Markdown";
import {
  applyVerification,
  formatBylineDate,
  normaliseDomain,
  verificationRank,
  type JournalistVerification,
} from "@/lib/journo/verification-shared";

/** Journalist names are matched across two sources that share no id: an AI
 *  suggestion and a stored CRM row. Case and stray whitespace differ often
 *  enough to cause false "not saved yet" reads, so compare on this. */
/** Compare two possibly-null numbers, always sorting null to the bottom
 *  regardless of direction. An unknown value is not a small value. */
function nullsLast(a: number | null, b: number | null, dir: number): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return dir * (a - b);
}

function normaliseName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}


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
  /** Their own beat, from the model (2026-09-10). Older responses lack it. */
  beat?: string;
  linkPage: string;
  contact: string;
  contactLinkedIn: string;
  seoNote: string;
  /** "A" | "B" | "C" when verified; "unverified" when no recent byline was
   *  found (P1-01, 2026-09-25). A tier letter is only ever shown with a byline. */
  tier: string;
  aiTier?: string;
  /** The outlet domain the AI gave, when the byline showed the real one. */
  statedOutlet?: string;
  verification?: JournalistVerification;
}

/** Ask the server to check one journalist. `force` = the free Re-verify. */
async function requestVerification(j: AIJournalist, force: boolean): Promise<JournalistVerification | { error: string }> {
  try {
    const res = await fetch("/api/emos-platform/journo-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: j.name, outlet: j.statedOutlet ?? j.url, beat: j.beat ?? null, force }),
    });
    const data = (await res.json().catch(() => ({}))) as { verification?: JournalistVerification; error?: string };
    if (!res.ok || !data.verification) return { error: data.error ?? "The check could not run just now." };
    return data.verification;
  } catch {
    return { error: "Network error. Please try again." };
  }
}

// ── Story form ─────────────────────────────────────────────────────────────────

/** First N sentences of a block of prose, trimmed. */
function firstSentences(text: string, n: number): string {
  const parts = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [];
  return parts.slice(0, n).join("").trim();
}

function StoryForm({
  initial,
  onSearch,
  searching,
  rememberKey,
}: {
  initial: {
    biz: string; domain: string; desc: string; industry: string;
    audDesc: string; geo: string; strategy: string;
  };
  onSearch: (form: typeof initial) => void;
  searching: boolean;
  /** localStorage key for this company's last search (website, geography,
   *  beat, story). Empty seeds are filled from it on mount; every search
   *  writes it. Per-browser convenience only, never the source of truth. */
  rememberKey: string;
}) {
  // Seeded once. Switching company in the picker remounts this form via the
  // `key` at the call site, which re-seeds brand / website / description from
  // the new company — cheaper and less surprising than syncing three fields
  // through an effect.
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  // 2026-09-25 (bug P2-06): keep what was typed BEFORE React hydrated.
  // These are controlled inputs. React leaves the DOM alone while it hydrates,
  // so a user who starts typing within the first second sees their text — and
  // then loses it on the first post-hydration keystroke, when React restores
  // the controlled value (the seeded state). On a slow connection that was
  // every field the tester filled. Once mounted, read what is actually in the
  // boxes and adopt anything that differs from the seed.
  const bizRef = useRef<HTMLInputElement>(null);
  const domainRef = useRef<HTMLInputElement>(null);
  const geoRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const industryRef = useRef<HTMLInputElement>(null);
  const audDescRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const typed: Partial<typeof form> = {};
    const fields = { biz: bizRef, domain: domainRef, geo: geoRef, desc: descRef, industry: industryRef, audDesc: audDescRef } as const;
    (Object.keys(fields) as (keyof typeof fields)[]).forEach(k => {
      const v = fields[k].current?.value;
      if (v !== undefined && v !== initial[k]) typed[k] = v;
    });
    // Last search for this company (P3 "form doesn't remember"): only fills
    // boxes that are still empty, so a prefill from AssetIQ or a pre-hydration
    // keystroke always wins.
    let remembered: Partial<typeof form> = {};
    try { remembered = JSON.parse(localStorage.getItem(rememberKey) ?? "{}"); } catch { /* noop */ }
    const fill: Partial<typeof form> = {};
    (["domain", "geo", "industry", "audDesc"] as const).forEach(k => {
      const r = remembered[k];
      if (typeof r === "string" && r.trim() && !initial[k].trim() && typed[k] === undefined) fill[k] = r;
    });
    if (Object.keys(typed).length || Object.keys(fill).length) setForm(p => ({ ...p, ...fill, ...typed }));
    /* eslint-enable react-hooks/set-state-in-effect */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    try {
      localStorage.setItem(rememberKey, JSON.stringify({
        domain: form.domain, geo: form.geo, industry: form.industry, audDesc: form.audDesc,
      }));
    } catch { /* noop */ }
    onSearch(form);
  }

  return (
    <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "20px 24px", marginBottom: 28 }}>
      <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK55, marginBottom: 16 }}>
        Tell us about your story
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Brand / company name</label>
          <input ref={bizRef} value={form.biz} onChange={e => set("biz", e.target.value)} placeholder="Acme Corp" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Website</label>
          <input ref={domainRef} value={form.domain} onChange={e => set("domain", e.target.value)} placeholder="acme.com" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Geography</label>
          <input ref={geoRef} value={form.geo} onChange={e => set("geo", e.target.value)} placeholder="UK, US, Global…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>What you do <span style={{ fontWeight: 400, fontStyle: "italic", textTransform: "none" }}>(1-2 sentences)</span></label>
        <textarea ref={descRef} value={form.desc} onChange={e => set("desc", e.target.value)} rows={2} placeholder="We help SMBs access working capital through AI-driven lending decisions…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.55, padding: "9px 12px", resize: "none", outline: "none" }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>Beat / topic journalists should cover</label>
        <input ref={industryRef} value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="Fintech, SMB lending, alternative finance…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 14, padding: "9px 12px", outline: "none" }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 5 }}>The story / angle you're pitching</label>
        <textarea ref={audDescRef} value={form.audDesc} onChange={e => set("audDesc", e.target.value)} rows={3} placeholder="We have proprietary data on 10,000+ lending decisions showing SMBs are being rejected at 3x the rate they were in 2022, despite lower default rates…" style={{ width: "100%", boxSizing: "border-box", background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, padding: "9px 12px", resize: "vertical", outline: "none" }} />
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
          onClick={submit}
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
  companyId,
  companyName,
  assetId,
  onVerification,
}: {
  j: AIJournalist;
  formData: Record<string, string>;
  savedNames: Set<string>;
  onSaved: (name: string, journalist: DbJournalist) => void;
  prefillAssetTitle?: string;
  prefillAssetType?: string;
  /** The company and asset this search was run for, saved alongside the
   * journalist so the CRM knows why they are in it (2026-09-09). */
  companyId?: string | null;
  companyName?: string | null;
  assetId?: string | null;
  /** A fresh check came back (Re-verify). The parent folds it into the list. */
  onVerification: (v: JournalistVerification) => void;
}) {
  const [saving, startSave] = useTransition();
  const v = j.verification;
  // No verification at all only happens for a response from before the
  // check existed: treat it as not checked, never as verified.
  const status = v?.status ?? "check_failed";
  const isVerified = status === "verified";
  const [reverifying, setReverifying] = useState(false);
  const [reverifyError, setReverifyError] = useState<string | null>(null);
  const outletDomain = normaliseDomain(j.url);
  const outletHref = outletDomain ? `https://${outletDomain}` : null;

  async function reverify() {
    setReverifyError(null);
    setReverifying(true);
    const r = await requestVerification(j, true);
    setReverifying(false);
    if ("error" in r) { setReverifyError(r.error); return; }
    // A technical failure must not wipe a good earlier result.
    if (r.status === "check_failed") { setReverifyError(r.note ?? "The check could not run just now. Try again in a minute."); return; }
    onVerification(r);
  }
  const [angle, setAngle] = useState<string | null>(null);
  const [loadingAngle, setLoadingAngle] = useState(false);
  const [angleError, setAngleError] = useState<string | null>(null);
  const alreadySaved = savedNames.has(normaliseName(j.name));
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
      const res = await fetch("/api/emos-platform/journo-ai", {
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
      // 2026-09-13: the real DR now comes from Ahrefs on the server
      // (createJournalist → getDomainRating). The prompt no longer asks the
      // model for a number, so this parse is only a fallback for older
      // seoNote strings that still carry a "DA 94".
      const drMatch = /\b(?:DA|DR)\s*:?\s*(\d{1,3})\b/i.exec(j.seoNote ?? "");
      const parsedDr = drMatch ? Math.min(100, parseInt(drMatch[1], 10)) : null;
      const input: CreateJournalistInput = {
        name: j.name,
        outlet: j.url,
        // The journalist's OWN beat when the model gave one; before 2026-09-10
        // this saved the user's search text, so every journalist from one
        // search carried the same "beat" and PressIQ scored relevance against it.
        beat: j.beat?.trim() || formData.industry || null,
        email: null,
        twitter_handle: j.contact?.startsWith("@") ? j.contact : null,
        domain_rating: parsedDr,
        // 2026-09-25 (P1-01): the list records what the byline check found.
        notes: isVerified
          ? [j.why, v?.bylineUrl ? `Byline: ${v.bylineUrl}${v.bylineDate ? ` (${v.bylineDate})` : ""}` : ""].filter(Boolean).join("\n\n")
          : status === "stale"
            ? `Last seen writing for ${j.url} on ${formatBylineDate(v?.bylineDate)}${v?.bylineUrl ? ` (${v.bylineUrl})` : ""}. May have moved; confirm before pitching.`
            : `Unverified: no recent byline found under this name at ${j.url}${v?.checkedAt ? ` (checked ${formatBylineDate(v.checkedAt)})` : ""}. Confirm on the outlet's site before pitching.`,
        data_source: "JournoCollabIQ",
        // 2026-09-09 (state layer phase 5): record WHY this journalist is being
        // saved. Without this a journalist found for the KSA retail radar is
        // indistinguishable from one found for a health-tech story.
        context: {
          company_id: companyId ?? null,
          asset_id:   assetId ?? null,
          angle:      formData.audDesc || null,
          beat_query: formData.industry || null,
          geography:  formData.geo || null,
          strategy:   formData.strategy || null,
          fit_note:   j.why ?? null,
        },
      };
      const created = await createJournalist(input);
      // Only mark saved + insert into the CRM list when the write actually
      // succeeded (createJournalist returns null on failure). Prepending the new
      // row makes it appear in the list instantly — no page refresh needed.
      if (created?.id) {
        onSaved(j.name, {
          id:             created.id,
          name:           input.name,
          outlet:         input.outlet ?? null,
          beat:           input.beat ?? null,
          email:          input.email ?? null,
          twitter_handle: input.twitter_handle ?? null,
          // 2026-09-25 (P3-09): the row used to show DR "—" and "saved before
          // the company was tracked" until a reload, because the optimistic
          // row carried neither. Both are known at save time.
          domain_rating:  created.domain_rating ?? input.domain_rating ?? null,
          last_contact:   null,
          pitches_sent:   0,
          placements:     0,
          notes:          input.notes ?? null,
          tags:           beatToTags(input.beat),
          company_id:     companyId ?? null,
          company_name:   companyName ?? null,
          asset_id:       assetId ?? null,
          angle:          formData.audDesc || null,
          strategy:       formData.strategy || null,
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
        <span style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {isVerified && (
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: PAPER, background: GREEN, padding: "3px 7px" }}>
              ✓ Verified{v?.bylineDate ? ` · byline ${formatBylineDate(v.bylineDate)}` : ""}
            </span>
          )}
          {status === "unverified" && (
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: INK, background: AMBER, padding: "3px 7px" }}>
              Name not confirmed
            </span>
          )}
          {status === "stale" && (
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: PAPER, border: "1px solid rgba(241,235,222,.45)", padding: "2px 7px" }}>
              Last seen {formatBylineDate(v?.bylineDate)}
            </span>
          )}
          {status === "pending" && (
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: "rgba(241,235,222,.7)", border: "1px solid rgba(241,235,222,.35)", padding: "2px 7px" }}>
              Checking byline…
            </span>
          )}
          {status === "check_failed" && (
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: AMBER, border: `1px solid ${AMBER}`, padding: "2px 7px" }}>
              Not checked
            </span>
          )}
          {/* A tier letter only ever appears next to a byline. */}
          {isVerified && (
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: tc, border: `1px solid ${tc}`, padding: "2px 7px" }}>
              TIER {j.tier}
            </span>
          )}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isVerified && j.why && (
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.55 }}>{j.why}</p>
        )}

        {/* Byline check (P1-01, 2026-09-25) */}
        {isVerified && v && (
          <div style={{ borderLeft: `2px solid ${GREEN}`, paddingLeft: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: INK70, lineHeight: 1.5 }}>
              Last byline seen {formatBylineDate(v.bylineDate) || "date unknown"}
              {v.bylineTitle ? <> · <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12 }}>&ldquo;{v.bylineTitle}&rdquo;</span></> : null}
              {v.roleAsOf ? <> · {v.roleAsOf}</> : null}
            </div>
            {j.statedOutlet && (
              <div style={{ fontFamily: MONO, fontSize: 9, color: INK55 }}>
                Outlet corrected: the list said {j.statedOutlet}; the byline is on {j.url}.
              </div>
            )}
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK55, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span>{v.cached ? "Verified earlier (cached)" : "Checked just now"}{v.checkedAt ? ` · ${formatBylineDate(v.checkedAt)}` : ""}</span>
              <button onClick={reverify} disabled={reverifying}
                style={{ background: "none", border: "none", padding: 0, fontFamily: MONO, fontSize: 9, fontWeight: 700, color: BLUE, cursor: reverifying ? "wait" : "pointer" }}>
                {reverifying ? "Re-verifying… a few seconds" : "↻ Re-verify (free)"}
              </button>
            </div>
            {v.cached && (
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55, lineHeight: 1.45 }}>
                A cached check is instant and free but can be up to 30 days old. If the byline date looks stale, Re-verify: it is free and catches a recent move.
              </div>
            )}
          </div>
        )}

        {status === "unverified" && (
          <div style={{ border: `1px solid ${AMBER}`, background: "rgba(217,146,17,.07)", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.55 }}>
              No recent byline found under this name at {j.url}. Best route: find the right reporter yourself on{" "}
              {outletHref
                ? <a href={outletHref} target="_blank" rel="noopener noreferrer" style={{ color: BLUE }}>{outletDomain} ↗</a>
                : "the outlet's site"}
              , since pitches to a named person get better responses. If you can&apos;t, pitching the desk is the fallback and typically gets fewer replies.
            </p>
            {v?.note && (
              <div style={{ fontFamily: MONO, fontSize: 9, color: INK55, lineHeight: 1.5 }}>What the check found: {v.note}</div>
            )}
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK55, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span>{v?.cached ? "Checked earlier (cached)" : "Checked just now"}{v?.checkedAt ? ` · ${formatBylineDate(v.checkedAt)}` : ""}</span>
              <button onClick={reverify} disabled={reverifying}
                style={{ background: "none", border: "none", padding: 0, fontFamily: MONO, fontSize: 9, fontWeight: 700, color: BLUE, cursor: reverifying ? "wait" : "pointer" }}>
                {reverifying ? "Re-verifying… a few seconds" : "↻ Re-verify (free)"}
              </button>
            </div>
          </div>
        )}

        {status === "stale" && v && (
          <div style={{ border: `1px solid ${INK15}`, background: PAPER2, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, color: INK, lineHeight: 1.55 }}>
              Last seen writing for {j.url} on {formatBylineDate(v.bylineDate)}. They may have moved beat or outlet since, so check before you pitch.
            </p>
            {v.bylineUrl && (
              <a href={v.bylineUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: MONO, fontSize: 9.5, color: BLUE, textDecoration: "none" }}>
                Last article{v.bylineTitle ? `: “${v.bylineTitle}”` : ""} ↗
              </a>
            )}
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK55, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span>Outlet last read {formatBylineDate(v.checkedAt)}</span>
              <button onClick={reverify} disabled={reverifying}
                style={{ background: "none", border: "none", padding: 0, fontFamily: MONO, fontSize: 9, fontWeight: 700, color: BLUE, cursor: reverifying ? "wait" : "pointer" }}>
                {reverifying ? "Re-verifying… a few seconds" : "↻ Re-verify (free)"}
              </button>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
            Checking for a byline at {j.url} in the last 12 months. This takes a few seconds.
          </div>
        )}

        {status === "check_failed" && (
          <div style={{ fontFamily: SERIF, fontSize: 13, color: INK70, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
            <span>The byline check could not run just now, so this name is not confirmed yet.</span>
            <button onClick={reverify} disabled={reverifying}
              style={{ background: "none", border: "none", padding: 0, fontFamily: MONO, fontSize: 9, fontWeight: 700, color: BLUE, cursor: reverifying ? "wait" : "pointer" }}>
              {reverifying ? "Checking… a few seconds" : "↻ Check again (free)"}
            </button>
          </div>
        )}
        {reverifyError && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: RED }}>{reverifyError}</div>}

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {j.seoNote && (
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: INK55 }}>{j.seoNote}</span>
          )}
          {j.contact && (
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: INK55 }}>
              Contact: {j.contact} · <a href={j.contactLinkedIn ? `https://${j.contactLinkedIn.replace(/^https?:\/\//, "")}` : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(j.name)}`} target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "none" }}>{j.contactLinkedIn ? "LinkedIn ↗" : "Find on LinkedIn ↗"}</a>
            </span>
          )}
          {isVerified && j.linkPage && j.linkPage !== "" && (
            <a href={j.linkPage} target="_blank" rel="noopener noreferrer" title={v?.bylineTitle ?? undefined}
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
              /* 2026-09-15: the asset travels as an id. This used to append a
                 300-word `assetIdea` — the client's linkable-asset concept —
                 to the URL, which put it in browser history and in Google
                 Analytics (it logs the full URL as its `dl` parameter).
                 `beat` is the user's own typed search term and `journalist` is
                 a public byline, so both stay. The title/type fallback is kept
                 for the case where the search was not run from a saved asset,
                 and neither carries pitch content. */
              href={`/emos-platform/dashboard/pressiq?beat=${encodeURIComponent(formData.industry ?? "")}&journalist=${encodeURIComponent(j.name)}${assetId ? `&asset=${encodeURIComponent(assetId)}` : `${prefillAssetTitle ? `&assetTitle=${encodeURIComponent(prefillAssetTitle)}` : ""}${prefillAssetType ? `&assetType=${encodeURIComponent(prefillAssetType)}` : ""}`}`}
              style={{ display: "inline-block", marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK, textDecoration: "none", borderBottom: `1px solid ${INK35}` }}>
              Score this pitch in PressIQ →
            </a>
          </div>
        )}
        {angleError && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: RED }}>{angleError}</div>}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* The angle names the journalist, so it is offered for verified people only. */}
          {!angle && isVerified && (
            <button onClick={getAngle} disabled={loadingAngle}
              style={{ padding: "8px 16px", border: `1px solid ${INK15}`, background: PAPER2, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: loadingAngle ? "wait" : "pointer" }}>
              {loadingAngle ? "Generating…" : "Get pitch angle →"}
            </button>
          )}
          <button onClick={handleSave} disabled={saving || alreadySaved}
            style={{ padding: "8px 16px", border: "none", background: alreadySaved ? PAPER2 : YEL, color: alreadySaved ? INK55 : INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: alreadySaved ? "default" : saving ? "wait" : "pointer" }}>
            {saving ? "Saving…" : alreadySaved ? "✓ Saved to list" : isVerified ? "Save to list →" : "Save as unverified →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Journalist list ───────────────────────────────────────────────────────────────────

function CRMList({ journalists, onDelete, onRefreshDr, refreshingDr, refreshNote }: {
  journalists: DbJournalist[];
  onDelete: (id: string) => void;
  onRefreshDr: () => void;
  refreshingDr: boolean;
  refreshNote: string | null;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  // 2026-09-09 (state layer phase 5): filter the CRM by the company a
  // journalist was found for. Journalists saved before the context layer have
  // no company and are reachable under "Not recorded" rather than hidden.
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const companyNames = Array.from(
    new Set(journalists.map(j => j.company_name).filter(Boolean) as string[]),
  ).sort();
  const uncategorised = journalists.filter(j => !j.company_name).length;

  // 2026-09-13 (Irfan): search + sort. The list was company-filtered only and
  // fixed to last-contact order, so finding one person meant scanning every
  // row — fine at 8 saved, unusable at 80, and "find the right journalist
  // fast" is the daily job of this tool.
  //
  // Search covers name, outlet and beat together rather than as separate
  // fields, because `beat` is a free-text sentence ("Cybersecurity, SIM swap
  // fraud, mobile carrier security"), not tags. That makes topic SEARCHABLE
  // now; filtering BY topic needs beats stored as tags, which is a data-model
  // change that belongs with the company-scoping migration.
  const [query, setQuery] = useState("");
  // 2026-09-13 (beats as tags): filter BY topic. Tags are derived from the
  // beat at save time (lib/journo/beat-tags.ts) and were backfilled, so every
  // row has them. The chip row shows the topics present in the current
  // company scope, most common first, so it never offers an empty filter.
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"name" | "outlet" | "dr" | "sent" | "won" | "last">("last");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: typeof sortKey) {
    if (key === sortKey) { setSortDir(d => (d === "asc" ? "desc" : "asc")); return; }
    setSortKey(key);
    // Text reads best A-Z; numbers and dates read best biggest/newest first.
    setSortDir(key === "name" || key === "outlet" ? "asc" : "desc");
  }

  const q = query.trim().toLowerCase();
  const inCompany = journalists.filter(j =>
    companyFilter === "all" ? true
    : companyFilter === "__none__" ? !j.company_name
    : j.company_name === companyFilter,
  );
  const tagCounts = new Map<string, number>();
  for (const j of inCompany) for (const t of j.tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 14);
  const activeTag = tagFilter && tagCounts.has(tagFilter) ? tagFilter : null;

  const visible = inCompany
    .filter(j => !activeTag || (j.tags ?? []).includes(activeTag))
    .filter(j => {
      if (!q) return true;
      return [j.name, j.outlet, j.beat].some(v => (v ?? "").toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":   return dir * a.name.localeCompare(b.name);
        case "outlet": return dir * (a.outlet ?? "").localeCompare(b.outlet ?? "");
        // Nulls sort last in both directions: an unknown DR is not a low DR,
        // and burying it under the real values is the honest placement.
        case "dr":     return nullsLast(a.domain_rating, b.domain_rating, dir);
        case "sent":   return dir * ((a.pitches_sent ?? 0) - (b.pitches_sent ?? 0));
        case "won":    return dir * ((a.placements ?? 0) - (b.placements ?? 0));
        default:       return nullsLast(
          a.last_contact ? Date.parse(a.last_contact) : null,
          b.last_contact ? Date.parse(b.last_contact) : null,
          dir,
        );
      }
    });

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
    <>
    {(companyNames.length > 0 || uncategorised > 0) && (
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>
          Found for
        </span>
        <select
          value={companyFilter}
          onChange={e => setCompanyFilter(e.target.value)}
          style={{ background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".06em", padding: "5px 10px", outline: "none", cursor: "pointer" }}
        >
          <option value="all">All companies · {journalists.length}</option>
          {companyNames.map(c => (
            <option key={c} value={c}>
              {c} · {journalists.filter(j => j.company_name === c).length}
            </option>
          ))}
          {uncategorised > 0 && <option value="__none__">Not recorded · {uncategorised}</option>}
        </select>
        {uncategorised > 0 && companyFilter === "all" && (
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
            {uncategorised} saved before the company was tracked.
          </span>
        )}
      </div>
    )}

    {/* Search across name, outlet and beat. Always rendered, even at two saved
        journalists, so the control does not appear only once the list is
        already too long to scan. */}
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search name, outlet or beat…"
        style={{ flex: 1, minWidth: 220, maxWidth: 380, background: PAPER, border: `1px solid ${INK15}`, color: INK, fontFamily: SERIF, fontSize: 13.5, padding: "7px 11px", outline: "none" }}
      />
      {(q || activeTag) && (
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55 }}>
          {visible.length} of {inCompany.length}
        </span>
      )}
      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>
        Click any column heading to sort.
      </span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {refreshNote && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: INK55 }}>{refreshNote}</span>}
        <button
          onClick={onRefreshDr}
          disabled={refreshingDr}
          title="Fetch the current Domain Rating for every saved outlet from Ahrefs"
          style={{ background: "none", border: `1px solid ${INK15}`, padding: "4px 9px", cursor: refreshingDr ? "wait" : "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK55 }}
        >
          {refreshingDr ? "Refreshing…" : "Refresh DR"}
        </button>
        <DrAttribution />
      </span>
    </div>

    {/* Topic chips: one click filters to journalists whose beat carries that
        topic. Only shows topics that exist in the current company scope. */}
    {topTags.length > 1 && (
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK55, marginRight: 4 }}>
          Topic
        </span>
        {topTags.map(([tag, n]) => {
          const on = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setTagFilter(on ? null : tag)}
              aria-pressed={on}
              style={{
                background: on ? INK : "transparent", color: on ? PAPER : INK,
                border: `1px solid ${on ? INK : INK15}`, padding: "3px 9px", cursor: "pointer",
                fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".06em",
              }}
            >
              {tag} <span style={{ opacity: .55 }}>{n}</span>
            </button>
          );
        })}
        {activeTag && (
          <button onClick={() => setTagFilter(null)} style={{ background: "none", border: "none", padding: "3px 6px", cursor: "pointer", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: INK55, textDecoration: "underline" }}>
            clear
          </button>
        )}
      </div>
    )}

    <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 60px 52px 52px 90px", background: INK, color: PAPER }}>
        {([
          ["Journalist",   "name"],
          ["Outlet / Beat","outlet"],
          ["DR",           "dr"],
          ["Sent",         "sent"],
          ["Won",          "won"],
          ["Last contact", "last"],
        ] as [string, typeof sortKey][]).map(([h, key], i) => (
          <button
            key={h}
            type="button"
            onClick={() => toggleSort(key)}
            title={`Sort by ${h}`}
            style={{
              padding: "10px 12px", textAlign: "left",
              background: "transparent", border: "none",
              borderRight: i < 5 ? "1px solid rgba(241,235,222,.12)" : "none",
              fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em",
              textTransform: "uppercase", color: PAPER, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            {h}
            <span style={{ opacity: sortKey === key ? 1 : 0.25 }}>
              {sortKey === key ? (sortDir === "asc" ? "\u2191" : "\u2193") : "\u2195"}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div style={{ padding: "20px", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
          {q ? `No saved journalist matches "${query.trim()}".` : "Nothing matches this filter."}
        </div>
      )}

      {visible.map((j, idx) => (
        <div key={j.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 60px 52px 52px 90px", borderBottom: idx < visible.length - 1 ? `1px solid ${INK15}` : "none" }}>
          <div style={{ padding: "11px 13px" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13.5, color: INK }}>{j.name}</div>
            {(j.company_name || j.asset_title) && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 3 }}>
                {j.company_name && (
                  <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".08em", textTransform: "uppercase", color: INK, background: YEL, padding: "2px 5px" }}>
                    {j.company_name}
                  </span>
                )}
                {j.asset_title && (
                  <span style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, color: INK55, border: `1px solid ${INK15}`, padding: "1px 5px" }}>
                    {j.asset_title.length > 28 ? j.asset_title.slice(0, 28) + "…" : j.asset_title}
                  </span>
                )}
              </div>
            )}
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
    </>
  );
}

// ── Loading panel (ported from the public tool — the search runs 30-60s on Opus
// and the dashboard used to just sit on a disabled button) ──────────────────────
const LOADING_LINES = [
  { h: "Scanning coverage on your beat…",    s: "Finding who's writing about this topic now." },
  { h: "Matching reporters to your story…",  s: "Ranking by beat fit and recent coverage." },
  { h: "Checking each name for a recent byline…", s: "Anyone without one in the last 12 months is flagged, not ranked." },
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
  prefillAssetId,
}: {
  initialJournalists: DbJournalist[];
  prefillBeat: string;
  prefillStory: string;
  prefillAssetTitle?: string;
  prefillAssetType?: string;
  prefillAssetIdea?: string;
  /** Set when this search was opened from a saved asset (?asset=<id>). Lets the
   *  PressIQ handoff pass the id instead of the asset's text. */
  prefillAssetId?: string | null;
}) {
  const [companyContext] = useCompanyContext();
  const companyCtx = useCompanyOptional();
  const [journalists, setJournalists] = useState<DbJournalist[]>(initialJournalists);
  const [refreshingDr, startRefreshDr] = useTransition();
  const [refreshNote, setRefreshNote] = useState<string | null>(null);
  const router = useRouter();
  function handleRefreshDr() {
    setRefreshNote(null);
    startRefreshDr(async () => {
      const r = await refreshDomainRatings();
      if (!r.configured) { setRefreshNote("Ahrefs key not set on the server yet."); return; }
      setRefreshNote(`${r.journalists} journalist${r.journalists === 1 ? "" : "s"} updated.`);
      router.refresh();
    });
  }
  const [results, setResults] = useState<AIJournalist[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // 2026-09-13: seeded from the journalists already in the list. This used to
  // start empty, so it only knew about saves made in the CURRENT session — a
  // journalist saved yesterday came back from a new search with a live "Save to
  // list" button and no sign they were already there, which is how you end up
  // with duplicate rows. Matched on a normalised name because that is the only
  // identifier an AI suggestion and a stored CRM row share.
  const [savedNames, setSavedNames] = useState<Set<string>>(
    () => new Set(initialJournalists.map(j => normaliseName(j.name))),
  );
  const counts = {
    verified:   results?.filter((j) => j.verification?.status === "verified").length ?? 0,
    unverified: results?.filter((j) => j.verification?.status === "unverified").length ?? 0,
    checking:   results?.filter((j) => j.verification?.status === "pending").length ?? 0,
    lastSeen:   results?.filter((j) => j.verification?.status === "stale").length ?? 0,
  };
  const [brief, setBrief] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [lastForm, setLastForm] = useState<Record<string, string> | null>(null);
  // Brand, website and description come from the selected company row, so a
  // user arriving here from SignalIQ or AssetIQ never retypes them. Before
  // 2026-09-09 this was a heuristic over one localStorage string, and the name
  // was not carried at all.

  // Build enriched story text from asset context
  const enrichedStory = prefillAssetTitle
    ? [
        prefillAssetTitle && `We are building a ${prefillAssetType?.replace(/_/g, " ") ?? "linkable asset"} titled "${prefillAssetTitle}".`,
        prefillAssetIdea && `The asset: ${prefillAssetIdea}`,
        prefillStory && `Pitch angle: ${prefillStory}`,
      ].filter(Boolean).join(" ")
    : prefillStory;

  // "What you do (1-2 sentences)" was seeded with the whole company context
  // (600 chars in the 24 Sep test). The full context still reaches the model
  // through the company row; the box gets the first two sentences.
  const defaultForm = {
    biz: companyCtx?.company?.name ?? "",
    domain: companyCtx?.company?.website ?? "",
    desc: firstSentences(companyContext, 2),
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
      const res = await fetch("/api/emos-platform/journo-ai", {
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

      // The server now returns clean JSON (parse hardened there, 2026-09-25);
      // this strip stays as a harmless fallback.
      const raw = data.result?.trim() ?? "";
      // Strip markdown fences if present
      const json = raw.startsWith("```") ? raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim() : raw;
      const parsed = JSON.parse(json) as AIJournalist[];
      // 2026-09-13: sort by tier before display. The header says "ranked by
      // fit", but the list was rendered in whatever order the model emitted,
      // so a Tier A could sit below two Tier Bs and the ranking claim read as
      // false. Sort is stable, so the model's own ordering is preserved inside
      // each tier — that within-tier order IS its fit ranking, and this only
      // fixes the tier grouping around it.
      // 2026-09-25 (P1-01): verified people first by tier, then names still
      // being checked, then names not confirmed.
      const sorted = [...parsed].sort((a, b) => verificationRank(a) - verificationRank(b));
      setResults(sorted);
      // Checks that did not land inside the search route come back "pending";
      // fill them in one call each (cache first on the server, so free if the
      // route's late check already landed).
      sorted.forEach((j) => {
        if (j.verification?.status !== "pending") return;
        void requestVerification(j, false).then((r) => {
          const v: JournalistVerification = "error" in r
            ? { ...j.verification!, status: "check_failed", note: r.error }
            : r;
          updateVerification(j.name, v);
        });
      });
    } catch (e) {
      console.error("journo search error:", e);
      setSearchError("Could not parse journalist results. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  /** Fold a fresh check into the result list, matched by name. */
  function updateVerification(name: string, v: JournalistVerification) {
    setResults((prev) => prev?.map((c) => (c.name === name ? applyVerification(c, v) : c)) ?? prev);
  }

  async function generateBrief() {
    if (!lastForm) return;
    setLoadingBrief(true);
    setBriefError(null);
    try {
      const res = await fetch("/api/emos-platform/journo-ai", {
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
      // Was silent on failure, so a spent allowance or an API error looked
      // like a button that did nothing (2026-09-10).
      if (!res.ok || !data.result) { setBriefError(data.error ?? "Could not generate the media brief."); return; }
      setBrief(data.result);
    } catch { setBriefError("Network error. Please try again."); }
    finally { setLoadingBrief(false); }
  }

  return (
    <div style={{ fontFamily: SERIF }}>

      {/* ── Which company we are finding journalists for. Carried from
             SignalIQ / AssetIQ automatically; switchable here. ──────────── */}
      <CompanyPicker note="Used by every EMOS tool" />

      {/* Story form */}
      <StoryForm
        key={companyCtx?.company?.id ?? "no-company"}
        initial={defaultForm}
        onSearch={handleSearch}
        searching={searching}
        rememberKey={`jciq:last-search:${companyCtx?.company?.id ?? "no-company"}`}
      />

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
                {counts.verified} verified{counts.lastSeen > 0 ? ` · ${counts.lastSeen} last seen` : ""} · {counts.unverified} name not confirmed{counts.checking > 0 ? ` · ${counts.checking} checking` : ""}
              </span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                Verified = a byline at the outlet in the last 12 months · ranked by fit
              </span>
            </div>
            <button onClick={generateBrief} disabled={loadingBrief}
              style={{ padding: "8px 16px", border: `1px solid ${INK15}`, background: PAPER2, color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".10em", textTransform: "uppercase", cursor: loadingBrief ? "wait" : "pointer" }}>
              {loadingBrief ? "Generating…" : "Generate media brief →"}
            </button>
          </div>

          {/* How the names were checked: the three routes, plainly (decision 5, 25 Sep). */}
          <div style={{ border: `1px solid ${INK}`, background: PAPER, marginBottom: 16 }}>
            <div style={{ background: INK, padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8.5, letterSpacing: ".16em", textTransform: "uppercase", color: PAPER }}>How these names were checked</span>
              <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(241,235,222,.5)" }}>byline · last 12 months</span>
            </div>
            <p style={{ margin: 0, padding: "10px 12px 8px", fontFamily: SERIF, fontSize: 13, color: INK70, lineHeight: 1.55 }}>
              Every name was checked for a byline at the outlet in the last 12 months, either on the outlet&apos;s own pages or by a web search. Names with one are marked Verified and link to that article. &ldquo;Last seen&rdquo; means we saw them there more than 30 days ago and they may have moved. Names without a byline are marked Name not confirmed and get no tier.
            </p>
            {([
              ["Verified earlier (cached)", "Instant, free and stable from one search to the next. The check can be up to 30 days old, and a journalist may have changed beat or outlet since, so look at the last byline seen date."],
              ["↻ Re-verify", "A fresh check on one person, right now. Free, takes a few seconds, catches a recent move. Nothing else on the list changes."],
              ["New search", "Finds new people. Uses one search from your monthly allowance, takes 30 to 60 seconds, and the list can differ from the last run."],
            ] as [string, string][]).map(([label, text]) => (
              <div key={label} style={{ display: "flex", gap: 12, padding: "8px 12px", borderTop: `1px solid ${INK15}`, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK, minWidth: 170 }}>{label}</span>
                <span style={{ flex: 1, minWidth: 220, fontFamily: SERIF, fontSize: 12.5, color: INK70, lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "rgba(245,184,31,.07)", border: `1px solid rgba(245,184,31,.3)`, padding: "10px 13px", marginBottom: 16 }}>
            <span style={{ background: YEL, fontFamily: GROT, fontSize: 8, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 7px", color: INK, flexShrink: 0 }}>AI</span>
            <span style={{ fontFamily: SERIF, fontSize: 12, color: INK70, lineHeight: 1.5 }}>Each journalist is scored against 8 fit criteria: beat match, recent coverage, outlet authority, audience fit, responsiveness, exclusivity fit, contact findability, and brand-safety fit.</span>
          </div>

          {briefError && (
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: RED, marginBottom: 16 }}>{briefError}</div>
          )}

          {brief && (
            <div style={{ background: PAPER2, border: `1px solid ${INK}`, padding: "18px 22px", marginBottom: 24 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".16em", textTransform: "uppercase", color: INK55, marginBottom: 12 }}>Media targeting brief</div>
              <Markdown text={brief} size={14} />
            </div>
          )}

          {results.map((j, i) => (
            <JournalistCard
              key={i}
              j={j}
              formData={lastForm ?? {}}
              savedNames={savedNames}
              onSaved={(name, nj) => {
                setSavedNames(prev => new Set([...prev, normaliseName(name)]));
                setJournalists(prev => [nj, ...prev]);
              }}
              prefillAssetTitle={prefillAssetTitle}
              prefillAssetType={prefillAssetType}
              companyId={companyCtx?.company?.id ?? null}
              companyName={companyCtx?.company?.name ?? null}
              assetId={prefillAssetId ?? null}
              onVerification={(v) => updateVerification(j.name, v)}
            />
          ))}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
            {([["A", "Highest priority", GREEN], ["B", "Strong candidate", BLUE], ["C", "Good to include", AMBER]] as [string, string, string][]).map(([t, l, c]) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: c, border: `1px solid ${c}`, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "2px 7px" }}>Tier {t}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: INK55 }}>{l}</span>
              </span>
            ))}
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: INK, background: AMBER, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "2px 7px" }}>Name not confirmed</span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: INK55 }}>No byline found in the last 12 months · no tier</span>
            </span>
          </div>
        </div>
      )}

      {/* CRM */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" }}>Journalist List</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK }}>{journalists.length}</span>
          <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: INK55 }}>saved</span>
        </div>
        <CRMList
          journalists={journalists}
          onDelete={id => setJournalists(prev => prev.filter(j => j.id !== id))}
          onRefreshDr={handleRefreshDr}
          refreshingDr={refreshingDr}
          refreshNote={refreshNote}
        />
      </div>

    </div>
  );
}
