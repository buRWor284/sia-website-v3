import type { Metadata } from "next";

// Self-referencing canonical + Article/breadcrumb structured data for the
// 100+ Writing Tips guide. Title and description stay in page.tsx.
export const metadata: Metadata = {
  alternates: { canonical: "/resources/writing-tips" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "100+ Writing Tips to Become a Better Writer",
      description:
        "Over 100 practical writing tips covering clarity, structure, editing, voice, and persuasion, for marketers, founders, and anyone who communicates in writing.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/resources/writing-tips",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "100+ Writing Tips", item: "https://www.syedirfanajmal.com/resources/writing-tips" },
      ],
    },
  ],
};

export default function WritingTipsLayout({ children }: { children: React.ReactNode }) {
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
