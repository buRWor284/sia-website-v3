"use client";

import { useState } from "react";

const PAPER = "#f1ebde";
const INK   = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const INK35 = "rgba(26,20,16,.32)";
const YEL   = "#f5b81f";
const GROT  = "var(--font-grot)";
const SERIF = "var(--font-serif)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(26,20,16,.05)",
  border: `1px solid ${INK35}`,
  fontFamily: SERIF,
  fontSize: 14,
  color: INK,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: GROT,
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: INK55,
  marginBottom: 6,
};

export default function NotInvitedForm() {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [note,  setNote]  = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res  = await fetch("/api/emos-access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, note }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: SERIF, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

        <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: YEL, marginBottom: 16 }}>
          EMOS Platform
        </div>

        <h1 style={{ fontFamily: GROT, fontWeight: 900, fontSize: 28, letterSpacing: "-.01em", color: INK, margin: "0 0 16px" }}>
          Access by invitation only
        </h1>

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: INK55, lineHeight: 1.6, margin: "0 0 32px" }}>
          The EMOS Platform is currently in private beta. This account hasn&apos;t been granted access yet.
        </p>

        {status === "success" ? (
          <div style={{ padding: "24px", background: "rgba(245,184,31,.12)", border: `1px solid ${YEL}`, marginBottom: 32 }}>
            <p style={{ fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: INK, margin: 0 }}>
              Request received
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 14, color: INK55, margin: "8px 0 0", lineHeight: 1.5 }}>
              We&apos;ll be in touch if there&apos;s a fit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: "left", marginBottom: 32 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Note <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Why do you want access?"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {status === "error" && (
              <p style={{ fontFamily: GROT, fontSize: 12, color: "#c0392b", marginBottom: 12 }}>
                {errorMsg}
              </p>
            )}

            {/* Honeypot */}
            <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 28px",
                background: status === "loading" ? INK55 : INK,
                color: PAPER,
                fontFamily: GROT,
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                border: "none",
                cursor: status === "loading" ? "not-allowed" : "pointer",
              }}
            >
              {status === "loading" ? "Sending…" : "Request Access →"}
            </button>
          </form>
        )}

        <a
          href="/emos"
          style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, textDecoration: "none" }}
        >
          Learn about EMOS →
        </a>

      </div>
    </div>
  );
}
