"use client";

import { useState } from "react";
import { GROT, INK, PAPER, SERIF, YEL } from "@/lib/tokens";
import { SCaps, SectionMast, SiaLogo } from "./primitives";

const GDPR_CHECKBOXES = [
  { id: "gdpr_2381", name: "gdpr[2381]", label: "Email" },
  { id: "gdpr_2385", name: "gdpr[2385]", label: "Direct Mail" },
  { id: "gdpr_2389", name: "gdpr[2389]", label: "Customized Online Advertising" },
];

const MailchimpForm = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => {
    if (email && /.+@.+\..+/.test(email)) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <SCaps size={11} ls="0.20em" color={YEL}>Confirmation sent</SCaps>
        <p style={{
          margin: "14px 0 0", fontFamily: SERIF, fontSize: 19,
          color: PAPER, lineHeight: 1.5, fontStyle: "italic",
        }}>
          Check <span style={{ color: YEL, fontStyle: "normal" }}>{email}</span>
          {" "}— there&rsquo;s a confirmation note from the bureau waiting
          for you. Click the link inside and you&rsquo;re on the list.
        </p>
        <button
          onClick={() => { setSubmitted(false); setEmail(""); }}
          style={{
            marginTop: 18, padding: "12px 16px", background: "transparent",
            color: PAPER, border: "1px solid rgba(241,235,222,.5)",
            cursor: "pointer",
            fontFamily: GROT, fontWeight: 700, fontSize: 11,
            letterSpacing: "0.16em", textTransform: "uppercase",
          }}
        >Subscribe another email</button>
      </div>
    );
  }

  return (
    <form
      action="https://syedirfanajmal.us9.list-manage.com/subscribe/post?u=92d894afae4496839afa2a07d&amp;id=4b6d81a50f&amp;v_id=4651&amp;f_id=003bd4e3f0"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      className="validate"
      target="_blank"
      noValidate
      onSubmit={onSubmit}
    >
      <SCaps size={11} ls="0.20em" color={YEL}>Apply for a subscription</SCaps>
      <div className="sub-form-row">
        <input
          type="email"
          name="EMAIL"
          id="mce-EMAIL"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          className="sub-input required email"
          style={{
            flex: 1,
            padding: "18px 18px",
            border: "1px solid rgba(241,235,222,.5)",
            borderRight: "none",
            background: "transparent",
            color: PAPER,
            fontFamily: SERIF,
            fontSize: 17,
            outline: "none",
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          name="subscribe"
          id="mc-embedded-subscribe"
          className="sub-btn"
          style={{
            background: YEL,
            color: INK,
            border: `1px solid ${YEL}`,
            cursor: "pointer",
            fontFamily: GROT,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Subscribe →
        </button>
      </div>

      {/* GDPR Marketing Permissions */}
      <div id="mergeRow-gdpr" style={{ marginTop: 22 }}>
        <SCaps size={10} ls="0.18em" color="rgba(241,235,222,.55)">
          Marketing Permissions
        </SCaps>
        <p style={{
          margin: "8px 0 10px",
          fontFamily: SERIF,
          fontSize: 13.5,
          color: "rgba(241,235,222,.45)",
          lineHeight: 1.5,
          fontStyle: "italic",
        }}>
          Select the ways you&rsquo;d like to hear from SIA Enterprises:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {GDPR_CHECKBOXES.map(({ id, name, label }) => (
            <label
              key={id}
              htmlFor={id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontFamily: GROT,
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(241,235,222,.65)",
              }}
            >
              <input
                type="checkbox"
                id={id}
                name={name}
                className="gdpr"
                value="Y"
                style={{
                  width: 14,
                  height: 14,
                  cursor: "pointer",
                  flexShrink: 0,
                  accentColor: YEL,
                }}
              />
              {label}
            </label>
          ))}
        </div>
        <p style={{
          margin: "12px 0 0",
          fontFamily: SERIF,
          fontSize: 12.5,
          color: "rgba(241,235,222,.35)",
          lineHeight: 1.5,
          fontStyle: "italic",
        }}>
          You can unsubscribe at any time by clicking the link in the footer of our emails.
          We use Mailchimp as our marketing platform.{" "}
          <a
            href="https://mailchimp.com/legal/terms"
            target="_blank"
            rel="noreferrer"
            style={{ color: "rgba(241,235,222,.5)", textUnderlineOffset: 3 }}
          >
            Learn more
          </a>{" "}
          about Mailchimp&rsquo;s privacy practices.
        </p>
      </div>

      {/* Mailchimp response messages */}
      <div id="mce-responses" style={{ marginTop: 12 }}>
        <div
          id="mce-error-response"
          style={{
            display: "none",
            fontFamily: SERIF,
            fontSize: 14,
            color: "#ff6b6b",
            fontStyle: "italic",
            marginBottom: 8,
          }}
        />
        <div
          id="mce-success-response"
          style={{
            display: "none",
            fontFamily: SERIF,
            fontSize: 14,
            color: YEL,
            fontStyle: "italic",
            marginBottom: 8,
          }}
        />
      </div>

      {/* Honeypot — must stay hidden, must keep this exact name */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
        <input
          type="text"
          name="b_92d894afae4496839afa2a07d_4b6d81a50f"
          tabIndex={-1}
          defaultValue=""
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <SCaps size={10.5} ls="0.14em" color="rgba(241,235,222,.45)">
          No spam · One-click unsubscribe · Hosted by Mailchimp
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
      background: INK,
      color: PAPER,
      paddingTop: 80,
      paddingBottom: 80,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: -60,
        left: -80,
        opacity: 0.06,
        pointerEvents: "none",
      }}
    >
      <SiaLogo height={360} />
    </div>

    <SectionMast
      n={sectionNumber}
      label="Subscriptions Desk · Two emails a month"
      dark
    />

    <div className="grid-subscriptions">
      <div>
        <h2
          className="sub-h2"
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            color: PAPER,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
        >
          A letter
          <br />
          <span style={{ fontStyle: "italic", color: YEL }}>
            from the bureau.
          </span>
        </h2>
        <p
          style={{
            marginTop: 22,
            fontFamily: SERIF,
            fontSize: 18,
            color: "rgba(241,235,222,.72)",
            lineHeight: 1.55,
            maxWidth: 480,
          }}
        >
          One or two letters a month. Real case studies, the campaigns I&rsquo;m
          building right now, and zero filler. Unsubscribe whenever.
        </p>
      </div>

      <MailchimpForm />
    </div>
  </section>
);
