import type { Metadata } from "next";

// Metadata-only wrapper for the SignalIQ framework visual (client component).
export const metadata: Metadata = {
  title: "SignalIQ · How It Works",
  description:
    "See the story before it breaks. How SignalIQ works: five open data sources in, an animated 8-step scoring engine, and one ranked, receipts-backed opportunity out — turned into a ready-to-send asset pack in one click.",
  openGraph: {
    title: "SignalIQ · How It Works",
    description:
      "See the story before it breaks. Five open sources in, an 8-step scoring engine, one ranked opportunity out — packed in one click.",
  },
  alternates: { canonical: "/tools/signaliq/how-it-works" },
};

// Breadcrumb structured data reflecting the page's real position in the site
// hierarchy: Home → SignalIQ → How It Works (nested under the tool, not
// /tools, which is not a real route).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "SignalIQ", item: "https://www.syedirfanajmal.com/tools/signaliq" },
        { "@type": "ListItem", position: 3, name: "How It Works", item: "https://www.syedirfanajmal.com/tools/signaliq/how-it-works" },
      ],
    },
  ],
};

export default function SignalIQHowItWorksLayout({ children }: { children: React.ReactNode }) {
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
