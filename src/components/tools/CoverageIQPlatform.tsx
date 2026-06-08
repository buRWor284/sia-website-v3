"use client";

/**
 * CoverageIQPlatform — Authenticated EMOS Pitch Tracking CRM
 * Route: /emostool/dashboard/coverageiq
 *
 * Same UI as the public CoverageIQ tool but wired to real Supabase data.
 * Mutations call server actions; useRouter().refresh() re-fetches server data.
 */

import { useState, useMemo, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PAPER, PAPER2, INK, INK70, INK55, INK35, INK15,
  YEL, YEL2, SERIF, GROT, MONO,
} from "@/lib/tokens";
import { ToolHeader } from "@/components/tools/ToolHeader";
import {
  createPitch,
  updatePitchStage,
  updateAlertStatus,
  createJournalist,
  deleteJournalist,
  type DbPitch,
  type DbJournalist,
  type DbAlert,
  type Stage,
  type CreateJournalistInput,
  type PesoType,
  type LinkType,
  type DataSource,
  type AlertStatus,
  type AlertType,
  type CreatePitchInput,
} from "@/app/emostool/actions/coverageiq";

// ── Constants ─────────────────────────────────────────────────────────────────

const PIPELINE_STAGES: { id: Stage; label: string }[] = [
  { id: "drafted",   label: "Drafted" },
  { id: "sent",      label: "Sent" },
  { id: "opened",    label: "Opened" },
  { id: "replied",   label: "Replied" },
  { id: "placed",    label: "Placed" },
  { id: "amplified", label: "Amplified" },
];

const DATA_SOURCES: DataSource[] = ["manual", "PressIQ", "SignalIQ", "Google Alerts"];
const TEAMS = ["Firestarters", "Nirvana", "Wizards", "SIA"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

function daysAgoLabel(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

// ── Shared components ──────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: Stage }) {
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

function PESOBadge({ type }: { type: PesoType }) {
  const map: Record<PesoType, { bg: string; fg: string; border?: string }> = {
    Earned: { bg: YEL,           fg: INK },
    Shared: { bg: INK,           fg: PAPER },
    Owned:  { bg: PAPER2,        fg: INK },
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

function DRBar({ value }: { value: number | null }) {
  if (!value) return <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>;
  const fill = value >= 80 ? YEL : value >= 50 ? INK : INK55;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, minWidth: 24 }}>{value}</span>
      <div style={{ flex: 1, height: 4, background: INK15, maxWidth: 60 }}>
        <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: fill }} />
      </div>
    </div>
  );
}

function PointsBadge({ points }: { points: number | null }) {
  if (!points) return <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>;
  return (
    <span style={{
      fontFamily: MONO, fontWeight: 700, fontSize: 14,
      borderBottom: `2px solid ${YEL}`, paddingBottom: 2,
    }}>
      {points}
    </span>
  );
}

