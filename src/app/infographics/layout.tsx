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

export default function InfographicsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
