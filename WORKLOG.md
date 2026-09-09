# WORKLOG — syedirfanajmal.com

Reverse-chronological log of substantive changes. Newest entries on top.

---

## 2026-09-09 · Arabic (RTL) edition of the travel speaking page — noindex staging draft

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
