import type { Metadata } from "next";

// Self-referencing canonical + Article/breadcrumb structured data for the
// Personal Branding 101 guide. Title and description stay in page.tsx.
export const metadata: Metadata = {
  alternates: { canonical: "/resources/personal-branding" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Personal Branding 101: How to Brand Yourself for Success",
      description:
        "A complete guide to building your personal brand: strategy, positioning, storytelling, content, and the real examples behind 7-figure personal brands.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/resources/personal-branding",
      datePublished: "2026-05-29",
      dateModified: "2026-06-26",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "Personal Branding 101", item: "https://www.syedirfanajmal.com/resources/personal-branding" },
      ],
    },
  ],
};

export default function PersonalBrandingLayout({ children }: { children: React.ReactNode }) {
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
