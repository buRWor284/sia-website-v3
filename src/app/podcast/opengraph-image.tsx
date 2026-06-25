import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "The Earned Media Podcast — Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "PODCAST · SYEDIRFANAJMAL.COM",
    title: "Earned Media\nInsider.",
    subtitle: "Conversations with founders and executives on building authority that compounds.",
    variant: "dark",
  });
}
