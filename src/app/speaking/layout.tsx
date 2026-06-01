import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speaking · International Keynotes & Workshops — Syed Irfan Ajmal",
  description:
    "Keynotes and workshops on SEO-PR, earned media, content marketing, and personal branding. 15+ international stages including Dubai, Bali, Copenhagen, and Lahore.",
  openGraph: {
    title: "Speaking — Syed Irfan Ajmal",
    description: "International keynotes and workshops on SEO-PR, earned media, and personal branding.",
  },
};

export default function SpeakingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
