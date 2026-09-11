import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ZoomShot } from "./ZoomShot";
import { BUILDER_CREDS, COMPARISON, EARNED_MEDIA_STATS, EMOS_PLATFORM_ONBOARDING_URL, FAQ, PRICE_BOX_ALLOWANCES, type FaqItem } from "./content";

/**
 * /emos-platform sales page body (rebuild, 2026-09-11).
 *
 * Layout: Claude Design handoff "EMOS Platform Page.dc.html" (FINAL, 11 Sep).
 * Copy: EMOS-Platform-Page-Rebuild-Brief-2026-09-10.md §3, locked. Where the
 * design file's wording drifted from the deck (the cancel answer, the
 * onboarding lines, "full list in the FAQ"), the deck wins.
 *
 * Server component. The only client code is ZoomShot (click to enlarge).
 * page.tsx owns auth, metadata and the FAQPage JSON-LD.
 *
 * Motion: the two crossfade cards (hero S1a -> S1c, PressIQ S5a -> S5b) use the
 * handoff's own xfA/xfB keyframes on an 11s loop, copied as-is. Under
 * prefers-reduced-motion both cards pin their final frame.
 *
 * 2026-09-11 (Irfan): two scrolling strips added, same pattern as the home
 * page tickers: "Why earned media" under the hero (replacing the "Built by"
 * line, which read as if EMOS itself had been in HBR) and "About the builder"
 * under § 03. Four moving pieces in total, by Irfan's decision. Both strips
 * pause on hover and, under prefers-reduced-motion, stop and wrap to static
 * text so nothing is cut off.
 */

// ── tokens (Bureau system, identical to /emos-academy) ──────────────────────
const PAPER = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK = "#1a1410";
const DARK = "#0e0d0a";
const YEL = "#f5b81f";
const INK70 = "rgba(26,20,16,.70)";
const INK55 = "rgba(26,20,16,.55)";
const INK32 = "rgba(26,20,16,.32)";
const INK15 = "rgba(26,20,16,.15)";
const SERIF = "var(--font-serif)";
const GROT = "var(--font-grot)";
const MONO = "var(--font-mono)";
const GUTTER = "clamp(20px,4vw,56px)";

const SHOTS = "/assets/emos-platform";

// Page CSS. Responsive rules and the crossfade are copied from the handoff file;
// the .xf img height carries !important because globals.css forces
// `img { height:auto !important }` under 640px, which would otherwise break the
// absolutely positioned crossfade frames on phones.
const CSS = `
.emp details > summary { list-style: none; cursor: pointer; }
.emp details > summary::-webkit-details-marker { display: none; }
.emp details[open] summary .faq-sign { transform: rotate(45deg); }
.emp .cmp-cards { display: none; }
@media (max-width: 640px) {
  .emp .step-row { grid-template-columns: 1fr !important; }
  .emp .step-num { border-right: none !important; border-bottom: 1px solid #1a1410 !important; justify-content: flex-start !important; align-items: center !important; padding: 9px 16px !important; font-size: 24px !important; }
  .emp .thumb { flex: 1 1 100% !important; max-width: none !important; border-left: none !important; border-top: 1px solid #1a1410 !important; }
  .emp .cmp-table { display: none !important; }
  .emp .cmp-cards { display: flex !important; }
}
.xf { position: relative; }
.xf > img { position: absolute; inset: 0; width: 100%; height: 100% !important; object-fit: contain; object-position: center top; }
@keyframes xfA { 0%,42% { opacity: 1 } 50%,92% { opacity: 0 } 100% { opacity: 1 } }
@keyframes xfB { 0%,42% { opacity: 0 } 50%,92% { opacity: 1 } 100% { opacity: 0 } }
.xf-a { animation: xfA 11s ease-in-out infinite; }
.xf-b { animation: xfB 11s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .xf-a { animation: none; opacity: 0; }
  .xf-b { animation: none; opacity: 1; }
}
@keyframes empStrip { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.emp-strip { display: flex; align-items: stretch; overflow: hidden; }
.emp-strip-label { flex: none; display: flex; align-items: center; padding: 0 14px; font-family: var(--font-grot); font-weight: 800; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; background: #f5b81f; color: #1a1410; border-right: 1px solid #1a1410; }
.emp-strip-view { flex: 1; min-width: 0; overflow: hidden; }
.emp-strip-track { display: inline-flex; width: max-content; animation: empStrip 60s linear infinite; will-change: transform; }
/* inline animationDuration per strip; the reduced-motion rule below still wins because it removes the animation */
.emp-strip-set { display: inline-flex; align-items: center; white-space: nowrap; padding: 12px 0; }
.emp-strip-item { display: inline-flex; align-items: baseline; gap: 10px; }
.emp-strip-sep { padding: 0 22px; opacity: .35; }
.emp-strip:hover .emp-strip-track { animation-play-state: paused; }
.emp-strip-src { opacity: .6; text-decoration: underline; text-underline-offset: 3px; color: inherit; }
.emp-strip-src:hover { opacity: 1; }
@media (max-width: 640px) {
  .emp-strip { flex-direction: column; }
  .emp-strip-label { padding: 6px 16px; border-right: none; border-bottom: 1px solid #1a1410; }
}
@media (prefers-reduced-motion: reduce) {
  .emp-strip { flex-direction: column; }
  .emp-strip-label { padding: 6px 16px; border-right: none; border-bottom: 1px solid #1a1410; }
  .emp-strip-track { animation: none; width: auto; display: block; }
  .emp-strip-set { display: flex; flex-wrap: wrap; white-space: normal; gap: 10px 32px; padding: 12px 16px; }
  .emp-strip-set[aria-hidden="true"] { display: none; }
  .emp-strip-item { display: block; line-height: 1.6; }
  .emp-strip-sep { display: none; }
  .emp-strip-src { display: block; }
}
.emp a:focus-visible, .emp button:focus-visible, .emp summary:focus-visible { outline: 2px solid #1a1410; outline-offset: 3px; }
.emp-btn-y:hover { background: #ffc83a !important; }
.emp-btn-o:hover { background: #e8e0cc !important; }
.emp-btn-d:hover { background: #f1ebde !important; color: #1a1410 !important; }
.emp-zoom { display: block; width: 100%; padding: 0; margin: 0; border: 0; background: none; cursor: zoom-in; text-align: left; font: inherit; color: inherit; }
.emp-zoom:hover img { opacity: .92; }
.emp-lightbox { padding: 0; border: 1px solid #1a1410; background: #f1ebde; color: #1a1410; max-width: min(1400px, 94vw); max-height: 94vh; width: auto; overflow: auto; }
.emp-lightbox::backdrop { background: rgba(14,13,10,.82); }
.emp-lightbox img { display: block; width: auto; max-width: 100%; max-height: calc(94vh - 52px); height: auto; margin: 0 auto; }
.emp-lightbox-bar { position: sticky; top: 0; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 0 0 0 14px; min-height: 44px; border-bottom: 1px solid #1a1410; background: #f1ebde; font-family: var(--font-mono); font-size: 10px; letter-spacing: .16em; text-transform: uppercase; }
.emp-lightbox-close { align-self: stretch; border: 0; border-left: 1px solid #1a1410; background: #f5b81f; color: #1a1410; padding: 0 16px; font-family: var(--font-grot); font-weight: 800; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; }
`;

