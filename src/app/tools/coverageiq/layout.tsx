// Structured data for the CoverageIQ public tool (the page itself is a
// client-rendered component and cannot export additional metadata). No UI is
// changed here — SoftwareApplication + BreadcrumbList only, matching the
// pattern used by the other public EMOS tool pages (SignalIQ, PressIQ,
// Authority ROI Calculator).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "CoverageIQ",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.syedirfanajmal.com/tools/coverageiq",
      description:
        "Track every pitch from drafted to placed. Log journalist relationships, monitor follow-ups, and see your PESO coverage mix.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "CoverageIQ", item: "https://www.syedirfanajmal.com/tools/coverageiq" },
      ],
    },
  ],
};

export default function CoverageIQLayout({ children }: { children: React.ReactNode }) {
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
