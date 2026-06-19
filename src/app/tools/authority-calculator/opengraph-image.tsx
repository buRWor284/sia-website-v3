import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Authority ROI Calculator · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "ROI CALCULATOR · SYEDIRFANAJMAL.COM",
    title: "Authority ROI\nCalculator",
    subtitle: "Model the ROI of renting media authority versus owning it with EMOS.",
    variant: "dark",
  });
}
