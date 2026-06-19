import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "CoverageIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "COVERAGEIQ TOOL · SYEDIRFANAJMAL.COM",
    title: "CoverageIQ\nPitch tracking CRM",
    subtitle: "Track every pitch from drafted to amplified, and visualise your PESO mix.",
    variant: "dark",
  });
}
