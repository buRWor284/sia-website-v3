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
 * award callout (Zawya) and a sources-of-signal box. Google Trends was
 * attempted as a third data leg (pytrends, geo SA, 12 months) and could not
 * be fetched from the build environment (network blocked), so the page says
 * so instead of showing anything invented. Every existing number and
 * citation from the prior passes is unchanged.
 *
 * Press-volume counts are a snapshot from a BigQuery test scan of the
 * ksa-culture beat (src/lib/signaliq/config.ts) on 2026-09-17, the same day
 * the beat itself went live. There is no backfill history yet for a live
 * query to show anything meaningful, so this page states the known counts
 * directly rather than pretending to be a live feed. House rules: no em/en
 * dashes in copy; no invented figures; honest sourcing (three of the ten
 * topics are marked weak/low-priority context and get a single grounding
 * fact, not a full signal file, because that is what the real coverage
 * supports).
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

export interface DecodingSignal {
  id: string;
  name: string;
  ar: string;
  group: SignalGroup;
  /** true for the three low-priority context topics: one grounding fact, not a full file. */
  weak?: boolean;
  /** Press volume, from the ksa-culture beat (SignalIQ on GDELT). */
  counts: PressCount[];
  /** Note when Arabic coverage outweighs English for this topic. */
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
    counts: [{ n: 385, lang: "EN", window: "14d" }],
    demand:
      "The Saudi Pro League opened the 2025/26 season with a record 37 broadcasters carrying it into more than 180 territories, including six-season Fox Sports coverage across the Americas and four-year deals with Movistar+ (Spain), Sport TV (Portugal), SPOTV (Asia) and Fancode (India). Last season the league drew more than 230 million viewers worldwide, and international rights revenue rose 20 percent over the past two seasons.",
    demandS: [S("Inside World Football, 25 Sep 2025", "https://www.insideworldfootball.com/2025/09/25/saudi-pro-league-extends-global-appeal-international-broadcast-deal/")],
    forBrands:
      "385 English articles in 14 days and a 230 million viewer footprint is the one Saudi property where press attention and audience attention already agree. Budget it as an always-on channel with a weekly content rhythm, not a single shirt or perimeter buy, because the coverage arrives every week whether you are in it or not.",
  },
  {
    id: "esports-world-cup",
    name: "Esports World Cup",
    ar: "كأس العالم للرياضات الإلكترونية",
    group: "entertainment",
    counts: [{ n: 44, lang: "EN", window: "14d" }],
    demand:
      "The 2026 Esports World Cup, running 6 July to 23 August in Riyadh, carries a record $75 million prize pool ($30 million club championship, $39 million-plus in game tournaments, a $7 million overall club award), with more than 2,000 professional players from over 200 clubs and about 100 countries confirmed.",
    demandS: [S("Saudi Press Agency, 2026", "https://www.spa.gov.sa/en/N2494768")],
    forBrands:
      "A $75 million prize pool and a 100-country field with only 44 English articles in 14 days, a few weeks after it closed, means the audience is far bigger than the coverage. Plan the seven-week window in Riyadh as a content season with club and player tie-ins, rather than one booth in a hall, and expect the press to lag the audience.",
  },
  {
    id: "saudi-football",
    name: "Saudi football",
    ar: "كرة القدم السعودية",
    group: "sport",
    counts: [{ n: 34, lang: "EN", window: "14d" }],
    demand:
      "The story English press still tells is the 2023 transfer-spending boom; the current one is the opposite. By late July 2026, Al-Ittihad's transfer spend had dropped from SAR 374 million (same period, 2024) to SAR 68 million, Al-Nassr had made zero signings while carrying SAR 800 million (about $213 million) in debt, and PIF's 2026-30 strategy no longer names sports investment as a priority. Privately owned Al-Hilal is the exception, having signed Crysencio Summerville for $91 million.",
    demandS: [S("Semafor, 30 Jul 2026", "https://www.semafor.com/article/07/30/2026/saudi-soccer-enters-an-era-of-prudent-spending")],
    forBrands:
      "With transfer spend at Al-Ittihad down from SAR 374 million to SAR 68 million and PIF no longer naming sport as a priority, the price of club partnerships is heading down while the audience is not. This is a buyer's window: negotiate multi-season club and league deals now, and build the plan around the league story rather than a single imported name.",
  },
  {
    id: "saudi-national-day",
    name: "Saudi National Day",
    ar: "اليوم الوطني السعودي",
    group: "entertainment",
    counts: [{ n: 23, lang: "EN", window: "14d" }],
    demand:
      "The 95th Saudi National Day (23 September) was marked with more than 40 cultural and heritage events at Ithra alone, plus a nationwide Diriyah program, part of a state-coordinated calendar of celebrations that runs across every major city.",
    demandS: [S("Saudi Press Agency, 2025", "https://spa.gov.sa/en/N2404431"), S("Saudi Press Agency, 2025", "https://spa.gov.sa/en/N2405344")],
    forBrands:
      "23 English articles for a nationwide, multi-city, state-coordinated celebration (40-plus events at Ithra alone) says the English press is not where this moment lives. Treat 23 September as a two-week Arabic-first season with local partners and venues, and stop measuring it by a one-day logo swap and English clippings.",
  },
  {
    id: "riyadh-season",
    name: "Riyadh Season",
    ar: "موسم الرياض",
    group: "entertainment",
    counts: [{ n: 23, lang: "EN", window: "14d" }],
    demand:
      "Riyadh Season's fifth edition surpassed 20 million visitors, a record for the event, according to the Saudi Press Agency.",
    demandS: [S("Saudi Press Agency, 18 Feb 2026", "https://www.spa.gov.sa/en/N2265408")],
    forBrands:
      "20 million visitors against 23 English articles in 14 days is the widest attention gap on this page. A brand that builds a season-long on-site and content presence gets a recurring audience most markets cannot offer at any price, and gets it before the English press has told anyone it is there.",
  },
  {
    id: "saudi-grand-prix",
    name: "Saudi Grand Prix",
    ar: "جائزة السعودية الكبرى",
    group: "sport",
    counts: [
      { n: 4, lang: "EN", window: "14d" },
      { n: 15, lang: "AR", window: "60d" },
    ],
    arOutweighs: true,
    demand:
      "Formula 1's Saudi Arabian Grand Prix is contracted to remain at the Jeddah Corniche Circuit until at least 2027, keeping the Kingdom on the calendar as it builds toward the future Qiddiya circuit.",
    demandS: [S("Motorsport.com, 2026", "https://www.motorsport.com/f1/news/saudi-arabia-f1-race-set-to-remain-in-jeddah-until-at-least-2027/10422657/")],
    forBrands:
      "Off-season, the Grand Prix conversation is roughly four to one Arabic over English (15 AR articles in 60 days versus 4 EN in 14). If your race-week plan is written and measured in English only, most of the audience talking about a fixture locked in through 2027 will never see it. Write the plan in Arabic first.",
  },
  {
    id: "saudi-film-industry",
    name: "Saudi film industry",
    ar: "صناعة السينما السعودية",
    group: "entertainment",
    counts: [
      { n: 2, lang: "EN", window: "14d" },
      { n: 13, lang: "AR", window: "60d" },
    ],
    arOutweighs: true,
    demand:
      "Saudi productions took 13 percent of the Kingdom's 2025 box office revenue from just 11 of 538 total film releases (about 3 percent of titles), with three Saudi films landing in the year's top ten highest-grossing releases, on a total 2025 Saudi box office of $245 million, per the Saudi Film Commission.",
    demandS: [S("Broadcast Pro Middle East, 2026", "https://www.broadcastprome.com/news/analyst-reports/saudi-film-commission-reports-245m-box-office-as-local-films-surge-in-2025/")],
    forBrands:
      "Eleven local titles took 13 percent of a $245 million box office, four times their share of releases, with three in the year's top ten. Brand integration and co-promotion with Saudi productions is cheap relative to that pull, and the two English articles in 14 days mean almost nobody outside the Arabic press is competing for it yet.",
  },
  {
    id: "saudi-esports",
    name: "Saudi esports",
    ar: "الرياضات الإلكترونية السعودية",
    group: "entertainment",
    weak: true,
    counts: [{ n: 3, lang: "EN", window: "14d" }],
    demand:
      "The Saudi Esports Federation held its 2025 SEF Awards recognising the sector's rapid growth across competitive gaming, content and events.",
    demandS: [S("Arab News, 2025", "https://www.arabnews.com/node/2629584/sport")],
    forBrands:
      "Low-priority context, not a headline signal: three English articles in 14 days. Outside the Esports World Cup window, do not fund a standalone Saudi esports line yet; watch it and fold it into the World Cup plan above.",
  },
  {
    id: "saudi-motorsport",
    name: "Saudi motorsport",
    ar: "رياضة المحركات السعودية",
    group: "sport",
    weak: true,
    counts: [{ n: 1, lang: "EN", window: "14d" }],
    demand: "The FIA Extreme H World Cup confirmed its return to Qiddiya City for 2026, part of the Kingdom's build-out of motorsport beyond Formula 1.",
    demandS: [S("DestinationKSA, 2026", "https://destinationksa.com/en/fia-extreme-h-world-cup-2026/")],
    forBrands:
      "Low-priority context: one English article in 14 days. The Qiddiya build-out (Extreme H and beyond) is an early-mover watch list, not a channel to budget against this year.",
  },
  {
    id: "saudi-cinema",
    name: "Saudi cinema",
    ar: "دور السينما في السعودية",
    group: "entertainment",
    weak: true,
    counts: [{ n: 2, lang: "EN", window: "14d" }],
    demand:
      "Saudi Arabia now operates an estimated 580-plus cinema screens, up from zero when the decades-long cinema ban lifted in 2017, with the market projected to reach roughly 2,500 screens and over $1 billion in box office by 2030.",
    demandS: [S("Screen Daily, 2026", "https://www.screendaily.com/features/how-saudi-cinema-going-has-transformed-since-covid-for-the-better/5177121.article")],
    forBrands:
      "Low-priority context: two English articles in 14 days, but 580-plus screens today from zero in 2017 is real venue inventory. Worth a line for in-cinema advertising and premiere tie-ins, priced against the film-industry signal above rather than on its own.",
  },
];

