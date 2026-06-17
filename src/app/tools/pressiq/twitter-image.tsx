import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "PressIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "EMOS TOOL · SYEDIRFANAJMAL.COM",
    title: "PressIQ · PR pitch scorer",
    subtitle:
      "Score your pitch on mechanics, personalization, and strength, then see how to fix it.",
  });
}
