"use client";

/**
 * PressIQToolCore — the shared PressIQ tool experience (Phase P6,
 * Unified-Gate-Freemium RFP v1.1 §7).
 *
 * ONE core, two thin wrappers:
 *   - app/tools/pressiq/page.tsx                     (public: intro + Turnstile + gate + PDF)
 *   - components/emostool/PressIQPlatformClient.tsx  (dashboard: Clerk chrome + Track + Score History)
 *
 * The step bar, the 2-step input form, live mechanics, the loading state and the
 * 4 result views (Score / Fixes / Breakdown / Evidence) all live here — moved
 * verbatim from the public page — so fixes land once and appear on both surfaces.
 *
 * Boundary rules (do not violate):
 *   - NO Turnstile code here. The public wrapper owns the widget and docks its
 *     container via `turnstileSlot`; it gates submission via `submitDisabled`.
 *   - NO gate/quota logic here. `quotaLine` / `emailUnlockNode` are display slots.
 *   - NO Clerk/persistence here. Saving/handoffs are wrapper concerns.
 *   - NO fetch URLs here. `api` is an injected transport returning { ok, data }.
 *   - Wrappers must render <style>{PIQ_CSS}</style> (see core-css.ts).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PLATFORMS,
  TIERS,
  WEIGHTS_V2,
} from "@/lib/pitch/config";
import { computeMetrics, resolveSubject, scoreLayer1 } from "@/lib/pitch/metrics";
import { EMPTY_BRAND, type BrandSignals, type Platform, type ScoreResponse } from "@/lib/pitch/types";
import { DARK, DARK_BD, GROT, INK, MONO, PAPER, PAPER2, SERIF, YEL } from "@/lib/tokens";
import {
  AMBER,
  DIMS,
  type DimKey,
  DimBarChart,
  DimBlock,
  FixCard,
  Gauge,
  LiveMechanics,
  LoadingPanel,
  RED,
  type Tab,
  TABS,
  TabNav,
  ra,
} from "./cards";

// ── Tool-specific colour (not in shared tokens) ────────────────────────────────
const DARK3 = "#221e17";

// ── Shared left-panel style atoms ─────────────────────────────────────────────
const LSEC: React.CSSProperties = { padding: "18px 22px", borderBottom: `1px solid ${DARK_BD}` };
const LSEC_LBL: React.CSSProperties = {
  fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".20em",
  textTransform: "uppercase", color: ra(PAPER, 0.5), marginBottom: 10, display: "block",
};
const LP_TEXTAREA: React.CSSProperties = {
  width: "100%", padding: "9px 11px", background: DARK3, border: `1px solid ${DARK_BD}`,
  fontFamily: GROT, fontSize: 12.5, color: PAPER, outline: "none", resize: "vertical", borderRadius: 0,
};
const LP_INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 11px", background: DARK3, border: `1px solid ${DARK_BD}`,
  fontFamily: GROT, fontSize: 12.5, color: PAPER, outline: "none", borderRadius: 0,
};
function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-block", padding: "5px 9px",
    border: `1px solid ${active ? YEL : DARK_BD}`, background: active ? YEL : "transparent",
    fontSize: 10.5, fontWeight: 600, cursor: "pointer",
    color: active ? DARK : ra(PAPER, 0.6), transition: "all .1s", fontFamily: GROT, margin: 2, borderRadius: 0,
  };
}

// Subtle "Clear" text button used on the two dark input steps. The tool never
// auto-wipes typed input; Clear lets the user reset a step's fields on demand.
const CLEAR_BTN: React.CSSProperties = {
  background: "none", border: "none", padding: 0, cursor: "pointer",
  fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".14em",
  textTransform: "uppercase", color: ra(PAPER, 0.5),
};

const BRAND_LABELS: { key: keyof BrandSignals; label: string }[] = [
  { key: "website",     label: "Personal website"  },
  { key: "bylines",     label: "Published bylines" },
  { key: "youtube",     label: "YouTube / video"   },
  { key: "speaking",    label: "Speaking history"  },
  { key: "caseStudies", label: "Case studies"      },
  { key: "linkedin",    label: "Active LinkedIn"   },
];

// ── public contract ───────────────────────────────────────────────────────────

/** Injected transport. The wrapper owns URLs, auth and Turnstile; it returns
 * `{ ok, data }` where `data` is the parsed JSON body (ScoreResponse on ok,
 * `{ error?, usage? }` otherwise). Throw for network failures. */