// ── shared styles ────────────────────────────────────────────────────────────
const chipYel: CSSProperties = { display: "inline-block", background: YEL, color: INK, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", padding: "5px 10px 6px" };
const btnBase: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${INK}`, padding: "14px 22px", fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "none", color: INK };
const btnYel: CSSProperties = { ...btnBase, background: YEL };
const btnOut: CSSProperties = { ...btnBase, background: "transparent" };
const h2: CSSProperties = { fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(26px,3.2vw,44px)", lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0, color: INK };
const mark: CSSProperties = { background: YEL, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0 .1em" };
const serifBody: CSSProperties = { fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.55, color: INK70, margin: 0 };
const monoSmall: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" };
const tickYel: CSSProperties = { width: 14, height: 14, background: YEL, border: `1.5px solid ${INK}`, flex: "none", marginTop: 3 };
const tickOut: CSSProperties = { width: 14, height: 14, border: `1.5px solid ${INK}`, flex: "none", marginTop: 3 };
const li: CSSProperties = { display: "flex", gap: 10, alignItems: "flex-start", fontFamily: GROT, fontSize: 14.5, lineHeight: 1.5 };

function Mark({ children }: { children: ReactNode }) {
  return <span style={mark}>{children}</span>;
}

/**
 * Scrolling strip (home-page ticker pattern). The content is rendered twice
 * and the track slides left by exactly one copy, so the loop is seamless. The
 * second copy is hidden from screen readers and its links are taken out of the
 * tab order, so assistive tech reads everything once.
 */
type StripItem = { text: string; src?: string; href?: string };

// `seconds` is one full loop. Both strips are tuned to roughly 55px a second,
// so the long stats strip and the short builder strip scroll at the same pace.
function Strip({ label, dark, items, seconds }: { label: string; dark: boolean; items: StripItem[]; seconds: number }) {
  const set = (hidden: boolean) => (
    <span className="emp-strip-set" aria-hidden={hidden ? true : undefined}>
      {items.map((it) => (
        <span key={it.text} className="emp-strip-item">
          <span>{it.text}</span>
          {it.src && it.href && (
            <a href={it.href} target="_blank" rel="noopener noreferrer" className="emp-strip-src" tabIndex={hidden ? -1 : undefined}>
              {it.src}
            </a>
          )}
          <span className="emp-strip-sep" aria-hidden="true">{"////"}</span>
        </span>
      ))}
    </span>
  );
  return (
    <div
      className="emp-strip"
      role="region"
      aria-label={label}
      style={{ background: dark ? DARK : PAPER2, color: dark ? PAPER : INK, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}
    >
      <span className="emp-strip-label">{label}</span>
      <div className="emp-strip-view">
        <div className="emp-strip-track" style={{ animationDuration: `${seconds}s` }}>
          {set(false)}
          {set(true)}
        </div>
      </div>
    </div>
  );
}

/** Full-width black § bar: number left, mono tag right. */
function SectionBar({ n, tag, id, ruleTop = false }: { n: string; tag: string; id?: string; ruleTop?: boolean }) {
  return (
    <div
      id={id}
      style={{ background: DARK, color: PAPER, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: `11px ${GUTTER}`, borderTop: ruleTop ? `1px solid ${PAPER}` : undefined, fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", scrollMarginTop: 0 }}
    >
      <span>§ {n}</span>
      <span style={{ textAlign: "right" }}>{tag}</span>
    </div>
  );
}

/** 28px mono title bar that replaces browser chrome on every screenshot. */
function ShotBar({ title, small = false }: { title: string; small?: boolean }) {
  return (
    <div style={{ height: 28, borderBottom: `1px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: small ? "0 8px" : "0 10px", fontFamily: MONO, fontSize: small ? 9 : 10, letterSpacing: small ? ".16em" : ".18em", textTransform: "uppercase", background: PAPER }}>
      <span>{title}</span>
      <span aria-hidden="true" style={{ color: INK55, letterSpacing: ".12em" }}>+ Enlarge</span>
    </div>
  );
}

