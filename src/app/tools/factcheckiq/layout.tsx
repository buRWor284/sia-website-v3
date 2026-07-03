import type { Metadata } from "next";

// Metadata-only wrapper for the FactCheck IQ teaser page (the page itself is
// a client component and cannot export metadata). This is a marketing
// explainer for a platform-only tool — no working FactCheck IQ logic here.
export const metadata: Metadata = {
  title: "FactCheck IQ · How It Works",
  description:
    "Catch the made up statistic before your reader does. See how FactCheck IQ's 10-step verification pipeline turns a raw draft into a graded, sourced fact-check report. Available inside the EMOS Platform.",
  openGraph: {
    title: "FactCheck IQ · How It Works",
    description:
      "Catch the made up statistic before your reader does. Inside the EMOS Platform.",
  },
  alternates: { canonical: "/tools/factcheckiq" },
};

// Breadcrumb structured data: Home → Resources → FactCheck IQ, matching the
// pattern used by the free tools (see /tools/signaliq/layout.tsx).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "FactCheck IQ", item: "https://www.syedirfanajmal.com/tools/factcheckiq" },
      ],
    },
  ],
};

export default function FactCheckIQLayout({ children }: { children: React.ReactNode }) {
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
