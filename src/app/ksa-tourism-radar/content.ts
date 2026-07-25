/**
 * KSA Tourism & Hospitality Radar — curated content layer (client-safe).
 *
 * This is the sourced editorial layer: 28 signal files, KPI tiles, coverage
 * gaps, and talks, compiled 24 Jul 2026. Every number links to a named source.
 * The live SignalIQ layer (src/lib/ksa-radar/data.ts) enriches it; it never
 * replaces it. House rules: no em/en dashes in copy; no invented figures;
 * recalibrations (NEOM, Mukaab, 2026 F1/EWC) shown honestly.
 */
import type { KsaLens } from "@/lib/ksa-radar/types";

export interface SourceLink {
  t: string;
  u: string;
}
const S = (t: string, u: string): SourceLink => ({ t, u });

export type KsaStatus = "hot" | "steady" | "watch" | "early";

export const STATUS_META: Record<KsaStatus, { glyph: string; label: string; note: string }> = {
  hot: { glyph: "▲", label: "hot", note: "in the news this month" },
  steady: { glyph: "●", label: "steady", note: "moving on plan" },
  watch: { glyph: "⚠", label: "watch", note: "recalibrating" },
  early: { glyph: "◦", label: "early", note: "pre-launch" },
};

export interface KsaSignal {
  id: string;
  name: string;
  ar: string;
  lens: KsaLens;
  ring: 1 | 2 | 3; // 1 live now · 2 building · 3 horizon 2030+
  status: KsaStatus;
  size: 1 | 2 | 3;
  /** Lowercase canonical topics feeding this signal's live line (may be empty). */
  topics: string[];
  /** Demand-side reality (capital, targets, traffic) — the third ingredient the press does not control. */
  demand: string;
  /** Next dated catalyst likely to move coverage. */
  catalyst: string;
  stat: string;
  statS: SourceLink[];
  sig: string;
  sigS: SourceLink[];
  talk: string;
}

export const RING_LABEL = ["LIVE NOW", "BUILDING", "HORIZON 2030+"] as const;

