import type { Metadata } from "next";

// Per-page metadata for the writing-benefits infographic, overriding the
// shared /infographics layout so this route gets a unique title.
export const metadata: Metadata = {
  title: "Top 11 Scientific Benefits of Writing · Interactive Infographic",
  description:
    "An interactive, research-backed infographic on the science of a regular writing habit, from sharper memory to lower stress, with the studies behind each benefit.",
  openGraph: {
    title: "Top 11 Scientific Benefits of Writing",
    description:
      "An interactive, research-backed infographic on the science of a regular writing habit.",
  },
  alternates: { canonical: "/infographics/writing-benefits" },
};

export default function WritingBenefitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
