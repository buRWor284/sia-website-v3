/**
 * Hand-picked outlet lists per market and beat (JournoCollabIQ, 25 Sep 2026).
 *
 * Why: general web search does not surface who writes for niche trade press
 * (eval, 25 Sep). So for the markets Irfan sells into, we keep the outlets
 * that matter and read their own section pages to see who is publishing.
 * Order agreed: KSA first, then USA, then the rest of the GCC; review each
 * market quarterly. Other beats/markets get an auto-built list later.
 *
 * Rules for this file:
 *  - An outlet is added only after a live 2026 article was seen on it
 *    (`evidence`). `checked` is the date that was confirmed.
 *  - `pages` are the section/tag pages the roster reader will read for
 *    bylines. Only URLs actually seen are listed; `confirmPages: true` marks
 *    an outlet whose best section page is still to be confirmed.
 *  - `blocksReading: true` = the site refused a page read (HTTP 405) in
 *    testing; names there fall back to "find the reporter on the outlet site".
 *  - Re-checked 25 Sep by reading each page the way the roster reader will:
 *    most listing pages do NOT show bylines, so the reader opens a few
 *    articles per outlet; staff/desk/wire bylines never count as people.
 *  - Never delete an outlet: set `status` to "paused" or "closed" with a note,
 *    so the history is kept.
 */

export type OutletStatus = "active" | "paused" | "closed";

export interface Outlet {
  name: string;
  domain: string;
  lang: "en" | "ar";
  pages: string[];
  evidence: string;
  checked: string;
  status: OutletStatus;
  blocksReading?: boolean;
  confirmPages?: boolean;
  /** Most items carry a staff, desk or wire byline, so few named people. */
  mostlyStaff?: boolean;
  note?: string;
}

export interface BeatList {
  market: string;
  beat: string;
  /** Words in a user's typed beat that point to this list. */
  matches: string[];
  outlets: Outlet[];
}

const CHECKED = "2026-09-25";