export const SIGNALS: KsaSignal[] = [
  /* ---- giga-projects & destinations ---- */
  {
    id: "neom", name: "NEOM / The Line", ar: "نيوم", lens: "giga", ring: 3, status: "watch", size: 3,
    topics: ["neom"],
    demand: "PIF flagship; OXAGON prioritised under new leadership",
    catalyst: "re-sequencing decisions through 2026",
    stat: "SAR 60B (~$16B) reportedly budgeted 2026-2030 to unwind contractor agreements; The Line and TROJENA paused to post-2030; Sindalah closed since its 2024 launch.",
    statS: [S("Semafor, Jun 2026", "https://www.semafor.com/article/06/07/2026/saudis-neom-faces-16-billion-bill-to-cancel-neom-contracts")],
    sig: "Reported reprioritisation toward OXAGON under new leadership; The Line floated as a data-center hub candidate (Feb 2026); temporary work stoppage reported June 2026.",
    sigS: [S("Archpaper", "https://www.archpaper.com/2026/06/neom-temporary-work-pause-the-line/"), S("DCD", "https://www.datacenterdynamics.com/en/news/saudi-arabias-neom-megaproject-could-be-redesignated-as-a-data-center-hub/")],
    talk: "Narrative repair: running earned media through a skeptical news cycle.",
  },
  {
    id: "rsg", name: "Red Sea Global", ar: "مشروع البحر الأحمر", lens: "giga", ring: 1, status: "hot", size: 3,
    topics: ["red sea global"],
    demand: "50 hotels / 8,000 keys committed by 2030",
    catalyst: "8 more resorts opening in 2026",
    stat: "About 9 of 50 planned hotels open (target: 50 hotels / 8,000 keys across 22 islands + 6 inland sites by 2030); 8 more resorts slated for 2026.",
    statS: [S("Overview", "https://en.wikipedia.org/wiki/The_Red_Sea_Destination"), S("Latte Luxury News", "https://latteluxurynews.com/2026/03/05/red-sea-global-to-expand-with-eight-new-resorts-in-2026/")],
    sig: "Six Senses AMAALA opened 8 Jul 2026: the wellness flagship joins the portfolio.",
    sigS: [S("Business Wire, 8 Jul 2026", "https://www.businesswire.com/news/home/20260708505794/en/")],
    talk: "Regenerative tourism: turning sustainability claims into verifiable coverage.",
  },
  {
    id: "alula", name: "AlUla", ar: "العلا", lens: "giga", ring: 2, status: "steady", size: 2,
    topics: ["alula"],
    demand: "2M visitors/yr target by 2035; 8,500 keys planned",
    catalyst: "PPP investor round (from Jul 2026)",
    stat: "286,259 visits in 2024 against a 2M-a-year target by 2035; ~730 hotel keys today, 8,500 planned.",
    statS: [S("AGBI project tracker", "https://www.agbi.com/saudi-giga-projects/alula/")],
    sig: "Focus shifting to PPP: AlUla courting private investors for the next phase (Jul 2026).",
    sigS: [S("AGBI, Jul 2026", "https://www.agbi.com/construction/2026/07/alula-seeks-investors-as-focus-shifts-to-ppp-for-next-phase/")],
    talk: "Closing the gap between masterplan ambition and monthly coverage reality.",
  },
  {
    id: "diriyah", name: "Diriyah", ar: "الدرعية", lens: "giga", ring: 2, status: "hot", size: 3,
    topics: ["diriyah"],
    demand: "$63.2B project; $29B+ contracts already awarded",
    catalyst: "next contract awards",
    stat: "$63.2B giga-project; $29B+ in construction contracts awarded; 3.6M visits to At-Turaif and Bujairi Terrace to date.",
    statS: [S("PIF, May 2026", "https://www.pif.gov.sa/en/news-and-insights/newswire/2026/diriyah-company-awards-490-million-contract-to-build-saudi-arabia-museum-of-contemporary-art/"), S("AGBI tracker", "https://www.agbi.com/saudi-giga-projects/diriyah/")],
    sig: "$105M Heroes' Park contract awarded 7 Jul 2026, weeks after the contemporary-art museum award.",
    sigS: [S("MEED, 7 Jul 2026", "https://www.meed.com/diriyah-awards-105m-iconic-park-contract")],
    talk: "City-scale storytelling: pacing announcements so coverage compounds.",
  },
  {
    id: "qiddiya", name: "Qiddiya", ar: "القدية", lens: "giga", ring: 1, status: "hot", size: 2,
    topics: ["qiddiya"],
    demand: "Six Flags + Aquarabia open; record-breaking hardware",
    catalyst: "summer season 2026",
    stat: "Six Flags Qiddiya City open since 31 Dec 2025: Falcons Flight is the world's tallest, fastest, longest coaster; Aquarabia water park opened Apr 2026.",
    statS: [S("PR Newswire", "https://www.prnewswire.com/news-releases/six-flags-qiddiya-city-six-flags-entertainment-corporations-first-destination-outside-north-america-is-now-officially-open-302651426.html"), S("SPA, Apr 2026", "https://spa.gov.sa/en/N2552278")],
    sig: "Summer-season campaign live (Jul 2026); Qiddiya also fronting KSA's esports story abroad at EWC Paris.",
    sigS: [S("SPA", "https://www.spa.gov.sa/ar/w2626447"), S("EWC newsroom", "https://esportsworldcup.com/en/press-releases/qiddiya-city-esports-gaming-vision-ewc-2026-paris")],
    talk: "Launch moments: converting record-breaking hardware into year-round narrative.",
  },
  {
    id: "murabba", name: "New Murabba / Mukaab", ar: "المربع الجديد", lens: "giga", ring: 3, status: "watch", size: 2,
    topics: ["new murabba", "mukaab"],
    demand: "19 km² downtown anchored by the 400m Mukaab",
    catalyst: "retender targets a 2027 restart",
    stat: "19 km² downtown anchored by the 400m Mukaab; construction beyond piling reported suspended Jan 2026 amid Vision 2030 reprioritisation.",
    statS: [S("Construction Week", "https://www.constructionweekonline.com/news/new-murabba-construction-mukaab")],
    sig: "Mukaab package reported back to market with a 2027 restart target.",
    sigS: [S("CW Saudi", "https://www.constructionweeksaudi.com/gigaprojects/giant-cube-returns-to-market")],
    talk: "What to say while the cranes wait: holding narratives for paused projects.",
  },
  {
    id: "soudah", name: "Soudah Peaks", ar: "قمم السودة", lens: "giga", ring: 3, status: "early", size: 1,
    topics: ["soudah peaks"],
    demand: "$7.7B plan; 2M visitors/yr by 2033",
    catalyst: "main packages tender Q3 2026",
    stat: "SAR ~29B ($7.7B) plan: 2,700 keys and 2M visitors a year by 2033 in Aseer's highlands; no resorts confirmed open yet.",
    statS: [S("Overview", "https://en.wikipedia.org/wiki/Soudah_Peaks")],
    sig: "Main packages expected to tender Q3 2026.",
    sigS: [S("MEED", "https://www.meed.com/saudi-arabias-likely-to-tender-soudah-peaks-in-q3")],
    talk: "Pre-launch destinations: building an earned-media base before there is a hotel to sell.",
  },
  /* ---- mega-events & entertainment ---- */
  {
    id: "riyadhseason", name: "Riyadh Season", ar: "موسم الرياض", lens: "events", ring: 1, status: "steady", size: 3,
    topics: ["riyadh season"],
    demand: "11M+ visitors last season; 18M+ the season before",
    catalyst: "2026-27 lineup announcement",
    stat: "11M+ visitors by late December in the 2025-26 season; the 2024-25 season drew 18M+.",
    statS: [S("The Saudi Times", "https://thesauditimes.net/en/riyadh-season-2025-2026-closes-its-final-weeks-after-welcoming-over-11-million-visitors/"), S("Gulf News (2024-25)", "https://gulfnews.com/world/gulf/saudi/18-million-visitors-and-counting-riyadh-season-2024-continues-to-draw-global-audience-1.500026981")],
    sig: "Season closed late Mar 2026; the 2026-27 lineup announcement is the next catalyst.",
    sigS: [S("GEA", "https://gea.gov.sa/en/media-center/news/riyadh-season-2025-surpasses-8-million-visitors/")],
    talk: "Seasonality: keeping share-of-voice when the lights are off.",
  },
  {
    id: "expo2030", name: "Expo 2030 Riyadh", ar: "إكسبو 2030 الرياض", lens: "events", ring: 2, status: "hot", size: 3,
    topics: ["expo 2030"],
    demand: "$7.8B budget; 40M+ visits expected; 197 nations",
    catalyst: "main works start Q3 2026",
    stat: "$7.8B budget; 40M+ visits expected; 197 nations; 6M m² site with ~25% leveled.",
    statS: [S("Zawya, Feb 2026", "https://www.zawya.com/en/business/real-estate/groundbreaking-of-expo-2030-riyadh-country-pavilions-likely-in-q3-c5899wxz")],
    sig: "Place and Planet pavilion design contract to AtkinsRéalis (11 Jul 2026); main buildings due to start Q3 2026.",
    sigS: [S("Saudi Gulf Projects", "https://www.saudigulfprojects.com/2026/07/expo-2030-riyadh-awards-place-and-planet-pavilion-design-consultancy-contract-to-atkinsrealis/"), S("Zawya", "https://www.zawya.com/en/projects/construction/work-on-main-buildings-in-expo-2030-riyadh-set-to-start-in-q3-2026-report-nicybtie")],
    talk: "Legacy coverage starts now, not in 2030.",
  },
  {
    id: "wc2034", name: "FIFA World Cup 2034", ar: "كأس العالم 2034", lens: "events", ring: 3, status: "hot", size: 3,
    topics: ["2034 world cup"],
    demand: "15 stadiums; SR10.1B upgrade program",
    catalyst: "King Salman Stadium due 2029",
    stat: "15 stadiums across 5 cities; the 92,000-seat King Salman International Stadium is due 2029; SR10.1B stadium-upgrade program under way.",
    statS: [S("Olympics.com", "https://www.olympics.com/en/news/saudi-arabia-2034-mens-world-cup"), S("MEED, Jul 2026", "https://www.meed.com/what-the-2026-world-cup-means-for-saudi-arabia-2034")],
    sig: "The US-hosted 2026 World Cup is being read as the dress-rehearsal lens on Saudi 2034 (Jul 2026).",
    sigS: [S("MEED", "https://www.meed.com/what-the-2026-world-cup-means-for-saudi-arabia-2034")],
    talk: "Eight-year story arcs: the earned-media roadmap to 2034.",
  },
  {
    id: "saudigp", name: "Saudi Arabian GP", ar: "جائزة السعودية الكبرى", lens: "events", ring: 1, status: "watch", size: 1,
    topics: ["saudi grand prix", "saudi arabian grand prix"],
    demand: "Jeddah hosts until the Qiddiya circuit is ready",
    catalyst: "2027 circuit decision",
    stat: "2026 Jeddah race cancelled (alongside Bahrain) amid the regional situation; Jeddah is slated to host until the Qiddiya circuit is ready (~2027).",
    statS: [S("Motorsport.com", "https://www.motorsport.com/f1/news/bahrain-and-saudi-arabia-f1-races-officially-cancelled-amid-middle-east-conflict/10805321/"), S("PlanetF1", "https://www.planetf1.com/news/jeddah-remain-f1-2027-new-saudi-track")],
    sig: "F1 calendar cut 24 to 22 for 2026; April coverage centred on the 2027 circuit decision.",
    sigS: [S("SportBible, Apr 2026", "https://www.sportbible.com/f1/decision-made-new-circuit-calendar-350810-20260414")],
    talk: "Resilience comms: when force majeure meets a flagship event.",
  },
  {
    id: "ewc", name: "Esports World Cup", ar: "كأس العالم للرياضات الإلكترونية", lens: "events", ring: 1, status: "watch", size: 2,
    topics: ["esports world cup"],
    demand: "$75M prize pool; 2,000+ players; Riyadh-owned franchise",
    catalyst: "finals 23 Aug 2026",
    stat: "$75M prize pool, 25 events, 2,000+ players, but the 2026 edition relocated Riyadh to Paris, framed as a rotation with Riyadh as EWC's home.",
    statS: [S("PR Newswire", "https://www.prnewswire.com/news-releases/75-million-prize-pool-full-game-lineup-and-schedule-announced-for-esports-world-cup-2026-302665501.html"), S("Outlook Respawn", "https://respawn.outlookindia.com/gaming/gaming-news/esports-world-cup-2026-moves-to-paris-from-riyadh")],
    sig: "Running now (6 Jul-23 Aug 2026); press is testing what the Paris move means for the foundation's global ambitions.",
    sigS: [S("The National, 6 Jul 2026", "https://www.thenationalnews.com/arts-culture/2026/07/06/esports-world-cups-paris-move-tests-foundations-global-gaming-ambitions/")],
    talk: "Owning a franchise you export: the EWC's Saudi story abroad.",
  },
  {
    id: "soundstorm", name: "Soundstorm (MDLBEAST)", ar: "ساوندستورم", lens: "events", ring: 1, status: "steady", size: 1,
    topics: ["soundstorm"],
    demand: "~500K visitors per edition",
    catalyst: "December 2026 edition",
    stat: "Soundstorm 2024 drew almost half a million visitors plus a Guinness record; the 2025 edition ran 14 stages and 250+ artists.",
    statS: [S("MDLBEAST newsroom", "https://newsroom.mdlbeast.com/soundstorm-2024-the-biggest-edition-to-date-with-a-star-studded-weekend-a-guinness-world-record-and-almost-half-a-million-visitors/")],
    sig: "Off-season; next edition Dec 2026.",
    sigS: [S("Soundstorm 2025 wrap", "https://the-media-nanny_5.prowly.com/439513-soundstorm-wraps-up-spectacular-2025-edition-with-fully-redesigned-festival-grounds-14-stages-and-over-250-artists")],
    talk: "Culture-shift stories that international desks actually take.",
  },
  {
    id: "jeddahseason", name: "Jeddah Season", ar: "موسم جدة", lens: "events", ring: 1, status: "steady", size: 1,
    topics: ["jeddah season"],
    demand: "1.7M+ visitors in 2024; 6M at peak (2022)",
    catalyst: "2026 dates announcement",
    stat: "1.7M+ visitors over 52 days in 2024; the 2022 edition reached 6M.",
    statS: [S("SPA", "https://www.spa.gov.sa/en/N2160111"), S("Arab News (2022)", "https://www.arabnews.com/node/2115401/saudi-arabia")],
    sig: "2025 edition ran with an extension; 2026 dates are a watch item.",
    sigS: [S("Destination KSA", "https://destinationksa.com/en/jeddah-season-2025-events-and-extension/")],
    talk: "Second-city seasons: distributing the events story beyond Riyadh.",
  },
  /* ---- hospitality & aviation ---- */
  {
    id: "riyadhair", name: "Riyadh Air", ar: "طيران الرياض", lens: "hosp", ring: 1, status: "hot", size: 3,
    topics: ["riyadh air"],
    demand: "orders + options up to 182 aircraft; 100+ routes by 2030",
    catalyst: "Farnborough-window 787 order decision",
    stat: "Airborne: first revenue flight 10 Jun 2026 (Riyadh-London); ~8 aircraft by end-Jul 2026; orders plus options up to 182 aircraft; 100+ destinations targeted by 2030.",
    statS: [S("One Mile at a Time", "https://onemileatatime.com/news/riyadh-air-tickets-sale-launch/"), S("Aviation A2Z", "https://aviationa2z.com/index.php/2026/07/15/riyadh-air-eyes-new-order-for-30-more-boeing-787/")],
    sig: "Reported eyeing 25-30 more 787s around Farnborough (15 Jul 2026); Dhaka, Kuala Lumpur and Málaga routes announced.",
    sigS: [S("Aviation A2Z, 15 Jul 2026", "https://aviationa2z.com/index.php/2026/07/15/riyadh-air-eyes-new-order-for-30-more-boeing-787/"), S("RusTourismNews", "https://www.rustourismnews.com/2026/07/04/riyadh-air-adds-3-routes-as-dreamliner-fleet-grows/")],
    talk: "A launch the whole world covered: what Riyadh Air got right in earned media.",
  },
  {
    id: "saudia", name: "Saudia", ar: "الخطوط السعودية", lens: "hosp", ring: 1, status: "steady", size: 2,
    topics: ["saudia"],
    demand: "12 Airbus arriving through 2026; ~150-jet order weighed",
    catalyst: "fleet-order announcement",
    stat: "12 new Airbus aircraft arriving through 2026 (first A321XLR received); a ~150-jet order reported under consideration.",
    statS: [S("SPA, Jun 2026", "https://www.spa.gov.sa/en/N2604350"), S("AirlineGeeks", "https://airlinegeeks.com/2026/02/06/saudia-eyes-massive-aircraft-order/")],
    sig: "Jeddah-Hurghada service commencing Jul 2026.",
    sigS: [S("AACO", "https://www.aaco.org/media-center/news/aaco-members/saudia-to-commence-jeddah-hurghada-service-in-july-2026")],
    talk: "Legacy-carrier reinvention next to a glamorous newcomer.",
  },
  {
    id: "aroya", name: "AROYA Cruises / Cruise Saudi", ar: "أرويا", lens: "hosp", ring: 1, status: "steady", size: 2,
    topics: ["aroya cruises", "cruise saudi"],
    demand: "140K+ guests in year one; 1.3M/yr target by 2035",
    catalyst: "new Red Sea itineraries",
    stat: "140,000+ guests in year one; Red Sea sailings ex-Jeddah resumed May 2026; Cruise Saudi targets 1.3M passengers a year by 2035.",
    statS: [S("Cruise Arabia", "https://cruise-arabia.com/2025/12/17/aroya-cruises-carries-140000-passengers-in-first-year-of-operations/"), S("Arab News", "https://www.arabnews.com/node/2577548/business-economy")],
    sig: "Guest-experience upgrades this month; a building phase after the first-year milestone.",
    sigS: [S("Cruise Industry News, Jul 2026", "https://cruiseindustrynews.com/cruise-news/2026/07/aroya-launches-new-website-to-enhance-guest-journey/")],
    talk: "Making a new travel behaviour (Gulf cruising) legible to global press.",
  },
  {
    id: "hotels", name: "Hotel pipeline", ar: "التوسع الفندقي", lens: "hosp", ring: 2, status: "hot", size: 3,
    topics: ["saudi hotels", "saudi hotel"],
    demand: "94,500 rooms in the active pipeline; 358K long-term",
    catalyst: "management-deal flow (3 signed in one July week)",
    stat: "171,650 keys (Sep 2025) plus 94,500 rooms in the active pipeline (358,000 in long-term plans); ~75% of new supply luxury/upscale; ADR SAR 746, occupancy 61% (Jan-Aug 2025).",
    statS: [S("Knight Frank, Feb 2026", "https://www.knightfrank.ae/newsroom/article/2026/2/the-saudi-report-part-2-hospitality"), S("Zawya · CoStar/STR", "https://www.zawya.com/en/projects/construction/middle-east-hotel-pipeline-tops-231-000-rooms-led-by-saudi-arabia-and-uae-vprk6ea1")],
    sig: "Three hotel-management deals signed 8 Jul 2026; a $400M Madinah hotel fund launched the same month.",
    sigS: [S("Arab News, 8 Jul 2026", "https://www.arabnews.com/node/2650100/amp"), S("AGBI, Jul 2026", "https://www.agbi.com/construction/2026/07/saudi-developer-sets-up-400m-fund-for-hotel-projects-in-medina/")],
    talk: "Openings are a commodity; positioning is not. PR for a crowded pipeline.",
  },
  {
    id: "ksia", name: "King Salman Intl Airport", ar: "مطار الملك سلمان الدولي", lens: "hosp", ring: 2, status: "steady", size: 2,
    topics: ["king salman international airport"],
    demand: "six-runway masterplan under construction",
    catalyst: "runway-3 milestones",
    stat: "Third-runway construction under way since Jan 2026 on Riyadh's six-runway mega-airport.",
    statS: [S("Logistics Gulf", "https://logisticsgulf.com/2026/01/king-salman-international-airport-kicks-off-construction-of-the-3rd-runway/")],
    sig: "Aviation-capacity story building beneath the airline headlines.",
    sigS: [S("Logistics Gulf", "https://logisticsgulf.com/2026/01/king-salman-international-airport-kicks-off-construction-of-the-3rd-runway/")],
    talk: "Infrastructure as narrative: airports are promises with runways.",
  },
  {
    id: "mice", name: "MICE & business events", ar: "قطاع فعاليات الأعمال", lens: "hosp", ring: 2, status: "steady", size: 2,
    topics: [],
    demand: "$3.22B market heading to $5.65B by 2031",
    catalyst: "Saudi Event Show 9-10 Sep 2026",
    stat: "Saudi MICE market estimated at $3.22B (2025), heading for $5.65B by 2031; Saudi business-travel spending grew +55% in 2025 (WTTC).",
    statS: [S("Mordor Intelligence", "https://www.mordorintelligence.com/industry-reports/saudi-arabia-mice-industry"), S("WTTC ME EIR", "https://wttc.org/news/middle-east-eir")],
    sig: "Saudi Event Show set for 9-10 Sep 2026: the sector takes its own stage.",
    sigS: [S("Informa", "https://informaconnect.com/saudi-event-show/")],
    talk: "Bidding for the world's meetings: the business-events story after WTM Spotlight Riyadh.",
  },
  {
    id: "invest", name: "Tourism investment", ar: "الاستثمار السياحي", lens: "hosp", ring: 2, status: "hot", size: 2,
    topics: ["saudi tourism"],
    demand: "$400M Madinah fund + private capital moving in",
    catalyst: "next fund announcements",
    stat: "Private capital is moving into Saudi tourism, with bets that look very different from the giga-funds (Skift, Jul 2026).",
    statS: [S("Skift, 6 Jul 2026", "https://skift.com/2026/07/06/private-capital-is-moving-into-saudi-tourism-their-bets-look-very-different/")],
    sig: "A $400M Madinah hospitality fund and three fresh management deals in one July week.",
    sigS: [S("AGBI", "https://www.agbi.com/construction/2026/07/saudi-developer-sets-up-400m-fund-for-hotel-projects-in-medina/"), S("Arab News", "https://www.arabnews.com/node/2650100/amp")],
    talk: "Follow the money: what investor behaviour says that the coverage hasn't.",
  },
  /* ---- faith & Muslim-friendly travel ---- */
  {
    id: "hajj", name: "Hajj operations", ar: "الحج", lens: "faith", ring: 1, status: "steady", size: 3,
    topics: ["hajj"],
    demand: "1.71M pilgrims operated at +2% YoY",
    catalyst: "Hajj 1448H season build-up",
    stat: "1,707,301 pilgrims performed Hajj 1447H/2026 (+2% YoY; ~1.55M international, from 165 countries).",
    statS: [S("GASTAT", "https://www.stats.gov.sa/en/w/news/194"), S("Arab News · Knight Frank", "https://www.arabnews.com/node/2648123/amp")],
    sig: "June 2026 coverage framed crowd operations and logistics as a success story.",
    sigS: [S("SPA", "https://www.spa.gov.sa/en/N2610782")],
    talk: "The world's most complex live event, told as an operations story.",
  },
  {
    id: "umrah", name: "Umrah growth", ar: "العمرة", lens: "faith", ring: 2, status: "hot", size: 3,
    topics: ["umrah"],
    demand: "30M pilgrims/yr capacity target by 2030",
    catalyst: "GASTAT quarterly releases",
    stat: "20.7M Umrah performers in H1 2025; 11.29M in Q4 2025 alone; national capacity target: 30M pilgrims a year by 2030.",
    statS: [S("Argaam", "https://www.argaam.com/en/article/articledetail/id/1860818"), S("Zawya · GASTAT", "https://www.zawya.com/en/business/travel-and-tourism/saudi-umrah-performers-surpass-112mln-in-q4-2025-g00tzfq8"), S("Pilgrim Experience Program", "https://pep.gov.sa/en/about")],
    sig: "Quarterly GASTAT releases keep a steady drumbeat; the capacity build-out is the story.",
    sigS: [S("Zawya, Jun 2026", "https://www.zawya.com/en/business/travel-and-tourism/saudi-umrah-performers-surpass-112mln-in-q4-2025-g00tzfq8")],
    talk: "From quota to capacity: the 30M-Umrah growth story.",
  },
  {
    id: "makkah", name: "Makkah hospitality", ar: "مكة المكرمة", lens: "faith", ring: 1, status: "hot", size: 2,
    topics: ["makkah"],
    demand: "218K+ rooms planned across the holy cities; ADR $209",
    catalyst: "capacity announcements",
    stat: "KSA's strongest hotel market in early 2026 (ADR $209, RevPAR +4.7%), with 218,000+ rooms planned across the holy cities.",
    statS: [S("Arab News · Knight Frank 2026", "https://www.arabnews.com/node/2648123/amp")],
    sig: "Knight Frank: pilgrim demand undampened by regional conflict (2026).",
    sigS: [S("Arab News", "https://www.arabnews.com/node/2648123/amp")],
    talk: "Yield in the holy cities: hospitality economics the trade press underplays.",
  },
  {
    id: "madinah", name: "Madinah hospitality", ar: "المدينة المنورة", lens: "faith", ring: 1, status: "steady", size: 2,
    topics: ["madinah"],
    demand: "Rua Al Madinah mega-development reshaping supply",
    catalyst: "$400M fund deployments",
    stat: "76% hotel occupancy in early 2026 (rates +2.7%); Rua Al Madinah among the mega-developments reshaping supply.",
    statS: [S("Arab News · Knight Frank 2026", "https://www.arabnews.com/node/2648123/amp")],
    sig: "A $400M private hotel fund aimed specifically at Madinah (Jul 2026).",
    sigS: [S("AGBI", "https://www.agbi.com/construction/2026/07/saudi-developer-sets-up-400m-fund-for-hotel-projects-in-medina/")],
    talk: "Madinah as its own destination story, not Makkah's footnote.",
  },
  {
    id: "mft", name: "Muslim-friendly travel", ar: "السفر الصديق للمسلمين", lens: "faith", ring: 1, status: "hot", size: 2,
    topics: ["halal travel", "muslim travelers"],
    demand: "Muslim travel spend $249B heading to $424B by 2029",
    catalyst: "GMTI 2027 cycle",
    stat: "GMTI 2026: KSA tied #2 globally (score 79, with Indonesia and Türkiye; Malaysia #1). Muslim outbound travel spend: $249B in 2024, forecast $424B by 2029 (SGIE 2025/26, DinarStandard).",
    statS: [S("Mastercard × CrescentRating", "https://www.mastercard.com/news/ap/en/newsroom/press-releases/en/2026/mastercard-and-crescentrating-s-global-muslim-travel-index-2026-reveals-80-of-travelers-now-use-ai-tools-as-muslim-travel-enters-the-era-of-digital-trust/"), S("Salaam Gateway · SGIE", "https://salaamgateway.com/story/muslim-friendly-travel-sector-snapshot-sgie-202526")],
    sig: "GMTI 2026's headline finding: 80% of Muslim travelers now use AI tools to plan travel.",
    sigS: [S("Mastercard, Jun 2026", "https://www.mastercard.com/news/ap/en/newsroom/press-releases/en/2026/mastercard-and-crescentrating-s-global-muslim-travel-index-2026-reveals-80-of-travelers-now-use-ai-tools-as-muslim-travel-enters-the-era-of-digital-trust/")],
    talk: "The AI-planned pilgrimage: winning the answer-engine era of Muslim travel.",
  },
  {
    id: "nusuk", name: "Nusuk & the digital pilgrim stack", ar: "نسك", lens: "faith", ring: 1, status: "steady", size: 1,
    topics: ["nusuk"],
    demand: "mandatory gateway for every Umrah visa and stay",
    catalyst: "feature roll-outs",
    stat: "Nusuk is now the mandatory gateway for Umrah visas and accommodation, with an integrated wallet and AI-powered air-rail booking (SGIE 2025/26).",
    statS: [S("Salaam Gateway", "https://salaamgateway.com/story/sgie-report-2026-large-scale-investments-destination-developments-digitalization-continue-to-boost-m")],
    sig: "The digital pilgrim stack is quietly becoming the template other faith destinations study.",
    sigS: [S("Salaam Gateway", "https://salaamgateway.com/story/sgie-report-2026-large-scale-investments-destination-developments-digitalization-continue-to-boost-m")],
    talk: "GovTech nobody writes about: the pilgrim super-app story.",
  },
  {
    id: "haramain", name: "Haramain high-speed rail", ar: "قطار الحرمين", lens: "faith", ring: 1, status: "steady", size: 1,
    topics: ["haramain"],
    demand: "2.21M seats prepared for one Hajj season",
    catalyst: "next season capacity plan",
    stat: "1.16M+ passengers moved during the Hajj 2026 season; 2.21M seats prepared for the season.",
    statS: [S("SPA, Jun 2026", "https://www.spa.gov.sa/en/N2610782"), S("Pilgrim Experience Program", "https://pep.gov.sa/en/news/957")],
    sig: "Rail capacity is becoming the quiet hero of pilgrim-logistics coverage.",
    sigS: [S("SPA", "https://www.spa.gov.sa/en/N2610782")],
    talk: "Logistics as pilgrimage UX: an infrastructure story with a human face.",
  },
];

