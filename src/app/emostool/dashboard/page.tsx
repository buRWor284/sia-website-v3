import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { createSupabaseServerClient } from "@/lib/supabase";
import { STAGE_META, STAGE_ORDER, STAGE_THRESHOLDS, computeEarnedStage, type EmosStage } from "@/lib/emos-stage-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "EMOS Platform",
};


const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK55  = "rgba(26,20,16,.55)";
const INK35  = "rgba(26,20,16,.32)";
const INK15  = "rgba(26,20,16,.15)";
const YEL    = "#f5b81f";
const GREEN  = "#3e6b45";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

// Tool icons in pipeline order
const TOOL_ICONS: Record<EmosStage, string> = {
  signal:   "◎",
  asset:    "◈",
  collab:   "◇",
  press:    "◆",
  coverage: "▣",
  full:     "★",
};

export default async function EmosDashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");

  const { data: org } = await db
    .from("organizations")
    .select("id, name, slug, emos_stage, plan")
    .single();

  const currentStage = (org?.emos_stage as EmosStage) ?? "signal";
  const stageIdx = STAGE_ORDER.indexOf(currentStage);

  // Fetch stats for each tool card
  const [signalRes, assetRes, journalistRes, pressRes, pitchRes] = await Promise.all([
    db.from("signaliq_signals").select("id", { count: "exact", head: true }),
    db.from("linkable_assets").select("id", { count: "exact", head: true }),
    db.from("journalists").select("id", { count: "exact", head: true }),
    db.from("pressiq_scores").select("id", { count: "exact", head: true }),
    db.from("coverageiq_pitches").select("id", { count: "exact", head: true }),
  ]);

  const activityCounts = {
    signals:        signalRes.count ?? 0,
    assets:         assetRes.count ?? 0,
    journalists:    journalistRes.count ?? 0,
    pitchesScored:  pressRes.count ?? 0,
    pitchesTracked: pitchRes.count ?? 0,
  };

  const toolStats: Record<EmosStage, { count: number; label: string }> = {
    signal:   { count: activityCounts.signals,        label: "signals saved"   },
    asset:    { count: activityCounts.assets,         label: "assets"          },
    collab:   { count: activityCounts.journalists,    label: "journalists"     },
    press:    { count: activityCounts.pitchesScored,  label: "pitches scored"  },
    coverage: { count: activityCounts.pitchesTracked, label: "pitches tracked" },
    full:     { count: 0,                             label: ""                },
  };

  // Compute the stage the user has EARNED from activity; advance in DB if higher
  const earnedStage = computeEarnedStage(activityCounts);
  const earnedIdx   = STAGE_ORDER.indexOf(earnedStage);
  let stageAdvanced = false;
  if (earnedIdx > stageIdx && org) {
    const { error: stageErr } = await db
      .from("organizations")
      .update({ emos_stage: earnedStage })
      .eq("id", org.id);
    if (!stageErr) stageAdvanced = true;
  }

  // Use earned stage (if advanced) as the active stage
  const activeStage = stageAdvanced ? earnedStage : currentStage;
  const activeStageIdx = stageAdvanced ? earnedIdx : stageIdx;
  const pipelineTools = STAGE_ORDER.filter(s => s !== "full");

  // Progress toward the next stage threshold
  const stageCountMap: Record<EmosStage, number> = {
    signal:   activityCounts.signals,
    asset:    activityCounts.assets,
    collab:   activityCounts.journalists,
    press:    activityCounts.pitchesScored,
    coverage: activityCounts.pitchesTracked,
    full:     0,
  };
  const progressCurrent   = stageCountMap[activeStage] ?? 0;
  const progressThreshold = STAGE_THRESHOLDS[activeStage] ?? 0;
  const progressPct       = progressThreshold > 0 ? Math.min(100, Math.round((progressCurrent / progressThreshold) * 100)) : 100;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase" }}>EMOS</span>
            <span style={{ width: 1, height: 16, background: "rgba(241,235,222,.2)" }} />
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}>
              Earned Media Operating System
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {org && (
              <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: ".10em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>
                {org.name}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: YEL }}>
              <span style={{ width: 6, height: 6, background: YEL, borderRadius: "50%" }} />
              LIVE
            </span>
            <SignOutButton redirectUrl="/">
              <button style={{ background: "transparent", border: "1px solid rgba(241,235,222,.2)", color: "rgba(241,235,222,.55)", fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 12px", cursor: "pointer" }}>
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "40px clamp(20px,4vw,56px) 80px" }}>

        {/* ── Stage-advanced toast ─────────────────────────────────────────── */}
        {stageAdvanced && (
          <div style={{ background: GREEN, color: PAPER, padding: "10px 20px", marginBottom: 16, fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" }}>
            ✓ Stage advanced — you are now on {STAGE_META[activeStage].label}
          </div>
        )}

        {/* ── Current step banner ──────────────────────────────────────────── */}
        <div style={{ background: INK, color: PAPER, padding: "18px 24px", marginBottom: 40, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".18em", textTransform: "uppercase", color: YEL, marginBottom: 4 }}>
              You are here
            </div>
            <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 16, letterSpacing: ".10em", textTransform: "uppercase" }}>
              Step {activeStageIdx + 1} — {STAGE_META[activeStage].label}
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.65)", marginTop: 4 }}>
              {STAGE_META[activeStage].threshold}
            </div>
            {activeStage !== "full" && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, maxWidth: 200, height: 4, background: "rgba(241,235,222,.15)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct >= 100 ? "#3e6b45" : YEL, transition: "width .3s ease" }} />
                </div>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, color: progressPct >= 100 ? "#3e6b45" : YEL, whiteSpace: "nowrap" }}>
                  {progressCurrent} / {progressThreshold}
                </span>
              </div>
            )}
          </div>
          <a
            href={STAGE_META[activeStage].path}
            style={{ marginLeft: "auto", padding: "12px 24px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Open {STAGE_META[activeStage].label} →
          </a>
        </div>

        {/* ── Pipeline tool cards ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ borderTop: "3px solid " + INK, paddingTop: 10, paddingBottom: 16 }}>
            <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", background: YEL, color: INK, padding: "3px 10px 4px" }}>
              THE PIPELINE
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: INK, border: `1px solid ${INK}`, marginBottom: 48 }}>
          {pipelineTools.map((stage, i) => {
            const meta = STAGE_META[stage];
            const toolIdx = STAGE_ORDER.indexOf(stage);
            const isDone    = toolIdx < activeStageIdx;
            const isActive  = stage === activeStage;
            const stats     = toolStats[stage];

            return (
              <div
                key={stage}
                style={{
                  background: isActive ? INK : PAPER,
                  display: "grid",
                  gridTemplateColumns: "48px 1fr auto auto",
                  alignItems: "center",
                  gap: 0,
                }}
              >
                {/* Step number */}
                <div style={{ padding: "20px 0 20px 20px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: isActive ? YEL : isDone ? "rgba(26,20,16,.2)" : INK35, lineHeight: 1 }}>
                  {TOOL_ICONS[stage]}
                </div>

                {/* Tool info */}
                <div style={{ padding: "20px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: isActive ? PAPER : isDone ? "rgba(26,20,16,.45)" : INK }}>
                      {meta.label}
                    </span>
                    <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".10em", textTransform: "uppercase", color: isActive ? "rgba(241,235,222,.5)" : INK55 }}>
                      {meta.tool}
                    </span>
                    {isDone && (
                      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".14em", textTransform: "uppercase", background: "rgba(62,107,69,.15)", color: GREEN, border: `1px solid ${GREEN}`, padding: "2px 7px" }}>
                        ✓ DONE
                      </span>
                    )}
                    {isActive && (
                      <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 7.5, letterSpacing: ".14em", textTransform: "uppercase", background: YEL, color: INK, padding: "2px 7px" }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: isActive ? "rgba(241,235,222,.65)" : isDone ? INK35 : INK55, lineHeight: 1.4 }}>
                    {meta.description}
                  </div>
                </div>

                {/* Stats */}
                {stats.count > 0 && (
                  <div style={{ padding: "20px 20px", textAlign: "right" }}>
                    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, lineHeight: 1, color: isActive ? PAPER : isDone ? INK35 : INK }}>
                      {stats.count}
                    </div>
                    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".10em", textTransform: "uppercase", color: isActive ? "rgba(241,235,222,.45)" : INK55, marginTop: 2 }}>
                      {stats.label}
                    </div>
                    {isActive && progressThreshold > 0 && (
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        <div style={{ width: 80, height: 3, background: "rgba(241,235,222,.15)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct >= 100 ? "#3e6b45" : YEL }} />
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: progressPct >= 100 ? "#3e6b45" : "rgba(241,235,222,.55)" }}>
                          {progressPct}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {stats.count === 0 && <div style={{ padding: "20px 20px" }} />}

                {/* CTA */}
                <div style={{ padding: "20px 20px 20px 0" }}>
                  <a
                    href={meta.path}
                    style={{
                      display: "inline-block",
                      padding: "8px 18px",
                      background: isActive ? YEL : "transparent",
                      color: isActive ? INK : INK55,
                      border: isActive ? "none" : `1px solid ${INK15}`,
                      fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", textDecoration: "none",
                    }}
                  >
                    Open →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Org info ─────────────────────────────────────────────────────── */}
        {org && (
          <div style={{ border: `1px solid ${INK15}`, padding: "14px 18px", background: PAPER2 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8.5, letterSpacing: ".14em", textTransform: "uppercase", color: INK35, marginBottom: 8 }}>Organisation</div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {([ ["Name", org.name], ["Plan", org.plan], ["Stage", org.emos_stage] ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontFamily: GROT, fontSize: 7.5, letterSpacing: ".12em", textTransform: "uppercase", color: INK35, marginBottom: 1 }}>{label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: INK55 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
