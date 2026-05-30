"use client";

import { useState } from "react";
import { Colophon, Subscriptions } from "@/components/bureau";
import {
  Flag,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import { ClientLogo } from "@/components/bureau/ClientLogo";
import { CLIENTS_PRE, CLIENTS_TIER1, CLIENTS_TIER2, type Client } from "@/data/clients";
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

const TOTAL = CLIENTS_PRE.length + CLIENTS_TIER1.length + CLIENTS_TIER2.length;

const Hero = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 32 }}>
    <div style={{ textAlign: "center" }}>
      <SCaps size={11.5} ls="0.32em" color={INK70}>
        The Bureau Portfolio &nbsp;·&nbsp; Filed clients, dated engagements &nbsp;·&nbsp; Edition of {new Date().getFullYear()}
      </SCaps>
    </div>

    <h1
      className="hero-h1"
      style={{
        margin: "28px 0 0",
        fontFamily: SERIF,
        fontWeight: 700,
        color: INK,
      }}
    >
      Selected
      <br />
      <span style={{ fontStyle: "italic" }}>engagements</span>, filed.
    </h1>

    <p
      style={{
        maxWidth: 760,
        margin: "28px auto 0",
        textAlign: "center",
        fontFamily: SERIF,
        fontSize: 21,
        color: INK70,
        lineHeight: 1.55,
        fontStyle: "italic",
      }}
    >
      A working roster — public-sector and corporate engagements before the
      agency; eight featured engagements with case-study results; and a
      supporting list of clients the bureau has been pleased to serve. Click
      any featured card to read the brief.
    </p>

    <div
      className="grid-stats"
      style={{
        marginTop: 40,
        borderTop: `1px solid ${INK}`,
        borderBottom: `1px solid ${INK}`,
      }}
    >
      {[
        [String(TOTAL),                       "Clients on the roster"],
        [String(CLIENTS_TIER1.length),        "Featured · with results"],
        ["6",                                 "Countries served"],
        ["2007–",                             "Years in practice"],
      ].map(([k, v]) => (
        <div
          key={k}
          className="stat-item"
          style={{ padding: "22px 20px", textAlign: "center" }}
        >
          <div className="stat-number" style={{ fontFamily: SERIF, fontWeight: 700, color: INK }}>
            {k}
          </div>
          <div style={{ marginTop: 6 }}>
            <SCaps size={10.5} ls="0.18em" color={INK70}>{v}</SCaps>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── Section A · Pre-agency ───────────────────────────────────────────────────

const PreAgencyCard = ({ c }: { c: Client }) => (
  <article
    style={{
      background: PAPER,
      border: `1px solid ${INK}`,
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minHeight: 360,
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <Flag c={c.country as any} w={22} />
        <SCaps size={10.5} ls="0.18em" color={INK55}>{c.countryLabel}</SCaps>
      </div>
      <SCaps size={10.5} ls="0.18em" color={INK55}>{c.when}</SCaps>
    </div>

    <div
      style={{
        flex: "0 0 auto",
        borderTop: `1px solid ${INK15}`,
        borderBottom: `1px solid ${INK15}`,
        padding: "18px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 92,
      }}
    >
      <ClientLogo client={c} height={c.logo ? 64 : 56} maxWidth={240} />
    </div>

    <div>
      <h3
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 30,
          lineHeight: 1.08,
          letterSpacing: "-0.015em",
          color: INK,
        }}
      >
        {c.name}
      </h3>
      <div
        style={{
          marginTop: 6,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 16,
          color: INK70,
        }}
      >
        {c.fullName}
      </div>
      <div style={{ marginTop: 12 }}>
        <SCaps size={10.5} ls="0.20em" color={INK}>{c.role}</SCaps>
      </div>
    </div>

    <p
      style={{
        margin: 0,
        fontFamily: SERIF,
        fontSize: 15.5,
        color: INK70,
        lineHeight: 1.5,
        flex: 1,
      }}
    >
      {c.blurb}
    </p>
  </article>
);

const PreAgency = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 40, paddingBottom: 64 }}>
    <SectionMast n="A" label="Before founding DMR.agency · The pre-agency desk" />
    <div className="grid-pre-agency">
      {CLIENTS_PRE.map((c) => (
        <PreAgencyCard key={c.key} c={c} />
      ))}
    </div>
  </section>
);

