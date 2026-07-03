// Structured data for the PartnerCollabIQ public tool (the page itself is a
// client-rendered component and cannot export additional metadata). No UI is
// changed here — SoftwareApplication + BreadcrumbList only, matching the
// pattern used by the other public EMOS tool pages (SignalIQ, PressIQ,
// Authority ROI Calculator).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "PartnerCollabIQ",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.syedirfanajmal.com/tools/partnercollabiq",
      description:
        "Discover non-obvious co-marketing partners, score them, generate personalised outreach, and export a 90-day campaign brief in minutes.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "PartnerCollabIQ", item: "https://www.syedirfanajmal.com/tools/partnercollabiq" },
      ],
    },
  ],
};

export default function PartnerCollabIQLayout({ children }: { children: React.ReactNode }) {
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
