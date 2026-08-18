"use client";

// ─────────────────────────────────────────────────────────────────────────────
// CoverageIQ — shared UI primitives + helpers
// Badges, pills, masts, detail rows, form field, date helpers, cell styles,
// and the pipeline-stage constants/legend. Used by both the public tool and the
// EMOS dashboard via the shared views. No data-source coupling here.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  PAPER, PAPER2, INK, INK70, INK55, INK35, INK15,
  YEL, SERIF, GROT, MONO,
} from "@/lib/tokens";
import type { Stage, PesoType, AlertType } from "@/lib/coverageiq/types";

// ─── Stage constants ───────────────────────────────────────────────────────────
export const PIPELINE_STAGES: { id: Stage; label: string }[] = [
  { id: "drafted",   label: "Drafted" },
  { id: "sent",      label: "Sent" },
  { id: "opened",    label: "Opened" },
  { id: "replied",   label: "Replied" },
  { id: "placed",    label: "Placed" },
  { id: "amplified", label: "Amplified" },
];

// ─── Date helpers ──────────────────────────────────────────────────────────────
export function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

export function daysAgoLabel(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

// ─── Badges + pills ────────────────────────────────────────────────────────────
export function StageBadge({ stage }: { stage: Stage }) {
  const map: Record<Stage, { bg: string; fg: string; border: string }> = {
    drafted:   { bg: PAPER2,  fg: INK55, border: INK35 },
    sent:      { bg: INK,     fg: PAPER, border: INK },
    opened:    { bg: "transparent", fg: INK, border: INK },
    replied:   { bg: YEL,     fg: INK,   border: YEL },
    placed:    { bg: INK,     fg: YEL,   border: INK },
    amplified: { bg: YEL,     fg: INK,   border: YEL },
  };
  const s = map[stage];
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px 4px",
      background: s.bg, color: s.fg, border: `1px solid ${s.border}`,
      fontFamily: GROT, fontWeight: 800, fontSize: 9,
      letterSpacing: "0.14em", textTransform: "uppercase",
    }}>
      {stage}
    </span>
  );
}

export function PESOBadge({ type }: { type: PesoType }) {
  const map: Record<PesoType, { bg: string; fg: string; border?: string }> = {
    Earned: { bg: YEL,          fg: INK },
    Shared: { bg: INK,          fg: PAPER },
    Owned:  { bg: PAPER2,       fg: INK },
    Paid:   { bg: "transparent", fg: INK55, border: INK35 },
  };
  const c = map[type];
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px 4px",
      background: c.bg, color: c.fg,
      border: c.border ? `1px solid ${c.border}` : "none",
      fontFamily: GROT, fontWeight: 800, fontSize: 9,
      letterSpacing: "0.16em",
    }}>
      {type.charAt(0)}
    </span>
  );
}

// ─── Metric help copy (Camper-demo fix: plain language for non-SEO users) ─────
// One canonical place for what DR and Points mean. Used as hover tooltips on
// badges + column headers, and rendered visibly in MetricsLegend below.
export const METRIC_TIPS = {
  dr: "DR (Domain Rating): how strong the publishing website's reputation is, on a 0-100 scale (an SEO measure, similar to Ahrefs Domain Rating). Major outlets like TechCrunch sit in the 90s; a niche blog might be 20-40. Higher means a mention there carries more weight.",
  points: "Points: a simple win score for coverage you have logged. Points are awarded only once a pitch reaches Placed or Amplified. Bigger placements on higher-DR sites earn more.",
} as const;

export function DRBar({ value }: { value: number | null }) {
  if (!value) return <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>;
  const fill = value >= 80 ? YEL : value >= 50 ? INK : INK55;
  return (
    <div title={METRIC_TIPS.dr} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, minWidth: 24 }}>{value}</span>
      <div style={{ flex: 1, height: 4, background: INK15, maxWidth: 60 }}>
        <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: fill }} />
      </div>
    </div>
  );
}

export function PointsBadge({ points }: { points: number | null }) {
  if (!points) return <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>;
  return (
    <span title={METRIC_TIPS.points} style={{
      fontFamily: MONO, fontWeight: 700, fontSize: 14,
      borderBottom: `2px solid ${YEL}`, paddingBottom: 2,
    }}>
      {points}
    </span>
  );
}

