"use client";

/**
 * /emos-platform/subscribe
 *
 * Public subscribe page — shown BEFORE sign-up (user pays first, then gets invited).
 * Lives under /emos-platform/subscribe but is EXEMPTED in middleware (isSubscribeRoute),
 * so Clerk does not gate it: new buyers reach checkout before they have an account.
 *
 * Flow: user clicks "Subscribe" → POST /api/emos-checkout → redirect to Stripe →
 *       payment complete → Stripe webhook fires → Clerk invite sent → /emos-platform/subscribe/success
 */

import { useState } from "react";

const PAPER = "#f1ebde";
const INK   = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const YEL   = "#f5b81f";
const GREEN  = "#3e6b45";
const GROT  = "Arial, 'Helvetica Neue', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const TOOLS = [
  { icon: "◎", name: "SignalIQ",       desc: "Spots the signals worth pitching — before the story dies." },
  { icon: "◈", name: "AssetIQ",        desc: "Builds the linkable assets journalists actually want to cite." },
  { icon: "◇", name: "JournoCollabIQ", desc: "Finds journalists on your beat and personalises outreach." },
  { icon: "◆", name: "PressIQ",        desc: "Scores your pitch before you send it." },
  { icon: "▣", name: "CoverageIQ",     desc: "Tracks pitches and turns coverage into AI citations." },
];

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/emos-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Wordmark: amber square E + ink text (accessible on paper, matches /success) */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ display: "inline-block", background: YEL, color: INK, fontFamily: SERIF, fontWeight: 700, fontSize: 14, width: 28, height: 28, lineHeight: "28px", textAlign: "center" as const, verticalAlign: "middle" }}>
            E
          </span>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase" as const, color: INK, verticalAlign: "middle", marginLeft: 9 }}>
            EMOS Platform
          </span>
        </div>

        {/* Card */}
        <div style={{ background: INK, color: PAPER }}>

          {/* Hero */}
          <div style={{ padding: "40px 40px 32px", borderBottom: "1px solid rgba(241,235,222,.1)" }}>
            <p style={{ fontFamily: GROT, fontWeight: 900, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase" as const, color: "rgba(241,235,222,.4)", margin: "0 0 14px" }}>
              Full platform access
            </p>
            <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.15, letterSpacing: "-.025em", margin: "0 0 18px" }}>
              The earned media pipeline,<br /><em>in one platform.</em>
            </h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 38, letterSpacing: "-.02em", color: YEL }}>$50</span>
              <span style={{ fontFamily: GROT, fontWeight: 600, fontSize: 14, color: "rgba(241,235,222,.45)" }}>/month · cancel any time</span>
            </div>
          </div>

          {/* Tools list */}
          <div style={{ padding: "24px 40px 20px", borderBottom: "1px solid rgba(241,235,222,.1)" }}>
            {TOOLS.map(({ icon, name, desc }) => (
              <div key={name} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: YEL, flexShrink: 0, lineHeight: 1.5 }}>{icon}</span>
                <div>
                  <span style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" as const }}>{name}</span>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.55)", marginLeft: 8 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ padding: "20px 40px 24px", borderBottom: "1px solid rgba(241,235,222,.1)" }}>
            <p style={{ fontFamily: GROT, fontWeight: 900, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "rgba(241,235,222,.35)", margin: "0 0 12px" }}>
              What happens next
            </p>
            {[
              "Pay via Stripe (card). Takes 30 seconds.",
              "Check your inbox — you'll receive an invite link to create your account.",
              "Sign in and start building your earned media system.",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, color: YEL, flexShrink: 0, minWidth: 16 }}>{i + 1}.</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(241,235,222,.6)", lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: "28px 40px 36px" }}>
            {error && (
              <p style={{ fontFamily: GROT, fontSize: 11, color: "#e57373", marginBottom: 14, letterSpacing: ".04em" }}>
                {error}
              </p>
            )}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "rgba(245,184,31,.55)" : YEL,
                color: INK,
                fontFamily: GROT,
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase" as const,
                border: "none",
                padding: "16px 32px",
                cursor: loading ? "wait" : "pointer",
                transition: "background .15s ease",
              }}
            >
              {loading ? "Redirecting to Stripe…" : "Subscribe — $50 / month →"}
            </button>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: "rgba(241,235,222,.3)", textAlign: "center" as const, marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
              Secure payment via Stripe. Cancel from your Stripe billing portal at any time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontFamily: GROT, fontSize: 10, color: INK55, letterSpacing: ".08em", textTransform: "uppercase" as const, textAlign: "center" as const, marginTop: 24 }}>
          EMOS Platform · syedirfanajmal.com
        </p>

        {/* Already have an account? */}
        <p style={{ textAlign: "center" as const, marginTop: 8 }}>
          <a href="/emos-platform/signin" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(26,20,16,.4)", textDecoration: "none" }}>
            Already have an account? Sign in →
          </a>
        </p>

      </div>
    </div>
  );
}
