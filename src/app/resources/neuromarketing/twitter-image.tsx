import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Neuromarketing 101 · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "RESOURCE · SYEDIRFANAJMAL.COM",
    title: "Neuromarketing 101: What Is It & How Does It Work?",
  });
}