type Img = { src: string; alt: string; width: number; height: number };
const img = (file: string, alt: string, width: number, height: number): Img => ({ src: `${SHOTS}/${file}`, alt, width, height });

/** The two crossfade cards. Frame A fades to frame B and back, 11s loop. */
function Crossfade({ a, b, aspect, eager = false, style }: { a: Img; b: Img; aspect: string; eager?: boolean; style?: CSSProperties }) {
  return (
    <span className="xf" style={{ display: "block", aspectRatio: aspect, background: PAPER, overflow: "hidden", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="xf-a" src={a.src} alt={a.alt} width={a.width} height={a.height} loading={eager ? "eager" : "lazy"} decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="xf-b" src={b.src} alt={b.alt} width={b.width} height={b.height} loading={eager ? "eager" : "lazy"} decoding="async" />
    </span>
  );
}

// ── screenshots (WebP in public/assets/emos-platform, from the 11 Sep run) ──
const S1A = img("S1a-pitch-before-score.webp", "PressIQ with a Kestrel Payroll pitch drafted, before scoring", 1389, 868);
const S1C = img("S1c-score-73-strongest-line.webp", "The same pitch scored 73 out of 100, with its strongest line quoted", 1312, 924);
const S5A = img("S5a-before-aligned.webp", "PressIQ ready to draft a pitch for a saved journalist", 1365, 840);
const S5B = img("S5b-warning-aligned.webp", "PressIQ warning that a draft for this journalist already exists", 1365, 840);

type Step = {
  n: string;
  tool: string;
  label: string;
  promise: string;
  body: string;
  shot: { bar: string; caption: string } & ({ still: Img } | { fade: [Img, Img] });
};

const STEPS: Step[] = [
  {
    n: "00", tool: "Company Brief", label: "Start here",
    promise: "Tell it who you are, once.",
    body: "EMOS reads your website, or a doc you upload or paste, and writes a brief under fixed headings. Your edits stay yours, and every tool below reads it.",
    shot: { bar: "EMOS · Company Brief", caption: "Brief approved, and in use by every tool", still: img("S2c-brief-approved.webp", "An approved company brief for Kestrel Payroll", 1472, 812) },
  },
  {
    n: "01", tool: "SignalIQ", label: "Story detection",
    promise: "Find what editors are already covering.",
    body: "Scans open data for stories rising in your beat and saves the strongest as an asset pack.",
    shot: { bar: "EMOS · SignalIQ", caption: "Eight opportunities, ranked by signal strength", still: img("S3a-radar-results.webp", "SignalIQ radar showing eight ranked opportunities", 1455, 837) },
  },
  {
    n: "02", tool: "AssetIQ", label: "Linkable asset brief",
    promise: "Give journalists something worth citing.",
    body: "Turns a saved signal into a brief for a report, calculator or quiz a journalist would link to.",
    shot: { bar: "EMOS · SignalIQ → AssetIQ", caption: "The asset pack AssetIQ builds its brief from", still: img("S3b-asset-pack.webp", "A SignalIQ asset pack, the starting point for an AssetIQ brief", 1455, 816) },
  },
  {
    n: "03", tool: "JournoCollabIQ", label: "Journalist list",
    promise: "Pitch people who cover your story.",
    body: "Finds journalists by beat and coverage fit. Save the ones who fit, with a note on why.",
    shot: { bar: "EMOS · JournoCollabIQ", caption: "Saved list with beats and authority, names blurred", still: img("S4-journalist-list-blurred.webp", "A saved journalist list with beats and outlet authority, names blurred", 1110, 405) },
  },
  {
    n: "04", tool: "PressIQ", label: "Draft + score",
    promise: "Send pitches written for one reader.",
    body: "Drafts pitches aimed at a saved journalist and asset, then scores each one on seven dimensions and a 32-point checklist. It warns you before you pitch the same journalist twice.",
    shot: { bar: "EMOS · PressIQ", caption: "It warns you before you draft the same journalist twice", fade: [S5A, S5B] },
  },
  {
    n: "05", tool: "CoverageIQ", label: "Proof",
    promise: "Show what the work produced.",
    body: "Logs your pitches and placements in one place, with each outlet's authority.",
    shot: { bar: "EMOS · CoverageIQ", caption: "Pipeline stats and five pitches for Kestrel", still: img("S6-coverageiq-pipeline.webp", "CoverageIQ pipeline with stage counts and five logged pitches", 1512, 750) },
  },
];

const RESULTS = [
  {
    stat: "1.5M", label: "Monthly visitors · Ridester", italic: true,
    body: "“Syed and the team's expertise at doing customized outreach and earning quality whitehat backlinks ... helping to grow Ridester from zero to 1.5 million monthly visitors.”",
    who: "Brett Helling, Ridester", href: "https://www.dmr.agency/case-studies/ridester-seo/", wide: false,
  },
  {
    stat: "DR 1 → 27", label: "Curednation", italic: false,
    body: "Links from Healthline, The Mirror and MSN within two months.",
    who: "Trent Carter, Curednation", href: "https://www.dmr.agency/case-studies/addiction-treatment-center-seo/", wide: false,
  },
  {
    stat: "+120%", label: "Organic traffic · Centriq", italic: true,
    body: "“Our organic traffic increased by 120%. ... We saw a 6x increase in average daily signups.”",
    who: "Imani Lea Brown, Centriq", href: "https://www.dmr.agency/case-studies/centriq-digital-pr-growth/", wide: true,
  },
];

/** Renders a FAQ answer, turning its optional link substring into a link. */
function Answer({ item }: { item: FaqItem }) {
  const style: CSSProperties = { margin: 0, padding: "0 20px 20px", fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, color: INK70, maxWidth: "70ch" };
  const link = item.link;
  const at = link ? item.a.indexOf(link.text) : -1;
  if (!link || at < 0) return <p style={style}>{item.a}</p>;
  const linkStyle: CSSProperties = { color: INK, textDecoration: "underline", textUnderlineOffset: 3 };
  return (
    <p style={style}>
      {item.a.slice(0, at)}
      {link.external ? (
        <a href={link.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{link.text}</a>
      ) : (
        <Link href={link.href} style={linkStyle}>{link.text}</Link>
      )}
      {item.a.slice(at + link.text.length)}
    </p>
  );
}

export function PlatformLanding({ signedIn, signedInEmail }: { signedIn: boolean; signedInEmail: string }) {
  const SUBSCRIBE = "/emos-platform/subscribe";
  const SIGNIN = "/emos-platform/signin";
  const onboardingLink: CSSProperties = { color: INK, textDecoration: "underline", textUnderlineOffset: 3 };

  return (
    <div className="emp" style={{ background: PAPER, color: INK, fontFamily: GROT, overflowX: "clip", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <header style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${INK}`, padding: `14px ${GUTTER}` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em" }}>EMOS</span>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: INK55 }}>Earned Media Operating System</span>
        </div>
        <Link href={SIGNIN} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none", color: INK }}>
          Sign in →
        </Link>
      </header>

      {/* ── Signed in, no subscription yet (kept from the previous page) ───── */}
      {signedIn && (
        <div style={{ background: PAPER2, borderBottom: `1px solid ${INK}` }}>
          <div style={{ maxWidth: 1280, marginInline: "auto", padding: `14px ${GUTTER}`, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15, color: INK70, lineHeight: 1.5 }}>
              You&apos;re signed in{signedInEmail ? ` as ${signedInEmail}` : ""}. Your account doesn&apos;t have an active EMOS subscription yet.
            </p>
            <Link href={SUBSCRIBE} style={{ fontFamily: GROT, fontWeight: 800, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: INK, textDecoration: "underline", textUnderlineOffset: 4 }}>
              Activate for $149/month →
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(36px,5vw,64px) ${GUTTER} clamp(28px,4vw,48px)`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", gap: "clamp(28px,4vw,56px)", alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <span style={chipYel}>EMOS Platform · Do it yourself</span>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(36px,4.6vw,62px)", lineHeight: 1.02, letterSpacing: "-0.03em", margin: "20px 0 0", textWrap: "pretty", color: INK }}>
            Find the story. <Mark>Pitch the right journalist.</Mark> Keep the proof.
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.55, color: INK70, margin: "22px 0 0", maxWidth: "52ch", textWrap: "pretty" }}>
            EMOS turns the earned media method I have used on client accounts since 2013 into five connected tools. Start with your company brief, and every step after it knows who you are, what you have saved and who you have already pitched.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            <Link href={SUBSCRIBE} className="emp-btn-y" style={btnYel}>Get EMOS · $149/month</Link>
            <a href="#how" className="emp-btn-o" style={btnOut}>See how it works ↓</a>
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.9, color: INK55, margin: "20px 0 0" }}>
            $149/month Early Adopter price · cancel any time · secure payment via Stripe<br />price locked while you stay subscribed
          </p>
        </div>

        <div style={{ position: "relative", minWidth: 0 }}>
          <div style={{ border: `1px solid ${INK}`, background: PAPER2 }}>
            <ShotBar title="EMOS · PressIQ" />
            <ZoomShot full={S1C} caption="EMOS · PressIQ · scored 73 before sending">
              <Crossfade a={S1A} b={S1C} aspect="16/10" eager />
            </ZoomShot>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: INK70, margin: "10px 0 0" }}>
            A Kestrel Payroll pitch, drafted and then scored 73 before it is sent.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {["Your company brief, already loaded", "Aimed at a saved journalist", "Scored before you send"].map((t) => (
              <span key={t} style={{ background: YEL, border: `1px solid ${INK}`, fontFamily: MONO, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", padding: "5px 8px" }}>
                ↑ {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why earned media (scrolling, sourced) ─────────────────────────── */}
      <Strip label="Why earned media" dark items={EARNED_MEDIA_STATS} seconds={72} />

      {/* ── § 01 How it works ────────────────────────────────────────────── */}
      <SectionBar n="01" tag="Six steps · one login" id="how" ruleTop />
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(36px,4vw,56px) ${GUTTER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "clamp(20px,3vw,48px)", alignItems: "start", marginBottom: 36 }}>
          <h2 style={{ ...h2, fontSize: "clamp(28px,3.4vw,46px)" }}>Every step hands its work to the next.</h2>
          <p style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.55, color: INK70, margin: 0, textWrap: "pretty" }}>
            Earned media done by hand breaks in the gaps. The story idea lives in one tab, the journalist list in a spreadsheet, the pitch in your drafts folder. EMOS closes the gaps.
          </p>
        </div>

        <div>
          {STEPS.map((s, i) => {
            const full = "still" in s.shot ? s.shot.still : s.shot.fade[1];
            return (
              <div key={s.n} className="step-row" style={{ border: `1px solid ${INK}`, borderTop: i === 0 ? `1px solid ${INK}` : "none", display: "grid", gridTemplateColumns: "96px minmax(0,1fr)" }}>
                <div className="step-num" style={{ borderRight: `1px solid ${INK}`, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "22px 0", fontFamily: SERIF, fontWeight: 700, fontSize: 46, lineHeight: 1, color: INK32 }}>
                  {s.n}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", minWidth: 0 }}>
                  <div style={{ flex: "1 1 0", minWidth: 0, padding: "22px 24px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                      <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, margin: 0, color: INK }}>{s.tool}</h3>
                      <span style={{ background: YEL, fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", padding: "4px 7px" }}>{s.label}</span>
                    </div>
                    <p style={{ fontFamily: GROT, fontWeight: 700, fontSize: 16, margin: "12px 0 6px" }}>{s.promise}</p>
                    <p style={{ ...serifBody, textWrap: "pretty" }}>{s.body}</p>
                  </div>
                  <div className="thumb" style={{ flex: "0 0 34%", maxWidth: 400, borderLeft: `1px solid ${INK}`, background: PAPER2, display: "flex", flexDirection: "column", minHeight: 190 }}>
                    <ShotBar title={s.shot.bar} small />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 14 }}>
                      <ZoomShot full={full} caption={`${s.shot.bar} · ${s.shot.caption}`}>
                        {"still" in s.shot ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.shot.still.src} alt={s.shot.still.alt} width={s.shot.still.width} height={s.shot.still.height} loading="lazy" decoding="async" style={{ width: "100%", display: "block", border: `1px solid ${INK15}` }} />
                        ) : (
                          <Crossfade a={s.shot.fade[0]} b={s.shot.fade[1]} aspect="1364/840" style={{ width: "100%", border: `1px solid ${INK15}` }} />
                        )}
                      </ZoomShot>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: INK70, textAlign: "center" }}>{s.shot.caption}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── § 02 Free tools vs Platform ──────────────────────────────────── */}
      <SectionBar n="02" tag="The difference" />
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: `clamp(36px,4vw,56px) ${GUTTER}` }}>
        <h2 style={{ ...h2, margin: "0 0 16px", maxWidth: "24ch", textWrap: "pretty" }}>
          Try each EMOS tool free. <Mark>Run them together on the Platform.</Mark>
        </h2>
        <p style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.55, color: INK70, margin: "0 0 28px", maxWidth: "62ch", textWrap: "pretty" }}>
          SignalIQ, JournoCollabIQ, PressIQ and CoverageIQ each have a free version on this site. Each one answers one question at a time and saves nothing. The Platform connects all six steps and keeps everything you save.
        </p>

        <table className="cmp-table" style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${INK}`, fontFamily: GROT, fontSize: 14.5 }}>
          <thead>
            <tr style={{ background: DARK, color: PAPER }}>
              <th scope="col" style={{ textAlign: "left", padding: "12px 14px", ...monoSmall, fontWeight: 400, width: "26%" }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Feature</span></th>
              <th scope="col" style={{ textAlign: "left", padding: "12px 14px", ...monoSmall, fontWeight: 400 }}>Free EMOS tools</th>
              <th scope="col" style={{ textAlign: "left", padding: "12px 14px", ...monoSmall, fontWeight: 400 }}>EMOS Platform</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((r, i) => {
              const top = i === 0 ? `1px solid ${INK}` : `1px solid ${INK15}`;
              return (
                <tr key={r.label} style={{ background: i % 2 === 0 ? PAPER : PAPER2 }}>
                  <th scope="row" style={{ textAlign: "left", padding: "12px 14px", borderTop: top, fontWeight: 700 }}>{r.label}</th>
                  <td style={{ padding: "12px 14px", borderTop: top, borderLeft: `1px solid ${INK15}`, color: INK70 }}>{r.free}</td>
                  <td style={{ padding: "12px 14px", borderTop: top, borderLeft: `1px solid ${INK15}` }}>{r.paid}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="cmp-cards" style={{ flexDirection: "column", gap: 0 }}>
          {COMPARISON.map((r, i) => (
            <div key={r.label} style={{ border: `1px solid ${INK}`, borderTop: i === 0 ? `1px solid ${INK}` : "none", padding: "14px 16px", background: i % 2 === 0 ? PAPER : PAPER2 }}>
              <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, margin: "0 0 10px" }}>{r.label}</p>
              <p style={{ fontFamily: GROT, fontSize: 14, lineHeight: 1.5, margin: "0 0 6px", color: INK70 }}><strong style={{ color: INK }}>Free:</strong> {r.free}</p>
              <p style={{ fontFamily: GROT, fontSize: 14, lineHeight: 1.5, margin: 0 }}><strong>Platform:</strong> {r.paid}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 16 }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: INK70, margin: 0 }}>The free tools stay free. Try them first if you like:</p>
          <Link href="/tools" className="emp-btn-o" style={{ ...btnOut, padding: "9px 14px", fontSize: 10.5 }}>Try the free EMOS tools →</Link>
        </div>
      </section>

      {/* ── § 03 Built by ────────────────────────────────────────────────── */}
      <SectionBar n="03" tag="The method behind it" />
      <Strip label="About the builder" dark={false} items={BUILDER_CREDS.map((text) => ({ text }))} seconds={32} />
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(36px,4vw,56px) ${GUTTER}` }}>
        <h2 style={{ ...h2, margin: "0 0 32px", maxWidth: "26ch", textWrap: "pretty" }}>Software built from 13 years of client work, not a template.</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "clamp(20px,3vw,44px)", alignItems: "start" }}>
          <div style={{ border: `1px solid ${INK}`, background: PAPER2, padding: 24, maxWidth: 420 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${SHOTS}/headshot-192.webp`} alt="Syed Irfan Ajmal" width={96} height={96} loading="lazy" decoding="async" style={{ width: 96, height: 96, objectFit: "cover", border: `1px solid ${INK}`, display: "block" }} />
            <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, margin: "16px 0 4px" }}>Syed Irfan Ajmal</p>
            <p style={{ ...monoSmall, color: INK55, margin: "0 0 16px" }}>Founder, DMR.agency · Builder of EMOS</p>
            <p style={{ ...serifBody, lineHeight: 1.6, textWrap: "pretty" }}>
              I have run earned media for clients through my agency, DMR.agency, since 2013. I have also written for Forbes Middle East, HuffPost and TNW, so I have been the person reading the pitches too. EMOS is that method, turned into steps a founder can run without me.
            </p>
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={{ border: `1px solid ${INK}`, padding: "10px 12px", fontFamily: MONO, fontSize: 10, lineHeight: 1.7, letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 16px" }}>
              Results from client campaigns delivered through DMR.agency using the method EMOS is built on. The Platform is new; these are not Platform customer results.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: 0 }}>
              {RESULTS.map((r) => (
                <div key={r.label} style={{ border: `1px solid ${INK}`, padding: 20, minWidth: 0, gridColumn: r.wide ? "1/-1" : undefined }}>
                  <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1, margin: 0, display: "inline-block", borderBottom: `2px solid ${YEL}`, paddingBottom: 4 }}>{r.stat}</p>
                  <p style={{ fontFamily: GROT, fontWeight: 700, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", margin: "14px 0 6px" }}>{r.label}</p>
                  <p style={{ fontFamily: SERIF, fontStyle: r.italic ? "italic" : "normal", fontSize: 15, lineHeight: 1.5, color: INK70, margin: "0 0 10px" }}>{r.body}</p>
                  <p style={{ ...monoSmall, letterSpacing: ".14em", color: INK55, margin: "0 0 8px" }}>{r.who}</p>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: GROT, fontWeight: 700, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: 4, color: INK }}>
                    See case study →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── § 04 Two ways to run EMOS ────────────────────────────────────── */}
      <SectionBar n="04" tag="DIY or with me" />
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(36px,4vw,56px) ${GUTTER} 0` }}>
        <h2 style={{ ...h2, margin: "0 0 28px" }}>
          Run it yourself, or <Mark>have it set up with you.</Mark>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: 24 }}>
          <div style={{ border: `1px solid ${INK}`, background: PAPER2, padding: 28, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ ...chipYel, alignSelf: "flex-start" }}>EMOS Platform · Do it yourself</span>
            <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1, margin: "20px 0 0" }}>$149<span style={{ fontSize: 18, fontWeight: 400, color: INK55 }}>/month</span></p>
            <p style={{ ...serifBody, margin: "16px 0 18px", textWrap: "pretty" }}>
              For founders and small teams who will send the pitches themselves and want the steps, the memory and the scoring in one place.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {["All six steps above", "Everything saved to your account", "Cancel any time"].map((t) => (
                <li key={t} style={li}><span style={tickYel} aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <Link href={SUBSCRIBE} className="emp-btn-y" style={{ ...btnYel, marginTop: "auto", alignSelf: "flex-start", padding: "13px 20px" }}>Get EMOS →</Link>
          </div>

          <div style={{ border: `1px solid ${INK}`, padding: 28, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ alignSelf: "flex-start", border: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 800, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", padding: "4px 10px 5px" }}>EMOS Academy · Done with you</span>
            <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1, margin: "20px 0 0" }}>From $2,000<span style={{ fontSize: 18, fontWeight: 400, color: INK55, whiteSpace: "nowrap" }}> one-time</span></p>
            <p style={{ ...serifBody, margin: "16px 0 18px", textWrap: "pretty" }}>
              For founders 3 to 12 months from a Series A who want the system installed inside their team. Five founders per cohort, one live call a week, 4 to 8 weeks, and a placements-or-refund guarantee.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              <li style={li}><span style={tickOut} aria-hidden="true" />Founding cohort members get EMOS tools free for three months</li>
            </ul>
            <Link href="/emos-academy" className="emp-btn-o" style={{ ...btnOut, marginTop: "auto", alignSelf: "flex-start", padding: "13px 20px" }}>See EMOS Academy →</Link>
          </div>
        </div>
      </section>

      <div style={{ background: DARK, color: PAPER, marginTop: "clamp(36px,4vw,56px)", padding: `22px ${GUTTER}`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))", gap: 18, alignItems: "start" }}>
        <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: YEL, margin: 0 }}>Not for you if</p>
        <p style={{ fontFamily: GROT, fontSize: 14, lineHeight: 1.6, color: "rgba(241,235,222,.85)", margin: 0 }}>You want someone else to send the pitches. That is DMR.agency.</p>
        <p style={{ fontFamily: GROT, fontSize: 14, lineHeight: 1.6, color: "rgba(241,235,222,.85)", margin: 0 }}>You want a press release pushed to a wire service. That is not earned media.</p>
        <p style={{ fontFamily: GROT, fontSize: 14, lineHeight: 1.6, color: "rgba(241,235,222,.85)", margin: 0 }}>You need a directory of every journalist alive. This is a shortlist for the story you are pitching.</p>
      </div>

      {/* ── § 05 Price ───────────────────────────────────────────────────── */}
      <SectionBar n="05" tag="Early adopter" id="price" ruleTop />
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: `clamp(36px,4vw,56px) ${GUTTER}` }}>
        <h2 style={{ ...h2, margin: "0 0 28px" }}>One plan. One price.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 28, alignItems: "start" }}>
          <div style={{ border: `2px solid ${INK}`, background: PAPER2, padding: "clamp(22px,4vw,30px)", minWidth: 0 }}>
            <span style={chipYel}>Early adopter</span>
            <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(48px,6vw,64px)", lineHeight: 1, letterSpacing: "-0.04em", margin: "20px 0 0" }}>$149<span style={{ fontSize: 20, fontWeight: 400, letterSpacing: 0, color: INK55 }}>/month</span></p>
            <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.8, color: INK55, margin: "10px 0 22px" }}>Cancel any time · price locked while you stay subscribed</p>
            <p style={{ ...monoSmall, letterSpacing: ".18em", margin: "0 0 12px" }}>Included</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px", display: "flex", flexDirection: "column", gap: 11 }}>
              <li style={li}><span style={tickYel} aria-hidden="true" />Company Brief, SignalIQ, AssetIQ, JournoCollabIQ, PressIQ, CoverageIQ</li>
              <li style={li}><span style={tickYel} aria-hidden="true" />Everything saved to your account, walled off from every other account</li>
              <li style={li}><span style={tickYel} aria-hidden="true" /><span>{PRICE_BOX_ALLOWANCES}</span></li>
              <li style={li}>
                <span style={tickYel} aria-hidden="true" />
                <span>
                  A 1:1{" "}
                  <a href={EMOS_PLATFORM_ONBOARDING_URL} target="_blank" rel="noopener noreferrer" style={onboardingLink}>onboarding call</a>{" "}
                  with me to set up your first company brief
                </span>
              </li>
            </ul>
            <Link href={SUBSCRIBE} className="emp-btn-y" style={{ ...btnYel, display: "flex", justifyContent: "center", padding: "16px 20px", fontSize: 12 }}>Get EMOS · $149/month</Link>
            <p style={{ ...monoSmall, letterSpacing: ".14em", color: INK55, margin: "12px 0 0", textAlign: "center" }}>Secure payment via Stripe</p>
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={{ ...monoSmall, letterSpacing: ".18em", margin: "0 0 14px" }}>How access works</p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { k: "1", head: "Pay", tail: " by card through Stripe." },
                { k: "2", head: "Check your inbox.", tail: " We email you an invite. If it is not there in a few minutes, check spam." },
                { k: "3", head: "Set your password.", tail: " That is your login, and you land in the dashboard." },
              ].map((s, i) => (
                <li key={s.k} style={{ border: `1px solid ${INK}`, borderTop: i === 0 ? `1px solid ${INK}` : "none", padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, lineHeight: 1, color: INK32 }}>{s.k}</span>
                  <p style={serifBody}><strong style={{ color: INK }}>{s.head}</strong>{s.tail}</p>
                </li>
              ))}
              <li style={{ border: `1px solid ${INK}`, borderTop: "none", padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start", background: PAPER2 }}>
                <span aria-hidden="true" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, lineHeight: 1, color: INK32 }}>4</span>
                <p style={serifBody}>
                  <strong style={{ color: INK }}>
                    Book your{" "}
                    <a href={EMOS_PLATFORM_ONBOARDING_URL} target="_blank" rel="noopener noreferrer" style={onboardingLink}>onboarding call</a>.
                  </strong>{" "}
                  The welcome email has the link. We set up your first company brief together.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ── § 06 FAQ ─────────────────────────────────────────────────────── */}
      <SectionBar n="06" tag="Straight answers" id="faq" />
      <section style={{ maxWidth: 900, margin: "0 auto", padding: `clamp(36px,4vw,56px) ${GUTTER}` }}>
        {FAQ.map((item, i) => (
          <details key={item.q} open={i === 0} style={{ border: `1px solid ${INK}`, borderTop: i === 0 ? `1px solid ${INK}` : "none" }}>
            <summary style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: "18px 20px", fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: INK }}>
              {item.q}
              <span className="faq-sign" aria-hidden="true" style={{ fontFamily: GROT, fontSize: 18, transition: "transform .12s ease", flex: "none" }}>+</span>
            </summary>
            <Answer item={item} />
          </details>
        ))}
      </section>

      {/* ── § 07 Closing band ────────────────────────────────────────────── */}
      <section style={{ background: DARK, color: PAPER, padding: `clamp(48px,6vw,84px) ${GUTTER}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px,4vw,56px)", lineHeight: 1.03, letterSpacing: "-0.03em", margin: 0, color: PAPER }}>Start with your company brief.</h2>
          <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.55, color: "rgba(241,235,222,.72)", margin: "18px 0 28px", maxWidth: "56ch", textWrap: "pretty" }}>
            Give EMOS your website and it writes the brief every other tool reads. Then find your first story.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href={SUBSCRIBE} className="emp-btn-y" style={{ ...btnYel, border: `1px solid ${YEL}`, padding: "15px 22px" }}>Get EMOS · $149/month</Link>
            <Link href={SIGNIN} className="emp-btn-d" style={{ ...btnOut, border: `1px solid ${PAPER}`, color: PAPER, padding: "15px 22px" }}>Sign in</Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 26 }}>
            <Link href="/tools" style={{ fontFamily: SERIF, fontSize: 16, color: "rgba(241,235,222,.72)", textDecoration: "underline", textUnderlineOffset: 4 }}>Try the free tools first</Link>
            <Link href="/emos-academy" style={{ fontFamily: SERIF, fontSize: 16, color: "rgba(241,235,222,.72)", textDecoration: "underline", textUnderlineOffset: 4 }}>Rather have it set up with you? EMOS Academy</Link>
          </div>
        </div>
      </section>

      {/* ── Footer link row (build note 5: the page must not be a dead end) ── */}
      <footer style={{ borderTop: `1px solid ${INK}`, padding: `20px ${GUTTER}`, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center" }}>
        <nav aria-label="Site" style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
          {[
            ["About", "/about"],
            ["Resources", "/resources"],
            ["Contact", "/contact"],
            ["Refund policy", "/refund-policy"],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none", color: INK }}>
              {label}
            </Link>
          ))}
        </nav>
        <span style={{ ...monoSmall, color: INK55 }}>© MMXXVI · SIA Enterprises Inc</span>
      </footer>
    </div>
  );
}
