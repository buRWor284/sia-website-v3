"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CALENDLY, GROT, INK, SERIF, YEL, YEL2 } from "@/lib/tokens";

/* ─── Token aliases matching homepage design ──────────────────────────────── */
const CREAM   = "#FAFAFA";
const CREAM50 = "rgba(250,250,250,.50)";
const CREAM45 = "rgba(250,250,250,.45)";
const CREAM12 = "rgba(250,250,250,.12)";
const CREAM70 = "rgba(250,250,250,.70)";

type NavLeaf = { label: string; href: string; tag?: string; tagOutline?: boolean; external?: boolean };
type NavNode = {
  label: string;
  href?: string; // dropdown parents with an href are clickable (navigate to their hub page)
  children?: ReadonlyArray<NavLeaf>;
};

const NAV: ReadonlyArray<NavNode> = [
  { label: "Home",           href: "/"              },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About Overview", href: "/about"      },
      { label: "Podcast",        href: "/podcast"    },
      { label: "Ventures",       href: "/ventures"   },
      { label: "Newsletter",     href: "/newsletter" },
    ],
  },
  {
    label: "Speaking",
    href: "/speaking",
    children: [
      { label: "Speaking Overview",  href: "/speaking"  },
      { label: "Press Kit",          href: "/press-kit" },
      { label: "Media Kit",          href: "/press-kit/assets/Syed-Irfan-Ajmal-Speaker-Media-Kit-Jun-2026.pdf",  external: true, tag: "PDF", tagOutline: true },
      { label: "Speaker One-Sheet",  href: "/press-kit/assets/Syed-Irfan-Ajmal-Speaker-One-Sheet-Jun-2026.pdf", external: true, tag: "PDF", tagOutline: true },
      { label: "Gallery",            href: "/gallery"   },
    ],
  },
  {
    label: "Earned Media",
    href: "/radar",
    children: [
      { label: "Earned Media Radar", href: "/radar",             tag: "Live"           },
      { label: "EMOS Platform",      href: "/emos-platform",     tag: "Do-it-yourself" },
      { label: "EMOS Academy",       href: "/emos-academy",      tag: "Done-with-you"  },
      { label: "DMR.agency",         href: "https://dmr.agency", tag: "Done-for-you", external: true },
      { label: "Case Studies",       href: "/case-studies" },
    ],
  },
  { label: "Fractional CMO", href: "/fractional-cmo" },
  {
    label: "Tools",
    href: "/tools",
    children: [
      { label: "PressIQ",              href: "/tools/pressiq"              },
      { label: "SignalIQ",             href: "/tools/signaliq"             },
      { label: "CoverageIQ",           href: "/tools/coverageiq"           },
      { label: "JournoCollabIQ",       href: "/tools/journocollabiq"       },
      { label: "PartnerCollabIQ",      href: "/tools/partnercollabiq"      },
      { label: "All tools →",          href: "/tools"                      },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Personal Branding", href: "/resources/personal-branding" },
      { label: "Neuromarketing",    href: "/resources/neuromarketing"    },
      { label: "Storytelling",      href: "/resources/storytelling"      },
      { label: "Writing Tips",      href: "/resources/writing-tips"      },
      { label: "Infographics",      href: "/infographics"                },
      { label: "EMOS Curriculum",   href: "/resources/emoscurriculum"    },
      { label: "All resources →",   href: "/resources"                   },
    ],
  },
  { label: "Contact",        href: "/contact"       },
];

