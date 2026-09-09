# WORKLOG — syedirfanajmal.com

Reverse-chronological log of substantive changes. Newest entries on top.

---

## 2026-09-09 (2) · Arabic (RTL) editions of both KSA radars — noindex staging drafts

**Commit:** `e3a176e` (pushed).

**Why:** follow-on from the Arabic travel page earlier the same day. The radars are the strongest Arabic candidates on the site: they are Saudi market analysis in the market's own language rather than a translated brochure, and both content files already carried a curated Arabic name for every signal (53 across the two).

**Added**
- `src/app/ar/ksa-tourism-radar/` — `page.tsx` + `content.ar.ts` (28 signals, 6 KPIs, 5 coverage gaps, 4 talks, full UI chrome)
- `src/app/ar/ksa-retail-radar/` — `page.tsx` + `content.ar.ts` (25 signals, 6 KPIs, 4 talks, full UI chrome)
- `src/app/ar/_components/chrome.tsx` — shared Arabic header, footer and draft banner for everything under /ar/
- `src/app/ar/radar-ar.css` — self-contained RTL stylesheet, logical properties throughout
- `src/app/ar/REVIEW-NOTES-RADARS.md` — what to ask the reviewer, plus the go-live checklist

**★ THE OVERLAY MODEL — read this before touching either Arabic radar.** These are NOT copies of the English pages. Each Arabic page imports the SAME live data function (`getKsaRadarData` / `getRetailRadarData`) and the SAME curated English content module, and adds only an Arabic prose overlay keyed by signal id. Three consequences: (a) article counts, momentum and freshness come from ONE source so the languages cannot drift; (b) the verdict engine, median and `LOW_SAMPLE_N` are shared, so the two pages can never disagree about what a signal is doing; (c) a signal added in English appears on the Arabic page immediately, in English, carrying a `لم تُترجم بعد` chip. Untranslated is visible; missing would not be. Signal NAMES are not in the overlay: both English content files already carry a curated `ar` name and the pages read those.

**Not ported, deliberately:** the English interactive filter modules (`KsaRadarModule` / `RetailRadarModule`, ~600 lines each) are English client components. Every signal renders on the Arabic pages, grouped by horizon, unfiltered.

**Status:** both pages `robots: index false, follow false, nocache`, absent from `sitemap.ts`, unlinked from the English site, and carrying NO hreflang in either direction. That last point is deliberate and must stay until review is applied: hreflang pointing at a noindexed URL is an invalid cluster.

