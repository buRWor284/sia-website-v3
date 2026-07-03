import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "AssetIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "ASSETIQ · EMOS PLATFORM",
    title: "AssetIQ\nLinkable asset builder",
    subtitle: "Turn a signal into a linkable asset: report, calculator, quiz.",
    variant: "dark",
  });
}
