import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Speaking · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "SPEAKING · SYEDIRFANAJMAL.COM",
    title: "International keynotes & workshops",
    subtitle:
      "SEO-PR, earned media, and personal branding. 15+ stages worldwide.",
  });
}