**★ FALSE ALARM WORTH RECORDING — do not repeat it.** Arabic text read back from the repo through `device_bash` appeared corrupted (the Umrah signal's `ar` label looked like `الع` + U+FFFD replacement chars). It is NOT corrupted; the file on disk is correct and `git diff` confirmed no change was needed. The mangling happened in transit to the tooling. **Never "repair" Arabic in a source file based on how it renders in shell output** — verify against the file itself or in a browser first. A session that trusts the shell rendering here will corrupt working content while believing it is fixing it.

**Verification**
- `npx tsc --noEmit -p tsconfig.json` on the Mac via device_bash: CLEAN. Two real errors were caught and fixed in-run (React SVG props have no `dir`; the LTR isolation moved to a wrapper div in both pages). Remaining output is only the pre-existing `vitest` types error in `src/lib/factcheck/grade.test.ts`.
- **A full `npm run build` was NOT run by me** — impossible from device_bash, see project memory `sandbox-device-bash-limits` (linux/arm64 VM vs macOS node_modules).
- Neither page has been viewed in a browser. First look should check RTL flow, the signal-card grid, and that The Window's SVG stays left-to-right inside the RTL page.

**Ideas captured** — "Arabic radars should count Arabic press, plus a language toggle on all four radar pages" → Ideas Inbox (SIA Website Updates v2); cross-referenced from "Extend Arabic seeds using the radar Arabic labels", which is its blocker.

**Pending / next**
- Native Gulf Arabic review of both `content.ar.ts` files, then the shared go-live checklist.
- Fold `/ar/speaking/earned-media-ai/travel` onto `_components/chrome.tsx`; it still has its own inline header and footer, so there are two Arabic headers in the codebase right now.
- Ideas Inbox item "Extend Arabic seeds using the radar Arabic labels" is now much more valuable: if Arabic seeds ship, the Arabic radars could show Arabic press volume rather than English, making them more useful to a Saudi reader than the English originals.

---

## 2026-09-09 · Arabic (RTL) edition of the travel speaking page — noindex staging draft

**Commit:** `669e194` (pushed).

**Why:** Irfan asked how to make the site multilingual. Research pass (study artifact "Eight Pages, Six Languages") found (a) Google's spam-policy clause on unreviewed machine translation was REMOVED in the March 2024 update, so the compliance risk he was worried about is largely gone; (b) Arabic is the only clearly worthwhile language of the six he named, and it is a Saudi play, not a UAE one; (c) Simplified Chinese is impossible on this stack because Vercel is blocked in mainland China. Decision: Arabic only, this page first, as an unlinked noindex draft for language review.

**Added** `src/app/ar/speaking/earned-media-ai/travel/`
- `page.tsx` — full Arabic RTL port of the travel speaking page. Server component, `dir="rtl" lang="ar"` on the page wrapper (NOT `<html>`, which is shared with the English site). `robots: index false, follow false, nocache`. Self-canonical. NO hreflang in either direction, deliberately: hreflang pointing at a noindexed URL is an invalid cluster.
- `content.ar.ts` — every visible string, MSA in Saudi business register, with a terminology lock at the top (earned media, coverage, pitch, authority content, share of voice). This is the ONLY file a reviewer touches; `page.tsx` contains no prose.
- `REVIEW-NOTES.md` — what to ask the reviewer, plus the full go-live checklist (remove noindex, wire hreflang BOTH ways, add to sitemap with the English self-entry, add the English-side switcher, keep locale code `ar` not `ar-SA`, never `ar-AR`).

**Changed** `src/components/SiteHeaderConditional.tsx`
- Added `"/ar/"` to `HIDDEN_PREFIXES` so the English nav does not stack on the Arabic page's own header. Trailing slash is load-bearing: it stops the prefix matching routes like `/articles`.

**Decisions / notes**
- Page imports colour tokens from `@/lib/tokens` and NOTHING else from the shared component library. No shared component needed an `isArabic` prop, so the 78 English pages are untouched apart from the three-line header change. Deliberate: no English string can leak into an Arabic page, and no edit here can regress the English site.
- The three English-only interactive widgets (`CoverageFlywheel`, `PipelineFlowV2`, `PitchClinicDemoTravel`) are replaced with Arabic static blocks. Nothing is lost, the English page already restates the six returns and six pipeline stages as text beneath each widget.
- Fonts: Amiri (display/body, the Newsreader role) + IBM Plex Sans Arabic (labels/UI, the Archivo role), loaded in the page file so English pages never download an Arabic face. Line-height 1.85–1.95, sizes lifted slightly, per Arabic convention.
- Numerals are Western digits, the Saudi business/press convention. Section numbers, stat figures and list markers wrapped in `dir="ltr"` so they render correctly inside RTL text.
- Testimonials omitted: translating a real person's quote misrepresents them. Decide at go-live.
- CSS uses logical properties (`border-inline-end`, `padding-inline-start`, `inset-inline-start`, `margin-inline`) so the layout flips with direction rather than fighting it.

**Verification**
- `npx tsc --noEmit -p tsconfig.json` run on the Mac via device_bash: CLEAN for these files. Only pre-existing unrelated noise (`vitest` types missing in `src/lib/factcheck/grade.test.ts`).
- **A full `npm run build` was NOT run by me.** It cannot run from device_bash at all: that VM is linux/arm64 while the repo's node_modules hold macOS SWC binaries, so `next build` dies on `next.config.ts` before compiling. Recorded in project memory `sandbox-device-bash-limits`. Build runs on the Mac or on Vercel.
- The page has not been viewed in a browser yet. First look should check RTL flow, Arabic type sizes, and that the numbers/section markers read left-to-right inside the Arabic text.

**Pending / next**
- Native Gulf Arabic review of `content.ar.ts`, then the go-live checklist in `REVIEW-NOTES.md`.
- The two KSA radars in Arabic are the bigger earned-media play and the natural next build: 53 signals across both content files already carry curated Arabic names, and they are Saudi market analysis in the market's own language rather than a translated brochure.

---

## 2026-07-24 · Speaking pages — Saudi/ATM edition, audience numbers, media

**Why:** prepping the WTM Spotlight Riyadh (8–10 Sep 2026) / ATM Dubai (14–17 Sep 2026) speaker submission. The form blurb links to `/speaking`, so the travel edition had to be surfaced and dressed up there.

**/speaking** (`src/app/speaking/page.tsx`)
- New "Saudi Tourism edition" featured bar at the top (dark card → `/speaking/earned-media-ai/travel`), above the flagship bar.
- Biggest-audience stat `500+` (his ATM Dubai session). DMSS set to `200+` everywhere; "Biggest" tag moved from DMSS to the ATM stage row.
- Past Stages: ATM year `2017` → `2018`.
- Signature Topics intro: "two talks" → "three talks".

**/travel** (`src/app/speaking/earned-media-ai/travel/page.tsx`)
- `500+` biggest-audience stat; DMSS `200+`.
- Masthead CTA "get bookings" → "get chosen".
- Bio: added "hosts a business podcast, running since 2018."
- Speaker strip → two-up: DMSS photo + embedded ATM Dubai talk video (YouTube `uSn4s5ZbJcQ`). ATM's 40,000-attendee event size restored as a credential in the video caption (kept distinct from the 500-person room).
- Masmak Fort, Riyadh image as a faded (~20%) backdrop behind the Saudi Angle / Vision 2030 band (not a top banner). Image `public/assets/speaking/saudi-hero.jpg` (optimized to ~462 KB from a Pexels original; credit: Abdul7amid Al Fadhly / Pexels).

**/speaking/earned-media-ai (flagship)** (`src/app/speaking/earned-media-ai/page.tsx`)
- Speaker strip → two-up: DMSS photo + ATM Dubai video; DMSS corrected to `200+`.

**Verified:** WTM Spotlight Riyadh 8–10 Sep 2026 (RFECC); ATM Dubai 14–17 Sep 2026 (DWTC); ATM 2018 ≈ 40,000 attendees (WTM press release).
