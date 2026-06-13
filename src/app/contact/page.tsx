"use client";

import { Colophon, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
  CALENDLY,
  GROT,
  INK,
  INK15,
  INK35,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
  YEL,
} from "@/lib/tokens";
import { useState, useCallback } from "react";
import { Turnstile } from "@/components/Turnstile";
import { ScrollButtons } from "@/components/ScrollButtons";

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="sx" style={{ background: PAPER }}>
      <div className="res-hero-grid">

        {/* Left: count */}
        <div className="res-hero-left">
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 0.85, letterSpacing: "-0.04em", color: INK }}>
            2
          </div>
          <div style={{ marginTop: 10, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: INK55, lineHeight: 1.6 }}>
            Business days<br />to a reply
          </div>
        </div>

        {/* Centre: headline */}
        <div className="res-hero-center">
          <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(56px, 10vw, 128px)", letterSpacing: "-0.04em", color: "rgba(26,20,16,.042)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
            CONTACT
          </div>
          <SCaps size={10} ls="0.24em" color={INK55}>
            Syed Irfan Ajmal · Open door
          </SCaps>
          <h1 style={{ marginTop: 12, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px, 3.8vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.028em", color: INK }}>
            Let&rsquo;s talk about<br />
            <em style={{ fontStyle: "italic", fontWeight: 600 }}>your growth.</em>
          </h1>
          <p style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK70, maxWidth: 480 }}>
            No pitch decks required. Just tell me about your business and where you want to go.
          </p>
        </div>

        {/* Right: topic index */}
        <div className="res-hero-right">
          {[
            { label: "Book a Call",    sub: "Cal.com · 30 min" },
            { label: "Send a Note",    sub: "Via the form below" },
            { label: "Press Inquiry",  sub: "Media · Features · Bylines" },
          ].map(t => (
            <div key={t.label}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, lineHeight: 1.2, letterSpacing: "-0.008em" }}>{t.label}</div>
              <div style={{ marginTop: 4, fontFamily: GROT, fontWeight: 700, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: INK55 }}>{t.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      message: formData.get("message") as string,
      interests: formData.getAll("interest") as string[],
      // Honeypot — should always be empty
      website: formData.get("website") as string,
      // Turnstile token
      turnstileToken,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("sent");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to send. Please try again or email sia@syedirfanajmal.com directly."
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        style={{
          padding: "40px",
          border: `1px solid ${INK15}`,
          textAlign: "center",
        }}
      >
        <Pill size={11} ls="0.18em">Received</Pill>
        <p
          style={{
            margin: "16px 0 0",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 20,
            lineHeight: 1.5,
            color: INK70,
          }}
        >
          Your message has been filed. Expect a reply within two business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Honeypot — hidden from real users, bots will fill it */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}>
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Invisible Turnstile */}
      <Turnstile onToken={handleToken} />

      {/* Error banner */}
      {status === "error" && (
        <div
          style={{
            marginBottom: 20,
            padding: "14px 16px",
            border: `1px solid #c0392b`,
            background: "rgba(192,57,43,0.06)",
            fontFamily: SERIF,
            fontSize: 15,
            lineHeight: 1.5,
            color: "#c0392b",
          }}
        >
          {errorMsg}
        </div>
      )}

      {[
        { id: "name", label: "Your name", type: "text", placeholder: "Full name", required: true },
        { id: "email", label: "Email address", type: "email", placeholder: "you@yourcompany.com", required: true },
        { id: "company", label: "Company or project", type: "text", placeholder: "Optional", required: false },
      ].map(({ id, label, type, placeholder, required }) => (
        <div key={id} style={{ marginBottom: 20 }}>
          <SCaps size={10.5} ls="0.16em" style={{ display: "block", marginBottom: 8 }}>
            {label}
          </SCaps>
          <input
            id={id}
            name={id}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={status === "sending"}
            style={{
              width: "100%",
              padding: "14px 16px",
              border: `1px solid ${INK35}`,
              background: "transparent",
              fontFamily: SERIF,
              fontSize: 17,
              color: INK,
              outline: "none",
              boxSizing: "border-box",
              opacity: status === "sending" ? 0.6 : 1,
            }}
          />
        </div>
      ))}

      <div style={{ marginBottom: 20 }}>
        <SCaps size={10.5} ls="0.16em" style={{ display: "block", marginBottom: 8 }}>
          What can we help with?
        </SCaps>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          disabled={status === "sending"}
          placeholder="Tell us about your project, timeline, and what you're trying to achieve."
          style={{
            width: "100%",
            padding: "14px 16px",
            border: `1px solid ${INK35}`,
            background: "transparent",
            fontFamily: SERIF,
            fontSize: 17,
            color: INK,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            opacity: status === "sending" ? 0.6 : 1,
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <SCaps size={10.5} ls="0.16em" style={{ display: "block", marginBottom: 8 }}>
          I&rsquo;m interested in
        </SCaps>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            "EMOS (Earned Media)",
            "Fractional CMO",
            "Speaking engagement",
            "Content strategy",
            "Something else",
          ].map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: status === "sending" ? "default" : "pointer",
                fontFamily: SERIF,
                fontSize: 15,
                color: INK70,
                opacity: status === "sending" ? 0.6 : 1,
              }}
            >
              <input
                type="checkbox"
                name="interest"
                value={opt}
                disabled={status === "sending"}
                style={{ accentColor: INK }}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <HRule style={{ margin: "8px 0 24px" }} />

      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          alignSelf: "flex-start",
          padding: "14px 28px",
          background: INK,
          color: PAPER,
          border: "none",
          cursor: status === "sending" ? "wait" : "pointer",
          fontFamily: GROT,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: status === "sending" ? 0.6 : 1,
        }}
      >
        {status === "sending" ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Hero />

      {/* ── Header ───────────────────────────────────────────── */}
      <section className="sx" style={{ paddingTop: 80, paddingBottom: 72 }}>
        <SectionMast n="00" label="The Correspondence Desk · Get in Touch" />
        <div className="grid-contact">
          {/* Left: info */}
          <div>
            <h1
              style={{
                margin: "0 0 24px",
                fontWeight: 700,
                fontSize: "clamp(36px, 8vw, 72px)",
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
              }}
            >
              Let&rsquo;s{" "}
              <span style={{ fontStyle: "italic" }}>correspond.</span>
            </h1>
            <p
              style={{
                margin: "0 0 32px",
                fontSize: 18,
                lineHeight: 1.6,
                color: INK70,
                maxWidth: 480,
              }}
            >
              Whether you want to discuss an EMOS engagement, a speaking
              invitation, a fractional CMO arrangement, or just want to share
              what you&rsquo;re working on — get in touch.
            </p>

            <DoubleRule />

            {/* Contact methods */}
            <div style={{ marginTop: 28 }}>
              {[
                {
                  label: "Email",
                  value: "sia@syedirfanajmal.com",
                  href: "mailto:sia@syedirfanajmal.com",
                },
                {
                  label: "Discovery call",
                  value: "Book a strategy call →",
                  href: CALENDLY,
                },
                {
                  label: "LinkedIn",
                  value: "linkedin.com/in/syedirfanajmal",
                  href: "https://linkedin.com/in/syedirfanajmal",
                },
                {
                  label: "Twitter / X",
                  value: "@syedirfanajmal",
                  href: "https://twitter.com/syedirfanajmal",
                },
              ].map(({ label, value, href }) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: 16,
                    padding: "16px 0",
                    borderBottom: `1px solid ${INK15}`,
                    alignItems: "baseline",
                  }}
                >
                  <SCaps size={10.5} ls="0.14em">{label}</SCaps>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{
                      fontFamily: SERIF,
                      fontSize: 16,
                      color: INK,
                      textDecoration: "none",
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </a>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40 }}>
              <SCaps size={11} ls="0.18em" color={YEL}>
                Filing details
              </SCaps>
              <p
                style={{
                  margin: "10px 0 0",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: INK55,
                  maxWidth: 360,
                }}
              >
                Published from Peshawar, Pakistan.
                SIA Enterprises Inc. is incorporated in Wyoming, USA.
                Response time: 1–2 business days.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <Pill size={10.5} ls="0.18em">Send a message</Pill>
            <div style={{ marginTop: 24 }}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <HRule />

      {/* ── Calendly CTA ─────────────────────────────────────── */}
      <section className="sx" style={{ paddingTop: 72, paddingBottom: 72, background: PAPER2 }}>
        <SectionMast n="01" label="The Calendar · Book a Call" />
        <div className="grid-contact-cta">
          <div>
            <h2
              style={{
                margin: "0 0 20px",
                fontWeight: 700,
                fontSize: "clamp(28px, 6vw, 52px)",
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
              }}
            >
              Prefer to{" "}
              <span style={{ fontStyle: "italic" }}>talk?</span>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              Book a 30-minute discovery call directly. We&rsquo;ll review your
              situation, discuss whether EMOS or a fractional arrangement is a good
              fit, and answer any questions you have.
            </p>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 28,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 22px",
                background: INK,
                color: PAPER,
                textDecoration: "none",
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Book a discovery call →
            </a>
          </div>

          <div>
            {[
              { time: "30 min", label: "Discovery call", desc: "Is this a fit?" },
              { time: "60 min", label: "Strategy session", desc: "For existing clients" },
              { time: "15 min", label: "Speaker enquiry", desc: "Event brief + availability" },
            ].map(({ time, label, desc }) => (
              <div
                key={label}
                style={{
                  padding: "20px 0",
                  borderBottom: `1px solid ${INK15}`,
                  display: "grid",
                  gridTemplateColumns: "60px 1fr",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: SERIF,
                    color: YEL,
                    background: INK,
                    padding: "6px 8px",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {time}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{label}</div>
                  <SCaps size={10.5} ls="0.12em" color={INK55} style={{ marginTop: 4 }}>
                    {desc}
                  </SCaps>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Subscriptions sectionNumber="02" />
      <Colophon />
      <ScrollButtons />
    </div>
  );
}
