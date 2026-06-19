import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "JournoCollabIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "JOURNOCOLLABIQ TOOL · SYEDIRFANAJMAL.COM",
    title: "JournoCollabIQ\nJournalist beat matcher",
    subtitle: "Find the right reporters, score them by beat fit, export a targeting brief.",
    variant: "dark",
  });
}
