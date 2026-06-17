import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "JournoCollabIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "EMOS TOOL · SYEDIRFANAJMAL.COM",
    title: "JournoCollabIQ · Journalist beat matcher",
    subtitle:
      "Find the right reporters, score them by beat fit, and export a targeting brief.",
  });
}
