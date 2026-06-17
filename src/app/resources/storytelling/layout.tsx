import type { Metadata } from "next";

// Self-referencing canonical + Article/breadcrumb structured data for the
// Storytelling 101 guide. Title and description stay in page.tsx.
export const metadata: Metadata = {
  alternates: { canonical: "/resources/storytelling" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Storytelling 101: Elevate Your Brand",
      description:
        "The most effective storytelling tactics and techniques in one mega-guide, with frameworks and brand examples to help you elevate your brand.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/resources/storytelling",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "Storytelling 101", item: "https://www.syedirfanajmal.com/resources/storytelling" },
      ],
    },
  ],
};

export default function StorytellingLayout({ children }: { children: React.ReactNode }) {
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
