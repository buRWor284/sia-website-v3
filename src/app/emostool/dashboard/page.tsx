import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getOrgStage, STAGE_META, type EmosStage } from "@/app/emostool/actions/stage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "EMOS Platform Dashboard",
};

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

const PAPER   = "#f1ebde";
const PAPER2  = "#e8e0cc";
const INK     = "#1a1410";
const INK55   = "rgba(26,20,16,.55)";
const INK35   = "rgba(26,20,16,.32)";
const INK15   = "rgba(26,20,16,.15)";
const YEL     = "#f5b81f";
const GROT    = "var(--font-grot)";
const SERIF   = "var(--font-serif)";
const MONO    = "var(--font-mono)";

const STAGE_ORDER: EmosStage[] = ["signal", "press", "collab", "coverage", "full"];

const TOOLS: {
  id: EmosStage;
  name: string;
  subtitle: string;
  path: string;
  publicPath: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "signal",
    name: "SignalIQ",
    subtitle: "Story Detection",
    path: "/emostool/dashboard/signaliq",
    publicPath: "/tools/signaliq",
    description: "Scan open data sources for newsworthy signals. Save top opportunities to your EMOS pipeline.",
    icon: "◎",
  },
  {
    id: "press",
    name: "PressIQ",
    subtitle: "Pitch Scoring",
    path: "/emostool/dashboard/pressiq",
    publicPath: "/tools/pressiq",
    description: "Score your pitches against 34-point journalist criteria. Scores auto-save when logged in.",
    icon: "◈",
  },
  {
    id: "collab",
    name: "JournoCollabIQ",
    subtitle: "Journalist CRM",
    path: "/emostool/dashboard/coverageiq",
    publicPath: "/tools/journocollabiq",
    description: "Build and manage journalist relationships. Track every touchpoint.",
    icon: "◇",
  },
  {
    id: "coverage",
    name: "CoverageIQ",
    subtitle: "Pitch Tracking",
    path: "/emostool/dashboard/coverageiq",
    publicPath: "/tools/coverageiq",
    description: "Track your full pitch pipeline from drafted to amplified. Log placements and coverage.",
    icon: "◆",
  },
];

