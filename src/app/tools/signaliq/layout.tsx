import type { Metadata } from "next";

// Metadata-only wrapper for the SignalIQ public tool (the page itself is a
// client component and cannot export metadata). No UI is changed here.
export const metadata: Metadata = {
  title: "SignalIQ · Media Coverage Gap Scanner",
  description:
    "SignalIQ spots media coverage gaps and whitespace across your sector with live signal data. A free interactive tool from the EMOS suite.",
  openGraph: {
    title: "SignalIQ · Media Coverage Gap Scanner",
    description:
      "Spot media coverage gaps and whitespace across your sector with live signal data.",
  },
  alternates: { canonical: "/tools/signaliq" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "SignalIQ",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.syedirfanajmal.com/tools/signaliq",
      description:
        "Spot media coverage gaps and whitespace across your sector with live signal data.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://www.syedirfanajmal.com/tools" },
        { "@type": "ListItem", position: 3, name: "SignalIQ", item: "https://www.syedirfanajmal.com/tools/signaliq" },
      ],
    },
  ],
};

export default function SignalIQLayout({ children }: { children: React.ReactNode }) {
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
