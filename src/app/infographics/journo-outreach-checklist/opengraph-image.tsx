import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "The Journo Outreach Checklist · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "INFOGRAPHIC · SYEDIRFANAJMAL.COM",
    title: "The Journo\nOutreach Checklist",
    subtitle: "Every step to research, pitch, and land press coverage that sticks.",
    variant: "dark",
  });
}
