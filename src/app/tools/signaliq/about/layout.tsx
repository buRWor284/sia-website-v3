import type { Metadata } from "next";

// Metadata-only wrapper for the SignalIQ methodology page (client component).
export const metadata: Metadata = {
  title: "SignalIQ · Methodology & Data Sources",
  description:
    "How SignalIQ scores media coverage gaps: what the lead/whitespace score measures, the data sources behind it, and what it deliberately does not measure.",
  openGraph: {
    title: "SignalIQ · Methodology & Data Sources",
    description:
      "What the SignalIQ score measures, the data sources behind it, and its limits.",
  },
  alternates: { canonical: "/tools/signaliq/about" },
};

// Breadcrumb structured data reflecting the page's real position in the site
// hierarchy: Home → SignalIQ → Methodology (nested under the tool, not /tools,
// which is not a real route).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "SignalIQ", item: "https://www.syedirfanajmal.com/tools/signaliq" },
        { "@type": "ListItem", position: 3, name: "Methodology & Data Sources", item: "https://www.syedirfanajmal.com/tools/signaliq/about" },
      ],
    },
  ],
};

export default function SignalIQAboutLayout({ children }: { children: React.ReactNode }) {
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
