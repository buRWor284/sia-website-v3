"use client";

import { useState } from "react";
import Image from "next/image";
import { Colophon } from "@/components/bureau";
import { DoubleRule, SCaps } from "@/components/bureau/primitives";
import { CALENDLY, GROT, INK, INK55, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";

// Mailchimp config
const MC_U   = "92d894afae4496839afa2a07d";
const MC_ID  = "4b6d81a50f";
const MC_VID = "4651";
const MC_FID = "003bd4e3f0";
const MC_HONEYPOT       = `b_${MC_U}_${MC_ID}`;
const MC_GDPR_EMAIL_KEY = "2381";

type Status = "idle" | "loading" | "success" | "error";

function InlineNewsletterForm() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) return;
    setStatus("loading");

    const params = new URLSearchParams({
      u:    MC_U,
      id:   MC_ID,
      v_id: MC_VID,
      f_id: MC_FID,
      EMAIL: email,
      [MC_HONEYPOT]: "",
    });
    params.append(`gdpr[${MC_GDPR_EMAIL_KEY}]`, "Y");

    const cbName = `_mc_cb_${Date.now()}`;
    const url    = `https://us9.list-manage.com/subscribe/post-json?${params.toString()}&c=${cbName}`;
    const timeout = setTimeout(() => { cleanup(); setStatus("error"); setErrorMsg("Request timed out."); }, 10000);
    const script  = document.createElement("script");

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
        setStatus("error");
        setErrorMsg(data.msg.replace(/<[^>]+>/g, "").replace(/^\d+ - /, ""));
      }
    };

    script.src = url;
    document.body.appendChild(script);
  };

  if (status === "success") {
    return (
      <p style={{ fontFamily: SERIF, fontSize: 16, color: INK70, fontStyle: "italic", margin: 0 }}>
        ✓ Check <strong style={{ color: INK, fontStyle: "normal" }}>{email}</strong> — confirmation link is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 0, maxWidth: 480, margin: "0 auto" }}>
        <input
          type="email"
          name="EMAIL"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          style={{
            flex: 1, padding: "14px 16px",
            border: `2px solid ${INK}`, borderRight: "none",
            background: PAPER, color: INK,
            fontFamily: SERIF, fontSize: 16, outline: "none", minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            padding: "14px 20px",
            background: status === "loading" ? "rgba(255,214,0,.6)" : YEL,
            color: INK, border: `2px solid ${INK}`,
            cursor: status === "loading" ? "wait" : "pointer",
            fontFamily: GROT, fontWeight: 800, fontSize: 11,
            letterSpacing: "0.14em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? "Sending…" : "Subscribe →"}
        </button>
      </div>
      {status === "error" && (
        <p style={{ margin: "8px 0 0", fontFamily: SERIF, fontSize: 13, color: "#cc0000", fontStyle: "italic" }}>
          {errorMsg || "Something went wrong. Please try again."}
        </p>
      )}
    </form>
  );
}

export default function NotFound() {
  return (
    <>
      <section
        className="sx"
        style={{
          background: PAPER,
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          paddingTop: 64,
          paddingBottom: 80,
        }}
      >
        {/* Reporter illustration */}
        <div style={{ marginBottom: 36 }}>
          <Image
            src="/images/404-reporter.png"
            alt="A confused reporter standing at a crossroads signpost labelled Home, EMOS, and Resources"
            width={420}
            height={280}
            priority
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: "clamp(30px, 5vw, 60px)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: INK,
            maxWidth: 640,
            margin: 0,
          }}
        >
          My source said it was here.
        </h1>

        <p
          style={{
            marginTop: 16,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 19,
            color: INK70,
            maxWidth: 500,
            lineHeight: 1.55,
          }}
        >
          Whatever you were chasing has moved on — but the story isn&rsquo;t over.
          Here&rsquo;s where to pick up the trail:
        </p>

        <DoubleRule style={{ marginTop: 36, marginBottom: 36, maxWidth: 200 }} />

        {/* Quick nav links */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
          <a
            href="/"
            style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "14px 24px", background: INK, color: YEL,
              textDecoration: "none",
            }}
          >
            Back to home &rarr;
          </a>
          <a
            href="/resources"
            style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "14px 24px", border: `2px solid ${INK}`,
              color: INK, background: "transparent", textDecoration: "none",
            }}
          >
            Resources &rarr;
          </a>
          <a
            href="/emos"
            style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "14px 24px", border: `2px solid ${INK}`,
              color: INK, background: "transparent", textDecoration: "none",
            }}
          >
            EMOS platform &rarr;
          </a>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: GROT, fontWeight: 800, fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "14px 24px", border: `2px solid ${INK}`,
              color: INK, background: "transparent", textDecoration: "none",
            }}
          >
            Book a call &rarr;
          </a>
        </div>

        <SCaps size={9} ls="0.18em" color={INK55} style={{ marginBottom: 56 }}>
          Or try: &nbsp;
          <a href="/about" style={{ color: INK, textDecoration: "underline" }}>About</a> &nbsp;&middot;&nbsp;
          <a href="/podcast" style={{ color: INK, textDecoration: "underline" }}>Podcast</a> &nbsp;&middot;&nbsp;
          <a href="/contact" style={{ color: INK, textDecoration: "underline" }}>Contact</a>
        </SCaps>

        {/* Newsletter strip */}
        <div
          style={{
            width: "100%", maxWidth: 600,
            borderTop: `2px solid ${INK}`,
            paddingTop: 40,
          }}
        >
          <SCaps size={10} ls="0.20em" color={INK55} style={{ marginBottom: 10 }}>
            Subscriptions Desk
          </SCaps>
          <p
            style={{
              fontFamily: SERIF, fontWeight: 700,
              fontSize: "clamp(20px, 3vw, 26px)",
              letterSpacing: "-0.02em", color: INK,
              margin: "0 0 8px",
            }}
          >
            Don&rsquo;t lose the thread.
          </p>
          <p
            style={{
              fontFamily: SERIF, fontStyle: "italic",
              fontSize: 16, color: INK70,
              margin: "0 0 24px", lineHeight: 1.55,
            }}
          >
            Real earned-media case studies. One or two emails a month. No filler.
          </p>
          <InlineNewsletterForm />
          <p style={{ marginTop: 14, fontFamily: SERIF, fontSize: 12, color: INK55, fontStyle: "italic" }}>
            No spam · One-click unsubscribe anytime.
          </p>
        </div>
      </section>
      <Colophon />
    </>
  );
}