export interface PressIQCoreApi {
  score(body: Record<string, unknown>): Promise<{ ok: boolean; data: unknown }>;
}

export interface PressIQCoreProps {
  api: PressIQCoreApi;
  /** Seed values (dashboard prefills the journalist beat from ?beat/journalist/asset). */
  initial?: {
    query?: string;
    journalistBeat?: string;
    pitchMode?: "standalone" | "query";
    platform?: Platform;
    store?: boolean;
  };
  /** localStorage key for persisting UI prefs (platform/pitchMode/store). Public
   * passes "sia.pressiq.v2"; dashboard omits (no persistence). */
  persistKey?: string;
  /** Dashboard hides the in-card PressIQ masthead (it has its own header). */
  hideMasthead?: boolean;
  /** Public shows the "let SIA store this pitch" opt-in; dashboard hides it (it
   * always stores the user's own history server-side). Default true. */
  showStoreToggle?: boolean;
  /** Rendered under the Analyze button: public quota copy, or the dashboard note. */
  quotaLine?: React.ReactNode;
  /** Public docks its <div ref={turnstileRef}/> here (rendered in the pitch step). */
  turnstileSlot?: React.ReactNode;
  /** Public gates the Analyze button on the Turnstile token; dashboard leaves it enabled. */
  submitDisabled?: boolean;
  /** Fired when the internal step changes (public keys its Turnstile mount off this). */
  onStepChange?: (step: number) => void;
  /** PDF: public → gated modal→jsPDF; dashboard → ungated jsPDF. undefined hides the button. */
  pdfAction?: (result: ScoreResponse, ctx: { pitch: string; subject: string }) => void;
  /** Fired after a successful score (dashboard: enable Track + bump history counter). */
  onScored?: (
    result: ScoreResponse,
    ctx: { pitch: string; subject: string; query: string; pitchMode: "standalone" | "query" },
  ) => void;
  /** Public injects its (legacy) inline email-unlock form into the Evidence tab. */
  emailUnlockNode?: React.ReactNode;
  /** Public renders the EMOS CTA strip inside the Score tab (needs the result). */
  scoreTabCta?: (result: ScoreResponse) => React.ReactNode;
}

