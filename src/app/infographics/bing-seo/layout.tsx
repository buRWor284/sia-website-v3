import type { Metadata } from "next";

// Per-page metadata for the Bing SEO guide + infographic, overriding the
// shared /infographics layout so this route gets a unique title and the
// canonical points at the new home for the revived 2015 article.
export const metadata: Metadata = {
  title: "Bing SEO Guide 2026 | How to Win on Bing + AI Search",
  description:
    "A practical 2026 Bing SEO guide: how to rank on Bing, optimize your on-page and links, turn on IndexNow, and win AI citations in Copilot and ChatGPT. Bing SEO tips, data and a checklist.",
  openGraph: {
    title: "Bing SEO Guide 2026 | How to Win on Bing and the AI Answer Engines",
    description:
      "SEO for Bing in 2026, fully cited: why Bing matters, how it feeds Copilot and ChatGPT, the on-page and IndexNow basics, and the earned-media moves that win AI citations.",
    images: ["/infographics/bing-seo-infographic.jpg"],
  },
  alternates: { canonical: "/infographics/bing-seo" },
};

// Article + breadcrumb structured data. dateModified is the file's last real
// commit date (same signal sitemap.ts already uses) — no invented dates.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Bing SEO Guide 2026: How to Win on Bing + AI Search",
      description:
        "A practical 2026 Bing SEO guide: how to rank on Bing, optimize your on-page and links, turn on IndexNow, and win AI citations in Copilot and ChatGPT.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/infographics/bing-seo",
      image: "https://www.syedirfanajmal.com/infographics/bing-seo-infographic.jpg",
      dateModified: "2026-06-24",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Infographics", item: "https://www.syedirfanajmal.com/infographics" },
        { "@type": "ListItem", position: 3, name: "Bing SEO Guide 2026", item: "https://www.syedirfanajmal.com/infographics/bing-seo" },
      ],
    },
  ],
};

export default function BingSeoLayout({ children }: { children: React.ReactNode }) {
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
