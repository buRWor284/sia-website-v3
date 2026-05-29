import Link from "next/link";
import { GROT, INK, INK70, PAPER, SERIF, YEL } from "@/lib/tokens";
import { DoubleRule, Pill, SCaps, SiaLogo } from "./primitives";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  strikePart?: string;
  suffix?: string;
};

type FooterCol = {
  head: string;
  items: ReadonlyArray<FooterLink>;
};

const COLS: ReadonlyArray<FooterCol> = [
  {
    head: "Services",
    items: [
      { label: "Fractional CMO",                href: "/fractional-cmo" },
      { label: "EMOS",                           href: "/emos",                                          strikePart: "Rented", suffix: " Own Authority" },
      { label: "Digital PR & Editorial Backlinks", href: "https://dmr.agency/earned-media-booster/",   external: true },
      { label: "Done-For-You Services",          href: "https://dmr.agency",                            external: true },
      { label: "Speaking",                       href: "/speaking" },
    ],
  },
  {
    head: "Navigate",
    items: [
      { label: "Home",       href: "/" },
      { label: "About",      href: "/about" },
      { label: "Podcast",    href: "/podcast" },
      { label: "Insights",   href: "/insights" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    head: "Elsewhere",
    items: [
      { label: "Twitter / X",   href: "https://x.com/syedirfanajmal",                                                    external: true },
      { label: "LinkedIn",      href: "https://www.linkedin.com/in/syedirfanajmal/",                                     external: true },
      { label: "YouTube",       href: "https://youtube.com/@syedirfanajmal/",                                             external: true },
      { label: "Apple Podcasts",href: "https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466", external: true },
      { label: "Spotify",       href: "#" },
    ],
  },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms",          href: "/terms" },
  { label: "Refund Policy",  href: "/refund-policy" },
];

export const Colophon = () => (
  <footer className="sx" style={{ background: PAPER, paddingTop: 60, paddingBottom: 36 }}>
    <DoubleRule style={{ marginBottom: 36 }} />

    <div className="grid-colophon">
      {/* Brand block */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ background: INK, padding: "8px 14px" }}>
            <SiaLogo height={26} />
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 42px)",
              color: INK,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            The <span style={{ fontStyle: "italic" }}>Bureau</span>
          </div>
        </div>
        <p
          style={{
            marginTop: 18,
            marginBottom: 0,
            fontFamily: SERIF,
            fontSize: 15.5,
            color: INK70,
            lineHeight: 1.55,
            maxWidth: 360,
            fontStyle: "italic",
          }}
        >
          Serial entrepreneur. Fractional CMO. CEO of DMR.agency. Founder @ EMOS. Bylines/citations: Forbes, HBR &amp; HuffPost.
        </p>
      </div>

      {/* Link columns */}
      {COLS.map(({ head, items }) => (
        <div key={head}>
          <Pill size={11} ls="0.22em">{head}</Pill>
          <ul
            style={{
              listStyle: "none",
              margin: "14px 0 0",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {items.map((item) => {
              const linkStyle = {
                fontFamily: SERIF,
                fontSize: 16,
                color: INK,
                textDecoration: "none",
                fontWeight: 500,
              } as const;
              const inner = (
                <>
                  {item.label}
                  {item.strikePart && (
                    <> <s style={{ opacity: 0.55 }}>{item.strikePart}</s></>
                  )}
                  {item.suffix}
                  {item.external && (
                    <span style={{ fontSize: 11, marginLeft: 3, opacity: 0.5 }}>↗</span>
                  )}
                </>
              );
              return (
                <li key={item.label}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={item.href} style={linkStyle}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>

    <DoubleRule />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 18,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <SCaps size={10.5} ls="0.16em" color={INK70}>
        © MMXXVI · Syed Irfan Ajmal · SIA Enterprises Inc · Wyoming C-Corp
      </SCaps>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {LEGAL.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            style={{
              fontFamily: GROT,
              fontSize: 10.5,
              color: INK70,
              textDecoration: "none",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <SCaps size={10.5} ls="0.16em" color={INK70}>
        sia[@]syedirfanajmal[dot]com &nbsp;·&nbsp;
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: 999,
            background: YEL,
            marginRight: 6,
            verticalAlign: "middle",
            border: `1px solid ${INK}`,
          }}
        />
        Open for projects
      </SCaps>
    </div>
  </footer>
);
