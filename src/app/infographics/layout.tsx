import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infographics · Interactive Data Stories — Syed Irfan Ajmal",
  description:
    "Interactive infographics and data visualizations — including the Scientific Benefits of Writing and Journalist Outreach Checklist.",
  openGraph: {
    title: "Infographics — Syed Irfan Ajmal",
    description: "Interactive infographics and data visualizations on writing, outreach, and marketing.",
  },
};

export default function InfographicsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