export const OUTLET_LISTS: BeatList[] = [
  {
    market: "ksa",
    beat: "marketing-pr-media",
    matches: ["marketing", "advertising", "pr", "public relations", "media", "agency", "agencies", "brand", "communications"],
    outlets: [
      {
        name: "Campaign Middle East", domain: "campaignme.com", lang: "en",
        pages: ["https://campaignme.com/tag/saudi-agency/", "https://campaignme.com/tag/saudi-arabia-report-2026/"],
        evidence: "https://campaignme.com/tag/saudi-arabia-report-2026/", checked: CHECKED, status: "active",
      },
      {
        name: "Communicate", domain: "communicateonline.me", lang: "en",
        pages: ["https://communicateonline.me/tag/saudi-arabia/"],
        evidence: "https://communicateonline.me/news/aramco-named-client-of-the-year-at-cannes-corporate-media-tv-awards-2026/",
        checked: CHECKED, status: "active",
        mostlyStaff: true,
        note: "Real domain is communicateonline.me (the AI list invented communicate.ae and communicate-online.com). Recent news items are credited to Communicate Staff (checked 25 Sep).",
      },
      {
        name: "PRWeek Middle East", domain: "prweek.co.uk", lang: "en",
        pages: ["https://www.prweek.co.uk/middle-east"],
        evidence: "https://www.prweek.co.uk/article/1957567/prweek-global-awards-2026-best-agency-%e2%80%93-middle-east",
        checked: CHECKED, status: "active",
        note: "Middle East coverage lives on prweek.co.uk, not prweek.com.",
      },
      {
        name: "Arab News (media and marketing)", domain: "arabnews.com", lang: "en",
        // The advertising tag page's newest item was July 2024; the Media
        // section shows bylines and dates (22-25 Sep 2026 seen).
        pages: ["https://www.arabnews.com/media"],
        evidence: "https://www.arabnews.com/node/2629200/media", checked: CHECKED, status: "active",
      },
      {
        name: "ArabAd", domain: "arabaddigital.com", lang: "en",
        pages: ["https://www.arabaddigital.com/"],
        evidence: "https://www.arabaddigital.com/en/article/6212-the-worlds-largest-portfolio-review-heads-back-to-the-middle-east",
        checked: CHECKED, status: "active", mostlyStaff: true,
        note: "Active (items dated 11-21 Sep 2026 on the home page); bylines are mostly \"ArabAd's staff\".",
      },
    ],
  },
  {
    market: "ksa",
    beat: "tourism-hospitality",
    matches: ["tourism", "travel", "hospitality", "hotel", "hotels", "destination", "events", "giga"],
    outlets: [
      {
        name: "Hotelier Middle East", domain: "hoteliermiddleeast.com", lang: "en",
        pages: ["https://www.hoteliermiddleeast.com/"],
        evidence: "https://www.hoteliermiddleeast.com/saudi-arabia/domestic-travel-drives-saudi-tourism-growth-in-q1-2026",
        checked: CHECKED, status: "active", blocksReading: true,
        note: "Refused a page read (HTTP 405) on 25 Sep.",
      },
      {
        name: "Skift", domain: "skift.com", lang: "en",
        pages: ["https://skift.com/"],
        evidence: "https://skift.com/2026/07/06/private-capital-is-moving-into-saudi-tourism-their-bets-look-very-different/",
        checked: CHECKED, status: "active", confirmPages: true,
        note: "Global trade outlet with regular Saudi coverage (Jan to Jul 2026 articles seen). Home page is global and shows no bylines; needs a Saudi or Middle East page.",
      },
      {
        name: "TTN Travel & Tourism News Middle East", domain: "ttnworldwide.com", lang: "en",
        pages: ["https://www.ttnworldwide.com/"],
        evidence: "https://www.ttnworldwide.com/ArticleTA/466154/saudi-hospitality-sector-hit-by-softer-corporate-travel-in-h1",
        checked: CHECKED, status: "active",
        note: "Home page lists 24 Sep 2026 items without bylines; the reader opens articles.",
      },
      {
        name: "Arab News (tourism)", domain: "arabnews.com", lang: "en",
        pages: ["https://www.arabnews.com/tags/saudi-tourism"],
        evidence: "https://www.arabnews.com/tags/saudi-tourism", checked: CHECKED, status: "active",
        note: "Shows bylines and dates (named writers seen: Basmah Albasrawi, Nada Alturki; many items are Arab News or SPA).",
      },
      {
        name: "Arabian Business (tourism)", domain: "arabianbusiness.com", lang: "en",
        pages: ["https://www.arabianbusiness.com/tags/saudi-tourism"],
        evidence: "https://www.arabianbusiness.com/tags/saudi-tourism", checked: CHECKED, status: "active",
        blocksReading: true,
      },
      {
        name: "Al Eqtisadiah (tourism, Arabic)", domain: "aleqt.com", lang: "ar",
        pages: ["https://www.aleqt.com/سياحة-وترفيه"],
        evidence: "https://www.aleqt.com/%D8%B3%D9%8A%D8%A7%D8%AD%D8%A9-%D9%88%D8%AA%D8%B1%D9%81%D9%8A%D9%87/%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9-%D8%AA%D8%B3%D8%AC%D9%84-%D8%AB%D8%A7%D9%86%D9%8A-%D8%A3%D9%83%D8%A8%D8%B1-%D8%AA%D8%AD%D8%B3%D9%86-%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A7-%D9%81%D9%8A-%D8%B3%D9%88%D9%82-%D8%A7%D9%84%D8%B9%D9%85%D9%84-%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%AD%D9%8A%D8%A9-%D9%85%D9%86%D8%B0-2019-14625",
        checked: CHECKED, status: "active", confirmPages: true,
        note: "Section path taken from article URLs; bylines will be in Arabic.",
      },
    ],
  },
  {
    market: "ksa",
    beat: "business-economy",
    matches: ["business", "economy", "finance", "investment", "startup", "startups", "banking", "markets", "retail", "vision 2030"],
    outlets: [
      {
        name: "Arab News (business)", domain: "arabnews.com", lang: "en",
        pages: ["https://www.arabnews.com/"],
        evidence: "https://www.arabnews.com/node/2644006/amp", checked: CHECKED, status: "active", confirmPages: true,
      },
      {
        name: "Saudi Gazette", domain: "saudigazette.com.sa", lang: "en",
        pages: ["https://saudigazette.com.sa/"],
        evidence: "https://saudigazette.com.sa/article/664540/saudi-arabia/saudi-trade-surplus-soars-62-to-sr615-billion-in-q2-2026",
        checked: CHECKED, status: "active", confirmPages: true,
        note: "The home page served the reader October 2024 items on 25 Sep; needs a working section page.",
      },
      {
        name: "Argaam (English)", domain: "argaam.com", lang: "en",
        pages: ["https://www.argaam.com/en/article/sectionarticles/sectionid/138/marketid/3/pageno/1/main-news-saudi"],
        evidence: "https://www.argaam.com/en/article/articledetail/id/1904736", checked: CHECKED, status: "active",
        mostlyStaff: true,
        note: "Items on the Saudi news page are credited to \"Argaam\" (checked 25 Sep).",
      },
      {
        name: "AGBI (Arabian Gulf Business Insight)", domain: "agbi.com", lang: "en",
        pages: ["https://www.agbi.com/middle-east/saudi-arabia/"],
        evidence: "https://www.agbi.com/analysis/economy/2026/09/gulf-businesses-begin-to-adapt-to-lingering-war/",
        checked: CHECKED, status: "active", confirmPages: true,
        note: "The Saudi page read back almost empty on 25 Sep (likely built by script); the reader may need article URLs from search.",
      },
      {
        name: "Gulf Business", domain: "gulfbusiness.com", lang: "en",
        pages: ["https://gulfbusiness.com/en/latest-news/"],
        evidence: "https://gulfbusiness.com/en/2026/saudi-arabia/big-work-life-shift-in-riyadh-new-flexible-hours-launch-across-50-entities/",
        checked: CHECKED, status: "active",
        note: "Latest-news page lists 24 Sep 2026 items without bylines; the reader opens articles.",
      },
      {
        name: "Entrepreneur Middle East", domain: "mena.entrepreneur.com", lang: "en",
        pages: ["https://mena.entrepreneur.com/topic/saudi-arabia"],
        evidence: "https://mena.entrepreneur.com/business-news/startup-den-returns-to-future-hospitality-summit-saudi-arabia-2026",
        checked: CHECKED, status: "active",
        note: "Saudi topic page shows bylines (e.g. Tamara Pupic, Shadi Kandil) but no dates; the reader opens articles for dates.",
      },
      {
        name: "Arabian Business", domain: "arabianbusiness.com", lang: "en",
        pages: ["https://www.arabianbusiness.com/"],
        evidence: "https://www.arabianbusiness.com/", checked: CHECKED, status: "active",
        blocksReading: true,
      },
      {
        name: "Al Eqtisadiah (Arabic)", domain: "aleqt.com", lang: "ar",
        pages: ["https://www.aleqt.com/"],
        evidence: "https://www.aleqt.com/", checked: CHECKED, status: "active", confirmPages: true,
      },
    ],
  },
];

/** Lists for a market whose `matches` hit the user's typed beat. */
export function listsFor(market: string, typedBeat: string): BeatList[] {
  const t = ` ${typedBeat.toLowerCase()} `;
  return OUTLET_LISTS.filter(
    (l) => l.market === market && l.matches.some((m) => t.includes(` ${m} `) || t.includes(`${m},`) || t.includes(` ${m}`)),
  );
}
