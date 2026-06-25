import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Resources · Earned Media Pipeline — Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "RESOURCES · SYEDIRFANAJMAL.COM",
    title: "The Earned\nMedia Pipeline.",
    subtitle: "Playbooks, tools, and frameworks for building real media authority.",
    variant: "white",
    role: "FRACTIONAL CMO · EARNED MEDIA STRATEGIST",
  });
}