/* ---- KPI band (curated authority layer) ---- */
export interface KsaKpi {
  cat: KsaLens | "all";
  lbl: string;
  val: string;
  delta?: string;
  sub: string;
  src: SourceLink[];
  spark?: boolean;
}

export const KPIS: KsaKpi[] = [
  {
    cat: "all", lbl: "Tourism spending, 2025 · record", val: "SAR 304B", delta: "+7% vs 2024",
    sub: "Inbound SAR 176.6B · domestic SAR 127.1B · travel-account surplus SAR 49.4B",
    src: [S("SPA · Ministry of Tourism", "https://www.spa.gov.sa/en/N2615138")],
  },
  {
    cat: "all", lbl: "Tourists in 2025", val: "123M", delta: "+6% vs 2024",
    sub: "29.3M inbound + 93.3M domestic · inbound by year below†", spark: true,
    src: [S("SPA", "https://www.spa.gov.sa/en/N2615138"), S("DataSaudi", "https://datasaudi.sa/en/sector/tourism")],
  },
  {
    cat: "all", lbl: "Travel & tourism in GDP · WTTC 2025", val: "$178B", delta: "7.4% of GDP · +7.4%",
    sub: "46% of the Middle East's T&T economy · business-travel spend +55%",
    src: [S("WTTC Middle East EIR", "https://wttc.org/news/middle-east-eir")],
  },
  {
    cat: "hosp", lbl: "Hotel keys + active pipeline", val: "171.6K + 94.5K",
    sub: "358K rooms in long-term plans · ~75% of new supply luxury/upscale (Knight Frank, Feb 2026)",
    src: [S("Knight Frank", "https://www.knightfrank.ae/newsroom/article/2026/2/the-saudi-report-part-2-hospitality")],
  },
  {
    cat: "faith", lbl: "Hajj 2026 pilgrims", val: "1.71M", delta: "+2% YoY",
    sub: "Umrah capacity target: 30M/yr by 2030 · 218K+ rooms planned in the holy cities",
    src: [S("GASTAT", "https://www.stats.gov.sa/en/w/news/194"), S("PEP", "https://pep.gov.sa/en/about")],
  },
  {
    cat: "faith", lbl: "Muslim-friendly destination rank", val: "#2 tied", delta: "GMTI 2026 · score 79",
    sub: "Tied with Indonesia and Türkiye · 80% of Muslim travelers now plan with AI tools",
    src: [S("Mastercard × CrescentRating", "https://www.mastercard.com/news/ap/en/newsroom/press-releases/en/2026/mastercard-and-crescentrating-s-global-muslim-travel-index-2026-reveals-80-of-travelers-now-use-ai-tools-as-muslim-travel-enters-the-era-of-digital-trust/")],
  },
];

