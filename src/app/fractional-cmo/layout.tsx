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
    a: "Retainers run $5K to $10K a month depending on scope. For context, a full-time CMO costs $300K+ a year before you have hired a single person to execute; here the execution team comes with the chair.",
  },
  {
    q: "How many hours a month do I actually get?",
    a: "The engagement is built around outcomes, not hours. Most months include a weekly founder call, a weekly team or vendor sync, and 6 to 10 hours of async strategy, briefs, reviews, and decisions.",
  },
  {
    q: "What is the difference between this and hiring a marketing consultant?",
    a: "A consultant advises. I own. I take the marketing chair, write the strategy, and answer for the results alongside you, with execution through DMR.agency moving from decision to campaign in days.",
  },
  {
    q: "Do you work with non-tech companies?",
    a: "Yes. The earned-media and positioning framework travels across SaaS, professional services, e-commerce, government, gig-economy, healthcare, and automotive categories.",
  },
  {
    q: "What happens when the engagement ends?",
    a: "You keep everything: strategy documents, brand guidelines, editorial calendar, vendor relationships, and every playbook. I write a transition brief at the close to leave the function stronger than I found it.",
  },
  {
    q: "Can we bring you on full-time later?",
    a: "Occasionally, but rarely the right move. The fractional model gives you senior marketing thinking without a senior salary. If a full-time CMO is warranted, I help you find and hire the right person.",
  },
  {
    q: "Do you take equity?",
    a: "No. The retainer is cash-only. A clean monthly retainer keeps incentives aligned, since I need to produce visible results every month to keep the seat.",
  },
  {
    q: "How is this different from just hiring DMR.agency?",
    a: "Hiring the agency gets you execution: PR, SEO, content, link earning. The Fractional CMO retainer adds strategy ownership, weekly decision-making with the founder, marketing function leadership, board and investor narratives, and hiring, directing the agency work rather than replacing it.",
  },
  {
    q: "Have you personally held the title of CMO before?",
    a: "No, not the formal title. Twenty-two years since 2004 as an entrepreneur and operator across sales, tech, and marketing roles in the US, Sweden, Denmark, and Pakistan, the last thirteen years founding and running DMR.agency, the same team behind every result referenced on this page.",
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
