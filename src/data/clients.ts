/**
 * Client roster · ported from design_handoff/client-data.jsx.
 * Three tiers: pre-agency profile cards, featured tier-1 with results,
 * tier-2 logo grid. Single source of truth — consumed by Homepage strip,
 * Clients page, Speaking page strip.
 */

export type ClientCountry = "DE" | "EU" | "DK" | "UK" | "US" | "PK" | "CA";

export type Client = {
  key: string;
  name: string;
  short?: string;
  fullName?: string;
  sector?: string;
  country: ClientCountry;
  countryLabel?: string;
  role?: string;
  when?: string;
  blurb?: string;
  wordmark?: string;
  /** Image URL. `null` means render the wordmark fallback. */
  logo: string | null;
  stat?: string;
  statLabel?: string;
  caseStudy?: string | null;
  services?: ReadonlyArray<string>;
};

export const CLIENTS_PRE: ReadonlyArray<Client> = [
  {
    key: "giz",
    name: "GIZ",
    fullName: "Deutsche Gesellschaft für Internationale Zusammenarbeit",
    country: "DE",
    countryLabel: "Germany",
    role: "Marketing / programme contributor",
    when: "2008–2010",
    blurb:
      "Germany's official agency for international development cooperation. " +
      "One of the world's largest such agencies — operates in 120+ countries " +
      "with €3B+ annual volume, fully backed by the German federal government.",
    wordmark: "GIZ",
    logo: null,
  },
  {
    key: "marcus-evans",
    name: "Marcus Evans",
    fullName: "Marcus Evans Group",
    country: "EU",
    countryLabel: "London, UK · operates in 60+ countries",
    role: "Conference producer · Sweden office",
    when: "2007",
    blurb:
      "Premier global business intelligence & events company. Known for " +
      "high-value senior-executive conferences and summits across major " +
      "industries worldwide; the C-suite side of B2B media.",
    wordmark: "Marcus Evans",
    logo: null,
  },
  {
    key: "infoshare",
    name: "InfoShare",
    fullName: "InfoShare · Copenhagen",
    country: "DK",
    countryLabel: "Brønshøj, Copenhagen",
    role: "Digital / marketing",
    when: "2008",
    blurb:
      "Danish digital organisation based in Copenhagen. An early-career " +
      "engagement in the Scandinavian tech scene before the move into " +
      "international consulting.",
    wordmark: "InfoShare",
    logo: "/assets/clients/infoshare.jpeg",
  },
];

export const CLIENTS_TIER1: ReadonlyArray<Client> = [
  {
    key: "nta",
    name: "National Tyres & Autocare",
    short: "NTA",
    sector: "E-commerce · Autocare",
    country: "UK",
    stat: "$160K → $1.2M / mo",
    statLabel: "monthly revenue, post-engagement",
    blurb:
      "Major UK autocare e-commerce. Multi-quarter digital PR + SEO programme; " +
      "the result was published as a SEMrush case study.",
    role: "Lead · digital PR + organic strategy",
    caseStudy: "https://dmr.agency/case-studies/nta-case-study/",
    logo: "/assets/clients/nta.jpg",
    services: ["EMOS", "Fractional CMO"],
  },
  {
    key: "ridester",
    name: "Ridester",
    sector: "Media · Ridesharing",
    country: "US",
    stat: "0 → 1.5M / mo",
    statLabel: "monthly unique visitors",
    blurb:
      "US-based ridesharing media property. Built editorial authority and " +
      "earned-media programme from scratch to 1.5M monthly uniques.",
    role: "Strategy + outreach",
    caseStudy: "https://dmr.agency/case-studies/ridester-case-study/",
    logo: "/assets/clients/ridester.png",
    services: ["EMOS", "Fractional CMO"],
  },
  {
    key: "centriq",
    name: "Centriq",
    sector: "SaaS · Home management",
    country: "US",
    stat: "+600%",
    statLabel: "app sign-ups · later raised $11M in funding",
    blurb:
      "San Francisco SaaS for household-item management. Worked across " +
      "acquisition, content, and PR; the company subsequently raised $11M.",
    role: "Growth + earned media",
    caseStudy: null,
    logo: "/assets/clients/centriq.png",
    services: ["Fractional CMO", "EMOS"],
  },
  {
    key: "curednation",
    name: "Curednation",
    sector: "Healthcare · Telemedicine",
    country: "US",
    stat: "+709%",
    statLabel: "organic traffic",
    blurb:
      "Online addiction-treatment provider. Programme combined technical SEO, " +
      "content, and digital PR; published case study details a 7× traffic lift.",
    role: "Strategy + execution",
    caseStudy:
      "https://dmr.agency/case-studies/how-dmr-agency-increased-the-organic-traffic-of-an-addiction-treatment-center-by-more-than-700/",
    logo: "/assets/clients/curednation.png",
    services: ["EMOS"],
  },
  {
    key: "alrug",
    name: "ALRUG",
    sector: "E-commerce · Rugs",
    country: "US",
    stat: "+300%",
    statLabel: "revenue lift · ~$250K added",
    blurb:
      "US rug e-commerce sourcing from Pakistan. Earned-media + SEO programme " +
      "tripled revenue inside the engagement window.",
    role: "Strategy + outreach",
    caseStudy: "https://dmr.agency/case-studies/alrug-case-study/",
    logo: "/assets/clients/alrug.png",
    services: ["EMOS"],
  },
  {
    key: "dinar-standard",
    name: "Dinar Standard",
    sector: "Financial research",
    country: "US",
    stat: "MSN · RD",
    statLabel: "high-authority citations earned",
    blurb:
      "Collaborated with NYC and Dubai teams on a Gulf government portal. " +
      "Earned citations from MSN, Reader's Digest, and other top-tier outlets.",
    role: "Outreach + media strategy",
    caseStudy: "https://dmr.agency/case-studies/dinar-standard-case-study/",
    logo: "/assets/clients/dinar_standard.png",
    services: ["EMOS"],
  },
  {
    key: "gigworker",
    name: "Gigworker",
    sector: "Media · Gig economy",
    country: "US",
    stat: "30K / mo",
    statLabel: "organic visitors",
    blurb:
      "US media property covering the gig economy. Earned-media + editorial " +
      "programme grew organic visitors to 30K/month.",
    role: "Strategy + outreach",
    caseStudy: "https://dmr.agency/case-studies/gigworker-case-study/",
    logo: "/assets/clients/gigworker.png",
    services: ["EMOS"],
  },
  {
    key: "physician-thrive",
    name: "Physician Thrive",
    sector: "Financial services",
    country: "US",
    stat: "MSN · Bankrate · BI",
    statLabel: "years of earned citations",
    blurb:
      "Financial-planning practice serving US physicians. Multi-year " +
      "earned-media programme produced backlinks from MSN, Bankrate, and " +
      "Business Insider.",
    role: "Long-running outreach partner",
    caseStudy: null,
    logo: "/assets/clients/physicians_thrive.png",
    services: ["EMOS"],
  },
];