/** Inbound visitors (millions) 2019-2025, MoT-sourced series; 2025 via DataSaudi.
 *  †2019 basis varies across official series. */
export const SPARK_SERIES = { years: [2019, 2020, 2021, 2022, 2023, 2024, 2025], vals: [20.3, 4.9, 3.5, 16.4, 27.4, 29.7, 29.3] };

/* ---- coverage gaps (ownable narratives) ---- */
export interface KsaGap {
  n: string;
  t: string;
  talk: number;
  p: string;
  src: SourceLink;
}

export const GAPS: KsaGap[] = [
  {
    n: "01", t: "Answer-engine visibility for Saudi destinations", talk: 1,
    p: "GMTI 2026's own headline says 80% of Muslim travelers plan with AI tools, yet nobody audits how Saudi destinations actually surface in ChatGPT-era answers, or what DMOs should do about it. The conversation exists; the Saudi chapter is unclaimed.",
    src: S("Travel Weekly · destinations vs AI", "https://www.travelweekly.com/Travel-News/Travel-Technology/Destinations-high-stakes-game-with-AI"),
  },
  {
    n: "02", t: "The Arabic-language AI content gap", talk: 2,
    p: "Arabic is documented as underrepresented in AI training data, and GCC Arabic-LLM building is covered as a tech story, but nobody connects it to tourism and Umrah discovery content in Arabic. A bilingual visibility strategy is open territory.",
    src: S("Welo Data · bridging the Arabic AI gap", "https://welodata.ai/2025/09/03/bridging-the-arabic-ai-gap/"),
  },
  {
    n: "03", t: "Earned media ROI vs paid spend for giga-projects", talk: 3,
    p: "Coverage tracks the paid side (KSA digital ad spend heading to ~$4.68B in 2026), but there is almost no analysis of earned share-of-voice for NEOM, Red Sea Global or Diriyah. The measurement story is unowned.",
    src: S("Campaign ME · 2025 vs 2026 marketing in KSA", "https://campaignme.com/2025-vs-2026-evaluating-marketing-and-advertising-in-saudi-arabia/"),
  },
  {
    n: "04", t: "Post-mega-event legacy accountability", talk: 4,
    p: "Expo 2030 and 2034 World Cup coverage is announcement-driven; 'legacy' framing mostly borrows Qatar comparisons. Measurable Saudi legacy-and-ROI narratives are wide open, and organisers will need them.",
    src: S("The National · inside Saudi sports strategy", "https://www.thenationalnews.com/sport/2026/05/22/inside-saudi-arabias-new-sports-strategy-world-cup-2034-qiddiya-and-esports/"),
  },
  {
    n: "05", t: "Women and solo-traveler narratives, done credibly", talk: 1,
    p: "The 'safest G20 country for solo female travelers' claim circulates via SEO blogs, not credible first-person earned media. The perception-vs-reality gap is unclaimed territory for whoever reports it properly.",
    src: S("Gulf Good News · the circulating claim", "https://gulfgoodnews.com/saudi-arabia-safest-g20-solo-female-travellers"),
  },
];

