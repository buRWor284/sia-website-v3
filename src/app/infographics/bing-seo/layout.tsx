import type { Metadata } from "next";

// Per-page metadata for the Bing SEO guide + infographic, overriding the
// shared /infographics layout so this route gets a unique title and the
// canonical points at the new home for the revived 2015 article.
export const metadata: Metadata = {
  title: "The Ultimate Bing SEO Guide + Infographic",
  description:
    "Bing keeps growing — and it now feeds Microsoft Copilot and AI answer engines. The original illustrated Bing SEO guide: submit your site, follow the guidelines, earn the right links, and diversify your content formats.",
  openGraph: {
    title: "The Ultimate Bing SEO Guide + Infographic",
    description:
      "The original illustrated guide to ranking on Bing — restored, with the full infographic.",
    images: ["/infographics/bing-seo-infographic.jpg"],
  },
  alternates: { canonical: "/infographics/bing-seo" },
};

export default function BingSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
