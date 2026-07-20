"use client";

// src/components/emos-platform/FactcheckIQClient.tsx
// FactcheckIQ | Phase 4.5 dashboard client.
// Talks to the existing async backend: POST /api/emos-platform/factcheck/start
// then polls GET /api/emos-platform/factcheck/status?runId=... about every 2s.
// The status route returns RAW Supabase rows (snake_case columns; camelCase only
// inside the jsonb blobs progress/flags/verdict_counts/sources), so the wire
// interfaces below mirror the DB columns exactly.
//
// Phase 4.5 additions:
// - Claims are stored as 'pending' rows at extraction time, so the running view
//   shows the real claim list within seconds and flips each card to its verdict
//   live as verification lands.
// - Count-based time estimate: the wait is framed by how many claims were found.
// - Claim-based quota copy (monthly claim allowance replaces the audit cap).
//
// Client copy contains NO em-dashes and NO en-dashes (repo convention: use , : or |).

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ToolPipelineFooter } from "@/components/tools/ToolPipelineFooter";
import { SCaps, DoubleRule } from "@/components/bureau/primitives";
import {
  PAPER,
  PAPER2,
  INK,
  INK70,
  INK55,
  INK35,
  INK15,
  YEL,
  YEL2,
  GROT,
  SERIF,
  MONO,
} from "@/lib/tokens";

// success / caution / danger accents (match the FactcheckIQ teaser page;
// GREEN is not in tokens.ts, it is an inline success color used across the site)
const GREEN = "#3e6b45";
const AMBER = "#9c7414";
const RED = "#9b2c2c";

/* -------------------------------------------------------------------------- */
/* wire types (raw rows from the status route)                                 */
/* -------------------------------------------------------------------------- */

type Verdict =
  | "verified"
  | "partly_accurate"
  | "misleading"
  | "unverifiable"
  | "inaccurate"
  | "fabricated";
type ClaimWireStatus = "pending" | "checked" | "skipped" | "check_failed";
type Mode = "citation" | "full";
type InputKind = "paste" | "markdown" | "url";
type RunWireStatus = "queued" | "running" | "done" | "error";

interface WireSource {
  url: string;
  tier: number;
  quote: string;
  publisher?: string;
  as_of?: string;
}
interface WireClaim {
  id: string;
  claim_text: string;
  claim_type: string | null;
  section: string | null;
  risk: string | null;
  status: ClaimWireStatus;
  verdict: Verdict | null;
  sources: WireSource[] | null;
  source_url: string | null;
  source_tier: number | null;
  evidence: string | null;
  note: string | null;
}
interface WireProgress {
  phase: string;
  claimsDone: number;
  claimsTotal: number;
}
interface WireVerdictCounts {
  verified: number;
  partly_accurate: number;
  misleading: number;
  unverifiable: number;
  inaccurate: number;
  fabricated: number;
}
interface WireConsistencyFinding {
  claimIds: [string, string];
  note: string;
}
interface WireFlags {
  injectionAttempts?: string[];
  skippedClaims?: number;
  fetchFailures?: string[];
  checkIncomplete?: number;
  quotaLimited?: number;
  consistencyFindings?: WireConsistencyFinding[];
}
interface WireRun {
  id: string;
  title: string | null;
  mode: Mode;
  input_type: string;
  status: RunWireStatus;
  progress: WireProgress | null;
  verdict_counts: WireVerdictCounts | null;
  readiness: string | null;
  flags: WireFlags | null;
  report_md: string | null;
  cost_cents: number | null;
  searches_used: number | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}
interface WireHistoryRow {
  id: string;
  title: string | null;
  mode: Mode;
  status: string;
  readiness: string | null;
  created_at: string;
  completed_at: string | null;
}
interface WireQuota {
  cap: number;
  used: number;
  remaining: number;
  periodStart: string;
  periodResetsOn: string;
  blocked: boolean;
}

/* -------------------------------------------------------------------------- */
/* constants                                                                   */
/* -------------------------------------------------------------------------- */

const START_URL = "/api/emos-platform/factcheck/start";
const STATUS_URL = "/api/emos-platform/factcheck/status";
const POLL_MS = 2000;

/** Claims verified in parallel server-side (mirrors config.VERIFY_CONCURRENCY). */
const VERIFY_LANES = 4;

