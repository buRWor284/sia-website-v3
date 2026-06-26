# Handoff: PressIQ Explainer Video

**Date:** 2026-06-24  
**Design version:** 1.1  
**Target runtime:** ~4:35  
**Intended uses:** syedirfanajmal.com/tools/pressiq, YouTube (16:9), LinkedIn (1:1 / 4:5 crop)

---

## About the Design Files

The files in this bundle are **design references created in HTML** — motion-graphic animatics showing the intended look, timing, and content of each scene. They are not production video files and not production code to ship directly.

The task for implementation is one of two paths:

1. **Use as a storyboard for screen-recorded video** — the most likely path. Record a live walkthrough of the PressIQ tool at syedirfanajmal.com/tools/pressiq, then use these animatics as a reference for each scene's timing, copy, lower-thirds, and on-screen stat callouts. Edit in DaVinci Resolve, Premiere, or CapCut.

2. **Recreate as motion graphics in After Effects / Motion** — if a fully animated explainer (no screen recording) is wanted, these HTML scenes are the pixel-perfect reference. Recreate each scene as an AE composition at 1280×720 or 1920×1080.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, copy, animation timing, and data are all final. The developer / motion editor should recreate these scenes with pixel fidelity.

---

## Design System

This design follows the **SIA Design System** ("The Bureau" / "The SIA Wire"). All visual decisions trace back to it.

| Token | Value |
|---|---|
| `--color-ink` | `#1a1410` |
| `--color-paper` | `#f1ebde` |
| `--color-paper-2` | `#e8e0cc` |
| `--color-yellow` | `#f5b81f` |
| Green (pass) | `#2d8a4e` |
| Orange (warn) | `#e07c2e` |
| Red (fail) | `#c04040` |

**Fonts (Google Fonts):**
- `Newsreader` — serif, weights 400/600/700, normal + italic. Used for all display, body, numbers, quotes.
- `Archivo` — grotesque, weights 400–900. Used for all UI labels, overlines, caps text, button text.

**Rules:**
- Zero rounded corners anywhere.
- No box shadows — borders only.
- No gradients.
- No emoji.
- Section numbers use `§ 01` format.

---

## Scenes / Views

Total duration: **4:35** (275 seconds). Hard black flash cuts between every scene.

---

### §01 — Hook (0:00–0:25)

**Background:** Ink (`#1a1410`)  
**Layout:** Full-bleed centered, vertical stack

**Elements:**
- `82%` — Newsreader 700, 228px, yellow (`#f5b81f`), line-height 0.85, tracking -0.04em. Scales in from 72% size with fade, 0.8s delay, 2.2s duration (easeOutCubic).
- Subtitle: `"of media pitches are deleted every day"` — Archivo 600, 20px, paper at 70% opacity, uppercase, letter-spacing 0.2em. Fades up from below at 3.5s.
- Bottom block (absolute, bottom: 108px, centered):
  - Line 1: `"Not because the stories are bad."` — Newsreader 400 italic, 32px, paper at 70%. Fades in at 10s.
  - Line 2: `"Because the pitches are."` — Newsreader 700, 32px, yellow. Fades in at 14s.

---

### §02 — Problem (0:25–1:00)

**Background:** Paper (`#f1ebde`)  
**Layout:** Two columns (`1fr 1px 1fr`), 48px gap. Full padding: 56px top/bottom, 72px left/right.

**Section label row** (top): `§ 01` in yellow + rule + `THE PROBLEM` in muted ink. Archivo 12px caps.

**Left column:**
- 4 staggered lines (Newsreader 44px), fade-in sequentially at 0.5s intervals:
  1. `"You sent a pitch."` — regular
  2. `"Heard nothing back."` — regular  
  3. `"Blamed the journalist,"` — italic
  4. `"the timing, or the news cycle."` — italic
- Stat block (fades in at 8s), two-part:
  - Ink box: `3,000` in Newsreader 700 52px yellow, with yellow 2px underline; `JOURNALISTS SAY` in Archivo 10px, paper at 50%
  - Paper-2 box: `"The real reason.."` + `"is almost always the pitch itself."` (Newsreader 18px) + source line `"Cision 2026 · Muck Rack · Propel"` (Archivo 8px caps, ink at 42%)

