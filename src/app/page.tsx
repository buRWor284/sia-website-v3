'use client';
import { useEffect, useState } from 'react';
import { Subscriptions, CTATicker } from '@/components/bureau';

/**
 * Homepage v4 Cream edition (SIA-homepage-v3 design)
 * Embedded directly from design_handoff_homepage/Homepage v4 Cream.html
 *
 * To roll back: copy page.tsx.bak → page.tsx
 */

const css = `
  /* ── TOKENS ─────────────────────────────────────────────── */
  :root {
    --Y:    #f5c518;
    --Y2:   #ffd83a;
    --INK:  #0e0d0a;
    --I70:  rgba(14,13,10,.72);
    --I45:  rgba(14,13,10,.45);
    --I15:  rgba(14,13,10,.15);
    --RED:  #2e90c3;
    --sans: 'Archivo', 'Helvetica Neue', Arial, sans-serif;
    --BG:  #f5f0e8;
    --BG2: #ece7da;
    --mono: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; scroll-behavior: smooth; }
  body { background: var(--BG); font-family: var(--sans); color: var(--INK); line-height: 1; }
  a { text-decoration: none; color: inherit; }

  /* ── SECTION INDEX ──────────────────────────────────────── */
  .sec-idx {
    display: flex; align-items: center; gap: 14px; margin-bottom: 36px;
  }
  .sec-idx__n {
    font-family: var(--mono); font-size: 11px; font-weight: 600;
    letter-spacing: .12em; color: var(--RED); flex-shrink: 0;
  }
  .sec-idx__rule { flex: 1; height: 2px; background: var(--INK); }
  .sec-idx__label {
    font-family: var(--mono); font-size: 11px; font-weight: 600;
    letter-spacing: .18em; text-transform: uppercase; color: var(--I70); flex-shrink: 0;
  }
  .sec-idx--dark .sec-idx__rule { background: rgba(245,197,24,.25); }
  .sec-idx--dark .sec-idx__n { color: var(--RED); }
  .sec-idx--dark .sec-idx__label { color: rgba(245,197,24,.7); }


  /* ── HERO ───────────────────────────────────────────────── */
  .hero { background: var(--BG); padding: 20px 56px 0; }

  @keyframes ticker-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .ticker {
    border-top: 2px solid var(--INK); border-bottom: 2px solid var(--INK);
    padding: 11px 0; margin-bottom: 28px;
    font-family: var(--mono); font-size: 11.5px; color: var(--INK);
    font-weight: 500; letter-spacing: .04em;
    overflow: hidden; white-space: nowrap; position: relative;
  }
  .ticker-track {
    display: inline-flex; align-items: center; gap: 28px;
    animation: ticker-scroll 28s linear infinite;
    will-change: transform;
  }
  .ticker:hover .ticker-track { animation-play-state: paused; }
  .ticker__dot { color: var(--RED); }
  .ticker__sep { color: var(--I15); }
  .ticker__bold { font-weight: 700; }

  /* ── CTA TICKER (secondary, below testimonials) ─────────── */
  .ticker--cta {
    background: var(--INK); color: var(--BG);
    border-top: 3px solid var(--INK); border-bottom: 3px solid var(--INK);
    margin-top: 64px; margin-bottom: 64px;
    font-size: 14px; padding: 16px 0; letter-spacing: .05em;
  }
  .ticker--cta .ticker__sep { color: rgba(255,255,255,0.25); }
  .ticker--cta .ticker__dot { color: var(--RED); }
  .ticker--cta .ticker__bold { font-weight: 800; }
  .ticker--cta a {
    color: var(--BG); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.35);
    transition: border-color .2s, color .2s;
  }
  .ticker--cta a:hover { border-color: var(--RED); color: var(--RED); }

  .hero-grid {
    display: grid; grid-template-columns: 1.3fr 1fr;
    gap: 64px; align-items: center;
  }
  .hero-kicker {
    font-family: var(--mono); font-size: 12px; letter-spacing: .18em;
    color: var(--INK); margin-bottom: 22px; font-weight: 600;
  }
  .hero-h1 {
    font-family: var(--sans); font-weight: 900; font-size: 58px;
    line-height: .92; letter-spacing: -.04em; color: var(--INK);
    text-transform: uppercase;
  }
  .hero-h1 .strike {
    text-decoration: line-through;
    text-decoration-color: var(--RED);
    text-decoration-thickness: 4px;
  }
  .hero-h1 .earn {
    background: var(--Y);
    color: var(--INK);
    padding: 0 6px 4px;
    display: inline-block;
  }
  .hero-right {
    display: flex; flex-direction: column; justify-content: center;
  }
  .hero-sub {
    font-family: var(--sans); font-size: 18px; font-weight: 500;
    color: var(--INK); line-height: 1.45;
  }
  .hero-sub strong { font-weight: 900; font-style: italic; }
  .hero-ctas { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 20px 28px; background: var(--INK); color: var(--Y);
    font-family: var(--sans); font-weight: 800; font-size: 14px;
    letter-spacing: .08em; text-transform: uppercase;
    border: 2px solid var(--INK); transition: background .15s;
  }
  .btn-primary:hover { background: var(--RED); border-color: var(--RED); }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 20px 28px; background: transparent; color: var(--INK);
    font-family: var(--sans); font-weight: 800; font-size: 14px;
    letter-spacing: .08em; text-transform: uppercase;
    border: 2px solid var(--INK); transition: background .15s;
  }
  .btn-outline:hover { background: rgba(14,13,10,.07); }
  .mono-arrow { font-family: var(--mono); }


  /* speaking photo */
  .speaking-photo {
    margin-top: 24px; margin-bottom: 24px; border: 2px solid rgba(245,197,24,.35);
    overflow: hidden;
  }
  .speaking-photo img {
    width: 100%; height: 180px; object-fit: cover; object-position: left center; display: block;
  }
  .speaking-photo__caption {
    font-family: var(--mono); font-size: 10px; letter-spacing: .1em;
    color: rgba(245,197,24,.5); text-transform: uppercase;
    padding: 8px 10px; border-top: 1px solid rgba(245,197,24,.2);
  }

  /* ── STATS STRIP ────────────────────────────────────────── */
  .stats-strip {
    margin-top: 32px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-top: 2px solid var(--INK); border-bottom: 2px solid var(--INK);
  }
  .stat {
    padding: 24px 28px;
    border-right: 2px solid var(--INK);
  }
  .stat:last-child { border-right: none; }
  .stat__num {
    font-family: var(--sans); font-weight: 900; font-size: 56px; color: var(--INK);
    line-height: 1; letter-spacing: -.04em;
    display: flex; align-items: baseline; gap: 4px;
  }
  .stat__mo {
    font-size: 26px; font-weight: 700; letter-spacing: -.01em; color: var(--I70);
  }
  .stat__label {
    font-family: var(--sans); font-weight: 800; font-size: 15px;
    color: var(--INK); margin-top: 10px; letter-spacing: -.01em;
    text-transform: uppercase;
  }
  .stat__sub {
    font-family: var(--mono); font-size: 11px; color: var(--I70);
    margin-top: 8px; line-height: 1.5; letter-spacing: .04em;
  }

  /* ── PRESS ──────────────────────────────────────────────── */
  .press { background: var(--INK); padding: 44px 56px; }
  .press__inner { display: flex; align-items: center; gap: 56px; }
  .press__tag {
    font-family: var(--mono); font-size: 11px; color: var(--Y);
    letter-spacing: .18em; flex-shrink: 0; font-weight: 600; white-space: nowrap;
  }
  .press__logos {
    flex: 1; display: flex; justify-content: space-between;
    align-items: center; gap: 32px; flex-wrap: wrap;
  }

  /* ── SERVICES ───────────────────────────────────────────── */
  .services { background: var(--BG); padding: 100px 56px 0; }
  .section-h2 {
    font-family: 'Newsreader', Georgia, serif; font-weight: 700; font-size: 88px;
    color: var(--INK); line-height: .92; letter-spacing: -.03em; margin: 0 0 60px;
  }
  .services-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border: 2px solid var(--INK);
  }
  .service-card {
    padding: 36px 32px 32px; border-right: 2px solid var(--INK);
    display: flex; flex-direction: column; min-height: 380px; background: var(--BG);
  }
  .service-card:last-child { border-right: none; }
  .service-card__num {
    font-family: var(--mono); font-size: 11px;
    color: var(--RED); font-weight: 700; letter-spacing: .16em;
  }
  .service-card__title {
    font-family: var(--sans); font-weight: 900; font-size: 32px;
    color: var(--INK); line-height: 1.02; letter-spacing: -.02em; margin: 20px 0 0;
  }
  .service-card__body {
    font-family: var(--sans); font-size: 16px; color: var(--I70);
    line-height: 1.55; margin-top: 18px; flex: 1;
  }
  .service-card__cta {
    margin-top: 28px; font-family: var(--mono); font-size: 12px;
    font-weight: 700; color: var(--INK); letter-spacing: .10em;
    text-transform: uppercase; border-bottom: 2px solid var(--INK);
    padding-bottom: 4px; align-self: flex-start;
  }

  /* ── CASE STUDIES ───────────────────────────────────────── */
  .casework { background: var(--INK); padding: 100px 56px; }
  .casework .section-h2 { color: var(--Y); margin-bottom: 56px; }
  .casework .section-h2 em { font-style: italic; }
  .cases-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    border: 2px solid rgba(245,197,24,.25);
  }
  .case-card {
    padding: 40px 32px;
    border-right: 2px solid rgba(245,197,24,.25);
    display: flex; flex-direction: column;
  }
  .case-card:last-child { border-right: none; }
  .case-card__tag {
    display: inline-block; padding: 5px 10px;
    background: var(--RED); color: #fff;
    font-family: var(--mono); font-size: 10px; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase;
    align-self: flex-start; margin-bottom: 28px;
  }
  .case-card__metric {
    font-family: var(--sans); font-weight: 900; font-size: 80px;
    color: var(--Y); line-height: 1; letter-spacing: -.04em;
    display: flex; align-items: baseline; gap: 4px;
  }
  .case-card__metric-mo {
    font-size: 28px; font-weight: 700; color: rgba(245,197,24,.55);
  }
  .case-card__client {
    font-family: var(--mono); font-size: 11px; color: rgba(241,235,222,.5);
    letter-spacing: .12em; margin-top: 12px; text-transform: uppercase;
  }
  .case-card__result {
    font-family: var(--sans); font-weight: 800; font-size: 21px;
    color: #f1ebde; line-height: 1.12; letter-spacing: -.01em;
    margin-top: 18px;
  }
  .case-card__body {
    font-family: var(--sans); font-size: 15px; color: rgba(241,235,222,.62);
    line-height: 1.55; margin-top: 14px; flex: 1;
  }
  .case-card__link {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 28px; font-family: var(--mono); font-size: 11px;
    font-weight: 700; color: var(--RED); letter-spacing: .12em;
    text-transform: uppercase; border-bottom: 1px solid var(--RED);
    padding-bottom: 3px; align-self: flex-start;
  }
  .case-card__link:hover { color: #f1ebde; border-color: #f1ebde; }

  /* ── TESTIMONIALS ───────────────────────────────────────── */
  .testimonials { background: var(--BG2); padding: 100px 56px; }
  .testi-header {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 48px;
  }
  .testi-all {
    font-family: var(--mono); font-size: 12px; font-weight: 700;
    color: var(--INK); letter-spacing: .12em;
  }
  .testi-row {
    display: grid; grid-template-columns: 1.1fr 2.4fr 1fr;
    gap: 40px; padding: 44px 0;
    border-bottom: 2px solid var(--INK);
    align-items: baseline;
  }
  .testi-row:first-of-type { border-top: 2px solid var(--INK); }
  .testi__num {
    font-family: var(--mono); font-size: 12px; color: var(--I70); letter-spacing: .08em;
  }
  .testi__badge {
    display: inline-block; padding: 6px 10px; margin-top: 12px;
    background: var(--INK); color: var(--Y);
    font-family: var(--mono); font-size: 10.5px; font-weight: 700; letter-spacing: .10em;
  }
  .testi__quote {
    font-family: var(--sans); font-weight: 600; font-size: 28px;
    line-height: 1.25; color: var(--INK); letter-spacing: -.01em;
  }
  .testi__quote .q { color: var(--RED); }
  .testi__name {
    font-family: var(--sans); font-weight: 800; font-size: 17px; color: var(--INK);
  }
  .testi__role {
    font-family: var(--mono); font-size: 12px; color: var(--I70);
    margin-top: 6px; letter-spacing: .04em;
  }

  /* ── SPEAKING ───────────────────────────────────────────── */
  .speaking { background: var(--INK); padding: 100px 56px; color: var(--BG); }
  .speaking-grid { display: grid; grid-template-columns: 1fr 1.45fr; gap: 80px; }
  .speaking__sub {
    margin-top: 26px; font-family: var(--sans); font-size: 18px;
    color: rgba(255,255,255,.65); line-height: 1.55; max-width: 440px;
  }
  .speaking__cta {
    margin-top: 36px; display: inline-flex; align-items: center; gap: 12px;
    padding: 20px 28px; background: var(--Y); color: var(--INK);
    font-family: var(--sans); font-weight: 800; font-size: 14px;
    letter-spacing: .08em; text-transform: uppercase;
    border: 2px solid var(--Y); transition: background .15s;
  }
  .speaking__cta:hover { background: var(--RED); color: #fff; border-color: var(--RED); }
  .stage-row {
    display: grid; grid-template-columns: 40px 1.6fr 1fr 1.4fr;
    gap: 24px; padding: 26px 0;
    border-bottom: 1px solid rgba(245,197,24,.18);
    align-items: baseline;
  }
  .stage__n    { font-family: var(--mono); font-size: 13px; color: rgba(245,197,24,.4); }
  .stage__city { font-family: var(--sans); font-weight: 900; font-size: 28px; color: var(--Y); letter-spacing: -.015em; }
  .stage__ctry { font-family: var(--sans); font-size: 15px; color: rgba(245,197,24,.7); }
  .stage__date { font-family: var(--mono); font-size: 12px; color: rgba(245,197,24,.5); letter-spacing: .04em; }
  .stage__tag  { font-family: var(--mono); font-size: 11px; color: var(--RED); letter-spacing: .08em; font-weight: 700; }

  /* ── KITS (newspaper cards) ─────────────────────────────── */
  .kits { background: var(--BG2); padding: 100px 56px; }
  .kits-header {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 48px;
  }
  .kits-all {
    font-family: var(--mono); font-size: 12px; font-weight: 700;
    color: var(--INK); letter-spacing: .12em;
  }
  .kits-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    border: 2px solid var(--INK);
  }
  .kit-card {
    padding: 36px 32px 32px; border-right: 2px solid var(--INK);
    display: flex; flex-direction: column;
  }
  .kit-card:last-child { border-right: none; }
  .kit-card__badge {
    display: inline-block; padding: 6px 12px;
    background: var(--INK); border: 2px solid var(--INK);
    font-family: var(--mono); font-size: 10px; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase; color: var(--BG);
    align-self: flex-start; margin-bottom: 24px;
  }
  .kit-card__paper {
    border: 1px solid var(--INK); padding: 16px;
    background: rgba(14,13,10,.05); margin-bottom: 24px;
  }
  .kit-card__paper-header {
    display: flex; justify-content: space-between; align-items: baseline;
    border-bottom: 1px solid var(--INK); padding-bottom: 8px; margin-bottom: 12px;
  }
  .kit-card__gazette {
    font-family: var(--mono); font-size: 10px; font-weight: 700;
    letter-spacing: .18em; text-transform: uppercase; color: var(--INK);
  }
  .kit-card__date {
    font-family: var(--mono); font-size: 10px; color: var(--I45); letter-spacing: .06em;
  }
  .kit-card__paper-title {
    font-family: var(--sans); font-weight: 900; font-size: 18px;
    letter-spacing: -.01em; color: var(--INK); margin-bottom: 10px;
  }
  .kit-card__paper-cols {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    border-top: 1px solid var(--I15); padding-top: 10px;
  }
  .kit-card__paper-col {
    font-family: var(--sans); font-size: 11px; color: var(--I70); line-height: 1.5;
  }
  .kit-card__title {
    font-family: var(--sans); font-weight: 900; font-size: 28px;
    color: var(--INK); line-height: 1.1; letter-spacing: -.015em;
  }
  .kit-card__title em { font-style: italic; }
  .kit-card__body {
    font-family: var(--sans); font-size: 15px; color: var(--I70);
    font-style: italic; line-height: 1.5; margin-top: 10px; flex: 1;
  }
  .kit-card__footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 2px solid var(--INK); padding-top: 18px; margin-top: 24px;
  }
  .kit-card__year {
    font-family: var(--mono); font-size: 11px; color: var(--I45); letter-spacing: .06em;
  }
  .kit-card__cta {
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase;
    display: flex; align-items: center; gap: 6px;
    color: var(--INK);
  }
  .kit-card__cta:hover { color: var(--RED); }

  /* ── NEWSLETTER ─────────────────────────────────────────── */
  .newsletter { background: var(--INK); position: relative; }
  .stripe {
    height: 10px;
    background: repeating-linear-gradient(
      90deg,
      #e6002a 0 18px, #fff 18px 26px,
      #1a4fbd 26px 44px, #fff 44px 52px
    );
  }
  .newsletter__inner {
    padding: 76px 56px;
    display: grid; grid-template-columns: 1.2fr 1fr;
    gap: 56px; align-items: center;
  }
  .newsletter__h2 {
    font-family: 'Newsreader', Georgia, serif; font-weight: 700; font-size: 76px;
    color: var(--Y); line-height: .92; letter-spacing: -.03em;
  }
  .newsletter__sub {
    margin-top: 26px; font-family: var(--sans); font-size: 17px;
    color: rgba(255,255,255,.72); line-height: 1.5; max-width: 460px;
  }
  .newsletter__form { align-self: end; }
  .newsletter__row { display: flex; margin-bottom: 14px; }
  .newsletter__input {
    flex: 1; padding: 22px;
    border: 2px solid var(--Y); border-right: none;
    background: transparent; color: var(--Y);
    font-family: var(--sans); font-size: 16px; outline: none;
  }
  .newsletter__input::placeholder { color: rgba(245,197,24,.5); }
  .newsletter__btn {
    padding: 22px 28px; border: 2px solid var(--Y);
    background: var(--Y); color: var(--INK); cursor: pointer;
    font-family: var(--sans); font-weight: 900; font-size: 14px;
    letter-spacing: .08em; text-transform: uppercase;
    transition: background .15s;
  }
  .newsletter__btn:hover { background: var(--RED); color: #fff; border-color: var(--RED); }
  .newsletter__note {
    font-family: var(--mono); font-size: 11px;
    color: rgba(255,255,255,.4); letter-spacing: .06em;
  }
  .newsletter__note span { color: var(--RED); font-weight: 700; }

  /* ── FOOTER ─────────────────────────────────────────────── */
  .footer { background: var(--BG); padding: 56px 56px 28px; border-top: 2px solid var(--INK); }
  .footer__grid {
    display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 40px; padding-bottom: 40px; border-bottom: 2px solid var(--INK);
  }
  .footer__wordmark {
    font-family: var(--sans); font-style: italic; font-weight: 900;
    font-size: 56px; color: var(--INK); line-height: 1; letter-spacing: -.02em;
  }
  .footer__about {
    margin-top: 14px; font-family: var(--sans); font-size: 15px;
    color: var(--I70); line-height: 1.5; max-width: 320px;
  }
  .footer__col-head {
    font-family: var(--mono); font-size: 11px; color: var(--I70);
    letter-spacing: .18em; font-weight: 700; margin-bottom: 16px;
  }
  .footer__links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer__link {
    font-family: var(--sans); font-size: 14px; color: var(--INK); font-weight: 600;
  }
  .footer__link:hover { color: var(--RED); }
  .footer__bottom {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 22px; gap: 32px; flex-wrap: wrap;
  }
  .footer__copy {
    font-family: var(--mono); font-size: 11px; color: var(--I70); letter-spacing: .12em;
  }
  .footer__contact {
    font-family: var(--mono); font-size: 11px; color: var(--I70);
    letter-spacing: .04em; display: flex; gap: 24px;
  }
  .footer__open { color: var(--RED); font-weight: 700; }

  /* ── SPACER ─────────────────────────────────────────────── */
  .spacer-100 { height: 100px; }

  /* ══════════════════════════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ══════════════════════════════════════════════════════════ */

  /* ── Tablet 1024px ──────────────────────────────────────── */
  @media (max-width: 1024px) {
    .hero { padding: 28px 32px 0; }
    .services { padding: 72px 32px 0; }
    .casework, .testimonials, .speaking, .kits { padding: 72px 32px; }
    .newsletter__inner { padding: 56px 32px; }
    .press { padding: 36px 32px; }
    .footer { padding: 48px 32px 24px; }
    .hero-h1 { font-size: 64px; }
    .section-h2 { font-size: 64px; }
    .stat__num { font-size: 56px; }
    .case-card__metric { font-size: 60px; }
    .newsletter__h2 { font-size: 58px; }
  }

  /* ── Mobile 768px ──────────────────────────────────────── */
  @media (max-width: 820px) {
    /* Hero */
    .hero { padding: 24px 20px 0; }
    .ticker { font-size: 10px; }
    .hero-grid { grid-template-columns: 1fr; gap: 28px; }
    .hero-h1 { font-size: 52px; line-height: .92; }
    .hero-sub { font-size: 18px; }
    .hero-ctas { flex-direction: column; gap: 10px; }
    .btn-primary, .btn-outline { justify-content: center; padding: 16px 24px; }
    .hero-portrait { aspect-ratio: 3/2; max-height: 320px; }
    .stats-strip { grid-template-columns: repeat(2, 1fr); margin-top: 40px; }
    .stat { padding: 24px 20px; }
    .stat__num { font-size: 48px; }
    .stat:nth-child(2) { border-right: none; }
    .stat:nth-child(3) { border-right: 2px solid var(--INK); border-top: 2px solid var(--INK); }
    .stat:nth-child(4) { border-right: none; border-top: 2px solid var(--INK); }

    /* Press */
    .press { padding: 32px 20px; }
    .press__inner { flex-direction: column; gap: 20px; }
    .press__logos { gap: 16px 24px; flex-wrap: wrap; }

    /* Services */
    .services { padding: 56px 20px 0; }
    .section-h2 { font-size: 44px; }
    .services-grid { grid-template-columns: 1fr; }
    .service-card { border-right: none; border-bottom: 2px solid var(--INK); min-height: auto; }
    .service-card:last-child { border-bottom: none; }

    /* Case studies */
    .casework { padding: 56px 20px; }
    .cases-grid { grid-template-columns: 1fr; }
    .case-card { border-right: none; border-bottom: 2px solid rgba(245,197,24,.25); }
    .case-card:last-child { border-bottom: none; }
    .case-card__metric { font-size: 56px; }

    /* Testimonials */
    .testimonials { padding: 56px 20px; }
    .testi-header { flex-direction: column; gap: 14px; }
    .testi-row { grid-template-columns: 1fr; gap: 20px; padding: 32px 0; }
    .testi__quote { font-size: 21px; }

    /* Speaking */
    .speaking { padding: 56px 20px; }
    .speaking-grid { grid-template-columns: 1fr; gap: 40px; }
    .stage-row { grid-template-columns: 32px 1fr 1fr; gap: 10px; }
    .stage__city { font-size: 20px; }
    .stage__date, .stage__tag { font-size: 10px; }

    /* Kits */
    .kits { padding: 56px 20px; }
    .kits-header { flex-direction: column; gap: 14px; }
    .kits-grid { grid-template-columns: 1fr; }
    .kit-card { border-right: none; border-bottom: 2px solid var(--INK); }
    .kit-card:last-child { border-bottom: none; }
    .kit-card__paper-cols { grid-template-columns: 1fr; }

    /* Newsletter */
    .newsletter__inner { grid-template-columns: 1fr; padding: 48px 20px; gap: 36px; }
    .newsletter__h2 { font-size: 48px; }
    .newsletter__row { flex-direction: column; }
    .newsletter__input { border-right: 2px solid var(--Y); border-bottom: none; }
    .newsletter__btn { width: 100%; }

    /* Footer */
    .footer { padding: 40px 20px 24px; }
    .footer__grid { grid-template-columns: 1fr 1fr; gap: 28px; }
    .footer__bottom { flex-direction: column; gap: 12px; align-items: flex-start; }
    .footer__contact { flex-direction: column; gap: 6px; }
    .footer__wordmark { font-size: 42px; }
  }

  /* ── Small phones 480px ────────────────────────────────── */
  @media (max-width: 480px) {
    .hero-h1 { font-size: 38px; letter-spacing: -.03em; }
    .section-h2 { font-size: 36px; }
    .stats-strip { grid-template-columns: 1fr 1fr; }
    .stat__num { font-size: 36px; }
    .stat__mo { font-size: 18px; }
    .footer__grid { grid-template-columns: 1fr; }
    .footer__copy { font-size: 10px; }
    .testi__quote { font-size: 18px; }
    .newsletter__h2 { font-size: 38px; }
    .newsletter__sub { font-size: 15px; }
    .casework .section-h2 { font-size: 36px; }
    .case-card__metric { font-size: 44px; }
    .hero { padding: 20px 16px 0; }
    .services { padding: 44px 16px 0; }
    .casework, .testimonials, .speaking, .kits { padding: 44px 16px; }
    .footer { padding: 36px 16px 20px; }
    .press { padding: 28px 16px; }
    .speaking-grid .section-h2 { font-size: 40px; }
    .stage-row { grid-template-columns: 1fr; gap: 4px; }
    .stage__n { display: none; }
    .stage__city { font-size: 18px; }
  }
`;