function AlertTypeBadge({ type }: { type: AlertType }) {
  const labels: Record<AlertType, string> = { syndication: "SYN", mention: "MEN", pickup: "AMP" };
  const bgs: Record<AlertType, string>    = { syndication: YEL,   mention: INK,   pickup: PAPER2 };
  const fgs: Record<AlertType, string>    = { syndication: INK,   mention: YEL,   pickup: INK };
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

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

function SectionMast({ number, label, vol }: { number: string; label: string; vol?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 3 }}>
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

function EmptyState({ message }: { message: string }) {
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

function DetailColHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${INK15}` }}>
      <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>{label}</span>
      <span style={{ fontFamily: SERIF, fontSize: 14, color: INK }}>{value}</span>
    </div>
  );
}

// ── Pipeline View ──────────────────────────────────────────────────────────────

function PipelineView({
  pitches,
  onStageChange,
}: {
  pitches: DbPitch[];
  onStageChange: (id: string, stage: Stage) => void;
}) {
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    PIPELINE_STAGES.forEach(s => { c[s.id] = 0; });
    pitches.forEach(p => { c[p.stage] = (c[p.stage] ?? 0) + 1; });
    return c;
  }, [pitches]);

  const filtered = useMemo(() => {
    const list = stageFilter === "all" ? [...pitches] : pitches.filter(p => p.stage === stageFilter);
    const order = PIPELINE_STAGES.map(s => s.id);
    return list.sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage));
  }, [stageFilter, pitches]);

  const totalPoints = pitches.reduce((s, p) => s + (p.points ?? 0), 0);

  return (
    <div>
      {/* Stage funnel strip */}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, 1fr)`,
        border: `1px solid ${INK}`, marginBottom: 28,
      }}>
        {PIPELINE_STAGES.map((stage, i) => {
          const active = stageFilter === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setStageFilter(active ? "all" : stage.id)}
              style={{
                padding: "20px 16px",
                borderRight: i < PIPELINE_STAGES.length - 1 ? `1px solid ${INK}` : "none",
                background: active ? INK : "transparent",
                cursor: "pointer", border: "none",
                transition: "background 0.12s",
                textAlign: "center",
              }}
            >
              <div style={{
                fontFamily: MONO, fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1,
                color: active ? YEL : INK, letterSpacing: "-0.02em",
              }}>
                {stageCounts[stage.id] ?? 0}
              </div>
              <div style={{
                fontFamily: GROT, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: active ? "rgba(250,250,250,.55)" : INK55, marginTop: 6,
              }}>
                {stage.label}
              </div>
            </button>
          );
        })}
      </div>

      {pitches.length === 0 ? (
        <EmptyState message="No pitches yet. Add your first pitch to get started." />
      ) : (
        <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 150px 96px 80px 64px 72px",
            background: INK, color: PAPER,
            fontFamily: GROT, fontWeight: 700, fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
          }}>
            {["Pitch", "Journalist", "Stage", "DR", "PESO", "Points"].map((h, i) => (
              <div key={h} style={{
                padding: "12px 16px",
                borderRight: i < 5 ? "1px solid rgba(241,235,222,.15)" : "none",
              }}>
                {h}
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", color: INK55 }}>
              No pitches in this stage.
            </div>
          ) : filtered.map(pitch => {
            const isExpanded = expandedId === pitch.id;
            return (
              <div key={pitch.id}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : pitch.id)}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 150px 96px 80px 64px 72px",
                    borderBottom: `1px solid ${INK15}`, cursor: "pointer",
                    background: isExpanded ? PAPER2 : "transparent",
                    transition: "background 0.12s",
                  }}
                >
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 3, overflow: "hidden", minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: INK }}>{pitch.subject}</span>
                    <span style={{ fontFamily: GROT, fontSize: 10, color: INK55, letterSpacing: "0.08em" }}>
                      {pitch.client ?? "—"}{pitch.sent_date ? ` · ${fmt(pitch.sent_date)}` : " · Not sent"}
                    </span>
                  </div>
                  <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, overflow: "hidden", minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pitch.journalist_name ?? "—"}
                    </span>
                    {pitch.journalist_outlet && (
                      <span style={{ fontFamily: GROT, fontSize: 9, color: INK55, letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {pitch.journalist_outlet}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                    <StageBadge stage={pitch.stage} />
                  </div>
                  <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0 }}>
                    <DRBar value={pitch.domain_rating} />
                  </div>
                  <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PESOBadge type={pitch.peso_type} />
                  </div>
                  <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                    <PointsBadge points={pitch.points} />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    borderBottom: `1px solid ${INK15}`, background: PAPER2,
                    padding: "20px 16px", display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr", gap: 20,
                  }}>
                    {/* Col 1 — pitch details */}
                    <div>
                      <DetailColHead>Pitch Details</DetailColHead>
                      <DetailRow label="Team"        value={pitch.team ?? "—"} />
                      <DetailRow label="Data Source" value={pitch.data_source} />
                      <DetailRow label="Link Type"   value={pitch.link_type ?? "—"} />
                      <DetailRow label="Content"     value={pitch.content_type ?? "—"} />
                      {/* Stage changer */}
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>
                          Move Stage
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {PIPELINE_STAGES.map(s => (
                            <button
                              key={s.id}
                              disabled={s.id === pitch.stage}
                              onClick={e => { e.stopPropagation(); onStageChange(pitch.id, s.id); }}
                              style={{
                                padding: "4px 10px",
                                background: s.id === pitch.stage ? INK : "transparent",
                                color: s.id === pitch.stage ? YEL : INK55,
                                border: `1px solid ${s.id === pitch.stage ? INK : INK35}`,
                                fontFamily: GROT, fontWeight: 700, fontSize: 8,
                                letterSpacing: "0.12em", textTransform: "uppercase",
                                cursor: s.id === pitch.stage ? "default" : "pointer",
                                opacity: s.id === pitch.stage ? 1 : 0.8,
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Col 2 — timeline */}
                    <div>
                      <DetailColHead>Timeline</DetailColHead>
                      <DetailRow label="Sent"          value={fmt(pitch.sent_date)} />
                      <DetailRow label="Placed"        value={fmt(pitch.placed_date)} />
                      <DetailRow label="Follow-up Due" value={pitch.follow_up_due ? fmt(pitch.follow_up_due) : "—"} />
                      {pitch.follow_up_due && new Date(pitch.follow_up_due) <= new Date() && (
                        <div style={{ marginTop: 8, padding: "6px 10px", background: YEL, display: "inline-block", fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          FOLLOW-UP OVERDUE
                        </div>
                      )}
                      {pitch.notes && (
                        <div style={{ marginTop: 14 }}>
                          <DetailColHead>Notes</DetailColHead>
                          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, lineHeight: 1.55, margin: 0 }}>{pitch.notes}</p>
                        </div>
                      )}
                    </div>
                    {/* Col 3 — placement */}
                    <div>
                      <DetailColHead>Placement</DetailColHead>
                      <DetailRow label="Anchor Text" value={pitch.anchor_text ?? "—"} />
                      {pitch.placement_url && (
                        <div style={{ marginTop: 6 }}>
                          <a href={pitch.placement_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: MONO, fontSize: 11, color: INK, borderBottom: `1px solid ${YEL}`, wordBreak: "break-all", textDecoration: "none" }}>
                            {pitch.placement_url.replace("https://", "").substring(0, 45)}…
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55 }}>
          {filtered.length} pitch{filtered.length !== 1 ? "es" : ""}{stageFilter !== "all" ? ` in ${stageFilter}` : " total"}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: INK55 }}>
          Total points: {totalPoints}
        </span>
      </div>
    </div>
  );
}

// ── Follow-ups View ────────────────────────────────────────────────────────────

type Urgency = "overdue" | "today" | "upcoming" | "stalled" | "amplify";

