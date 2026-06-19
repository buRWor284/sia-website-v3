import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "EMOS · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "EMOS · SYEDIRFANAJMAL.COM",
    title: "Build the media\npresence investors check",
    subtitle: "Systematic earned-media for serious founders who play the long game.",
    variant: "dark",
  });
}
