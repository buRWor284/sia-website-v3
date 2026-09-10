import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";
import { ensureOrgProvisioned } from "@/lib/emos-provision";
import { subscriptionAllowsAccess } from "@/lib/emos-guard";
import { isEmosAdminEmail } from "@/lib/emos-admins";
import Link from "next/link";
import { STAGE_META, STAGE_ORDER, STAGE_THRESHOLDS, computeEarnedStage, type EmosStage } from "@/lib/emos-stage-config";
import type { Metadata } from "next";
import { getUsageMeter, type UsageRow } from "@/lib/usage-limits";

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
const RED    = "#c14a32";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

/**
 * Monthly allowance meter (2026-09-10). One row per metered action: used / limit
 * and a bar that turns amber at 80% and red when spent. Read through the service
 * client with the org id the RLS-scoped lookup above already resolved.
 */
function UsageMeter({ rows, resetsOn, isAdmin }: { rows: UsageRow[]; resetsOn: string; isAdmin: boolean }) {
  return (
    <div style={{ border: `1px solid ${INK}`, background: PAPER, marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 18px", borderBottom: `1px solid ${INK15}` }}>
        <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: INK }}>
          This month&apos;s allowance
        </span>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: INK55 }}>
          Included in your plan. Resets on {resetsOn}.{isAdmin ? " Admin: counted, never blocked." : ""}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 1, background: INK15 }}>
        {rows.map((r) => {
          const pct = r.limit > 0 ? Math.min(100, Math.round((r.used / r.limit) * 100)) : 0;
          const left = Math.max(r.limit - r.used, 0);
          const colour = pct >= 100 ? RED : pct >= 80 ? YEL : GREEN;
          return (
            <div key={r.action} style={{ background: PAPER, padding: "12px 18px 14px" }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: INK35, marginBottom: 3 }}>
                {r.tool}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: INK }}>{r.label.charAt(0).toUpperCase() + r.label.slice(1)}</span>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, color: INK, whiteSpace: "nowrap" }}>
                  {r.used} / {r.limit}
                </span>
              </div>
              <div style={{ height: 4, background: INK15, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: colour }} />
              </div>
              <div style={{ fontFamily: GROT, fontSize: 9, letterSpacing: ".06em", color: pct >= 100 ? RED : INK55, marginTop: 5 }}>
                {pct >= 100 ? `All used, back on ${resetsOn}` : `${left} left`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  if (!userId) redirect("/emos-platform/signin");

  // ── Subscription gate ─────────────────────────────────────────────────────
  // Same rule as the layout and the API guard, from the same function. It sits
  // here as well as in layout.tsx because a layout does not re-run on
  // client-side navigation between its pages, so it cannot be the only check.
  // ★ This page used to carry its own stricter copy (no row = redirected to
  //   the sales page), which locked out every admin-invited beta account. See
  //   subscriptionAllowsAccess in emos-guard.ts. Fixed 2026-09-10.
  const user      = await currentUser();
  const userEmail = (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    ""
  ).toLowerCase().trim();

  if (!(await subscriptionAllowsAccess(userEmail, userId))) {
    redirect("/emos-platform/subscribe");
  }

  const token = await getToken();
  const db = createSupabaseServerClient(token ?? "");

  let { data: org, error: orgErr } = await db
    .from("organizations")
    .select("id, name, slug, emos_stage, plan")
    .single();

  console.log(`[emos-dashboard] org lookup: org=${JSON.stringify(org)} error=${orgErr ? JSON.stringify(orgErr) : "none"}`);

  // M4 (2026-07-02 review): lazy provisioning fallback. Users created before
  // the Clerk webhook provisioned org/user rows (or whose webhook delivery
  // failed) had no org — empty dashboard, every save failing. Provision on
  // first load, then read back via the service client (the current JWT's RLS
  // context may not see the fresh rows yet).
  if (!org && userEmail) {
    const prov = await ensureOrgProvisioned(userId, userEmail, user?.fullName ?? null);
    if (prov.ok) {
      const svc = createSupabaseServiceClient();
      const { data: u } = await svc
        .from("users")
        .select("org_id")
        .eq("clerk_user_id", userId)
        .single();
      if (u) {
        const { data: freshOrg } = await svc
          .from("organizations")
          .select("id, name, slug, emos_stage, plan")
          .eq("id", u.org_id)
          .single();
        org = freshOrg;
      }
    }
  }

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

  // Monthly allowance meter. Never lets a meter failure break the dashboard.
  const meter = org ? await getUsageMeter(org.id as string).catch(() => null) : null;

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
            {/* Admin-only: the stage 3 costs page. Everyone else never sees the link,
                and the page itself 404s for non-admins. */}
            {isEmosAdminEmail(userEmail) && (
              <Link href="/emos-platform/admin/costs" style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: INK, background: YEL, padding: "5px 10px", textDecoration: "none" }}>
                AI costs
              </Link>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: YEL }}>
              <span style={{ width: 6, height: 6, background: YEL, borderRadius: "50%" }} />
              LIVE
            </span>
            <SignOutButton redirectUrl="/emos-platform/signedout">
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
            ✓ Stage advanced, you are now on {STAGE_META[activeStage].label}
          </div>
        )}

        {/* ── Current step banner ──────────────────────────────────────────── */}
        <div style={{ background: INK, color: PAPER, padding: "18px 24px", marginBottom: 40, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 8, letterSpacing: ".18em", textTransform: "uppercase", color: YEL, marginBottom: 4 }}>
              You are here
            </div>
            <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 16, letterSpacing: ".10em", textTransform: "uppercase" }}>
              Step {activeStageIdx + 1} | {STAGE_META[activeStage].label}
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
              <a
                key={stage}
                href={meta.path}
                style={{
                  background: isActive ? INK : PAPER,
                  display: "grid",
                  gridTemplateColumns: "48px minmax(0,1fr) auto auto",
                  alignItems: "center",
                  gap: 0,
                  textDecoration: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                {/* Step number */}
                <div style={{ padding: "20px 0 20px 20px", fontFamily: SERIF, fontWeight: 700, fontSize: 22, color: isActive ? YEL : isDone ? "rgba(26,20,16,.2)" : INK35, lineHeight: 1 }}>
                  {TOOL_ICONS[stage]}
                </div>

                {/* Tool info */}
                <div style={{ padding: "20px 20px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
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

                {/* CTA (whole card is the link; this stays as a visual affordance) */}
                <div style={{ padding: "20px 20px 20px 0" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 18px",
                      background: isActive ? YEL : "transparent",
                      color: isActive ? INK : INK55,
                      border: isActive ? "none" : `1px solid ${INK15}`,
                      fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap",
                    }}
                  >
                    Open →
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* ── Monthly allowance ────────────────────────────────────────────── */}
        {meter && <UsageMeter rows={meter.rows} resetsOn={meter.resetsOn} isAdmin={isEmosAdminEmail(userEmail)} />}

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