function isActive(href: string, pathname: string): boolean {
  if (!href.startsWith("/")) return false; // external
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function isNodeActive(node: NavNode, pathname: string): boolean {
  if (node.children?.some((c) => isActive(c.href, pathname))) return true;
  return node.href ? isActive(node.href, pathname) : false;
}

const navItemStyle = (active: boolean): CSSProperties => ({
  fontFamily: GROT, fontSize: 10, fontWeight: 700,
  letterSpacing: ".16em", textTransform: "uppercase",
  color: active ? CREAM : CREAM50,
  textDecoration: "none",
  transition: "color .12s",
});

function NavTag({ label, outline }: { label: string; outline?: boolean }) {
  return (
    <span style={{
      marginLeft: 8, flexShrink: 0,
      fontFamily: GROT, fontWeight: 800, fontSize: 7.5,
      letterSpacing: ".10em", textTransform: "uppercase",
      padding: "2px 5px",
      background: outline ? "transparent" : YEL,
      color: outline ? CREAM50 : INK,
      border: outline ? `1px solid ${CREAM12}` : "none",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function DropdownLink({ c, variant, active, onNavigate }: {
  c: NavLeaf; variant: "desktop" | "mobile"; active: boolean; onNavigate: () => void;
}) {
  const style: CSSProperties = variant === "desktop"
    ? {
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        padding: "9px 16px",
        fontFamily: GROT, fontSize: 10.5, fontWeight: 700,
        letterSpacing: ".10em", textTransform: "uppercase",
        color: active ? CREAM : CREAM70, textDecoration: "none", whiteSpace: "nowrap",
      }
    : {
        display: "flex", alignItems: "center", gap: 8,
        padding: "11px 0",
        borderBottom: `1px solid rgba(250,250,250,.07)`,
        fontFamily: GROT, fontSize: 13.5, fontWeight: 600,
        color: "rgba(250,250,250,.65)", textDecoration: "none",
      };
  const inner = (
    <>
      <span>{c.label}{c.external ? (c.href.endsWith(".pdf") ? " ↓" : " ↗") : ""}</span>
      {c.tag && <NavTag label={c.tag} outline={c.tagOutline} />}
    </>
  );
  return c.external ? (
    <a href={c.href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} style={style}>
      {inner}
    </a>
  ) : (
    <Link href={c.href} onClick={onNavigate} style={style}>
      {inner}
    </Link>
  );
}

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  // Tools get their own chrome — suppress site header
  if (pathname.startsWith("/tools/")) return null;

  return (
    <header style={{
      background: INK,
      color: CREAM,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* ── Top row: logo | wire | status ──────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 24,
        padding: "16px 56px 14px",
        borderBottom: `1px solid ${CREAM12}`,
      }} className="site-header__top">
        {/* Logo + wordmark + Est. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              width: 30, height: 30, background: YEL,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: GROT, fontWeight: 900, fontSize: 13,
              color: INK, flexShrink: 0,
            }}>
              SIA
            </div>
          </Link>
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{
                fontFamily: SERIF, fontWeight: 700, fontSize: 17,
                color: CREAM, letterSpacing: "-0.01em", lineHeight: 1,
              }}>
                Syed Irfan Ajmal
              </div>
            </Link>
            <div style={{
              fontFamily: GROT, fontWeight: 700, fontSize: 8.5,
              letterSpacing: ".22em", textTransform: "uppercase",
              color: CREAM45, marginTop: 3,
            }}>
              Est. 2004 &nbsp;·&nbsp; GEO &nbsp;·&nbsp; SEO-PR &nbsp;·&nbsp; Content Marketing
            </div>
          </div>
        </div>

        {/* spacer */}
        <div />
      </div>

      {/* ── Desktop nav row ─────────────────────────────────────────── */}
      <div className="site-header__bar" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "11px 56px",
      }}>
        <nav
          style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}
          onKeyDown={(e) => { if (e.key === "Escape") setOpenMenu(null); }}
        >
          {NAV.map((node) => {
            const active = isNodeActive(node, pathname);
            if (!node.children) {
              return node.href ? (
                <Link key={node.label} href={node.href} style={navItemStyle(active)}>
                  {node.label}
                </Link>
              ) : null;
            }
            const open = openMenu === node.label;
            const caret = (
              <span style={{
                fontSize: 7, lineHeight: 1,
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform .12s",
              }}>▾</span>
            );
            const triggerStyle: CSSProperties = {
              ...navItemStyle(active),
              display: "inline-flex", alignItems: "center", gap: 5, padding: 0,
            };
            return (
              <div
                key={node.label}
                style={{ position: "relative", display: "flex", alignItems: "center" }}
                onMouseEnter={() => setOpenMenu(node.label)}
                onMouseLeave={() => setOpenMenu(null)}
                onFocus={() => setOpenMenu(node.label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu(null);
                }}
              >
                {node.href ? (
                  <Link
                    href={node.href}
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={() => setOpenMenu(null)}
                    style={triggerStyle}
                  >
                    {node.label}
                    {caret}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={() => setOpenMenu(open ? null : node.label)}
                    style={{ ...triggerStyle, background: "none", border: "none", cursor: "pointer" }}
                  >
                    {node.label}
                    {caret}
                  </button>
                )}
                {open && (
                  <div style={{ position: "absolute", top: "100%", left: 0, paddingTop: 12, zIndex: 200 }}>
                    <div style={{
                      minWidth: 208,
                      background: INK,
                      border: `1px solid ${CREAM12}`,
                      boxShadow: "0 14px 34px rgba(0,0,0,.4)",
                      padding: "6px 0",
                      display: "flex", flexDirection: "column",
                    }}>
                      {node.children.map((c) => (
                        <DropdownLink
                          key={c.href}
                          c={c}
                          variant="desktop"
                          active={isActive(c.href, pathname)}
                          onNavigate={() => setOpenMenu(null)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <a
          href="/strategy-call"
          style={{
            fontFamily: GROT, fontWeight: 800, fontSize: 10,
            letterSpacing: ".12em", textTransform: "uppercase",
            background: YEL, color: INK,
            padding: "8px 15px", whiteSpace: "nowrap",
            textDecoration: "none",
          }}
        >
          Book a discovery call &rarr;
        </a>
      </div>

      {/* ── Mobile hamburger ─────────────────────────────────────────── */}
      <button
        className="site-header__hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        style={{
          display: "none", background: "none", border: "none", cursor: "pointer",
          padding: "14px 20px", color: CREAM,
          fontFamily: GROT, fontSize: 10, fontWeight: 700,
          letterSpacing: ".16em", textTransform: "uppercase",
          alignItems: "center", gap: 10,
        }}
      >
        {menuOpen ? "✕" : "☰"}&nbsp;&nbsp;{menuOpen ? "CLOSE" : "MENU"}
      </button>

      {/* ── Mobile dropdown ──────────────────────────────────────────── */}
      <nav
        className="site-header__mobile-menu"
        style={{
          display: menuOpen ? "flex" : "none",
          flexDirection: "column",
          borderTop: `1px solid ${CREAM12}`,
          padding: "8px 20px 16px",
        }}
      >
        {NAV.map((node) => {
          if (!node.children) {
            if (!node.href) return null;
            return (
              <Link
                key={node.label}
                href={node.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "12px 0",
                  borderBottom: `1px solid rgba(250,250,250,.10)`,
                  fontFamily: GROT, fontSize: 15, fontWeight: 600,
                  color: "rgba(250,250,250,.8)",
                  textDecoration: "none",
                }}
              >
                {node.label}
              </Link>
            );
          }
          const expanded = mobileExpanded === node.label;
          return (
            <div key={node.label}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setMobileExpanded(expanded ? null : node.label)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: "none", border: "none",
                  borderBottom: `1px solid rgba(250,250,250,.10)`,
                  padding: "12px 0",
                  fontFamily: GROT, fontSize: 15, fontWeight: 600,
                  color: "rgba(250,250,250,.8)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                {node.label}
                <span style={{ fontSize: 18, lineHeight: 1, opacity: 0.6 }}>{expanded ? "–" : "+"}</span>
              </button>
              {expanded && (
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: 14 }}>
                  {node.children.map((c) => (
                    <DropdownLink
                      key={c.href}
                      c={c}
                      variant="mobile"
                      active={isActive(c.href, pathname)}
                      onNavigate={() => setMenuOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <a
          href="/strategy-call"
          onClick={() => setMenuOpen(false)}
          style={{
            marginTop: 14, padding: "14px 20px",
            background: YEL, color: INK,
            textAlign: "center",
            fontFamily: GROT, fontWeight: 800,
            fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase",
            textDecoration: "none", display: "block",
          }}
        >
          Book a discovery call →
        </a>
      </nav>
    </header>
  );
};
