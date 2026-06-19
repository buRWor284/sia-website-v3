import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "SignalIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "SIGNALIQ TOOL · SYEDIRFANAJMAL.COM",
    title: "SignalIQ\nMedia coverage gap scanner",
    subtitle: "Find the exact outlets covering your competitors, before they find you.",
    variant: "dark",
  });
}
