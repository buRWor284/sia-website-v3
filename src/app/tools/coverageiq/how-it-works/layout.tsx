import type { Metadata } from "next";

// Metadata-only wrapper for the CoverageIQ framework visual (client component).
export const metadata: Metadata = {
  title: "CoverageIQ · How It Works",
  description:
    "Track every pitch from drafted to placed. A three-act walkthrough of CoverageIQ's 6-stage tracking pipeline, follow-ups, coverage log, journalist contacts, and PESO dashboard — using an illustrative sample scenario.",
  openGraph: {
    title: "CoverageIQ · How It Works",
    description:
      "Track every pitch from drafted to placed. The CoverageIQ tracking pipeline, explained in three acts.",
  },
  alternates: { canonical: "/tools/coverageiq/how-it-works" },
};

// Breadcrumb structured data reflecting the page's real position in the site
// hierarchy: Home → CoverageIQ → How It Works (nested under the tool, not
// /tools, which is not a real route).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "CoverageIQ", item: "https://www.syedirfanajmal.com/tools/coverageiq" },
        { "@type": "ListItem", position: 3, name: "How It Works", item: "https://www.syedirfanajmal.com/tools/coverageiq/how-it-works" },
      ],
    },
  ],
};

export default function CoverageIQHowItWorksLayout({ children }: { children: React.ReactNode }) {
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
