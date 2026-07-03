import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fractional CMO · Strategic Marketing Leadership",
  description:
    "Fractional CMO services for startups and scale-ups. GEO, SEO-PR strategy, earned media, and content marketing leadership, without the full-time overhead.",
  openGraph: {
    title: "Fractional CMO · Strategic Marketing Leadership",
    description: "Strategic marketing leadership for startups and scale-ups: GEO, SEO-PR, and earned media.",
  },
  alternates: { canonical: "/fractional-cmo" },
};

// NOTE: the FAQ entries below mirror the FAQS array in page.tsx for the
// FAQPage structured data. If you edit the on-page FAQ, update these to match.
const FAQ = [
  {
    q: "What does it cost?",
    a: "Retainers run $5K to $10K a month depending on scope. For context, a full-time CMO costs $300K+ a year before you have hired a single person to execute; here the execution team comes with the chair. If six months feels like a big first step, the Marketing Leadership Audit below is the smaller one.",
  },
  {
    q: "How many hours a month do I actually get?",
    a: "The engagement is built around outcomes, not hours. In practice, most months include a weekly founder call (45-60 min), a weekly team or vendor sync (30-45 min), and 6-10 hours of async work: strategy documents, briefs, reviews, and decisions. The right question is whether the marketing function is moving, not how many hours are logged.",
  },
  {
    q: "What's the difference between this and hiring a marketing consultant?",
    a: "A consultant advises. I own. I take the marketing chair, write the strategy, and answer for the results alongside you. The weekly cadence means decisions get made in real time, not in a report you receive six weeks later. And the execution layer through DMR.agency means we can move from decision to campaign in days, not quarters.",
  },
  {
    q: "Do you work with non-tech companies?",
    a: "Yes. The framework travels across categories: SaaS, professional services, e-commerce, and media all follow the same earned-media and positioning logic. Clients in this portfolio include a government web portal, a gig-economy platform, an addiction treatment centre, and an automotive chain. The pattern is consistent: earned authority, a content system, and a growth loop tied to the sales motion.",
  },
  {
    q: "What happens when the engagement ends?",
    a: "You keep everything. Strategy documents, brand guidelines, editorial calendar, vendor relationships, and every playbook we built together. I write a transition brief at the close and will introduce the person taking the seat after me if that is relevant. The goal is to leave the function stronger than I found it, not to create dependency.",
  },
  {
    q: "Can we bring you on full-time later?",
    a: "It happens occasionally, but it is rarely the right move. The fractional model works because you get senior marketing thinking without a senior salary. If the company grows to a stage where a full-time CMO is warranted, I will help you find and hire the right person, and that is a natural part of the engagement.",
  },
  {
    q: "Do you take equity?",
    a: "No. The retainer is cash-only. Equity complicates the relationship in ways that tend to hurt early-stage companies: it shifts incentives around spending, hiring, and timelines in subtle but real ways. A clean monthly retainer keeps incentives aligned: I need to produce visible results every month to keep the seat.",
  },
  {
    q: "How is this different from just hiring DMR.agency?",
    a: "Hiring the agency gets you execution: PR, SEO, content, link earning. The Fractional CMO retainer adds the layer above that: strategy ownership, weekly decision-making with the founder, marketing function leadership, board and investor narratives, and hiring. I sit at the table and answer for the results. The agency work happens because I direct it, not instead of it.",
  },
  {
    q: "Have you personally held the title of CMO before?",
    a: "No, not the formal title, and I would rather say that directly than let \"CMO\" imply something it hasn't earned. Twenty-two years now, since 2004, as an entrepreneur and operator across sales, tech, and marketing roles and ventures in the US (remote), Sweden, Denmark, and Pakistan. The last thirteen of those years, since 2013, have been founding and running DMR.agency, the same team behind every result on this page. I'm not selling a corporate CMO résumé; I'm selling an operator who has actually shipped the campaigns and is willing to take the chair. If a former in-house CMO with a specific industry pedigree is the requirement, I'm not that person, and it's better you know now than three months in.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Fractional CMO Services",
      serviceType: "Fractional Chief Marketing Officer",
      provider: { "@id": "https://www.syedirfanajmal.com/#person" },
      areaServed: "Worldwide",
      url: "https://www.syedirfanajmal.com/fractional-cmo",
      description:
        "Strategic marketing leadership for startups and scale-ups, covering GEO, SEO-PR, earned media, and content marketing without the full-time overhead.",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export default function FractionalCMOLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
