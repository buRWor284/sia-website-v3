import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infographics · Interactive Data Stories",
  description:
    "Interactive infographics and data visualizations, including the Scientific Benefits of Writing and the Journalist Outreach Checklist.",
  openGraph: {
    title: "Infographics · Interactive Data Stories",
    description: "Interactive infographics and data visualizations on writing, outreach, and marketing.",
  },
  alternates: { canonical: "/infographics" },
};

// Breadcrumb structured data for the infographics hub page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syedirfanajmal.com" },
        { "@type": "ListItem", position: 2, name: "Infographics", item: "https://www.syedirfanajmal.com/infographics" },
      ],
    },
  ],
};

export default function InfographicsLayout({ children }: { children: React.ReactNode }) {
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
