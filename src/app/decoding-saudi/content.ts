/**
 * Decoding Saudi: where Saudi attention actually is. Curated content layer.
 *
 * Hidden LinkedIn give for Megha S Anthony (Content Head, Athar Festival),
 * built to support an ask for Irfan to give his OWN TALK (not moderate) on
 * Athar's new "Decoding Saudi" stream (Riyadh, 24 to 25 Nov 2026), which
 * Athar describes as "a nuanced, insider look at Saudi Arabia's unique
 * market dynamics, cultural shifts and creative ambitions". That is a brand
 * and marketer lens, so the page is framed that way: where Saudi audience
 * attention already sits, versus where brand planning assumes it sits.
 * Ten topics, each with a real, cited press-volume count and a real, cited
 * demand-side fact, so the "for brands" line never rests on a number nobody
 * can check.
 *
 * Reframe pass 2026-09-17: hero, honesty box and the per-topic line were
 * rewritten in the attention-versus-assumption voice; added a sourced
 * scale anchor (GEA 2025 annual report via SPA), an Athar Sports Campaign
 * award callout (Zawya) and a sources-of-signal box. Google Trends could
 * not be fetched from the build environment in that pass, so the page said
 * so instead of showing anything invented.
 *
 * Trends pass 2026-09-17: Irfan exported Google Trends by hand (region
 * Saudi Arabia, "Search term" not Topic, custom range 1 Sep 2023 to 17 Sep
 * 2026, exported 17 Sep 2026) into audits/trends-en.csv and
 * audits/trends-ar.csv (monthly, Aug 2023 to Sep 2026, 38 rows, five terms
 * each), plus the related-queries exports for Saudi Pro League (EN) and
 * Riyadh Season (AR). The two monthly series are transcribed below as
 * TRENDS, numbers exact, no runtime file reads. Each batch is a relative
 * 0 to 100 index scaled to that batch's top term, so shapes and peaks
 * compare within a language, never magnitudes across languages. Every
 * existing press count, demand fact and citation is unchanged.
 *
 * 60-day EN vs AR pass 2026-09-22: Irfan ran the full ksa-culture beat,
 * both languages, over a 60-day window (2026-07-19 to 2026-09-16, SignalIQ
 * on GDELT Web News NGrams, run 22 Sep 2026) into
 * audits/culture-scan-60d-en-ar.csv. Each signal now carries `press60`
 * ({en, ar, arChecked}) so every card shows the EN vs AR split on ONE
 * window, and the ratio finally compares like for like. The 14-day English
 * counts in `counts` are kept as the original snapshot. Arabic seeds are
 * marked arChecked only where the collocation audit passed: الدوري السعودي,
 * اليوم الوطني السعودي and كرة القدم السعودية (17 Sep,
 * audits/bq-results-20260917-114749-1789645714127.csv); موسم الرياض, كأس
 * العالم للرياضات الإلكترونية and جائزة السعودية الكبرى (15 Sep seed audit).
 * صناعة السينما السعودية and الرياضات الإلكترونية السعودية are thin and
 * unchecked. السينما السعودية (80 hits) was collocation-checked on 23 Sep
 * 2026 (audits/culture-cinema-collocation.csv, 22 hits over 2 days): 21 of
 * 22 hits read دور السينما السعودية, "Saudi cinemas" (movie theatres), and
 * the URLs are mostly Egyptian outlets (Al-Masry Al-Youm, Veto, Shorouk,
 * plus Asharq Al-Awsat) reporting Egyptian films' Saudi box office. So the
 * seed is marked checked, but as a theatre / box-office signal, not the
 * industry, and the card says so. رياضة السيارات السعودية returned zero
 * over 60 days and is dropped from the page and from the beat.
 *
 * Press-volume counts in `counts` are a snapshot from a BigQuery test scan of the
 * ksa-culture beat (src/lib/signaliq/config.ts) on 2026-09-17, the same day
 * the beat itself went live. There is no backfill history yet for a live
 * query to show anything meaningful, so this page states the known counts
 * directly rather than pretending to be a live feed. House rules: no em/en
 * dashes in copy; no invented figures; honest sourcing.
 *
 * Editorial pass 2026-09-23: the page was too long and too caveated for a
 * busy reader (Megha Anthony). Seven topics keep a full card, led by the
 * "For brands" line; three thin ones (Saudi esports, Saudi motorsport,
 * Saudi film industry, `weak: true`) move to a compact watch list. The
 * 14-day chips are no longer rendered (the numbers live in METHOD_NOTES),
 * every methodology sentence sits under a collapsed "How this was
 * measured" block in § 05, and a closing box (§ 06) says what a talk built
 * on this would cover. Saudi cinema keeps its card (80 AR, real finding).
 */

export interface SourceLink {
  t: string;
  u: string;
}
const S = (t: string, u: string): SourceLink => ({ t, u });

export type SignalGroup = "sport" | "entertainment";

