import type { Metadata } from "next";

// Metadata-only wrapper for the JournoCollabIQ framework visual (client component).
export const metadata: Metadata = {
  title: "JournoCollabIQ · How It Works",
  description:
    "How JournoCollabIQ matches your story to journalists: a 5-stage wizard, 8 fit criteria, and a tiered A/B/C media brief. Illustrated with a sample scenario.",
  openGraph: {
    title: "JournoCollabIQ · How It Works",
    description:
      "The JournoCollabIQ matching engine: 5 wizard stages, 8 fit criteria, 3 tiers. Illustrated with a sample scenario.",
  },
  alternates: { canonical: "/tools/journocollabiq/how-it-works" },
};

// Breadcrumb structured data reflecting the page's real position in the site
// hierarchy: Home → JournoCollabIQ → How It Works (nested under the tool).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "JournoCollabIQ", item: "https://www.syedirfanajmal.com/tools/journocollabiq" },
        { "@type": "ListItem", position: 3, name: "How It Works", item: "https://www.syedirfanajmal.com/tools/journocollabiq/how-it-works" },
      ],
    },
  ],
};

export default function JournoCollabIQHowItWorksLayout({ children }: { children: React.ReactNode }) {
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
