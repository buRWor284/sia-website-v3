"use client";

import { useState } from "react";
import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SCaps, SectionMast, SiaLogo } from "./primitives";

// Mailchimp account constants
const MC_U  = "92d894afae4496839afa2a07d";
const MC_ID = "4b6d81a50f";
const MC_VID = "4651";
const MC_FID = "003bd4e3f0";
const MC_HONEYPOT = `b_${MC_U}_${MC_ID}`;

const GDPR_CHECKBOXES = [
  { key: "2381", label: "Email" },
];

type Status = "idle" | "loading" | "success" | "error";

const MailchimpForm = () => {
  const [email, setEmail]   = useState("");
  const [gdpr, setGdpr]     = useState<Record<string, boolean>>({ "2381": false });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleGdpr = (key: string) =>
    setGdpr((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) return;

    setStatus("loading");

    // Build query string
    const params = new URLSearchParams({
      u:     MC_U,
      id:    MC_ID,
      v_id:  MC_VID,
      f_id:  MC_FID,
      EMAIL: email,
      [MC_HONEYPOT]: "", // honeypot must be empty
    });
    GDPR_CHECKBOXES.forEach(({ key }) => {
      if (gdpr[key]) params.append(`gdpr[${key}]`, "Y");
    });

    // Unique callback name to avoid collisions
    const cbName = `_mc_cb_${Date.now()}`;
    const url = `https://us9.list-manage.com/subscribe/post-json?${params.toString()}&c=${cbName}`;

    // Clean up after 10 s in case Mailchimp never responds
    const timeout = setTimeout(() => {
      cleanup();
      setStatus("error");
      setErrorMsg("Request timed out. Please try again.");
    }, 10000);

    const script = document.createElement("script");

    function cleanup() {
      clearTimeout(timeout);
      delete (window as unknown as Record<string, unknown>)[cbName];
      script.remove();
    }

    (window as unknown as Record<string, unknown>)[cbName] = (data: { result: string; msg: string }) => {
      cleanup();
      if (data.result === "success") {
        setStatus("success");
      } else {
        // Strip any Mailchimp HTML tags from the error message
        const clean = data.msg.replace(/<[^>]+>/g, "").replace(/^\d+ - /, "");
        setStatus("error");
        setErrorMsg(clean);
      }
    };

    script.src = url;
    document.body.appendChild(script);
  };

  if (status === "success") {
    return (
      <div>
        <SCaps size={11} ls="0.20em" color={YEL}>Confirmation sent</SCaps>
        <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 19, color: PAPER, lineHeight: 1.5, fontStyle: "italic" }}>
          Check <span style={{ color: YEL, fontStyle: "normal" }}>{email}</span>
          {" "}— there&rsquo;s a confirmation note from the wire waiting for you.
          Click the link inside and you&rsquo;re on the list.
        </p>
        <button
          onClick={() => { setStatus("idle"); setEmail(""); setGdpr({ "2381": false }); }}
          style={{
            marginTop: 18, padding: "12px 16px", background: "transparent",
            color: PAPER, border: "1px solid rgba(241,235,222,.5)",
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
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          className="sub-input"
          style={{
            flex: 1, padding: "18px 18px",
            border: "1px solid rgba(241,235,222,.5)", borderRight: "none",
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

      {/* GDPR Marketing Permissions */}
      <div id="mergeRow-gdpr" style={{ marginTop: 22 }}>
        <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.55)">Marketing Permissions</SCaps>
        <p style={{ margin: "8px 0 10px", fontFamily: SERIF, fontSize: 13.5, color: "rgba(241,235,222,.45)", lineHeight: 1.5, fontStyle: "italic" }}>
          Select the ways you&rsquo;d like to hear from SIA Enterprises:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {GDPR_CHECKBOXES.map(({ key, label }) => (
            <label
              key={key}
              style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                fontFamily: GROT, fontSize: 12, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(241,235,222,.65)",
              }}
            >
              <input
                type="checkbox"
                name={`gdpr[${key}]`}
                value="Y"
                checked={gdpr[key]}
                onChange={() => toggleGdpr(key)}
                style={{ width: 14, height: 14, cursor: "pointer", flexShrink: 0, accentColor: YEL }}
              />
              {label}
            </label>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", fontFamily: SERIF, fontSize: 12.5, color: "rgba(241,235,222,.35)", lineHeight: 1.5, fontStyle: "italic" }}>
          You can unsubscribe at any time by clicking the link in the footer of our emails.
          We use Mailchimp to manage our newsletter.{" "}
          <a href="https://mailchimp.com/legal/terms" target="_blank" rel="noreferrer"
            style={{ color: "rgba(241,235,222,.5)", textUnderlineOffset: 3 }}>Learn more</a>{" "}
          about their privacy practices.
        </p>
      </div>

      <div style={{ marginTop: 14 }}>
        <SCaps size={10.5} ls="0.14em" color="rgba(241,235,222,.45)">
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
          A letter
          <br />
          <span style={{ fontStyle: "italic", color: YEL }}>from the wire.</span>
        </h2>
        <p style={{ marginTop: 14, marginBottom: 0, fontFamily: GROT, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(241,235,222,.5)" }}>
          GEO · SEO-PR · Content Marketing
        </p>
        <p style={{ marginTop: 18, fontFamily: SERIF, fontSize: 18, color: "rgba(241,235,222,.72)", lineHeight: 1.55, maxWidth: 480 }}>
          One or two letters a month. Real case studies, the campaigns I&rsquo;m
          building right now, and zero filler. Unsubscribe whenever.
        </p>
      </div>

      <MailchimpForm />
    </div>
  </section>
);