export default async function EmosDashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");

  const { data: org, error } = await db
    .from("organizations")
    .select("id, name, slug, emos_stage, plan")
    .single();

  const currentStage = (org?.emos_stage as EmosStage) ?? "signal";
  const stageIdx = STAGE_ORDER.indexOf(currentStage);

  // Fetch quick stats
  const [pitchRes, signalRes, journalistRes] = await Promise.all([
    db.from("coverageiq_pitches").select("id", { count: "exact", head: true }),
    db.from("signaliq_signals").select("id", { count: "exact", head: true }),
    db.from("journalists").select("id", { count: "exact", head: true }),
  ]);

  const stats = {
    pitches:     pitchRes.count ?? 0,
    signals:     signalRes.count ?? 0,
    journalists: journalistRes.count ?? 0,
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              EMOS
            </span>
            <span style={{ width: 1, height: 16, background: "rgba(241,235,222,.2)" }} />
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}>
              Earned Media Operating System
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {org && (
              <span style={{ fontFamily: GROT, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(241,235,222,.55)" }}>
                {org.name} · {org.plan.toUpperCase()}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: YEL }}>
              <span style={{ width: 6, height: 6, background: YEL, borderRadius: "50%", display: "inline-block" }} />
              LIVE
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "40px clamp(20px,4vw,56px) 80px" }}>

        {error && (
          <div style={{ padding: "12px 16px", background: "#fff0f0", border: "1px solid #ffcccc", marginBottom: 32, fontFamily: GROT, fontSize: 12 }}>
            Could not load org: {error.message}
          </div>
        )}

        {/* ── Stage progress bar ───────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ borderTop: `3px solid ${INK}`, borderBottom: `1px solid ${INK15}`, paddingTop: 10, paddingBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", background: YEL, color: INK, padding: "3px 10px 4px" }}>
                EMOS STAGE
              </span>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, color: INK55 }}>
                {STAGE_META[currentStage].label}
              </span>
              {currentStage !== "full" && (
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55, marginLeft: "auto" }}>
                  {STAGE_META[currentStage].threshold}
                </span>
              )}
            </div>

            {/* Pipeline steps */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${STAGE_ORDER.length}, 1fr)`, border: `1px solid ${INK}`, overflow: "hidden" }}>
              {STAGE_ORDER.map((stage, i) => {
                const done    = i < stageIdx;
                const current = i === stageIdx;
                const locked  = i > stageIdx;
                return (
                  <div
                    key={stage}
                    style={{
                      padding: "16px 12px",
                      borderRight: i < STAGE_ORDER.length - 1 ? `1px solid ${INK}` : "none",
                      background: current ? INK : done ? YEL : PAPER2,
                      position: "relative",
                    }}
                  >
                    <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: current ? YEL : done ? INK : INK35, marginBottom: 4 }}>
                      {done ? "✓ DONE" : current ? "● ACTIVE" : "○ LOCKED"}
                    </div>
                    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: current ? PAPER : done ? INK : INK35 }}>
                      {STAGE_META[stage].label}
                    </div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: current ? "rgba(241,235,222,.65)" : done ? "rgba(26,20,16,.65)" : INK35, marginTop: 4, lineHeight: 1.4 }}>
                      {STAGE_META[stage].tool}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Stats strip ─────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `1px solid ${INK}`, marginBottom: 48 }}>
          {[
            { num: stats.signals,     label: "Signals Saved" },
            { num: stats.pitches,     label: "Pitches Tracked" },
            { num: stats.journalists, label: "Journalist Contacts" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "20px 24px", borderRight: i < 2 ? `1px solid ${INK}` : "none" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, lineHeight: 1, letterSpacing: "-0.02em", color: INK }}>{item.num}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: INK55, marginTop: 6 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tool cards ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 3 }}>
            <div style={{ borderTop: `3px solid ${INK}`, paddingTop: 10, paddingBottom: 16 }}>
              <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", background: YEL, color: INK, padding: "3px 10px 4px" }}>
                TOOLS
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: INK, border: `1px solid ${INK}`, marginBottom: 48 }}>
          {TOOLS.map(tool => {
            const toolStageIdx = STAGE_ORDER.indexOf(tool.id);
            const unlocked = toolStageIdx <= stageIdx;
            return (
              <div
                key={tool.id}
                style={{
                  background: PAPER,
                  padding: "28px 28px 24px",
                  position: "relative",
                  opacity: unlocked ? 1 : 0.55,
                }}
              >
                {/* Stage chip */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: unlocked ? YEL : INK35, lineHeight: 1 }}>
                    {tool.icon}
                  </span>
                  <div>
                    <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: unlocked ? INK : INK35 }}>
                      {tool.name}
                    </div>
                    <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: INK55, marginTop: 2 }}>
                      {tool.subtitle}
                    </div>
                  </div>
                  {!unlocked && (
                    <span style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK35, border: `1px solid ${INK35}`, padding: "3px 8px" }}>
                      LOCKED
                    </span>
                  )}
                  {unlocked && tool.id === currentStage && (
                    <span style={{ marginLeft: "auto", fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, background: YEL, padding: "3px 8px" }}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.6, color: unlocked ? "rgba(26,20,16,.70)" : INK35, margin: "0 0 20px" }}>
                  {tool.description}
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {unlocked ? (
                    <>
                      <a href={tool.path} style={{ display: "inline-block", padding: "8px 18px", background: INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
                        Open Platform →
                      </a>
                      <a href={tool.publicPath} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "8px 18px", background: "transparent", color: INK55, border: `1px solid ${INK35}`, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
                        Public Tool ↗
                      </a>
                    </>
                  ) : (
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK35 }}>
                      {STAGE_META[STAGE_ORDER[toolStageIdx - 1] as EmosStage]?.threshold ?? "Complete earlier stages to unlock"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Org info ────────────────────────────────────────────────── */}
        {org && (
          <div style={{ border: `1px solid ${INK15}`, padding: "16px 20px", background: PAPER2 }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginBottom: 10 }}>Organisation</div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                ["Name",  org.name],
                ["Slug",  org.slug],
                ["Plan",  org.plan],
                ["Stage", org.emos_stage],
                ["ID",    org.id],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontFamily: GROT, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: INK35, marginBottom: 2 }}>{label}</div>
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