// ── Post-score panel (the 4 result views) ─────────────────────────────────────
function PostScorePanel({
  result, tab, setTab, onReset, pitchMode, onDownloadPdf, emailUnlockNode, scoreTabCta,
}: {
  result: ScoreResponse; tab: Tab; setTab: (t: Tab) => void; onReset: () => void;
  pitchMode: "standalone" | "query";
  onDownloadPdf?: () => void;
  emailUnlockNode?: React.ReactNode;
  scoreTabCta?: (result: ScoreResponse) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<Set<DimKey>>(new Set());
  const [showCalc, setShowCalc] = useState(false);
  const { composite, tier, areas, relevanceAssessed, strongestLine, topFixes, authenticityRisk } = result;

  const scoreMap: Record<string, number> = {};
  if (areas.relevance) scoreMap.relevance = areas.relevance.score;
  scoreMap.objective = areas.objective.score; scoreMap.checklist = areas.checklist.score;
  scoreMap.newsroomReady = areas.newsroomReady.score; scoreMap.storytelling = areas.emos.storytelling.score;
  scoreMap.neuromarketing = areas.emos.neuromarketing.score; scoreMap.personalBrand = areas.emos.personalBrand.score;

  const radarDims = relevanceAssessed ? DIMS : DIMS.filter(d => d.key !== "relevance");

  function areaFor(key: DimKey) {
    if (key === "relevance")      return areas.relevance ?? { score: 0 };
    if (key === "objective")      return areas.objective;
    if (key === "checklist")      return areas.checklist;
    if (key === "newsroomReady")  return areas.newsroomReady;
    if (key === "storytelling")   return areas.emos.storytelling;
    if (key === "neuromarketing") return areas.emos.neuromarketing;
    if (key === "personalBrand")  return areas.emos.personalBrand;
    return { score: 0 as number };
  }

  function toggleDim(key: DimKey) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }

  return (
    <div>
      {/* Sticky tab bar */}
      <div className="piq-tabs" role="tablist" aria-label="Score views">
        <div style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: ".12em", textTransform: "uppercase", color: ra(INK, 0.62), padding: "0 18px", display: "flex", alignItems: "center", borderRight: `1px solid ${ra(INK, 0.08)}`, marginRight: 4, whiteSpace: "nowrap" }}>
          View:
        </div>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} role="tab" aria-selected={tab === tb.id} className={`piq-tab${tab === tb.id ? " piq-tab-active" : ""}`}>
            {tb.label}
          </button>
        ))}
        {/* Always-visible "score another" so it isn't buried on the last tab. */}
        <button onClick={onReset} style={{ marginLeft: "auto", alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", marginRight: 8, background: INK, color: PAPER, border: "none", fontFamily: GROT, fontWeight: 800, fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", borderRadius: 0 }}>
          + Score another
        </button>
      </div>

      {/* ── Tab: Score ────────────────────────────────────────────────── */}
      {tab === "score" && (
        <div style={{ padding: "0 32px 28px" }}>
          <div style={{ textAlign: "center", padding: "32px 0 20px" }}>
            <Gauge score={composite} color={tier.color} />
            <div style={{ marginTop: 14 }}>
              <span style={{ display: "inline-block", padding: "5px 12px 6px", background: tier.color, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 8.5, letterSpacing: ".16em", textTransform: "uppercase" }}>
                {tier.badge.toUpperCase()} · {tier.label.toUpperCase()}
              </span>
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: INK, marginTop: 12, letterSpacing: "-.015em" }}>
              {composite >= 85 ? "Placement-grade." : composite >= 65 ? "Competitive: tighten it." : composite >= 40 ? "Real material, missing the system." : "This will get ignored."}
            </div>
          </div>

          {/* §5A — transparency: estimate note + "how your score is calculated" */}
          <div style={{ border: `1px solid ${ra(INK, 0.12)}`, background: ra(INK, 0.02), padding: "11px 14px", marginBottom: 16 }}>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, fontStyle: "italic", color: ra(INK, 0.62), lineHeight: 1.5 }}>
              This is an estimate, not a verdict. Your Mechanics score is exact: the AI-judged dimensions can shift by about &plusmn;2 points if you re-score. PressIQ rates a pitch&rsquo;s quality and readiness, not your odds of placement.
            </div>
            <button onClick={() => setShowCalc(v => !v)} aria-expanded={showCalc} style={{ marginTop: 8, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: ra(INK, 0.62) }}>
              {showCalc ? "− Hide how your score is calculated" : "+ How your score is calculated"}
            </button>
            {showCalc && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 12 }}>
                <div style={{ fontFamily: SERIF, fontSize: 12.5, color: ra(INK, 0.6), lineHeight: 1.55, marginBottom: 12 }}>
                  Your composite is a weighted blend of up to 7 dimensions. Mechanics is computed directly from your text; the other six are scored by an AI evaluator against published journalist research. Relevance carries the most weight, and if you don&rsquo;t add the journalist&rsquo;s query or beat, its weight is shared across the other dimensions.
                </div>
                {([
                  ["relevance", "Relevance"], ["checklist", "SIA 7-step checklist"], ["newsroomReady", "Newsroom-ready"],
                  ["objective", "Mechanics"], ["storytelling", "Storytelling"], ["neuromarketing", "Neuromarketing"], ["personalBrand", "Personal brand"],
                ] as [keyof typeof WEIGHTS_V2, string][])
                  .slice()
                  .sort((a, b) => WEIGHTS_V2[b[0]] - WEIGHTS_V2[a[0]])
                  .map(([k, label]) => (
                    <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "3px 0", fontFamily: SERIF, fontSize: 12.5, color: ra(INK, 0.7) }}>
                      <span style={{ fontFamily: MONO, fontWeight: 700, color: INK, width: 38 }}>{Math.round(WEIGHTS_V2[k] * 100)}%</span>
                      <span style={{ flex: 1 }}>{label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase", color: ra(INK, 0.6) }}>{k === "objective" ? "deterministic" : "AI-judged"}</span>
                    </div>
                  ))}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 10 }}>
                  {TIERS.map(t => (
                    <span key={t.badge} style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", background: t.color, padding: "2px 7px" }}>{t.min}-{t.max} {t.label}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!relevanceAssessed && (
            <div style={{ padding: "13px 16px", marginBottom: 18, border: `1px solid ${AMBER}`, background: "rgba(217,146,17,.05)", fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: ra(INK, 0.65) }}>
              {pitchMode === "query"
                ? "Scored without the journalist’s query, so relevance (the #1 driver of placement) wasn’t assessed. Add it for a full score."
                : "No journalist beat was provided, so relevance (the #1 driver of placement) wasn’t assessed. Add the journalist’s beat for a fuller score."}
            </div>
          )}
          {authenticityRisk?.flagged && (
            <div style={{ padding: "13px 16px", marginBottom: 18, border: `1px solid ${RED}`, background: "rgba(193,74,50,.04)" }}>
              <span style={{ display: "inline-block", padding: "3px 8px", background: RED, color: "#fff", fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>READS TEMPLATED</span>
              <div style={{ fontFamily: SERIF, fontSize: 13.5, color: ra(INK, 0.65) }}>{authenticityRisk.note || "This reads like a template anyone could send. Add a first-hand detail or a number only you have: 53% of journalists distrust generic, AI-sounding pitches."}</div>
            </div>
          )}

          {strongestLine && (
            <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 20, marginTop: 4 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 8 }}>YOUR STRONGEST LINE</div>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: INK, lineHeight: 1.5, borderLeft: `3px solid ${YEL}`, paddingLeft: 16 }}>&ldquo;{strongestLine}&rdquo;</div>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 22, marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62) }}>YOUR PITCH, BY DIMENSION</div>
              <div style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(INK, 0.72) }}>Full breakdown in 03 →</div>
            </div>
            <DimBarChart scores={scoreMap} dims={radarDims} />
          </div>

          {/* Scored Against */}
          <div style={{ borderTop: `1px solid ${ra(INK, 0.1)}`, paddingTop: 20, marginTop: 22 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 10 }}>SCORED AGAINST</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
              {["SIA 7-STEP CHECKLIST", "SIA 32-FACTOR SCORING SYSTEM", "EMOS FRAMEWORK"].map(s => (
                <span key={s} style={{ padding: "3px 7px", background: INK, fontFamily: GROT, fontSize: 8, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: YEL }}>{s}</span>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Cision State of the Media 2026", "Muck Rack State of Journalism 2026", "Propel Media Barometer", "Backlinko Journalist Outreach", "Fractl Journalist Survey", "Boomerang Email Study (40M)"].map(s => (
                <span key={s} style={{ padding: "3px 7px", border: `1px solid ${ra(INK, 0.1)}`, fontFamily: MONO, fontSize: 7, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: ra(INK, 0.62) }}>{s}</span>
              ))}
            </div>
          </div>

          <TabNav current={tab} setTab={setTab} onReset={onReset} />

          {scoreTabCta?.(result)}
        </div>
      )}

      {/* ── Tab: Top Fixes ───────────────────────────────────────────── */}
      {tab === "fixes" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 18 }}>THE 3 FIXES THAT MOVE YOUR SCORE MOST</div>
          {topFixes.map((f, i) => <FixCard key={i} rank={i + 1} fix={f} />)}
          <TabNav current={tab} setTab={setTab} onReset={onReset} />
        </div>
      )}

      {/* ── Tab: Breakdown ───────────────────────────────────────────── */}
      {tab === "breakdown" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 18 }}>FULL BREAKDOWN</div>
          {DIMS.filter(d => d.key !== "relevance" || relevanceAssessed).map(dim => {
            const area = areaFor(dim.key);
            return <DimBlock key={dim.key} dim={dim} score={area.score} analysis={"analysis" in area ? area.analysis : undefined} subSignals={"subSignals" in area ? area.subSignals : undefined} evidenceKeys={"evidence" in area ? area.evidence : undefined} expanded={expanded.has(dim.key)} onToggle={() => toggleDim(dim.key)} />;
          })}
          <TabNav current={tab} setTab={setTab} onReset={onReset} />
        </div>
      )}

      {/* ── Tab: Evidence ────────────────────────────────────────────── */}
      {tab === "evidence" && (
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 14 }}>THE RESEARCH BEHIND YOUR SCORE</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: ra(INK, 0.6), lineHeight: 1.6, marginBottom: 22 }}>
            Scored against published journalist research: Cision &amp; Muck Rack 2026, Propel, Backlinko, Fractl, Boomerang. Open any dimension in the Breakdown tab to see the exact figures and sources.
          </div>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".22em", textTransform: "uppercase", color: ra(INK, 0.62), marginBottom: 10 }}>WHY THIS IS WORTH MORE IN 2026</div>
          <div style={{ fontFamily: SERIF, fontSize: 14.5, color: ra(INK, 0.6), lineHeight: 1.6, marginBottom: 24 }}>
            In an AI-answer world you don&rsquo;t just rank: you get cited. AI engines lean on earned media (Muck Rack: ~82% of AI citations come from earned coverage), and brand mentions out-predict backlinks for AI-Overview visibility ~3× (Ahrefs, 75k brands). The placement this pitch is aiming for is exactly that kind of citation, so a stronger pitch compounds.
          </div>

          {/* PDF report download */}
          {onDownloadPdf && (
            <div style={{ padding: "16px 18px", border: `1px solid ${ra(INK, 0.15)}`, background: PAPER2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK, marginBottom: 3 }}>Download PDF report</div>
                <div style={{ fontFamily: SERIF, fontSize: 13, color: ra(INK, 0.62) }}>Cover, score, top fixes, full breakdown, EMOS recommendations.</div>
              </div>
              <button onClick={onDownloadPdf} style={{ padding: "10px 18px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", border: "none", cursor: "pointer", whiteSpace: "nowrap", borderRadius: 0 }}>
                Download report ↓
              </button>
            </div>
          )}

          {emailUnlockNode}

          <TabNav current={tab} setTab={setTab} onReset={onReset} />
        </div>
      )}
    </div>
  );
}

