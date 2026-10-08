/**
 * /emos-platform/dashboard/ai-activity — "What your AI did" (2026-10-08).
 *
 * Every write recorded through the EMOS connector, newest first, plus the
 * dashboard's own stage-button writes (marked "You, in the dashboard"). The
 * most recent AI write that can still be reversed carries an Undo button.
 * Gated by dashboard/layout.tsx like every dashboard page.
 */

import { listAiActivity } from "@/app/emos-platform/actions/ai-activity";
import { UndoButton } from "./UndoButton";

export const dynamic = "force-dynamic";

const INK = "#1a1410";
const PAPER = "#f1ebde";
const YEL = "#f5b81f";
const INK55 = "rgba(26,20,16,.55)";
const INK15 = "rgba(26,20,16,.15)";
const GROT = "Arial, 'Helvetica Neue', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, monospace";

const TOOL_LABEL: Record<string, string> = {
  add_journalist: "Saved journalists",
  log_pitch_sent: "Logged a sent pitch",
  log_reply: "Logged replies",
  record_placement: "Recorded a placement",
  undo_last_write: "Undid a write",
};

const UNDO_DAYS = 7;

function who(via: string, clientId: string | null): string {
  if (via === "dashboard") return "You, in the dashboard";
  if (clientId === "dashboard") return "You, with the Undo button";
  return "Your AI (EMOS connector)";
}

function when(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
}

export default async function AiActivityPage() {
  const { rows, writesOn, undoableId } = await listAiActivity();


  return (
    <div style={{ background: PAPER, minHeight: "100vh", padding: "32px 40px 140px", color: INK }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 18 }}>
        <header style={{ border: `1px solid ${INK}`, background: INK, color: PAPER, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: INK, background: YEL, padding: "4px 8px" }}>Audit</span>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, margin: 0 }}>What your AI did</h1>
          <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(241,235,222,.6)", marginLeft: "auto" }}>
            AI writes: {writesOn ? "on" : "off"}
          </span>
        </header>

        <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, margin: 0 }}>
          Every change your AI recorded in EMOS, newest first. Your AI shows you a preview before each one. The most recent can be undone here for {UNDO_DAYS} days, unless something it touched has been edited since.
          {!writesOn && " AI writes are switched off for your organisation, so nothing new can be recorded or undone through the AI door right now."}
        </p>

        {rows.length === 0 ? (
          <div style={{ border: `1px solid ${INK}`, padding: 18, fontFamily: SERIF, fontSize: 15 }}>Nothing yet. When your AI saves a journalist or logs a pitch, it shows up here.</div>
        ) : (
          <div style={{ border: `1px solid ${INK}` }}>
            {rows.map((r, i) => (
              <div key={r.id} style={{ padding: "12px 16px", borderTop: i ? `1px solid ${INK15}` : "none", display: "grid", gridTemplateColumns: "150px 1fr", gap: 14, opacity: r.state === "undone" ? 0.55 : 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: INK55, lineHeight: 1.5 }}>
                  {when(r.committed_at)}
                  <div style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{who(r.via, r.client_id)}</div>
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15 }}>{TOOL_LABEL[r.tool] ?? r.tool}</span>
                    <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>
                      {r.rows} row{r.rows === 1 ? "" : "s"}{r.state === "undone" ? ` · undone ${when(r.undone_at)}` : ""}
                    </span>
                  </div>
                  {r.summary && <div style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5 }}>{r.summary}</div>}
                  {r.id === undoableId && <UndoButton label={TOOL_LABEL[r.tool] ?? r.tool} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