const VERDICT_ORDER: Verdict[] = [
  "verified",
  "partly_accurate",
  "misleading",
  "unverifiable",
  "inaccurate",
  "fabricated",
];

const VERDICT_META: Record<Verdict, { label: string; bg: string; fg: string }> = {
  verified: { label: "Verified", bg: GREEN, fg: PAPER },
  partly_accurate: { label: "Partly accurate", bg: "#e0a21a", fg: INK },
  misleading: { label: "Misleading", bg: AMBER, fg: PAPER },
  unverifiable: { label: "Unverifiable", bg: "rgba(26,20,16,.45)", fg: PAPER },
  inaccurate: { label: "Inaccurate", bg: RED, fg: PAPER },
  fabricated: { label: "Fabricated", bg: "#7a1f1f", fg: PAPER },
};

const PHASE_LABEL: Record<string, string> = {
  queued: "Queued",
  intake: "Reading input",
  extract: "Finding claims",
  citation_gate: "Checking citations and links",
  verify: "Verifying claims against live sources",
  done: "Finishing",
};

/** The verification stack shown while a run works. Mirrors the public teaser. */
const METHOD_STACK = [
  "Crossref",
  "OpenAlex",
  "DOAJ",
  "Retraction Watch",
  "Live web search",
  "Two-source rule",
];

const MODE_COPY: Record<Mode, { title: string; does: string; doesNot: string }> = {
  citation: {
    title: "Citation and link check",
    does: "Checks that links resolve and citations are real: DOIs exist and match the cited paper, journals are legitimate, and papers are not retracted.",
    doesNot: "Does not check whether any statistic, quote, or fact is actually true. Near free.",
  },
  full: {
    title: "Full audit",
    does: "Verifies citations, statistics, quotes, and facts against independent live sources, one live search per claim.",
    doesNot: "Takes minutes, not seconds, and spends from your organization's monthly claim allowance.",
  },
};

const CHECKED_LINE: Record<Mode, { checked: string; notChecked?: string }> = {
  citation: {
    checked:
      "Links resolve, DOIs exist and match the cited paper, journals are legitimate, and papers are not retracted.",
    notChecked:
      "Whether any statistic, quote, or fact is actually true. Run a full audit before publishing.",
  },
  full: {
    checked:
      "Citations, statistics, quotes, and facts, verified against independent live sources.",
  },
};

/* -------------------------------------------------------------------------- */
/* small helpers                                                               */
/* -------------------------------------------------------------------------- */

function hostOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u.length > 42 ? u.slice(0, 42) + "..." : u;
  }
}

function fmtElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

/**
 * Count-based wait estimate for a full audit. Claims verify VERIFY_LANES at a
 * time at roughly one minute each, plus intake and reporting overhead. Shown as
 * a range on purpose: honest, and it frames the wait as depth, not slowness.
 */
function estimateMinutes(claimCount: number): { low: number; high: number } {
  const waves = Math.max(1, Math.ceil(claimCount / VERIFY_LANES));
  return { low: waves, high: Math.ceil(waves * 1.5) + 1 };
}

