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
    a: "Most failed PR efforts share four traits: generic mass pitching, no founder POV, no consistent system, and total dependency on an agency that takes the knowledge with them. EMOS is built specifically to remove all four.",
  },
  {
    q: "Is this really better than just hiring a PR agency?",
    a: "Different thing. An agency runs pitches on your behalf for $24K to $60K per year indefinitely, and the knowledge leaves when the relationship does. EMOS is a one-time investment that builds the capability inside your company. Some clients do both; most don't need to.",
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
    a: "Earned media is the most resilient channel against AI-driven shifts. LLMs cite credible publications. When your name appears in Forbes, HBR, or Business Insider, AI systems cite you as a source. EMOS benefits from the AI shift rather than being threatened by it.",
  },
  {
    q: "How exactly does the placement guarantee work?",
    a: "Foundation: 15 pitches, 1 placement in 60 days. Accelerate: 30 pitches, 2 placements in 90 days. Proof of effort is your tracking spreadsheet. Miss the target and the full investment is refunded.",
  },
  {
    q: "What are the EMOS tools, and do I really get them free?",
    a: "Yes. Cohort 1 founding members get permanent free access to all three tools. The Journo Outreach Checklist Tracker tracks every pitch and follow-up, JournoCollabIQ identifies high-fit journalists by beat and coverage history, and QuerySniper provides real-time journalist query monitoring.",
  },
];

const emosJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "EMOS · Earned Media OS",
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
