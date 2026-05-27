import Link from "next/link";
import {
  GROT,
  INK,
  INK15,
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
    <section style={{ background: PAPER, padding: "24px 56px 36px" }}>
      <DoubleRule />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "18px 0 8px",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
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
          }}
        >
          The full roster · 26 clients →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr) 1px repeat(5, 1fr)",
          gap: 0,
          border: `1px solid ${INK}`,
          background: PAPER,
          marginTop: 6,
        }}
      >
        {pre.map((c, i) => (
          <div
            key={c.key}
            style={{
              padding: "20px 16px",
              borderRight: i < pre.length - 1 ? `1px solid ${INK15}` : "none",
              background: PAPER2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minHeight: 100,
            }}
          >
            <ClientLogo client={c} height={48} maxWidth={180} />
            <div
              style={{
                fontFamily: GROT,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: INK55,
              }}
            >
              {c.countryLabel ? c.countryLabel.split("·")[0].trim() : ""}
            </div>
          </div>
        ))}
        <div style={{ background: INK }} />
        {featured.map((c, i) => (
          <div
            key={c.key}
            style={{
              padding: "20px 16px",
              borderRight:
                i < featured.length - 1 ? `1px solid ${INK15}` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 100,
            }}
          >
            <ClientLogo client={c} height={42} maxWidth={140} />
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
