/**
 * KSA Retail & Consumer Radar — curated content layer (client-safe).
 *
 * This is the sourced editorial layer: 25 signal files, KPI tiles, and talks,
 * compiled 10 Aug 2026. Every number links to a named source. The live SignalIQ
 * layer (src/lib/ksa-retail/data.ts) enriches it; it never replaces it.
 * Framing is whitespace-first: this is a consumer economy approaching $294B
 * that global English press barely writes about, and the radar shows exactly
 * where the gaps are. House rules: no em/en dashes in copy; no invented
 * figures; honest verdicts (most retail topics sit under the low-sample floor,
 * and that fact is the finding, not a flaw).
 */
import type { RetailLens } from "@/lib/ksa-retail/types";

export interface SourceLink {
  t: string;
  u: string;
}
const S = (t: string, u: string): SourceLink => ({ t, u });

export type RetailStatus = "hot" | "steady" | "watch" | "early";

export const STATUS_META: Record<RetailStatus, { glyph: string; label: string; note: string }> = {
  hot: { glyph: "▲", label: "hot", note: "in the news this month" },
  steady: { glyph: "●", label: "steady", note: "moving on plan" },
  watch: { glyph: "⚠", label: "watch", note: "recalibrating" },
  early: { glyph: "◦", label: "early", note: "pre-coverage" },
};

