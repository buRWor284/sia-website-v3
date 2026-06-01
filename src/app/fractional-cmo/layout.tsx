import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fractional CMO · Strategic Marketing Leadership — Syed Irfan Ajmal",
  description:
    "Fractional CMO services for startups and scale-ups. GEO, SEO-PR strategy, earned media, and content marketing leadership — without the full-time overhead.",
  openGraph: {
    title: "Fractional CMO — Syed Irfan Ajmal",
    description: "Strategic marketing leadership for startups and scale-ups — GEO, SEO-PR, and earned media.",
  },
};

export default function FractionalCMOLayout({ children }: { children: React.ReactNode }) {
  return children;
}
