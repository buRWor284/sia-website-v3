import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "EMOS · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "EARNED MEDIA OS · SYEDIRFANAJMAL.COM",
    title: "Build the media presence investors check",
    subtitle:
      "A guided implementation system for founders. One-time investment, capability you keep forever.",
  });
}
