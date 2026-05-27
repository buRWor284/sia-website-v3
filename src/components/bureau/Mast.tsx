import Link from "next/link";
import {
  CALENDLY,
  GROT,
  INK,
  INK55,
  PAPER,
  SERIF,
} from "@/lib/tokens";
import {
  DoubleRule,
  HRule,
  Mark,
  SCaps,
  SiaLogo,
} from "./primitives";

const NAV: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Home",            href: "/" },
  { label: "About",           href: "/about" },
  { label: "Speaking",        href: "/speaking" },
  { label: "EMOS",            href: "/emos" },
  { label: "Fractional CMO",  href: "/fractional-cmo" },
  { label: "Podcast",         href: "/podcast" },
  { label: "Writing",         href: "/writing" },
  { label: "Clients",         href: "/clients" },
  { label: "Gallery",         href: "/gallery" },
  { label: "Contact",         href: "/contact" },
];

type MastProps = {
  active?: string;
  filedAs?: string;
  /** ISO date or display string. Defaults to the static "May 27, 2026"
   *  string the prototype used; replace with a real <time> when ready. */
  dateline?: string;
};

export const Mast = ({
  active = "Home",
  filedAs = "Peshawar Edition · Vol. XV",
  dateline = "Wednesday, May 27, 2026",
}: MastProps) => (
  <header style={{ background: PAPER, padding: "20px 56px 16px" }}>
    {/* Top utility line */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 14,
      }}
    >
      <SCaps size={10.5} ls="0.20em">
        {dateline} · {filedAs}
      </SCaps>
      <SCaps size={10.5} ls="0.20em" color={INK55}>
        Issue Nº 029 &nbsp;·&nbsp;
        <Mark>
          <span
            style={{
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 10.5,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
            }}
          >
            Open for projects, Q3
          </span>
        </Mark>
      </SCaps>
    </div>
    <DoubleRule />

    {/* Big masthead lockup */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 24,
        padding: "20px 0 16px",
      }}
    >
      <div>
        <SCaps size={11.5} ls="0.22em">
          The Sunday Bureau · Founded 2010
        </SCaps>
        <div
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: INK55,
            lineHeight: 1.3,
            maxWidth: 320,
          }}
        >
          &ldquo;The pen is mightier than the sword, and, wielded well,
          mightier than most marketing budgets.&rdquo;
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-block", textDecoration: "none" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 22,
              background: INK,
              padding: "14px 28px",
            }}
          >
            <SiaLogo height={56} />
            <div
              style={{
                width: 1,
                alignSelf: "stretch",
                background: "rgba(241,235,222,.25)",
              }}
            />
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 56,
                color: PAPER,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                textAlign: "left",
              }}
            >
              The <span style={{ fontStyle: "italic" }}>Bureau</span>
            </div>
          </div>
        </Link>
        <div style={{ marginTop: 10 }}>
          <SCaps size={11} ls="0.32em" color="rgba(26,20,16,.70)">
            Syed · Irfan · Ajmal &nbsp;·&nbsp; Marketing, Media &amp; Press
          </SCaps>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <SCaps size={11.5} ls="0.22em">
          Subscribe · Two emails a month
        </SCaps>
        <div
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: INK55,
            maxWidth: 320,
            marginLeft: "auto",
          }}
        >
          Quiet, candid letters from the bureau.
        </div>
      </div>
    </div>
    <DoubleRule />

    {/* Nav */}
    <nav
      style={{
        padding: "14px 0 6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", gap: 28, alignItems: "baseline" }}>
        {NAV.map((item) => {
          const isActive = item.label === active;
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                color: INK,
                textDecoration: "none",
                fontWeight: isActive ? 700 : 500,
                fontStyle: item.label === "EMOS" ? "italic" : "normal",
                paddingBottom: 2,
                position: "relative",
              }}
            >
              {isActive ? <Mark>{item.label}</Mark> : item.label}
            </Link>
          );
        })}
      </div>
      <a
        href={CALENDLY}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "10px 18px",
          background: INK,
          color: PAPER,
          textDecoration: "none",
          fontFamily: GROT,
          fontWeight: 700,
          fontSize: 11.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Book a discovery call →
      </a>
    </nav>
    <HRule color={INK} />
  </header>
);
