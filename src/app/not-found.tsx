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
      <p style={{ fontFamily: SERIF, fontSize: 15, color: INK70, fontStyle: "italic", margin: 0 }}>
        Check <strong style={{ color: INK, fontStyle: "normal" }}>{email}</strong> for a confirmation link.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: "flex", gap: 0 }}>
        <input
          type="email"
          name="EMAIL"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          style={{
            flex: 1, padding: "12px 14px",
            border: `2px solid ${INK}`, borderRight: "none",
            background: PAPER, color: INK,
            fontFamily: SERIF, fontSize: 15, outline: "none", minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            padding: "12px 16px",
            background: status === "loading" ? "rgba(255,214,0,.6)" : YEL,
            color: INK, border: `2px solid ${INK}`,
            cursor: status === "loading" ? "wait" : "pointer",
            fontFamily: GROT, fontWeight: 800, fontSize: 10,
            letterSpacing: "0.14em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {status === "loading" ? "Sending..." : "Subscribe →"}
        </button>
      </div>
      {status === "error" && (
        <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 12, color: "#cc0000", fontStyle: "italic" }}>
          {errorMsg || "Something went wrong. Please try again."}
        </p>
      )}
    </form>
  );
}

export default function NotFound() {
  const btnBase: React.CSSProperties = {
    fontFamily: GROT, fontWeight: 800, fontSize: 10,
    letterSpacing: "0.12em", textTransform: "uppercase",
    padding: "11px 18px", textDecoration: "none",
    display: "inline-block",
  };

  return (
    <>
      <section
        className="sx"
        style={{
          background: PAPER,
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: 32,
          paddingBottom: 48,
        }}
      >
        {/* Two-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px 56px",
          alignItems: "center",
          maxWidth: 960,
          margin: "0 auto",
          width: "100%",
        }}>

          {/* LEFT — illustration + caption */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", alignSelf: "stretch", gap: 20 }}>
            <Image
              src="/images/404-reporter.png"
              alt="A confused reporter standing at a crossroads signpost labelled Home, EMOS, and Resources"
              width={540}
              height={360}
              priority
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <p style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(16px, 1.8vw, 20px)",
              color: INK70,
              lineHeight: 1.5,
              margin: 0,
              textAlign: "center",
            }}>
              Whatever you were chasing has moved on.
            </p>
          </div>

          {/* RIGHT — nav + newsletter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <p style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(16px, 2vw, 20px)",
              color: INK,
              lineHeight: 1.5,
              margin: 0,
            }}>
              Here&rsquo;s where to pick up the trail:
            </p>

            {/* Primary nav buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/" style={{ ...btnBase, background: INK, color: YEL }}>
                Home &rarr;
              </a>
              <a href="/resources" style={{ ...btnBase, border: `2px solid ${INK}`, color: INK, background: "transparent" }}>
                Resources &rarr;
              </a>
              <a href="/emos-academy" style={{ ...btnBase, border: `2px solid ${INK}`, color: INK, background: "transparent" }}>
                EMOS &rarr;
              </a>
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, border: `2px solid ${INK}`, color: INK, background: "transparent" }}>
                Book a call &rarr;
              </a>
            </div>

            <DoubleRule style={{ margin: 0, maxWidth: 160 }} />

            {/* Newsletter */}
            <div>
              <SCaps size={9} ls="0.18em" color={INK55} style={{ marginBottom: 6 }}>
                Subscriptions Desk
              </SCaps>
              <p style={{
                fontFamily: SERIF, fontWeight: 700,
                fontSize: "clamp(17px, 2vw, 21px)",
                letterSpacing: "-0.02em", color: INK,
                margin: "0 0 4px",
              }}>
                Don&rsquo;t lose the thread.
              </p>
              <p style={{
                fontFamily: SERIF, fontStyle: "italic",
                fontSize: 14, color: INK70,
                margin: "0 0 14px", lineHeight: 1.5,
              }}>
                Real earned-media case studies. One or two emails a month. No filler.
              </p>
              <InlineNewsletterForm />
              <p style={{ marginTop: 8, fontFamily: SERIF, fontSize: 11, color: INK55, fontStyle: "italic" }}>
                No spam · One-click unsubscribe anytime.
              </p>
            </div>

          </div>
        </div>
      </section>
      <Colophon />
    </>
  );
}