function FollowUpsView({ pitches }: { pitches: DbPitch[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const overdue    = pitches.filter(p => p.follow_up_due && new Date(p.follow_up_due) < today);
  const dueToday   = pitches.filter(p => p.follow_up_due && new Date(p.follow_up_due).toDateString() === today.toDateString());
  const upcoming   = pitches.filter(p => p.follow_up_due && new Date(p.follow_up_due) > today);
  const stalled    = pitches.filter(p => !p.follow_up_due && (p.stage === "sent" || p.stage === "opened") && p.sent_date && (today.getTime() - new Date(p.sent_date).getTime()) / 86400000 > 5);
  const readyToAmp = pitches.filter(p => p.stage === "placed" && p.placed_date && (today.getTime() - new Date(p.placed_date).getTime()) / 86400000 < 14);
  const totalActions = overdue.length + dueToday.length + upcoming.length + stalled.length + readyToAmp.length;

  const summary = [
    { num: overdue.length,    label: "OVERDUE",      highlight: overdue.length > 0 },
    { num: dueToday.length,   label: "DUE TODAY",    highlight: dueToday.length > 0 },
    { num: upcoming.length,   label: "UPCOMING",     highlight: false },
    { num: stalled.length,    label: "STALLED",      highlight: false },
    { num: readyToAmp.length, label: "READY TO AMP", highlight: false },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: `1px solid ${INK}`, marginBottom: 28 }}>
        {summary.map((item, i) => (
          <div key={i} style={{ padding: "18px 14px", borderRight: i < 4 ? `1px solid ${INK}` : "none", background: item.highlight ? YEL : "transparent" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: item.highlight ? INK : INK55, marginTop: 5 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {totalActions === 0
        ? <EmptyState message="No follow-ups pending. All caught up." />
        : <>
            <FollowUpSection title="Overdue"          subtitle="Needs immediate attention"       items={overdue}    urgency="overdue"  today={today} />
            <FollowUpSection title="Due Today"        subtitle=""                                items={dueToday}   urgency="today"    today={today} />
            <FollowUpSection title="Upcoming"         subtitle="Next 7 days"                     items={upcoming}   urgency="upcoming" today={today} />
            <FollowUpSection title="Stalled pitches"  subtitle="No response, no follow-up set"  items={stalled}    urgency="stalled"  today={today} />
            <FollowUpSection title="Ready to amplify" subtitle="Placed in last 14 days"          items={readyToAmp} urgency="amplify"  today={today} />
          </>
      }
    </div>
  );
}

function FollowUpSection({ title, subtitle, items, urgency, today }: {
  title: string; subtitle: string; items: DbPitch[]; urgency: Urgency; today: Date;
}) {
  if (items.length === 0) return null;
  const colorMap: Record<Urgency, { bg: string; fg: string; indicator: string }> = {
    overdue:  { bg: YEL,          fg: INK,   indicator: INK },
    today:    { bg: INK,          fg: PAPER, indicator: YEL },
    upcoming: { bg: "transparent", fg: INK,  indicator: INK55 },
    stalled:  { bg: PAPER2,       fg: INK,   indicator: INK35 },
    amplify:  { bg: "transparent", fg: INK,  indicator: YEL },
  };
  const c = colorMap[urgency];
  const actionLabel = urgency === "amplify" ? "Share now →" : urgency === "stalled" ? "Re-engage →" : "Follow up →";
  const btnBg = urgency === "overdue" ? INK : YEL;
  const btnFg = urgency === "overdue" ? YEL : INK;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: c.bg, color: c.fg, borderTop: `3px solid ${INK}` }}>
        <span style={{ width: 8, height: 8, background: c.indicator, flexShrink: 0, display: "inline-block" }} />
        <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>{title}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, opacity: 0.6 }}>{items.length}</span>
        {subtitle && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, marginLeft: "auto", opacity: 0.7 }}>{subtitle}</span>}
      </div>
      <div style={{ border: `1px solid ${INK}`, borderTop: "none" }}>
        {items.map((pitch, idx) => {
          const daysDiff = pitch.follow_up_due ? Math.round((new Date(pitch.follow_up_due).getTime() - today.getTime()) / 86400000) : null;
          const daysSinceSent = pitch.sent_date ? Math.round((today.getTime() - new Date(pitch.sent_date).getTime()) / 86400000) : null;
          return (
            <div key={pitch.id} style={{
              display: "grid", gridTemplateColumns: "1fr 160px 100px 120px 160px",
              borderBottom: idx < items.length - 1 ? `1px solid ${INK15}` : "none",
              alignItems: "center",
            }}>
              <div style={{ padding: "14px 16px", overflow: "hidden", minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pitch.subject}</div>
                <div style={{ fontFamily: GROT, fontSize: 10, color: INK55, letterSpacing: "0.06em", marginTop: 3 }}>{pitch.client ?? "—"}</div>
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}`, overflow: "hidden", minWidth: 0 }}>
                {pitch.journalist_name
                  ? <>
                      <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600 }}>{pitch.journalist_name}</div>
                      {pitch.journalist_outlet && <div style={{ fontFamily: GROT, fontSize: 9, color: INK55, letterSpacing: "0.06em" }}>{pitch.journalist_outlet}</div>}
                    </>
                  : <span style={{ color: INK35 }}>—</span>}
              </div>
              <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}` }}>
                <StageBadge stage={pitch.stage} />
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}` }}>
                {pitch.follow_up_due
                  ? <>
                      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: daysDiff !== null && daysDiff < 0 ? INK : INK70 }}>{fmt(pitch.follow_up_due)}</div>
                      <div style={{ fontFamily: GROT, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3, color: daysDiff !== null && daysDiff < 0 ? INK : INK55 }}>
                        {daysDiff !== null && daysDiff < 0 ? `${Math.abs(daysDiff)}d overdue` : daysDiff === 0 ? "Due today" : `In ${daysDiff}d`}
                      </div>
                    </>
                  : <div style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>
                      {daysSinceSent !== null ? `Sent ${daysSinceSent}d ago` : "—"}
                    </div>
                }
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}` }}>
                <button style={{ padding: "7px 14px", background: btnBg, color: btnFg, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                  {actionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Coverage Log View ──────────────────────────────────────────────────────────

type CoverageLogKey = "placed_date" | "journalist_outlet" | "anchor_text" | "domain_rating" | "peso_type" | "link_type" | "content_type" | "points";

function CoverageLogView({ pitches }: { pitches: DbPitch[] }) {
  const [sortBy, setSortBy] = useState<CoverageLogKey>("placed_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const coverageLog = useMemo(() =>
    pitches.filter(p => p.stage === "placed" || p.stage === "amplified"),
    [pitches]
  );

  const sorted = useMemo(() => {
    return [...coverageLog].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortBy] ?? "";
      const vb = (b as unknown as Record<string, unknown>)[sortBy] ?? "";
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [coverageLog, sortBy, sortDir]);

  const handleSort = (col: CoverageLogKey) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };
  const arrow = (col: CoverageLogKey) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const totalPoints = coverageLog.reduce((s, c) => s + (c.points ?? 0), 0);
  const drItems = coverageLog.filter(c => c.domain_rating);
  const avgDR = drItems.length ? Math.round(drItems.reduce((s, c) => s + (c.domain_rating ?? 0), 0) / drItems.length) : 0;
  const doFollow = coverageLog.filter(c => c.link_type === "Do Follow").length;

  const cols: { key: CoverageLogKey; label: string; w: string }[] = [
    { key: "placed_date",      label: "Date",        w: "90px" },
    { key: "journalist_outlet",label: "Publication", w: "150px" },
    { key: "anchor_text",      label: "Anchor Text", w: "1fr" },
    { key: "domain_rating",    label: "DR",          w: "80px" },
    { key: "peso_type",        label: "PESO",        w: "72px" },
    { key: "link_type",        label: "Link",        w: "82px" },
    { key: "content_type",     label: "Type",        w: "82px" },
    { key: "points",           label: "Pts",         w: "64px" },
  ];
  const grid = cols.map(c => c.w).join(" ");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${INK}`, marginBottom: 24 }}>
        {[
          { num: coverageLog.length, label: "TOTAL PLACEMENTS" },
          { num: totalPoints,        label: "TOTAL POINTS" },
          { num: avgDR,              label: "AVG DOMAIN RATING" },
          { num: doFollow,           label: "DO-FOLLOW LINKS" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "20px 16px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, lineHeight: 1, color: INK, letterSpacing: "-0.02em" }}>{item.num}</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {coverageLog.length === 0 ? (
        <EmptyState message="No placements yet. Pitches marked as Placed or Amplified will appear here." />
      ) : (
        <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: grid, background: INK, color: PAPER }}>
            {cols.map((col, i) => (
              <div key={col.key} onClick={() => handleSort(col.key)} style={{
                padding: "11px 14px", cursor: "pointer",
                borderRight: i < cols.length - 1 ? "1px solid rgba(241,235,222,.15)" : "none",
                fontFamily: GROT, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.16em", textTransform: "uppercase",
                userSelect: "none", whiteSpace: "nowrap",
              }}>
                {col.label}{arrow(col.key)}
              </div>
            ))}
          </div>
          {sorted.map((entry, idx) => {
            const outlet = entry.journalist_outlet ?? (entry.peso_type === "Shared" ? "LinkedIn" : entry.journalist_name ?? "—");
            return (
              <div key={entry.id} style={{ display: "grid", gridTemplateColumns: grid, borderBottom: idx < sorted.length - 1 ? `1px solid ${INK15}` : "none" }}>
                <div style={logCell(false)}><span style={{ fontFamily: MONO, fontSize: 12 }}>{fmt(entry.placed_date)}</span></div>
                <div style={logCell(true)}>
                  {entry.placement_url
                    ? <a href={entry.placement_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: INK, borderBottom: `1px solid ${YEL}`, textDecoration: "none" }}>{outlet}</a>
                    : <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600 }}>{outlet}</span>}
                </div>
                <div style={logCell(true)}><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70 }}>{entry.anchor_text ?? "—"}</span></div>
                <div style={logCell(true)}><DRBar value={entry.domain_rating} /></div>
                <div style={logCell(true)}><PESOBadge type={entry.peso_type} /></div>
                <div style={logCell(true)}>
                  <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: entry.link_type === "Do Follow" ? INK : INK55 }}>
                    {entry.link_type ?? "—"}
                  </span>
                </div>
                <div style={logCell(true)}>
                  <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55 }}>
                    {entry.content_type ?? "—"}
                  </span>
                </div>
                <div style={logCell(true)}><PointsBadge points={entry.points} /></div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
        {coverageLog.length} placements logged · Click column headers to sort
      </div>
    </div>
  );
}

function logCell(border: boolean): React.CSSProperties {
  return { padding: "12px 10px", borderLeft: border ? `1px solid ${INK15}` : "none", display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0 };
}

// ── Contacts View ──────────────────────────────────────────────────────────────

type ContactKey = keyof DbJournalist;

function ContactsView({
  journalists,
  onAddJournalist,
  onDeleteJournalist,
}: {
  journalists: DbJournalist[];
  onAddJournalist: (input: CreateJournalistInput) => Promise<void>;
  onDeleteJournalist: (id: string) => Promise<void>;
}) {
  const [sortBy, setSortBy] = useState<ContactKey>("last_contact");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showAddModal, setShowAddModal] = useState(false);

  const sorted = useMemo(() => {
    return [...journalists].sort((a, b) => {
      const va = a[sortBy] as string | number;
      const vb = b[sortBy] as string | number;
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [journalists, sortBy, sortDir]);

  const handleSort = (col: ContactKey) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };
  const arrow = (col: ContactKey) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const grid = "1.3fr 1fr 110px 52px 52px 72px 100px";
  const headers: { key: ContactKey; label: string }[] = [
    { key: "name",         label: "Journalist / Publication" },
    { key: "beat",         label: "Beat" },
    { key: "domain_rating",label: "DR" },
    { key: "pitches_sent", label: "Sent" },
    { key: "placements",   label: "Won" },
    { key: "placements",   label: "Rate" },
    { key: "last_contact", label: "Last Contact" },
  ];

  return (
    <div>
      {/* Add Contact button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: "8px 18px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
        >
          + Add Contact
        </button>
      </div>

      {journalists.length === 0 ? (
        <EmptyState message="No journalists yet. Click '+ Add Contact' to start building your media list." />
      ) : (
        <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: grid, background: INK, color: PAPER }}>
            {headers.map((col, i) => (
              <div key={col.label} onClick={() => handleSort(col.key)} style={{
                padding: "11px 12px", cursor: "pointer",
                borderRight: i < headers.length - 1 ? "1px solid rgba(241,235,222,.15)" : "none",
                fontFamily: GROT, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.16em", textTransform: "uppercase", userSelect: "none", whiteSpace: "nowrap",
              }}>
                {col.label}{i !== 5 ? arrow(col.key) : ""}
              </div>
            ))}
          </div>

          {sorted.map((j, idx) => {
            const rate = j.pitches_sent > 0 ? Math.round((j.placements / j.pitches_sent) * 100) : 0;
            return (
              <div key={j.id} style={{ display: "grid", gridTemplateColumns: grid, borderBottom: idx < sorted.length - 1 ? `1px solid ${INK15}` : "none" }}>
                <div style={cc(false)}>
                  <div style={{ overflow: "hidden", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{j.name}</span>
                      {j.outlet && <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: INK55, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.outlet}</span>}
                    </div>
                    {j.email && <div style={{ fontFamily: MONO, fontSize: 11, color: INK35, marginTop: 2 }}>{j.email}</div>}
                  </div>
                </div>
                <div style={cc(true)}><span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.08em", color: INK70, lineHeight: 1.3 }}>{j.beat ?? "—"}</span></div>
                <div style={{ ...cc(true), justifyContent: "center" }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: (j.domain_rating ?? 0) >= 80 ? INK : INK70 }}>{j.domain_rating ?? "—"}</span>
                </div>
                <div style={{ ...cc(true), justifyContent: "center" }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{j.pitches_sent}</span>
                </div>
                <div style={{ ...cc(true), justifyContent: "center" }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{j.placements}</span>
                </div>
                <div style={{ ...cc(true), justifyContent: "center" }}>
                  <span style={{ fontFamily: GROT, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: rate >= 50 ? INK : INK55, background: rate >= 50 ? YEL : "transparent", padding: rate >= 50 ? "2px 6px" : 0 }}>
                    {rate}%
                  </span>
                </div>
                <div style={cc(true)}>
                  {j.last_contact ? (
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 12, whiteSpace: "nowrap" }}>{fmt(j.last_contact)}</div>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 1, whiteSpace: "nowrap" }}>{daysAgoLabel(j.last_contact)}</div>
                    </div>
                  ) : <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
        {journalists.length} contacts · Click column headers to sort
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (input) => { await onAddJournalist(input); setShowAddModal(false); }}
        />
      )}
    </div>
  );
}

function AddContactModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: CreateJournalistInput) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateJournalistInput>({ name: "", outlet: "", beat: "", email: "", twitter_handle: "", domain_rating: null, notes: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof CreateJournalistInput, v: string | number | null) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", background: PAPER,
    border: `1px solid ${INK}`, fontFamily: SERIF, fontSize: 15, color: INK,
    outline: "none", boxSizing: "border-box",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onSubmit({ ...form, name: form.name.trim() });
    setSaved(true); setSaving(false);
  };

  if (saved) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,16,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
        <div style={{ background: PAPER, border: `1px solid ${INK}`, padding: 48, maxWidth: 440, textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 40, height: 40, background: YEL, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 18 }}>→</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Contact added</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55, marginBottom: 24 }}>{form.name} saved to your journalist database.</div>
          <button onClick={onClose} style={{ padding: "12px 28px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,16,.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, paddingTop: 60, overflowY: "auto" }} onClick={onClose}>
      <form onSubmit={handleSubmit} style={{ background: PAPER, border: `1px solid ${INK}`, width: "100%", maxWidth: 580, marginBottom: 60 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: INK, color: PAPER }}>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Add Journalist</span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: PAPER, fontFamily: GROT, fontWeight: 900, fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <MField label="Name *">
            <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g., Sarah Chen" style={inp} />
          </MField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <MField label="Outlet">
              <input value={form.outlet ?? ""} onChange={e => set("outlet", e.target.value)} placeholder="e.g., TechCrunch" style={inp} />
            </MField>
            <MField label="Beat">
              <input value={form.beat ?? ""} onChange={e => set("beat", e.target.value)} placeholder="e.g., SaaS / Startups" style={inp} />
            </MField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <MField label="Email">
              <input type="email" value={form.email ?? ""} onChange={e => set("email", e.target.value)} placeholder="journalist@outlet.com" style={inp} />
            </MField>
            <MField label="Twitter / X">
              <input value={form.twitter_handle ?? ""} onChange={e => set("twitter_handle", e.target.value)} placeholder="@handle" style={inp} />
            </MField>
            <MField label="Domain Rating">
              <input type="number" min={0} max={100} value={form.domain_rating ?? ""} onChange={e => set("domain_rating", e.target.value ? parseInt(e.target.value) : null)} placeholder="0–100" style={inp} />
            </MField>
          </div>
          <MField label="Notes">
            <textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Beat interests, preferred pitch format, previous interactions…" style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
          </MField>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: `1px solid ${INK15}` }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>Saved to your journalist database</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${INK35}`, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "10px 20px", background: saving ? INK55 : YEL, border: "none", fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Saving…" : "Add Contact →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function cc(border: boolean): React.CSSProperties {
  return { padding: "12px 12px", borderLeft: border ? `1px solid ${INK15}` : "none", display: "flex", alignItems: "center", gap: 4, overflow: "hidden", minWidth: 0 };
}

// ── PESO Dashboard ─────────────────────────────────────────────────────────────

function PESODashboard({
  pitches,
  alerts,
  onAlertStatusChange,
}: {
  pitches: DbPitch[];
  alerts: DbAlert[];
  onAlertStatusChange: (id: string, status: AlertStatus) => void;
}) {
  const pesoTypes: PesoType[] = ["Earned", "Shared", "Owned", "Paid"];

  const pesoData = useMemo(() => pesoTypes.map(type => {
    const ps = pitches.filter(p => p.peso_type === type);
    const placed = ps.filter(p => p.stage === "placed" || p.stage === "amplified");
    const points = placed.reduce((s, p) => s + (p.points ?? 0), 0);
    const drItems = placed.filter(p => p.domain_rating);
    const avgDR = drItems.length ? Math.round(drItems.reduce((s, p) => s + (p.domain_rating ?? 0), 0) / drItems.length) : 0;
    return { type, total: ps.length, placed: placed.length, points, avgDR };
  }), [pitches]);

  const totalPitches = pitches.length;
  const totalPlaced  = pitches.filter(p => p.stage === "placed" || p.stage === "amplified").length;
  const convRate     = totalPitches > 0 ? Math.round((totalPlaced / totalPitches) * 100) : 0;

  const descriptions: Record<PesoType, string> = {
    Earned: "Media coverage earned through pitching, expert quotes, HARO responses, and guest contributions. The core of the EMOS playbook.",
    Shared: "Content distributed via social platforms — LinkedIn posts, Twitter threads, community shares. Amplifies earned wins.",
    Owned:  "Content published on your own properties — blog, newsletter, podcast. Full editorial control, permanent real estate.",
    Paid:   "Sponsored content, paid placements, native advertising. Used strategically to amplify earned coverage or fill gaps.",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
        {pesoData.map((p, i) => {
          const earned = p.type === "Earned";
          return (
            <div key={p.type} style={{ padding: "28px 20px", borderRight: i < 3 ? `1px solid ${INK}` : "none", background: earned ? INK : "transparent", color: earned ? PAPER : INK }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, lineHeight: 0.9, letterSpacing: "-0.04em", color: earned ? YEL : INK15, marginBottom: 16 }}>
                {p.type.charAt(0)}
              </div>
              <div style={{ fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12, color: earned ? YEL : INK55 }}>
                {p.type}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: earned ? "rgba(241,235,222,.7)" : INK70, marginBottom: 20, minHeight: 65 }}>
                {descriptions[p.type]}
              </div>
              <div style={{ borderTop: earned ? "1px solid rgba(241,235,222,.2)" : `1px solid ${INK15}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {([["Pitches", p.total], ["Placed", p.placed], ["Points", p.points], ["Avg DR", p.avgDR || "—"]] as [string, number | string][]).map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: earned ? "rgba(241,235,222,.5)" : INK55 }}>{label}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: earned ? PAPER : INK }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${INK}`, marginBottom: 32 }}>
        <div style={{ padding: "28px 24px", borderRight: `1px solid ${INK}` }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>OVERALL CONVERSION RATE</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 48, lineHeight: 1, color: INK, letterSpacing: "-0.02em" }}>{convRate}%</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55, marginTop: 6 }}>{totalPlaced} placed out of {totalPitches} total pitches</div>
        </div>
        <div style={{ padding: "28px 24px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginBottom: 8 }}>PESO DISTRIBUTION</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pesoData.map(p => {
              const pct = totalPitches > 0 ? Math.round((p.total / totalPitches) * 100) : 0;
              return (
                <div key={p.type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", width: 60, color: INK55 }}>{p.type}</span>
                  <div style={{ flex: 1, height: 12, background: INK15 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: p.type === "Earned" ? YEL : INK, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, width: 36, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionMast number="§ A" label="Alerts Feed" vol="GOOGLE ALERTS + MENTION" />
      <AlertsFeed alerts={alerts} onStatusChange={onAlertStatusChange} />
    </div>
  );
}

function AlertsFeed({
  alerts,
  onStatusChange,
}: {
  alerts: DbAlert[];
  onStatusChange: (id: string, status: AlertStatus) => void;
}) {
  const [filter, setFilter] = useState<AlertStatus | "all">("all");
  const filtered = filter === "all" ? alerts : alerts.filter(a => a.status === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["all", "new", "reviewed", "archived"] as const).map(f => (
          <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}
            label={f === "all" ? `All (${alerts.length})` : `${f} (${alerts.filter(a => a.status === f).length})`}
          />
        ))}
      </div>
      <div style={{ border: `1px solid ${INK}` }}>
        {filtered.length === 0 ? (
          <EmptyState message="No alerts matching this filter." />
        ) : filtered.map((alert, idx) => (
          <div key={alert.id} style={{
            display: "grid", gridTemplateColumns: "80px 60px 1fr 120px",
            borderBottom: idx < filtered.length - 1 ? `1px solid ${INK15}` : "none",
            background: alert.status === "new" ? "oklch(97% .03 80 / .5)" : "transparent",
          }}>
            <div style={{ padding: "12px 14px", fontFamily: MONO, fontSize: 12 }}>{fmt(alert.detected_at)}</div>
            <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
              <AlertTypeBadge type={alert.alert_type} />
            </div>
            <div style={{ padding: "12px 14px", borderLeft: `1px solid ${INK15}` }}>
              {alert.url
                ? <a href={alert.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 14, color: INK, borderBottom: `1px solid ${YEL}`, textDecoration: "none" }}>{alert.title}</a>
                : <span style={{ fontFamily: SERIF, fontSize: 14 }}>{alert.title}</span>}
            </div>
            <div style={{ padding: "12px 14px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>
                {alert.source ?? "—"}
              </span>
              {alert.status === "new" && (
                <button
                  onClick={() => onStatusChange(alert.id, "reviewed")}
                  style={{ marginLeft: "auto", padding: "4px 8px", background: INK, color: PAPER, border: "none", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── New Pitch Modal ────────────────────────────────────────────────────────────

interface PitchForm {
  subject: string;
  journalist_id: string;
  client: string;
  peso_type: PesoType;
  stage: Stage;
  team: string;
  data_source: DataSource;
  notes: string;
}

function NewPitchModal({
  journalists,
  onClose,
  onSubmit,
}: {
  journalists: DbJournalist[];
  onClose: () => void;
  onSubmit: (input: CreatePitchInput) => Promise<void>;
}) {
  const [form, setForm] = useState<PitchForm>({
    subject: "", journalist_id: "", client: "", peso_type: "Earned",
    stage: "drafted", team: "", data_source: "manual", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof PitchForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    background: PAPER, border: `1px solid ${INK}`,
    fontFamily: SERIF, fontSize: 15, color: INK,
    outline: "none", boxSizing: "border-box",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setSaving(true);
    await onSubmit({
      subject: form.subject,
      journalist_id: form.journalist_id || null,
      client: form.client || null,
      team: form.team || null,
      peso_type: form.peso_type,
      stage: form.stage,
      data_source: form.data_source,
      notes: form.notes || null,
    });
    setSaved(true);
    setSaving(false);
  };

  if (saved) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,16,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
        <div style={{ background: PAPER, border: `1px solid ${INK}`, padding: 48, maxWidth: 480, textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 40, height: 40, background: YEL, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 18 }}>→</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Pitch logged</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55, marginBottom: 24 }}>
            &ldquo;{form.subject}&rdquo; added to pipeline as {form.stage}.
          </div>
          <button onClick={onClose} style={{ padding: "12px 28px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,16,.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, paddingTop: 60, overflowY: "auto" }} onClick={onClose}>
      <form onSubmit={handleSubmit}
        style={{ background: PAPER, border: `1px solid ${INK}`, width: "100%", maxWidth: 640, marginBottom: 60 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: INK, color: PAPER }}>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>New Pitch</span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: PAPER, fontFamily: GROT, fontWeight: 900, fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          <MField label="Pitch Subject">
            <input type="text" required value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="e.g., Data study: 73% of earned links outperform paid" style={inp} />
          </MField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <MField label="Journalist">
              <select value={form.journalist_id} onChange={e => set("journalist_id", e.target.value)} style={inp}>
                <option value="">Select or leave blank</option>
                {journalists.map(j => <option key={j.id} value={j.id}>{j.name}{j.outlet ? ` — ${j.outlet}` : ""}</option>)}
              </select>
            </MField>
            <MField label="Client">
              <input type="text" value={form.client} onChange={e => set("client", e.target.value)} placeholder="e.g., DMR.agency" style={inp} />
            </MField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <MField label="PESO Type">
              <select value={form.peso_type} onChange={e => set("peso_type", e.target.value as PesoType)} style={inp}>
                {(["Earned","Shared","Owned","Paid"] as PesoType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </MField>
            <MField label="Pipeline Stage">
              <select value={form.stage} onChange={e => set("stage", e.target.value as Stage)} style={inp}>
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </MField>
            <MField label="Team">
              <select value={form.team} onChange={e => set("team", e.target.value)} style={inp}>
                <option value="">Select team</option>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </MField>
          </div>

          <MField label="Data Source">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DATA_SOURCES.map(src => (
                <button key={src} type="button" onClick={() => set("data_source", src)} style={{
                  padding: "7px 14px",
                  background: form.data_source === src ? INK : "transparent",
                  color: form.data_source === src ? PAPER : INK55,
                  border: `1px solid ${form.data_source === src ? INK : INK35}`,
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                }}>
                  {src}
                </button>
              ))}
            </div>
          </MField>

          <MField label="Notes">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Any additional context, angles, or data points…" style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
          </MField>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: `1px solid ${INK15}` }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>Pitch will be saved to your Supabase database</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", background: "transparent", border: `1px solid ${INK35}`, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "10px 20px", background: saving ? INK55 : YEL, border: "none", fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Saving…" : "Log Pitch →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Main CoverageIQPlatform shell ──────────────────────────────────────────────

type TabId = "pipeline" | "followups" | "coverage" | "contacts" | "peso";

interface CoverageIQPlatformProps {
  initialPitches: DbPitch[];
  initialJournalists: DbJournalist[];
  initialAlerts: DbAlert[];
}

export default function CoverageIQPlatform({
  initialPitches,
  initialJournalists,
  initialAlerts,
}: CoverageIQPlatformProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const followUpCount =
    initialPitches.filter(p => p.follow_up_due && new Date(p.follow_up_due) <= today).length +
    initialPitches.filter(p => !p.follow_up_due && (p.stage === "sent" || p.stage === "opened") && p.sent_date && (today.getTime() - new Date(p.sent_date).getTime()) / 86400000 > 5).length;

  const handleCreatePitch = useCallback(async (input: CreatePitchInput) => {
    await createPitch(input);
    startTransition(() => { router.refresh(); });
  }, [router]);

  const handleStageChange = useCallback((id: string, stage: Stage) => {
    startTransition(async () => {
      await updatePitchStage(id, stage);
      router.refresh();
    });
  }, [router]);

  const handleAlertStatusChange = useCallback((id: string, status: AlertStatus) => {
    startTransition(async () => {
      await updateAlertStatus(id, status);
      router.refresh();
    });
  }, [router]);

  const handleAddJournalist = useCallback(async (input: CreateJournalistInput) => {
    await createJournalist(input);
    startTransition(() => { router.refresh(); });
  }, [router]);

  const handleDeleteJournalist = useCallback(async (id: string) => {
    await deleteJournalist(id);
    startTransition(() => { router.refresh(); });
  }, [router]);

  const tabs: { id: TabId; label: string; count: number | null; highlight?: boolean }[] = [
    { id: "pipeline",  label: "Pipeline",      count: initialPitches.length },
    { id: "followups", label: "Follow-ups",    count: followUpCount, highlight: followUpCount > 0 },
    { id: "coverage",  label: "Coverage Log",  count: initialPitches.filter(p => p.stage === "placed" || p.stage === "amplified").length },
    { id: "contacts",  label: "Contacts",      count: initialJournalists.length },
    { id: "peso",      label: "PESO Dashboard",count: null },
  ];

  const sectionMastProps: Record<TabId, { number: string; label: string; vol: string }> = {
    pipeline:  { number: "§ 01", label: "Pitch Pipeline",      vol: "DRAFTED → AMPLIFIED" },
    followups: { number: "§ 02", label: "Follow-ups",          vol: "ACTIONS + REMINDERS" },
    coverage:  { number: "§ 03", label: "Coverage Log",        vol: "PLACEMENTS + POINTS" },
    contacts:  { number: "§ 04", label: "Journalist Contacts", vol: "RELATIONSHIP INDEX" },
    peso:      { number: "§ 05", label: "PESO Dashboard",      vol: "PAID · EARNED · SHARED · OWNED" },
  };

  const css = `
    .ciq-tab { transition: all 0.12s ease; }
    .ciq-tab:hover { opacity: 0.8; }
    @media (max-width: 700px) {
      .ciq-funnel { grid-template-columns: repeat(3, 1fr) !important; }
    }
  `;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF, opacity: isPending ? 0.75 : 1, transition: "opacity 0.15s" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Header */}
      <ToolHeader
        toolPrefix="Coverage"
        subtitle="Pitch Tracking CRM · EMOS Platform"
        rightContent={
          <>
            <button
              onClick={() => setShowModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
            >
              + New Pitch
            </button>
            {followUpCount > 0 && (
              <button
                onClick={() => setActiveTab("followups")}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: YEL, border: "none", fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, cursor: "pointer" }}
              >
                <span style={{ width: 6, height: 6, background: INK, display: "inline-block" }} />
                {followUpCount} ACTION{followUpCount !== 1 ? "S" : ""} DUE
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}>
              <span style={{ width: 6, height: 6, background: YEL, borderRadius: "50%", display: "inline-block" }} />
              LIVE · SUPABASE
            </div>
          </>
        }
      />

      {/* Tab nav */}
      <div style={{ borderBottom: `1px solid ${INK35}`, background: PAPER, position: "sticky", top: 52, zIndex: 49 }}>
        <div style={{ display: "flex", maxWidth: 1240, marginInline: "auto", paddingInline: "clamp(20px,4vw,56px)", overflowX: "auto" }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="ciq-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 20px", background: active ? INK : "transparent",
                  color: active ? PAPER : INK55,
                  border: "none", borderRight: `1px solid ${INK15}`,
                  fontFamily: GROT, fontWeight: 700, fontSize: 10,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    fontFamily: MONO, fontWeight: 700, fontSize: 10, opacity: active ? 0.6 : 0.5,
                    background: tab.highlight && !active ? YEL : "transparent",
                    color: tab.highlight && !active ? INK : "inherit",
                    padding: tab.highlight && !active ? "1px 5px" : 0,
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back to dashboard link */}
      <div style={{ maxWidth: 1240, marginInline: "auto", paddingInline: "clamp(20px,4vw,56px)", paddingTop: 12 }}>
        <a href="/emostool/dashboard" style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, textDecoration: "none", borderBottom: `1px solid ${INK35}` }}>
          ← EMOS Dashboard
        </a>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1240, marginInline: "auto", padding: "24px clamp(20px,4vw,56px) 80px" }}>
        <SectionMast {...sectionMastProps[activeTab]} />
        {activeTab === "pipeline"  && <PipelineView  pitches={initialPitches} onStageChange={handleStageChange} />}
        {activeTab === "followups" && <FollowUpsView pitches={initialPitches} />}
        {activeTab === "coverage"  && <CoverageLogView pitches={initialPitches} />}
        {activeTab === "contacts"  && <ContactsView journalists={initialJournalists} onAddJournalist={handleAddJournalist} onDeleteJournalist={handleDeleteJournalist} />}
        {activeTab === "peso"      && <PESODashboard pitches={initialPitches} alerts={initialAlerts} onAlertStatusChange={handleAlertStatusChange} />}
      </main>

      {/* Modal */}
      {showModal && (
        <NewPitchModal
          journalists={initialJournalists}
          onClose={() => setShowModal(false)}
          onSubmit={async (input) => { await handleCreatePitch(input); setShowModal(false); }}
        />
      )}
    </div>
  );
}
