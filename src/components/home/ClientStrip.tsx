import Link from "next/link";
import {
  GROT,
  INK,
  INK55,
  INK70,
  PAPER,
  PAPER2,
  SERIF,
} from "@/lib/tokens";
import { DoubleRule, HRule, Pill, SCaps } from "@/components/bureau/primitives";
import { ClientLogo } from "@/components/bureau/ClientLogo";
import { CLIENTS_PRE, CLIENTS_TIER1 } from "@/data/clients";

const FEATURED_KEYS = ["nta", "ridester", "centriq", "curednation", "alrug"];

export const ClientStrip = () => {
  const pre = CLIENTS_PRE;
  const featured = CLIENTS_TIER1.filter((c) => FEATURED_KEYS.includes(c.key));

  return (
    <section className="sx" style={{ background: PAPER, paddingTop: 24, paddingBottom: 36 }}>
      <DoubleRule />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "18px 0 8px",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <Pill size={11} ls="0.22em">Filed for →</Pill>
          <SCaps size={11} ls="0.22em" color={INK70}>
            Pre-agency &amp; selected DMR.agency clients
          </SCaps>
        </div>
        <Link
          href="/clients"
          style={{
            fontFamily: GROT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: INK,
            textDecoration: "none",
            borderBottom: `1px solid ${INK}`,
            paddingBottom: 2,
            whiteSpace: "nowrap",
          }}
        >
          The full roster · 26 clients →
        </Link>
      </div>

      {/* Responsive client grid */}
      <div className="grid-clients">
        {pre.map((c, i) => (
          <div
            key={c.key}
            className="client-cell"
            style={{
              padding: "16px 12px",
              background: PAPER2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minHeight: 80,
            }}
          >
            <ClientLogo client={c} height={40} maxWidth={120} />
            <div
              style={{
                fontFamily: GROT,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: INK55,
                textAlign: "center",
              }}
            >
              {c.countryLabel ? c.countryLabel.split("·")[0].trim() : ""}
            </div>
          </div>
        ))}
        {/* Divider — desktop only */}
        <div className="client-divider" style={{ background: INK }} />
        {featured.map((c, i) => (
          <div
            key={c.key}
            className="client-cell"
            style={{
              padding: "16px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 80,
            }}
          >
            <ClientLogo client={c} height={44} maxWidth={120} />
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 10,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <SCaps size={10.5} ls="0.16em" color={INK55}>
          <em
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              textTransform: "none",
              letterSpacing: 0,
              color: INK70,
            }}
          >
            Pre-agency:
          </em>
          &nbsp; GIZ &nbsp;·&nbsp; Marcus Evans &nbsp;·&nbsp; InfoShare
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <em
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              textTransform: "none",
              letterSpacing: 0,
              color: INK70,
            }}
          >
            DMR.agency featured:
          </em>
          &nbsp; NTA · Ridester · Centriq · Curednation · ALRUG
        </SCaps>
        <SCaps size={10.5} ls="0.16em" color={INK55}>
          Eight featured · 26 on the roster
        </SCaps>
      </div>
      <HRule style={{ marginTop: 18 }} />
    </section>
  );
};
