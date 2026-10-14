import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Earned Media Radar · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "EARNED MEDIA RADAR · SYEDIRFANAJMAL.COM",
    title: "What the press is\ncovering right now",
    subtitle: "A live map of coverage across PR, earned media, SEO, and AI search. Powered by SignalIQ.",
    variant: "white",
  });
}
