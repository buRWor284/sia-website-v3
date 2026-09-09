/**
 * /ar/speaking/earned-media-ai/travel
 *
 * Arabic (MSA, RTL) edition of the travel speaking page.
 *
 * ── STATUS ──────────────────────────────────────────────────────────────────
 * NOINDEX AND UNLINKED. This page is a staging draft for language review.
 * It is deliberately:
 *   · robots: index false, follow false
 *   · absent from sitemap.ts
 *   · absent from every nav, footer and internal link on the English site
 *   · carrying NO hreflang annotation, in either direction
 * The last point matters: hreflang pointing at a noindexed URL is an invalid
 * cluster, so the English page must stay un-annotated until this goes live.
 * The go-live checklist is in REVIEW-NOTES.md beside this file.
 *
 * ── ARCHITECTURE ────────────────────────────────────────────────────────────
 * Deliberately self-contained. It imports colour tokens and nothing else from
 * the shared component library, so no English string can leak into an Arabic
 * page and no change here can affect any of the 78 English pages. The three
 * heavy interactive widgets on the English page (CoverageFlywheel,
 * PipelineFlowV2, PitchClinicDemoTravel) are English-only, so their content is
 * rendered here as Arabic static blocks instead. Nothing is lost: the English
 * page already restates both the six returns and the six stages as text.
 *
 * Direction is set with dir="rtl" lang="ar" on the page wrapper rather than on
 * <html>, because the root layout is shared with the English site. Correct and
 * standards-valid for a subtree. If Arabic ever grows past a handful of pages,
 * move to route groups with a second root layout.
 *
 * All prose lives in ./content.ar.ts. Do not write copy in this file.
 */

