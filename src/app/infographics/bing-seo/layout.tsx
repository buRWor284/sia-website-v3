import type { Metadata } from "next";

// Per-page metadata for the Bing SEO guide + infographic, overriding the
// shared /infographics layout so this route gets a unique title and the
// canonical points at the new home for the revived 2015 article.
export const metadata: Metadata = {
  title: "How to Win on Bing in 2026 | Guide + Infographic",
  description:
    "Bing is the index behind Microsoft Copilot and a named provider inside ChatGPT, so Bing visibility increasingly buys AI visibility. A 2026 guide plus interactive infographic: market share, the AI engine to index map, IndexNow, links vs brand mentions, and a measurement checklist. Fully cited.",
  openGraph: {
    title: "How to Win on Bing in 2026 | And the AI Answer Engines It Feeds",
    description:
      "A current, fully cited guide and interactive infographic: why Bing matters, how it feeds Copilot and ChatGPT, and the earned-media moves that win AI citations.",
    images: ["/infographics/bing-seo-infographic.jpg"],
  },
  alternates: { canonical: "/infographics/bing-seo" },
};

export default function BingSeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