export const SIGNAL_BY_ID: Map<string, DecodingSignal> = new Map(SIGNALS.map((s) => [s.id, s]));

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
  text: "Athar Awards added a Sports Campaign category for 2026, for creative marketing campaigns that use sport to support Vision 2030, strengthen national pride and build the Kingdom's global sporting profile ahead of the AFC Asian Cup and the FIFA World Cup 2034. The festival's own jury now treats sport as a marketing discipline, which is the bet this page is testing with data.",
  src: [S("Zawya, 6 Aug 2026", "https://www.zawya.com/en/press-release/events-conferences/athar-awards-expands-to-include-new-sports-campaign-category-and-80-industry-veterans-on-the-2026-jury-panel-423491")],
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
    note: "SignalIQ on GDELT, English and Arabic article counts per topic. This is what the chips, the chart and the AR/EN split bars show.",
  },
  {
    name: "Audience attention",
    used: false,
    note: "Google Trends (KSA, 12 months) was attempted for the main topics and could not be fetched from the build environment on 17 Sep. Not shown rather than estimated. Would sharpen the Riyadh Season and National Day gaps most.",
  },
  {
    name: "Official scale and spend",
    used: true,
    note: "GEA 2025 annual report (visitors, events, licences) via SPA. No official spend series (GASTAT household recreation spend, SAMA POS by sector) at annual resolution was used.",
  },
];
export const SIGNAL_LEGS_NOT_USED =
  "For a fuller read, the sources this page does not use: Nielsen Sports and YouGov Sport (fan and sponsorship tracking), the Ministry of Sport annual report (participation and federation data), and Google Trends once fetchable.";

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
      S("GDELT · Web News NGrams 3.0 (65-language corpus)", "https://blog.gdeltproject.org/announcing-the-new-web-news-ngrams-3-0-dataset/"),
      S("SignalIQ · the tool behind the wire", "https://www.syedirfanajmal.com/tools/signaliq"),
      S("KSA Retail & Consumer Radar · the sibling instrument", "https://www.syedirfanajmal.com/ksa-retail-radar"),
      S("KSA Tourism Radar · the sibling instrument", "https://www.syedirfanajmal.com/ksa-tourism-radar"),
    ],
  },
];
