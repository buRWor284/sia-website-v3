import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Authority ROI Calculator · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "EMOS TOOL · SYEDIRFANAJMAL.COM",
    title: "Authority ROI Calculator",
    subtitle:
      "Model the ROI of renting media authority versus owning the capability with EMOS.",
  });
}
