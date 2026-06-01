"use client";

import { useState, useCallback, type FormEvent } from "react";
import {
  GROT,
  INK,
  INK15,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  MONO,
  YEL,
} from "@/lib/tokens";

/* =========================================================================
   EMOS Apply Form — Client Component
   ========================================================================= */

const LABEL: React.CSSProperties = {
  fontFamily: GROT,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: INK,
  display: "block",
  marginBottom: 8,
};

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: `1px solid ${INK15}`,
  background: PAPER,
  fontFamily: SERIF,
  fontSize: 16,
  color: INK,
  outline: "none",
};

const HINT: React.CSSProperties = {
  fontFamily: SERIF,
  fontStyle: "italic",
  fontSize: 12,
  color: INK55,
  marginTop: 4,
};

export function EmosApplyForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    // TODO: Wire to Resend API route (/api/emos-apply)
    // For now, simulate submission
    const form = e.currentTarget;
    const data = new FormData(form);

    // Simulate a short delay
    await new Promise((r) => setTimeout(r, 800));

    setSending(false);
    setSent(true);
  }, []);

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
        <h3
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 24,
            color: INK,
            marginBottom: 10,
          }}
        >
          Application received.
        </h3>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 16,
            color: INK70,
            lineHeight: 1.6,
          }}
        >
          Syed reviews every submission personally. You&rsquo;ll hear back
          within 48 hours. Check your inbox (and spam folder) for a reply from{" "}
          <strong>sia@syedirfanajmal.com</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Name (required) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={LABEL}>
            First Name <span style={{ color: INK }}>*</span>
          </label>
          <input
            name="first_name"
            type="text"
            required
            style={INPUT}
            placeholder=""
          />
        </div>
        <div>
          <label style={LABEL}>
            Last Name <span style={{ color: INK }}>*</span>
          </label>
          <input
            name="last_name"
            type="text"
            required
            style={INPUT}
            placeholder=""
          />
        </div>
      </div>

      {/* ── Email (required) ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>
          Email <span style={{ color: INK }}>*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          style={INPUT}
          placeholder=""
        />
      </div>

      {/* ── Company / Product ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Company / Product Name</label>
        <input name="company" type="text" style={INPUT} placeholder="" />
      </div>

      {/* ── Tier (required) ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>
          Which tier are you interested in? <span style={{ color: INK }}>*</span>
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: SERIF,
              fontSize: 16,
              color: INK,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="tier"
              value="foundation"
              required
              style={{ accentColor: INK }}
            />
            Foundation – $2,000
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: SERIF,
              fontSize: 16,
              color: INK,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="tier"
              value="accelerate"
              style={{ accentColor: INK }}
            />
            Accelerate – $3,500
          </label>
        </div>
      </div>

      {/* ── ARR Range ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Approximate ARR Range</label>
        <select
          name="arr_range"
          style={{ ...INPUT, cursor: "pointer" }}
        >
          <option value="">Select...</option>
          <option value="pre-revenue">Pre-revenue</option>
          <option value="0-500k">$0 – $500K</option>
          <option value="500k-1m">$500K – $1M</option>
          <option value="1m-3m">$1M – $3M</option>
          <option value="3m-10m">$3M – $10M</option>
          <option value="10m+">$10M+</option>
        </select>
      </div>

      {/* ── Timeline to raise ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Timeline to Next Raise</label>
        <select
          name="timeline_to_raise"
          style={{ ...INPUT, cursor: "pointer" }}
        >
          <option value="">Select...</option>
          <option value="3-months">Within 3 months</option>
          <option value="3-6-months">3 – 6 months</option>
          <option value="6-12-months">6 – 12 months</option>
          <option value="12-plus">12+ months</option>
          <option value="not-raising">Not raising / bootstrapped</option>
        </select>
      </div>

      {/* ── Current press coverage ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Current Press Coverage</label>
        <textarea
          name="current_press"
          rows={2}
          style={{ ...INPUT, resize: "vertical" as const }}
          placeholder="Any existing mentions, bylines, or publications? (Optional)"
        />
      </div>

      {/* ── What have you tried ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>What Have You Tried So Far?</label>
        <textarea
          name="what_tried"
          rows={2}
          style={{ ...INPUT, resize: "vertical" as const }}
          placeholder="PR agency, HARO, cold outreach, nothing yet? (Optional)"
        />
      </div>

      {/* ── Why now ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL}>Why Now?</label>
        <textarea
          name="why_now"
          rows={2}
          style={{ ...INPUT, resize: "vertical" as const }}
          placeholder="What's driving the urgency? (Optional)"
        />
      </div>

      {/* ── Comment / Message ── */}
      <div style={{ marginBottom: 28 }}>
        <label style={LABEL}>Comment or Message (Not Required)</label>
        <textarea
          name="message"
          rows={3}
          style={{ ...INPUT, resize: "vertical" as const }}
          placeholder=""
        />
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={sending}
        className="emos-cta-ink"
        style={{
          width: "100%",
          justifyContent: "center",
          cursor: sending ? "wait" : "pointer",
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