// ─── Section B · Tier 1 (interactive expand) ──────────────────────────────────

type Tier1CardProps = { c: Client; open: boolean; onToggle: () => void };

const Tier1Card = ({ c, open, onToggle }: Tier1CardProps) => {
  const statFontSize = c.stat && c.stat.length > 12 ? 26 : c.stat && c.stat.length > 8 ? 32 : 40;
  const countryName =
    c.country === "UK" ? "United Kingdom" :
    c.country === "US" ? "United States"  :
    c.country === "EU" ? "Europe"         :
    c.country === "PK" ? "Pakistan"       : c.country;

  return (
    <article
      onClick={onToggle}
      style={{
        position: "relative",
        cursor: "pointer",
        background: open ? INK : PAPER,
        color: open ? PAPER : INK,
        border: `1px solid ${INK}`,
        padding: open ? "26px 28px 28px" : "20px 22px 22px",
        gridColumn: open ? "span 2" : "span 1",
        transition: "background .25s, color .25s, padding .2s",
        display: "flex",
        flexDirection: "column",
        gap: open ? 16 : 12,
        minHeight: 200,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div
          style={{
            background: PAPER,
            padding: "10px 14px",
            border: `1px solid ${open ? "rgba(241,235,222,.4)" : INK15}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 58,
            minWidth: 120,
          }}
        >
          <ClientLogo client={c} height={40} maxWidth={160} />
        </div>
        {!open && (
          <div
            style={{
              width: 22,
              height: 22,
              border: `1px solid ${INK}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 14,
              color: INK,
              flexShrink: 0,
            }}
          >
            +
          </div>
        )}
        {open && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            style={{
              width: 26,
              height: 26,
              background: "transparent",
              border: `1px solid ${PAPER}`,
              color: PAPER,
              fontFamily: GROT,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Headline result */}
      <div
        style={{
          borderTop: `1px solid ${open ? "rgba(241,235,222,.4)" : INK}`,
          borderBottom: `1px solid ${open ? "rgba(241,235,222,.4)" : INK}`,
          padding: "12px 0",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: statFontSize,
            color: open ? YEL : INK,
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
          }}
        >
          {c.stat}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: GROT,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: open ? "rgba(241,235,222,.65)" : INK55,
            lineHeight: 1.35,
          }}
        >
          {c.statLabel}
        </div>
      </div>

      {/* Name + sector */}
      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: open ? 28 : 21,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            color: open ? PAPER : INK,
          }}
        >
          {c.name}
        </h3>
        <div
          style={{
            marginTop: 4,
            fontFamily: GROT,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: open ? "rgba(241,235,222,.6)" : INK55,
          }}
        >
          {c.sector} &nbsp;·&nbsp; {countryName}
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 17,
              lineHeight: 1.55,
              color: "rgba(241,235,222,.88)",
            }}
          >
            {c.blurb}
          </p>
          <div style={{ marginTop: 18 }}>
            <SCaps size={10.5} ls="0.22em" color={YEL}>Role · the bureau</SCaps>
            <div
              style={{
                marginTop: 6,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 16.5,
                color: PAPER,
              }}
            >
              {c.role}
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {c.caseStudy ? (
              <a
                href={c.caseStudy}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: "10px 16px",
                  background: YEL,
                  color: INK,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Read the case study →
              </a>
            ) : (
              <span
                style={{
                  padding: "10px 16px",
                  border: "1px solid rgba(241,235,222,.4)",
                  color: "rgba(241,235,222,.65)",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Case on request
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

const Tier1 = () => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <section className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 64 }}>
      <SectionMast n="B" label="Featured engagements · Results on the record" />
      <div className="grid-tier1">
        {CLIENTS_TIER1.map((c) => (
          <Tier1Card
            key={c.key}
            c={c}
            open={openKey === c.key}
            onToggle={() => setOpenKey((prev) => (prev === c.key ? null : c.key))}
          />
        ))}
      </div>
    </section>
  );
};