export interface PressCount {
  n: number;
  lang: "EN" | "AR";
  window: "14d" | "60d";
}

/** 60-day press volume, both languages, same window (2026-07-19 to
 *  2026-09-16), SignalIQ on GDELT, run 22 Sep 2026. `ar` is omitted where
 *  the Arabic pair was dropped (zero hits). `arChecked` is true only when
 *  the Arabic seed passed a collocation audit; unchecked seeds are shown
 *  with a "phrase check pending" chip and are never presented as verified. */
export interface Press60 {
  en: number;
  ar?: number;
  arChecked: boolean;
  /** Which audit cleared the Arabic seed, or why it is still pending. */
  arNote: string;
}

export interface DecodingSignal {
  id: string;
  name: string;
  ar: string;
  group: SignalGroup;
  /** true for the three watch-list topics (Saudi esports, Saudi motorsport,
   *  Saudi film industry): rendered as one compact row, not a full card. */
  weak?: boolean;
  /** One line for the watch-list row (only read when `weak` is true). */
  watchLine?: string;
  /** Press volume, from the ksa-culture beat (SignalIQ on GDELT). The
   *  original 14-day English snapshot of 17 Sep 2026; kept as data, no
   *  longer rendered as chips since the 2026-09-23 editorial pass. */
  counts: PressCount[];
  /** 60-day EN vs AR press volume, one window for both languages. */
  press60: Press60;
  /** Note when Arabic coverage outweighs English for this topic (14d/60d era flag, kept). */
  arOutweighs?: boolean;
  /** The demand-side reality: a real, cited fact the press count alone doesn't show. */
  demand: string;
  demandS: SourceLink[];
  /** What a brand marketing into Saudi should do with this: money and
   *  attention angle, grounded in the topic's real numbers, no hype. */
  forBrands: string;
}

