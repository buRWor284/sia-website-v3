# Arabic travel speaking page · review notes and go-live checklist

**Route:** `/ar/speaking/earned-media-ai/travel`
**English original:** `/speaking/earned-media-ai/travel`
**Built:** 9 September 2026
**Status:** NOINDEX, unlinked, machine-drafted, awaiting native review

---

## What this is

A staging draft of the travel speaking page in Modern Standard Arabic, right to left.
It exists so a native Gulf Arabic speaker can read the real page in a browser, at real
type sizes, rather than reviewing a spreadsheet of strings.

Nobody will find it. It is `noindex, nofollow`, it is not in `sitemap.ts`, and nothing
on the English site links to it. Open it by typing the URL.

## Why there is no hreflang yet

Deliberate, and it is the one thing not to "fix" before review is done.

Google ignores an entire hreflang cluster if any member is noindexed or unreachable, and
a broken cluster is worse than no cluster. So the English page carries no `alternates.languages`
entry either. Both halves get wired at go-live, together, or not at all.

## Architecture, and why it looks unusual

The page imports colour tokens from `@/lib/tokens` and **nothing else** from the shared
component library. That is on purpose:

- No English string can leak into an Arabic page.
- No edit here can affect any of the 78 English pages.
- No shared component needed an `isArabic` prop, so nothing on the English site changed
  except three lines in `SiteHeaderConditional.tsx` (to hide the English nav under `/ar/`).

Three interactive widgets on the English page are English-only: `CoverageFlywheel`,
`PipelineFlowV2` and `PitchClinicDemoTravel`. Rather than ship English widgets inside an
Arabic page, their content is rendered here as Arabic static blocks. Nothing is lost:
the English page already restates the six returns and the six pipeline stages as text
directly beneath each widget. The pitch clinic gained a short Arabic description in its place.

`dir="rtl" lang="ar"` sits on the page wrapper, not on `<html>`, because the root layout
is shared with the English site. This is valid and works correctly for a subtree. If
Arabic ever grows past a handful of pages, move to route groups with a second root layout.

## Typography

- **Amiri** for the display and body role. Classical naskh with editorial weight, the
  closest Arabic counterpart to Newsreader's job on the English page.
- **IBM Plex Sans Arabic** for labels, small caps and UI. Covers the Archivo role.
- Both load from this page only, so English pages never download an Arabic face.
- Body line-height raised to 1.85 to 1.95 and sizes lifted slightly, per Arabic convention.
  Verify by eye; this is practitioner convention, not documented policy.
- **Numerals are Western digits** (2030, 80%, 1.5 million), the Saudi business and press
  convention. Section numbers, stat figures and list markers are wrapped in `dir="ltr"`
  so they render correctly inside RTL text.

## What the reviewer should do

Everything they need is in **`content.ar.ts`**. It is the only file with prose in it;
`page.tsx` contains no copy at all. Ask them to edit strings in place and change nothing else.

Three things worth asking them specifically, rather than "please check this":

1. **The terminology lock at the top of `content.ar.ts`.** Roughly a dozen renderings of
   PR and marketing terms (earned media, coverage, pitch, authority content, share of voice).
   These are the words a Saudi comms director will judge fastest. If one is wrong it is
   wrong in a dozen places, so flag it rather than fixing one instance.
2. **`HERO.deskLine`** and **`CHROME.brandLine`**. The triad ("get covered, get found,
   get chosen") and the brand line appear on every asset. They need to land as slogans
   in Arabic, not as translations of English slogans. Expect these to be rewritten, not corrected.
3. **Register.** Is it right for a government tourism body and a hotel group, or does it
   read as either too formal or too casual for that room?

## Go-live checklist

Do these together, in one commit, only after the review is applied.

- [ ] Native review applied to `content.ar.ts`
- [ ] Remove `DraftBanner` from `page.tsx`
- [ ] Remove `robots: { index: false, follow: false, nocache: true }` from the Arabic page metadata
- [ ] Add `alternates.languages` to the **Arabic** page: `ar` → self, `en` → English URL, `x-default` → English URL
- [ ] Add `alternates.languages` to the **English** page: the same three, mirrored. Both directions or neither.
- [ ] Confirm both pages self-canonical. The Arabic page must NOT canonical to the English one; that de-indexes it.
- [ ] Add the Arabic URL to `src/app/sitemap.ts`, including the English self-entry in its alternates map
- [ ] Add a visible language switcher on the **English** page pointing at the Arabic URL
      (the Arabic page already has one pointing back)
- [ ] Locale code is `ar`, not `ar-SA` and never `ar-AR`, unless the copy becomes Saudi-specific
- [ ] Verify the cluster in Search Console, International Targeting, in week one
- [ ] Do NOT add any IP or Accept-Language redirect. Google advises against it and Googlebot
      sends no Accept-Language header.

## Known open items

- Testimonials are omitted. Translating a real person's quote misrepresents them. When this
  goes live, either show them in English under an Arabic heading noting they are in the
  original language, or get permission for a translation.
- The two KSA radars and the press kit still link out to English pages. Marked `hrefLang="en"`
  so that is at least declared, but the Arabic radars are the natural next build.
- `/contact`, `/press-kit`, `/strategy-call` and the speaker one-sheet PDF are all English.
  A Saudi buyer who clicks through lands in English. Acceptable for a draft; decide before go-live.