**Divider:** 1px vertical rule, ink at 12%

**Right column:**
- `WHY PITCHES FAIL` overline (Archivo 9px caps, ink at 38%)
- Body (Newsreader 22px, ink at 68%, line-height 1.72): `"Wrong length. Wrong subject line. Too formal. Too vague. Buried the news. Missing the hook. Nothing that makes a journalist think:"`
- Punchline (Newsreader 22px bold italic, ink): `'"I can use this."'`
- Pull quote (fades in at 24s) with 4px yellow left border:
  - `THE REAL ISSUE` overline
  - `"The problem isn't that you're a bad writer. It's that nobody ever gave you a rubric."` — Newsreader 24px bold italic

---

### §03 — Introducing PressIQ (1:00–1:30)

**Layout:** Two panels, side by side.

**Left panel** (ink background, width animates 0→368px over 1.5s, yellow right border 2px):
- `PITCH PLATFORM` overline
- 5 platform rows, each sliding in left-to-right sequentially (1.9s apart starting at 2.8s):
  - `HARO` / `QWOTED` / `SOURCE OF SOURCES` / `FEATURED` / `HELP A B2B WRITER`
  - Each: Archivo 11px bold caps yellow, 5×5px yellow square bullet, bottom border 1px paper at 7%

**Right panel** (paper background, padding 72px 60px):
- `FREE PITCH SCORER` pill (ink background, Archivo 9px yellow caps)
- `PressIQ` — Newsreader 700, 90px, ink, line-height 0.88, tracking -0.03em
- 1px horizontal rule
- Tagline: `"Will a journalist paste this in?"` — Newsreader 22px italic, ink at 58%
- Body: Newsreader 19px, ink at 65%, line-height 1.72, max-width 530px

---

### §04 — Live Mechanics (1:30–2:00)

**Background:** Ink  
**Layout:** Header row + 2×3 grid (5 metric cards, last cell empty)

**Header:** `§ 03 — LAYER ONE` overline + `Live Signals` headline (Newsreader 700 38px paper) + right-aligned italic subtext.

**5 metric cards** (stagger in: Word Count immediate, others at 6s / 10s / 14s / 18s):

| Metric | Target | Source |
|---|---|---|
| WORD COUNT | 100–150 words | Propel (555k pitches) |
| SUBJECT LINE | 6–9 words | Backlinko outreach study |
| READING GRADE | ≤ Grade 7 | Boomerang (40M emails) |
| CLOSING QUESTION | 1 clear ask | Fractl (500 journalists) |
| TONE | Factual, not breathless | Cision 2026 |

Each card: ink at 4% bg, 1px ink-7% border, 20px 24px padding.  
- Label: Archivo 9px caps, paper at 38%  
- Value: Newsreader 700 36px, **green** if passing / **red** if failing  
- Ideal text: Archivo 10px, paper at 38% — includes source name  
- Bar: 4px height, paper at 7% track, colored fill. Word count bar also shows green ideal-zone overlay (100–150 range).

Word count value animates live from 0→preset target over 14.5s.

**Bottom quote** (fades in at 22s): `"If you fail here, nothing else matters."` — Newsreader 18px italic, paper at 45%, centered.

---

### §05 — The Score (2:00–2:45)

**Layout:** 400px ink left panel + paper right panel (flex: 1)

**Left panel:**
- Score number counts up 0→N (easeOutCubic, 1.5s–5s) — Newsreader 700, 152px, tier color, tracking -0.04em
- `OUT OF 100` label — Archivo 9px, paper at 38%
- Tier badge (fades in at 5.5s) — background = tier color, Archivo 800 13px ink caps
- Tier scale (fades in at 7s): 4 rows showing 85+ / 65–84 / 40–64 / 0–39 with tier labels, color-coded
- Strongest line (fades in at 12s): `STRONGEST LINE` label + italic quote in paper text, yellow-tinted bg, tier-colored left border

