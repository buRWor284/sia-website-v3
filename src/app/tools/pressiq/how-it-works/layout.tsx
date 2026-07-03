import type { Metadata } from "next";

// Metadata-only wrapper for the PressIQ "How It Works" visual framework page
// (client component). Mirrors the /tools/signaliq/about pattern.
export const metadata: Metadata = {
  title: "PressIQ · How It Works",
  description:
    "How PressIQ scores a PR pitch: the 7-dimension scoring engine, the 32-point checklist, and the 4 tier bands — walked through end to end with a fully worked sample pitch.",
  openGraph: {
    title: "PressIQ · How It Works",
    description:
      "The PressIQ scoring engine explained: 7 dimensions, a 32-point checklist, 4 tiers — with a fully worked sample score.",
  },
  alternates: { canonical: "/tools/pressiq/how-it-works" },
};

// Breadcrumb structured data reflecting the page's real position in the site
// hierarchy: Home → PressIQ → How It Works (nested under the tool, not /tools,
// which is not a real route).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "PressIQ", item: "https://www.syedirfanajmal.com/tools/pressiq" },
        { "@type": "ListItem", position: 3, name: "How It Works", item: "https://www.syedirfanajmal.com/tools/pressiq/how-it-works" },
      ],
    },
  ],
};

export default function PressIQHowItWorksLayout({ children }: { children: React.ReactNode }) {
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
