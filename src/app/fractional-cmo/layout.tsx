import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fractional CMO · Strategic Marketing Leadership — Syed Irfan Ajmal",
  description:
    "Fractional CMO services for startups and scale-ups. SEO-PR strategy, earned media, GEO, and content marketing leadership — without the full-time overhead.",
  openGraph: {
    title: "Fractional CMO — Syed Irfan Ajmal",
    description: "Strategic marketing leadership for startups and scale-ups — SEO-PR, earned media, and GEO.",
  },
};

export default function FractionalCMOLayout({ children }: { children: React.ReactNode }) {
  return children;
}
