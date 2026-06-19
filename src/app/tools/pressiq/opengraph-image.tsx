import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "PressIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "PRESSIQ TOOL · SYEDIRFANAJMAL.COM",
    title: "PressIQ\nPR pitch scorer",
    subtitle: "Score your pitch on mechanics, personalization, and strength, then fix it.",
    variant: "dark",
  });
}
