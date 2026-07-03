import type { Metadata } from "next";

// Per-page metadata for the interactive checklist, overriding the shared
// /infographics layout so this route gets a unique title and description.
export const metadata: Metadata = {
  title: "The Journo Outreach Checklist · Interactive Field Guide",
  description:
    "An interactive, field-tested checklist to get your journalist pitches ready before you hit send, covering targeting, timing, personalization, and follow-up.",
  openGraph: {
    title: "The Journo Outreach Checklist",
    description:
      "An interactive, field-tested checklist to get your journalist pitches ready before you hit send.",
  },
  alternates: { canonical: "/infographics/journo-outreach-checklist" },
};

// Article + breadcrumb structured data. dateModified is the file's last real
// commit date (same signal sitemap.ts already uses) — no invented dates.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "The Journo Outreach Checklist",
      description:
        "An interactive, field-tested checklist to get your journalist pitches ready before you hit send, covering targeting, timing, personalization, and follow-up.",
      author: { "@id": "https://www.syedirfanajmal.com/#person" },
      publisher: { "@id": "https://www.syedirfanajmal.com/#person" },
      mainEntityOfPage: "https://www.syedirfanajmal.com/infographics/journo-outreach-checklist",
      dateModified: "2026-06-06",
      inLanguage: "en",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Infographics", item: "https://www.syedirfanajmal.com/infographics" },
        { "@type": "ListItem", position: 3, name: "The Journo Outreach Checklist", item: "https://www.syedirfanajmal.com/infographics/journo-outreach-checklist" },
      ],
    },
  ],
};

export default function JournoChecklistLayout({ children }: { children: React.ReactNode }) {
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
