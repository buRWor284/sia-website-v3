import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Newsletter · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "NEWSLETTER · SYEDIRFANAJMAL.COM",
    title: "Earned-media lessons,\ntwice a month",
    subtitle: "Real case studies and unfiltered lessons from 20+ years in the trenches.",
    variant: "dark",
  });
}