/* ---- talks ---- */
export interface KsaTalk {
  n: number;
  t: string;
  s: string;
  p: string;
  fmt: string[];
  ev: string;
}

export const TALKS: KsaTalk[] = [
  {
    n: 1, t: "When Travelers Ask ChatGPT Where to Go", s: "Earned Media for Saudi Tourism | the session pitched to WTM Spotlight Riyadh",
    p: "80% of Muslim travelers now plan with AI tools (GMTI 2026). What do the answer engines actually say about AlUla, Diriyah, the Red Sea, in English and in Arabic, and how does a destination take control of it? Live audits on stage.",
    fmt: ["Keynote", "Masterclass"], ev: "Built on: GMTI 2026 · SGIE 2025/26 · live answer-engine audits",
  },
  {
    n: 2, t: "The Arabic AI Gap", s: "Getting the Kingdom's story into the machines",
    p: "Arabic is underrepresented in the systems travelers increasingly ask first. The fix is a content and earned-media strategy, not just a model problem, and tourism is the sector with the most to win.",
    fmt: ["Keynote", "Panel"], ev: "Built on: Arabic-LLM research · GDELT 65-language press data",
  },
  {
    n: 3, t: "Earned, Not Bought", s: "Share-of-voice strategy for giga-projects",
    p: "Ad spend is measured to the dirham; earned coverage mostly isn't. A working session on measuring narrative momentum and coverage gaps for destination brands, using the same radar methodology behind this page.",
    fmt: ["Masterclass", "Workshop"], ev: "Built on: this radar's coverage-gap panel · SignalIQ methodology",
  },
  {
    n: 4, t: "After the Opening Ceremony", s: "Legacy coverage playbooks for Expo 2030 & the 2034 World Cup",
    p: "The announcement cycle is easy; the decade after is the reputation. How organisers and sponsors build legacy narratives that survive scrutiny, starting eight years out.",
    fmt: ["Keynote", "Panel"], ev: "Built on: Expo 2030 & WC-2034 signal files above",
  },
];

