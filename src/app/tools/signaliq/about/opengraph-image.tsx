import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "About SignalIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "SIGNALIQ · SYEDIRFANAJMAL.COM",
    title: "How SignalIQ\nworks",
    subtitle: "Primary-source signals from SEC, GDELT, arXiv, and HN — before the press catches up.",
    variant: "white",
    role: "FOUNDER · DMR.AGENCY",
  });
}
