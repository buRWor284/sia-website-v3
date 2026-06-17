import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Fractional CMO · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "FRACTIONAL CMO · SYEDIRFANAJMAL.COM",
    title: "Strategic marketing leadership",
    subtitle:
      "GEO, SEO-PR, and earned media for startups and scale-ups, without the full-time overhead.",
  });
}
