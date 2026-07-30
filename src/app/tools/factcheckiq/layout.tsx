import type { Metadata } from "next";

// Metadata-only wrapper for the FactcheckIQ teaser page (the page itself is
// a client component and cannot export metadata). This is a marketing
// explainer for a tool that has NOT shipped — no working FactcheckIQ logic
// here, and (since 30 Jul 2026) no claim that you can use it today. The page
// stays indexed as an explainer; the copy says "coming soon", not "available".
export const metadata: Metadata = {
  title: "FactcheckIQ · How It Works · Coming Soon",
  description:
    "Catch the made up statistic before your reader does. See how FactcheckIQ's 10-step verification pipeline turns a raw draft into a graded, sourced fact-check report. Coming soon to the EMOS Platform.",
  openGraph: {
    title: "FactcheckIQ · How It Works · Coming Soon",
    description:
      "Catch the made up statistic before your reader does. Coming soon to the EMOS Platform.",
  },
  alternates: { canonical: "/tools/factcheckiq" },
};

// Breadcrumb structured data: Home → Resources → FactcheckIQ, matching the
// pattern used by the free tools (see /tools/signaliq/layout.tsx).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "FactcheckIQ", item: "https://www.syedirfanajmal.com/tools/factcheckiq" },
      ],
    },
  ],
};

export default function FactcheckIQLayout({ children }: { children: React.ReactNode }) {
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
