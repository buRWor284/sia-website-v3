import type { Metadata } from "next";

// Per-page metadata for the writing-benefits infographic, overriding the
// shared /infographics layout so this route gets a unique title.
export const metadata: Metadata = {
  title: "Top 11 Scientific Benefits of Writing · Interactive Infographic",
  description:
    "An interactive, research-backed infographic on the science of a regular writing habit, from sharper memory to lower stress, with the studies behind each benefit.",
  openGraph: {
    title: "Top 11 Scientific Benefits of Writing",
    description:
      "An interactive, research-backed infographic on the science of a regular writing habit.",
  },
  alternates: { canonical: "/infographics/writing-benefits" },
};

// Article + breadcrumb structured data. dateModified is the file's last real
// commit date (same signal sitemap.ts already uses) — no invented dates.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Top 11 Scientific Benefits of Writing",
      description:
        "An interactive, research-backed infographic on the science of a regular writing habit, from sharper memory to lower stress, with the studies behind each benefit.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/infographics/writing-benefits",
      dateModified: "2026-06-04",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Infographics", item: "https://www.syedirfanajmal.com/infographics" },
        { "@type": "ListItem", position: 3, name: "Top 11 Scientific Benefits of Writing", item: "https://www.syedirfanajmal.com/infographics/writing-benefits" },
      ],
    },
  ],
};

export default function WritingBenefitsLayout({ children }: { children: React.ReactNode }) {
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
