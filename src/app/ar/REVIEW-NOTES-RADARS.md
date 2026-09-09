# Arabic KSA radars · review notes and go-live checklist

**Routes:** `/ar/ksa-tourism-radar` · `/ar/ksa-retail-radar`
**English originals:** `/ksa-tourism-radar` · `/ksa-retail-radar`
**Built:** 9 September 2026
**Status:** NOINDEX, unlinked, machine-drafted, awaiting native review

---

## Why these two pages, specifically

Every other page on the site is the English site in Arabic. These two are Saudi
market analysis published in the market's own language, which is a different
asset: they are the pages an Arabic outlet or a Saudi comms lead has a reason to
share, and both content files already carried a curated Arabic name for every
signal (53 across the two) before this build started.

## The overlay model, and why it matters

These are **not** copies of the English pages. Each Arabic page imports:

- the **same live data function** the English page uses (`getKsaRadarData` /
  `getRetailRadarData`), so the article counts, momentum and freshness date come
  from one source and cannot drift between languages;
- the **same curated English content module**, for structure: signal ids, lenses,
  rings, status, topics, source links, the verdict engine, and the low-sample floor;
- an **Arabic prose overlay** (`content.ar.ts`) keyed by signal id.

Three consequences worth knowing:

1. The two language versions can never disagree about what a signal is doing.
   The verdict, the median and the low-sample rule are computed once, in shared code.
2. If Irfan adds a 29th tourism signal in English, it appears on the Arabic page
   immediately, in English, carrying a **لم تُترجم بعد** ("not yet translated") chip.
   Untranslated is visible. Missing would not be.
3. Signal **names** are not in the overlay. Both English content files already carry
   a curated `ar` name for every signal and the page reads those. To change a signal's
   Arabic name, change it in the English file.

Source links stay in English throughout. They cite English articles, and translating
a publication's name makes the citation harder to verify, not easier. Every outbound
link is marked `hrefLang="en"` so that is declared rather than implied.

## A note on reading Arabic through the tooling

While building this, Arabic text read back from the repo through the remote shell
appeared corrupted in one place (the Umrah signal's `ar` label looked like it had
Unicode replacement characters in it). It does not. The file is correct, and the
mangling happened in transit to the tooling, not on disk.

Recorded here because the same trap is waiting for the next session: **never
"repair" Arabic in a source file based on how it renders in shell output.** Verify
against the file itself, or in a browser, before changing a single character.

## What is deliberately not ported

The English interactive module (`KsaRadarModule` / `RetailRadarModule`, ~600 lines each)
does lens and ring filtering client-side. It is an English client component, and
rebuilding it in Arabic is its own piece of work. On the Arabic pages every signal is
rendered, grouped by horizon, unfiltered. For a page whose job is to be read and shared
this is arguably the better default; revisit if the Arabic pages get real traffic.

## What the reviewer should do

Everything is in the two **`content.ar.ts`** files. Nothing else contains prose.
Ask them to edit strings in place and change nothing else.

Four things worth asking specifically:

1. **The terminology lock** at the top of the tourism file, shared by all three Arabic
   pages: الإعلام المكتسب، التغطية الإعلامية، حصة الصوت، مساحة بيضاء، اقتناص الخبر،
   الزخم. These are the words a Saudi comms director judges fastest, and each appears
   dozens of times. Flag a wrong one rather than fixing one instance.
2. **The verdict vocabulary** (`UI.verdicts`): six labels that appear on every signal
   card and in the chart legend. They need to work as terse chips, not as sentences.
   نافذة مبكرة / مساحة بيضاء / اقتناص خبر / متأخرة / خاملة / إعادة معايرة.
3. **Proper nouns.** Project, company and event names were rendered in their standard
   Arabic forms where one exists (نيوم، الدرعية، العُلا، القدية، موسم الرياض، هنقرستيشن،
   جاهز، سلة، سينومي، المراعي، صافولا) and left in Latin where they are read that way in
   Saudi business press (ChatGPT, EMOS, Forbes, Westfield). Ask whether any of those
   calls are wrong for the sector.
4. **Numbers.** Every figure must match the English page exactly. If one disagrees,
   the English page is right and it is a bug worth reporting.

## Go-live checklist

Do these together, in one commit, only after the review is applied. Same shape as the
travel page's checklist.

- [ ] Review applied to both `content.ar.ts` files
- [ ] Remove `DraftBanner` from both pages (and from the travel page)
- [ ] Remove `robots: { index: false, follow: false, nocache: true }` from both
- [ ] Add `alternates.languages` to each **Arabic** page: `ar` → self, `en` → English URL, `x-default` → English URL
- [ ] Add the mirrored `alternates.languages` to each **English** page. Both directions or neither.
- [ ] Confirm every page self-canonicals. An Arabic page must never canonical to the English one.
- [ ] Add all three Arabic URLs to `src/app/sitemap.ts`, each alternates map including the English self-entry
- [ ] Add a visible language switcher to the two English radar pages (the Arabic ones already point back)
- [ ] Locale code `ar`, never `ar-SA` unless the copy becomes Saudi-specific, never `ar-AR`
- [ ] Verify the clusters in Search Console, International Targeting, in week one
- [ ] No IP or Accept-Language redirects, ever

## Open items

- Fold `/ar/speaking/earned-media-ai/travel` onto `src/app/ar/_components/chrome.tsx`.
  It still carries its own inline header and footer from the first Arabic build, so
  there are currently two Arabic headers in the codebase.
- The Arabic radars link out to `/strategy-call`, `/earned-media-radar` and the press
  kit, all English. Acceptable for a draft; decide before go-live.
- Consider promoting the curated Arabic signal names to Arabic BigQuery seeds, which is
  already an open Ideas Inbox item ("Extend Arabic seeds using the radar Arabic labels").
  If that ships, the Arabic pages could show Arabic press volume rather than English,
  which would make them substantially more useful to a Saudi reader than the English
  originals are.
