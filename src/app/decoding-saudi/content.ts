/**
 * Decoding Saudi: Sport & Entertainment Press Signal — curated content layer.
 *
 * Hidden LinkedIn give for Megha S Anthony (Content Head, Athar Festival),
 * built to support a moderator-seat ask on a "Decoding Saudi" conference
 * stream. Ten topics, each with a real, cited press-volume count and a real,
 * cited demand-side fact, so the "talk" line never rests on a number nobody
 * can check.
 *
 * Press-volume counts are a snapshot from a BigQuery test scan of the
 * ksa-culture beat (src/lib/signaliq/config.ts) on 2026-09-17, the same day
 * the beat itself went live. There is no backfill history yet for a live
 * query to show anything meaningful, so this page states the known counts
 * directly rather than pretending to be a live feed (same approach the
 * bare-bones first draft used, kept deliberately: no invented "live" data).
 * Demand-side facts were researched 2026-09-17 via web search; every one
 * links to a named, dated source. House rules: no em/en dashes in copy; no
 * invented figures; honest sourcing (three of the ten topics are marked
 * weak/low-priority context and get a single grounding fact, not a full
 * signal file, because that is what the real coverage supports).
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
  /** Live-wire press volume, from the ksa-culture beat. */
  counts: PressCount[];
  /** Note when Arabic coverage outweighs English for this topic. */
  arOutweighs?: boolean;
  /** The demand-side reality: a real, cited fact the press count alone doesn't show. */
  demand: string;
  demandS: SourceLink[];
  /** Why this matters for a moderator / conference talk angle. Grounded, no hype. */
  talk: string;
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
    talk: "385 English articles in 14 days is real volume, and it sits under a 230 million viewer global broadcast footprint. The moderator angle: this is no longer a curiosity story, it is a distribution story, and most panels still frame it as the former.",
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
    talk: "44 English articles in 14 days against a $75M prize pool and 100-country field is a coverage gap, not a demand gap. The talk angle: esports is the one Saudi entertainment story with a hard, comparable dollar number, and it is still under-filed.",
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
    talk: "34 general 'Saudi football' articles in 14 days, most still chasing the transfer-splash narrative from 2023, while the real 2026 story, a PIF pullback and a prudent-spending pivot, is thinly covered. This is a live contrarian angle for a moderator to bring to a panel still asking about the last galactico signing.",
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
    talk: "23 articles in 14 days for a nationally coordinated, multi-city cultural calendar is a soft-power story that rarely gets covered as one. A panel on Saudi cultural diplomacy has an obvious annual hook sitting in plain sight every September.",
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
    talk: "23 articles in 14 days against a 20-million-visitor annual footprint is one of the largest volume-to-coverage gaps on this whole cut. It is the single easiest 'the numbers nobody expects' opener for a moderator to use.",
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
    talk: "Only 4 English articles in 14 days, but 15 Arabic articles over 60 days: Arabic coverage clearly outweighs English here. That asymmetry is itself the talk, an F1-calendar fixture through at least 2027 that the English-language press barely files outside race week.",
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
    talk: "2 English articles in 14 days for an industry where 3 percent of releases just took 13 percent of the box office is close to a null result in English press. Arabic coverage runs well ahead. A moderator can open with that gap alone.",
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
    talk: "Kept here as low-priority context, not a headline signal: real activity, thin dedicated press outside the Esports World Cup peg above.",
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
    talk: "Kept here as low-priority context: the broader motorsport build-out (Qiddiya, Extreme H, Dakar-adjacent events) is real but effectively uncovered in English outside the Saudi Grand Prix signal above.",
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
    talk: "Kept here as low-priority context, separate from the film-industry signal above: this is the exhibition side, screens and venues, not production, and it is a genuinely fast build-out that gets almost no dedicated English coverage.",
  },
];

export const SIGNAL_BY_ID: Map<string, DecodingSignal> = new Map(SIGNALS.map((s) => [s.id, s]));

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
