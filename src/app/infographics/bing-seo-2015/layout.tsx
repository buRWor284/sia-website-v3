import type { Metadata } from "next";

// Per-page metadata for the Bing SEO guide + infographic, overriding the
// shared /infographics layout so this route gets a unique title and the
// canonical points at the new home for the revived 2015 article.
export const metadata: Metadata = {
  title: "The Ultimate Bing SEO Guide (2015, Archived) + Infographic",
  description:
    "The original 2015 illustrated Bing SEO guide, restored and archived: submit your site, follow the guidelines, earn the right links, and diversify your content formats. For the current edition, see the 2026 guide and infographic.",
  openGraph: {
    title: "The Ultimate Bing SEO Guide (2015, Archived) + Infographic",
    description:
      "The original 2015 illustrated guide to ranking on Bing, restored and archived. See the 2026 edition for current data.",
    images: ["/infographics/bing-seo-infographic.jpg"],
  },
  alternates: { canonical: "/infographics/bing-seo-2015" },
};

export default function BingSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