function ScrollButtons() {
  const [atBottom, setAtBottom] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      setAtBottom(scrolled >= total - 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div style={{position:'fixed',bottom:24,right:24,zIndex:200,display:'flex',flexDirection:'column',gap:6}}>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        style={{
          width:44,height:44,background:'var(--INK)',color:'var(--Y)',border:'none',cursor:'pointer',
          fontFamily:'var(--mono)',fontSize:18,fontWeight:700,display:'flex',alignItems:'center',
          justifyContent:'center',opacity: atBottom ? 1 : 0.85,transition:'opacity .2s',
          boxShadow:'0 2px 8px rgba(0,0,0,.25)',
        }}
      >↑</button>
      <button
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
        title="Jump to bottom"
        style={{
          width:44,height:44,background:'var(--INK)',color:'var(--Y)',border:'none',cursor:'pointer',
          fontFamily:'var(--mono)',fontSize:18,fontWeight:700,display:'flex',alignItems:'center',
          justifyContent:'center',opacity: atBottom ? 0.4 : 0.85,transition:'opacity .2s',
          boxShadow:'0 2px 8px rgba(0,0,0,.25)',
        }}
      >↓</button>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />



      {/* ══ HERO ══ */}
      <header className="hero">
        {/* Credibility ticker is rendered globally via layout.tsx */}

        <div className="hero-grid">
          <div>
            <h1 className="hero-h1">
              WHY <span className="strike">PAY</span><br />
              FOR ATTENTION<br />
              WHEN YOU CAN<br />
              <span className="earn">EARN</span> IT?
            </h1>
          </div>

          <div className="hero-right">
            <p className="hero-sub">
              I help founders and brands get covered, get found, get customers.
              Without <strong>paying for attention.</strong>
            </p>
            <div className="hero-ctas">
              <a href="https://calendly.com/sia_dmr_agency/emos" target="_blank" rel="noopener noreferrer" className="btn-primary">Book a discovery call <span className="mono-arrow">→</span></a>
              <a href="/podcast" className="btn-outline">Listen to the podcast</a>
            </div>
          </div>
        </div>

        <div className="stats-strip">
          <div className="stat">
            <div className="stat__num">$1.2M</div>
            <div className="stat__label">Organic Revenue</div>
            <div className="stat__sub">NTA · $160K → $1.2M · 12 months</div>
          </div>
          <div className="stat">
            <div className="stat__num">1.5M<span className="stat__mo">&thinsp;/mo</span></div>
            <div className="stat__label">Monthly Visitors</div>
            <div className="stat__sub">Ridester · 0 → 1.5M · 12 months</div>
          </div>
          <div className="stat">
            <div className="stat__num">300+</div>
            <div className="stat__label">Clients Served</div>
            <div className="stat__sub">B2B SaaS · eComm · Tech · Media</div>
          </div>
          <div className="stat">
            <div className="stat__num">22+</div>
            <div className="stat__label">Years in the Field</div>
            <div className="stat__sub">Consulting · Agency · Speaking · Writing</div>
          </div>
        </div>
      </header>

      {/* ══ § 01 KITS / FREE RESOURCES ══ */}
      <section className="kits">
        <div className="sec-idx">
          <span className="sec-idx__n">§ 01</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">FREE RESOURCES</span>
        </div>
        <div className="kits-header">
          <div>
            <h2 className="section-h2" style={{margin:0}}>Resources.</h2>
            <p style={{fontFamily:'var(--sans)',fontWeight:700,fontSize:'18px',letterSpacing:'.04em',textTransform:'uppercase',color:'var(--I70)',marginTop:'12px',marginBottom:0}}>Tools · Kits · Playbooks · Calculators</p>
            <p style={{fontFamily:'var(--sans)',fontWeight:400,fontStyle:'italic',fontSize:'15px',color:'var(--I70)',marginTop:'6px',marginBottom:0}}>Might not stay free for too long.</p>
          </div>
          <a href="/resources" className="kits-all" style={{color:'var(--INK)'}}>18 TOTAL IN THE LIBRARY →</a>
        </div>
        <div className="kits-grid">
          <div className="kit-card">
            <div className="kit-card__badge">INTERACTIVE KIT</div>
            <div className="kit-card__paper">
              <div className="kit-card__paper-header">
                <span className="kit-card__gazette">BUREAU GAZETTE</span>
                <span className="kit-card__date">MMXXVI</span>
              </div>
              <div className="kit-card__paper-title">PITCH PERFECT</div>
              <div className="kit-card__paper-cols">
                <div className="kit-card__paper-col">The seven-step system that gets reporters to say yes</div>
                <div className="kit-card__paper-col">The SIA Bureau · Research desk · syedirfanajmal.com</div>
              </div>
            </div>
            <h3 className="kit-card__title">The Journo Outreach<br/>Checklist</h3>
            <p className="kit-card__body">Seven steps to a pitch reporters actually use.</p>
            <div className="kit-card__footer">
              <span className="kit-card__year">2026</span>
              <a href="/infographics/journo-outreach-checklist" className="kit-card__cta">OPEN THE KIT ↗</a>
            </div>
          </div>
          <div className="kit-card">
            <div className="kit-card__badge">AI-POWERED TOOL</div>
            <div className="kit-card__paper">
              <div className="kit-card__paper-header">
                <span className="kit-card__gazette">BUREAU GAZETTE</span>
                <span className="kit-card__date">MMXXVI</span>
              </div>
              <div className="kit-card__paper-title">COLLAB LINK BUILDER</div>
              <div className="kit-card__paper-cols">
                <div className="kit-card__paper-col">AI finds your best link-building partners in minutes, not weeks</div>
                <div className="kit-card__paper-col">The SIA Bureau · Research desk · syedirfanajmal.com</div>
              </div>
            </div>
            <h3 className="kit-card__title">CollabIQ</h3>
            <p className="kit-card__body">Go beyond links. Drop in your niche and CollabIQ surfaces co-marketing allies, distribution partners, and collaboration opportunities — with scoring and ready-to-send outreach.</p>
            <div className="kit-card__footer">
              <span className="kit-card__year">2026</span>
              <a href="/tools/collabiq" className="kit-card__cta">OPEN THE TOOL ↗</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ § 02 TESTIMONIALS ══ */}
      <section className="testimonials">
        <div className="sec-idx">
          <span className="sec-idx__n">§ 02</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">CLIENT WORDS</span>
        </div>
        <div className="testi-header">
          <h2 className="section-h2" style={{margin:0}}>What clients say.</h2>
          <a href="/clients" className="testi-all">06 / 24 SHOWN &nbsp;·&nbsp; ALL TESTIMONIALS →</a>
        </div>

        {/* № 01 — Brett Helling */}
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 01</div>
            <div className="testi__badge">0 → 1.5M MONTHLY UVs</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Their expertise at doing customized outreach and earning quality whitehat backlinks day in and day out was critical to our phenomenal success and growth.<span className="q">"</span>
          </blockquote>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/testimonials/brett-helling.jpeg" alt="Brett Helling" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',marginBottom:12,flexShrink:0}} />
            <div className="testi__name">Brett Helling</div>
            <div className="testi__role">CEO, Ridester.com / TrendlineSEO · USA</div>
          </div>
        </div>

        {/* № 02 — Imani Lea Brown */}
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 02</div>
            <div className="testi__badge">6× DAILY SIGNUPS</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>120% increase in organic traffic. Our Public Database clicks jumped 515% and impressions from 30K to 198K — resulting in six times more average daily signups.<span className="q">"</span>
          </blockquote>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/testimonials/imani-lea-brown.jpg" alt="Imani Lea Brown" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',marginBottom:12,flexShrink:0}} />
            <div className="testi__name">Imani Lea Brown</div>
            <div className="testi__role">Centriq (raised $11M) · USA</div>
          </div>
        </div>

        {/* № 03 — Azzam Sheikh */}
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 03</div>
            <div className="testi__badge">160K/mo · #4 GOOGLE</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Ranked a keyword to #4 on Google that gets over 160,000 searches a month. Commercial intent. Can&apos;t thank Irfan and the team enough.<span className="q">"</span>
          </blockquote>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/testimonials/azzam-sheikh.jpeg" alt="Azzam Sheikh" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',marginBottom:12,flexShrink:0}} />
            <div className="testi__name">Azzam Sheikh</div>
            <div className="testi__role">National Tyres &amp; Autocare · UK</div>
          </div>
        </div>

        {/* № 04 — Reem El Shafaki */}
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 04</div>
            <div className="testi__badge">140% TRAFFIC · 3 MONTHS</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Traffic increased 140% in 3 months — against a goal of 25% in 9 months. Page views up 102%. Impressions up 65%. They simply overdelivered.<span className="q">"</span>
          </blockquote>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/testimonials/reem-el-shafaki.jpg" alt="Reem El Shafaki" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',marginBottom:12,flexShrink:0}} />
            <div className="testi__name">Reem El Shafaki</div>
            <div className="testi__role">DinarStandard · UAE</div>
          </div>
        </div>

        {/* № 05 — Brie Moreau */}
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 05</div>
            <div className="testi__badge">DMSS.IO BALI · WORKSHOP</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Syed spoke at our conference and gave me a private consultation on media exposure. An excellent public speaker with highly actionable advice. Comes highly recommended.<span className="q">"</span>
          </blockquote>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/testimonials/brie-moreau.jpg" alt="Brie Moreau" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',marginBottom:12,flexShrink:0}} />
            <div className="testi__name">Brie Moreau</div>
            <div className="testi__role">Co-founder, DMSS.io Conference · Bali</div>
          </div>
        </div>

        {/* № 06 — Chuck Wang */}
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 06</div>
            <div className="testi__badge">PODCAST GUEST</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Being a great speaker takes art and science, experience, and personal clarity. Irfan delivers on all of it and it is hard not to like the guy.<span className="q">"</span>
          </blockquote>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/testimonials/chuck-wang.jpg" alt="Chuck Wang" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',marginBottom:12,flexShrink:0}} />
            <div className="testi__name">Chuck Wang</div>
            <div className="testi__role">The MVP Marketing Podcast · USA</div>
          </div>
        </div>
      </section>

      {/* ══ § 03 CASE STUDIES ══ */}
      <section className="casework">
        <div className="sec-idx sec-idx--dark">
          <span className="sec-idx__n">§ 03</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">SELECTED CASEWORK</span>
        </div>
        <h2 className="section-h2">Selected casework.<br/><em>Biggest numbers first.</em></h2>
        <div className="cases-grid">
          <div className="case-card">
            <div className="case-card__tag">SEO CONTENT</div>
            <div className="case-card__metric">1.5M<span className="case-card__metric-mo">&thinsp;/mo</span></div>
            <div className="case-card__client">RIDESTER · USA</div>
            <div className="case-card__result">Zero to 1.5M organic visitors in 12 months</div>
            <p className="case-card__body">Built a content-led SEO strategy from scratch. Took a brand-new domain to 1.5M monthly visitors in under a year through editorial content and strategic link acquisition.</p>
            <a href="/clients" className="case-card__link">Full case study →</a>
          </div>
          <div className="case-card">
            <div className="case-card__tag">SEO · DIGITAL PR</div>
            <div className="case-card__metric">$1.2M</div>
            <div className="case-card__client">NATIONAL TYRES · UK</div>
            <div className="case-card__result">$160K → $1.2M organic revenue in 12 months</div>
            <p className="case-card__body">Turned a struggling content program into a revenue machine. Combined editorial SEO with Digital PR to rank high-intent keywords and drive traffic that converts at scale.</p>
            <a href="/clients" className="case-card__link">Full case study →</a>
          </div>
        </div>
      </section>

      {/* ══ CTA TICKER ══ */}
      <CTATicker />

      {/* ══ § 03 SPEAKING ══ */}
      <section className="speaking">
        <div className="sec-idx sec-idx--dark">
          <span className="sec-idx__n">§ 04</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">SPEAKING &amp; TRAINING</span>
        </div>
        <div className="speaking-grid">
          <div>
            <h2 className="section-h2" style={{color:'var(--BG)',fontSize:'72px',marginBottom:0}}>
              Stages across<br/>four countries.
            </h2>
            <div className="speaking-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/speaking/mps2016.jpg" alt="Syed Irfan Ajmal speaking at MPS2016 Dubai" />
              <div className="speaking-photo__caption">MPS2016 · DUBAI, UAE</div>
            </div>
            <p className="speaking__sub">Keynotes for diverse audiences in Malaysia, Indonesia, the UAE, and Pakistan. Webinars for American and British listeners. Fifteen+ guest spots on US podcasts.</p>
            <a href="/speaking" className="speaking__cta">Speaker sheet &amp; topics <span className="mono-arrow">→</span></a>
          </div>
          <div>
            <div className="stage-row">
              <div className="stage__n">01</div><div className="stage__city">KUALA LUMPUR</div>
              <div className="stage__ctry">Malaysia</div>
              <div className="stage__tag">WEBINARS · WORKSHOPS</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">02</div><div className="stage__city">BALI</div>
              <div className="stage__ctry">Indonesia</div>
              <div className="stage__tag">DMSS · 200+ AUDIENCE</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">03</div><div className="stage__city">PESHAWAR</div>
              <div className="stage__ctry">Pakistan</div>
              <div className="stage__tag">G-DAY X · DURSHAL</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">04</div><div className="stage__city">DUBAI</div>
              <div className="stage__ctry">UAE</div>
              <div className="stage__tag">ATM · IN5 · MPS2016</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">05</div><div className="stage__city">WEBINARS</div>
              <div className="stage__ctry">US / UK</div>
              <div className="stage__tag">12+ SESSIONS</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">06</div><div className="stage__city">US PODCASTS</div>
              <div className="stage__ctry">Remote</div>
              <div className="stage__tag">15+ GUEST SPOTS</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ § 05 SERVICES ══ */}
      <section className="services">
        <div className="sec-idx">
          <span className="sec-idx__n">§ 05</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">WHAT I DO</span>

        </div>
        <h2 className="section-h2">Three ways to work,<br/>plainly stated.</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-card__num">01</div>
            <h3 className="service-card__title">EMOS · Earned Media OS</h3>
            <p className="service-card__body">A productized system for landing editorial coverage — trainings, templates, journalist playbooks. For in-house teams who want the press wins without the agency retainer.</p>
            <a href="/emos" className="service-card__cta">Tour EMOS →</a>
          </div>
          <div className="service-card">
            <div className="service-card__num">02</div>
            <h3 className="service-card__title">Fractional CMO</h3>
            <p className="service-card__body">For founders without a marketing leader. Weekly cadence, full strategy ownership, agency-level execution through DMR. You get a senior brain without the full-time price tag.</p>
            <a href="/fractional-cmo" className="service-card__cta">Inquire →</a>
          </div>
          <div className="service-card">
            <div className="service-card__num">03</div>
            <h3 className="service-card__title">Done-For-You Agency</h3>
            <p className="service-card__body">For GEO, SEO-PR, and content marketing projects handled end-to-end. Strategy, execution, reporting — all done by the team at DMR.agency.</p>
            <a href="https://dmr.agency" target="_blank" rel="noopener noreferrer" className="service-card__cta">Visit DMR.agency ↗</a>
          </div>
        </div>
        <div className="spacer-100"></div>
      </section>

      {/* ══ § 06 NEWSLETTER ══ */}
      <Subscriptions sectionNumber="06" />


      {/* ══ SCROLL BUTTONS ══ */}
      <ScrollButtons />

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="footer__grid">
          <div>
            <div className="footer__wordmark">SIA.</div>
            <p className="footer__about">
              Syed Irfan Ajmal award-winning marketing consultant, author,
              speaker, and CEO of <strong>DMR.agency</strong>.
            </p>
          </div>
          <div>
            <div className="footer__col-head">THE WORK</div>
            <ul className="footer__links">
              <li><a href="/fractional-cmo" className="footer__link">Fractional CMO</a></li>
              <li><a href="/speaking" className="footer__link">Speaking</a></li>
              <li><a href="/emos" className="footer__link">EMOS</a></li>
              <li><a href="https://dmr.agency" target="_blank" rel="noopener noreferrer" className="footer__link">DMR.agency ↗</a></li>
              <li><a href="/ventures" className="footer__link">Ventures</a></li>
              <li><a href="/clients" className="footer__link">Clients</a></li>
            </ul>
          </div>
          <div>
            <div className="footer__col-head">NAVIGATE</div>
            <ul className="footer__links">
              <li><a href="/" className="footer__link">Home</a></li>
              <li><a href="/resources" className="footer__link">Resources</a></li>
              <li><a href="/about" className="footer__link">About</a></li>
              <li><a href="/podcast" className="footer__link">Podcast</a></li>
              <li><a href="/gallery" className="footer__link">Gallery</a></li>
              <li><a href="/newsletter" className="footer__link">Newsletter</a></li>
            </ul>
          </div>
          <div>
            <div className="footer__col-head">ELSEWHERE</div>
            <ul className="footer__links">
              <li><a href="https://x.com/syedirfanajmal" target="_blank" rel="noopener noreferrer" className="footer__link">Twitter / X ↗</a></li>
              <li><a href="https://www.linkedin.com/in/syedirfanajmal/" target="_blank" rel="noopener noreferrer" className="footer__link">LinkedIn ↗</a></li>
              <li><a href="https://youtube.com/@syedirfanajmal/" target="_blank" rel="noopener noreferrer" className="footer__link">YouTube ↗</a></li>
              <li><a href="https://podcasts.apple.com/us/podcast/syed-irfan-ajmal/id1347540466" target="_blank" rel="noopener noreferrer" className="footer__link">Apple Podcasts ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="footer__copy">© 2026 SYED IRFAN AJMAL · SIA ENTERPRISES INC · WYOMING C-CORP</div>
          <div className="footer__contact">
            <span>SIA[@]SYEDIRFANAJMAL[DOT]COM</span>
            <a href="/fractional-cmo" className="footer__open">● 1 FRACTIONAL CMO SPOT · Q3 2026</a>
            <a href="https://dmr.agency/earnedmediaos/" target="_blank" rel="noopener noreferrer" className="footer__open">● EMOS FOUNDING CLASS · APPLY NOW</a>
          </div>
        </div>
      </footer>
    </>
  );
}