export const SIGNALS: DecodingSignal[] = [
  {
    id: "saudi-pro-league",
    name: "Saudi Pro League",
    ar: "دوري روشن السعودي",
    group: "sport",
    press60: { en: 1495, ar: 4389, arChecked: true, arNote: "الدوري السعودي, collocation checked clean 17 Sep 2026 (78 hits sampled, all football)" },
    counts: [{ n: 385, lang: "EN", window: "14d" }],
    demand:
      "The Saudi Pro League opened the 2025/26 season with a record 37 broadcasters carrying it into more than 180 territories, including six-season Fox Sports coverage across the Americas and four-year deals with Movistar+ (Spain), Sport TV (Portugal), SPOTV (Asia) and Fancode (India). Last season the league drew more than 230 million viewers worldwide, and international rights revenue rose 20 percent over the past two seasons. ROSHN is the working model: four seasons as title sponsor, 306 matches in 2025-26, more than 30 fan activations and FANZONE matchday experiences, a presence built around the fixtures rather than a single shirt.",
    demandS: [
      S("Inside World Football, 25 Sep 2025", "https://www.insideworldfootball.com/2025/09/25/saudi-pro-league-extends-global-appeal-international-broadcast-deal/"),
      S("ROSHN Group press release, 21 May 2026", "https://www.roshn.sa/news-and-events/press-releases/article-10"),
    ],
    forBrands:
      "This is the one Saudi property where press attention and audience attention already agree, and even here three quarters of the conversation is in Arabic. Budget it as an always-on channel with a weekly content rhythm built around club fandom and the table, not a single shirt or perimeter buy.",
  },
  {
    id: "esports-world-cup",
    name: "Esports World Cup",
    ar: "كأس العالم للرياضات الإلكترونية",
    group: "entertainment",
    press60: { en: 649, ar: 627, arChecked: true, arNote: "كأس العالم للرياضات الإلكترونية, checked in the 15 Sep 2026 seed audit (live in ksa-tourism)" },
    counts: [{ n: 44, lang: "EN", window: "14d" }],
    demand:
      "The 2026 Esports World Cup, running 6 July to 23 August in Riyadh, carries a record $75 million prize pool ($30 million club championship, $39 million-plus in game tournaments, a $7 million overall club award), with more than 2,000 professional players from over 200 clubs and about 100 countries confirmed.",
    demandS: [S("Saudi Press Agency, 2026", "https://www.spa.gov.sa/en/N2494768")],
    forBrands:
      "A Saudi story told to the world in English by design, the only sport property on this page where the two languages sit level. Plan the seven-week window in Riyadh as a content season with club and player tie-ins, written bilingually from day one, rather than one booth in a hall.",
  },
  {
    id: "saudi-football",
    name: "Saudi football",
    ar: "كرة القدم السعودية",
    group: "sport",
    press60: { en: 76, ar: 246, arChecked: true, arNote: "كرة القدم السعودية, collocation checked clean 17 Sep 2026 (heritage and feature pieces)" },
    counts: [{ n: 34, lang: "EN", window: "14d" }],
    demand:
      "The story English press still tells is the 2023 transfer-spending boom; the current one is the opposite. By late July 2026, Al-Ittihad's transfer spend had dropped from SAR 374 million (same period, 2024) to SAR 68 million, Al-Nassr had made zero signings while carrying SAR 800 million (about $213 million) in debt, and PIF's 2026-30 strategy no longer names sports investment as a priority. Privately owned Al-Hilal is the exception, having signed Crysencio Summerville for $91 million.",
    demandS: [S("Semafor, 30 Jul 2026", "https://www.semafor.com/article/07/30/2026/saudi-soccer-enters-an-era-of-prudent-spending")],
    forBrands:
      "The price of club partnerships is heading down while the audience is not, and the Arabic press writes the heritage and club story, not the transfer-spend story. This is a buyer's window: negotiate multi-season club and league deals now, built around the league story rather than a single imported name.",
  },
  {
    id: "saudi-national-day",
    name: "Saudi National Day",
    ar: "اليوم الوطني السعودي",
    group: "entertainment",
    press60: { en: 26, ar: 292, arChecked: true, arNote: "اليوم الوطني السعودي, collocation checked clean 17 Sep 2026 (lifestyle and retail press)" },
    counts: [{ n: 23, lang: "EN", window: "14d" }],
    demand:
      "The 95th Saudi National Day (23 September) was marked with more than 40 cultural and heritage events at Ithra alone, plus a nationwide Diriyah program, part of a state-coordinated calendar of celebrations that runs across every major city. Al-Baik showed the home-story version of the day by re-releasing its 1980s National Day ad, original family scene recreated, a piece that needs no English press to work.",
    demandS: [
      S("Saudi Press Agency, 2025", "https://spa.gov.sa/en/N2404431"),
      S("Saudi Press Agency, 2025", "https://spa.gov.sa/en/N2405344"),
      S("Campaign Middle East, Brands weave nostalgia into Saudi National Day campaigns", "https://campaignme.com/brands-weave-nostalgia-into-saudi-national-day-campaigns/"),
    ],
    forBrands:
      "Eleven to one is the widest language gap on this page, and the Arabic coverage is lifestyle and retail press, exactly the press a consumer brand wants. Treat 23 September as a two-week Arabic-first season with local partners and venues, not a one-day logo swap measured in English clippings.",
  },
  {
    id: "riyadh-season",
    name: "Riyadh Season",
    ar: "موسم الرياض",
    group: "entertainment",
    press60: { en: 143, ar: 135, arChecked: true, arNote: "موسم الرياض, checked in the 15 Sep 2026 seed audit (live in ksa-tourism)" },
    counts: [{ n: 23, lang: "EN", window: "14d" }],
    demand:
      "Riyadh Season's fifth edition surpassed 20 million visitors, a record for the event, according to the Saudi Press Agency.",
    demandS: [S("Saudi Press Agency, 18 Feb 2026", "https://www.spa.gov.sa/en/N2265408")],
    forBrands:
      "20 million visitors under 143 English articles is the widest attention gap on this page: a season-long on-site and content presence buys a recurring audience most markets cannot offer at any price. Arabic search intent is almost entirely tickets, booking and \"when does it open\", so the ticket funnel and the opening window are where a brand should be visible first.",
  },
  {
    id: "saudi-grand-prix",
    name: "Saudi Grand Prix",
    ar: "جائزة السعودية الكبرى",
    group: "sport",
    press60: { en: 4, ar: 15, arChecked: true, arNote: "جائزة السعودية الكبرى, checked in the 15 Sep 2026 seed audit" },
    counts: [
      { n: 4, lang: "EN", window: "14d" },
      { n: 15, lang: "AR", window: "60d" },
    ],
    arOutweighs: true,
    demand:
      "Formula 1's Saudi Arabian Grand Prix is contracted to remain at the Jeddah Corniche Circuit until at least 2027, keeping the Kingdom on the calendar as it builds toward the future Qiddiya circuit.",
    demandS: [S("Motorsport.com, 2026", "https://www.motorsport.com/f1/news/saudi-arabia-f1-race-set-to-remain-in-jeddah-until-at-least-2027/10422657/")],
    forBrands:
      "Off-season the conversation is nearly four to one Arabic over English, thin on both sides. If the race-week plan is written and measured in English only, most of the audience talking about a fixture locked in through 2027 will never see it: write it in Arabic first.",
  },
  {
    id: "saudi-film-industry",
    name: "Saudi film industry",
    ar: "صناعة السينما السعودية",
    group: "entertainment",
    weak: true,
    watchLine:
      "Eleven local titles took 13 percent of a $245 million 2025 box office, three of them in the year's top ten, and two English articles in 60 days mean almost nobody outside the Arabic press is competing for it yet.",
    press60: { en: 2, ar: 13, arChecked: false, arNote: "صناعة السينما السعودية, thin and not yet collocation checked" },
    counts: [
      { n: 2, lang: "EN", window: "14d" },
      { n: 13, lang: "AR", window: "60d" },
    ],
    arOutweighs: true,
    demand:
      "Saudi productions took 13 percent of the Kingdom's 2025 box office revenue from just 11 of 538 total film releases (about 3 percent of titles), with three Saudi films landing in the year's top ten highest-grossing releases, on a total 2025 Saudi box office of $245 million, per the Saudi Film Commission.",
    demandS: [S("Broadcast Pro Middle East, 2026", "https://www.broadcastprome.com/news/analyst-reports/saudi-film-commission-reports-245m-box-office-as-local-films-surge-in-2025/")],
    forBrands:
      "Eleven local titles took 13 percent of a $245 million box office, four times their share of releases, with three in the year's top ten. Brand integration and co-promotion with Saudi productions is cheap relative to that pull, and two English articles in 60 days (against 13 Arabic, phrase still unchecked) mean almost nobody outside the Arabic press is competing for it yet.",
  },
  {
    id: "saudi-esports",
    name: "Saudi esports",
    ar: "الرياضات الإلكترونية السعودية",
    group: "entertainment",
    weak: true,
    watchLine:
      "Eight English and three Arabic articles in 60 days, against 649 and 627 for the World Cup itself: fold it into the World Cup plan, do not fund a standalone line yet.",
    press60: { en: 8, ar: 3, arChecked: false, arNote: "الرياضات الإلكترونية السعودية, thin and not yet collocation checked" },
    counts: [{ n: 3, lang: "EN", window: "14d" }],
    demand:
      "The Saudi Esports Federation held its 2025 SEF Awards recognising the sector's rapid growth across competitive gaming, content and events.",
    demandS: [S("Arab News, 2025", "https://www.arabnews.com/node/2629584/sport")],
    forBrands:
      "Low-priority context, not a headline signal: eight English and three Arabic articles in 60 days, against 649 and 627 for the World Cup itself. Outside the Esports World Cup window, do not fund a standalone Saudi esports line yet; watch it and fold it into the World Cup plan above.",
  },
  {
    id: "saudi-motorsport",
    name: "Saudi motorsport",
    ar: "رياضة السيارات السعودية",
    group: "sport",
    weak: true,
    watchLine:
      "Five English articles in 60 days and an Arabic seed that returned nothing at all. The Qiddiya build-out (Extreme H in 2026) is an early-mover watch, not a channel to budget against this year.",
    press60: { en: 5, arChecked: false, arNote: "Arabic pair رياضة السيارات السعودية returned zero hits over 60 days and was dropped" },
    counts: [{ n: 1, lang: "EN", window: "14d" }],
    demand: "The FIA Extreme H World Cup confirmed its return to Qiddiya City for 2026, part of the Kingdom's build-out of motorsport beyond Formula 1.",
    demandS: [S("DestinationKSA, 2026", "https://destinationksa.com/en/fia-extreme-h-world-cup-2026/")],
    forBrands:
      "Low-priority context: five English articles in 60 days and an Arabic seed that returned nothing at all, so the pair was dropped. The Qiddiya build-out (Extreme H and beyond) is an early-mover watch list, not a channel to budget against this year.",
  },
  {
    id: "saudi-cinema",
    name: "Saudi cinema",
    ar: "دور السينما السعودية",
    group: "entertainment",
    press60: { en: 3, ar: 80, arChecked: true, arNote: "Arabic seed matches 'Saudi cinemas' (movie theatres), not the industry: 21 of 22 probe hits read دور السينما السعودية (23 Sep 2026, audits/culture-cinema-collocation.csv), and the sources are mostly Egyptian outlets reporting Egyptian films' Saudi box office" },
    counts: [{ n: 2, lang: "EN", window: "14d" }],
    demand:
      "Saudi Arabia now operates an estimated 580-plus cinema screens, up from zero when the decades-long cinema ban lifted in 2017, with the market projected to reach roughly 2,500 screens and over $1 billion in box office by 2030.",
    demandS: [S("Screen Daily, 2026", "https://www.screendaily.com/features/how-saudi-cinema-going-has-transformed-since-covid-for-the-better/5177121.article")],
    forBrands:
      "The 80 Arabic articles are about Saudi cinemas as venues, not Saudi cinema as an industry, and most of them are Egyptian outlets reporting Egyptian films' box office in Saudi theatres. Saudi screens are an export market for Egyptian film, so the line here is in-cinema advertising and premiere tie-ins around Egyptian releases.",
  },
];

