import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "CoverageIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "EMOS TOOL · SYEDIRFANAJMAL.COM",
    title: "CoverageIQ · Pitch tracking CRM",
    subtitle:
      "Track every pitch from drafted to amplified, and visualise your PESO mix.",
  });
}