import type { Metadata } from "next";
import { Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import {
  BLUE, INK, INK15, INK35, INK55, INK70, PAPER, PAPER2, YEL, CALENDLY,
} from "@/lib/tokens";
import {
  ACTIVITIES, CHROME, CTA, DEMAND, FLYWHEEL, FORMATS, HERO, LEAVE_WITH,
  META, PHOTOS, PIPELINE, QA, RETURNS, SAUDI, SESSION_SPECS, SHIFT,
  SHIFT_STATS, SPEAKER,
} from "./content.ar";

// ─── Arabic typography ────────────────────────────────────────────────────────
// Amiri is a classical naskh with real editorial weight, the closest Arabic
// counterpart to Newsreader's role on the English page. IBM Plex Sans Arabic
// covers the grotesque role (labels, small caps, UI). Loaded here rather than
// in the root layout so English pages never download an Arabic face.

// Arabic does not use italics for emphasis, so only the upright faces load.
const amiri = Amiri({
  variable: "--font-ar-serif",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ar-grot",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const AR_SERIF = "var(--font-ar-serif), 'Noto Naskh Arabic', Georgia, serif";
const AR_GROT = "var(--font-ar-grot), system-ui, sans-serif";

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
  // Staging draft: keep it out of the index and out of link graphs entirely.
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/ar/speaking/earned-media-ai/travel" },
};

// ─── Page-scoped CSS ─────────────────────────────────────────────────────────
// Logical properties throughout (inline-start / inline-end), so the grid and
// rules flip with dir="rtl" rather than fighting it.

const PAGE_CSS = `
.arx{max-width:1200px;margin:0 auto;padding-inline:28px;}
.ar-page{font-size:17.5px;line-height:1.85;}
.ar-hero{display:grid;grid-template-columns:1.5fr 1fr;gap:46px;align-items:start;}
.ar-intro{display:grid;grid-template-columns:1fr 1fr;gap:42px;align-items:end;margin-bottom:34px;}
.ar-split{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.ar-cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.ar-returns{display:grid;grid-template-columns:1fr 1fr;margin-top:30px;border-top:1px solid ${INK35};}
.ar-returns > div{border-bottom:1px solid ${INK35};padding:16px 22px 18px;}
.ar-returns > div:nth-child(odd){border-inline-end:1px solid ${INK35};}
.ar-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;}
.ar-mark{background:linear-gradient(transparent 58%, rgba(245,184,31,.75) 58%);}
.ar-page a:focus-visible{outline:2px solid ${INK};outline-offset:3px;}
@media(max-width:980px){
  .ar-hero{grid-template-columns:1fr;gap:34px;}
  .ar-cards3{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:760px){
  .arx{padding-inline:18px;}
  .ar-intro{grid-template-columns:1fr;gap:16px;}
  .ar-split{grid-template-columns:1fr;}
  .ar-cards3{grid-template-columns:1fr;}
  .ar-returns{grid-template-columns:1fr;}
  .ar-returns > div:nth-child(odd){border-inline-end:none;}
  .ar-stats{grid-template-columns:repeat(2,1fr);}
}
@media(prefers-reduced-motion:reduce){.ar-page *{animation:none!important;transition:none!important;}}
`;

// In RTL, "forward" points left.
const FWD = "←"; // ←
const DOWN = "↓";

// ─── Small primitives (Arabic-typeset local copies) ──────────────────────────

const SCaps = ({
  children, size = 11, ls = "0.16em", color = INK55,
}: { children: React.ReactNode; size?: number; ls?: string; color?: string }) => (
  <span style={{ fontFamily: AR_GROT, fontWeight: 600, fontSize: size, letterSpacing: ls, color, display: "inline-block" }}>
    {children}
  </span>
);

const Pill = ({ children, size = 11 }: { children: React.ReactNode; size?: number }) => (
  <span style={{ fontFamily: AR_GROT, fontWeight: 700, fontSize: size, letterSpacing: "0.08em", background: YEL, color: INK, padding: "5px 10px", display: "inline-block" }}>
    {children}
  </span>
);

const Mark = ({ children }: { children: React.ReactNode }) => (
  <span className="ar-mark">{children}</span>
);

const SectionMast = ({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26, flexWrap: "wrap" }}>
    <span style={{ fontFamily: AR_GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", background: dark ? YEL : INK, color: dark ? INK : PAPER, padding: "4px 9px", direction: "ltr" }}>
      §{n}
    </span>
    <SCaps size={11} ls="0.2em" color={dark ? "rgba(241,235,222,.7)" : INK55}>{label}</SCaps>
    <div style={{ flex: 1, height: 1, background: dark ? "rgba(241,235,222,.2)" : INK35, minWidth: 40 }} />
  </div>
);

const btnBase = {
  display: "inline-block",
  textAlign: "center" as const,
  textDecoration: "none",
  fontFamily: AR_GROT,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.02em",
  padding: "16px 26px",
};
const btnInk = { ...btnBase, background: INK, color: PAPER };
const btnYel = { ...btnBase, background: YEL, color: INK };
const btnGhost = { ...btnBase, background: "transparent", color: INK, border: `1px solid ${INK}` };

// ─── Arabic chrome ───────────────────────────────────────────────────────────

const DraftBanner = () => (
  <div style={{ background: INK, color: YEL, fontFamily: AR_GROT, fontSize: 12.5, padding: "9px 20px", textAlign: "center", borderBottom: `1px solid ${YEL}` }}>
    {CHROME.draftBanner}
  </div>
);

const ArabicHeader = () => (
  <header style={{ background: PAPER, borderBottom: `1px solid ${INK}` }}>
    <div className="arx" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", paddingBlock: "16px" }}>
      <div>
        <div style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: 21, color: INK, lineHeight: 1.2 }}>{CHROME.siteName}</div>
        <SCaps size={10} ls="0.12em" color={INK55}>{CHROME.role}</SCaps>
      </div>
      <nav style={{ display: "flex", gap: 18, flexWrap: "wrap", marginInlineStart: "auto", alignItems: "center" }}>
        <a href="/ar/speaking/earned-media-ai/travel" style={{ fontFamily: AR_GROT, fontSize: 13.5, color: INK, textDecoration: "none", borderBottom: `2px solid ${YEL}` }}>{CHROME.navSpeaking}</a>
        <a href="/ksa-tourism-radar" style={{ fontFamily: AR_GROT, fontSize: 13.5, color: INK70, textDecoration: "none" }}>{CHROME.navRadar}</a>
        <a href="/contact" style={{ fontFamily: AR_GROT, fontSize: 13.5, color: INK70, textDecoration: "none" }}>{CHROME.navContact}</a>
        <a
          href={CHROME.switchHref}
          hrefLang="en"
          dir="ltr"
          style={{ fontFamily: AR_GROT, fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", color: INK, textDecoration: "none", border: `1px solid ${INK}`, padding: "6px 12px" }}
        >
          {CHROME.switchLabel}
        </a>
      </nav>
    </div>
  </header>
);

const ArabicFooter = () => (
  <footer style={{ background: INK, color: PAPER, paddingBlock: "56px 44px" }}>
    <div className="arx">
      <div style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(22px,3.4vw,32px)", color: YEL, lineHeight: 1.4, maxWidth: 640 }}>
        {CHROME.brandLine}
      </div>
      <div style={{ marginTop: 30, paddingTop: 22, borderTop: "1px solid rgba(241,235,222,.2)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
        <div>
          <SCaps size={10} ls="0.16em" color={YEL}>{CHROME.footerContactLabel}</SCaps>
          <div style={{ marginTop: 10, fontFamily: AR_GROT, fontSize: 14, lineHeight: 2 }}>
            <a href={`mailto:${CHROME.footerEmail}`} dir="ltr" style={{ color: PAPER, textDecoration: "none", display: "block" }}>{CHROME.footerEmail}</a>
            <span dir="ltr" style={{ display: "block", color: "rgba(241,235,222,.75)" }}>{CHROME.footerPhone}</span>
          </div>
        </div>
        <div>
          <SCaps size={10} ls="0.16em" color={YEL}>{CHROME.switchLabel}</SCaps>
          <p style={{ margin: "10px 0 0", fontFamily: AR_GROT, fontSize: 13.5, color: "rgba(241,235,222,.75)", lineHeight: 1.8 }}>
            {CHROME.footerNote}
          </p>
          <a href="/" hrefLang="en" style={{ marginTop: 10, display: "inline-block", fontFamily: AR_GROT, fontSize: 13, color: YEL, textDecoration: "none", borderBottom: `1px solid ${YEL}` }}>
            {CHROME.footerEnglishSite} {FWD}
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// ─── Hero ────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="arx" style={{ background: PAPER, paddingBlock: "58px 70px" }}>
    <div style={{ marginBottom: 20 }}>
      <div style={{ height: 4, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "12px 0 8px", flexWrap: "wrap" }}>
        <Pill>{HERO.editionPill}</Pill>
        <SCaps size={12} ls="0.14em" color={INK}>{HERO.formats}</SCaps>
        <div style={{ flex: 1, height: 1, background: INK35, minWidth: 40 }} />
        <SCaps size={11} ls="0.12em" color={INK55}>{HERO.volume}</SCaps>
      </div>
      <div style={{ borderTop: `1px solid ${INK}` }} />
    </div>

    <div className="ar-hero">
      <div>
        <h1 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(36px, 6vw, 66px)", color: INK, lineHeight: 1.28, letterSpacing: 0 }}>
          {HERO.h1a} <span dir="ltr" style={{ display: "inline-block" }}><Mark>{HERO.h1mark}</Mark></span>
          <br />
          {HERO.h1b}
        </h1>
        <p style={{ margin: "28px 0 0", fontFamily: AR_SERIF, fontSize: "clamp(18px, 2.2vw, 22px)", color: INK, lineHeight: 1.9, maxWidth: 640 }}>
          {HERO.standfirst}
        </p>
        <p style={{ margin: "20px 0 0", fontFamily: AR_SERIF, fontSize: 17.5, color: INK70, lineHeight: 1.9, maxWidth: 640 }}>
          {HERO.sub}
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={CALENDLY} style={btnInk}>{HERO.ctaPrimary} {FWD}</a>
          <a href="/contact" style={btnGhost}>{HERO.ctaSecondary} {FWD}</a>
        </div>
        <p style={{ margin: "26px 0 0", fontFamily: AR_SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.8 }}>
          {HERO.byline}
        </p>
      </div>

      <div>
        <figure style={{ margin: "0 0 16px", padding: 10, background: "#0e0d0a", border: `1px solid ${INK}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/gallery/astrolabs-2.jpg"
            alt={HERO.photoAlt}
            style={{ width: "100%", aspectRatio: "4 / 3", display: "block", border: "1px solid rgba(250,250,250,.25)", objectFit: "cover", objectPosition: "center 35%" }}
          />
          <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 4px 2px", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: AR_SERIF, fontSize: 14, color: "#FAFAFA", lineHeight: 1.6 }}>{HERO.photoCaption}</span>
            <SCaps size={10} ls="0.14em" color="rgba(250,250,250,.55)">{HERO.photoTag}</SCaps>
          </figcaption>
        </figure>

        <aside style={{ border: `1px solid ${INK}`, background: PAPER2, padding: "24px 24px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <SCaps size={11} ls="0.16em" color={INK55}>{HERO.deskLabel}</SCaps>
            <Pill size={10}>{HERO.deskPill}</Pill>
          </div>
          <div style={{ marginTop: 14, fontFamily: AR_SERIF, fontSize: 22, lineHeight: 1.6, color: INK, fontWeight: 700 }}>
            {HERO.deskLine}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${INK15}`, display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 16px" }}>
            {SESSION_SPECS.map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <div><SCaps size={10} ls="0.1em" color={INK55}>{k}</SCaps></div>
                <div style={{ fontFamily: AR_SERIF, fontSize: 14.5, color: INK, lineHeight: 1.7 }}>{v}</div>
              </div>
            ))}
          </div>
          <a href={CALENDLY} style={{ ...btnInk, marginTop: 18, display: "block" }}>{HERO.ctaDate} {FWD}</a>
          <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-One-Sheet-Jun-2026.pdf" style={{ ...btnYel, marginTop: 8, display: "block" }}>{HERO.ctaOneSheet} {DOWN}</a>
          <a href="/press-kit" style={{ ...btnGhost, marginTop: 8, display: "block" }}>{HERO.ctaPressKit} {FWD}</a>
        </aside>
      </div>
    </div>
  </section>
);

// ─── §01 Flywheel (static Arabic version) ────────────────────────────────────

const Flywheel = () => (
  <section className="arx" style={{ background: PAPER2, paddingBlock: 84, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
    <SectionMast n="01" label={FLYWHEEL.mast} />
    <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(27px, 4.4vw, 44px)", color: INK, lineHeight: 1.35 }}>
        {FLYWHEEL.h2a} <span style={{ color: INK70 }}>{FLYWHEEL.h2i}</span>
      </h2>
      <p style={{ margin: "18px auto 0", fontFamily: AR_SERIF, fontSize: 17.5, color: INK70, lineHeight: 1.9, maxWidth: 660 }}>
        {FLYWHEEL.body}
      </p>
    </div>
    <div className="ar-returns">
      {RETURNS.map(([n, name, desc]) => (
        <div key={n}>
          <span dir="ltr" style={{ display: "block", fontFamily: AR_GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", color: BLUE, marginBottom: 4, textAlign: "start" }}>{n}</span>
          <span style={{ display: "block", fontFamily: AR_GROT, fontWeight: 700, fontSize: 15, color: INK, marginBottom: 6 }}>{name}</span>
          <span style={{ display: "block", fontFamily: AR_SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.85 }}>{desc}</span>
        </div>
      ))}
    </div>
  </section>
);

// ─── §02 The Shift ───────────────────────────────────────────────────────────

const Shift = () => (
  <section className="arx" style={{ background: PAPER, paddingBlock: 84 }}>
    <SectionMast n="02" label={SHIFT.mast} />
    <div className="ar-intro">
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(27px, 4.4vw, 44px)", color: INK, lineHeight: 1.35 }}>
        {SHIFT.h2a}
        <br />
        <Mark>{SHIFT.h2i}</Mark>
      </h2>
      <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 18, color: INK70, lineHeight: 1.9, maxWidth: 580 }}>
        {SHIFT.body}
      </p>
    </div>
    <div className="ar-split">
      <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: "28px 26px" }}>
        <SCaps size={11} ls="0.16em" color={BLUE}>{SHIFT.demandLabel}</SCaps>
        <h3 style={{ margin: "12px 0 0", fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(21px, 2.8vw, 28px)", color: INK, lineHeight: 1.45 }}>
          {SHIFT.demandH}
        </h3>
        <div style={{ height: 1, background: INK35, margin: "18px 0" }} />
        <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 16, color: INK70, lineHeight: 1.9 }}>{SHIFT.demandBody}</p>
      </div>
      <div style={{ border: `1px solid ${INK}`, background: INK, color: PAPER, padding: "28px 26px" }}>
        <SCaps size={11} ls="0.16em" color={YEL}>{SHIFT.supplyLabel}</SCaps>
        <h3 style={{ margin: "12px 0 0", fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(21px, 2.8vw, 28px)", color: PAPER, lineHeight: 1.45 }}>
          {SHIFT.supplyH}
        </h3>
        <div style={{ height: 1, background: "rgba(241,235,222,.35)", margin: "18px 0" }} />
        <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 16, color: "rgba(241,235,222,.75)", lineHeight: 1.9 }}>{SHIFT.supplyBody}</p>
      </div>
    </div>
  </section>
);

const ShiftStats = () => (
  <section className="arx" style={{ background: INK, color: PAPER, paddingBlock: "56px 52px" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
      <SCaps size={12} ls="0.18em" color={YEL}>{SHIFT_STATS.label}</SCaps>
      <div style={{ flex: 1, height: 1, background: "rgba(241,235,222,.2)", minWidth: 40 }} />
    </div>
    <div className="ar-stats" style={{ background: "rgba(241,235,222,.22)", border: "1px solid rgba(241,235,222,.22)" }}>
      {SHIFT_STATS.rows.map(([v, l]) => (
        <div key={l} style={{ background: INK, padding: "24px 20px" }}>
          <div style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", color: YEL, lineHeight: 1.3 }}>{v}</div>
          <div style={{ marginTop: 10, fontFamily: AR_SERIF, fontSize: 14.5, color: "rgba(241,235,222,.78)", lineHeight: 1.8 }}>{l}</div>
        </div>
      ))}
    </div>
    <p style={{ margin: "16px 0 0", fontFamily: AR_GROT, fontSize: 11.5, color: "rgba(241,235,222,.5)", lineHeight: 1.8 }}>
      {SHIFT_STATS.sources}
    </p>
  </section>
);

// ─── §03 Demand ──────────────────────────────────────────────────────────────

const Demand = () => (
  <section className="arx" style={{ background: PAPER, paddingBlock: 84 }}>
    <SectionMast n="03" label={DEMAND.mast} />
    <div className="ar-intro">
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(27px, 4.4vw, 44px)", color: INK, lineHeight: 1.35 }}>
        {DEMAND.h2a}
        <br />
        <Mark>{DEMAND.h2i}</Mark>
      </h2>
      <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 17.5, color: INK70, lineHeight: 1.9, maxWidth: 580 }}>
        {DEMAND.body}
      </p>
    </div>
    <div className="ar-cards3">
      {DEMAND.audiences.map((a, i) => {
        const dark = i === 2;
        const accent = i === 0 ? BLUE : i === 1 ? INK : YEL;
        return (
          <div
            key={a.t}
            style={{
              border: `1px solid ${INK}`,
              borderTop: `5px solid ${accent}`,
              background: dark ? INK : i === 1 ? PAPER2 : PAPER,
              padding: "22px 22px 24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <span dir="ltr" style={{ fontFamily: AR_GROT, fontWeight: 700, fontSize: 10, letterSpacing: "0.16em", background: dark ? YEL : accent === INK ? INK : BLUE, color: dark ? INK : PAPER, padding: "4px 8px" }}>
                {`0${i + 1}`}
              </span>
              <SCaps size={10} ls="0.14em" color={dark ? "rgba(241,235,222,.5)" : INK55}>{a.tag}</SCaps>
            </div>
            <h3 style={{ margin: "16px 0 0", fontFamily: AR_SERIF, fontWeight: 700, fontSize: 22, color: dark ? PAPER : INK, lineHeight: 1.5 }}>{a.t}</h3>
            <p style={{ margin: "12px 0 0", fontFamily: AR_SERIF, fontSize: 15.5, color: dark ? "rgba(241,235,222,.75)" : INK70, lineHeight: 1.85, flex: 1 }}>{a.body}</p>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${dark ? "rgba(241,235,222,.3)" : INK35}` }}>
              <SCaps size={10} ls="0.12em" color={dark ? YEL : INK55}>يريدون</SCaps>
              <p style={{ margin: "6px 0 0", fontFamily: AR_SERIF, fontSize: 15, color: dark ? PAPER : INK, lineHeight: 1.8 }}>{a.want}</p>
            </div>
          </div>
        );
      })}
    </div>
    <p style={{ margin: "20px 0 0", fontFamily: AR_SERIF, fontSize: 13.5, color: INK55, lineHeight: 1.9, maxWidth: 900 }}>
      {DEMAND.footnote}
    </p>
  </section>
);

// ─── §04 Pipeline ────────────────────────────────────────────────────────────

const Pipeline = () => (
  <section className="arx" style={{ background: PAPER2, paddingBlock: 84, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
    <SectionMast n="04" label={PIPELINE.mast} />
    <div className="ar-intro">
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(27px, 4.4vw, 44px)", color: INK, lineHeight: 1.35 }}>
        {PIPELINE.h2a}
        <br />
        <span style={{ color: INK70 }}>{PIPELINE.h2i}</span>
      </h2>
      <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 17.5, color: INK70, lineHeight: 1.9, maxWidth: 580 }}>
        {PIPELINE.body}
      </p>
    </div>
    <div className="ar-returns" style={{ marginTop: 8 }}>
      {PIPELINE.stages.map(([n, name, desc]) => (
        <div key={n}>
          <span dir="ltr" style={{ display: "block", fontFamily: AR_GROT, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", color: BLUE, marginBottom: 4, textAlign: "start" }}>{n}</span>
          <span style={{ display: "block", fontFamily: AR_GROT, fontWeight: 700, fontSize: 15, color: INK, marginBottom: 6 }}>{name}</span>
          <span style={{ display: "block", fontFamily: AR_SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.85 }}>{desc}</span>
        </div>
      ))}
    </div>
    <div style={{ margin: "34px auto 0", maxWidth: 800, border: `1px solid ${INK}`, borderInlineStart: `3px solid ${YEL}`, background: PAPER, padding: "22px 26px" }}>
      <SCaps size={11} ls="0.16em" color={BLUE}>{PIPELINE.measureLabel}</SCaps>
      <p style={{ margin: "12px 0 0", fontFamily: AR_SERIF, fontSize: 16.5, color: INK, lineHeight: 1.95 }}>
        {PIPELINE.measureBody}
      </p>
    </div>
    <p style={{ margin: "30px 0 0", fontFamily: AR_SERIF, fontSize: 18, color: INK, lineHeight: 1.8, textAlign: "center" }}>
      {PIPELINE.closer} <Mark>{PIPELINE.closerMark}</Mark>
    </p>
  </section>
);

// ─── §05 In the room ─────────────────────────────────────────────────────────

const Activities = () => (
  <section className="arx" style={{ background: INK, color: PAPER, paddingBlock: "80px 88px" }}>
    <SectionMast n="05" label={ACTIVITIES.mast} dark />
    <div className="ar-intro">
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(27px, 4.4vw, 44px)", color: PAPER, lineHeight: 1.35 }}>
        {ACTIVITIES.h2a}
        <br />
        <span style={{ color: YEL }}>{ACTIVITIES.h2i}</span>
      </h2>
      <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 17.5, color: "rgba(241,235,222,.72)", lineHeight: 1.9, maxWidth: 580 }}>
        {ACTIVITIES.body}
      </p>
    </div>
    <div className="ar-cards3">
      {ACTIVITIES.items.map((a) => (
        <div key={a.n} style={{ border: "1px solid rgba(241,235,222,.28)", background: "rgba(241,235,222,.04)", padding: "26px 24px", display: "flex", flexDirection: "column" }}>
          <div dir="ltr" style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(34px, 6vw, 50px)", color: YEL, lineHeight: 1, textAlign: "start" }}>{a.n}</div>
          <h3 style={{ margin: "12px 0 0", fontFamily: AR_SERIF, fontWeight: 700, fontSize: 24, color: PAPER, lineHeight: 1.5 }}>{a.title}</h3>
          <p style={{ margin: "14px 0 0", fontFamily: AR_SERIF, fontSize: 16, color: "rgba(241,235,222,.72)", lineHeight: 1.9, flex: 1 }}>{a.body}</p>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 44, maxWidth: 800, marginInline: "auto", border: "1px solid rgba(241,235,222,.28)", background: "rgba(241,235,222,.04)", padding: "26px 26px" }}>
      <SCaps size={11} ls="0.16em" color={YEL}>{ACTIVITIES.clinicLabel}</SCaps>
      <p style={{ margin: "12px 0 0", fontFamily: AR_SERIF, fontSize: 16.5, color: "rgba(241,235,222,.8)", lineHeight: 1.95 }}>
        {ACTIVITIES.clinicBody}
      </p>
    </div>

    <div style={{ marginTop: 56 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <SCaps size={12} ls="0.18em" color={YEL}>{ACTIVITIES.reelLabel}</SCaps>
        <div style={{ flex: 1, height: 1, background: "rgba(241,235,222,.2)", minWidth: 40 }} />
        <a href="/speaking" style={{ fontFamily: AR_GROT, fontWeight: 600, fontSize: 12.5, color: YEL, textDecoration: "underline", textUnderlineOffset: 3 }}>
          {ACTIVITIES.reelAll} {FWD}
        </a>
      </div>
      <figure style={{ margin: "0 auto", maxWidth: 800, padding: 10, background: "#0e0d0a", border: "1px solid rgba(241,235,222,.28)" }}>
        <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", border: "1px solid rgba(250,250,250,.25)", overflow: "hidden" }}>
          <iframe
            src="https://www.youtube-nocookie.com/embed/OwQpDj4c1LE?rel=0"
            title={ACTIVITIES.reelTitle}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </div>
        <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 4px 2px", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: AR_SERIF, fontSize: 14, color: "#FAFAFA", lineHeight: 1.6 }}>{ACTIVITIES.reelCaption}</span>
          <SCaps size={10} ls="0.14em" color="rgba(250,250,250,.55)">{ACTIVITIES.reelTag}</SCaps>
        </figcaption>
      </figure>
    </div>
  </section>
);

// ─── §06 What you leave with ─────────────────────────────────────────────────

const LeaveWith = () => (
  <section className="arx" style={{ background: PAPER, paddingBlock: 84 }}>
    <SectionMast n="06" label={LEAVE_WITH.mast} />
    <div className="ar-split">
      <div style={{ border: `1px solid ${INK}`, background: PAPER, padding: "30px 28px" }}>
        <SCaps size={12} ls="0.16em" color={BLUE}>{LEAVE_WITH.ableLabel}</SCaps>
        <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {LEAVE_WITH.takeaways.map((t, j) => (
            <li key={j} style={{ padding: "14px 0 14px 0", paddingInlineStart: 34, position: "relative", borderTop: j === 0 ? "none" : `1px solid ${INK15}`, fontFamily: AR_SERIF, fontSize: 16.5, color: INK, lineHeight: 1.9 }}>
              <span dir="ltr" style={{ position: "absolute", insetInlineStart: 0, top: 16, fontFamily: AR_GROT, fontSize: 11.5, fontWeight: 700, color: INK }}>0{j + 1}.</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ border: `1px solid ${INK}`, background: INK, color: PAPER, padding: "30px 28px" }}>
        <SCaps size={12} ls="0.16em" color={YEL}>{LEAVE_WITH.failLabel}</SCaps>
        <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {LEAVE_WITH.failures.map((t, j) => (
            <li key={j} style={{ padding: "14px 0", paddingInlineStart: 26, position: "relative", borderTop: j === 0 ? "none" : "1px solid rgba(241,235,222,.16)", fontFamily: AR_SERIF, fontSize: 16.5, color: "rgba(241,235,222,.82)", lineHeight: 1.9 }}>
              <span style={{ position: "absolute", insetInlineStart: 0, top: 22, width: 8, height: 8, background: YEL }} aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <p style={{ margin: "20px 0 0", fontFamily: AR_SERIF, fontSize: 15, color: "rgba(241,235,222,.6)", lineHeight: 1.8 }}>
          {LEAVE_WITH.failCloser}
        </p>
      </div>
    </div>
  </section>
);

// ─── Saudi angle ─────────────────────────────────────────────────────────────

const SaudiAngle = () => (
  <section style={{ position: "relative", overflow: "hidden", background: INK, color: PAPER, paddingBlock: 64, borderTop: `1px solid ${INK}` }}>
    <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "url('/assets/speaking/saudi-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.3 }} />
    <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(14,13,10,.34)" }} />
    <div className="arx" style={{ position: "relative" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <SCaps size={12} ls="0.18em" color={YEL}>{SAUDI.label}</SCaps>
        <h2 style={{ margin: "16px 0 0", fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(25px, 4.2vw, 42px)", color: PAPER, lineHeight: 1.45 }}>
          {SAUDI.h2a}
          <br />
          <span style={{ color: YEL }}>{SAUDI.h2i}</span>
        </h2>
        <p style={{ margin: "20px auto 0", fontFamily: AR_SERIF, fontSize: 17.5, color: "rgba(241,235,222,.85)", lineHeight: 1.95, maxWidth: 680 }}>
          {SAUDI.body}
        </p>
        <div style={{ marginTop: 26, maxWidth: 660, marginInline: "auto", border: "1px solid rgba(241,235,222,.28)", background: "rgba(241,235,222,.05)", padding: "22px 24px", textAlign: "start" }}>
          <SCaps size={11} ls="0.14em" color={YEL}>{SAUDI.radarLabel}</SCaps>
          <h3 style={{ margin: "10px 0 8px", fontFamily: AR_SERIF, fontWeight: 700, fontSize: 22, color: PAPER, lineHeight: 1.5 }}>
            {SAUDI.radarTitle}
          </h3>
          <p style={{ margin: "0 0 16px", fontFamily: AR_SERIF, fontSize: 15.5, color: "rgba(241,235,222,.78)", lineHeight: 1.85 }}>
            {SAUDI.radarBody}
          </p>
          <a href="/ksa-tourism-radar" hrefLang="en" style={btnYel}>{SAUDI.radarCta} {FWD}</a>
          <p style={{ margin: "14px 0 0", fontFamily: AR_GROT, fontSize: 12.5, color: "rgba(241,235,222,.62)", lineHeight: 1.8 }}>
            {SAUDI.siblingLabel}{" "}
            <a href="/ksa-retail-radar" hrefLang="en" style={{ color: YEL, textDecoration: "none", borderBottom: "1px solid rgba(245,184,31,.45)" }}>
              {SAUDI.siblingCta} {FWD}
            </a>
          </p>
        </div>
        <div style={{ marginTop: 18 }}>
          <SCaps size={9.5} ls="0.1em" color="rgba(241,235,222,.4)">{SAUDI.photoCredit}</SCaps>
        </div>
      </div>
    </div>
  </section>
);

// ─── §07 Q&A ─────────────────────────────────────────────────────────────────

const QandA = () => (
  <section className="arx" style={{ background: PAPER2, paddingBlock: 84 }}>
    <SectionMast n="07" label={QA.mast} />
    <div style={{ maxWidth: 800, marginBottom: 30 }}>
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(25px, 4vw, 40px)", color: INK, lineHeight: 1.4 }}>
        {QA.h2}
      </h2>
    </div>
    <div style={{ borderTop: `2px solid ${INK}` }}>
      {QA.items.map(([n, q]) => (
        <div key={n} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, padding: "24px 0", borderBottom: `1px solid ${INK35}`, alignItems: "start" }}>
          <div dir="ltr" style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(26px, 4.5vw, 40px)", color: INK, lineHeight: 1.1 }}>{n}</div>
          <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: "clamp(17px, 2.2vw, 21px)", color: INK, lineHeight: 1.8 }}>{q}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── §08 Speaker ─────────────────────────────────────────────────────────────

const Speaker = () => (
  <section className="arx" style={{ background: INK, color: PAPER, paddingBlock: 84 }}>
    <SectionMast n="08" label={SPEAKER.mast} dark />
    <div className="ar-intro">
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(27px, 4.4vw, 44px)", color: PAPER, lineHeight: 1.35 }}>
        {SPEAKER.h2a}
        <br />
        <span style={{ color: YEL }}>{SPEAKER.h2i}</span>
      </h2>
      <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 17, color: "rgba(241,235,222,.75)", lineHeight: 1.95, maxWidth: 580 }}>
        {SPEAKER.bio}
      </p>
    </div>
    <div style={{ marginTop: 6, paddingTop: 18, borderTop: "1px solid rgba(241,235,222,.16)" }}>
      <SCaps size={11} ls="0.14em" color="rgba(241,235,222,.55)">{SPEAKER.seenLabel}</SCaps>
      <p style={{ margin: "10px 0 0", fontFamily: AR_SERIF, fontSize: 15.5, color: "rgba(241,235,222,.8)", lineHeight: 1.95 }}>
        {SPEAKER.seenBody}
      </p>
    </div>
    <div className="ar-stats" style={{ marginTop: 18, background: "rgba(241,235,222,.22)", border: "1px solid rgba(241,235,222,.22)" }}>
      {SPEAKER.stats.map(([v, l]) => (
        <div key={l} style={{ background: INK, padding: "22px 18px" }}>
          <div style={{ fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(26px, 4vw, 40px)", color: YEL, lineHeight: 1.3 }}>{v}</div>
          <div style={{ marginTop: 8, fontFamily: AR_GROT, fontSize: 12.5, color: "rgba(241,235,222,.7)", lineHeight: 1.8 }}>{l}</div>
        </div>
      ))}
    </div>
  </section>
);

const PhotoStrip = () => (
  <section className="arx" style={{ background: PAPER, paddingBlock: "40px 20px" }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, maxWidth: 1040, marginInline: "auto" }}>
      <figure style={{ margin: 0, flex: "1 1 380px", padding: 10, background: "#0e0d0a", border: `1px solid ${INK}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/speaking/dmss-irfan-large-audience.jpg"
          alt={PHOTOS.dmssAlt}
          loading="lazy"
          style={{ width: "100%", aspectRatio: "16 / 9", display: "block", border: "1px solid rgba(250,250,250,.25)", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: AR_SERIF, fontSize: 14, color: "#FAFAFA", lineHeight: 1.6 }}>{PHOTOS.dmssCaption}</span>
          <SCaps size={10} ls="0.14em" color="rgba(250,250,250,.55)">{PHOTOS.dmssTag}</SCaps>
        </figcaption>
      </figure>
      <figure style={{ margin: 0, flex: "1 1 380px", padding: 10, background: "#0e0d0a", border: `1px solid ${INK}` }}>
        <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#000", border: "1px solid rgba(250,250,250,.25)", overflow: "hidden" }}>
          <iframe
            src="https://www.youtube.com/embed/uSn4s5ZbJcQ?rel=0&start=743"
            title={PHOTOS.atmTitle}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </div>
        <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 4px 2px", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: AR_SERIF, fontSize: 14, color: "#FAFAFA", lineHeight: 1.6 }}>{PHOTOS.atmCaption}</span>
          <SCaps size={10} ls="0.14em" color="rgba(250,250,250,.55)">{PHOTOS.atmTag}</SCaps>
        </figcaption>
      </figure>
    </div>
  </section>
);

// ─── Formats ─────────────────────────────────────────────────────────────────

const Formats = () => (
  <section className="arx" style={{ background: PAPER2, paddingBlock: 84, borderTop: `1px solid ${INK}` }}>
    <div className="ar-intro">
      <h2 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(27px, 4.4vw, 44px)", color: INK, lineHeight: 1.35 }}>
        {FORMATS.h2a}
        <br />
        <Mark>{FORMATS.h2i}</Mark>
      </h2>
      <p style={{ margin: 0, fontFamily: AR_SERIF, fontSize: 17.5, color: INK70, lineHeight: 1.9, maxWidth: 580 }}>
        {FORMATS.body}
      </p>
    </div>
    <div className="ar-cards3">
      {FORMATS.items.map((f) => (
        <div key={f.t} style={{ border: `1px solid ${INK}`, background: PAPER, display: "flex", flexDirection: "column" }}>
          <figure style={{ margin: 0, borderBottom: `1px solid ${INK}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.photo} alt={f.alt} loading="lazy" style={{ width: "100%", aspectRatio: "16 / 10", display: "block", objectFit: "cover" }} />
            <figcaption style={{ padding: "8px 22px 10px", background: INK }}>
              <SCaps size={10} ls="0.12em" color="rgba(250,250,250,.62)">{f.caption}</SCaps>
            </figcaption>
          </figure>
          <div style={{ padding: "22px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
            <h3 style={{ margin: 0, fontFamily: AR_SERIF, fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.5 }}>{f.t}</h3>
            <div style={{ marginTop: 8 }}><SCaps size={11} ls="0.06em" color={BLUE}>{f.meta}</SCaps></div>
            <p style={{ margin: "14px 0 0", fontFamily: AR_SERIF, fontSize: 15.5, color: INK70, lineHeight: 1.85, flex: 1 }}>{f.body}</p>
          </div>
        </div>
      ))}
    </div>
    <p style={{ margin: "26px 0 0", fontFamily: AR_SERIF, fontSize: 16.5, color: INK70, lineHeight: 1.85, textAlign: "center" }}>
      {FORMATS.closer}
    </p>
  </section>
);

const BottomCTA = () => (
  <section id="invite" className="arx" style={{ background: YEL, paddingBlock: 72 }}>
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <SCaps size={12} ls="0.18em" color={INK}>{CTA.label}</SCaps>
      <h2 style={{ margin: "14px 0 0", fontFamily: AR_SERIF, fontWeight: 700, fontSize: "clamp(28px, 5vw, 50px)", color: INK, lineHeight: 1.4 }}>
        {CTA.h2}
      </h2>
      <p style={{ margin: "18px auto 0", fontFamily: AR_SERIF, fontSize: 17.5, color: INK, lineHeight: 1.9, maxWidth: 600, opacity: 0.85 }}>
        {CTA.body}
      </p>
      <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <a href={CALENDLY} style={btnInk}>{CTA.invite} {FWD}</a>
        <a href="/contact" style={btnGhost}>{CTA.ask} {FWD}</a>
        <a href="/press-kit/assets/Syed-Irfan-Ajmal-Speaker-One-Sheet-Jun-2026.pdf" style={btnGhost}>{CTA.oneSheet} {DOWN}</a>
        <a href="/press-kit" style={btnGhost}>{CTA.pressKit} {FWD}</a>
      </div>
    </div>
  </section>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ArabicTravelSpeakingPage() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={`ar-page ${amiri.variable} ${plexArabic.variable}`}
      style={{ background: PAPER, fontFamily: AR_SERIF, color: INK }}
    >
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <DraftBanner />
      <ArabicHeader />
      <Hero />
      <Flywheel />
      <Shift />
      <ShiftStats />
      <Demand />
      <Pipeline />
      <Activities />
      <LeaveWith />
      <SaudiAngle />
      <QandA />
      <Speaker />
      <PhotoStrip />
      <Formats />
      <BottomCTA />
      <ArabicFooter />
    </div>
  );
}