**Right panel:**
- `32-factor analysis` headline (Newsreader 700 28px)  
- `ACROSS SEVEN DIMENSIONS` subheader
- 7 dimension bars (fill in over 8s–12s, easeOutCubic):
  - Relevance / Mechanics / SIA 7-Step / Newsroom-Ready / Storytelling / Neuromarketing / Personal Brand
  - Bar height: 7px, ink at 7% track, colored fill
  - Score number animates alongside bar

**Tier color logic:**
- ≥85: Green `#2d8a4e`
- 65–84: Yellow `#f5b81f`
- 40–64: Orange `#e07c2e`
- 0–39: Red `#c04040`

---

### §06 — The 7 Dimensions (2:45–3:30)

**Background:** Ink  
**Layout:** Header row + 7-column grid

**Header:** `The 7 Dimensions` (Newsreader 700 40px paper) + section overline

**7 cards**, stagger in from below (0.8s + 1.4s per card):

| # | Dimension | Stat | Source |
|---|---|---|---|
| 01 | Relevance | 82% | Cision |
| 02 | Mechanics | 5 | Live signals |
| 03 | SIA 7-Step | 32 factors | DMR.agency |
| 04 | Newsroom-Ready | 47% | Muck Rack |
| 05 | Storytelling | Arc | Stakes + tension |
| 06 | Neuromarketing | 53% | Cision 2026 |
| 07 | Personal Brand | Authority | Credibility |

Each card: ink at 4% bg, 1px ink-7% border, 16px 13px padding, flex column.  
- Number: Archivo 9px bold yellow caps  
- Name: Newsreader 700 16px paper  
- 1px divider  
- Stat: Newsreader 700 24px yellow  
- Source: Archivo 8px paper at 28% caps  
- Description: Newsreader 12px paper at 48%, pushed to bottom

---

### §07 — Top Fixes (3:30–3:55)

**Background:** Paper  
**Layout:** Header + 3 fix cards, vertical stack, padding 58px 96px

**Header** (fades in at 0.5s):
- `§ 06 · TOP FIXES` label row
- `Three changes.\nBefore you hit send.` — Newsreader 700 50px, tracking -0.02em

**3 fix cards** (slide in from right, 2.5s / 5s / 7.5s):
- Border: 1px solid ink
- Left: number (Newsreader 700 34px yellow) + impact badge (HIGH = ink bg / MEDIUM = paper-2 bg)
- Right: title (Newsreader 700 18px) + fix text (Newsreader 16px ink at 62%, yellow left border 3px)

| # | Impact | Title | Fix |
|---|---|---|---|
| 01 | HIGH | Subject line: 11 words | Trim to 7 words or fewer. Lead with the news angle, not your credential. |
| 02 | MEDIUM | No closing question detected | End with a single direct ask: "Available to comment by Thursday?" |
| 03 | MEDIUM | Reading grade: 9 (target: ≤7) | Split sentences over 20 words. Remove nominalizations. Write for a smart 13-year-old. |

---

### §08 — Evidence (3:55–4:20)

**Background:** Ink  
**Layout:** Header + 3×2 grid of source cards

**Header** (fades in at 0.5s):
- `§ 07 — THE EVIDENCE` — Archivo 9px yellow caps
- `Every threshold traces\nto published research.` — Newsreader 700 40px paper

**6 source cards** (stagger in at 2.2s + 1.4s each):

| Source | Sub | Key stat |
|---|---|---|
| Cision | State of the Media 2026 | 82% of pitches deleted as irrelevant |
| Muck Rack | Journalist Survey | 88% want pitches tailored to their beat |
| Propel | 555,000 pitches analyzed | Optimal: 100–150 words per pitch |
| Backlinko | Journalist Outreach Study | 6–9 word subject lines outperform |
| Fractl | 500 journalists surveyed | 47% want original data |
| Boomerang | 40M emails analyzed | Grade 5–7: highest response rate |

