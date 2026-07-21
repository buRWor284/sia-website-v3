import type { Metadata } from "next";

// Self-referencing canonical + Article/breadcrumb structured data for the
// Authority Flywheel infographic. Title and description stay in page.tsx.
export const metadata: Metadata = {
  alternates: { canonical: "/resources/authority-flywheel" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "The Authority Flywheel: Six Compounding Returns of Earned Media",
      description:
        "An interactive model of how earned media compounds: reputation, visibility, conversions, brand equity, magnetism, and liberty, each turn making the next easier.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/resources/authority-flywheel",
      datePublished: "2026-07-01",
      dateModified: "2026-07-21",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "The Authority Flywheel", item: "https://www.syedirfanajmal.com/resources/authority-flywheel" },
      ],
    },
  ],
};

export default function AuthorityFlywheelLayout({ children }: { children: React.ReactNode }) {
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