/* ---- sources footer ---- */
export const SRC_GROUPS: { h: string; links: SourceLink[] }[] = [
  {
    h: "Official & statistical",
    links: [
      S("SPA · MoT 2025 Annual Statistical Report", "https://www.spa.gov.sa/en/N2615138"),
      S("GASTAT · Hajj 2026 statistics", "https://www.stats.gov.sa/en/w/news/194"),
      S("Saudi Tourism Authority · Vision 2030 targets", "https://www.sta.gov.sa/en/vision2030"),
      S("Pilgrim Experience Program · 30M Umrah target", "https://pep.gov.sa/en/about"),
      S("DataSaudi · tourism sector", "https://datasaudi.sa/en/sector/tourism"),
      S("PIF · Diriyah newsroom", "https://www.pif.gov.sa/en/news-and-insights/newswire/2026/diriyah-company-awards-490-million-contract-to-build-saudi-arabia-museum-of-contemporary-art/"),
    ],
  },
  {
    h: "Industry reports",
    links: [
      S("Knight Frank · The Saudi Report 2026, Hospitality", "https://www.knightfrank.ae/newsroom/article/2026/2/the-saudi-report-part-2-hospitality"),
      S("WTTC · Middle East Economic Impact 2026", "https://wttc.org/news/middle-east-eir"),
      S("Mastercard × CrescentRating · GMTI 2026", "https://www.mastercard.com/news/ap/en/newsroom/press-releases/en/2026/mastercard-and-crescentrating-s-global-muslim-travel-index-2026-reveals-80-of-travelers-now-use-ai-tools-as-muslim-travel-enters-the-era-of-digital-trust/"),
      S("DinarStandard · SGIE 2025/26", "https://www.dinarstandard.com/insights/state-of-the-global-islamic-economy-report-2025-26"),
      S("Salaam Gateway · Muslim-friendly travel snapshot", "https://salaamgateway.com/story/muslim-friendly-travel-sector-snapshot-sgie-202526"),
      S("Mordor Intelligence · Saudi MICE market", "https://www.mordorintelligence.com/industry-reports/saudi-arabia-mice-industry"),
      S("Zawya · CoStar/STR Middle East pipeline", "https://www.zawya.com/en/projects/construction/middle-east-hotel-pipeline-tops-231-000-rooms-led-by-saudi-arabia-and-uae-vprk6ea1"),
    ],
  },
  {
    h: "Business & trade press",
    links: [
      S("Skift · private capital in Saudi tourism", "https://skift.com/2026/07/06/private-capital-is-moving-into-saudi-tourism-their-bets-look-very-different/"),
      S("Skift · 2025 visits report", "https://skift.com/2026/01/23/saudi-arabia-reports-5-gain-in-2025-visits-tops-120-million/"),
      S("AGBI · AlUla PPP shift", "https://www.agbi.com/construction/2026/07/alula-seeks-investors-as-focus-shifts-to-ppp-for-next-phase/"),
      S("AGBI · $400M Madinah hotel fund", "https://www.agbi.com/construction/2026/07/saudi-developer-sets-up-400m-fund-for-hotel-projects-in-medina/"),
      S("Arab News · Knight Frank holy-cities report", "https://www.arabnews.com/node/2648123/amp"),
      S("Arab News · July hotel deals", "https://www.arabnews.com/node/2650100/amp"),
      S("MEED · Diriyah Heroes' Park award", "https://www.meed.com/diriyah-awards-105m-iconic-park-contract"),
      S("MEED · what US 2026 means for Saudi 2034", "https://www.meed.com/what-the-2026-world-cup-means-for-saudi-arabia-2034"),
      S("Semafor · NEOM contract unwind", "https://www.semafor.com/article/06/07/2026/saudis-neom-faces-16-billion-bill-to-cancel-neom-contracts"),
      S("Zawya · Expo 2030 site progress", "https://www.zawya.com/en/business/real-estate/groundbreaking-of-expo-2030-riyadh-country-pavilions-likely-in-q3-c5899wxz"),
    ],
  },
  {
    h: "Aviation, cruise & events",
    links: [
      S("One Mile at a Time · Riyadh Air launch", "https://onemileatatime.com/news/riyadh-air-tickets-sale-launch/"),
      S("Aviation A2Z · Riyadh Air fleet", "https://aviationa2z.com/index.php/2026/07/15/riyadh-air-eyes-new-order-for-30-more-boeing-787/"),
      S("SPA · Saudia Airbus deliveries", "https://www.spa.gov.sa/en/N2604350"),
      S("Cruise Arabia · AROYA first year", "https://cruise-arabia.com/2025/12/17/aroya-cruises-carries-140000-passengers-in-first-year-of-operations/"),
      S("PR Newswire · Six Flags Qiddiya opening", "https://www.prnewswire.com/news-releases/six-flags-qiddiya-city-six-flags-entertainment-corporations-first-destination-outside-north-america-is-now-officially-open-302651426.html"),
      S("PR Newswire · EWC 2026", "https://www.prnewswire.com/news-releases/75-million-prize-pool-full-game-lineup-and-schedule-announced-for-esports-world-cup-2026-302665501.html"),
      S("The National · EWC's Paris move", "https://www.thenationalnews.com/arts-culture/2026/07/06/esports-world-cups-paris-move-tests-foundations-global-gaming-ambitions/"),
      S("MDLBEAST · Soundstorm 2024", "https://newsroom.mdlbeast.com/soundstorm-2024-the-biggest-edition-to-date-with-a-star-studded-weekend-a-guinness-world-record-and-almost-half-a-million-visitors/"),
    ],
  },
  {
    h: "Method & the live wire",
    links: [
      S("GDELT · Web News NGrams 3.0 (65-language corpus)", "https://blog.gdeltproject.org/announcing-the-new-web-news-ngrams-3-0-dataset/"),
      S("GDELT · multilingual horizon scanning", "https://blog.gdeltproject.org/realtime-global-massively-multilingual-horizon-scanning-using-gdelts-new-web-news-ngrams-3-0-dataset/"),
      S("The live global radar this clones", "https://www.syedirfanajmal.com/earned-media-radar"),
      S("SignalIQ · the tool behind the wire", "https://www.syedirfanajmal.com/tools/signaliq"),
      S("Events window: Hotel & Hospitality Expo Saudi, 15-17 Sep 2026", "https://www.thehotelshowsaudiarabia.com/"),
      S("Events window: WTM Spotlight Riyadh, 8-10 Sep 2026 · coverage", "https://www.travelandtourworld.com/news/article/saudi-arabias-vision-2030-comes-to-life-as-wtm-spotlight-riyadh-2026-revolutionizes-the-global-mice-industry-redefining-business-events-and-shaping-the-future-of-international-tourism/"),
    ],
  },
];

