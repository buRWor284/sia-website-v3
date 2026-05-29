"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CALENDLY,
  GROT,
  INK,
  INK55,
  INK70,
  PAPER,
  SERIF,
} from "@/lib/tokens";
import { availabilityLabel } from "@/lib/site-config";
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
  { label: "Insights",        href: "/insights" },
  { label: "Contact",         href: "/contact" },
];

type MastProps = {
  active?: string;
  dateline?: string;
};

function getDateline(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const Mast = ({
  active = "Home",
  dateline = getDateline(),
}: MastProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sx" style={{ background: PAPER, paddingTop: 20, paddingBottom: 16 }}>
      {/* Name + bureau meta */}
      <div className="mast-namehead">
        {/* Left: logo + name + disciplines */}
        <div className="mast-name-left">
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ background: INK, padding: "10px 16px", flexShrink: 0, display: "flex", alignItems: "center" }}>
              <SiaLogo height={32} />
            </div>
            <div>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: "clamp(28px, 4.5vw, 48px)",
                    color: INK,
                    lineHeight: 1,
                    letterSpacing: "0.01em",
                  }}
                >
                  Syed Irfan Ajmal
                </div>
              </Link>
              <div style={{ marginTop: 6 }}>
                <SCaps size={10.5} ls="0.22em" color={INK55}>
                  SEO-PR &nbsp;·&nbsp; GEO &nbsp;·&nbsp; Content Marketing
                </SCaps>
              </div>
            </div>
          </div>
        </div>

        {/* Right: SIA Wire identity + date + badge */}
        <div className="mast-name-right">
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: "clamp(15px, 1.8vw, 20px)",
              color: INK,
              lineHeight: 1,
              letterSpacing: "0.01em",
            }}
          >
            The SIA Wire
          </div>
          <SCaps size={10.5} ls="0.20em" color={INK55} style={{ marginTop: 6, display: "block" }}>
            Est. 2004 &nbsp;·&nbsp; Global &nbsp;·&nbsp; {dateline}
          </SCaps>
          <div style={{ marginTop: 8 }}>
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
                {availabilityLabel}
              </span>
            </Mark>
          </div>
        </div>
      </div>
      <DoubleRule />

      {/* ── Nav area ─────────────────────────────────────────────────────── */}

      {/* Desktop nav — hidden on mobile via CSS */}
      <nav className="mast-nav-desktop">
        <div style={{ display: "flex", gap: 28, alignItems: "baseline", flexWrap: "wrap" }}>
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
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Book a discovery call →
        </a>
      </nav>

      {/* Mobile hamburger row — hidden on desktop via CSS */}
      <button
        className="mast-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        style={{ paddingTop: 14 }}
      >
        <SCaps size={10.5} ls="0.22em" color={INK}>
          {menuOpen ? "Close" : "Menu"} &nbsp;·&nbsp; Navigation
        </SCaps>
        {/* Hamburger / X icon */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "2px 0" }}>
          {menuOpen ? (
            /* X */
            <span
              style={{
                fontFamily: GROT,
                fontWeight: 700,
                fontSize: 18,
                color: INK,
                lineHeight: 1,
                letterSpacing: 0,
              }}
            >
              ✕
            </span>
          ) : (
            /* three lines */
            <>
              <span style={{ display: "block", width: 22, height: 2, background: INK }} />
              <span style={{ display: "block", width: 16, height: 2, background: INK }} />
              <span style={{ display: "block", width: 22, height: 2, background: INK }} />
            </>
          )}
        </div>
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="mast-mobile-menu">
          {NAV.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="mast-mobile-link"
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  color: INK,
                  fontWeight: isActive ? 700 : 500,
                  fontStyle: item.label === "EMOS" ? "italic" : "normal",
                }}
              >
                {isActive ? <Mark>{item.label}</Mark> : item.label}
              </Link>
            );
          })}
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="mast-mobile-book"
            style={{
              background: INK,
              color: PAPER,
              fontFamily: GROT,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Book a discovery call →
          </a>
        </nav>
      )}

      <HRule color={INK} />
    </header>
  );
};