export const SIGNAL_BY_ID: Map<string, DecodingSignal> = new Map(SIGNALS.map((s) => [s.id, s]));

/* ---- audience attention: Google Trends, exported by hand on 17 Sep 2026.
   Region Saudi Arabia, "Search term" (not Topic), custom range 1 Sep 2023 to
   17 Sep 2026, monthly resolution (Google returns Aug 2023 to Sep 2026, 38
   rows). Two batches of five terms, one English and one Arabic. Each batch
   is a relative 0 to 100 index scaled to that batch's top term (English:
   Saudi National Day, Sep 2024; Arabic: الدوري السعودي, Sep 2023), so a
   value compares across months and across terms within one language, and
   never across languages. Only five of the ten topics were exported;
   the other five have no trend line. Numbers transcribed exactly from
   audits/trends-en.csv and audits/trends-ar.csv. ---- */
export interface TrendSeries {
  enTerm: string;
  en: number[];
  arTerm: string;
  ar: number[];
}
export const TRENDS_MONTHS: string[] = [
  "2023-08", "2023-09", "2023-10", "2023-11", "2023-12", "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09",
];

export const TRENDS: Record<string, TrendSeries> = {
  "saudi-pro-league": {
    enTerm: "Saudi Pro League",
    en: [31, 34, 25, 25, 31, 5, 16, 18, 20, 25, 1, 2, 14, 22, 20, 20, 8, 26, 32, 19, 32, 33, 1, 2, 9, 18, 16, 19, 11, 39, 41, 19, 26, 41, 2, 3, 19, 34],
    arTerm: "الدوري السعودي",
    ar: [88, 100, 85, 85, 92, 10, 44, 47, 46, 54, 4, 4, 25, 38, 39, 45, 20, 60, 78, 50, 71, 85, 4, 4, 22, 41, 36, 39, 22, 94, 89, 41, 54, 76, 4, 5, 40, 75],
  },
  "esports-world-cup": {
    enTerm: "Esports World Cup",
    en: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
    arTerm: "كأس العالم للرياضات الإلكترونية",
    ar: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  "riyadh-season": {
    enTerm: "Riyadh Season",
    en: [3, 4, 8, 13, 9, 6, 5, 2, 3, 2, 1, 2, 5, 4, 8, 6, 4, 3, 2, 2, 1, 1, 1, 1, 3, 3, 7, 7, 5, 3, 3, 2, 2, 2, 1, 1, 3, 2],
    arTerm: "موسم الرياض",
    ar: [1, 2, 4, 8, 4, 6, 6, 7, 2, 1, 1, 1, 1, 2, 3, 3, 2, 2, 1, 1, 1, 0, 0, 1, 1, 1, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  },
  "saudi-grand-prix": {
    enTerm: "Saudi Grand Prix",
    en: [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0],
    arTerm: "جائزة السعودية الكبرى",
    ar: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  "saudi-national-day": {
    enTerm: "Saudi National Day",
    en: [9, 90, 2, 2, 2, 2, 5, 1, 1, 1, 2, 3, 13, 100, 2, 2, 9, 2, 5, 1, 1, 1, 2, 3, 11, 64, 2, 4, 3, 2, 4, 1, 1, 2, 3, 3, 10, 33],
    arTerm: "اليوم الوطني السعودي",
    ar: [8, 30, 1, 1, 1, 1, 1, 0, 1, 1, 1, 2, 9, 21, 1, 1, 1, 1, 1, 0, 1, 1, 1, 2, 8, 17, 1, 1, 1, 1, 1, 0, 1, 1, 1, 2, 6, 13],
  },
};

/** Peak month for a series: the first month at the series maximum. */
export function trendPeak(vals: number[]): { month: string; val: number } {
  let best = 0;
  for (let i = 1; i < vals.length; i++) if (vals[i] > vals[best]) best = i;
  return { month: TRENDS_MONTHS[best], val: vals[best] };
}
export function trendAvg(vals: number[]): number {
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2024-09" to "Sep 2024". */
export function fmtMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

/* ---- what people actually search: top related queries from the Trends
   export, same region and range. EN batch for Saudi Pro League, AR batch
   for Riyadh Season; quoted verbatim with their relative interest score
   (100 = the top related query). ---- */
export interface TrendQuery {
  q: string;
  n: number;
}
export const TREND_SEARCHES: Record<string, { lang: "EN" | "AR"; lead: string; queries: TrendQuery[] }> = {
  "saudi-pro-league": {
    lang: "EN",
    lead: "Standings, fixtures and two clubs: ",
    queries: [
      { q: "saudi pro league standings", n: 100 },
      { q: "saudi pro league games", n: 45 },
      { q: "al-nassr", n: 32 },
      { q: "saudi pro league table", n: 30 },
      { q: "al hilal", n: 21 },
    ],
  },
  "riyadh-season": {
    lang: "AR",
    lead: "Tickets, booking and when it opens: ",
    queries: [
      { q: "موسم الرياض تذاكر", n: 75 },
      { q: "تذاكر موسم الرياض", n: 68 },
      { q: "متى موسم الرياض", n: 45 },
      { q: "حجز موسم الرياض", n: 40 },
    ],
  },
};

/* ---- the attention callout: four findings from the two series, in plain
   prose, plus the scaling rule and the Arabic phrasing caveat. ---- */
export const ATTENTION_CALLOUT = {
  label: "Attention, not just coverage",
  paras: [
    "The press counts above say what gets written. Google Trends says what Saudi audiences actually look up. Four things stand out across the 38 months from Aug 2023 to Sep 2026. First, Saudi National Day spikes every September in both languages, and the English spike is the single biggest reading in the whole export (100 in Sep 2024, 90 in Sep 2023, 64 in Sep 2025), against a near-flat 1 to 5 the rest of the year. Second, the Arabic phrase for the league, الدوري السعودي, dominates Arabic search: it averages 48 out of 100 across the period with no zero months, while English \"Saudi Pro League\" averages 20, with the same summer dips in June and July when there are no fixtures. Third, Riyadh Season peaks in November and December (English high of 13 in Nov 2023) and its Arabic related queries are almost all tickets, booking and \"when\", not the entertainment itself. Fourth, Esports World Cup and Saudi Grand Prix barely register as search terms in either language.",
    "How to read the lines. Google Trends indexes each batch of five terms to that batch's own top term, so every value is relative to one peak per language: Saudi National Day in Sep 2024 for English, الدوري السعودي in Sep 2023 for Arabic. Shapes and peak months compare within a language. Heights never compare across the two languages, and a 13 on the English side is not smaller or larger than a 13 on the Arabic side; it is simply a different ruler.",
    "One honest caveat. The Arabic terms for Esports World Cup (كأس العالم للرياضات الإلكترونية) and Saudi Grand Prix (جائزة السعودية الكبرى) return zero in all 38 months, and the English versions are near zero too (English Grand Prix has 31 zero months out of 38). For the Grand Prix that is most likely a phrasing miss, because people search the race by other names, and for the Esports World Cup the formal Arabic name is probably not what fans type. Treat those two lines as unknown, not as no interest.",
  ],
  src: [S("Google Trends, region Saudi Arabia, Search term, 1 Sep 2023 to 17 Sep 2026, exported 17 Sep 2026", "https://trends.google.com/trends/explore?geo=SA&date=2023-09-01%202026-09-17&q=Saudi%20Pro%20League,Esports%20World%20Cup,Riyadh%20Season,Saudi%20Grand%20Prix,Saudi%20National%20Day")],
};

/* ---- anchor stat: scale context before the topic-level data. Verified at
   the primary source: the Saudi Press Agency's report of the General
   Entertainment Authority's 2025 annual report (2 Apr 2026). A commonly
   circulated "$6.1B entertainment market" figure from market-research
   aggregators was checked and deliberately not used: it is a research-firm
   estimate, not an official number. No official spend figure (GASTAT
   household recreation spend, SAMA POS by sector) was found at annual
   resolution during this pass, so visitor volume is the anchor. ---- */
export const ANCHOR_STAT = {
  label: "Entertainment-sector visitors, 2025",
  val: "89M+",
  sub: "1,690 licensed events, 6,490 licences issued and 6,778 companies active, per the General Entertainment Authority's 2025 annual report. An official count of people, not a research-firm market-size estimate.",
  src: [S("Saudi Press Agency, 2 Apr 2026, reporting the GEA 2025 annual report", "https://spa.gov.sa/en/N2551734")],
};

/* ---- Athar's own new Sports Campaign award category, added for 2026: the
   direct link between this page's sport and entertainment cut and something
   Athar itself just prioritized this year. ---- */
export const ATHAR_CALLOUT = {
  label: "Athar already moved this way",
  text: "Athar Awards added a Sports Campaign category for 2026, for creative marketing campaigns that use sport to support Vision 2030, strengthen national pride and build the Kingdom's global sporting profile ahead of the AFC Asian Cup and the FIFA World Cup 2034. The festival's own jury now treats sport as a marketing discipline, which is the bet this page is testing with data. Mohamed Al-Ayed of TRACCS, co-presenter of the festival, has framed the 2026 edition as positioning Saudi creative identity \"as a regional export rather than simply a destination for international expertise\", with \"homegrown creativity and authentic local storytelling as commercial drivers\". The data on this page shows where that home story is already being written, and in which language.",
  src: [
    S("Zawya, 6 Aug 2026", "https://www.zawya.com/en/press-release/events-conferences/athar-awards-expands-to-include-new-sports-campaign-category-and-80-industry-veterans-on-the-2026-jury-panel-423491"),
    S("Arab News, Athar Festival expands program to drive Saudi creative industry growth", "https://www.arabnews.com/saudi-arabia/athar-festival-expands-program-to-drive-saudi-creative-industry-growth-3002333"),
  ],
};

/* ---- sources of signal: the three data legs a full read would use, and
   which of them this page actually has. ---- */
export interface SignalLeg {
  name: string;
  used: boolean;
  note: string;
}
export const SIGNAL_LEGS: SignalLeg[] = [
  {
    name: "Press coverage",
    used: true,
    note: "SignalIQ on GDELT Web News NGrams: a 60-day English plus Arabic scan of all ten topics, both languages on one window, so the split bars, the chart and the ratios compare like for like. Seven Arabic seeds have passed a phrase check; two thin ones are still pending and say so. Dates, seed names and audit files are under How this was measured below.",
  },
  {
    name: "Audience attention",
    used: true,
    note: "Google Trends, region Saudi Arabia, Search term (not Topic), 1 Sep 2023 to 17 Sep 2026, two batches of five terms (English and Arabic) plus the top related queries for Saudi Pro League and Riyadh Season. This is what the sparklines, the peak chips and the \"what people search\" lines on five of the cards show. Each batch is indexed to its own top term, so heights compare within a language only.",
  },
  {
    name: "Official scale and spend",
    used: true,
    note: "GEA 2025 annual report (visitors, events, licences) via SPA. No official spend series (GASTAT household recreation spend, SAMA POS by sector) at annual resolution was used.",
  },
];
export const SIGNAL_LEGS_NOT_USED =
  "For a fuller read, the sources this page does not use: Nielsen Sports and YouGov Sport (fan and sponsorship tracking), the Ministry of Sport annual report (participation and federation data), and Google Trends for the five topics not exported in this pass (Saudi football, Saudi film industry, Saudi esports, Saudi motorsport, Saudi cinema).";

/* ---- § 04, what did not work: three plain lines, no method talk. ---- */
export const NOT_WORKED: string[] = [
  "The wider Saudi culture topics this cut started with (streaming, youth culture, festivals beyond the ones named) tested at near-zero press volume, so they are not on this page.",
  "The Saudi cinema Arabic seed counts Saudi theatres, not the industry: 21 of 22 checked hits read دور السينما السعودية, mostly in Egyptian outlets reporting Egyptian films' Saudi box office.",
  "Two thin Arabic seeds, صناعة السينما السعودية (13) and الرياضات الإلكترونية السعودية (3), are still unverified and carry a phrase check pending chip.",
];

/* ---- § 05, "How this was measured": every methodology sentence the page
   used to carry inline (scan dates, run dates, seed names, collocation
   audits, the 14-day snapshot, the no-backfill note), collapsed behind a
   <details> so the busy reader never has to see it. ---- */
export const METHOD_NOTES: { h: string; t: string }[] = [
  {
    h: "Press counts",
    t: "One BigQuery scan of the ksa-culture beat (SignalIQ on GDELT Web News NGrams), both languages, 2026-07-19 to 2026-09-16, run 2026-09-22 (audits/culture-scan-60d-en-ar.csv). Every split bar, the chart and the § 01 totals come from this one window.",
  },
  {
    h: "The 14-day snapshot",
    t: "The beat went live on 2026-09-17 and a 14-day English-only scan that day gave the first counts: Saudi Pro League 385, Esports World Cup 44, Saudi football 34, Saudi National Day 23, Riyadh Season 23, Saudi Grand Prix 4, Saudi esports 3, Saudi film industry 2, Saudi cinema 2, Saudi motorsport 1. Those chips came off the cards on 2026-09-23; the numbers are kept here.",
  },
  {
    h: "Arabic seeds and the collocation audits",
    t: "An Arabic seed is shown as verified only after a collocation check (a PROBE sample of the hits, read by hand for what the phrase actually sits next to). الدوري السعودي (78 hits sampled, all football), اليوم الوطني السعودي and كرة القدم السعودية passed on 17 Sep 2026 (audits/bq-results-20260917-114749-1789645714127.csv); موسم الرياض, كأس العالم للرياضات الإلكترونية and جائزة السعودية الكبرى passed in the 15 Sep 2026 seed audit. السينما السعودية (80 hits) was checked on 23 Sep 2026 (audits/culture-cinema-collocation.csv, 22 hits over 2 days): 21 of 22 read دور السينما السعودية, Saudi cinemas as venues, in mostly Egyptian outlets (Al-Masry Al-Youm, Veto, Shorouk, plus Asharq Al-Awsat), so it counts as a theatre and box-office signal, not the industry. صناعة السينما السعودية (13) and الرياضات الإلكترونية السعودية (3) are thin and not yet checked. رياضة السيارات السعودية returned zero over 60 days and was dropped from the beat.",
  },
  {
    h: "Search interest",
    t: "Google Trends, region Saudi Arabia, Search term (not Topic), custom range 1 Sep 2023 to 17 Sep 2026, exported by hand on 17 Sep 2026: monthly, Aug 2023 to Sep 2026, 38 rows, five terms per language (audits/trends-en.csv, audits/trends-ar.csv), plus the related-queries exports for Saudi Pro League (EN) and Riyadh Season (AR). Only five of the ten topics were exported; the other five rest on official visitor and broadcast numbers only.",
  },
  {
    h: "Why the numbers are stated, not live",
    t: "There is no backfill history yet for a live query to show anything meaningful, so this page states the known numbers directly instead of wiring a live feed that would have nothing behind it.",
  },
];

/* ---- § 06 closing box: what a talk built on this would cover. Three
   bullets in Irfan's plain voice, one line on the data set. No ask. ---- */
export const CLOSING = {
  label: "What a talk built on this would cover",
  points: [
    "The export story and the home story. What Saudi tells the world is written in English; what Saudis care about is written in Arabic, three to eleven times over. A media plan written from the English press buys the export story and misses the home one.",
    "The three moments where Arabic press and Arabic search line up: the league, week to week, where a brand belongs in the fixtures and the table rather than on a shirt; the National Day fortnight, an Arabic-first retail season rather than a one-day logo swap; and the Riyadh Season ticket window, where the search is tickets and booking, so the brand belongs in the funnel before the gates open.",
    "How to read press signal against audience numbers. 20 million visitors under 143 English articles is a different buy from 230 million viewers under 1,495, and the plan should follow the attention, not the coverage.",
  ],
  line: "The data set behind this updates nightly, and a fuller cut can be run on any category.",
};

/* ---- sources footer ---- */
export const SRC_GROUPS: { h: string; links: SourceLink[] }[] = [
  {
    h: "Broadcast, prize money & official figures",
    links: [
      S("Inside World Football · SPL broadcast deal, Sep 2025", "https://www.insideworldfootball.com/2025/09/25/saudi-pro-league-extends-global-appeal-international-broadcast-deal/"),
      S("SPA · Esports World Cup 2026 prize pool", "https://www.spa.gov.sa/en/N2494768"),
      S("SPA · Riyadh Season 2025, 20M visitors", "https://www.spa.gov.sa/en/N2265408"),
      S("SPA · 95th Saudi National Day", "https://spa.gov.sa/en/N2404431"),
      S("SPA · Diriyah, 95th National Day", "https://spa.gov.sa/en/N2405344"),
      S("SPA · GEA 2025 annual report, 89M entertainment visitors", "https://spa.gov.sa/en/N2551734"),
      S("Zawya · Athar Awards 2026 Sports Campaign category", "https://www.zawya.com/en/press-release/events-conferences/athar-awards-expands-to-include-new-sports-campaign-category-and-80-industry-veterans-on-the-2026-jury-panel-423491"),
      S("Athar Festival · call for content criteria", "https://atharfestival.com/cfc/"),
    ],
  },
  {
    h: "Business & trade press",
    links: [
      S("Semafor · Saudi soccer's prudent-spending era, Jul 2026", "https://www.semafor.com/article/07/30/2026/saudi-soccer-enters-an-era-of-prudent-spending"),
      S("Motorsport.com · Jeddah GP contract to at least 2027", "https://www.motorsport.com/f1/news/saudi-arabia-f1-race-set-to-remain-in-jeddah-until-at-least-2027/10422657/"),
      S("Broadcast Pro ME · Saudi Film Commission, $245M box office 2025", "https://www.broadcastprome.com/news/analyst-reports/saudi-film-commission-reports-245m-box-office-as-local-films-surge-in-2025/"),
      S("Arab News · 2025 SEF Awards", "https://www.arabnews.com/node/2629584/sport"),
      S("DestinationKSA · Extreme H at Qiddiya 2026", "https://destinationksa.com/en/fia-extreme-h-world-cup-2026/"),
      S("Screen Daily · Saudi cinema-going since Covid", "https://www.screendaily.com/features/how-saudi-cinema-going-has-transformed-since-covid-for-the-better/5177121.article"),
    ],
  },
  {
    h: "Method & the live wire",
    links: [
      S("Google Trends · SA, Search term, 1 Sep 2023 to 17 Sep 2026, exported 17 Sep 2026", "https://trends.google.com/trends/explore?geo=SA&date=2023-09-01%202026-09-17&q=Saudi%20Pro%20League,Esports%20World%20Cup,Riyadh%20Season,Saudi%20Grand%20Prix,Saudi%20National%20Day"),
      S("SignalIQ · ksa-culture beat, 60-day EN + AR scan, 19 Jul to 16 Sep 2026, run 22 Sep 2026", "https://www.syedirfanajmal.com/tools/signaliq"),
      S("GDELT · Web News NGrams 3.0 (65-language corpus)", "https://blog.gdeltproject.org/announcing-the-new-web-news-ngrams-3-0-dataset/"),
      S("SignalIQ · the tool behind the wire", "https://www.syedirfanajmal.com/tools/signaliq"),
      S("KSA Retail & Consumer Radar · the sibling instrument", "https://www.syedirfanajmal.com/ksa-retail-radar"),
      S("KSA Tourism Radar · the sibling instrument", "https://www.syedirfanajmal.com/ksa-tourism-radar"),
    ],
  },
];