export function AlertTypeBadge({ type }: { type: AlertType }) {
  const labels: Record<AlertType, string> = { syndication: "SYN", mention: "MEN", pickup: "AMP" };
  const bgs:    Record<AlertType, string> = { syndication: YEL,   mention: INK,   pickup: PAPER2 };
  const fgs:    Record<AlertType, string> = { syndication: INK,   mention: YEL,   pickup: INK };
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px 3px",
      background: bgs[type], color: fgs[type],
      fontFamily: GROT, fontWeight: 800, fontSize: 8,
      letterSpacing: "0.14em", textTransform: "uppercase",
      border: type === "pickup" ? `1px solid ${INK35}` : "none",
    }}>
      {labels[type]}
    </span>
  );
}

export function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-block", padding: "6px 14px",
      background: active ? INK : "transparent",
      color: active ? PAPER : INK55,
      border: `1px solid ${active ? INK : INK35}`,
      fontFamily: GROT, fontWeight: 700, fontSize: 10,
      letterSpacing: "0.14em", textTransform: "uppercase",
      cursor: "pointer", transition: "all 0.12s ease",
    }}>
      {label}
    </button>
  );
}

export function SectionMast({ number, label, vol }: { number: string; label: string; vol?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Double rule */}
      <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 3, borderBottom: "none" }}>
        <div style={{ borderTop: `3px solid ${INK}`, paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{
              background: YEL, color: INK,
              fontFamily: GROT, fontWeight: 800, fontSize: 9,
              letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "3px 10px 4px",
            }}>
              {number}
            </span>
            <span style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 10,
              letterSpacing: "0.18em", textTransform: "uppercase", color: INK55,
            }}>
              {label}
            </span>
            <div style={{ flex: 1, height: 1, background: INK15, minWidth: 20 }} />
            {vol && (
              <span style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase", color: INK35,
              }}>
                {vol}
              </span>
            )}
          </div>
        </div>
      </div>
      <div style={{ borderBottom: `1px solid ${INK15}`, marginTop: 10 }} />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      padding: "48px 32px", textAlign: "center",
      border: `1px solid ${INK15}`, background: PAPER2,
    }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

