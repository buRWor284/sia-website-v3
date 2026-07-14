"use client";

/**
 * SignalIQToolCore — the shared SignalIQ tool experience (Phase P6,
 * Unified-Gate-Freemium RFP v1.1 §7).
 *
 * ONE core, two thin wrappers:
 *   - app/tools/signaliq/page.tsx        (public: landing + Turnstile + gates/quota + PDF)
 *   - components/emostool/SignalIQPlatformClient.tsx (dashboard: Clerk chrome + Save-to-EMOS + library)
 *
 * The 5-step wizard (Beat → Context → Radar → Angle → Pack), cards, angle view
 * and pack stage all live here — moved verbatim from the public page — so
 * fixes land once and appear on both surfaces.
 *
 * Boundary rules (do not violate):
 *   - NO Turnstile code here. The public wrapper owns the hardened widget
 *     pattern end-to-end and passes the docked container via `belowStages`;
 *     tokens ride inside the wrapper's `api` transport.
 *   - NO gate/quota logic here. `quotaUi` is display-wiring only.
 *   - NO Clerk/persistence here. Saving is the injected `onSaveOpportunity`.
 *   - NO fetch URLs here. `api` is an injected transport.
 *   - Wrappers must render <style>{SIQ_CSS}</style> (see core-css.ts).
 *
 * Ranking: renders the engine's server-side ordering directly. The old
 * client-side keyword re-rank was removed in P6 (Irfan, 2026-07-12) — the
 * engine's LLM fit ranking (relevanceMultiplier) is authoritative.
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  HRule,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  DARK,
  DARK_BD,
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
import { BEATS, EMAIL_SCANS, FREE_SCANS } from "@/lib/signaliq/config";
import {
  AMBER,
  GREEN,
  RED,
  BAND_TOOLTIP,
  InfoTooltip,
  OppCard,
  ReceiptsPanel,
  ScanLoader,
  ScorePanel,
  ScoreRing,
  SourcesSidebar,
  GapBar,
  bandColor,
  hexA,
} from "./cards";
import { PackView } from "./PackView";
import type {
  AssetPack,
  BeatId,
  Opportunity,
  ScanResponse,
} from "@/lib/signaliq/types";

// ── public contract ───────────────────────────────────────────────────────────

/** Injected transport. The wrapper owns URLs, auth and Turnstile; it returns
 * `{ ok, data }` where `data` is the parsed JSON body (ScanResponse / AssetPack
 * on ok, `{ error?, usage? }` otherwise). Throw for network failures. */
export interface SignalIQCoreApi {
  scan(body: { beats: BeatId[]; companyContext?: string }): Promise<{ ok: boolean; data: unknown }>;
  pack(body: { opportunity: Opportunity; companyContext?: string }): Promise<{ ok: boolean; data: unknown }>;
}

export interface SaveResult { ok: boolean; id?: string | null; error?: string }

/** Everything the wrapper needs to build the PDF report. */
export interface SiqPdfContext {
  beats: BeatId[];
  companyContext: string;
  opportunities: Opportunity[];
  selected: Opportunity;
  pack: AssetPack;
  generatedAt?: string;
}

export interface SignalIQCoreProps {
  api: SignalIQCoreApi;
  /** Ordered beat selection (primary first), length 1–3 — controlled by the
   * wrapper (the public page persists it to localStorage). */
  beats: BeatId[];
  onBeatsChange: (beats: BeatId[]) => void;
  /** Company context — controlled by the wrapper (public: per-visit useState;
   * dashboard: useCompanyContext localStorage hook). */
  companyContext: string;
  onCompanyContextChange: (v: string) => void;
  /** Company-profile behavior (dashboard: name field + required context). */
  profile?: {
    collectName?: boolean;
    companyName?: string;
    onCompanyNameChange?: (v: string) => void;
    contextRequired?: boolean;
    contextMaxLength?: number;
  };
  /** Public gate/quota display wiring. null/undefined = platform (no quota UI). */
  quotaUi?: { emailDone: boolean; onOpenGate: () => void } | null;
  /** Shown where the quota line would be when quotaUi is off (e.g. the
   * dashboard's "Platform scan — unlimited, tailored to your company"). */
  scanNote?: string;
  /** Dashboard: persist an opportunity ("Save to EMOS"). Presence renders the
   * Save buttons on radar cards and the pack stage. */
  onSaveOpportunity?: (opp: Opportunity, beatLabel: string) => Promise<SaveResult>;
  packActions?: {
    onDownloadPDF?: (ctx: SiqPdfContext) => void;
    pressIqHref?: string;
    buildAssetHref?: (opp: Opportunity, pack: AssetPack) => string;
  };
  /** Rendered under the pack stage (public: the EMOS CTA strip). */
  belowPack?: React.ReactNode;
  /** Docked below the stages (public: the Turnstile widget container). */
  belowStages?: React.ReactNode;
  /** Stage-1 back action (public: return to the landing screen). When absent
   * the stage-1 back button is hidden (dashboard has no landing). */
  onExit?: () => void;
  exitLabel?: string;
  /** Sticky offset for the progress bar (public sits under the 52px ToolHeader;
   * the dashboard header isn't sticky, so it passes 0). */
  stickyTop?: number;
}