export interface RetailSignal {
  id: string;
  name: string;
  ar: string;
  lens: RetailLens;
  ring: 1 | 2 | 3; // 1 live now · 2 building · 3 horizon 2030+
  status: RetailStatus;
  size: 1 | 2 | 3;
  /** Lowercase canonical topics feeding this signal's live line (may be empty). */
  topics: string[];
  /** Demand-side reality (revenue, transactions, users) — the third ingredient the press does not control. */
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

export const SIGNALS: RetailSignal[] = [
  /* ---- e-commerce & delivery ---- */
  {
    id: "saudi-ecommerce", name: "Saudi e-commerce", ar: "التجارة الإلكترونية السعودية", lens: "ecom", ring: 1, status: "steady", size: 3,
    topics: ["saudi e-commerce"],
    demand: "mada online sales SAR 69.3B in Q1 2025, up 56%",
    catalyst: "monthly SAMA bulletins; White Friday spike 28 Nov 2026",
    stat: "Official SAMA data shows e-commerce sales via mada cards hit a record SAR 69.3 billion in Q1 2025, up 56 percent year on year across 370 million plus transactions, then a record SAR 30.7 billion ($8.18 billion) in the single month of October 2025, up 68 percent.",
    statS: [S("Saudi Press Agency, 3 Jul 2025", "https://www.spa.gov.sa/en/N2351771"), S("Arab News, 25 Dec 2025", "https://www.arabnews.com/node/2627424/business-economy")],
    sig: "The Ministry of Commerce's Q2 2026 bulletin, issued July 2026, logged over 71,000 new commercial registrations in the quarter and 1.91 million total, naming e-commerce among the Vision 2030 priority sectors driving new business formation.",
    sigS: [S("Arab News, 10 Jul 2026", "https://www.arabnews.com/node/2650362/business-economy")],
    talk: "Saudi shoppers moved SAR 30B online in one month and almost nobody in the English press told the story. First movers own the narrative.",
  },
  {
    id: "salla", name: "Salla", ar: "سلة", lens: "ecom", ring: 2, status: "steady", size: 2,
    topics: ["salla"],
    demand: "68,000+ active merchants, $13B+ online sales processed",
    catalyst: "Tadawul IPO decision window; White Friday 28 Nov 2026",
    stat: "Salla reports 68,000+ active merchants and more than $13 billion in online sales processed as of 2025, having raised a $130 million pre-IPO round in March 2024 led by Investcorp with PIF's Sanabil and STV. The Tadawul IPO has not yet happened; the company remains at pre-IPO stage.",
    statS: [S("Salla company page, 2025", "https://salla.com/en/ai-info/"), S("Lucidity Insights, Mar 2024", "https://lucidityinsights.com/news/salla-130m-pre-ipo-funding-round")],
    sig: "A May 2026 founder profile positions Salla, with 80,000+ merchants and $7 billion in cumulative GMV, as one of Saudi Arabia's most important future public-market technology contenders, but no listing date has been set.",
    sigS: [S("Arab Founders, 28 May 2026", "https://arabfounders.net/en/nawaf-hareeri-salla-saudi-ecommerce/")],
    talk: "The Saudi Shopify story: a Makkah-born SaaS quietly powers the Kingdom's online stores, and its IPO will be a signal event for MENA tech.",
  },
  {
    id: "hungerstation", name: "HungerStation", ar: "هنقرستيشن", lens: "ecom", ring: 1, status: "hot", size: 3,
    topics: ["hungerstation"],
    demand: "largest Saudi aggregator; 60%+ key order value from subscribers",
    catalyst: "Uber to Delivery Hero deal close, expected H2 2027",
    stat: "Saudi Arabia is Delivery Hero's standout market: over 60 percent of order value in key segments comes from subscribers, the highest subscription penetration across all Delivery Hero markets, making HungerStation the Kingdom's largest food delivery aggregator. Delivery Hero took sole ownership in July 2023 for $297 million.",
    statS: [S("Arab News, 23 Jul 2026", "https://www.arabnews.com/node/2652050/business-economy"), S("Delivery Hero newsroom, Jul 2023", "https://www.deliveryhero.com/newsroom/delivery-hero-takes-sole-ownership-of-hungerstation/")],
    sig: "Uber's $14.8 billion acquisition of Delivery Hero, announced July 2026, puts HungerStation under Uber control and sets up a Saudi market battle with Keeta. Weeks earlier, Saudi unicorn Ninja was reported weighing a rival bid for Delivery Hero's Middle East assets.",
    sigS: [S("Arab News, 23 Jul 2026", "https://www.arabnews.com/node/2652050/business-economy"), S("FWDstart, 8 Jun 2026", "https://www.fwdstart.me/p/saudi-unicorn-ninja-weighs-bid-for-delivery-hero-s-middle-east-assets-as-hungerstation-founder-eyes")],
    talk: "Why global platforms pay a premium for Saudi loyalty: the subscription economics behind the Uber, Delivery Hero and HungerStation chess game.",
  },
  {
    id: "jahez", name: "Jahez", ar: "جاهز", lens: "ecom", ring: 1, status: "watch", size: 2,
    topics: ["jahez"],
    demand: "SAR 7.2B GMV in 2025; 31.7M orders in Q1 2026",
    catalyst: "H1 2026 Tadawul results, expected mid August 2026",
    stat: "Jahez posted 2025 GMV of SAR 7.2 billion, up 11 percent, with international markets reaching 19 percent of GMV, and guided 2026 revenue growth of 7 to 21 percent. In Q1 2026 revenue jumped 37.9 percent to SAR 725.1 million on 31.7 million orders, but the group swung to a SAR 9.2 million net loss.",
    statS: [S("Argaam, 31 Mar 2026", "https://www.argaam.com/en/article/articledetail/id/1892181"), S("Jawlah, 11 May 2026", "https://jawlah.co/en/55289")],
    sig: "Q1 2026 coverage flagged Jahez's swing to a loss as it spends heavily on marketing, the Snoonu consolidation and regional expansion to defend share against intensifying delivery and quick-commerce competition.",
    sigS: [S("Jawlah, 11 May 2026", "https://jawlah.co/en/55289")],
    talk: "Growth or margin: what Jahez's public P&L teaches brands about defending share when a price-war entrant lands in your home market.",
  },
  {
    id: "white-friday", name: "White Friday", ar: "الجمعة البيضاء", lens: "ecom", ring: 1, status: "steady", size: 2,
    topics: ["white friday"],
    demand: "November mada e-commerce hit SAR 29.1B, up 67%",
    catalyst: "White Friday, 28 Nov 2026; Amazon deals 20 to 30 Nov",
    stat: "In November 2025, the White Friday month, Saudi e-commerce sales via mada reached SAR 29.1 billion across 166.7 million transactions, up 67 percent year on year, within total consumer spending of SAR 129.1 billion, per SAMA data. The event, coined by Souq.com in 2014, falls on 28 November in 2026.",
    statS: [S("Argaam, 4 Jan 2026", "https://www.argaam.com/en/article/articledetail/id/1870175"), S("Alcoupon, 2026", "https://saudi.alcoupon.com/en/blog/white-friday-date")],
    sig: "SAMA's November 2025 bulletin, reported in January 2026, confirmed the White Friday month as the Kingdom's biggest online spending spike of the year, with e-commerce up 67 percent while in-store POS grew just 5 percent.",
    sigS: [S("Argaam, 4 Jan 2026", "https://www.argaam.com/en/article/articledetail/id/1870175")],
    talk: "Planning the Gulf's Q4: why White Friday, not Black Friday, is the retail comms calendar anchor for any brand selling into Saudi Arabia.",
  },
  {
    id: "quick-commerce", name: "Quick commerce", ar: "التجارة السريعة", lens: "ecom", ring: 2, status: "steady", size: 2,
    topics: [], // context only: the global term's press counts are India-dominated, so it never feeds this radar's totals
    demand: "Saudi market $1.24B in 2025; Ninja at $1.5B valuation",
    catalyst: "Ninja Riyadh IPO, targeted late 2026 or early 2027",
    stat: "Saudi Arabia's quick commerce market reached about $1.24 billion in 2025 and is forecast to hit $1.72 billion by 2029, led by Jahez, HungerStation and Nana Direct via dark-store networks. The global term is dominated by India coverage, so this radar tracks it as context only, never as a Saudi headline number.",
    statS: [S("Research and Markets via GlobeNewswire, 17 Apr 2026", "https://www.globenewswire.com/news-release/2026/04/17/3276234/28124/en/saudi-arabia-quick-commerce-market-report-2026-jahez-hungerstation-and-nana-direct-lead-expansion-through-dark-stores-and-diversified-delivery-models.html"), S("Wamda, Jul 2025", "https://www.wamda.com/2025/07/saudi-q-commerce-ninja-raises-250-million-hits-unicorn-valuation-ahead-planned-ipo")],
    sig: "Saudi q-commerce unicorn Ninja, valued at $1.5 billion after a $250 million 2025 round with roughly $1 billion in 2025 revenue and a $1.6 billion 2026 target, is selecting banks for a Riyadh listing eyed for late 2026 or early 2027.",
    sigS: [S("Wamda, 24 Mar 2026", "https://www.wamda.com/2026/03/ninja-explores-riyadh-listing-saudi-market-holds-steady-despite-tensions")],
    talk: "Dark stores in the desert: what Ninja's sprint to a $1.5B valuation says about building category leadership before the narrative exists.",
  },
  {
    id: "saudi-food-delivery", name: "Saudi food delivery", ar: "توصيل الطعام في السعودية", lens: "ecom", ring: 1, status: "hot", size: 3,
    topics: ["saudi food delivery"],
    demand: "$8.33B market in 2025, heading to $19.45B by 2031",
    catalyst: "Uber to Delivery Hero close, H2 2027; Aug 2026 earnings",
    stat: "The Saudi delivery market was worth $8.33 billion in 2025, is projected at $9.59 billion in 2026 and $19.45 billion by 2031 at a 15.18 percent CAGR, contested by HungerStation, Jahez and Meituan's Keeta, which grabbed 10 percent order share within four months of its October 2024 launch.",
    statS: [S("Arab News, 23 Jul 2026", "https://www.arabnews.com/node/2652050/business-economy"), S("Rest of World, 10 Mar 2025", "https://restofworld.org/2025/delivery-app-keeta-hungerstation-saudi-arabia/")],
    sig: "Uber's $14.8 billion Delivery Hero acquisition, announced July 2026, is set to reshape the Saudi market, with analysts framing the coming fight as Uber versus Keeta while Jahez spends into the price war and Ninja circles Delivery Hero's regional assets.",
    sigS: [S("Arab News, 23 Jul 2026", "https://www.arabnews.com/node/2652050/business-economy")],
    talk: "A three-way superpower fight over Saudi dinner tables, in a market the global press barely covers as a story.",
  },
  /* ---- retail groups & brands ---- */
  {
    id: "alshaya", name: "Alshaya Group", ar: "مجموعة الشايع", lens: "brands", ring: 2, status: "hot", size: 3,
    topics: ["alshaya"],
    demand: "50 brands, 3,500 stores, nearly 40 years in KSA",
    catalyst: "Chipotle Saudi debut at Westfield Jeddah, late 2026",
    stat: "Alshaya operates around 50 brands, 3,500 stores and 50,000 employees across 19 markets, and in February 2026 unveiled a three year Saudi expansion plan including The Avenues Riyadh and Khobar plus new brands such as Chipotle and Ulta Beauty. Its CEO called Saudi Arabia, a retail market exceeding $133 billion a year, one of the group's most important strategic growth regions.",
    statS: [S("Alshaya Group Saudi Arabia", "https://www.alshaya.com/sa/en/"), S("Arab News, 5 Feb 2026", "https://www.arabnews.com/node/2631833/business-economy")],
    sig: "Chipotle's first ever Saudi location, operated by Alshaya, was confirmed for the newly opened Westfield Jeddah in early August 2026, with a Riyadh site to follow. Alshaya is separately moving toward a 2027 launch for its Avenues Riyadh and Avenues Khobar mega projects.",
    sigS: [S("What's On Saudi Arabia, 5 Aug 2026", "https://whatsonsaudiarabia.com/2026/08/chipotle-mexican-grill-jeddah/"), S("EnterpriseAM, 29 Apr 2026", "https://enterpriseam.com/ksa/2026/04/29/alshaya-moves-toward-2027-launch-for-avenues-riyadh-and-khobar/")],
    talk: "Franchise giants need earned media beyond mall opening ribbon cuttings.",
  },
  {
    id: "jarir", name: "Jarir Bookstore", ar: "مكتبة جرير", lens: "brands", ring: 1, status: "steady", size: 2,
    topics: ["jarir"],
    demand: "SAR 5.8B H1 2026 revenue; 5 new showrooms",
    catalyst: "Q3 2026 results, October 2026",
    stat: "Jarir posted H1 2026 revenue of SAR 5,812.5 million, up 10.8 percent, with net profit up 18 percent to SAR 489 million, opening five new showrooms in the period. Q2 2026 net profit rose 19.5 percent year on year to SAR 235.6 million, driven by smartphone sales and GCC subsidiaries.",
    statS: [S("Sahm Capital, 15 Jul 2026", "https://www.sahmcapital.com/news/content/jarir-marketing-reports-sar-489m-net-profit-in-the-six-months-2026-2026-07-15"), S("Maaal, 15 Jul 2026", "https://maaal.com/en/news/details/jarir-q2-profit-rises-19/")],
    sig: "Jarir's 19 percent Q2 profit jump sent the stock to a 52 week high on results day in mid July 2026, one of Tadawul's cleanest consumer discretionary beats this season. Management credited supply scarcity for letting it hold prices and expand gross margin.",
    sigS: [S("Sahm Capital, 15 Jul 2026", "https://www.sahmcapital.com/news/content/market-movements-now-jarir-4190-q2-net-profit-jumps-19-stock-hits-52w-high-eic-1303-receives-sar-261m-fine-refund-al-yamamah-1304s-deal-to-impact-2028-results-2026-07-15")],
    talk: "Turning quarterly earnings beats into year round brand authority.",
  },
  {
    id: "cenomi", name: "Cenomi (Centers + Retail)", ar: "سينومي", lens: "brands", ring: 2, status: "hot", size: 3,
    topics: ["cenomi"],
    demand: "20 malls, 1.3M sqm GLA, 126.8M annual visitors",
    catalyst: "Westfield Riyadh opening, September 2026",
    stat: "Cenomi Centers closed FY25 with net profit up 4.2 percent to SAR 1,276.2 million on revenue of SAR 2,288.3 million, 94.2 percent like for like occupancy and 126.8 million visitors across 20 malls. Sister company Cenomi Retail, now under Al-Futtaim ownership, swung to a SAR 47.3 million loss in Q1 2026 on higher finance costs.",
    statS: [S("Cenomi Centers FY25 earnings release, Apr 2026", "https://centers.cenomi.com/wp-content/uploads/sites/2/2026/04/FY25-ER-English.pdf"), S("AGBI, 11 May 2026", "https://www.agbi.com/retail/2026/05/higher-finance-costs-weigh-on-cenomi-retail-earnings/")],
    sig: "Westfield Jeddah, the Kingdom's first Westfield branded mall, began operations on 30 July 2026 at nearly 96 percent pre-leased and is expected to add roughly SAR 350 million in annual EBITDA, with Westfield Riyadh slated for September. Cenomi Retail appointed Sameer Jain as CEO in June 2026 to drive its turnaround.",
    sigS: [S("Argaam, 4 Aug 2026", "https://www.argaam.com/en/article/articledetail/id/1925958"), S("Sahm Capital, 22 Jun 2026", "https://www.sahmcapital.com/news/content/cenomi-retail-appoints-sameer-jain-as-new-ceo-2026-06-22")],
    talk: "Mega mall launches are once a decade PR moments: plan the media arc early.",
  },
  {
    id: "savola", name: "Savola Group", ar: "مجموعة صافولا", lens: "brands", ring: 1, status: "hot", size: 3,
    topics: ["savola"],
    demand: "SAR 13.6B H1 revenue across foods and Panda retail",
    catalyst: "Q3 2026 results, November 2026",
    stat: "Savola's H1 2026 net profit rose 36 percent to SAR 401 million on revenue of SAR 13.6 billion, up 3.9 percent. Panda Retail contributed SAR 5.9 billion in H1 revenue with EBITDA up 4.5 percent and online revenue growing roughly 2.5x year on year.",
    statS: [S("Zawya, 6 Aug 2026", "https://www.zawya.com/en/press-release/companies-news/savola-group-reports-36-increase-in-first-half-net-profit-423153"), S("Trade Arabia, Aug 2026", "https://tradearabia.com/News/466256/Savola-reports-36_Percent-rise-in-H1-net-profit-revenue-tops-$3.62bn/IND")],
    sig: "Savola reported its 36 percent H1 profit jump on 6 August 2026, with Q2 revenue accelerating 8.6 percent to SAR 6.3 billion and the food processing arm nearly doubling segment profit to SAR 313 million. Panda's 2.5x online growth is the quiet e-grocery story inside the results.",
    sigS: [S("Zawya, 6 Aug 2026", "https://www.zawya.com/en/press-release/companies-news/savola-group-reports-36-increase-in-first-half-net-profit-423153")],
    talk: "Conglomerate storytelling when margins, not launches, are the headline.",
  },
  {
    id: "almarai", name: "Almarai", ar: "المراعي", lens: "brands", ring: 1, status: "steady", size: 3,
    topics: ["almarai"],
    demand: "SAR 12B H1 2026 revenue, up 9 percent",
    catalyst: "Q3 2026 results, October 2026",
    stat: "Almarai grew H1 2026 revenue 9 percent to SAR 12.03 billion, but net income slipped 1 percent to SAR 1.368 billion as energy, logistics and protein ramp-up costs squeezed margins. Q2 revenue rose 11 percent to SAR 5.87 billion with dairy and juice still 63 percent of sales.",
    statS: [S("Investing.com, 7 Jul 2026", "https://www.investing.com/news/company-news/almarai-q2-2026-slides-11-revenue-growth-margin-pressure-persists-93CH-4779532"), S("Arab News, Apr 2026", "https://www.arabnews.com/node/2638832/business-economy")],
    sig: "July 2026 Q2 disclosures showed the region's biggest dairy company trading double digit top line growth for flat profit, and management trimmed full year capex guidance by SAR 400 million to SAR 3.7 to 3.8 billion. The protein expansion, up 16 percent in Q2, is the growth engine to watch.",
    sigS: [S("Investing.com, 7 Jul 2026", "https://www.investing.com/news/company-news/almarai-q2-2026-slides-11-revenue-growth-margin-pressure-persists-93CH-4779532")],
    talk: "Defending a household brand narrative through a margin squeeze.",
  },
  {
    id: "lulu", name: "Lulu Retail", ar: "لولو هايبرماركت", lens: "brands", ring: 2, status: "steady", size: 3,
    topics: ["lulu hypermarket"],
    demand: "277 GCC stores, 67 in Saudi Arabia",
    catalyst: "H1 2026 results due, mid August 2026",
    stat: "Lulu Retail hit record FY2025 revenue of $7.9 billion, up 4.1 percent, with $205 million net profit and plans for 50 new GCC stores over 2026 to 2028. By Q1 2026 it operated 277 stores including 67 in Saudi Arabia, with e-commerce up 61 percent year on year.",
    statS: [S("Gulf News, 13 Feb 2026", "https://gulfnews.com/amp/story/business%2Fretail%2Fuaes-lulu-retail-hits-record-79b-revenue-in-2025-to-open-50-gcc-stores-1.500442801"), S("Lulu Retail Q1 2026 earnings release, May 2026", "https://www.luluretail.com/media/5vzepmbz/lulu-retail-q1-2026-earnings-release_eng_110526.pdf")],
    sig: "Q1 2026 revenue dipped 2.9 percent to $2 billion on soft March non-food trading, but Lulu opened 11 stores in the quarter and held its guidance of 18 to 20 openings for 2026, leaning on Express and LOT value formats in Saudi Arabia. H1 numbers land mid August.",
    sigS: [S("Lulu Retail Q1 2026 earnings release, May 2026", "https://www.luluretail.com/media/5vzepmbz/lulu-retail-q1-2026-earnings-release_eng_110526.pdf")],
    talk: "Cross border retail expansion needs market by market media strategy.",
  },
  {
    id: "nahdi", name: "Nahdi Medical", ar: "صيدليات النهدي", lens: "brands", ring: 1, status: "watch", size: 2,
    topics: ["nahdi"],
    demand: "1,200+ pharmacies; SAR 9.4B 2024 revenue",
    catalyst: "Q3 2026 results, late October 2026",
    stat: "Nahdi is Saudi Arabia's pharmacy retail leader with 1,207 pharmacies as of mid 2025, including 1,173 in the Kingdom and 34 in the UAE, plus 12 clinics. It generated SAR 9.45 billion revenue in 2024, with private label reaching 16 percent of sales and clinics revenue surging 82 percent.",
    statS: [S("ANB Capital via Argaam, 18 Aug 2025", "https://argaamplus.s3.amazonaws.com/4fde303f-1603-41c6-a007-9a2365b8424b.pdf")],
    sig: "Q2 2026 net profit fell 8.6 percent to SAR 215.2 million, coming in below analyst forecasts, a rare stumble for a company that has led Saudi pharma retail for decades. The results, reported in late July 2026, put its UAE and clinics growth engines under closer scrutiny.",
    sigS: [S("Maaal, 29 Jul 2026", "https://maaal.com/en/news/details/nahdi-medical-q2-profit-f/"), S("Argaam, Jul 2026", "https://www.argaam.com/en/article/articledetail/id/1924227")],
    talk: "Owning the health retail category story when the growth chart flattens.",
  },
  /* ---- lifestyle & entertainment retail ---- */
  {
    id: "saudi-fashion", name: "Saudi fashion", ar: "الأزياء السعودية", lens: "lifestyle", ring: 1, status: "steady", size: 2,
    topics: ["saudi fashion"],
    demand: "fashion is 2.5% of GDP and 320,000 jobs",
    catalyst: "Saudi 100 Brands at Riyadh Fashion Week, October 2026",
    stat: "The Fashion Commission's State of Fashion report values the Saudi fashion market at about $30 billion in 2023, heading to $42 billion by 2028, with the sector contributing 2.5 percent of GDP and employing 320,000 people, 52 percent of them women.",
    statS: [S("Arab News, 19 Sep 2024", "https://www.arabnews.com/node/2572069/saudi-arabia")],
    sig: "Saudi 100 Brands, the Fashion Commission's designer accelerator, staged its first landmark runway presentation at the Saudi Cup in Riyadh in February 2026, its biggest domestic showcase to date.",
    sigS: [S("Saudi Press Agency, Feb 2026", "https://www.spa.gov.sa/en/N2512230")],
    talk: "Position clients inside a $30B fashion economy that global press has not yet mapped.",
  },
  {
    id: "riyadh-fashion-week", name: "Riyadh Fashion Week", ar: "أسبوع الموضة في الرياض", lens: "lifestyle", ring: 1, status: "watch", size: 1,
    topics: ["riyadh fashion week"],
    demand: "30+ shows in 2025, near zero global English coverage",
    catalyst: "fourth Riyadh Fashion Week, October 2026",
    stat: "The third edition, 16 to 21 October 2025, staged more than 30 shows and presentations across couture, ready-to-wear and menswear at JAX district, with Cenomi Centers and Saudia as partners.",
    statS: [S("FashionNetwork, 8 Oct 2025", "https://us.fashionnetwork.com/news/Fashion-week-returns-to-riyadh-from-october-16-to-21,1771490.html")],
    sig: "Milan trade show White Milano signed on as an official partner of the October 2026 edition, backed by the Ministries of Culture and Tourism, with plans for a permanent Riyadh office and an international buyer program.",
    sigS: [S("FashionNetwork, 12 Nov 2025", "https://us.fashionnetwork.com/news/White-milano-named-an-official-partner-of-riyadh-fashion-week-2026,1782025.html")],
    talk: "Own the Riyadh Fashion Week angle before global fashion desks arrive in October.",
  },
  {
    id: "saudi-coffee", name: "Saudi coffee", ar: "القهوة السعودية", lens: "lifestyle", ring: 1, status: "steady", size: 1,
    topics: ["saudi coffee"],
    demand: "5,130 branded cafes, the region's largest coffee market",
    catalyst: "Riyadh International Coffee Exhibition, 2 to 6 Dec 2026",
    stat: "Saudi Arabia is the Middle East's largest branded coffee shop market with 5,130 outlets, 46 percent of the regional total, projected to pass 5,350 by 2027; PIF's Saudi Coffee Company is investing $319 million over ten years to grow five million coffee trees by 2030.",
    statS: [S("Perfect Daily Grind, 26 Nov 2025", "https://perfectdailygrind.com/2025/11/exploring-saudi-arabia-booming-specialty-coffee-market/"), S("Saudi Gazette, 2022", "https://saudigazette.com.sa/article/620516")],
    sig: "Local chains are scaling past global brands: Barn's has grown beyond 800 outlets, the Kingdom's largest chain, while specialty player Half Million has expanded to 56 stores and opened in London.",
    sigS: [S("Perfect Daily Grind, 26 Nov 2025", "https://perfectdailygrind.com/2025/11/exploring-saudi-arabia-booming-specialty-coffee-market/")],
    talk: "Cafe culture is Saudi Arabia's most visible consumer story; brand collaborations write themselves.",
  },
  {
    id: "saudi-beauty", name: "Saudi beauty", ar: "الجمال والعطور السعودية", lens: "lifestyle", ring: 1, status: "watch", size: 1,
    topics: ["saudi beauty"],
    demand: "perfume alone a $2.1B oud-led market; listed e-tailer",
    catalyst: "Nice One H1 2026 results, late August 2026",
    stat: "The Saudi perfume market alone was worth $2.12 billion in 2023 and is forecast to reach $3.57 billion by 2033 at a 5.94 percent CAGR, driven by oud and oriental fragrances.",
    statS: [S("ResearchAndMarkets via Business Wire, 24 Jan 2025", "https://www.businesswire.com/news/home/20250124271435/en/Saudi-Arabia-Perfume-Market-Report-2025-2033-Rise-in-Intense-Competition-and-High-Import-Costs-Could-Hamper-the-$3.5-Billion-Industry---ResearchAndMarkets.com")],
    sig: "Tadawul-listed beauty e-tailer Nice One, the sector's bellwether since its January 2025 IPO, reported Q1 2026 net profit of SAR 8.65 million, down 64 percent year on year, as competition and marketing costs squeeze beauty e-commerce margins.",
    sigS: [S("Sahm Capital, 29 Apr 2026", "https://www.sahmcapital.com/news/content/nice-one-beauty-reports-sar-865m-net-profit-in-q1-2026-2026-04-29")],
    talk: "Beauty is the rare Saudi consumer niche with listed-company data; use it to pitch business desks.",
  },
  {
    id: "savvy-games", name: "Savvy Games", ar: "مجموعة سافي للألعاب", lens: "lifestyle", ring: 2, status: "hot", size: 3,
    topics: ["savvy games"],
    demand: "owns Scopely, ESL FACEIT; Moonton adds 110M monthly players",
    catalyst: "Esports Nations Cup, Riyadh, 2 to 29 Nov 2026",
    stat: "PIF's Savvy Games Group, backed by a $38 billion gaming investment program, bought Scopely for $4.9 billion in 2023 and agreed in March 2026 to acquire Moonton Games from ByteDance for $6 billion, adding Mobile Legends: Bang Bang and its 110 million monthly active users.",
    statS: [S("PIF, Jul 2023", "https://www.pif.gov.sa/en/news-and-insights/newswire/2023/savvy-games-group-completes-acquisition-of-scopely-for-fourty-nine-billion/"), S("Game Developer, 20 Mar 2026", "https://www.gamedeveloper.com/business/savvy-games-group-agreed-to-buy-moonton-games-for-6-billion")],
    sig: "On 5 August 2026, the PIF-led consortium with Silver Lake and Affinity Partners closed the $55 billion take-private of Electronic Arts at $210 per share, the largest private-equity-funded buyout ever, putting EA alongside Savvy in Riyadh's gaming portfolio.",
    sigS: [S("AP via ABC News, 5 Aug 2026", "https://abcnews.com/Technology/wireStory/video-game-giant-electronic-arts-closes-55-billion-135394606")],
    talk: "Explain Saudi gaming M&A to Western media before they misread it as a side bet.",
  },
  {
    id: "saudi-gaming", name: "Saudi gaming", ar: "قطاع الألعاب الإلكترونية السعودي", lens: "lifestyle", ring: 2, status: "hot", size: 2,
    topics: ["saudi gaming"],
    demand: "23.5M gamers, 67% of the population, already playing",
    catalyst: "Esports World Cup finals, 23 Aug 2026",
    stat: "PwC and the Saudi Esports Federation count 23.5 million gaming enthusiasts, 67 percent of the population, with the national strategy targeting a $13.3 billion GDP contribution and 39,000 jobs by 2030; Qiddiya is building a 500,000 sqm gaming and esports district with 73,000 arena seats.",
    statS: [S("PwC Middle East, 27 Aug 2024", "https://www.pwc.com/m1/en/media-centre/2024/saudi-arabia-stands-to-gain-us13-billion-from-esports-by-2023.html"), S("Qiddiya, 14 Dec 2023", "https://qiddiya.com/press-room/qiddiya-unveils-world-s-first-gaming-and-esports-districts/")],
    sig: "The 2026 Esports World Cup, running 6 July to 23 August with a record $75 million prize pool across its game lineup, relocated this edition to Paris, framed as a rotation with Riyadh as the EWC's home; the Kingdom remains the franchise owner exporting its format abroad.",
    sigS: [S("PR Newswire, 20 Jan 2026", "https://www.prnewswire.com/news-releases/75-million-prize-pool-full-game-lineup-and-schedule-announced-for-esports-world-cup-2026-302665501.html"), S("The National, 6 Jul 2026", "https://www.thenationalnews.com/arts-culture/2026/07/06/esports-world-cups-paris-move-tests-foundations-global-gaming-ambitions/")],
    talk: "23 million gamers is an audience story, not a geopolitics story; reframe it for brands.",
  },
  {
    id: "saudi-malls", name: "Saudi malls", ar: "مراكز التسوق السعودية", lens: "lifestyle", ring: 1, status: "hot", size: 2,
    topics: ["saudi malls"],
    demand: "occupancy 88 to 94% across the big three cities",
    catalyst: "Westfield Riyadh opening, September 2026",
    stat: "Knight Frank tracks 8.6 million sqm of retail stock across Riyadh (4.2M), Jeddah (3.0M) and Dammam (1.4M) in H1 2026, with mall occupancy at 91, 88 and 94 percent respectively and Riyadh lease rates up 1.2 percent to SAR 2,650 per sqm.",
    statS: [S("Knight Frank via CBNME, 5 Aug 2026", "https://www.cbnme.com/news/saudi-retail-and-fb-sector-maintains-strong-growth-in-h1-2026-according-to-knight-frank/")],
    sig: "Cenomi Centers drew 34.7 million visits across 20 malls in Q1 2026 and reported Westfield Riyadh (220,000 sqm GLA) at 99 percent structural completion and 92 percent pre-leased, with Westfield Jeddah at 96 percent, ahead of 2026 openings.",
    sigS: [S("Cenomi Centers Q1-26 results, May 2026", "https://centers.cenomi.com/wp-content/uploads/sites/2/2026/05/Q1-26-PR-English.pdf"), S("Zawya, Dec 2025", "https://www.zawya.com/en/projects/construction/cenomi-centers-says-westfield-malls-in-jeddah-and-riyadh-almost-complete-xrz1ff57")],
    talk: "Destination mall openings are ready-made hooks for launch PR and placement.",
  },
  /* ---- consumer economy (macro) ---- */
  {
    id: "saudi-retail", name: "Saudi retail", ar: "قطاع التجزئة السعودي", lens: "macro", ring: 1, status: "steady", size: 3,
    topics: ["saudi retail"],
    demand: "a near $294B retail market, few global desks assigned",
    catalyst: "White Friday sales season, late November 2026",
    stat: "The Saudi retail market was valued at $293.6 billion in 2025 and is forecast to reach $411.7 billion by 2034; total consumer spending through official payment channels hit SAR 1.57 trillion in 2025.",
    statS: [S("IMARC Group, 2026", "https://www.imarcgroup.com/saudi-arabia-retail-market"), S("Knight Frank via Zawya, Aug 2026", "https://www.zawya.com/en/press-release/knight-frank-saudi-arabias-retail-market-remains-resilient-as-consumer-spending-reaches-sar-425bn-in-q1-2026-421553")],
    sig: "Knight Frank's H1 2026 review, published 5 August 2026, shows Q1 2026 consumer spending of SAR 425 billion, up 6.8 percent year on year, with discretionary categories surging: jewellery POS up 47 percent, clothing up 25.9 percent.",
    sigS: [S("Knight Frank via CBNME, 5 Aug 2026", "https://www.cbnme.com/news/saudi-retail-and-fb-sector-maintains-strong-growth-in-h1-2026-according-to-knight-frank/")],
    talk: "Anchor every KSA pitch with the $294B macro number most journalists lack.",
  },
  {
    id: "saudi-consumer", name: "Saudi consumer", ar: "المستهلك السعودي", lens: "macro", ring: 1, status: "steady", size: 3,
    topics: ["saudi consumer"],
    demand: "71% of Saudis under 35, median age 23.5",
    catalyst: "GASTAT Q2 2026 national accounts, September 2026",
    stat: "GASTAT data shows 71 percent of the Saudi population is under 35, with a median age of 23.5 years, one of the youngest large consumer markets anywhere.",
    statS: [S("Saudi Gazette, 27 May 2025", "https://saudigazette.com.sa/article/652197")],
    sig: "AlixPartners' Global Consumer Outlook (February 2026) finds Saudi spending intent among the world's strongest: a net +4 points plan to spend more in 2026 versus a global net of minus 18; Ipsos' May 2026 KSA sentiment index eased to 70.8 but stays high globally.",
    sigS: [S("AlixPartners, 12 Feb 2026", "https://www.alixpartners.com/newsroom/gco-saudi-arabia/"), S("Ipsos, 15 Jun 2026", "https://www.ipsos.com/en-sa/ksa-primary-consumer-sentiment-index-may-2026")],
    talk: "The youngest big-ticket consumer market in the G20; demographics sell every story.",
  },
  {
    id: "saudi-consumer-spending", name: "Saudi consumer spending", ar: "الإنفاق الاستهلاكي السعودي", lens: "macro", ring: 1, status: "hot", size: 2,
    topics: ["saudi consumer spending"],
    demand: "SAR 16.3B card spend in one week, published weekly",
    catalyst: "SAMA weekly POS bulletin, every Wednesday",
    stat: "SAMA point-of-sale spending reached SAR 189.7 billion in Q1 2026, up 4.4 percent year on year, and e-payments now account for 85 percent of all retail payments in the Kingdom (2025).",
    statS: [S("Knight Frank via Zawya, Aug 2026", "https://www.zawya.com/en/press-release/knight-frank-saudi-arabias-retail-market-remains-resilient-as-consumer-spending-reaches-sar-425bn-in-q1-2026-421553"), S("Saudi Press Agency, 2026", "https://www.spa.gov.sa/en/N2558262")],
    sig: "In the week ended 1 August 2026, POS spending jumped to SAR 16.3 billion across 267.1 million transactions, with Riyadh alone taking SAR 5.23 billion (32.1 percent), a salary-week spike visible in SAMA's weekly series.",
    sigS: [S("Argaam, 5 Aug 2026", "https://www.argaam.com/en/article/articledetail/id/1926250")],
    talk: "SAMA's weekly data lets comms teams newsjack Saudi spending trends every single week.",
  },
  {
    id: "saudi-advertising", name: "Saudi advertising", ar: "سوق الإعلان السعودي", lens: "macro", ring: 1, status: "early", size: 1,
    topics: ["saudi advertising"],
    demand: "$4.68B digital ad market, minimal English trade coverage",
    catalyst: "Athar Festival, Riyadh, 24 to 25 Nov 2026",
    stat: "Saudi digital ad spend is forecast to grow 16.8 percent in 2026 to reach $4.68 billion, per the Q1 2026 Saudi Arabia Digital Ad Spend Databook.",
    statS: [S("GlobeNewswire, 10 Feb 2026", "https://www.globenewswire.com/news-release/2026/02/10/3235538/0/en/Saudi-Arabia-Digital-Ad-Spend-Business-Databook-Report-2026-Market-to-Grow-by-16-8-to-Reach-4-68-Billion-this-Year-Market-Size-Forecast-by-Spend-Value-Across-100-KPIs-2020-2029.html")],
    sig: "Athar, the Saudi Festival of Creativity, opened its 2026 call for content in June and is expanding to more than 150 speakers and 80 brand activations for the 24 to 25 November edition in Riyadh, after drawing 3,000+ attendees last year.",
    sigS: [S("Campaign Middle East, 4 Jun 2026", "https://campaignme.com/athar-saudi-festival-of-creativity-opens-call-for-content-for-2026-edition/")],
    talk: "A $4.7B digital ad market with almost no dedicated English trade coverage: be the source.",
  },
];

/* ---- KPI band (curated authority layer) ---- */
export interface RetailKpi {
  cat: RetailLens | "all";
  lbl: string;
  val: string;
  delta?: string;
  sub: string;
  src: SourceLink[];
}

export const KPIS: RetailKpi[] = [
  {
    cat: "all", lbl: "Total retail market, 2025", val: "$293.6B",
    sub: "Forecast to reach $411.7B by 2034 · consumer spending through official payment channels hit SAR 1.57T in 2025",
    src: [S("IMARC Group", "https://www.imarcgroup.com/saudi-arabia-retail-market"), S("Knight Frank via Zawya", "https://www.zawya.com/en/press-release/knight-frank-saudi-arabias-retail-market-remains-resilient-as-consumer-spending-reaches-sar-425bn-in-q1-2026-421553")],
  },
  {
    cat: "macro", lbl: "SAMA card spend, week to 1 Aug 2026", val: "SAR 16.3B",
    sub: "267.1M POS transactions in a single week · the Kingdom publishes consumer spending weekly",
    src: [S("Argaam · SAMA weekly POS", "https://www.argaam.com/en/article/articledetail/id/1926250")],
  },
  {
    cat: "ecom", lbl: "E-commerce spend, Q1 2026", val: "SAR 98.4B", delta: "+42% YoY",
    sub: "E-commerce via official payment channels, per Knight Frank's KSA retail review",
    src: [S("Knight Frank via Zawya, Aug 2026", "https://www.zawya.com/en/press-release/knight-frank-saudi-arabias-retail-market-remains-resilient-as-consumer-spending-reaches-sar-425bn-in-q1-2026-421553")],
  },
  {
    cat: "lifestyle", lbl: "Mall stock, top three cities, H1 2026", val: "8.6M sqm",
    sub: "Riyadh 4.2M, Jeddah 3.0M, Dammam 1.4M sqm at 88 to 94% occupancy · Westfield Riyadh opens Sep 2026",
    src: [S("Knight Frank via CBNME, 5 Aug 2026", "https://www.cbnme.com/news/saudi-retail-and-fb-sector-maintains-strong-growth-in-h1-2026-according-to-knight-frank/")],
  },
  {
    cat: "macro", lbl: "Saudis under age 35", val: "71%", delta: "median age 23.5",
    sub: "One of the youngest large consumer markets anywhere, per GASTAT",
    src: [S("Saudi Gazette · GASTAT", "https://saudigazette.com.sa/article/652197")],
  },
  {
    cat: "macro", lbl: "Digital ad spend, 2026 forecast", val: "$4.68B", delta: "+16.8% YoY",
    sub: "Saudi Arabia Digital Ad Spend Databook, Q1 2026 update",
    src: [S("GlobeNewswire, 10 Feb 2026", "https://www.globenewswire.com/news-release/2026/02/10/3235538/0/en/Saudi-Arabia-Digital-Ad-Spend-Business-Databook-Report-2026-Market-to-Grow-by-16-8-to-Reach-4-68-Billion-this-Year-Market-Size-Forecast-by-Spend-Value-Across-100-KPIs-2020-2029.html")],
  },
];

/* ---- talks ---- */
export interface RetailTalk {
  n: number;
  t: string;
  s: string;
  p: string;
  fmt: string[];
  ev: string;
}

export const TALKS: RetailTalk[] = [
  {
    n: 1, t: "The $294B Story Nobody Files", s: "Whitespace strategy for the Saudi consumer economy",
    p: "Saudi shoppers moved a record SAR 30B online in one month; the retail market is heading past $400B; and global English press assigns almost nobody to the story. This radar shows exactly which categories are unclaimed, and how a brand, a retailer, or an agency takes one before the desks arrive.",
    fmt: ["Keynote", "Masterclass"], ev: "Built on: SAMA and Knight Frank data · this radar's whitespace panel",
  },
  {
    n: 2, t: "Newsjack the Weekly Wire", s: "SAMA's point-of-sale bulletin as a comms calendar",
    p: "The Saudi Central Bank publishes consumer spending every single week, by sector and by city, and almost no comms team builds on it. A working session on turning a public weekly data series into a repeatable earned-media engine.",
    fmt: ["Workshop", "Masterclass"], ev: "Built on: SAMA weekly POS series · SignalIQ methodology",
  },
  {
    n: 3, t: "White Friday Is an Earned Media Event", s: "Owning the Gulf's Q4 spending spike",
    p: "November e-commerce jumped 67 percent in the White Friday month, the Kingdom's biggest online spike of the year, yet most brands treat it as a paid-ads sprint. How to plan the media arc, the data angles, and the post-event story before 28 November.",
    fmt: ["Keynote", "Workshop"], ev: "Built on: SAMA November data · the White Friday signal file",
  },
  {
    n: 4, t: "From Earnings Call to Earned Media", s: "Tadawul-listed retail as year-round authority",
    p: "Jarir, Cenomi, Savola and Almarai report in public every quarter; BinDawood books billions in revenue with almost zero share of voice. What listed retailers and their agencies can do to convert quarterly numbers into ongoing coverage instead of one wire story per quarter.",
    fmt: ["Masterclass", "Panel"], ev: "Built on: the Tadawul filings behind the brands lens",
  },
];

/* ---- sources footer ---- */
export const SRC_GROUPS: { h: string; links: SourceLink[] }[] = [
  {
    h: "Official & statistical",
    links: [
      S("SAMA weekly POS via Argaam", "https://www.argaam.com/en/article/articledetail/id/1926250"),
      S("SPA · mada e-commerce record, Q1 2025", "https://www.spa.gov.sa/en/N2351771"),
      S("SPA · e-payments 85% of retail payments", "https://www.spa.gov.sa/en/N2558262"),
      S("GASTAT demographics via Saudi Gazette", "https://saudigazette.com.sa/article/652197"),
      S("SPA · Saudi 100 Brands at the Saudi Cup", "https://www.spa.gov.sa/en/N2512230"),
      S("Ministry of Commerce Q2 2026 bulletin via Arab News", "https://www.arabnews.com/node/2650362/business-economy"),
    ],
  },
  {
    h: "Industry reports & surveys",
    links: [
      S("Knight Frank · KSA retail review, Q1/H1 2026", "https://www.zawya.com/en/press-release/knight-frank-saudi-arabias-retail-market-remains-resilient-as-consumer-spending-reaches-sar-425bn-in-q1-2026-421553"),
      S("Knight Frank · H1 2026 via CBNME", "https://www.cbnme.com/news/saudi-retail-and-fb-sector-maintains-strong-growth-in-h1-2026-according-to-knight-frank/"),
      S("IMARC · Saudi retail market", "https://www.imarcgroup.com/saudi-arabia-retail-market"),
      S("PwC × Saudi Esports Federation", "https://www.pwc.com/m1/en/media-centre/2024/saudi-arabia-stands-to-gain-us13-billion-from-esports-by-2023.html"),
      S("ResearchAndMarkets · Saudi perfume market", "https://www.businesswire.com/news/home/20250124271435/en/Saudi-Arabia-Perfume-Market-Report-2025-2033-Rise-in-Intense-Competition-and-High-Import-Costs-Could-Hamper-the-$3.5-Billion-Industry---ResearchAndMarkets.com"),
      S("Research and Markets · Saudi quick commerce", "https://www.globenewswire.com/news-release/2026/04/17/3276234/28124/en/saudi-arabia-quick-commerce-market-report-2026-jahez-hungerstation-and-nana-direct-lead-expansion-through-dark-stores-and-diversified-delivery-models.html"),
      S("Saudi Digital Ad Spend Databook, Q1 2026", "https://www.globenewswire.com/news-release/2026/02/10/3235538/0/en/Saudi-Arabia-Digital-Ad-Spend-Business-Databook-Report-2026-Market-to-Grow-by-16-8-to-Reach-4-68-Billion-this-Year-Market-Size-Forecast-by-Spend-Value-Across-100-KPIs-2020-2029.html"),
      S("AlixPartners · Global Consumer Outlook, KSA", "https://www.alixpartners.com/newsroom/gco-saudi-arabia/"),
      S("Ipsos · KSA Consumer Sentiment Index", "https://www.ipsos.com/en-sa/ksa-primary-consumer-sentiment-index-may-2026"),
    ],
  },
  {
    h: "Business & trade press",
    links: [
      S("Arab News · Uber, Delivery Hero and the Saudi delivery war", "https://www.arabnews.com/node/2652050/business-economy"),
      S("Arab News · Alshaya's Saudi expansion plan", "https://www.arabnews.com/node/2631833/business-economy"),
      S("Arab News · mada October 2025 record", "https://www.arabnews.com/node/2627424/business-economy"),
      S("AGBI · Cenomi Retail earnings", "https://www.agbi.com/retail/2026/05/higher-finance-costs-weigh-on-cenomi-retail-earnings/"),
      S("Argaam · Westfield Jeddah opening", "https://www.argaam.com/en/article/articledetail/id/1925958"),
      S("Wamda · Ninja's Riyadh listing plans", "https://www.wamda.com/2026/03/ninja-explores-riyadh-listing-saudi-market-holds-steady-despite-tensions"),
      S("Rest of World · Keeta vs HungerStation", "https://restofworld.org/2025/delivery-app-keeta-hungerstation-saudi-arabia/"),
      S("FashionNetwork · Riyadh Fashion Week 2026 partners", "https://us.fashionnetwork.com/news/White-milano-named-an-official-partner-of-riyadh-fashion-week-2026,1782025.html"),
      S("Perfect Daily Grind · Saudi specialty coffee", "https://perfectdailygrind.com/2025/11/exploring-saudi-arabia-booming-specialty-coffee-market/"),
      S("Game Developer · Savvy to buy Moonton", "https://www.gamedeveloper.com/business/savvy-games-group-agreed-to-buy-moonton-games-for-6-billion"),
      S("The National · the EWC's Paris move", "https://www.thenationalnews.com/arts-culture/2026/07/06/esports-world-cups-paris-move-tests-foundations-global-gaming-ambitions/"),
      S("Campaign Middle East · Athar Festival 2026", "https://campaignme.com/athar-saudi-festival-of-creativity-opens-call-for-content-for-2026-edition/"),
    ],
  },
  {
    h: "Company & market disclosures",
    links: [
      S("Cenomi Centers · FY25 and Q1-26 releases", "https://centers.cenomi.com/wp-content/uploads/sites/2/2026/04/FY25-ER-English.pdf"),
      S("Lulu Retail · Q1 2026 earnings release", "https://www.luluretail.com/media/5vzepmbz/lulu-retail-q1-2026-earnings-release_eng_110526.pdf"),
      S("Sahm Capital · Jarir H1 2026", "https://www.sahmcapital.com/news/content/jarir-marketing-reports-sar-489m-net-profit-in-the-six-months-2026-2026-07-15"),
      S("Zawya · Savola H1 2026", "https://www.zawya.com/en/press-release/companies-news/savola-group-reports-36-increase-in-first-half-net-profit-423153"),
      S("Maaal · Nahdi Q2 2026", "https://maaal.com/en/news/details/nahdi-medical-q2-profit-f/"),
      S("PIF · Savvy completes Scopely acquisition", "https://www.pif.gov.sa/en/news-and-insights/newswire/2023/savvy-games-group-completes-acquisition-of-scopely-for-fourty-nine-billion/"),
      S("Salla · company metrics", "https://salla.com/en/ai-info/"),
      S("Delivery Hero · HungerStation ownership", "https://www.deliveryhero.com/newsroom/delivery-hero-takes-sole-ownership-of-hungerstation/"),
    ],
  },
  {
    h: "Method & the live wire",
    links: [
      S("GDELT · Web News NGrams 3.0 (65-language corpus)", "https://blog.gdeltproject.org/announcing-the-new-web-news-ngrams-3-0-dataset/"),
      S("GDELT · multilingual horizon scanning", "https://blog.gdeltproject.org/realtime-global-massively-multilingual-horizon-scanning-using-gdelts-new-web-news-ngrams-3-0-dataset/"),
      S("The live global radar this clones", "https://www.syedirfanajmal.com/earned-media-radar"),
      S("The sibling KSA Tourism Radar", "https://www.syedirfanajmal.com/ksa-tourism-radar"),
      S("SignalIQ · the tool behind the wire", "https://www.syedirfanajmal.com/tools/signaliq"),
      S("Events window: Athar Festival, Riyadh, 24-25 Nov 2026", "https://campaignme.com/athar-saudi-festival-of-creativity-opens-call-for-content-for-2026-edition/"),
    ],
  },
];

/* ---- verdict engine: one honest vocabulary, shared by the quiet list, the
   signal files, and The Window quadrant so the page never disagrees with
   itself. Loud = above the tracked set's median press volume; rising = 30v30
   momentum >= +10%. Demand/catalysts come from the curated layer. ---- */
export type RetailVerdict = "whitespace" | "early" | "newsjack" | "late" | "dormant" | "recal";

export const VERDICT_META: Record<RetailVerdict, { label: string; note: string; tone: "gold" | "ink" | "quiet" | "warn" }> = {
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
  status: RetailStatus,
): RetailVerdict {
  if (status === "watch") return "recal";
  if (n === null || tr === null) return demand || catalyst ? "whitespace" : "dormant";
  const loud = n >= Math.max(medianN, 1);
  const rising = tr >= 0.1 && n >= LOW_SAMPLE_N;
  if (loud) return rising ? "newsjack" : "late";
  if (rising) return "early";
  return demand || catalyst ? "whitespace" : "dormant";
}

/** Reverse map: canonical topic -> its curated signal (for demand chips on live topic rows). */
export const SIGNAL_BY_TOPIC: Map<string, RetailSignal> = new Map(
  SIGNALS.flatMap((sig) => sig.topics.map((t) => [t, sig] as const)),
);