// ─── Section C · Tier 2 ───────────────────────────────────────────────────────

const Tier2Cell = ({ c }: { c: Client }) => (
  <div
    style={{
      border: `1px solid ${INK15}`,
      background: PAPER,
      padding: 18,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      minHeight: 138,
    }}
  >
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <ClientLogo client={c} height={48} maxWidth={150} />
    </div>
    <div
      style={{
        borderTop: `1px solid ${INK15}`,
        paddingTop: 10,
        width: "100%",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 14.5,
          color: INK,
          lineHeight: 1.2,
        }}
      >
        {c.name}
      </div>
      <div
        style={{
          marginTop: 3,
          fontFamily: GROT,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: INK55,
        }}
      >
        {c.sector}
      </div>
    </div>
  </div>
);

const Tier2 = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 0, paddingBottom: 80 }}>
    <SectionMast n="C" label="Additional clients · The wider roster" />
    <div className="grid-tier2">
      {CLIENTS_TIER2.map((c) => (
        <Tier2Cell key={c.key} c={c} />
      ))}
    </div>
  </section>
);

// ─── Editor's Note ────────────────────────────────────────────────────────────

const EditorsNote = () => (
  <section className="sx" style={{ background: PAPER, paddingTop: 60, paddingBottom: 40 }}>
    <SectionMast n="D" label="Editor's note · A working filter" />
    <div className="grid-intro">
      <div>
        <SCaps size={11} ls="0.22em" color={INK55}>From the desk of</SCaps>
        <div
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          Syed Irfan Ajmal
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 16,
            color: INK70,
          }}
        >
          Peshawar · Founded DMR.agency 2010
        </div>
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 21,
            lineHeight: 1.55,
            color: INK,
          }}
        >
          This roster is selective, not exhaustive. The pre-agency engagements
          are the ones I refer back to most often — GIZ, Marcus Evans, and
          InfoShare gave the early shape to how I think about marketing under
          institutional weight. The featured DMR.agency engagements are the
          ones where the numbers are documented and the case studies hold up
          to a careful reading.
        </p>
        <p
          style={{
            marginTop: 14,
            fontFamily: SERIF,
            fontSize: 18,
            fontStyle: "italic",
            color: INK70,
            lineHeight: 1.55,
          }}
        >
          Engagements omitted on purpose: one defunct startup; a weapons
          retailer; a regional-only client that doesn&rsquo;t signal the
          international scope of the practice; a confidential bottler. None
          of those were unsuccessful; they were just not the right shape for
          this page.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "12px 18px",
              background: INK,
              color: PAPER,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Book a discovery call →
          </a>
          <a
            href="/emos"
            style={{
              padding: "12px 18px",
              background: "transparent",
              color: INK,
              border: `1px solid ${INK}`,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            EMOS · Earned media programme →
          </a>
          <a
            href="/fractional-cmo"
            style={{
              padding: "12px 18px",
              background: "transparent",
              color: INK,
              border: `1px solid ${INK}`,
              textDecoration: "none",
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Fractional CMO →
          </a>
        </div>
      </div>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  return (
    <div style={{ background: PAPER, minHeight: "100vh" }}>
      <Hero />
      <PreAgency />
      <Tier1 />
      <Tier2 />
      <EditorsNote />
      <Subscriptions sectionNumber="E" />
      <Colophon />
    </div>
  );
}
