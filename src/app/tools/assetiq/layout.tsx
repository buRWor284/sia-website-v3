import type { Metadata } from "next";

// Metadata-only wrapper for the AssetIQ teaser page (the page itself is a
// client component and cannot export metadata). This is a marketing
// explainer for a platform-only tool — no working AssetIQ logic lives here.
export const metadata: Metadata = {
  title: "AssetIQ · How It Works",
  description:
    "Turn a signal into a linkable asset: report, calculator, quiz. See how AssetIQ's 6-step builder engine turns a SignalIQ opportunity into a tracked, linkable asset. Available inside the EMOS Platform.",
  openGraph: {
    title: "AssetIQ · How It Works",
    description:
      "Turn a signal into a linkable asset: report, calculator, quiz. Inside the EMOS Platform.",
  },
  alternates: { canonical: "/tools/assetiq" },
};

// Breadcrumb structured data: Home → Resources → AssetIQ, matching the
// pattern used by the free tools (see /tools/signaliq/layout.tsx).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "AssetIQ", item: "https://www.syedirfanajmal.com/tools/assetiq" },
      ],
    },
  ],
};

export default function AssetIQLayout({ children }: { children: React.ReactNode }) {
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
