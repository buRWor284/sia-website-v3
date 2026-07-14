"use client";

import { useState } from "react";

const PAPER = "#f1ebde";
const INK   = "#1a1410";
const INK55 = "rgba(26,20,16,.55)";
const INK35 = "rgba(26,20,16,.32)";
const YEL   = "#f5b81f";
const GROT  = "var(--font-grot)";
const SERIF = "var(--font-serif)";

export default function InvitePage() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    const res  = await fetch("/api/emos-send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error ?? "Something went wrong.");
      setStatus("error");
    } else {
      setMsg(`Invite sent to ${email}`);
      setStatus("success");
      setEmail("");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 440, width: "100%" }}>

        <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: YEL, marginBottom: 12 }}>
          EMOS Admin
        </div>

        <h1 style={{ fontFamily: GROT, fontWeight: 900, fontSize: 24, color: INK, margin: "0 0 32px" }}>
          Send Invite
        </h1>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontFamily: GROT, fontWeight: 700, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: INK55, marginBottom: 6 }}>
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="invitee@example.com"
            style={{ display: "block", width: "100%", padding: "10px 12px", background: "rgba(26,20,16,.05)", border: `1px solid ${INK35}`, fontFamily: SERIF, fontSize: 14, color: INK, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
          />

          <button
            type="submit"
            disabled={status === "loading"}
            style={{ display: "block", width: "100%", padding: "12px", background: status === "loading" ? INK55 : INK, color: PAPER, fontFamily: GROT, fontWeight: 800, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", border: "none", cursor: status === "loading" ? "not-allowed" : "pointer" }}
          >
            {status === "loading" ? "Sending…" : "Send Invite →"}
          </button>
        </form>

        {msg && (
          <p style={{ marginTop: 16, fontFamily: GROT, fontSize: 12, color: status === "error" ? "#c0392b" : INK55 }}>
            {msg}
          </p>
        )}

      </div>
    </div>
  );
}
