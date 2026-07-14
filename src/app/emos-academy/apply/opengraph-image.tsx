import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Apply for EMOS Cohort 1 · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "EMOS COHORT 1 · SYEDIRFANAJMAL.COM",
    title: "Apply for\nEMOS Cohort 1",
    subtitle: "One short application, reviewed personally within 48 hours. Five seats.",
    variant: "dark",
  });
}
