import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import {
  DoubleRule,
  HRule,
  Mark,
  Pill,
  SCaps,
  SectionMast,
} from "@/components/bureau/primitives";
import {
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
import { ClientLogo } from "@/components/bureau/ClientLogo";
import { CLIENTS_PRE, CLIENTS_TIER1, CLIENTS_TIER2 } from "@/data/clients";

export default function ClientsPage() {
  const totalClients =
    CLIENTS_PRE.length + CLIENTS_TIER1.length + CLIENTS_TIER2.length;

  return (
    <div style={{ background: PAPER, fontFamily: SERIF, color: INK }}>
      <Mast />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{ background: PAPER, padding: "40px 56px 32px" }}>
        <div style={{ textAlign: "center" }}>
          <SCaps size={11.5} ls="0.32em" color={INK70}>
            The Bureau Portfolio &nbsp;·&nbsp; Filed clients, dated engagements
          </SCaps>
        </div>

        <h1
          style={{
            margin: "28px 0 0",
            textAlign: "center",
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 0.94,
            letterSpacing: "-0.03em",
            color: INK,
          }}
        >
          Selected{" "}
          <span style={{ fontStyle: "italic" }}>
            <Mark>engagements</Mark>
          </span>
          ,{" "}
          <br />
          filed.
        </h1>

        <p
          style={{
            maxWidth: 720,
            margin: "28px auto 0",
            textAlign: "center",
            fontFamily: SERIF,
            fontSize: 20,
            color: INK70,
            lineHeight: 1.55,
            fontStyle: "italic",
          }}
        >
          A working roster — public-sector and corporate engagements before the
          agency; eight featured engagements with case-study results; and a
          supporting list of clients the bureau has been pleased to serve.
        </p>

        {/* Stats strip */}
        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: `1px solid ${INK}`,
            borderBottom: `1px solid ${INK}`,
          }}
        >
          {[
            [String(totalClients), "Clients on the roster"],
            [String(CLIENTS_TIER1.length), "Featured · with results"],
            ["6", "Countries served"],
            ["2007–", "Years in practice"],
          ].map(([k, v], i) => (
            <div
              key={i}
              style={{
                padding: "22px 20px",
                borderLeft: i ? `1px solid ${INK35}` : "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 42,
                  color: INK,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {k}
              </div>
              <div style={{ marginTop: 6 }}>
                <SCaps size={10.5} ls="0.18em" color={INK70}>{v}</SCaps>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Section A · Pre-agency ─────────────────────────────── */}
      <section style={{ padding: "64px 56px" }}>
        <SectionMast n="A" label="Pre-Agency · Public Sector & Corporate Engagements" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginTop: 8,
          }}
        >
          {CLIENTS_PRE.map((c) => (
            <article
              key={c.key}
              style={{
                background: PAPER2,
                border: `1px solid ${INK}`,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Top: country + when */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <SCaps size={10.5} ls="0.18em" color={INK55}>
                  {c.countryLabel}
                </SCaps>
                <SCaps size={10.5} ls="0.18em" color={INK55}>{c.when}</SCaps>
              </div>

              {/* Logo / wordmark */}
              <div
                style={{
                  borderTop: `1px solid ${INK15}`,
                  borderBottom: `1px solid ${INK15}`,
                  padding: "18px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 92,
                }}
              >
                <ClientLogo client={c} height={56} maxWidth={240} />
              </div>

              {/* Full name */}
              {c.fullName && (
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 14,
                    color: INK,
                    lineHeight: 1.3,
                  }}
                >
                  {c.fullName}
                </div>
              )}

              {/* Role */}
              <Pill size={9.5} ls="0.14em">{c.role}</Pill>

              {/* Blurb */}
              <p
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: INK70,
                  fontStyle: "italic",
                  flex: 1,
                }}
              >
                {c.blurb}
              </p>
            </article>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Section B · Tier-1 featured ────────────────────────── */}
      <section style={{ padding: "64px 56px", background: PAPER2 }}>
        <SectionMast
          n="B"
          label="Featured Engagements · DMR.agency · With Results"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
            marginTop: 8,
          }}
        >
          {CLIENTS_TIER1.map((c) => (
            <article
              key={c.key}
              style={{
                background: PAPER,
                border: `1px solid ${INK}`,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                {/* Logo */}
                <div
                  style={{
                    width: 120,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <ClientLogo client={c} height={44} maxWidth={120} />
                </div>
                {/* Stat */}
                {c.stat && (
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 700,
                        fontSize: 20,
                        color: YEL,
                        lineHeight: 1,
                        letterSpacing: "-0.01em",
                        background: INK,
                        padding: "6px 12px",
                        display: "inline-block",
                      }}
                    >
                      {c.stat}
                    </div>
                    {c.statLabel && (
                      <div style={{ marginTop: 4 }}>
                        <SCaps size={9} ls="0.12em" color={INK55}>
                          {c.statLabel}
                        </SCaps>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <HRule />

              <div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 18,
                    color: INK,
                    marginBottom: 4,
                  }}
                >
                  {c.name}
                </div>
                <SCaps size={10} ls="0.14em" color={INK55}>
                  {c.sector} · {c.country}
                </SCaps>
              </div>

              <p
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: INK70,
                  fontStyle: "italic",
                  flex: 1,
                }}
              >
                {c.blurb}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  paddingTop: 8,
                  borderTop: `1px solid ${INK15}`,
                }}
              >
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {c.services?.map((s) => (
                    <Pill key={s} size={9} ls="0.12em">{s}</Pill>
                  ))}
                </div>
                {c.caseStudy && (
                  <a
                    href={c.caseStudy}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: GROT,
                      fontWeight: 700,
                      fontSize: 10.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: INK,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Case study →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── Section C · Tier-2 logo grid ───────────────────────── */}
      <section style={{ padding: "64px 56px" }}>
        <SectionMast n="C" label="Supporting Roster · Further Clients Served" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            border: `1px solid ${INK}`,
            marginTop: 8,
          }}
        >
          {CLIENTS_TIER2.map((c, i) => (
            <div
              key={c.key}
              style={{
                padding: "24px 20px",
                borderRight:
                  (i + 1) % 5 !== 0 ? `1px solid ${INK15}` : "none",
                borderBottom:
                  i < CLIENTS_TIER2.length - 5 ? `1px solid ${INK15}` : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                minHeight: 100,
                justifyContent: "center",
              }}
            >
              <ClientLogo client={c} height={40} maxWidth={120} />
              {c.sector && (
                <SCaps size={9} ls="0.12em" color={INK55}>
                  {c.sector}
                </SCaps>
              )}
            </div>
          ))}
        </div>
      </section>

      <HRule />

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 56px", background: PAPER2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 20px",
                fontWeight: 700,
                fontSize: 48,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
              }}
            >
              Work with{" "}
              <span style={{ fontStyle: "italic" }}>
                <Mark>the bureau.</Mark>
              </span>
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 17,
                lineHeight: 1.65,
                color: INK70,
              }}
            >
              DMR.agency works with a selective roster of clients on earned
              media, SEO, and content strategy. If you are looking for the kind
              of results on this page, start with a discovery call.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a
                href="/emos"
                style={{
                  padding: "11px 20px",
                  background: INK,
                  color: PAPER,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Learn about EMOS →
              </a>
              <a
                href="/contact"
                style={{
                  padding: "11px 20px",
                  border: `1px solid ${INK}`,
                  color: INK,
                  textDecoration: "none",
                  fontFamily: GROT,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Contact →
              </a>
            </div>
          </div>
          <div>
            <DoubleRule />
            <div style={{ padding: "24px 0" }}>
              <SCaps size={10.5} ls="0.18em" color={INK55} style={{ display: "block", marginBottom: 8 }}>
                Services offered
              </SCaps>
              {[
                "Earned Media OS (EMOS) — press, backlinks, authority",
                "SEO strategy + content",
                "Digital PR",
                "Fractional CMO engagements",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "12px 0",
                    borderBottom: `1px solid ${INK15}`,
                    fontFamily: SERIF,
                    fontSize: 15.5,
                    color: INK70,
                    fontStyle: "italic",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Subscriptions sectionNumber="D" />
      <Colophon />
    </div>
  );
}