// ── beat picker ───────────────────────────────────────────────────────────────

function BeatPicker({
  beats,
  setBeats,
  onScan,
  scanning,
  wizardMode = false,
}: {
  beats: BeatId[];
  setBeats: (b: BeatId[]) => void;
  onScan?: () => void;
  scanning?: boolean;
  wizardMode?: boolean;
}) {
  const primary = beats[0];
  const secondary = beats[1] as BeatId | undefined;
  const tertiary = beats[2] as BeatId | undefined;
  const currentBeat = BEATS.find((b) => b.id === primary);

  // Primary is the required tab-grid choice; secondary/tertiary are optional,
  // additive (weighted, still one scan). Setting primary keeps any secondary /
  // tertiary that don't collide with the new primary.
  const setPrimary = (id: BeatId) => setBeats([id, ...beats.slice(1).filter((b) => b !== id)]);
  const secondaryOptions = BEATS.filter((b) => b.id !== primary && b.id !== tertiary);
  const tertiaryOptions = BEATS.filter((b) => b.id !== primary && b.id !== secondary);
  const addSecondary = () => {
    const first = secondaryOptions[0];
    if (first) setBeats([primary, first.id]);
  };
  const changeSecondary = (id: BeatId) =>
    setBeats([primary, id, ...(tertiary && tertiary !== id ? [tertiary] : [])]);
  const removeSecondary = () => setBeats([primary]); // drops tertiary too
  const addTertiary = () => {
    const first = tertiaryOptions[0];
    if (first && secondary) setBeats([primary, secondary, first.id]);
  };
  const changeTertiary = (id: BeatId) => secondary && setBeats([primary, secondary, id]);
  const removeTertiary = () => secondary && setBeats([primary, secondary]);

  return (
    <section style={{ padding: "clamp(16px,3vw,28px) clamp(22px,5vw,56px) 0" }}>
      <div className="siq-beat-tabs">
        {BEATS.map((b, i) => {
          const isActive = b.id === primary;
          const seedsNode = (
            <span>
              <span style={{ fontStyle: "normal", fontWeight: 700 }}>Seed Phrases: </span>{b.seeds.join(", ")}
            </span>
          );
          return (
            <button
              key={b.id}
              onClick={() => setPrimary(b.id)}
              className={`siq-tab${isActive ? " active" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                <span className="siq-tab-no">0{i + 1}</span>
                <span>{b.label}</span>
                <InfoTooltip text={seedsNode} dark={isActive} width={320} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Beat selection tip */}
      <p style={{ maxWidth: 800, marginTop: 10, marginBottom: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, lineHeight: 1.6 }}>
        <span style={{ fontFamily: GROT, fontWeight: 700, fontStyle: "normal", fontSize: 9.5, letterSpacing: ".10em", textTransform: "uppercase", color: INK70 }}>Tip:</span>{" "}
        Pick the vertical your <em>target journalists</em> cover as your <strong>main beat</strong>.
        Straddling two worlds &mdash; say health <em>and</em> AI? Add a second (and third) beat below and we scan all of them in one pass. It still counts as a single scan against your quota.
      </p>

      {/* Secondary / tertiary beats — progressive disclosure (all tiers free) */}
      <div className="siq-multibeat">
        {!secondary ? (
          <button type="button" className="siq-addbeat" onClick={addSecondary}>
            + Add a secondary beat <span className="siq-addbeat-opt">(optional)</span>
          </button>
        ) : (
          <div className="siq-beatrow">
            <span className="siq-beatrow-lbl">Secondary</span>
            <select className="siq-beatsel" value={secondary} onChange={(e) => changeSecondary(e.target.value as BeatId)}>
              {secondaryOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <button type="button" className="siq-beatx" onClick={removeSecondary} aria-label="Remove secondary beat">×</button>
          </div>
        )}
        {secondary && (!tertiary ? (
          <button type="button" className="siq-addbeat" onClick={addTertiary}>
            + Add a third beat <span className="siq-addbeat-opt">(optional)</span>
          </button>
        ) : secondary && tertiary ? (
          <div className="siq-beatrow">
            <span className="siq-beatrow-lbl">Tertiary</span>
            <select className="siq-beatsel" value={tertiary} onChange={(e) => changeTertiary(e.target.value as BeatId)}>
              {tertiaryOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <button type="button" className="siq-beatx" onClick={removeTertiary} aria-label="Remove third beat">×</button>
          </div>
        ) : null)}
      </div>
      {!wizardMode && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <button
            onClick={onScan}
            disabled={scanning}
            className="siq-scan-btn"
          >
            {scanning ? "Scanning the radar…" : beats.length > 1 ? `Scan ${beats.length} beats →` : `Scan ${currentBeat?.label} →`}
          </button>
          <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
            {FREE_SCANS} free scans / month, or {EMAIL_SCANS} with your email · live open-data sources
          </p>
        </div>
      )}
    </section>
  );
}

// ── email gate: inline "unlock more" card (renders only with quotaUi) ─────────

function UnlockCard({ done, onOpen }: { done: boolean; onOpen: () => void }) {
  if (done) {
    return (
      <div style={{ padding: "14px 20px", border: `1px solid ${GREEN}`, background: hexA(GREEN, 0.06), fontFamily: SERIF, fontSize: 14.5, color: INK }}>
        ✓ Unlocked, {EMAIL_SCANS} scans a month. Check your inbox.
      </div>
    );
  }
  return (
    <div style={{ padding: "18px 20px", border: `1px solid ${INK}`, background: PAPER2 }}>
      <SCaps size={10} ls="0.16em" color={INK}>Unlock more scans &amp; downloads</SCaps>
      <p style={{ margin: "6px 0 10px", fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.5 }}>
        Add your email for {EMAIL_SCANS} scans/month, PDF downloads, and SIA&rsquo;s earned-media playbooks.
        Verify once — it works across every tool. One list, unsubscribe anytime.
      </p>
      <p style={{ margin: "0 0 12px", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, lineHeight: 1.5, borderLeft: `2px solid ${YEL}`, paddingLeft: 10 }}>
        Enterprise media tools (Cision, Meltwater) run $15,000&ndash;$40,000 a year for contacts and monitoring. The story-discovery layer they don&rsquo;t have is free here.
      </p>
      <button type="button" onClick={onOpen} className="siq-scan-btn" style={{ fontSize: 12 }}>
        Unlock →
      </button>
    </div>
  );
}

// ── detail view (stage 4 — the Angle) ─────────────────────────────────────────

function AngleView({ opp }: { opp: Opportunity }) {
  const c = bandColor(opp.band);
  const whyTag: React.CSSProperties = { flexShrink: 0, width: 48, paddingTop: 1, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: INK35 };
  return (
    <section style={{ padding: "18px clamp(22px,5vw,56px) 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ margin: "0 0 14px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
          Step 4 of 5 · the angle
        </p>

        {/* Opportunity header */}
        <div style={{ display: "flex", gap: "clamp(16px,3vw,32px)", flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
          <ScoreRing score={opp.score} color={c} size={110} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", color: c,
                border: `1px solid ${hexA(c, 0.4)}`,
                background: hexA(c, 0.08), padding: "2px 7px",
              }}>
                {opp.bandLabel}
              </span>
              <InfoTooltip text={BAND_TOOLTIP[opp.band]} />
              <span style={{ fontFamily: MONO, fontSize: 8, color: INK55, letterSpacing: ".10em", textTransform: "uppercase" }}>
                · {BEATS.find((b) => b.id === opp.beat)?.label ?? opp.beat}
              </span>
            </span>
            <h2 style={{ margin: "10px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3.5vw,38px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }}>
              {opp.headline}
            </h2>
          </div>
        </div>

        {/* Why now / Why you */}
        <div style={{ maxWidth: 540, marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={whyTag}>Why&nbsp;now</span>
            <div style={{ flex: 1 }}><GapBar opp={opp} /></div>
          </div>
          {opp.fit && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={whyTag}>Why&nbsp;you</span>
              <span style={{ fontFamily: GROT, fontSize: 12, color: INK70 }}>
                Fit for your startup:{" "}
                <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: opp.fit === "high" ? GREEN : opp.fit === "medium" ? AMBER : RED }}>
                  {opp.fit === "high" ? "High" : opp.fit === "medium" ? "Medium" : "Low"}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* § 01 — Why SignalIQ flagged this */}
        <div style={{ marginTop: 28 }}>
          <SectionMast n="01" label="Why SignalIQ flagged this" />
          <div className="siq-detail-cols">
            <ScorePanel opp={opp} />
            <ReceiptsPanel opp={opp} />
          </div>
        </div>

        <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK55, lineHeight: 1.4 }}>
          A lead/whitespace score: how far ahead of the coverage you are. Not a prediction the story breaks.
        </p>
      </div>
    </section>
  );
}

// ── wizard chrome (stepper + footer) ──────────────────────────────────────────

const WIZ_STEPS = ["Beat", "Context", "Radar", "Angle", "Pack"] as const;
export type WizStage = 1 | 2 | 3 | 4 | 5;

function SiqWizardProgress({ stage, onGoStage, stickyTop = 52 }: { stage: WizStage; onGoStage: (n: WizStage) => void; stickyTop?: number }) {
  return (
    <div style={{ background: DARK, borderBottom: `1px solid ${DARK_BD}`, position: "sticky", top: stickyTop, zIndex: 49, padding: "10px clamp(20px,4vw,28px) 12px" }}>
      <div style={{ height: 2, background: "rgba(241,235,222,.14)", marginBottom: 12 }}>
        <div style={{ height: "100%", background: YEL, width: `${(stage / 5) * 100}%`, transition: "width .5s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        {WIZ_STEPS.map((label, i) => {
          const n = (i + 1) as WizStage;
          const active = n === stage, done = n < stage, reachable = n <= stage;
          return (
            <button
              key={label}
              onClick={() => { if (reachable) onGoStage(n); }}
              disabled={!reachable}
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: reachable ? "pointer" : "default" }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: MONO, fontWeight: 700, fontSize: 10,
                background: active ? YEL : done ? "rgba(245,184,31,.18)" : "transparent",
                color: active ? INK : done ? YEL : "rgba(241,235,222,.55)",
                border: `1px solid ${active ? YEL : done ? "rgba(245,184,31,.4)" : "rgba(241,235,222,.28)"}`,
              }}>
                {done ? "✓" : n}
              </span>
              <span className="siq-wiz-label" style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase",
                color: active ? "rgba(241,235,222,.95)" : done ? "rgba(241,235,222,.70)" : "rgba(241,235,222,.55)",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SiqWizardFooter({ stage, onBack, backHidden = false, backLabel, onNext, nextLabel, nextDisabled = false, onSkip }: {
  stage: WizStage;
  onBack: () => void;
  backHidden?: boolean;
  backLabel: string;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  onSkip?: () => void;
}) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: DARK, borderTop: `1px solid ${DARK_BD}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px clamp(20px,4vw,28px)", zIndex: 60 }}>
      <button onClick={onBack} className="siq-wiz-ghost" style={backHidden ? { visibility: "hidden" } : undefined}>{backLabel}</button>
      <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(241,235,222,.55)", letterSpacing: ".08em" }}>{stage} of 5</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onSkip && <button onClick={onSkip} className="siq-wiz-link">Skip →</button>}
        <button onClick={onNext} disabled={nextDisabled} className="siq-wiz-next">{nextLabel}</button>
      </div>
    </div>
  );
}

// ── the shared tool core ──────────────────────────────────────────────────────

export default function SignalIQToolCore({
  api,
  beats,
  onBeatsChange,
  companyContext,
  onCompanyContextChange,
  profile,
  quotaUi,
  scanNote,
  onSaveOpportunity,
  packActions,
  belowPack,
  belowStages,
  onExit,
  exitLabel = "← Landing",
  stickyTop = 52,
}: SignalIQCoreProps) {
  const [stage, setStage] = useState<WizStage>(1);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);

  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [packing, setPacking] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const [pack, setPack] = useState<AssetPack | null>(null);

  // P4: the server sets `upgrade: true` on an email-tier 429 (public routes
  // only) — render the EMOS platform CTA next to the error. Always false on
  // the dashboard, whose routes never send the flag.
  const [scanUpgrade, setScanUpgrade] = useState(false);
  const [packUpgrade, setPackUpgrade] = useState(false);

  // Save-to-EMOS state (only used when onSaveOpportunity is provided)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});

  const contextRequired = !!profile?.contextRequired;
  const contextMaxLength = profile?.contextMaxLength ?? 400;
  const contextValid = companyContext.trim().length >= 12;

  // Whether the scan was personalised (context provided) — drives result copy.
  const usedContext = !!companyContext.trim();

  // P6/Q2: the engine ranks server-side (LLM fit via relevanceMultiplier,
  // sensitive topics demoted) — render its ordering directly.
  const rankedOpps = scan?.opportunities ?? [];

  const scrollTop = () => { if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleBeatsChange = (bs: BeatId[]) => {
    onBeatsChange(bs);
    setScan(null);
    setScanError(null);
  };

  // ── wizard navigation ──────────────────────────────────────────────────────
  function goStage(n: WizStage) {
    if (n <= 3) { setSelected(null); setPack(null); setPackError(null); }
    setStage(n);
    scrollTop();
  }
  function goBack() {
    if (stage === 1) { if (onExit) { onExit(); scrollTop(); } return; }  // Beat → landing
    goStage((stage - 1) as WizStage);
  }
  async function goNext() {
    if (stage === 1) { setStage(2); scrollTop(); return; }
    if (stage === 2) { setStage(3); scrollTop(); await runScan(); return; }   // context-before-scan
    if (stage === 3) { if (selected) { setStage(4); scrollTop(); } return; }
    if (stage === 4) { if (selected) { setStage(5); scrollTop(); await generatePack(selected); } return; }
    if (stage === 5) { startOver(); return; }
  }
  function startOver() {
    setSelected(null); setPack(null); setPackError(null); setScan(null); setScanError(null);
    setScanUpgrade(false); setPackUpgrade(false);
    setStage(1); scrollTop();
  }
  // Radar card actions: inspect → Angle (stage 4); Generate → straight to Pack (stage 5).
  function pickForAngle(opp: Opportunity) { setSelected(opp); setStage(4); scrollTop(); }
  function pickForPack(opp: Opportunity) { setSelected(opp); setStage(5); scrollTop(); generatePack(opp); }

  // Single scan — always includes context when provided (context-before-scan),
  // so there's only ever one scan call per run (no generic-then-personalise
  // double hit against quota).
  async function runScan(ctxOverride?: string) {
    const ctx = (ctxOverride !== undefined ? ctxOverride : companyContext).trim();
    setScanError(null);
    setScanning(true);
    setScan(null);
    setSelected(null);
    setPack(null);
    setScanUpgrade(false);
    try {
      const { ok, data } = await api.scan({ beats, companyContext: ctx || undefined });
      if (!ok) {
        setScanError((data as { error?: string })?.error || "Scan failed.");
        setScanUpgrade(Boolean((data as { upgrade?: boolean })?.upgrade));
      } else setScan(data as ScanResponse);
    } catch {
      setScanError("Network error. Please try again.");
    } finally {
      setScanning(false);
    }
  }

  async function generatePack(opp: Opportunity) {
    setSelected(opp);
    setPack(null);
    setPackError(null);
    setPacking(true);
    scrollTop();
    setPackUpgrade(false);
    try {
      const { ok, data } = await api.pack({ opportunity: opp, companyContext: companyContext.trim() || undefined });
      if (!ok) {
        setPackError((data as { error?: string })?.error || "Could not generate the pack.");
        setPackUpgrade(Boolean((data as { upgrade?: boolean })?.upgrade));
      } else setPack(data as AssetPack);
    } catch {
      setPackError("Network error. Please try again.");
    } finally {
      setPacking(false);
    }
  }

  // ── save to EMOS (dashboard wrapper only) ──────────────────────────────────
  async function handleSave(opp: Opportunity) {
    if (!onSaveOpportunity) return;
    const beatLabel = BEATS.find((b) => b.id === opp.beat)?.label ?? String(opp.beat);
    setSavingId(opp.id);
    setSaveErrors((prev) => { const next = { ...prev }; delete next[opp.id]; return next; });
    try {
      const result = await onSaveOpportunity(opp, beatLabel);
      if (result.ok) setSavedIds((prev) => new Set(prev).add(opp.id));
      else setSaveErrors((prev) => ({ ...prev, [opp.id]: result.error ?? "Save failed — check Vercel logs" }));
    } catch (e) {
      console.error("onSaveOpportunity error:", e);
      setSaveErrors((prev) => ({ ...prev, [opp.id]: "Network error — please try again" }));
    } finally {
      setSavingId(null);
    }
  }
  const saveFor = (opp: Opportunity) =>
    onSaveOpportunity
      ? {
          saved: savedIds.has(opp.id),
          saving: savingId === opp.id,
          error: saveErrors[opp.id] ?? null,
          onSave: () => handleSave(opp),
        }
      : undefined;

  // ── PDF (built by the wrapper; the core only assembles the context) ─────────
  function downloadPDF() {
    if (!selected || !pack || !packActions?.onDownloadPDF) return;
    packActions.onDownloadPDF({
      beats,
      companyContext: companyContext.trim(),
      opportunities: scan?.opportunities ?? [],
      selected,
      pack,
      generatedAt: scan?.generatedAt,
    });
  }

  const footerNextLabel =
    stage === 1 ? "Next: your context →" :
    stage === 2 ? (companyContext.trim() ? "Scan with my context →" : "Scan →") :
    stage === 3 ? (selected ? "View the angle →" : "Pick an opportunity") :
    stage === 4 ? "Generate asset pack →" :
    stage === 5 ? "Start over ↻" : "Next →";
  const footerNextDisabled =
    (stage === 2 && contextRequired && !contextValid) ||
    (stage === 3 && !selected) || scanning || packing;

  return (
    <>
      <SiqWizardProgress stage={stage} onGoStage={goStage} stickyTop={stickyTop} />

      <div style={{ background: PAPER, color: INK, fontFamily: SERIF, paddingBottom: 84 }}>

        {/* ── Stage 1: Beat ──────────────────────────────────────────────── */}
        {stage === 1 && (
          <section style={{ padding: "0 0 40px" }}>
            <div style={{ padding: "24px clamp(22px,5vw,56px) 0" }}>
              <p style={{ margin: "0 0 8px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                Step 1 of 5 · pick your beat
              </p>
              <h2 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: INK }}>
                Pick your <em style={{ fontStyle: "italic", fontWeight: 600 }}>beat.</em>
              </h2>
              <p style={{ margin: 0, maxWidth: 620, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, lineHeight: 1.5 }}>
                Choose the vertical your <em>target journalists</em> cover — that&rsquo;s where filings, research and news actually discuss your space.
              </p>
            </div>
            <BeatPicker beats={beats} setBeats={handleBeatsChange} wizardMode />
          </section>
        )}

        {/* ── Stage 2: Context ───────────────────────────────────────────── */}
        {stage === 2 && (
          <section style={{ padding: "24px clamp(22px,5vw,56px) 40px" }}>
            <div style={{ maxWidth: 680 }}>
              <p style={{ margin: "0 0 8px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                Step 2 of 5 · {contextRequired ? "your company" : "optional"}
              </p>
              <h2 style={{ margin: "0 0 8px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.08, letterSpacing: "-0.02em", color: INK }}>
                Tell us about your <em style={{ fontStyle: "italic", fontWeight: 600 }}>startup.</em>
              </h2>
              <p style={{ margin: "0 0 22px", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, lineHeight: 1.5 }}>
                We expand this into company-specific topics and score every result by how well it fits you — then personalise your pitch pack.
                {contextRequired ? " This drives the platform scan, so it's required." : " Or skip straight to the full radar."}
              </p>
              {profile?.collectName && (
                <input
                  value={profile.companyName ?? ""}
                  onChange={(e) => profile.onCompanyNameChange?.(e.target.value)}
                  maxLength={80}
                  placeholder="Company name (e.g. SIA Health OS) — saved with each signal"
                  style={{
                    width: "100%", boxSizing: "border-box", marginBottom: 10,
                    background: PAPER2, border: `1px solid ${INK15}`,
                    color: INK, fontFamily: GROT, fontWeight: 700, fontSize: 13,
                    padding: "11px 14px", outline: "none",
                  }}
                />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                  Your startup context
                </label>
                <InfoTooltip text="Your context tailors the scan itself: we expand it into company-specific topics and score every result by how well it fits you, then personalise your pitch pack. Takes a few extra seconds." />
              </div>
              <textarea
                value={companyContext}
                onChange={e => onCompanyContextChange(e.target.value)}
                maxLength={contextMaxLength}
                rows={4}
                placeholder="e.g. 'We're a B2B SaaS helping SMBs access working capital. We have proprietary data on 10,000+ lending decisions. Our founder is a former Goldman analyst.'"
                style={{
                  width: "100%", boxSizing: "border-box",
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK,
                  background: PAPER2, border: `1px solid ${contextRequired && !contextValid ? RED : INK15}`,
                  padding: "14px 16px", resize: "vertical", outline: "none",
                  lineHeight: 1.6,
                }}
              />
              {companyContext.trim() && (
                <p style={{ margin: "4px 0 0", fontFamily: MONO, fontSize: 9, color: INK35, letterSpacing: ".06em" }}>
                  {companyContext.trim().length}/{contextMaxLength}
                </p>
              )}
              {contextRequired && (
                <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: contextValid ? GREEN : INK55 }}>
                  {contextValid
                    ? "✓ We'll expand this into tailored topics and score every result by fit to your company."
                    : "Add a sentence or two about your company — relevance scoring needs it before you can scan."}
                </p>
              )}
              <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55, borderLeft: `2px solid ${AMBER}`, paddingLeft: 10 }}>
                Works best when your company operates <em>inside</em> one of these beats (health, fintech, SaaS, AI, etc.). Service or agency businesses (e.g. a marketing/PR firm) will see thinner results.
              </p>
            </div>
          </section>
        )}

        {/* ── Stage 3: Radar ─────────────────────────────────────────────── */}
        {stage === 3 && (
          <section style={{ padding: "24px 0 40px" }}>
            <div style={{ padding: "0 clamp(22px,5vw,56px)" }}>
              <p style={{ margin: 0, fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                Step 3 of 5 · the radar
              </p>
            </div>

            {scanning && <ScanLoader />}

            {scanError && !scanning && (
              <div style={{ maxWidth: 620, margin: "20px auto 0", padding: "12px 14px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK, textAlign: "center" }}>
                {scanError}
                {scanUpgrade && (
                  <a href="/emos-platform" style={{ display: "inline-block", marginLeft: 8, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: INK, textDecoration: "underline" }}>
                    Explore the EMOS platform →
                  </a>
                )}
              </div>
            )}

            {!scanning && scan && scan.notes.length > 0 && (
              <p style={{ maxWidth: 620, margin: "18px auto 0", padding: "0 clamp(22px,5vw,56px)", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, textAlign: "center" }}>
                {scan.notes.join(" ")}
              </p>
            )}

            {!scanning && scan && scan.opportunities.length > 0 && (
              <div style={{ padding: "16px clamp(22px,5vw,56px) 0" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 0 12px", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <Pill size={10} ls="0.14em">Radar</Pill>
                      <SCaps size={11} ls="0.14em" color={INK}>
                        {scan.opportunities.length} opportunities · ranked by signal-vs-coverage
                        {usedContext && <span style={{ color: INK55 }}> · personalised to your startup</span>}
                      </SCaps>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {quotaUi ? (
                        <SCaps size={10} ls="0.14em" color={INK55}>
                          {scan.usage.remaining} scan{scan.usage.remaining === 1 ? "" : "s"} left this month
                        </SCaps>
                      ) : scanNote ? (
                        <SCaps size={10} ls="0.14em" color={INK55}>{scanNote}</SCaps>
                      ) : null}
                      <Link href="/tools/signaliq/about" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: INK35, textDecoration: "underline", textDecorationColor: INK15 }}>
                        About the data
                      </Link>
                    </div>
                  </div>
                  {/* Legend — explains the band + gap labels at the point of use */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingBottom: 12, fontFamily: MONO, fontSize: 9, letterSpacing: ".04em", color: INK55 }}>
                    <span style={{ fontWeight: 700, color: INK70, textTransform: "uppercase", letterSpacing: ".10em" }}>How to read this:</span>
                    <span><strong style={{ color: INK }}>Score</strong> = signal vs. press coverage · Hot ≥80 · Worth a look 60–79 · Early 40–59 · Noise/late &lt;40</span>
                    <span style={{ color: INK35 }}>|</span>
                    <span><strong style={{ color: INK }}>Coverage gap</strong> = how little press exists yet (Wide = your best pitch window)</span>
                    <span style={{ color: INK35 }}>|</span>
                    <span>Wide gap means under-covered, not well-substantiated — check signal count before pitching</span>
                    <Link href="/tools/signaliq/about" style={{ fontWeight: 700, color: INK70, textDecoration: "underline", textDecorationColor: INK15 }}>Full methodology →</Link>
                  </div>
                  <p style={{ margin: "0 0 14px", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
                    Click any opportunity to see the angle, or jump straight to its asset pack.
                  </p>
                  <HRule style={{ marginBottom: 20 }} />
                </div>
                <div className="siq-results-wrap">
                  <div className="siq-cards-col">
                    <div className="siq-cards">
                      {rankedOpps.map((opp) => (
                        <OppCard
                          key={opp.id}
                          opp={opp}
                          onSelect={() => pickForAngle(opp)}
                          onGenerate={() => pickForPack(opp)}
                          save={saveFor(opp)}
                        />
                      ))}
                    </div>
                    {/* Compact newsletter CTA — after results (public wrapper only) */}
                    {quotaUi && !quotaUi.emailDone && (
                      <div style={{ marginTop: 28, maxWidth: 1100, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "14px 18px", border: `1px solid ${INK15}`, background: PAPER2 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 14, color: INK70, flex: 1, minWidth: 220 }}>
                          Get <strong>{EMAIL_SCANS} scans/month</strong> (up from {FREE_SCANS}) + PDF downloads + the full earned-media playbook — free.
                        </span>
                        <button type="button" onClick={quotaUi.onOpenGate} className="siq-scan-btn" style={{ fontSize: 12, padding: "12px 20px" }}>
                          Unlock →
                        </button>
                      </div>
                    )}
                    {quotaUi?.emailDone && (
                      <div style={{ marginTop: 28, maxWidth: 1100, padding: "12px 18px", border: `1px solid ${GREEN}`, background: hexA(GREEN, 0.05), fontFamily: SERIF, fontSize: 14, color: INK }}>
                        ✓ Unlocked, {EMAIL_SCANS} scans/month. Check your inbox.
                      </div>
                    )}
                  </div>
                  <SourcesSidebar />
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Stage 4: Angle ─────────────────────────────────────────────── */}
        {stage === 4 && selected && <AngleView opp={selected} />}

        {/* ── Stage 5: Pack ──────────────────────────────────────────────── */}
        {stage === 5 && selected && (
          <section style={{ padding: "18px clamp(22px,5vw,56px) 32px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <p style={{ margin: "0 0 6px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: INK55 }}>
                Step 5 of 5 · your asset pack
              </p>
              <h2 style={{ margin: "0 0 4px", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(20px,2.6vw,28px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: INK }}>
                {selected.headline}
              </h2>

              <div style={{ marginTop: 20 }}>
                <SectionMast n="02" label="Your asset pack" />
                {packing && (
                  <div style={{ padding: 30, textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70 }}>
                    Building your asset pack: brief, pitch angle, and reporter desks…
                  </div>
                )}
                {packError && !packing && (
                  <div style={{ padding: "16px", border: `1px solid ${RED}`, background: hexA(RED, 0.06), fontFamily: SERIF, fontSize: 14, color: INK, textAlign: "center" }}>
                    {packError}{" "}
                    {packUpgrade && (
                      <a href="/emos-platform" style={{ display: "inline-block", marginRight: 8, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: INK, textDecoration: "underline" }}>
                        Explore the EMOS platform →
                      </a>
                    )}
                    <button onClick={() => generatePack(selected)} className="siq-back" style={{ marginLeft: 8 }}>
                      Retry →
                    </button>
                  </div>
                )}
                {pack && !packing && (
                  <PackView
                    pack={pack}
                    onDownloadPDF={packActions?.onDownloadPDF ? downloadPDF : undefined}
                    downloadNote={quotaUi && !quotaUi.emailDone ? "First download asks for your email — one step, then it's yours." : null}
                    pressIqHref={packActions?.pressIqHref}
                    buildAssetHref={packActions?.buildAssetHref && pack ? packActions.buildAssetHref(selected, pack) : undefined}
                  />
                )}
              </div>

              {/* Save to EMOS from the pack stage (dashboard wrapper only) */}
              {onSaveOpportunity && pack && !packing && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6, maxWidth: 360 }}>
                  <button
                    onClick={() => { const s = saveFor(selected); if (s && !s.saved && !s.saving) s.onSave(); }}
                    disabled={savedIds.has(selected.id) || savingId === selected.id}
                    className="siq-save-btn"
                    style={{ margin: 0 }}
                  >
                    {savingId === selected.id ? "Saving…" : savedIds.has(selected.id) ? "✓ Saved to EMOS" : "Save to EMOS →"}
                  </button>
                  {saveErrors[selected.id] && (
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: RED, lineHeight: 1.4 }}>
                      ✗ {saveErrors[selected.id]}
                    </div>
                  )}
                </div>
              )}

              {/* Unlock CTA — opens the shared unified gate modal (public wrapper only) */}
              {quotaUi && (
                <div style={{ marginTop: 32 }}>
                  <UnlockCard done={quotaUi.emailDone} onOpen={quotaUi.onOpenGate} />
                </div>
              )}

              {belowPack}
            </div>
          </section>
        )}

        {/* Docked slot (public: the Turnstile widget) — in the page flow (not
            floating) so it never overlaps content on any screen size. */}
        {belowStages && (
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 32px" }}>
            {belowStages}
          </div>
        )}
      </div>

      <SiqWizardFooter
        stage={stage}
        onBack={goBack}
        backHidden={stage === 1 && !onExit}
        backLabel={stage === 1 ? exitLabel : "← Back"}
        onNext={goNext}
        nextLabel={footerNextLabel}
        nextDisabled={footerNextDisabled}
        onSkip={stage === 2 && !contextRequired ? () => { onCompanyContextChange(""); setStage(3); scrollTop(); runScan(""); } : undefined}
      />
    </>
  );
}