// ── Main core component ────────────────────────────────────────────────────────
export default function PressIQToolCore({
  api, initial, persistKey, hideMasthead, showStoreToggle = true,
  quotaLine, turnstileSlot, submitDisabled, onStepChange,
  pdfAction, onScored, emailUnlockNode, scoreTabCta,
}: PressIQCoreProps) {
  const [pitch,    setPitch]    = useState("");
  const [query,    setQuery]    = useState(initial?.query ?? "");
  const [subject,  setSubject]  = useState("");
  const [platform, setPlatform] = useState<Platform>(initial?.platform ?? "haro");
  const [brand,    setBrand]    = useState<BrandSignals>(EMPTY_BRAND);
  const [store,    setStore]    = useState(initial?.store ?? false);
  const [pitchMode, setPitchMode] = useState<"standalone" | "query">(initial?.pitchMode ?? "standalone");
  const [journalistBeat, setJournalistBeat] = useState(initial?.journalistBeat ?? "");
  const [view,     setView]     = useState<"pre" | "loading" | "post">("pre");
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [result,   setResult]   = useState<ScoreResponse | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  // P4: the server sets `upgrade: true` on an email-tier 429 (public route only)
  // — render the EMOS platform CTA next to the error. Never set on the dashboard.
  const [errorUpgrade, setErrorUpgrade] = useState(false);
  const [tab,      setTab]      = useState<Tab>("score");

  // localStorage prefs (platform/pitchMode/store) — wrapper opts in via persistKey.
  // Pitch/query/subject/beat/brand are per-pitch and intentionally NOT persisted.
  useEffect(() => {
    if (!persistKey) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const d = JSON.parse(raw) as Record<string, unknown>;
        if (typeof d.platform === "string") setPlatform(d.platform as Platform);
        if (d.pitchMode === "standalone" || d.pitchMode === "query") setPitchMode(d.pitchMode as "standalone" | "query");
        if (typeof d.store === "boolean") setStore(d.store);
      }
    } catch { /* ignore */ }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [persistKey]);
  useEffect(() => {
    if (!persistKey) return;
    try { localStorage.setItem(persistKey, JSON.stringify({ platform, pitchMode, store })); } catch { /* ignore */ }
  }, [persistKey, platform, pitchMode, store]);

  // Standalone pitches don't go through a source-request platform: keep the
  // platform value in sync with pitchMode ("direct" while standalone).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (pitchMode === "standalone") setPlatform("direct");
    else setPlatform(p => (p === "direct" ? "haro" : p));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pitchMode]);

  // Report the step whenever the input form is on screen so the public wrapper
  // can (re)arm its Turnstile widget — including when the form comes back after a
  // score (view returns to "pre").
  //
  // The callback is held in a ref and kept OUT of the effect deps on purpose. The
  // public wrapper passes an inline onStepChange that bumps its `tsArm` counter;
  // that state update re-renders the wrapper, which hands us a brand-new
  // onStepChange identity every render. With onStepChange as a dep the effect
  // re-runs on that new identity, calls it again, bumps tsArm again — an infinite
  // render loop that froze the pitch step (this is what commit 89331638 tripped
  // and 02666dc reverted). Keying only on [formStep, view] fires exactly once per
  // real step change, which is all the re-arm needs.
  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (view === "pre") onStepChangeRef.current?.(formStep); }, [formStep, view]);

  const live = useMemo(() => {
    if (pitch.trim().length < 15) return null;
    return scoreLayer1(computeMetrics(pitch, subject));
  }, [pitch, subject]);

  const subjectPlaceholder = resolveSubject(pitch, subject) || "Re: [Query] - …";
  const canAnalyze = pitch.trim().length >= 40 && view !== "loading" && !submitDisabled;

  async function analyze() {
    if (!canAnalyze) return;
    setError(null); setErrorUpgrade(false); setView("loading"); setResult(null); setTab("score");
    const effectiveQuery = pitchMode === "standalone" ? journalistBeat : query;
    try {
      const { ok, data } = await api.score({
        pitch, query: effectiveQuery, subject, platform, brandSignals: brand, store, pitchMode,
      });
      if (!ok) {
        setError((data as { error?: string })?.error || "Something went wrong scoring your pitch.");
        setErrorUpgrade(Boolean((data as { upgrade?: boolean })?.upgrade));
        setView("pre");
      } else {
        const scored = data as ScoreResponse;
        setResult(scored);
        setView("post");
        onScored?.(scored, { pitch, subject: resolveSubject(pitch, subject), query: effectiveQuery, pitchMode });
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
      }
    } catch {
      setError("Network error. Please try again.");
      setView("pre");
    }
  }

  // "Score another pitch" — return to the pitch step; KEEP the last result so the
  // Results view stays reachable (no forced re-score just to see it again).
  function reset() { setView("pre"); setError(null); setErrorUpgrade(false); setFormStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }

  // Free navigation between Pitch context / Your pitch / Results — never drops the
  // typed input OR the last result.
  function goToStep(n: 1 | 2) {
    if (view === "loading") return;
    setView("pre");
    setFormStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goToResults() {
    if (result) { setView("post"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  // Per-step "Clear" — wipe just that step's typed input on demand. Scoring
  // another pitch keeps your data unless you explicitly clear it here.
  function clearContext() { setJournalistBeat(""); setQuery(""); }
  function clearPitch()   { setPitch(""); setSubject(""); }

  return (
    <>
      {/* ── Step bar ────────────────────────────────────────────────── */}
      <nav className="piq-step-bar">
        <span className={`piq-step ${view !== "post" && formStep === 1 ? "active" : "past"}`} onClick={() => goToStep(1)}>
          <span className="piq-step-no">{view !== "post" && formStep === 1 ? "1" : "✓"}</span> Pitch context
        </span>
        <span className="piq-step-connector" />
        <span className={`piq-step ${view !== "post" && formStep === 2 ? "active" : "past"}`} onClick={() => goToStep(2)}>
          <span className="piq-step-no">{view === "post" ? "✓" : "2"}</span> Your pitch
        </span>
        <span className="piq-step-connector" />
        <span className={`piq-step ${view === "post" ? "active" : result ? "past" : ""}`} onClick={goToResults}>
          <span className="piq-step-no">3</span> Results
        </span>
      </nav>

      <main className="piq-col">
        {/* ── Step 1: pitch context ─────────────────────────────────── */}
        {view === "pre" && formStep === 1 && (
          <section className="piq-form-card">
            {!hideMasthead && (
              <div style={{ padding: "22px 22px 16px", borderBottom: `1px solid ${DARK_BD}` }}>
                <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: PAPER, letterSpacing: "-.025em", lineHeight: 1 }}>
                  Press<em style={{ color: YEL, fontStyle: "italic" }}>IQ</em>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: ra(PAPER, 0.50), marginTop: 8, lineHeight: 1.7 }}>
                  Journalist pitch score<br />by Syed Irfan Ajmal
                </div>
              </div>
            )}

            {/* Pitch type toggle */}
            <div style={LSEC}>
              <span style={LSEC_LBL}>Pitch type</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button onClick={() => setPitchMode("standalone")} style={chipStyle(pitchMode === "standalone")}>Standalone outreach</button>
                <button onClick={() => setPitchMode("query")} style={chipStyle(pitchMode === "query")}>Answering a query</button>
              </div>
              <em style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(PAPER, 0.65), lineHeight: 1.5, display: "block", marginTop: 10 }}>
                {pitchMode === "standalone"
                  ? "Proactive pitch to a journalist you’ve targeted. Relevance is scored against their known beat."
                  : "Response to a HARO / Qwoted / Featured source request. Relevance is scored against their specific ask."}
              </em>
            </div>

            {/* Journalist context (beat or query) */}
            <div style={{ ...LSEC, borderBottom: "none" }}>
              {pitchMode === "standalone" ? (
                <>
                  <span style={LSEC_LBL}>Journalist&rsquo;s beat <span style={{ color: ra(PAPER, 0.45), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· optional, what topics they cover</span></span>
                  <textarea value={journalistBeat} onChange={e => setJournalistBeat(e.target.value)} placeholder="e.g. Covers SaaS growth, founder stories, and future-of-work data. Writes for TechCrunch’s Startups desk." className="piq-field" style={{ ...LP_TEXTAREA, minHeight: 72 }} />
                </>
              ) : (
                <>
                  <span style={LSEC_LBL}>Journalist&rsquo;s query <span style={{ color: ra(PAPER, 0.45), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· the source request you&rsquo;re answering</span></span>
                  <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="Paste the HARO / Qwoted / Featured query here…" className="piq-field" style={{ ...LP_TEXTAREA, minHeight: 72 }} />
                </>
              )}
            </div>

            <div style={{ padding: "18px 22px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <button onClick={clearContext} style={CLEAR_BTN}>Clear</button>
              <button onClick={() => setFormStep(2)} style={{ padding: "12px 24px", border: "none", background: YEL, color: DARK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", borderRadius: 0 }}>
                Next: your pitch →
              </button>
            </div>
          </section>
        )}

        {/* ── Step 2: your pitch ────────────────────────────────────── */}
        {view === "pre" && formStep === 2 && (
          <>
            <section className="piq-form-card">
              <div style={LSEC}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={LSEC_LBL}>Your pitch</span>
                  <button onClick={clearPitch} style={CLEAR_BTN}>Clear</button>
                </div>
                <textarea value={pitch} onChange={e => setPitch(e.target.value)} placeholder="Paste your full pitch here…" className="piq-field" style={{ ...LP_TEXTAREA, minHeight: 140 }} />
              </div>

              <div style={LSEC}>
                <span style={LSEC_LBL}>Subject line <span style={{ color: ra(PAPER, 0.45), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· optional, else parsed from line 1</span></span>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder={subjectPlaceholder} className="piq-field" style={{ ...LP_INPUT, marginBottom: 0 }} />
              </div>

              {pitchMode === "query" ? (
                <div style={LSEC}>
                  <span style={LSEC_LBL}>Platform</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {PLATFORMS.filter(p => p.id !== "direct").map(p => <button key={p.id} onClick={() => setPlatform(p.id)} style={chipStyle(platform === p.id)}>{p.label}</button>)}
                  </div>
                </div>
              ) : (
                <div style={LSEC}>
                  <span style={LSEC_LBL}>Platform</span>
                  <em style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(PAPER, 0.65), lineHeight: 1.5, display: "block" }}>
                    Scored as direct outreach (email, social, DM). Professional tone assumed. Switch to &ldquo;Answering a query&rdquo; on the previous step if you&rsquo;re responding to a HARO / Qwoted / Featured request instead.
                  </em>
                </div>
              )}

              <div style={LSEC}>
                <span style={LSEC_LBL}>Your authority signals <span style={{ color: ra(PAPER, 0.45), letterSpacing: ".08em", fontSize: 7.5, fontWeight: 400 }}>· for the personal-brand score</span></span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {BRAND_LABELS.map(({ key, label }) => (
                    <button key={key} onClick={() => setBrand(b => ({ ...b, [key]: !b[key] }))} style={chipStyle(brand[key])}>{label}</button>
                  ))}
                </div>
                <em style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: ra(PAPER, 0.65), lineHeight: 1.5, display: "block", marginTop: 10 }}>
                  Selecting these doesn&rsquo;t add points on its own. Your pitch text still has to show the proof (a link, a named outlet, a mention of a talk) for it to count. Only affects Personal Branding, the smallest-weighted of your 7 score dimensions.
                </em>
              </div>

              <div style={{ ...LSEC, borderBottom: "none" }}>
                {showStoreToggle && (
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14, cursor: "pointer" }}>
                    <input type="checkbox" checked={store} onChange={e => setStore(e.target.checked)} style={{ marginTop: 3, accentColor: YEL }} />
                    <span style={{ fontFamily: SERIF, fontSize: 11.5, color: ra(PAPER, 0.65), lineHeight: 1.4 }}>Let SIA store this pitch (anonymised) to improve the tool.</span>
                  </label>
                )}
                {turnstileSlot}
                {error && (
                  <div style={{ marginBottom: 12, padding: "10px 12px", border: `1px solid ${ra(AMBER, 0.5)}`, background: ra(AMBER, 0.08), fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: PAPER, lineHeight: 1.4 }}>
                    {error}
                    {errorUpgrade && (
                      <a href="/emos-platform" style={{ display: "inline-block", marginLeft: 8, fontFamily: GROT, fontStyle: "normal", fontWeight: 800, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: YEL, textDecoration: "underline" }}>
                        Explore the EMOS platform →
                      </a>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setFormStep(1)} style={{ padding: "14px 18px", border: `1px solid ${ra(PAPER, 0.3)}`, background: "transparent", color: ra(PAPER, 0.75), fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}>
                    ← Back
                  </button>
                  <button onClick={analyze} disabled={!canAnalyze} style={{ flex: 1, padding: 14, border: "none", background: canAnalyze ? YEL : ra(YEL, 0.35), color: canAnalyze ? DARK : ra(DARK, 0.4), fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", cursor: canAnalyze ? "pointer" : "not-allowed", transition: "opacity .12s", borderRadius: 0 }}>
                    Analyze pitch →
                  </button>
                </div>
                {quotaLine && (
                  <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 7.5, fontWeight: 600, letterSpacing: ".10em", textTransform: "uppercase", color: ra(PAPER, 0.6), textAlign: "center", lineHeight: 1.9 }}>
                    {quotaLine}
                  </div>
                )}
              </div>
            </section>

            <LiveMechanics live={live} />
          </>
        )}

        {view === "loading" && <LoadingPanel />}
        {view === "post" && result && (
          <PostScorePanel
            result={result} tab={tab} setTab={setTab} onReset={reset} pitchMode={pitchMode}
            onDownloadPdf={pdfAction ? () => pdfAction(result, { pitch, subject: resolveSubject(pitch, subject) }) : undefined}
            emailUnlockNode={emailUnlockNode}
            scoreTabCta={scoreTabCta}
          />
        )}
      </main>
    </>
  );
}
