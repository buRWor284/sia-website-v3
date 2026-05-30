"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CALENDLY, GROT, INK, SERIF, YEL, YEL2 } from "@/lib/tokens";
import { availabilityLabel } from "@/lib/site-config";

/* ─── Token aliases matching homepage design ──────────────────────────────── */
const CREAM   = "#f1ebde";
const CREAM50 = "rgba(241,235,222,.50)";
const CREAM45 = "rgba(241,235,222,.45)";
const CREAM40 = "rgba(241,235,222,.40)";
const CREAM12 = "rgba(241,235,222,.12)";

const NAV: ReadonlyArray<{ label: string; href: string; matchPrefix?: string }> = [
  { label: "Home",           href: "/"              },
  { label: "About",         href: "/about"          },
  { label: "Speaking",      href: "/speaking"       },
  { label: "EMOS",          href: "/emos"           },
  { label: "Fractional CMO",href: "/fractional-cmo" },
  { label: "Resources",     href: "/resources"      },
  { label: "Contact",       href: "/contact"        },
];

function getDateline(): string {
  const d = new Date();
  const days  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `Est. 2004 · Global · ${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
        {/* Logo + wordmark */}
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
              SEO-PR &nbsp;·&nbsp; GEO &nbsp;·&nbsp; Content Marketing
            </div>
          </div>
        </div>

        {/* Centre: SIA Wire */}
        <div style={{ textAlign: "center" }} className="site-header__wire">
          <div style={{
            fontFamily: GROT, fontWeight: 700, fontSize: 9,
            letterSpacing: ".22em", textTransform: "uppercase",
            color: CREAM50,
          }}>
            The SIA Wire
          </div>
          <div style={{
            fontFamily: SERIF, fontStyle: "italic",
            fontSize: 13, color: CREAM40, marginTop: 3,
          }}>
            {getDateline()}
          </div>
        </div>

        {/* Right: availability */}
        <div style={{
          fontFamily: GROT, fontWeight: 700, fontSize: 9,
          letterSpacing: ".16em", textTransform: "uppercase",
          color: CREAM40, textAlign: "right",
        }}>
          {availabilityLabel}
        </div>
      </div>

      {/* ── Desktop nav row ─────────────────────────────────────────── */}
      <div className="site-header__bar" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "11px 56px",
      }}>
        <nav style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          {NAV.map(({ label, href }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: GROT, fontSize: 10, fontWeight: 700,
                  letterSpacing: ".16em", textTransform: "uppercase",
                  color: active ? CREAM : CREAM50,
                  textDecoration: "none",
                  transition: "color .12s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
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
        {NAV.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            style={{
              padding: "12px 0",
              borderBottom: `1px solid rgba(241,235,222,.10)`,
              fontFamily: GROT, fontSize: 15, fontWeight: 600,
              color: "rgba(241,235,222,.8)",
              textDecoration: "none",
            }}
          >
            {label}
          </Link>
        ))}
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
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
