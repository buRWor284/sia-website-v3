import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSignals, type DbSignal } from "@/app/emostool/actions/signaliq";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "SignalIQ — EMOS Platform",
};

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

const PAPER   = "#f1ebde";
const PAPER2  = "#e8e0cc";
const INK     = "#1a1410";
const INK70   = "rgba(26,20,16,.70)";
const INK55   = "rgba(26,20,16,.55)";
const INK35   = "rgba(26,20,16,.32)";
const INK15   = "rgba(26,20,16,.15)";
const YEL     = "#f5b81f";
const GROT    = "var(--font-grot)";
const SERIF   = "var(--font-serif)";
const MONO    = "var(--font-mono)";

const STATUS_STYLE: Record<DbSignal["status"], { bg: string; fg: string; label: string }> = {
  new:      { bg: YEL,         fg: INK,   label: "New" },
  saved:    { bg: INK,         fg: PAPER, label: "Saved" },
  pitched:  { bg: "transparent", fg: INK, label: "Pitched" },
  archived: { bg: PAPER2,      fg: INK55, label: "Archived" },
};

function fmt(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

function scoreBar(score: number | null) {
  if (!score) return null;
  const pct = Math.min(score, 100);
  const color = pct >= 70 ? YEL : pct >= 45 ? "rgba(26,20,16,.55)" : "rgba(26,20,16,.25)";
  return { pct, color };
}

export default async function SignalIQPlatformPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  const signals = await getSignals();

  const byStatus = {
    new:      signals.filter(s => s.status === "new"),
    saved:    signals.filter(s => s.status === "saved"),
    pitched:  signals.filter(s => s.status === "pitched"),
    archived: signals.filter(s => s.status === "archived"),
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF }}>

      {/* Header */}
      <div style={{ background: INK, color: PAPER, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/emostool/dashboard" style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)", textDecoration: "none" }}>← EMOS</a>
            <span style={{ color: "rgba(241,235,222,.2)" }}>|</span>
            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Signal<span style={{ color: YEL }}>IQ</span></span>
            <span style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(241,235,222,.45)" }}>Story Detection</span>
          </div>
          <a href="/tools/signaliq" target="_blank" rel="noopener noreferrer"
            style={{ padding: "7px 16px", background: YEL, color: INK, fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
            Run New Scan ↗
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "32px clamp(20px,4vw,56px) 80px" }}>

        {/* Explainer banner */}
        <div style={{ background: PAPER2, border: `1px solid ${INK15}`, padding: "14px 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK70, flex: 1 }}>
            When you run a scan at <strong>/tools/signaliq</strong> while logged in, the top 3 opportunities are automatically saved here.
          </span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: INK }}>{signals.length}</span>
          <span style={{ fontFamily: GROT, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: INK55 }}>SAVED</span>
        </div>

        {/* Summary strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${INK}`, marginBottom: 32 }}>
          {(["new","saved","pitched","archived"] as const).map((s, i) => (
            <div key={s} style={{ padding: "18px 16px", borderRight: i < 3 ? `1px solid ${INK}` : "none" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>{byStatus[s].length}</div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55, marginTop: 5 }}>{STATUS_STYLE[s].label}</div>
            </div>
          ))}
        </div>

        {signals.length === 0 ? (
          <div style={{ padding: "48px 32px", textAlign: "center", border: `1px solid ${INK15}`, background: PAPER2 }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, margin: "0 0 16px" }}>
              No signals yet. Run your first scan to start detecting opportunities.
            </p>
            <a href="/tools/signaliq" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", padding: "10px 24px", background: INK, color: PAPER, fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}>
              Open SignalIQ →
            </a>
          </div>
        ) : (
          <>
            {/* Table */}
            <div style={{ border: `1px solid ${INK}`, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 90px", background: INK, color: PAPER }}>
                {["Signal / Headline", "Source", "Score", "Gap", "Status"].map((h, i) => (
                  <div key={h} style={{ padding: "11px 14px", fontFamily: "var(--font-grot)", fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", borderRight: i < 4 ? "1px solid rgba(241,235,222,.15)" : "none" }}>
                    {h}
                  </div>
                ))}
              </div>

              {signals.map((sig, idx) => {
                const bar = scoreBar(sig.signal_score);
                const gapBar = scoreBar(sig.coverage_gap);
                const ss = STATUS_STYLE[sig.status];
                return (
                  <div key={sig.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 90px", borderBottom: idx < signals.length - 1 ? `1px solid ${INK15}` : "none" }}>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: INK, marginBottom: 4 }}>{sig.headline}</div>
                      <div style={{ fontFamily: "var(--font-grot)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: INK55 }}>
                        {fmt(sig.detected_at)}
                        {sig.beat_name && ` · ${sig.beat_name}`}
                      </div>
                    </div>
                    <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: INK55 }}>
                        {sig.source_url
                          ? <a href={sig.source_url} target="_blank" rel="noopener noreferrer" style={{ color: INK55, textDecoration: "none", borderBottom: `1px solid ${INK35}` }}>{sig.source.toUpperCase()}</a>
                          : sig.source.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                      {bar ? (
                        <div style={{ width: "100%" }}>
                          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{sig.signal_score}</div>
                          <div style={{ height: 3, background: "rgba(26,20,16,.1)" }}>
                            <div style={{ height: "100%", width: `${bar.pct}%`, background: bar.color }} />
                          </div>
                        </div>
                      ) : <span style={{ color: INK35, fontFamily: "var(--font-mono)", fontSize: 12 }}>—</span>}
                    </div>
                    <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                      {gapBar ? (
                        <div style={{ width: "100%" }}>
                          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{sig.coverage_gap}</div>
                          <div style={{ height: 3, background: "rgba(26,20,16,.1)" }}>
                            <div style={{ height: "100%", width: `${gapBar.pct}%`, background: gapBar.color }} />
                          </div>
                        </div>
                      ) : <span style={{ color: INK35, fontFamily: "var(--font-mono)", fontSize: 12 }}>—</span>}
                    </div>
                    <div style={{ padding: "14px 12px", borderLeft: `1px solid ${INK15}`, display: "flex", alignItems: "center" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px 4px", background: ss.bg, color: ss.fg, border: ss.bg === "transparent" ? `1px solid ${INK35}` : "none", fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        {ss.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
              {signals.length} signal{signals.length !== 1 ? "s" : ""} in your library
            </div>
          </>
        )}
      </div>
    </div>
  );
}