export const CLIENTS_TIER2: ReadonlyArray<Client> = [
  { key: "dunlop",         name: "Dunlop Tires",           sector: "Automotive",           country: "UK", logo: "/assets/clients/dunlop.png" },
  { key: "manchester",     name: "The Manchester College", sector: "Education",            country: "UK", logo: null },
  { key: "smith-thompson", name: "Smith Thompson",         sector: "Home security",        country: "US", logo: null },
  { key: "beebole",        name: "BeeBole",                sector: "SaaS · Time tracking", country: "EU", logo: null },
  { key: "automizy",       name: "Automizy",               sector: "SaaS · Email",         country: "EU", logo: "/assets/clients/automizy.png" },
  { key: "quran-academy",  name: "Quran Academy",          sector: "EdTech",               country: "US", logo: "/assets/clients/quran_academy.png" },
  { key: "efani",          name: "Efani",                  sector: "SaaS · Cybersecurity", country: "US", logo: "/assets/clients/efani.png" },
  { key: "tbps",           name: "The Big Phone Store",    sector: "E-commerce",           country: "UK", logo: "/assets/clients/tbps.png" },
  { key: "digitech",       name: "DIGITECH",               sector: "Digital agency",       country: "US", logo: null },
  { key: "logodesign",     name: "LogoDesign",             sector: "Design software",      country: "US", logo: "/assets/clients/logo_design.png" },
  { key: "m3d",            name: "M3D",                    sector: "3D printing",          country: "US", logo: null },
  { key: "intl-insurance", name: "International Insurance",sector: "Insurance",            country: "US", logo: "/assets/clients/international_insurance.png" },
  { key: "qaleen",         name: "Qaleen",                 sector: "Home goods · Rugs",    country: "PK", logo: "/assets/clients/qaleen.png" },
  { key: "canvas-prints",  name: "The Canvas Prints",      sector: "E-commerce",           country: "UK", logo: null },
  { key: "tyreshopper",    name: "TyreShopper",            sector: "Automotive e-comm.",   country: "UK", logo: null },
  {
    key: "avidon",
    name: "Avidon Marketing Group",
    short: "AMG",
    sector: "Marketing agency",
    country: "US",
    blurb:
      "US-based full-service marketing agency. Delivered multiple successful " +
      "campaigns across mainstream and regulated verticals, all under NDA.",
    role: "Agency partner",
    caseStudy: null,
    logo: "/assets/clients/amg.png",
    services: ["EMOS"],
  },
  {
    key: "the-brand-crew",
    name: "The Brand Crew",
    short: "TBC",
    sector: "Marketing agency",
    country: "PK",
    blurb:
      "Pakistan-based marketing agency specialising in beauty and financial " +
      "sector brands. Multiple successful projects delivered, details under NDA.",
    role: "Agency partner",
    caseStudy: null,
    logo: "/assets/clients/TBC.png",
    services: ["EMOS"],
  },
  {
    key: "link-caffeine",
    name: "Link Caffeine",
    sector: "Marketing agency · SEO",
    country: "US",
    blurb: "US-based SEO and link-building agency.",
    role: "Agency partner",
    caseStudy: null,
    logo: "/assets/clients/link_caffeine.png",
    services: ["EMOS"],
  },
  {
    key: "precision-brands",
    name: "Precision Brands",
    sector: "Marketing agency",
    country: "CA",
    blurb: "Canadian marketing agency.",
    role: "Agency partner",
    caseStudy: null,
    logo: "/assets/clients/precision_brands.png",
    services: ["EMOS"],
  },
];