/* ---- verdict engine: one honest vocabulary, shared by the quiet list, the
   signal files, and The Window quadrant so the page never disagrees with
   itself. Loud = above the tracked set's median press volume; rising = 30v30
   momentum >= +10%. Demand/catalysts come from the curated layer. ---- */
export type KsaVerdict = "whitespace" | "early" | "newsjack" | "late" | "dormant" | "recal";

export const VERDICT_META: Record<KsaVerdict, { label: string; note: string; tone: "gold" | "ink" | "quiet" | "warn" }> = {
  early: { label: "EARLY WINDOW", note: "quiet and rising: own it now", tone: "gold" },
  whitespace: { label: "WHITESPACE", note: "demand is ahead of coverage", tone: "gold" },
  newsjack: { label: "NEWSJACK", note: "crowded and rising: enter fast, data angle required", tone: "ink" },
  late: { label: "LATE", note: "crowded and flat: wait for the next catalyst", tone: "quiet" },
  dormant: { label: "DORMANT", note: "quiet with no demand signal on file", tone: "quiet" },
  recal: { label: "RECALIBRATING", note: "story in flux: watch, do not call it", tone: "warn" },
};

/** Below this many articles, a 30v30 percentage is statistical noise (2 vs 4
 *  articles reads as +100%). Verdicts ignore momentum under this floor and the
 *  UI says "low sample" instead of a percentage. */
export const LOW_SAMPLE_N = 12;

export function verdictFor(
  n: number | null,
  tr: number | null,
  medianN: number,
  demand: string | undefined,
  catalyst: string | undefined,
  status: KsaStatus,
): KsaVerdict {
  if (status === "watch") return "recal";
  if (n === null || tr === null) return demand || catalyst ? "whitespace" : "dormant";
  const loud = n >= Math.max(medianN, 1);
  const rising = tr >= 0.1 && n >= LOW_SAMPLE_N;
  if (loud) return rising ? "newsjack" : "late";
  if (rising) return "early";
  return demand || catalyst ? "whitespace" : "dormant";
}

/** Reverse map: canonical topic -> its curated signal (for demand chips on live topic rows). */
export const SIGNAL_BY_TOPIC: Map<string, KsaSignal> = new Map(
  SIGNALS.flatMap((sig) => sig.topics.map((t) => [t, sig] as const)),
);