Each card: ink at 4% bg, 1px ink-7% border.  
- Source name: Newsreader 700 22px paper  
- Sub: Archivo 9px paper at 32% caps, bottom border  
- Stat: Newsreader 20px italic yellow, pre-line whitespace

---

### §09 — CTA (4:20–4:35)

**Background:** Paper  
**Layout:** Full-bleed centered, max-width 860px

**Elements** (staggered fade-ins):
- `FREE · THREE SCORES · NO SIGNUP` — Archivo 10px bold caps, ink at 38%
- `Paste your last pitch in.` — Newsreader 700 64px, tracking -0.03em
- `See what the score says.` — Newsreader 32px italic, ink at 52%
- URL badge: ink background, `syedirfanajmal.com/tools/pressiq` — Archivo 700 16px yellow, padding 15px 30px
- `Want the full framework? The EMOS program is at DMR.agency` — Newsreader 17px, ink at 50%
- `Fix it before you send the next one.` — Newsreader 700 20px ink

---

## Tweakable Pitch Presets

The animatic supports 4 pitch presets that change the live signals, score, tier, dimension bars, and strongest-line pull quote in §04, §05:

| Preset | Score | Tier | Word count | Subject words | Grade | Closing Q |
|---|---|---|---|---|---|---|
| Founder Story | 71 | COMPETITIVE | 287 | 11 | 9 | 0 |
| Data Angle | 88 | PLACEMENT-GRADE | 134 | 7 | 6 | 1 |
| Expert Comment | 58 | NEEDS WORK | 198 | 9 | 8 | 1 |
| Product Launch | 31 | WILL BE IGNORED | 342 | 14 | 11 | 0 |

When producing the final video, choose one preset (recommend **Founder Story** for YouTube/LinkedIn long-form, **Data Angle** for the 90-second LinkedIn cut to show a high-scoring result).

---

## Interactions & Animation

| Behavior | Spec |
|---|---|
| Scene transitions | Hard black flash, 280ms fade-out (easeInOutQuad) |
| Element entrance | `opacity: 0→1` + `translateY(16px→0)` or `translateX(28px→0)`, 1.4s easeOutCubic |
| Score counter | `0 → N`, 3.5s easeOutCubic |
| Word count live counter | `0 → wordCount`, 14.5s linear |
| Dimension bars | `0% → N%`, 4s easeOutCubic, all bars simultaneously |
| Platform panel slide | `width: 0 → 368px`, 1.5s easeOutCubic |

---

## VO / Audio Notes

- **Music:** Understated instrumental — no beats, no drama. Recommend: Lo-fi jazz or minimal piano.
- **VO pace:** Conversational. Short pauses after key stats.
- **Captions:** Required for LinkedIn (autoplay is muted). Burn in or use platform auto-captions.
- **Aspect ratios:** Export 16:9 for YouTube; crop to 1:1 or 4:5 for LinkedIn.

---

## Production Workflow (Recommended)

1. **Record VO** — use the script in `SCRIPT.md` (attached)
2. **Screen record** — live walkthrough at syedirfanajmal.com/tools/pressiq
3. **Open `PressIQ Explainer.dc.html`** in Chrome — use as timing/layout reference per scene
4. **Edit in DaVinci / Premiere** — sync VO to screen recording; use animatic timecodes for cut points
5. **Add lower thirds** — `PressIQ` tool name; source citations per data callout
6. **Export** — H.264 for YouTube; also export 1:1 crop for LinkedIn

---

## Files in This Package

| File | Purpose |
|---|---|
| `PressIQ Explainer.dc.html` | Full animated storyboard — open in Chrome |
| `animations.jsx` | Animation engine (required by the storyboard) |
| `support.js` | DC runtime (required by the storyboard) |
| `SCRIPT.md` | Full VO script with timecodes |
| `README.md` | This document |

---

## Assets

No external image assets. All visuals are typographic and data-driven inline.  
Brand assets (logo, headshot) available in the SIA Design System at `_ds/sia-design-system-*/assets/`.

---

*Handoff prepared by Claude (Cowork) · SIA Design System v1 · 2026-06-24*
