import type { Metadata } from "next";

// Self-referencing canonical + Article/breadcrumb structured data for the
// Neuromarketing 101 guide. Title and description stay in page.tsx.
export const metadata: Metadata = {
  alternates: { canonical: "/resources/neuromarketing" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Neuromarketing 101: What Is Neuromarketing And How Does It Work?",
      description:
        "A research-backed guide to neuromarketing: the history, techniques (fMRI, EEG, eye tracking), real-world examples from Red Bull, Porsche, and Coke vs Pepsi, and how to apply it.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/resources/neuromarketing",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.syedirfanajmal.com/resources" },
        { "@type": "ListItem", position: 3, name: "Neuromarketing 101", item: "https://www.syedirfanajmal.com/resources/neuromarketing" },
      ],
    },
  ],
};

export default function NeuromarketingLayout({ children }: { children: React.ReactNode }) {
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
