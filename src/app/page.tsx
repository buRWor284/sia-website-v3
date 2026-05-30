'use client';
import { useEffect, useState } from 'react';

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

  /* ── BUREAU MASTHEAD NAV ────────────────────────────────── */
  .nav {
    background: var(--INK); color: #f1ebde;
    position: sticky; top: 0; z-index: 100;
  }
  .nav__top {
    display: grid; grid-template-columns: auto 1fr auto;
    align-items: center; gap: 24px;
    padding: 16px 56px 14px;
    border-bottom: 1px solid rgba(241,235,222,.12);
  }
  .nav__logo { display: flex; align-items: center; gap: 12px; }
  .nav__mark {
    width: 30px; height: 30px; background: var(--Y);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--sans); font-weight: 900; font-size: 13px;
    color: var(--INK); flex: 0 0 auto;
  }
  .nav__wordmark {
    font-family: 'Newsreader', Georgia, serif; font-weight: 700;
    font-size: 17px; color: #f1ebde; letter-spacing: -0.01em; line-height: 1;
  }
  .nav__sub {
    font-family: var(--sans); font-weight: 700; font-size: 8.5px;
    letter-spacing: .22em; text-transform: uppercase;
    color: rgba(241,235,222,.45); margin-top: 3px;
  }
  .nav__wire { text-align: center; }
  .nav__wire-label {
    font-family: var(--sans); font-weight: 700; font-size: 9px;
    letter-spacing: .22em; text-transform: uppercase;
    color: rgba(241,235,222,.5);
  }
  .nav__wire-date {
    font-family: 'Newsreader', Georgia, serif; font-style: italic;
    font-size: 13px; color: rgba(241,235,222,.4); margin-top: 3px;
  }
  .nav__status {
    font-family: var(--sans); font-weight: 700; font-size: 9px;
    letter-spacing: .16em; text-transform: uppercase;
    color: rgba(241,235,222,.4); text-align: right;
  }
  .nav__bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 11px 56px;
  }
  .nav__links { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
  .nav__link {
    font-family: var(--sans); font-size: 10px; font-weight: 700;
    letter-spacing: .16em; text-transform: uppercase;
    color: rgba(241,235,222,.5); transition: color .12s;
  }
  .nav__link:hover, .nav__link--active { color: #f1ebde; }
  .nav__cta {
    font-family: var(--sans); font-weight: 800; font-size: 10px;
    letter-spacing: .12em; text-transform: uppercase;
    background: var(--Y); color: var(--INK);
    padding: 8px 15px; white-space: nowrap;
    transition: background .12s;
  }
  .nav__cta:hover { background: var(--Y2); }

  /* ── HERO ───────────────────────────────────────────────── */
  .hero { background: var(--BG); padding: 36px 56px 0; }

  @keyframes ticker-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .ticker {
    border-top: 2px solid var(--INK); border-bottom: 2px solid var(--INK);
    padding: 11px 0; margin-bottom: 44px;
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

  .hero-grid {
    display: grid; grid-template-columns: 1.55fr 0.7fr;
    gap: 48px; align-items: end;
  }
  .hero-kicker {
    font-family: var(--mono); font-size: 12px; letter-spacing: .18em;
    color: var(--INK); margin-bottom: 22px; font-weight: 600;
  }
  .hero-h1 {
    font-family: var(--sans); font-weight: 900; font-size: 82px;
    line-height: .9; letter-spacing: -.04em; color: var(--INK);
    text-transform: uppercase;
  }
  .hero-h1 em {
    font-style: normal;
    text-decoration: underline;
    text-decoration-color: var(--RED);
    text-underline-offset: 8px;
    text-decoration-thickness: 5px;
  }
  .hero-sub {
    margin-top: 32px;
    font-family: var(--sans); font-size: 21px; font-weight: 500;
    color: var(--INK); line-height: 1.45; max-width: 600px;
  }
  .hero-sub strong { font-weight: 900; font-style: italic; }
  .hero-ctas { display: flex; gap: 14px; margin-top: 36px; }

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

  /* portrait */
  .hero-portrait {
    width: 100%; aspect-ratio: 4/5;
    background: #d8cebc; border: 3px solid var(--INK);
    position: relative; overflow: hidden;
  }
  .hero-portrait svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .portrait-badge {
    position: absolute; padding: 7px 12px;
    font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: .12em;
  }
  .portrait-badge--tl { top: 14px; left: 14px; background: var(--INK); color: var(--Y); }
  .portrait-badge--br {
    bottom: 14px; right: 14px;
    background: var(--INK); color: var(--Y); border: 2px solid var(--INK);
  }

  /* ── STATS STRIP ────────────────────────────────────────── */
  .stats-strip {
    margin-top: 64px;
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-top: 2px solid var(--INK); border-bottom: 2px solid var(--INK);
  }
  .stat {
    padding: 36px 28px;
    border-right: 2px solid var(--INK);
  }
  .stat:last-child { border-right: none; }
  .stat__num {
    font-family: var(--sans); font-weight: 900; font-size: 72px; color: var(--INK);
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
    display: grid; grid-template-columns: repeat(3, 1fr);
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
    font-family: var(--mono); font-size: 11px; color: rgba(245,197,24,.55);
    letter-spacing: .12em; margin-top: 12px; text-transform: uppercase;
  }
  .case-card__result {
    font-family: var(--sans); font-weight: 800; font-size: 21px;
    color: var(--Y); line-height: 1.12; letter-spacing: -.01em;
    margin-top: 18px;
  }
  .case-card__body {
    font-family: var(--sans); font-size: 15px; color: rgba(245,197,24,.62);
    line-height: 1.55; margin-top: 14px; flex: 1;
  }
  .case-card__link {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 28px; font-family: var(--mono); font-size: 11px;
    font-weight: 700; color: var(--RED); letter-spacing: .12em;
    text-transform: uppercase; border-bottom: 1px solid var(--RED);
    padding-bottom: 3px; align-self: flex-start;
  }
  .case-card__link:hover { color: var(--Y); border-color: var(--Y); }

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
  .speaking { background: var(--INK); padding: 100px 56px; color: var(--Y); }
  .speaking-grid { display: grid; grid-template-columns: 1fr 1.45fr; gap: 80px; }
  .speaking__sub {
    margin-top: 26px; font-family: var(--sans); font-size: 18px;
    color: rgba(245,197,24,.72); line-height: 1.55; max-width: 440px;
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
    display: grid; grid-template-columns: 40px 1.6fr 1fr 1.1fr 1.2fr;
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
     MOBILE NAV HAMBURGER
  ══════════════════════════════════════════════════════════ */
  .nav__hamburger {
    display: none; background: none; border: none; cursor: pointer;
    padding: 14px 20px; color: #f1ebde;
    font-family: var(--sans); font-size: 10px; font-weight: 700;
    letter-spacing: .16em; text-transform: uppercase;
    align-items: center; gap: 10px;
  }
  .nav__mobile-menu {
    display: none; flex-direction: column;
    border-top: 1px solid rgba(241,235,222,.12);
    padding: 8px 20px 16px;
  }
  .nav__mobile-menu.open { display: flex; }
  .nav__mobile-link {
    padding: 12px 0; border-bottom: 1px solid rgba(241,235,222,.10);
    font-family: var(--sans); font-size: 15px; font-weight: 600;
    color: rgba(241,235,222,.8); text-decoration: none;
  }
  .nav__mobile-link:hover { color: #f1ebde; }
  .nav__mobile-cta {
    margin-top: 14px; padding: 14px 20px; background: var(--Y); color: var(--INK);
    text-align: center; font-family: var(--sans); font-weight: 800;
    font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
    text-decoration: none; display: block;
  }

  /* ══════════════════════════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ══════════════════════════════════════════════════════════ */

  /* ── Tablet 1024px ──────────────────────────────────────── */
  @media (max-width: 1024px) {
    .nav__top, .nav__bar { padding-left: 32px; padding-right: 32px; }
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
    /* Nav — show hamburger, hide desktop bar */
    .nav__top { grid-template-columns: 1fr auto; padding: 14px 20px; }
    .nav__wire { display: none; }
    .nav__bar { display: none; }
    .nav__hamburger { display: flex; }

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
    .nav__top { padding: 12px 16px; }
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

export default function HomePage() {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const d = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const el = document.getElementById('wire-date');
    if (el) el.textContent = `Est. 2004 · Global · ${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }, []);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ══ NAV ══ */}
      <header className="nav">
        <div className="nav__top">
          <div className="nav__logo">
            <div className="nav__mark">SIA</div>
            <div>
              <div className="nav__wordmark">Syed Irfan Ajmal</div>
              <div className="nav__sub">SEO-PR &nbsp;·&nbsp; GEO &nbsp;·&nbsp; Content Marketing</div>
            </div>
          </div>
          <div className="nav__wire">
            <div className="nav__wire-label">The SIA Wire</div>
            <div className="nav__wire-date" id="wire-date">Est. 2004 · Global</div>
          </div>
          <div className="nav__status">Open for projects, Q3 2026</div>
        </div>

        {/* Desktop nav row */}
        <div className="nav__bar">
          <nav className="nav__links">
            <a href="/" className="nav__link nav__link--active">Home</a>
            <a href="/about" className="nav__link">About</a>
            <a href="/speaking" className="nav__link">Speaking</a>
            <a href="/emos" className="nav__link">EMOS</a>
            <a href="/fractional-cmo" className="nav__link">Fractional CMO</a>
            <a href="/resources" className="nav__link">Resources</a>
            <a href="/contact" className="nav__link">Contact</a>
          </nav>
          <a href="https://calendly.com/sia_dmr_agency/emos" target="_blank" rel="noopener noreferrer" className="nav__cta">Book a discovery call &rarr;</a>
        </div>

        {/* Mobile hamburger */}
        <button className="nav__hamburger" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation">
          {navOpen ? '✕' : '☰'}&nbsp;&nbsp;{navOpen ? 'CLOSE' : 'MENU'}
        </button>

        {/* Mobile dropdown */}
        <nav className={`nav__mobile-menu${navOpen ? ' open' : ''}`}>
          <a href="/" className="nav__mobile-link" onClick={() => setNavOpen(false)}>Home</a>
          <a href="/about" className="nav__mobile-link" onClick={() => setNavOpen(false)}>About</a>
          <a href="/speaking" className="nav__mobile-link" onClick={() => setNavOpen(false)}>Speaking</a>
          <a href="/emos" className="nav__mobile-link" onClick={() => setNavOpen(false)}>EMOS</a>
          <a href="/fractional-cmo" className="nav__mobile-link" onClick={() => setNavOpen(false)}>Fractional CMO</a>
          <a href="/resources" className="nav__mobile-link" onClick={() => setNavOpen(false)}>Resources</a>
          <a href="/contact" className="nav__mobile-link" onClick={() => setNavOpen(false)}>Contact</a>
          <a href="https://calendly.com/sia_dmr_agency/emos" target="_blank" rel="noopener noreferrer" className="nav__mobile-cta">Book a discovery call →</a>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <header className="hero">
        <div className="ticker" aria-label="Open for projects · Publications · Speaking">
          {[0, 1].map((i) => (
            <span key={i} className="ticker-track" aria-hidden={i > 0 ? true : undefined}>
              <span className="ticker__dot">●</span>
              <span className="ticker__bold">OPEN FOR PROJECTS · Q3 2026</span>
              <span className="ticker__sep">&nbsp;////&nbsp;</span>
              <span>FORBES · HBR · HUFFPOST · SEMRUSH · ENTREPRENEUR · WORLD BANK · TNW</span>
              <span className="ticker__sep">&nbsp;////&nbsp;</span>
              <span>SPOKEN IN PK · MY · ID · AE</span>
              <span className="ticker__sep">&nbsp;////&nbsp;</span>
              <span>4 PODCAST SEASONS</span>
              <span className="ticker__sep">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </span>
          ))}
        </div>

        <div className="hero-grid">
          <div>
            <p className="hero-kicker">[ DIGITAL PR · SEO · EARNED MEDIA ]</p>
            <h1 className="hero-h1">
              WHY PAY<br />
              FOR ATTENTION<br />
              WHEN YOU CAN<br />
              <em>EARN</em> IT?
            </h1>
            <p className="hero-sub">
              I help founders and brands get covered, get found, get customers.
              Without <strong>paying for attention.</strong>
            </p>
            <div className="hero-ctas">
              <a href="https://calendly.com/sia_dmr_agency/emos" target="_blank" rel="noopener noreferrer" className="btn-primary">Book a discovery call <span className="mono-arrow">→</span></a>
              <a href="/podcast" className="btn-outline">Listen to the podcast</a>
            </div>
          </div>

          <figure className="hero-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/headshot.jpg" alt="Syed Irfan Ajmal" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center'}} />
            <div className="portrait-badge portrait-badge--tl">HELLO.</div>
            <div className="portrait-badge portrait-badge--br" style={{fontSize:'9px',lineHeight:1.4}}>PESHAWAR to<br/>STOCKHOLM &amp; BACK</div>
          </figure>
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
            <div className="stat__sub">22+ countries · since 2004</div>
          </div>
          <div className="stat">
            <div className="stat__num">22+</div>
            <div className="stat__label">Years in the Field</div>
            <div className="stat__sub">Digital PR · SEO · Earned Media</div>
          </div>
        </div>
      </header>

      {/* ══ PRESS BAND ══ */}
      <section className="press">
        <div className="press__inner">
          <div className="press__tag">AS&nbsp;SEEN&nbsp;ON&nbsp;<span style={{color:'var(--RED)'}}>→</span></div>
          <div className="press__logos">
            <div style={{fontFamily:"'Georgia',serif",fontWeight:900,fontSize:'26px',color:'#fff',letterSpacing:'-.01em'}}>Forbes</div>
            <div style={{fontFamily:'var(--sans)',fontWeight:700,fontSize:'19px',color:'#fff'}}>business.com</div>
            <div style={{fontFamily:'var(--sans)',fontWeight:900,fontSize:'18px',color:'#fff',letterSpacing:'.03em'}}>HUFFPOST</div>
            <div style={{fontFamily:'var(--sans)',fontWeight:700,fontSize:'22px',color:'var(--RED)',fontStyle:'italic'}}>semrush</div>
            <div style={{fontFamily:"'Georgia',serif",fontWeight:700,fontSize:'21px',color:'#fff',fontStyle:'italic'}}>Entrepreneur</div>
            <div style={{fontFamily:'var(--sans)',fontWeight:900,fontSize:'23px',color:'#fff',fontStyle:'italic'}}>Virgin</div>
            <div style={{fontFamily:'var(--sans)',fontWeight:900,fontSize:'23px',color:'#fff'}}>tnw</div>
            <div style={{fontFamily:'var(--sans)',fontWeight:600,fontSize:'12.5px',color:'rgba(255,255,255,.75)',letterSpacing:'.10em'}}>THE WORLD BANK</div>
            <div style={{fontFamily:"'Georgia',serif",fontWeight:900,fontSize:'22px',color:'#fff',letterSpacing:'.05em'}}>HBR</div>
          </div>
        </div>
      </section>

      {/* ══ § 01 SERVICES ══ */}
      <section className="services">
        <div className="sec-idx">
          <span className="sec-idx__n">§ 01</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">WHAT I DO</span>
        </div>
        <h2 className="section-h2">Three ways to work,<br/>plainly stated.</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-card__num">01</div>
            <h3 className="service-card__title">Digital PR &amp; Earned Media</h3>
            <p className="service-card__body">Land bylines and quotes in publications your buyers actually read Forbes, HBR, HuffPost, niche trade press. HARO, journalist outreach, story design. No fluff, no directories nobody clicks.</p>
            <a href="/clients" className="service-card__cta">View case studies →</a>
          </div>
          <div className="service-card">
            <div className="service-card__num">02</div>
            <h3 className="service-card__title">EMOS · Earned Media OS</h3>
            <p className="service-card__body">A productized system for landing editorial coverage trainings, templates, journalist playbooks. For in-house teams who want the press wins without the agency retainer.</p>
            <a href="/emos" className="service-card__cta">Tour EMOS →</a>
          </div>
          <div className="service-card">
            <div className="service-card__num">03</div>
            <h3 className="service-card__title">Fractional CMO</h3>
            <p className="service-card__body">For founders without a marketing leader. Weekly cadence, full strategy ownership, agency-level execution through DMR. You get a senior brain without the full-time price tag.</p>
            <a href="/fractional-cmo" className="service-card__cta">Inquire →</a>
          </div>
        </div>
        <div className="spacer-100"></div>
      </section>

      {/* ══ § 02 CASE STUDIES ══ */}
      <section className="casework">
        <div className="sec-idx sec-idx--dark">
          <span className="sec-idx__n">§ 02</span>
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
          <div className="case-card">
            <div className="case-card__tag">DIGITAL PR</div>
            <div className="case-card__metric">$2.3M</div>
            <div className="case-card__client">MELANIE MARTIN</div>
            <div className="case-card__result">$2.3M in attributable PR campaign ROI</div>
            <p className="case-card__body">Designed and executed a story-driven digital PR campaign that earned editorial coverage in major outlets and converted directly to pipeline and revenue zero ad spend.</p>
            <a href="/clients" className="case-card__link">Full case study →</a>
          </div>
        </div>
      </section>

      {/* ══ § 03 TESTIMONIALS ══ */}
      <section className="testimonials">
        <div className="sec-idx">
          <span className="sec-idx__n">§ 03</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">CLIENT WORDS</span>
        </div>
        <div className="testi-header">
          <h2 className="section-h2" style={{margin:0}}>What clients say.</h2>
          <a href="/clients" className="testi-all">04 / 24 SHOWN &nbsp;·&nbsp; ALL TESTIMONIALS →</a>
        </div>
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 01</div>
            <div className="testi__badge">160K/mo · #4 GOOGLE</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Ranked a keyword to #4 on Google that gets over 160,000 searches a month. Commercial intent. Can&apos;t thank Irfan and the team enough.<span className="q">"</span>
          </blockquote>
          <div>
            <div style={{width:44,height:44,background:'var(--INK)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,flexShrink:0}}>
              <span style={{fontFamily:'var(--sans)',fontWeight:900,fontSize:15,color:'var(--BG)',letterSpacing:'-.01em'}}>AS</span>
            </div>
            <div className="testi__name">Azzam Sheikh</div>
            <div className="testi__role">National Tyres &amp; Autocare · UK</div>
          </div>
        </div>
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 02</div>
            <div className="testi__badge">CONTENT &amp; SEO</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Highly knowledgeable about content marketing and SEO. Ideas and execution both cutting-edge strategic doesn&apos;t lose sight of what matters.<span className="q">"</span>
          </blockquote>
          <div>
            <div style={{width:44,height:44,background:'var(--INK)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,flexShrink:0}}>
              <span style={{fontFamily:'var(--sans)',fontWeight:900,fontSize:15,color:'var(--BG)',letterSpacing:'-.01em'}}>LZ</span>
            </div>
            <div className="testi__name">Lisa Zahran</div>
            <div className="testi__role">Copy &amp; Coffee · Malaysia</div>
          </div>
        </div>
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 03</div>
            <div className="testi__badge">TOP 100 DIGITAL MARKETER</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>One of the good guys. Knows digital marketing inside out his expertise and growth in this area is exemplary.<span className="q">"</span>
          </blockquote>
          <div>
            <div style={{width:44,height:44,background:'var(--INK)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,flexShrink:0}}>
              <span style={{fontFamily:'var(--sans)',fontWeight:900,fontSize:15,color:'var(--BG)',letterSpacing:'-.01em'}}>SH</span>
            </div>
            <div className="testi__name">Sam Hurley</div>
            <div className="testi__role">OPTIM-EYEZ · UK</div>
          </div>
        </div>
        <div className="testi-row">
          <div>
            <div className="testi__num">№ 04</div>
            <div className="testi__badge">PODCAST GUEST</div>
          </div>
          <blockquote className="testi__quote">
            <span className="q">"</span>Being a great speaker takes art and science, experience, and personal clarity. Irfan delivers on all of it and it is hard not to like the guy.<span className="q">"</span>
          </blockquote>
          <div>
            <div style={{width:44,height:44,background:'var(--INK)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,flexShrink:0}}>
              <span style={{fontFamily:'var(--sans)',fontWeight:900,fontSize:15,color:'var(--BG)',letterSpacing:'-.01em'}}>CW</span>
            </div>
            <div className="testi__name">Chuck Wang</div>
            <div className="testi__role">The MVP Marketing Podcast · USA</div>
          </div>
        </div>
      </section>

      {/* ══ § 04 SPEAKING ══ */}
      <section className="speaking">
        <div className="sec-idx sec-idx--dark">
          <span className="sec-idx__n">§ 04</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">SPEAKING &amp; TRAINING</span>
        </div>
        <div className="speaking-grid">
          <div>
            <h2 className="section-h2" style={{color:'var(--Y)',fontSize:'72px',marginBottom:0}}>
              Stages across<br/>four countries.
            </h2>
            <p className="speaking__sub">Keynotes for diverse audiences in Malaysia, Indonesia, the UAE, and Pakistan. Webinars for American and British listeners. Fifteen+ guest spots on US podcasts.</p>
            <a href="/speaking" className="speaking__cta">Speaker sheet &amp; topics <span className="mono-arrow">→</span></a>
          </div>
          <div>
            <div className="stage-row">
              <div className="stage__n">01</div><div className="stage__city">PESHAWAR</div>
              <div className="stage__ctry">Pakistan</div><div className="stage__date">2013 to present</div>
              <div className="stage__tag">G-DAY X · DURSHAL</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">02</div><div className="stage__city">KUALA LUMPUR</div>
              <div className="stage__ctry">Malaysia</div><div className="stage__date">2016 to 2019</div>
              <div className="stage__tag">WEBINARS · WORKSHOPS</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">03</div><div className="stage__city">BALI</div>
              <div className="stage__ctry">Indonesia</div><div className="stage__date">2016</div>
              <div className="stage__tag">DMSS · 200+ AUDIENCE</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">04</div><div className="stage__city">DUBAI</div>
              <div className="stage__ctry">UAE</div><div className="stage__date">2016 to 2018</div>
              <div className="stage__tag">ATM · IN5 · MPS2016</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">05</div><div className="stage__city">WEBINARS</div>
              <div className="stage__ctry">US / UK</div><div className="stage__date">2017 to present</div>
              <div className="stage__tag">12+ SESSIONS</div>
            </div>
            <div className="stage-row">
              <div className="stage__n">06</div><div className="stage__city">US PODCASTS</div>
              <div className="stage__ctry">Remote</div><div className="stage__date">2018 to present</div>
              <div className="stage__tag">15+ GUEST SPOTS</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ § 05 KITS / FREE RESOURCES ══ */}
      <section className="kits">
        <div className="sec-idx">
          <span className="sec-idx__n">§ 05</span>
          <div className="sec-idx__rule"></div>
          <span className="sec-idx__label">FREE RESOURCES</span>
        </div>
        <div className="kits-header">
          <h2 className="section-h2" style={{margin:0}}>Resources. Tools, Kits,<br/>Playbooks, Calculators.<br/><span style={{fontSize:'55%',fontWeight:400,fontStyle:'italic',color:'var(--I70)'}}>Might not stay free for too long.</span></h2>
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
            <div className="kit-card__badge">INTERACTIVE KIT</div>
            <div className="kit-card__paper">
              <div className="kit-card__paper-header">
                <span className="kit-card__gazette">BUREAU GAZETTE</span>
                <span className="kit-card__date">MMXXVI</span>
              </div>
              <div className="kit-card__paper-title">WRITING IS MEDICINE</div>
              <div className="kit-card__paper-cols">
                <div className="kit-card__paper-col">Science confirms what the Ancients knew about the written word</div>
                <div className="kit-card__paper-col">The SIA Bureau · Research desk · syedirfanajmal.com</div>
              </div>
            </div>
            <h3 className="kit-card__title">Top 11 Scientific Benefits<br/>of <em>Writing</em></h3>
            <p className="kit-card__body">Eleven research-backed findings. Each with a prescription.</p>
            <div className="kit-card__footer">
              <span className="kit-card__year">2019 · UPD. 2026</span>
              <a href="/infographics/writing-benefits" className="kit-card__cta">OPEN THE KIT ↗</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ § 06 NEWSLETTER ══ */}
      <section className="newsletter">
        <div className="stripe"></div>
        <div className="newsletter__inner">
          <div>
            <div className="sec-idx sec-idx--dark">
              <span className="sec-idx__n">§ 06</span>
              <div className="sec-idx__rule"></div>
              <span className="sec-idx__label">INNER CIRCLE</span>
            </div>
            <h2 className="newsletter__h2">Join 4,800<br/>marketers<br/>reading the<br/>newsletter.</h2>
            <p className="newsletter__sub">1-2 emails a month. Real case studies, the campaigns I&apos;m building right now, and zero filler. Unsubscribe whenever.</p>
          </div>
          <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <div className="newsletter__row">
              <input className="newsletter__input" type="email" placeholder="you@yourcompany.com" />
              <button className="newsletter__btn" type="submit">Subscribe →</button>
            </div>
            <div className="newsletter__note">
              NO SPAM · UNSUBSCRIBE IN ONE CLICK · POWERED BY <span>MAILMUNCH</span>
            </div>
          </form>
        </div>
        <div className="stripe"></div>
      </section>

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
            <div className="footer__col-head">SITE</div>
            <ul className="footer__links">
              <li><a href="/" className="footer__link">Home</a></li>
              <li><a href="/about" className="footer__link">About</a></li>
              <li><a href="/speaking" className="footer__link">Speaking</a></li>
              <li><a href="/podcast" className="footer__link">Podcast</a></li>
              <li><a href="/blog" className="footer__link">Blog</a></li>
              <li><a href="/contact" className="footer__link">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="footer__col-head">WORK</div>
            <ul className="footer__links">
              <li><a href="/clients" className="footer__link">Digital PR</a></li>
              <li><a href="/clients" className="footer__link">SEO Content</a></li>
              <li><a href="/fractional-cmo" className="footer__link">Fractional CMO</a></li>
              <li><a href="/speaking" className="footer__link">Keynotes</a></li>
              <li><a href="/clients" className="footer__link">Case studies</a></li>
            </ul>
          </div>
          <div>
            <div className="footer__col-head">ELSEWHERE</div>
            <ul className="footer__links">
              <li><a href="https://twitter.com/irfanajmal" target="_blank" rel="noopener noreferrer" className="footer__link">Twitter / X</a></li>
              <li><a href="https://linkedin.com/in/syedirfanajmal" target="_blank" rel="noopener noreferrer" className="footer__link">LinkedIn</a></li>
              <li><a href="https://youtube.com/@syedirfanajmal" target="_blank" rel="noopener noreferrer" className="footer__link">YouTube</a></li>
              <li><a href="/podcast" className="footer__link">Apple Podcasts</a></li>
              <li><a href="/podcast" className="footer__link">Spotify</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="footer__copy">© 2026 SYED IRFAN AJMAL · SIA ENTERPRISES INC · WYOMING C-CORP</div>
          <div className="footer__contact">
            <span>+1-402-403-1948</span>
            <span>SIA[@]SYEDIRFANAJMAL[DOT]COM</span>
            <span className="footer__open">● OPEN FOR PROJECTS</span>
          </div>
        </div>
      </footer>
    </>
  );
}
