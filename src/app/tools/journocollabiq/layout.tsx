// Structured data for the JournoCollabIQ public tool (the page itself is a
// client-rendered component and cannot export additional metadata). No UI is
// changed here — SoftwareApplication + BreadcrumbList only, matching the
// pattern used by the other public EMOS tool pages (SignalIQ, PressIQ,
// Authority ROI Calculator).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "JournoCollabIQ",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.syedirfanajmal.com/tools/journocollabiq",
      description:
        "Find the right reporters for your story, score them by beat fit and recent coverage, generate pitch angles, and export a targeting brief.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "JournoCollabIQ", item: "https://www.syedirfanajmal.com/tools/journocollabiq" },
      ],
    },
  ],
};

export default function JournoCollabIQLayout({ children }: { children: React.ReactNode }) {
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
