import type { Metadata } from "next";

// Metadata-only wrapper for the Authority ROI Calculator (client component).
export const metadata: Metadata = {
  title: "Authority ROI Calculator · Rent vs. Own",
  description:
    "Model the cost of renting media authority through agencies versus owning the capability with EMOS. Free interactive calculator.",
  openGraph: {
    title: "Authority ROI Calculator · Rent vs. Own",
    description:
      "Model the ROI of renting media authority versus owning the capability with EMOS.",
  },
  alternates: { canonical: "/tools/authority-calculator" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "SIA Authority ROI Calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://www.syedirfanajmal.com/tools/authority-calculator",
      description:
        "Compare the cost of renting media authority versus owning the capability, and model your first-year ROI.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://www.syedirfanajmal.com/tools/authority-calculator" },
        { "@type": "ListItem", position: 3, name: "Authority ROI Calculator", item: "https://www.syedirfanajmal.com/tools/authority-calculator" },
      ],
    },
  ],
};

export default function AuthorityCalculatorLayout({ children }: { children: React.ReactNode }) {
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
