import type { Metadata } from "next";

// Metadata-only wrapper for the PressIQ public tool (client component).
export const metadata: Metadata = {
  title: "PressIQ · PR Pitch Scorer",
  description:
    "Paste your pitch. PressIQ scores it on relevance, mechanics, and newsroom-readiness, then tells you exactly what to fix. Free tool from the EMOS suite.",
  openGraph: {
    title: "PressIQ · PR Pitch Scorer",
    description:
      "Score your media pitch on relevance, newsroom-ready material, and the EMOS framework, and see exactly how to fix it.",
  },
  alternates: { canonical: "/tools/pressiq" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "PressIQ",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.syedirfanajmal.com/tools/pressiq",
      description:
        "Score your media pitch on relevance, newsroom-ready material, and the EMOS framework, and see exactly how to fix it.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "PressIQ", item: "https://www.syedirfanajmal.com/tools/pressiq" },
      ],
    },
  ],
};

export default function PressIQLayout({ children }: { children: React.ReactNode }) {
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
