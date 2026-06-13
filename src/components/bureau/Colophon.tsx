import Link from "next/link";
import { availabilityLabel } from "@/lib/site-config";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterCol = {
  head: string;
  items: ReadonlyArray<FooterLink>;
};

const COLS: ReadonlyArray<FooterCol> = [
  {
    head: "The Work",
    items: [
      { label: "Fractional CMO", href: "/fractional-cmo" },
      { label: "Speaking",       href: "/speaking" },
      { label: "EMOS",           href: "/emos" },
      { label: "DMR.agency",     href: "https://dmr.agency", external: true },
      { label: "Ventures",       href: "/ventures" },
      { label: "Clients",        href: "/clients" },
    ],
  },
  {
    head: "Navigate",
    items: [
      { label: "Home",       href: "/" },
      { label: "About",      href: "/about" },
      { label: "Podcast",    href: "/podcast" },
      { label: "Gallery",    href: "/gallery" },
      { label: "Resources",  href: "/resources" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    head: "Connect",
    items: [
      { label: "Contact",           href: "/contact" },
      { label: "Twitter / X ↗",    href: "https://x.com/syedirfanajmal",                                    external: true },
      { label: "LinkedIn ↗",       href: "https://www.linkedin.com/in/syedirfanajmal/",                     external: true },
      { label: "YouTube ↗",        href: "https://youtube.com/@syedirfanajmal/",                             external: true },
      { label: "Apple Podcasts ↗", href: "https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466", external: true },
      { label: "Spotify ↗",        href: "https://creators.spotify.com/pod/profile/syedirfanajmal/episodes/",   external: true },
    ],
  },
];

const LEGAL = [
  { label: "PRIVACY POLICY", href: "/privacy" },
  { label: "TERMS",          href: "/terms" },
  { label: "REFUND POLICY",  href: "/refund-policy" },
];

const S = {
  footer: {
    background: "#f5f0e8",
    borderTop: "2px solid #0e0d0a",
    fontFamily: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
  } as React.CSSProperties,
  grid: {
    paddingBottom: 40,
    borderBottom: "2px solid #0e0d0a",
  } as React.CSSProperties,
  wordmark: {
    fontFamily: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
    fontStyle: "italic",
    fontWeight: 900,
    fontSize: 56,
    color: "#0e0d0a",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  } as React.CSSProperties,
  about: {
    marginTop: 14,
    fontFamily: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
    fontSize: 15,
    color: "rgba(14,13,10,.72)",
    lineHeight: 1.5,
    maxWidth: 320,
  } as React.CSSProperties,
  colHead: {
    fontFamily: "'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace",
    fontSize: 11,
    color: "rgba(14,13,10,.72)",
    letterSpacing: "0.18em",
    fontWeight: 700,
    marginBottom: 16,
    textTransform: "uppercase",
  } as React.CSSProperties,
  linkList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  } as React.CSSProperties,
  link: {
    fontFamily: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    color: "#0e0d0a",
    fontWeight: 600,
    textDecoration: "none",
  } as React.CSSProperties,
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 22,
    gap: 32,
    flexWrap: "wrap",
  } as React.CSSProperties,
  mono: {
    fontFamily: "'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace",
    fontSize: 11,
    color: "rgba(14,13,10,.72)",
    letterSpacing: "0.12em",
  } as React.CSSProperties,
  monoFlex: {
    fontFamily: "'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace",
    fontSize: 11,
    color: "rgba(14,13,10,.72)",
    letterSpacing: "0.04em",
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
  } as React.CSSProperties,
  open: {
    color: "#2e90c3",
    fontWeight: 700,
    textDecoration: "none",
    fontFamily: "'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace",
    fontSize: 11,
    letterSpacing: "0.04em",
  } as React.CSSProperties,
  legalLink: {
    fontFamily: "'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace",
    fontSize: 11,
    color: "rgba(14,13,10,.72)",
    letterSpacing: "0.12em",
    textDecoration: "none",
  } as React.CSSProperties,
};

export const Colophon = () => (
  <footer className="colophon-footer" style={S.footer}>
    {/* Grid */}
    <div className="grid-colophon" style={S.grid}>
      {/* Brand block */}
      <div>
        <div style={S.wordmark}>Syed Irfan Ajmal</div>
        <p style={S.about}>
          Syed Irfan Ajmal is a serial entrepreneur, marketing maverick, author, int&apos;l speaker, and CEO of <strong>DMR.agency</strong>.
        </p>
      </div>

      {/* Link columns */}
      {COLS.map(({ head, items }) => (
        <div key={head}>
          <div style={S.colHead}>{head}</div>
          <ul style={S.linkList}>
            {items.map((item) =>
              item.external ? (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={S.link}>
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.label}>
                  <Link href={item.href} style={S.link}>{item.label}</Link>
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom bar */}
    <div style={S.bottom}>
      <div style={S.mono}>
        © 2026 SYED IRFAN AJMAL · SIA ENTERPRISES (PK SOLE PROP.) · SIA ENTERPRISES INC (WY C-CORP)
      </div>

      <div style={S.monoFlex}>
        <span>SIA[@]SYEDIRFANAJMAL[DOT]COM</span>
        <a href="/fractional-cmo" style={S.open}>● 2 FRACTIONAL CMO SPOTS · Q3 2026</a>
        <a href="/emos" style={S.open}>● EMOS FOUNDING CLASS · APPLY NOW</a>
      </div>

      <div style={{ ...S.monoFlex, gap: 20 }}>
        {LEGAL.map((l) => (
          <Link key={l.label} href={l.href} style={S.legalLink}>{l.label}</Link>
        ))}
      </div>
    </div>
  </footer>
);