export function DetailColHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>
      {children}
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${INK15}` }}>
      <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>{label}</span>
      <span style={{ fontFamily: SERIF, fontSize: 14, color: INK }}>{value}</span>
    </div>
  );
}

export function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Cell style helpers ────────────────────────────────────────────────────────
export function logCell(border: boolean): React.CSSProperties {
  return {
    padding: "12px 10px", borderLeft: border ? `1px solid ${INK15}` : "none",
    display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0,
  };
}

export function cc(border: boolean): React.CSSProperties {
  return {
    padding: "12px 12px", borderLeft: border ? `1px solid ${INK15}` : "none",
    display: "flex", alignItems: "center", gap: 4, overflow: "hidden", minWidth: 0,
  };
}

// ─── Stage legend (dashboard) ──────────────────────────────────────────────────
export const STAGE_DESCRIPTIONS: Record<Stage, { short: string; when: string }> = {
  drafted:   { short: "Written but not yet sent.",         when: "You've prepared the pitch but haven't emailed it." },
  sent:      { short: "Pitch emailed to the journalist.",  when: "You hit send — waiting for any response." },
  opened:    { short: "Journalist opened your email.",     when: "Tracked via email open pixel or confirmed manually." },
  replied:   { short: "Journalist replied.",               when: "Any reply — even a rejection or request for more info." },
  placed:    { short: "Coverage confirmed and published.", when: "The piece is live. Add the URL and DR (Domain Rating) in the expanded view." },
  amplified: { short: "Placement shared and promoted.",    when: "You've shared it on social, in newsletters, or via outreach." },
};

// ─── Metrics legend (Camper-demo fix) ─────────────────────────────────────────
// Visible, collapsible plain-language explainer for DR and Points, mirroring
// StageLegend. Hover tooltips alone fail on touch devices; this is the
// no-hover path. Pass metrics to show a subset (Contacts tab has only DR).
const METRIC_LEGEND_ITEMS: { id: "dr" | "points"; label: string; short: string; detail: string }[] = [
  {
    id: "dr",
    label: "DR (Domain Rating)",
    short: "How strong the publishing website's reputation is, on a 0-100 scale (an SEO measure, similar to Ahrefs Domain Rating).",
    detail: "Major outlets like TechCrunch or Forbes sit in the 90s; a niche blog might be 20-40. Higher means a mention or link there carries more weight.",
  },
  {
    id: "points",
    label: "Points",
    short: "A simple win score for the coverage you have logged. Awarded only once a pitch reaches Placed or Amplified.",
    detail: "Bigger placements on higher-DR sites earn more points. The formula is DR-based and still being finalized; there is no composite score in CoverageIQ.",
  },
];

export function MetricsLegend({ metrics }: { metrics?: ("dr" | "points")[] }) {
  const [open, setOpen] = useState(false);
  const items = METRIC_LEGEND_ITEMS.filter(m => !metrics || metrics.includes(m.id));
  const title = items.length === 1
    ? (items[0].id === "dr" ? "What does DR mean?" : "What do Points mean?")
    : "What do DR and Points mean?";
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}
      >
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55 }}>
          {open ? "▲" : "▼"} {title}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 8, border: `1px solid ${INK15}`, background: PAPER2, display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((m, i) => (
            <div key={m.id} style={{ padding: "12px 16px", borderRight: i < items.length - 1 ? `1px solid ${INK15}` : "none" }}>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK }}>
                {m.label}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: INK70, lineHeight: 1.45, marginTop: 6 }}>
                {m.short}
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 3, lineHeight: 1.4 }}>
                {m.detail}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Data-source note (Camper-demo fix) ───────────────────────────────────────
// "What IP/data do you use" was Camper's first product question. This states it
// plainly, per surface. Verified against the code 2026-08-18: the dashboard
// reads/writes only its own Supabase tables (coverageiq_pitches, journalists,
// coverageiq_alerts); the public tool is seeded sample data in localStorage.
// CoverageIQ imports nothing from src/lib/signaliq — the GDELT/BigQuery
// coverage cache is SignalIQ's alone. Keep this note truthful if that changes.
export function DataSourceNote({ variant }: { variant: "public" | "dashboard" }) {
  const body = variant === "public"
    ? "CoverageIQ tracks what you put into it: the pitches you log and the coverage you record, including pitches sent across from PressIQ. There is no third-party monitoring API behind it, and nothing is scraped from external services. (This public demo runs on invented sample data, stored only in your browser.) The live media radars on this site are different: SignalIQ reads real global news data from GDELT via Google BigQuery. CoverageIQ makes no external data calls."
    : "CoverageIQ tracks what your team puts into it: the pitches you log (or send across from PressIQ) and the coverage you record. Everything lives in your workspace's private database; there is no third-party monitoring API behind this screen, and nothing is scraped from external services. SignalIQ's radars are the exception in the suite: they read global news data from GDELT via Google BigQuery. CoverageIQ does not touch that feed.";
  return (
    <div style={{ marginTop: 40, border: `1px solid ${INK15}`, background: PAPER2, padding: "16px 22px", display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
      <span style={{ background: INK, color: YEL, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 10px", flexShrink: 0 }}>
        Where this data comes from
      </span>
      <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: INK70, margin: 0, flex: 1, minWidth: 260 }}>
        {body}
      </p>
    </div>
  );
}

export function StageLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}
      >
        <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55 }}>
          {open ? "▲" : "▼"} What do these stages mean?
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 8, border: `1px solid ${INK15}`, background: PAPER2, display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {PIPELINE_STAGES.map((s, i) => (
            <div key={s.id} style={{ padding: "12px 16px", borderRight: i % 3 < 2 ? `1px solid ${INK15}` : "none", borderBottom: i < 3 ? `1px solid ${INK15}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <StageBadge stage={s.id} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: INK70, lineHeight: 1.45, marginTop: 6 }}>
                {STAGE_DESCRIPTIONS[s.id].short}
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 3, lineHeight: 1.4 }}>
                {STAGE_DESCRIPTIONS[s.id].when}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
