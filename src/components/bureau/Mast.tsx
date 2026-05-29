"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CALENDLY,
  GROT,
  INK,
  INK15,
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
  { label: "Ventures",        href: "/ventures" },
  { label: "Speaking",        href: "/speaking" },
  { label: "EMOS",            href: "/emos" },
  { label: "Fractional CMO",  href: "/fractional-cmo" },
  { label: "Podcast",         href: "/podcast" },
  { label: "Insights",        href: "/insights" },
  { label: "Clients",         href: "/clients" },
  { label: "Gallery",         href: "/gallery" },
  { label: "Contact",         href: "/contact" },
];

type MastProps = {
  active?: string;
  filedAs?: string;
  dateline?: string;
};

export const Mast = ({
  active = "Home",
  filedAs = "Peshawar Edition · Vol. XV",
  dateline = "Wednesday, May 27, 2026",
}: MastProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sx" style={{ background: PAPER, paddingTop: 20, paddingBottom: 16 }}>
      {/* Top utility line */}
      <div className="mast-utility">
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
      <div className="mast-lockup">
        {/* Left caption — desktop only */}
        <div className="mast-side">
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

        {/* Centre logo — always visible */}
        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-block", textDecoration: "none" }}>
            <div
              className="mast-logo-block"
              style={{ background: INK }}
            >
              <SiaLogo
                height={56}
                style={{ height: "clamp(32px, 5.5vw, 56px)", width: "auto" }}
              />
              <div
                style={{
                  width: 1,
                  alignSelf: "stretch",
                  background: "rgba(241,235,222,.25)",
                }}
              />
              <div
                className="mast-logo-text"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  color: PAPER,
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

        {/* Right caption — desktop only */}
        <div className="mast-side-right">
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
