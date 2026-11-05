"use client";

import { useState } from "react";
import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SCaps, SectionMast, SiaLogo } from "./primitives";

type Status = "idle" | "loading" | "success" | "error";

// Footer signup goes through our own /api/newsletter-subscribe route (server-side
// Mailchimp API call). The old browser-side post-json JSONP call was answered
// with "captcha" whenever Mailchimp's bot check fired, which the form can't render.
const MailchimpForm = () => {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tag: "footer" }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div>
        <SCaps size={11} ls="0.20em" color={YEL}>You&rsquo;re on the list</SCaps>
        <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 19, color: PAPER, lineHeight: 1.5, fontStyle: "italic" }}>
          <span style={{ color: YEL, fontStyle: "normal" }}>{email}</span> is subscribed.
          The next issue lands in your inbox.
        </p>
        <button
          onClick={() => { setStatus("idle"); setEmail(""); }}
          style={{
            marginTop: 18, padding: "12px 16px", background: "transparent",
            color: PAPER, border: "1px solid rgba(250,250,250,.5)",
            cursor: "pointer", fontFamily: GROT, fontWeight: 700,
            fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
          }}
        >Subscribe another email</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SCaps size={11} ls="0.20em" color={YEL}>Join our newsletter</SCaps>
      <div className="sub-form-row">
        <input
          type="email"
          name="EMAIL"
          id="mce-EMAIL"
          aria-label="Email address for the newsletter"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          className="sub-input"
          style={{
            flex: 1, padding: "18px 18px",
            border: "1px solid rgba(250,250,250,.5)", borderRight: "none",
            background: "transparent", color: PAPER,
            fontFamily: SERIF, fontSize: 17, outline: "none", minWidth: 0,
          }}
        />
        <button
          type="submit"
          className="sub-btn"
          disabled={status === "loading"}
          style={{
            background: status === "loading" ? "rgba(255,214,0,.6)" : YEL,
            color: INK, border: `1px solid ${YEL}`, cursor: status === "loading" ? "wait" : "pointer",
            fontFamily: GROT, fontWeight: 800, fontSize: 12,
            letterSpacing: "0.16em", textTransform: "uppercase",
          }}
        >
          {status === "loading" ? "Sending…" : "Subscribe →"}
        </button>
      </div>

      {/* Error message */}
      {status === "error" && (
        <p style={{ margin: "10px 0 0", fontFamily: SERIF, fontSize: 14, color: "#ff6b6b", fontStyle: "italic" }}>
          {errorMsg || "Something went wrong. Please try again."}
        </p>
      )}

      <p style={{ margin: "16px 0 0", fontFamily: SERIF, fontSize: 12.5, color: "rgba(250,250,250,.55)", lineHeight: 1.5, fontStyle: "italic" }}>
        By subscribing you agree to receive email updates from SIA Enterprises.
        Unsubscribe anytime via the link in any email. We use Mailchimp; read{" "}
        <a href="https://mailchimp.com/legal/privacy/" target="_blank" rel="noreferrer"
          style={{ color: "rgba(250,250,250,.5)", textUnderlineOffset: 3 }}>Mailchimp&apos;s privacy policy</a>.
      </p>

      <div style={{ marginTop: 14 }}>
        <SCaps size={10.5} ls="0.14em" color="rgba(250,250,250,.55)">
          No spam · One-click unsubscribe
        </SCaps>
      </div>
    </form>
  );
};

export const Subscriptions = ({
  sectionNumber = "06",
}: {
  sectionNumber?: string;
}) => (
  <section
    id="subscriptions"
    className="sx"
    style={{
      background: INK, color: PAPER,
      paddingTop: 80, paddingBottom: 80,
      position: "relative", overflow: "hidden",
    }}
  >
    <div
      aria-hidden
      style={{ position: "absolute", bottom: -60, left: -80, opacity: 0.06, pointerEvents: "none" }}
    >
      <SiaLogo height={360} />
    </div>

    <SectionMast n={sectionNumber} label="Subscriptions Desk · Two emails a month" dark />

    <div className="grid-subscriptions">
      <div>
        <h2
          className="sub-h2"
          style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, color: PAPER, lineHeight: 0.98, letterSpacing: "-0.025em" }}
        >
          Real case studies.
          <br />
          <span style={{ fontStyle: "italic", color: YEL }}>Zero filler.</span>
        </h2>
        <p style={{ marginTop: 14, marginBottom: 0, fontFamily: GROT, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(250,250,250,.5)" }}>
          GEO · SEO-PR · Content Marketing
        </p>
        <p style={{ marginTop: 18, fontFamily: SERIF, fontSize: 18, color: "rgba(250,250,250,.72)", lineHeight: 1.55, maxWidth: 480 }}>
          One or two emails a month. The campaigns I&rsquo;m building right
          now, what&rsquo;s working in earned media, and the case studies
          behind the numbers. Unsubscribe whenever.
        </p>
      </div>

      <MailchimpForm />
    </div>
  </section>
);
