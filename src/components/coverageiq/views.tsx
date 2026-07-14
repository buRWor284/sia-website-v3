"use client";

// ─────────────────────────────────────────────────────────────────────────────
// CoverageIQ — shared tab views (view-model driven)
// The 5 tabs + follow-up sections + alerts feed + new-pitch modal + contact
// forms, all consuming the normalized Vm* view-model plus optional capability
// callbacks. Public passes read-mostly caps; the dashboard passes full CRUD.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import {
  PAPER, PAPER2, INK, INK70, INK55, INK35, INK15,
  YEL, SERIF, GROT, MONO,
} from "@/lib/tokens";
import {
  PIPELINE_STAGES, StageBadge, PESOBadge, DRBar, PointsBadge, AlertTypeBadge,
  FilterPill, SectionMast, EmptyState, DetailColHead, DetailRow, MField, StageLegend,
  fmt, daysAgoLabel, logCell, cc,
} from "@/components/coverageiq/primitives";
import {
  fmtDataSource,
  type VmPitch, type VmJournalist, type VmAlert,
  type Stage, type PesoType, type AlertStatus, type DataSource,
  type Urgency, type NewPitchDraft, type CreateJournalistInput,
} from "@/lib/coverageiq/types";

// ─── Pipeline View ─────────────────────────────────────────────────────────────