function chip(bg: string, fg: string, border?: string): CSSProperties {
  return {
    display: "inline-block",
    padding: "3px 8px 4px",
    background: bg,
    color: fg,
    border: border ? `1px solid ${border}` : undefined,
    fontFamily: GROT,
    fontWeight: 800,
    fontSize: 9.5,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
}

function readinessAccent(readiness: string | null): string {
  if (!readiness) return INK35;
  const r = readiness.toLowerCase();
  if (r.startsWith("not publishable") || r.startsWith("not publish-ready")) return RED;
  if (r.startsWith("publish-ready") || r.includes("passed with no issues")) return GREEN;
  return AMBER;
}

/* -------------------------------------------------------------------------- */
/* presentational bits                                                         */
/* -------------------------------------------------------------------------- */

function ClaimBadge({ claim, live }: { claim: WireClaim; live?: boolean }) {
  if (claim.status === "pending") {
    return (
      <span className={live ? "fciq-pulse" : undefined} style={chip("transparent", INK55, INK35)}>
        {live ? "Checking" : "Pending"}
      </span>
    );
  }
  if (claim.status === "check_failed") {
    return (
      <span style={chip(INK15, INK70, INK35)} title="This claim was not assessed. Retry to check it.">
        Check incomplete
      </span>
    );
  }
  if (claim.status === "skipped") {
    return (
      <span style={chip("transparent", INK55, INK35)} title={claim.note ?? "Not checked in this run."}>
        Not checked
      </span>
    );
  }
  if (claim.verdict) {
    const m = VERDICT_META[claim.verdict];
    return <span style={chip(m.bg, m.fg)}>{m.label}</span>;
  }
  return <span style={chip("transparent", INK55, INK35)}>Pending</span>;
}

function labelBtnStyle(active: boolean): CSSProperties {
  return {
    padding: "7px 14px",
    background: active ? INK : "transparent",
    color: active ? PAPER : INK55,
    border: `1px solid ${active ? INK : INK35}`,
    fontFamily: GROT,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    cursor: "pointer",
  };
}

/* -------------------------------------------------------------------------- */
/* main component                                                              */
/* -------------------------------------------------------------------------- */

export default function FactcheckIQClient() {
  const [inputKind, setInputKind] = useState<InputKind>("paste");
  const [mode, setMode] = useState<Mode>("citation");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const [view, setView] = useState<"form" | "running" | "report">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [run, setRun] = useState<WireRun | null>(null);
  const [claims, setClaims] = useState<WireClaim[]>([]);

  const [history, setHistory] = useState<WireHistoryRow[]>([]);
  const [quota, setQuota] = useState<WireQuota | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRunId = useRef<string | null>(null);

  // Elapsed-time ticker for the running view (1s resolution, only while running).
  const [nowTick, setNowTick] = useState<number>(Date.now());
  useEffect(() => {
    if (view !== "running") return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [view]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
    activeRunId.current = null;
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(STATUS_URL, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.runs)) setHistory(data.runs as WireHistoryRow[]);
      if (data?.quota) setQuota(data.quota as WireQuota);
    } catch {
      /* history is best-effort */
    }
  }, []);

  useEffect(() => {
    loadHistory();
    return () => stopPolling();
  }, [loadHistory, stopPolling]);

  const pollOnce = useCallback(
    async (runId: string) => {
      try {
        const res = await fetch(`${STATUS_URL}?runId=${encodeURIComponent(runId)}`, { cache: "no-store" });
        if (res.status === 404) {
          if (activeRunId.current === runId) {
            setError("That run could not be found.");
            setView("form");
          }
          stopPolling();
          return;
        }
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { run: WireRun; claims: WireClaim[] };
        if (activeRunId.current !== runId) return; // superseded by a newer run
        setRun(data.run);
        setClaims(Array.isArray(data.claims) ? data.claims : []);
        if (data.run.status === "done") {
          setView("report");
          stopPolling();
          loadHistory();
          return;
        }
        if (data.run.status === "error") {
          setError(data.run.error || "The run failed.");
          setView("report");
          stopPolling();
          loadHistory();
          return;
        }
        pollRef.current = setTimeout(() => pollOnce(runId), POLL_MS);
      } catch {
        if (activeRunId.current !== runId) return;
        pollRef.current = setTimeout(() => pollOnce(runId), POLL_MS);
      }
    },
    [loadHistory, stopPolling],
  );

  const fullBlocked = mode === "full" && !!quota && quota.blocked;

  const submit = useCallback(async () => {
    setError(null);
    const hasInput = inputKind === "url" ? url.trim().length > 0 : text.trim().length > 0;
    if (!hasInput) {
      setError(inputKind === "url" ? "Enter a URL to check." : "Paste some text to check.");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        mode,
        inputType: inputKind,
        title: title.trim() || undefined,
      };
      if (inputKind === "url") body.url = url.trim();
      else body.text = text;

      const res = await fetch(START_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.quota) setQuota(data.quota as WireQuota);
        setError((data && data.error) || `Could not start the check (status ${res.status}).`);
        setSubmitting(false);
        return;
      }
      const runId = data.runId as string;
      if (data?.quota) setQuota(data.quota as WireQuota);
      activeRunId.current = runId;
      setRun({
        id: runId,
        title: title.trim() || null,
        mode,
        input_type: inputKind,
        status: "queued",
        progress: { phase: "queued", claimsDone: 0, claimsTotal: 0 },
        verdict_counts: null,
        readiness: null,
        flags: null,
        report_md: null,
        cost_cents: null,
        searches_used: null,
        error: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      });
      setClaims([]);
      setView("running");
      setSubmitting(false);
      pollRef.current = setTimeout(() => pollOnce(runId), POLL_MS);
    } catch {
      setError("Network error starting the check. Please try again.");
      setSubmitting(false);
    }
  }, [inputKind, url, text, mode, title, pollOnce]);

  const reopen = useCallback(
    async (row: WireHistoryRow) => {
      setError(null);
      stopPolling();
      setShowRaw(false);
      setView("running");
      try {
        const res = await fetch(`${STATUS_URL}?runId=${encodeURIComponent(row.id)}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError((data && data.error) || "Could not open that run.");
          setView("form");
          return;
        }
        const r = data.run as WireRun;
        setRun(r);
        setClaims(Array.isArray(data.claims) ? data.claims : []);
        if (r.status === "queued" || r.status === "running") {
          activeRunId.current = r.id;
          pollRef.current = setTimeout(() => pollOnce(r.id), POLL_MS);
          setView("running");
        } else {
          setView("report");
        }
      } catch {
        setError("Could not open that run.");
        setView("form");
      }
    },
    [pollOnce, stopPolling],
  );

  const newRun = useCallback(() => {
    stopPolling();
    setRun(null);
    setClaims([]);
    setError(null);
    setShowRaw(false);
    setView("form");
  }, [stopPolling]);

  const copyMarkdown = useCallback(async () => {
    if (!run?.report_md) return;
    try {
      await navigator.clipboard.writeText(run.report_md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy to clipboard. Open the raw view and copy manually.");
    }
  }, [run]);

  /* ---------------------------------------------------------------------- */
  /* render helpers                                                          */
  /* ---------------------------------------------------------------------- */

  const sectionLabel = (t: string) => (
    <div style={{ marginBottom: 12 }}>
      <DoubleRule />
      <div style={{ paddingTop: 8 }}>
        <SCaps size={11} ls="0.2em">{t}</SCaps>
      </div>
    </div>
  );

  const quotaLine = () => {
    if (!quota) return null;
    const out = quota.remaining <= 0;
    return (
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: out ? YEL2 : "rgba(241,235,222,.72)",
        }}
      >
        {quota.remaining} / {quota.cap} claims left
      </span>
    );
  };

  const renderForm = () => (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: SERIF, fontSize: "clamp(24px,3vw,34px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Verify before you publish
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: INK70, maxWidth: 640, margin: 0 }}>
          Paste a draft or point at a URL. FactcheckIQ splits it into individually checkable claims, traces every
          statistic, quote, and citation to a live source, and grades each one, so you can catch fabricated references
          and unsourced numbers before they ship.
        </p>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.5, color: INK55, maxWidth: 640, margin: "10px 0 0" }}>
          Anyone can glance at a claim and say it looks fine. Reading the actual source takes longer. That is the
          difference a full audit buys you: expect minutes, not seconds, and more claims means more minutes.
        </p>
      </div>

      {sectionLabel("Input")}

      <input
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        style={{
          width: "100%",
          padding: "10px 12px",
          marginBottom: 12,
          background: PAPER2,
          border: `1px solid ${INK15}`,
          fontFamily: SERIF,
          fontSize: 15,
          color: INK,
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {(["paste", "markdown", "url"] as InputKind[]).map((k) => (
          <button key={k} onClick={() => setInputKind(k)} style={labelBtnStyle(inputKind === k)}>
            {k === "url" ? "URL" : k}
          </button>
        ))}
      </div>

      {inputKind === "url" ? (
        <input
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          style={{
            width: "100%",
            padding: "12px",
            background: PAPER2,
            border: `1px solid ${INK15}`,
            fontFamily: MONO,
            fontSize: 13,
            color: INK,
            boxSizing: "border-box",
          }}
        />
      ) : (
        <textarea
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          placeholder={inputKind === "markdown" ? "Paste Markdown here..." : "Paste the text to check here..."}
          rows={12}
          style={{
            width: "100%",
            padding: "14px",
            background: PAPER2,
            border: `1px solid ${INK15}`,
            fontFamily: inputKind === "markdown" ? MONO : SERIF,
            fontSize: 14,
            lineHeight: 1.55,
            color: INK,
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      )}

      <div style={{ height: 24 }} />
      {sectionLabel("Mode")}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {(["citation", "full"] as Mode[]).map((m) => {
          const active = mode === m;
          const blockedCard = m === "full" && !!quota && quota.blocked;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                textAlign: "left",
                padding: 16,
                background: active ? INK : PAPER2,
                color: active ? PAPER : INK,
                border: `1px solid ${active ? INK : INK15}`,
                cursor: "pointer",
                opacity: blockedCard && !active ? 0.7 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  {MODE_COPY[m].title}
                </span>
                {m === "citation" && (
                  <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: ".14em", textTransform: "uppercase", color: active ? YEL : INK55 }}>
                    Default
                  </span>
                )}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: active ? "rgba(241,235,222,.82)" : INK70, marginBottom: 8 }}>
                {MODE_COPY[m].does}
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, lineHeight: 1.45, color: active ? "rgba(241,235,222,.6)" : INK55 }}>
                {MODE_COPY[m].doesNot}
              </div>
            </button>
          );
        })}
      </div>

      {mode === "full" && quota && (
        <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 11, letterSpacing: ".04em", color: fullBlocked ? RED : INK55 }}>
          {fullBlocked
            ? `Monthly claim allowance reached (${quota.used} of ${quota.cap} claims used). Citation and link checks are still available. Resets ${fmtDate(quota.periodResetsOn)}.`
            : `${quota.remaining} of ${quota.cap} claims left this month. Every verified claim spends one.`}
        </div>
      )}
      {mode === "full" && (
        <div style={{ marginTop: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, lineHeight: 1.5, color: INK55, maxWidth: 640 }}>
          Rough guide: a short passage with 2 or 3 claims takes 1 to 3 minutes, a dense paragraph with 9 claims takes 3
          to 6, a long article with 30 or more can take 10 or more. You will see the exact claim count and estimate as
          soon as extraction finishes.
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#faf3e3", border: `1px solid ${RED}`, fontFamily: SERIF, fontSize: 14, color: RED }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={submit}
          disabled={submitting || fullBlocked}
          style={{
            padding: "12px 26px",
            background: submitting || fullBlocked ? INK35 : YEL,
            color: INK,
            border: "none",
            fontFamily: GROT,
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            cursor: submitting || fullBlocked ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Starting..." : mode === "citation" ? "Run citation check" : "Run full audit"}
        </button>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
          AI-assisted verification. Review before publishing.
        </span>
      </div>
    </div>
  );

  const renderRunning = (r: WireRun) => {
    const p = r.progress;
    const phase = p?.phase ?? "queued";
    const totalClaims = claims.length;
    const resolved = claims.filter((c) => c.status !== "pending").length;
    const pct = totalClaims > 0 ? Math.min(100, Math.round((resolved / totalClaims) * 100)) : null;
    const est = r.mode === "full" && totalClaims > 0 ? estimateMinutes(totalClaims) : null;
    const elapsedMs = nowTick - new Date(r.created_at).getTime();

    return (
      <div style={{ padding: "24px 0" }}>
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes fciqPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.fciq-pulse { animation: fciqPulse 1.6s ease-in-out infinite; }`,
          }}
        />
        {sectionLabel("Checking")}
        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          {r.title || "Your document"}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".08em", color: INK55, marginBottom: 20 }}>
          {(r.mode === "citation" ? "Citation and link check" : "Full audit").toUpperCase()}
        </div>

        {totalClaims === 0 ? (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: INK }}>
                {PHASE_LABEL[phase] ?? phase}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: INK55 }}>
                ELAPSED {fmtElapsed(elapsedMs)}
              </span>
            </div>
            <div style={{ height: 10, background: PAPER2, border: `1px solid ${INK15}`, overflow: "hidden" }}>
              <div className="fciq-pulse" style={{ height: "100%", width: "40%", background: YEL }} />
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: INK70, marginTop: 16, maxWidth: 640 }}>
              Reading your document and splitting it into individually checkable claims. One paragraph often holds far
              more claims than it seems: every statistic, citation, quote, and factual statement gets its own line.
            </p>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: INK }}>
                {totalClaims} checkable claim{totalClaims === 1 ? "" : "s"} found : {resolved} of {totalClaims} resolved
              </span>
              {est && (
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: INK55 }}>
                  ESTIMATED {est.low} TO {est.high} MINUTES
                </span>
              )}
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: INK55 }}>
                ELAPSED {fmtElapsed(elapsedMs)}
              </span>
            </div>

            <div style={{ height: 10, background: PAPER2, border: `1px solid ${INK15}`, overflow: "hidden", marginBottom: 16 }}>
              <div
                style={{
                  height: "100%",
                  width: pct === null ? "40%" : `${Math.max(4, pct)}%`,
                  background: YEL,
                  transition: "width .4s ease",
                }}
              />
            </div>

            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, lineHeight: 1.5, color: INK55, margin: "0 0 6px", maxWidth: 640 }}>
              Fast fact checking is an oxymoron. Every claim below gets its own live search, its own sources, its own
              receipts. High-risk claims are checked first, and long documents continue automatically in extra passes.
              You can leave this open, it updates automatically.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "0 0 18px" }}>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: INK35 }}>
                Checked against:
              </span>
              {METHOD_STACK.map((m2) => (
                <span key={m2} style={chip("transparent", INK55, INK15)}>{m2}</span>
              ))}
            </div>

            <div style={{ border: `1px solid ${INK15}` }}>
              {claims.map((c, i) => (
                <div
                  key={c.id || i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 14px",
                    background: i % 2 === 0 ? PAPER : PAPER2,
                    borderTop: i === 0 ? "none" : `1px solid ${INK15}`,
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 11, color: INK35, minWidth: 20, paddingTop: 2 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.45, color: c.status === "pending" ? INK70 : INK }}>
                    {c.claim_text.length > 220 ? c.claim_text.slice(0, 220) + "..." : c.claim_text}
                  </span>
                  <ClaimBadge claim={c} live />
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={newRun} style={{ ...labelBtnStyle(false), marginTop: 16 }}>
          Cancel
        </button>
      </div>
    );
  };

  const renderVerdictCounts = (counts: WireVerdictCounts | null) => {
    if (!counts) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {VERDICT_ORDER.map((v) => {
          const n = counts[v] ?? 0;
          const m = VERDICT_META[v];
          return (
            <span key={v} style={{ ...chip(m.bg, m.fg), opacity: n === 0 ? 0.4 : 1 }}>
              {m.label}: {n}
            </span>
          );
        })}
      </div>
    );
  };

  const renderFlags = (r: WireRun) => {
    const f = r.flags;
    if (!f) return null;
    const rows: string[] = [];
    if (f.skippedClaims && f.skippedClaims > 0)
      rows.push(`${f.skippedClaims} claim(s) beyond the 40-claim per-run cap were not checked in this run.`);
    if (f.quotaLimited && f.quotaLimited > 0)
      rows.push(`${f.quotaLimited} claim(s) were not checked because your monthly claim allowance ran out mid-document. They are listed below as Not checked and can be re-run after the allowance resets.`);
    if (f.checkIncomplete && f.checkIncomplete > 0)
      rows.push(`${f.checkIncomplete} claim(s) could not be verified in the available time or search capacity. Re-run to check them.`);
    if (f.injectionAttempts && f.injectionAttempts.length > 0)
      rows.push(`${f.injectionAttempts.length} prompt-injection attempt(s) detected in fetched content and ignored.`);
    if (f.fetchFailures && f.fetchFailures.length > 0)
      rows.push(`${f.fetchFailures.length} source(s) could not be fetched during verification (affected claims marked Unverifiable).`);
    if (rows.length === 0) return null;
    return (
      <div style={{ marginBottom: 18, padding: "12px 16px", background: "#faf3e3", border: `1px solid ${INK15}` }}>
        <SCaps size={9.5} ls="0.16em" color={INK70}>Flags</SCaps>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          {rows.map((t, i) => (
            <li key={i} style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: INK70, marginBottom: 4 }}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderConsistency = (r: WireRun) => {
    const findings = r.flags?.consistencyFindings;
    if (!findings || findings.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        {sectionLabel("Consistency findings")}
        <p style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: INK55, marginTop: 0, marginBottom: 10 }}>
          Claims within this document that disagree with each other. Reconcile these before publishing, even where each
          figure is individually defensible.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {findings.map((f, i) => (
            <li key={i} style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: INK, marginBottom: 6 }}>
              {f.note}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSources = (claim: WireClaim) => {
    const list = claim.sources ?? [];
    if (list.length === 0) {
      if (claim.source_url) {
        return (
          <a href={claim.source_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: MONO, fontSize: 11, color: "#2a5db0" }}>
            {hostOf(claim.source_url)}
          </a>
        );
      }
      return <span style={{ fontFamily: MONO, fontSize: 11, color: INK35 }}>None</span>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {list.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: MONO, fontSize: 11, color: "#2a5db0", lineHeight: 1.4 }}>
            {hostOf(s.url)}
            {s.as_of ? ` (as of ${s.as_of})` : ""}
          </a>
        ))}
      </div>
    );
  };

  const renderReport = (r: WireRun) => {
    const isError = r.status === "error";
    const mode2 = r.mode;
    const searches = r.searches_used;
    const costCents = r.cost_cents;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, lineHeight: 1.1 }}>
              {r.title || "Fact-check report"}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: INK55, marginTop: 6 }}>
              {(mode2 === "citation" ? "Citation and link check" : "Full audit").toUpperCase()}
              {"  |  "}
              {fmtDate(r.completed_at || r.created_at)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={copyMarkdown}
              disabled={!r.report_md}
              title="Copy the full report as Markdown to your clipboard"
              style={{
                padding: "7px 16px",
                background: copied ? GREEN : YEL,
                color: copied ? PAPER : INK,
                border: `1px solid ${copied ? GREEN : YEL}`,
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                cursor: r.report_md ? "pointer" : "not-allowed",
                opacity: r.report_md ? 1 : 0.5,
              }}
            >
              {copied ? "Copied" : "Copy report"}
            </button>
            <button onClick={newRun} style={labelBtnStyle(true)}>
              New check
            </button>
          </div>
        </div>

        {isError && (
          <div style={{ marginBottom: 18, padding: "12px 16px", background: "#faf3e3", border: `1px solid ${RED}`, fontFamily: SERIF, fontSize: 14, color: RED }}>
            This run did not finish: {r.error || "unknown error"}. Nothing was charged for an incomplete run beyond any
            searches already spent. You can start it again.
          </div>
        )}

        {r.readiness && (
          <div style={{ marginBottom: 18, padding: "12px 16px", background: PAPER2, borderLeft: `4px solid ${readinessAccent(r.readiness)}` }}>
            <SCaps size={9.5} ls="0.16em" color={INK55}>Readiness</SCaps>
            <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: INK, marginTop: 4 }}>{r.readiness}</div>
          </div>
        )}

        {renderVerdictCounts(r.verdict_counts)}

        <div style={{ marginBottom: 18, fontFamily: SERIF, fontSize: 13, lineHeight: 1.55, color: INK70 }}>
          <strong style={{ fontWeight: 700 }}>What was checked:</strong> {CHECKED_LINE[mode2].checked}
          {CHECKED_LINE[mode2].notChecked ? (
            <>
              {" "}
              <strong style={{ fontWeight: 700 }}>What was not checked:</strong> {CHECKED_LINE[mode2].notChecked}
            </>
          ) : null}
        </div>

        {(searches != null || costCents != null) && (
          <div style={{ marginBottom: 18, fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: INK55 }}>
            THIS RUN:{" "}
            {searches != null ? `${searches} web search${searches === 1 ? "" : "es"}` : "searches not recorded"}
            {costCents != null ? `  |  ~$${(costCents / 100).toFixed(2)}` : ""}
          </div>
        )}

        {renderFlags(r)}
        {renderConsistency(r)}

        {sectionLabel(`Claims (${claims.length})`)}
        <div style={{ border: `1px solid ${INK15}`, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: INK }}>
                {["#", "Claim", "Verdict", "Evidence", "Sources"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "9px 12px",
                      fontFamily: GROT,
                      fontWeight: 800,
                      fontSize: 9,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: PAPER,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "20px 12px", fontFamily: SERIF, fontStyle: "italic", color: INK55 }}>
                    No claims were extracted from this input.
                  </td>
                </tr>
              )}
              {claims.map((c, i) => (
                <tr key={c.id || i} style={{ borderTop: `1px solid rgba(26,20,16,.14)`, verticalAlign: "top" }}>
                  <td style={{ padding: "10px 12px", fontFamily: MONO, fontSize: 12, color: INK55 }}>{i + 1}</td>
                  <td style={{ padding: "10px 12px", fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.45, color: INK, minWidth: 220 }}>
                    {c.claim_text}
                    {c.note ? (
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: INK55, marginTop: 3 }}>{c.note}</div>
                    ) : null}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <ClaimBadge claim={c} />
                  </td>
                  <td style={{ padding: "10px 12px", fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.45, color: INK70, minWidth: 200 }}>
                    {c.evidence || <span style={{ color: INK35 }}>None</span>}
                  </td>
                  <td style={{ padding: "10px 12px", minWidth: 140 }}>{renderSources(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {r.report_md && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setShowRaw((s) => !s)} style={labelBtnStyle(false)}>
                {showRaw ? "Hide raw Markdown" : "Show raw Markdown"}
              </button>
              <button onClick={copyMarkdown} style={labelBtnStyle(false)} disabled={!r.report_md}>
                {copied ? "Copied" : "Copy Markdown"}
              </button>
            </div>
            {showRaw && (
              <pre
                style={{
                  marginTop: 10,
                  padding: 16,
                  background: PAPER2,
                  border: `1px solid ${INK15}`,
                  fontFamily: MONO,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: INK,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "auto",
                }}
              >
                {r.report_md}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) return null;
    return (
      <div style={{ marginTop: 40 }}>
        {sectionLabel("Recent runs")}
        <div style={{ border: `1px solid ${INK15}` }}>
          {history.map((row, i) => (
            <button
              key={row.id}
              onClick={() => reopen(row)}
              style={{
                display: "flex",
                width: "100%",
                textAlign: "left",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: i % 2 === 0 ? PAPER : PAPER2,
                border: "none",
                borderTop: i === 0 ? "none" : `1px solid ${INK15}`,
                cursor: "pointer",
              }}
            >
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.title || "Untitled document"}
              </span>
              <span style={{ ...chip(row.mode === "full" ? INK : "transparent", row.mode === "full" ? PAPER : INK55, INK35) }}>
                {row.mode === "full" ? "Full" : "Citation"}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", color: statusColor(row.status), width: 84, textTransform: "uppercase" }}>
                {statusLabel(row.status)}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: INK55, width: 92, textAlign: "right" }}>
                {fmtDate(row.created_at)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */

  return (
    <div style={{ minHeight: "100vh", background: PAPER2, color: INK, fontFamily: SERIF }}>
      <ToolHeader
        toolPrefix="Factcheck"
        subtitle="AI-ASSISTED VERIFICATION | EMOS TOOL SUITE"
        rightContent={
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {quotaLine()}
            <a
              href="/emos-platform/dashboard"
              style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(241,235,222,.6)", textDecoration: "none" }}
            >
              ← Dashboard
            </a>
          </div>
        }
      />

      <main
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          background: PAPER,
          borderLeft: `1px solid ${INK15}`,
          borderRight: `1px solid ${INK15}`,
          minHeight: "calc(100vh - 52px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "clamp(20px,4vw,40px)", flex: 1 }}>
          {view === "form" && renderForm()}
          {view === "running" && run && renderRunning(run)}
          {view === "report" && run && renderReport(run)}
          {view === "form" && renderHistory()}
        </div>

        <ToolPipelineFooter currentTool="factcheckiq" />

        <div style={{ padding: "0 clamp(20px,4vw,40px) 28px" }}>
          <div style={{ borderTop: `1px solid ${INK15}`, paddingTop: 14 }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, lineHeight: 1.5, color: INK55, margin: 0, maxWidth: 760 }}>
              AI-assisted verification, review before publishing. Verdicts are evidence-based judgments, not legal
              guarantees. &quot;Unverifiable&quot; means the available evidence was inconclusive, not that a claim is
              false, and &quot;Check incomplete&quot; means the system could not run the check, not a verdict at all.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function statusLabel(s: string): string {
  if (s === "done") return "Done";
  if (s === "error") return "Failed";
  if (s === "running") return "Running";
  if (s === "queued") return "Queued";
  return s;
}
function statusColor(s: string): string {
  if (s === "done") return GREEN;
  if (s === "error") return RED;
  return INK55;
}
