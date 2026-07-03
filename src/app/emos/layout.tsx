// Open Graph title/description for the /emos landing page. Kept in the layout so
// the large (currently in-progress) page.tsx stays untouched. /emos/apply and
// /emos/pay set their own openGraph, which overrides this for those routes.
// Open Graph / Twitter metadata for /emos now lives on the page itself
// (src/app/emos/page.tsx), the deepest route segment, so it resolves
// unambiguously for every scraper.

// Service + FAQ structured data for the EMOS offering. Lives in the layout so
// the large page.tsx stays untouched. Applies across the /emos section.
// NOTE: the FAQ entries mirror the on-page FAQ accordion in page.tsx — keep in sync.
const FAQ = [
  {
    q: "How much time does this require each week?",
    a: "Plan for 3 to 5 hours per week: 90 minutes for the live session plus 2 to 3 hours for assignments. The assignments aren't busywork: they're real pitches going to real journalists. Most founders pair the system with a part-time VA ($300 to $1,500 per month).",
  },
  {
    q: "I don't have a team member who can run this. What do I do?",
    a: "Accelerate includes a VA sourcing and training module. I help you identify what support you need, source the right person, and train them on the system. The real qualification isn't whether you have someone today; it's whether you're willing to hire one after the program ends.",
  },
  {
    q: "I tried PR before and it didn't work. Why is this different?",
    a: "Short version: most failed efforts share four traits (generic mass pitching, no founder POV, no consistent system, agency dependency). EMOS removes all four, and because the coverage is earned, it compounds instead of evaporating when you stop paying. The full breakdown is in The Real Problem above.",
  },
  {
    q: "Is this really better than hiring agencies for content, SEO, and PR?",
    a: "Agencies run $60,000 to $240,000 a year and the knowledge leaves when the relationship does. EMOS is a one-time investment that builds the capability inside your company. Some clients do both; most don't need to. See the 3-year cost comparison in Investment above, and run your own numbers in the calculator.",
  },
  {
    q: "Will this work for my industry?",
    a: "Yes, provided you have customers, results, or a defensible point of view. The system has produced placements for SaaS, fintech, healthcare, marketplaces, e-commerce, AI, mobility, education, and consumer products.",
  },
  {
    q: "When can I expect my first placement?",
    a: "Most participants submit their first pitches in Week 2 and land their first verified placement within 4 to 6 weeks of cohort end. Tier 1 placements generally take 60 to 120 days from a cold start.",
  },
  {
    q: "Will this still work as AI changes search?",
    a: "Earned media is the most resilient channel against AI-driven shifts. For AI visibility, brand mentions matter even more than backlinks: ChatGPT, Perplexity, and Google's AI Overviews surface the names credible publications talk about, linked or not. Earned coverage gets you both at once: the brand mentions AI cites you for, and the high-authority backlinks that lift your SEO and rank your domain for the terms your buyers use. EMOS doesn't just survive the AI shift; it's built to benefit from it.",
  },
  {
    q: "How exactly does the placement guarantee work?",
    a: "Foundation: 15 pitches, 1 placement in 60 days. Accelerate: 30 pitches, 2 in 90 days. Miss it and I refund in full. Full terms, and what each side commits to, are in The Guarantee above.",
  },
  {
    q: "What are the EMOS tools? And do I really get them free?",
    a: "Yes. Cohort 1 founding members get free 3-month access. The Journo Outreach Checklist tracks every pitch, follow-up, and placement, and is included on both tracks. Accelerate adds the full suite: PressIQ [Beta], the PR pitch scorer that grades your pitch on mechanics, personalization, and strength; and JournoCollabIQ [Beta], which surfaces the journalists most likely to respond by beat and coverage fit.",
  },
];

const emosJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "EMOS Academy · Earned Media OS",
      serviceType: "Earned media implementation program",
      provider: { "@id": "https://www.syedirfanajmal.com/#person" },
      areaServed: "Worldwide",
      url: "https://www.syedirfanajmal.com/emos",
      description:
        "A guided implementation program that helps founders build the media presence investors check before the first meeting, through top-tier earned media and a repeatable system.",
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

export default function EmosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(emosJsonLd) }}
      />
      {children}
    </>
  );
}