export function PipelineView({
  pitches,
  onStageChange,
  showStageLegend,
}: {
  pitches: VmPitch[];
  onStageChange?: (id: string, stage: Stage) => void;
  showStageLegend?: boolean;
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
      <div style={{ border: `1px solid ${INK}`, marginBottom: 28, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
       <div style={{ display: "grid", gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, minmax(96px, 1fr))`, minWidth: 620 }}>
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
      </div>

      {showStageLegend && <StageLegend />}

      {pitches.length === 0 ? (
        <EmptyState message="No pitches yet. Add your first pitch to get started." />
      ) : (
        <>
        <div className="ciq-scroll-hint"><span>⇆</span> Swipe table to see more columns</div>
        <div style={{ border: `1px solid ${INK}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "minmax(200px,1fr) 150px 96px 80px 64px 72px",
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
                    display: "grid", gridTemplateColumns: "minmax(200px,1fr) 150px 96px 80px 64px 72px",
                    borderBottom: `1px solid ${INK15}`, cursor: "pointer",
                    background: isExpanded ? PAPER2 : "transparent",
                    transition: "background 0.12s",
                  }}
                >
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 3, overflow: "hidden", minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: INK }}>{pitch.subject}</span>
                    <span style={{ fontFamily: GROT, fontSize: 10, color: INK55, letterSpacing: "0.08em" }}>
                      {pitch.client ?? "—"}{pitch.sentDate ? ` · ${fmt(pitch.sentDate)}` : pitch.stage === "drafted" ? " · Not sent" : ""}
                    </span>
                  </div>
                  <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, overflow: "hidden", minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pitch.journalistName ?? "—"}
                    </span>
                    {pitch.journalistName && pitch.journalistOutlet && (
                      <span style={{ fontFamily: GROT, fontSize: 9, color: INK55, letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {pitch.journalistOutlet}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                    <StageBadge stage={pitch.stage} />
                  </div>
                  <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0 }}>
                    <DRBar value={pitch.dr} />
                  </div>
                  <div style={{ padding: "14px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PESOBadge type={pitch.peso} />
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
                      <DetailRow label="Team"         value={pitch.team ?? "—"} />
                      <DetailRow label="Data Source"  value={fmtDataSource(pitch.dataSource)} />
                      <DetailRow label="Link Type"    value={pitch.linkType ?? "—"} />
                      <DetailRow label="Content Type" value={pitch.contentType ?? "—"} />
                      {onStageChange && (
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
                      )}
                    </div>
                    {/* Col 2 — timeline */}
                    <div>
                      <DetailColHead>Timeline</DetailColHead>
                      <DetailRow label="Sent"          value={fmt(pitch.sentDate)} />
                      <DetailRow label="Placed"        value={fmt(pitch.placedDate)} />
                      <DetailRow label="Follow-up Due" value={pitch.followUpDue ? fmt(pitch.followUpDue) : "—"} />
                      {pitch.followUpDue && new Date(pitch.followUpDue) <= new Date() && (
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
                      <DetailRow label="Anchor Text" value={pitch.anchorText ?? "—"} />
                      {pitch.url && (
                        <div style={{ marginTop: 6 }}>
                          <a href={pitch.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: MONO, fontSize: 11, color: INK, borderBottom: `1px solid ${YEL}`, wordBreak: "break-all", textDecoration: "none" }}>
                            {pitch.url.replace("https://", "").substring(0, 45)}…
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
        </>
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

// ─── Follow-ups View ───────────────────────────────────────────────────────────

export function FollowUpsView({ pitches }: { pitches: VmPitch[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const overdue    = pitches.filter(p => p.followUpDue && new Date(p.followUpDue) < today);
  const dueToday   = pitches.filter(p => p.followUpDue && new Date(p.followUpDue).toDateString() === today.toDateString());
  const upcoming   = pitches.filter(p => p.followUpDue && new Date(p.followUpDue) > today);
  const stalled    = pitches.filter(p => !p.followUpDue && (p.stage === "sent" || p.stage === "opened") && p.sentDate && (today.getTime() - new Date(p.sentDate).getTime()) / 86400000 > 5);
  const readyToAmp = pitches.filter(p => p.stage === "placed" && p.placedDate && (today.getTime() - new Date(p.placedDate).getTime()) / 86400000 < 14);
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
      <div style={{ border: `1px solid ${INK}`, marginBottom: 28, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(84px, 1fr))", minWidth: 460 }}>
        {summary.map((item, i) => (
          <div key={i} style={{ padding: "18px 14px", borderRight: i < 4 ? `1px solid ${INK}` : "none", background: item.highlight ? YEL : "transparent" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>{item.num}</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: item.highlight ? INK : INK55, marginTop: 5 }}>{item.label}</div>
          </div>
        ))}
       </div>
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
  title: string; subtitle: string; items: VmPitch[]; urgency: Urgency; today: Date;
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
      <div className="ciq-scroll-hint"><span>⇆</span> Swipe table to see more columns</div>
      <div style={{ border: `1px solid ${INK}`, borderTop: "none", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
       <div style={{ minWidth: 700 }}>
        {items.map((pitch, idx) => {
          const daysDiff = pitch.followUpDue ? Math.round((new Date(pitch.followUpDue).getTime() - today.getTime()) / 86400000) : null;
          const daysSinceSent = pitch.sentDate ? Math.round((today.getTime() - new Date(pitch.sentDate).getTime()) / 86400000) : null;
          return (
            <div key={pitch.id} style={{
              display: "grid", gridTemplateColumns: "minmax(200px, 1fr) 160px 100px 120px 160px",
              borderBottom: idx < items.length - 1 ? `1px solid ${INK15}` : "none",
              alignItems: "center",
            }}>
              <div style={{ padding: "14px 16px", overflow: "hidden", minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pitch.subject}</div>
                <div style={{ fontFamily: GROT, fontSize: 10, color: INK55, letterSpacing: "0.06em", marginTop: 3 }}>{pitch.client ?? "—"}</div>
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}`, overflow: "hidden", minWidth: 0 }}>
                {pitch.journalistName
                  ? <>
                      <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600 }}>{pitch.journalistName}</div>
                      {pitch.journalistOutlet && <div style={{ fontFamily: GROT, fontSize: 9, color: INK55, letterSpacing: "0.06em" }}>{pitch.journalistOutlet}</div>}
                    </>
                  : <span style={{ color: INK35 }}>—</span>}
              </div>
              <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}` }}>
                <StageBadge stage={pitch.stage} />
              </div>
              <div style={{ padding: "14px 16px", borderLeft: `1px solid ${INK15}` }}>
                {pitch.followUpDue
                  ? <>
                      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: daysDiff !== null && daysDiff < 0 ? INK : INK70 }}>{fmt(pitch.followUpDue)}</div>
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
                <button
                  onClick={e => {
                    if (urgency === "amplify") {
                      if (pitch.url) window.open(pitch.url, "_blank", "noopener,noreferrer");
                    } else {
                      const email = pitch.journalistEmail;
                      if (email) {
                        navigator.clipboard.writeText(email).then(() => {
                          const btn = e.currentTarget as HTMLButtonElement;
                          const orig = btn.textContent ?? "";
                          btn.textContent = "Copied!";
                          setTimeout(() => { btn.textContent = orig; }, 1500);
                        });
                      }
                    }
                  }}
                  style={{ padding: "7px 14px", background: btnBg, color: btnFg, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                  {actionLabel}
                </button>
              </div>
            </div>
          );
        })}
       </div>
      </div>
    </div>
  );
}

// ─── Coverage Log View ─────────────────────────────────────────────────────────

type CoverageLogKey = "placedDate" | "journalistOutlet" | "anchorText" | "dr" | "peso" | "linkType" | "contentType" | "points";

export function CoverageLogView({ pitches }: { pitches: VmPitch[] }) {
  const [sortBy, setSortBy] = useState<CoverageLogKey>("placedDate");
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
  const drItems = coverageLog.filter(c => c.dr);
  const avgDR = drItems.length ? Math.round(drItems.reduce((s, c) => s + (c.dr ?? 0), 0) / drItems.length) : 0;
  const doFollow = coverageLog.filter(c => c.linkType === "Do Follow").length;

  const cols: { key: CoverageLogKey; label: string; w: string }[] = [
    { key: "placedDate",       label: "Date",        w: "90px" },
    { key: "journalistOutlet", label: "Publication", w: "150px" },
    { key: "anchorText",       label: "Anchor Text", w: "minmax(160px,1fr)" },
    { key: "dr",               label: "DR",          w: "80px" },
    { key: "peso",             label: "PESO",        w: "72px" },
    { key: "linkType",         label: "Link",        w: "82px" },
    { key: "contentType",      label: "Type",        w: "82px" },
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
        <>
        <div className="ciq-scroll-hint"><span>⇆</span> Swipe table to see more columns</div>
        <div style={{ border: `1px solid ${INK}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
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
            const outlet = entry.journalistOutlet ?? (entry.peso === "Shared" ? "LinkedIn" : entry.journalistName ?? "—");
            return (
              <div key={entry.id} style={{ display: "grid", gridTemplateColumns: grid, borderBottom: idx < sorted.length - 1 ? `1px solid ${INK15}` : "none" }}>
                <div style={logCell(false)}><span style={{ fontFamily: MONO, fontSize: 12 }}>{fmt(entry.placedDate)}</span></div>
                <div style={logCell(true)}>
                  {entry.url
                    ? <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: INK, borderBottom: `1px solid ${YEL}`, textDecoration: "none" }}>{outlet}</a>
                    : <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600 }}>{outlet}</span>}
                </div>
                <div style={logCell(true)}><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70 }}>{entry.anchorText ?? "—"}</span></div>
                <div style={logCell(true)}><DRBar value={entry.dr} /></div>
                <div style={logCell(true)}><PESOBadge type={entry.peso} /></div>
                <div style={logCell(true)}>
                  <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: entry.linkType === "Do Follow" ? INK : INK55 }}>
                    {entry.linkType ?? "—"}
                  </span>
                </div>
                <div style={logCell(true)}>
                  <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55 }}>
                    {entry.contentType ?? "—"}
                  </span>
                </div>
                <div style={logCell(true)}><PointsBadge points={entry.points} /></div>
              </div>
            );
          })}
        </div>
        </>
      )}

      <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
        {coverageLog.length} placements logged · Click column headers to sort
      </div>
    </div>
  );
}

// ─── Contacts View ─────────────────────────────────────────────────────────────

type ContactKey = keyof VmJournalist;

export interface ContactsCaps {
  onAdd: (input: CreateJournalistInput) => Promise<void>;
  onUpdate: (id: string, input: CreateJournalistInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ContactsView({
  journalists,
  contacts,
}: {
  journalists: VmJournalist[];
  contacts?: ContactsCaps;
}) {
  const [sortBy, setSortBy] = useState<ContactKey>("lastContact");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const expandable = !!contacts;

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

  const grid = "minmax(180px,1.3fr) minmax(90px,1fr) 110px 52px 52px 72px 100px";
  const headers: { key: ContactKey; label: string }[] = [
    { key: "name",        label: "Journalist / Publication" },
    { key: "beat",        label: "Beat" },
    { key: "dr",          label: "DR" },
    { key: "pitchesSent", label: "Sent" },
    { key: "placements",  label: "Won" },
    { key: "placements",  label: "Rate" }, // computed — not sortable
    { key: "lastContact", label: "Last Contact" },
  ];

  return (
    <div>
      {contacts && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ padding: "8px 18px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
          >
            + Add Contact
          </button>
        </div>
      )}

      {journalists.length === 0 ? (
        <EmptyState message={contacts ? "No journalists yet. Click '+ Add Contact' to start building your media list." : "No contacts yet."} />
      ) : (
        <>
        <div className="ciq-scroll-hint"><span>⇆</span> Swipe table to see more columns</div>
        <div style={{ border: `1px solid ${INK}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "grid", gridTemplateColumns: grid, background: INK, color: PAPER }}>
            {headers.map((col, i) => (
              <div key={col.label} onClick={i !== 5 ? () => handleSort(col.key) : undefined} style={{
                padding: "11px 12px", cursor: i !== 5 ? "pointer" : "default",
                borderRight: i < headers.length - 1 ? "1px solid rgba(241,235,222,.15)" : "none",
                fontFamily: GROT, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.16em", textTransform: "uppercase", userSelect: "none", whiteSpace: "nowrap",
              }}>
                {col.label}{i !== 5 ? arrow(col.key) : ""}
              </div>
            ))}
          </div>

          {sorted.map((j, idx) => {
            const rate = j.pitchesSent > 0 ? Math.round((j.placements / j.pitchesSent) * 100) : 0;
            const isExpanded = expandable && expandedId === j.id;
            return (
              <div key={j.id}>
                <div
                  onClick={expandable ? () => { setExpandedId(isExpanded ? null : j.id); setEditingId(null); } : undefined}
                  style={{ display: "grid", gridTemplateColumns: grid, borderBottom: !isExpanded && idx < sorted.length - 1 ? `1px solid ${INK15}` : "none", cursor: expandable ? "pointer" : "default", background: isExpanded ? PAPER2 : "transparent", transition: "background 0.12s" }}
                >
                  <div style={cc(false)}>
                    <div style={{ overflow: "hidden", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{j.name}</span>
                        {j.outlet && <span style={{ fontFamily: GROT, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: INK55, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.outlet}</span>}
                      </div>
                      {j.email && <div style={{ fontFamily: MONO, fontSize: 11, color: INK70, marginTop: 2 }}>{j.email}</div>}
                    </div>
                  </div>
                  <div style={cc(true)}><span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.08em", color: INK70, lineHeight: 1.3 }}>{j.beat ?? "—"}</span></div>
                  <div style={{ ...cc(true), justifyContent: "center" }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: (j.dr ?? 0) >= 80 ? INK : INK70 }}>{j.dr ?? "—"}</span>
                  </div>
                  <div style={{ ...cc(true), justifyContent: "center" }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>{j.pitchesSent}</span>
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
                    {j.lastContact ? (
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: 12, whiteSpace: "nowrap" }}>{fmt(j.lastContact)}</div>
                        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: INK55, marginTop: 1, whiteSpace: "nowrap" }}>{daysAgoLabel(j.lastContact)}</div>
                      </div>
                    ) : <span style={{ color: INK35, fontFamily: MONO, fontSize: 12 }}>—</span>}
                  </div>
                </div>

                {/* Expanded panel (dashboard only) */}
                {isExpanded && contacts && (
                  <div style={{ background: PAPER2, borderBottom: idx < sorted.length - 1 ? `1px solid ${INK15}` : "none", padding: "16px 20px" }}>
                    {editingId === j.id ? (
                      <EditJournalistForm
                        journalist={j}
                        onSave={async (input) => { await contacts.onUpdate(j.id, input); setEditingId(null); }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                        <div>
                          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>Contact</div>
                          {[["Email", j.email], ["Twitter", j.twitter], ["DR", j.dr?.toString()]].map(([label, value]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${INK15}` }}>
                              <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>{label}</span>
                              <span style={{ fontFamily: SERIF, fontSize: 14, color: INK }}>{value ?? "—"}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>Beats</div>
                          <div style={{ fontFamily: SERIF, fontSize: 14, color: INK, lineHeight: 1.6 }}>
                            {j.beat ? j.beat.split(/[,/]/).map(b => b.trim()).filter(Boolean).map(b => (
                              <span key={b} style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", padding: "2px 8px 3px", marginRight: 4, marginBottom: 4 }}>{b}</span>
                            )) : <span style={{ color: INK35, fontStyle: "italic" }}>No beats added</span>}
                          </div>
                          {j.tags && j.tags.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>Tags</div>
                              <div>{j.tags.map(t => <span key={t} style={{ display: "inline-block", border: `1px solid ${INK35}`, fontFamily: GROT, fontSize: 8, letterSpacing: "0.1em", padding: "2px 7px 3px", marginRight: 4, marginBottom: 4, color: INK55 }}>{t}</span>)}</div>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>Notes</div>
                          {j.notes
                            ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, lineHeight: 1.6, margin: 0 }}>{j.notes}</p>
                            : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK35, margin: 0 }}>No notes yet.</p>}
                        </div>
                      </div>
                    )}
                    {editingId !== j.id && (
                      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                        <button onClick={e => { e.stopPropagation(); setEditingId(j.id); }} style={{ padding: "7px 16px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                          Edit Contact
                        </button>
                        <button onClick={e => { e.stopPropagation(); if (confirm(`Delete ${j.name}?`)) contacts.onDelete(j.id); }} style={{ padding: "7px 16px", background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${INK35}`, cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>
      )}
      <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
        {journalists.length} contacts · {contacts ? "Click a row to expand · " : ""}Click column headers to sort
      </div>

      {contacts && showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (input) => { await contacts.onAdd(input); setShowAddModal(false); }}
        />
      )}
    </div>
  );
}

function EditJournalistForm({
  journalist,
  onSave,
  onCancel,
}: {
  journalist: VmJournalist;
  onSave: (input: CreateJournalistInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateJournalistInput>({
    name: journalist.name,
    outlet: journalist.outlet ?? "",
    beat: journalist.beat ?? "",
    email: journalist.email ?? "",
    twitter_handle: journalist.twitter ?? "",
    domain_rating: journalist.dr ?? null,
    notes: journalist.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof CreateJournalistInput, v: string | number | null) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const inp: React.CSSProperties = {
    width: "100%", padding: "8px 10px", background: PAPER,
    border: `1px solid ${INK35}`, fontFamily: SERIF, fontSize: 14, color: INK,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Name</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Outlet</label>
          <input value={form.outlet ?? ""} onChange={e => set("outlet", e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Beat(s) — separate with commas</label>
          <input value={form.beat ?? ""} onChange={e => set("beat", e.target.value)} placeholder="e.g. Health, Startups, AI" style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Email</label>
          <input value={form.email ?? ""} onChange={e => set("email", e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Twitter / X</label>
          <input value={form.twitter_handle ?? ""} onChange={e => set("twitter_handle", e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Domain Rating</label>
          <input type="number" min={0} max={100} value={form.domain_rating ?? ""} onChange={e => set("domain_rating", e.target.value ? parseInt(e.target.value) : null)} style={inp} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55, marginBottom: 4 }}>Notes</label>
        <textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          disabled={saving}
          onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}
          style={{ padding: "7px 18px", background: saving ? INK55 : YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: saving ? "default" : "pointer" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button onClick={onCancel} style={{ padding: "7px 14px", background: "transparent", color: INK55, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${INK35}`, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
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

// ─── PESO Dashboard ────────────────────────────────────────────────────────────

const PESO_TYPES: PesoType[] = ["Earned", "Shared", "Owned", "Paid"];

export function PESODashboard({
  pitches,
  alerts,
  onAlertStatusChange,
  alertsComingSoon,
  alertsPublicChrome,
}: {
  pitches: VmPitch[];
  alerts: VmAlert[];
  onAlertStatusChange?: (id: string, status: AlertStatus) => void;
  alertsComingSoon?: boolean;
  alertsPublicChrome?: boolean;
}) {
  const pesoData = useMemo(() => PESO_TYPES.map(type => {
    const ps = pitches.filter(p => p.peso === type);
    const placed = ps.filter(p => p.stage === "placed" || p.stage === "amplified");
    const points = placed.reduce((s, p) => s + (p.points ?? 0), 0);
    const drItems = placed.filter(p => p.dr);
    const avgDR = drItems.length ? Math.round(drItems.reduce((s, p) => s + (p.dr ?? 0), 0) / drItems.length) : 0;
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
      <div style={{ border: `1px solid ${INK}`, marginBottom: 32, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", minWidth: 880 }}>
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
      {alertsComingSoon && (
        <div style={{ padding: "10px 14px", background: PAPER2, border: `1px solid ${INK15}`, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK35, background: INK15, padding: "2px 8px" }}>COMING SOON</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
            Will connect to Mention.com and/or Google Alerts RSS for live brand mention tracking.
          </span>
        </div>
      )}
      <AlertsFeed alerts={alerts} onStatusChange={onAlertStatusChange} publicChrome={alertsPublicChrome} />
    </div>
  );
}

function AlertsFeed({
  alerts,
  onStatusChange,
  publicChrome,
}: {
  alerts: VmAlert[];
  onStatusChange?: (id: string, status: AlertStatus) => void;
  publicChrome?: boolean;
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
      {publicChrome && (
        <div style={{
          display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center",
          marginBottom: 12, fontFamily: GROT, fontSize: 10, color: INK55,
        }}>
          {([
            ["SYN", "Syndication — your coverage republished elsewhere"],
            ["MEN", "Mention — you or your client referenced without a full pickup"],
            ["AMP", "Amplification — your content shared/boosted by someone else"],
          ] as const).map(([code, desc]) => (
            <span key={code}>
              <span style={{ fontFamily: GROT, fontWeight: 800, letterSpacing: "0.08em", color: INK }}>{code}</span>
              {" = " + desc}
            </span>
          ))}
        </div>
      )}
      <div style={{ border: `1px solid ${INK}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
       <div style={{ minWidth: 640 }}>
        {publicChrome && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "90px 80px minmax(220px, 1fr) 120px", background: INK, color: PAPER }}>
            {["Date", "Type", "Alert", "Source"].map((h, i) => (
              <div key={h} style={{
                padding: "11px 14px",
                borderLeft: i > 0 ? "1px solid rgba(241,235,222,.15)" : "none",
                fontFamily: GROT, fontWeight: 700, fontSize: 9,
                letterSpacing: "0.16em", textTransform: "uppercase",
              }}>
                {h}
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 ? (
          <EmptyState message="No alerts matching this filter." />
        ) : filtered.map((alert, idx) => (
          <div key={alert.id} style={{
            display: "grid", gridTemplateColumns: "90px 80px minmax(220px, 1fr) 120px",
            borderBottom: idx < filtered.length - 1 ? `1px solid ${INK15}` : "none",
            background: alert.status === "new" ? "oklch(97% .03 80 / .5)" : "transparent",
          }}>
            <div style={{ padding: "12px 14px", fontFamily: MONO, fontSize: 12, display: "flex", alignItems: "center" }}>{fmt(alert.date)}</div>
            <div style={{ padding: "12px 10px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
              <AlertTypeBadge type={alert.type} />
            </div>
            <div style={{ padding: "12px 14px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center", overflow: "hidden", minWidth: 0 }}>
              {alert.url
                ? <a href={alert.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SERIF, fontSize: 14, color: INK, borderBottom: `1px solid ${YEL}`, textDecoration: "none" }}>{alert.title}</a>
                : <span style={{ fontFamily: SERIF, fontSize: 14 }}>{alert.title}</span>}
            </div>
            <div style={{ padding: "12px 14px", borderLeft: `1px solid ${INK15}`, fontFamily: GROT, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{alert.source ?? "—"}</span>
              {onStatusChange && alert.status === "new" && (
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
    </div>
  );
}

// ─── New Pitch Modal ───────────────────────────────────────────────────────────

interface PitchForm {
  subject: string;
  journalistId: string;
  client: string;
  peso: PesoType;
  stage: Stage;
  team: string;
  dataSource: DataSource;
  notes: string;
}

export function NewPitchModal({
  journalists,
  prefillSubject,
  teams,
  dataSources,
  defaultDataSource,
  footerNote,
  savedSuffix,
  successSlot,
  onClose,
  onSubmit,
}: {
  journalists: VmJournalist[];
  prefillSubject?: string;
  teams: string[];
  dataSources: DataSource[];
  defaultDataSource: DataSource;
  footerNote: string;
  savedSuffix?: (stage: Stage) => string;
  successSlot?: (subject: string, stage: Stage) => React.ReactNode;
  onClose: () => void;
  onSubmit: (draft: NewPitchDraft) => Promise<void> | void;
}) {
  const [form, setForm] = useState<PitchForm>({
    subject: prefillSubject ?? "", journalistId: "", client: "", peso: "Earned",
    stage: "drafted", team: "", dataSource: defaultDataSource, notes: "",
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
      subject: form.subject.trim(),
      journalistId: form.journalistId || null,
      client: form.client.trim() || null,
      team: form.team || null,
      peso: form.peso,
      stage: form.stage,
      dataSource: form.dataSource,
      notes: form.notes.trim() || null,
    });
    setSaved(true);
    setSaving(false);
  };

  const suffix = savedSuffix ?? ((stage: Stage) => ` added to pipeline as ${stage}.`);

  if (saved) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(26,20,16,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
        <div style={{ background: PAPER, border: `1px solid ${INK}`, padding: 48, maxWidth: 480, textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 40, height: 40, background: YEL, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 900, fontSize: 18 }}>✓</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Pitch logged</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK55, marginBottom: 24 }}>
            &ldquo;{form.subject}&rdquo;{suffix(form.stage)}
          </div>
          {successSlot?.(form.subject, form.stage)}
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
              <select value={form.journalistId} onChange={e => set("journalistId", e.target.value)} style={inp}>
                <option value="">Select or leave blank</option>
                {journalists.map(j => <option key={j.id} value={j.id}>{j.name}{j.outlet ? ` — ${j.outlet}` : ""}</option>)}
              </select>
            </MField>
            <MField label="Client">
              <input type="text" value={form.client} onChange={e => set("client", e.target.value)} placeholder="e.g., Fairground" style={inp} />
            </MField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <MField label="PESO Type">
              <select value={form.peso} onChange={e => set("peso", e.target.value as PesoType)} style={inp}>
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
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </MField>
          </div>

          <MField label="Data Source">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {dataSources.map(src => (
                <button key={src} type="button" onClick={() => set("dataSource", src)} style={{
                  padding: "7px 14px",
                  background: form.dataSource === src ? INK : "transparent",
                  color: form.dataSource === src ? PAPER : INK55,
                  border: `1px solid ${form.dataSource === src ? INK : INK35}`,
                  fontFamily: GROT, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                }}>
                  {fmtDataSource(src)}
                </button>
              ))}
            </div>
          </MField>

          <MField label="Notes">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Any additional context, angles, or data points…" style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
          </MField>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: `1px solid ${INK15}` }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>{footerNote}</span>
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
