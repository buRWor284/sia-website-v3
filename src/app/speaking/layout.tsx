import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speaking · International Keynotes & Workshops",
  description:
    "Keynotes and workshops on SEO-PR, earned media, content marketing, and personal branding. 15+ international stages including Dubai, Bali, Copenhagen, and Lahore.",
  openGraph: {
    title: "Speaking · International Keynotes & Workshops",
    description: "International keynotes and workshops on SEO-PR, earned media, and personal branding.",
  },
  alternates: { canonical: "/speaking" },
};

export default function SpeakingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
