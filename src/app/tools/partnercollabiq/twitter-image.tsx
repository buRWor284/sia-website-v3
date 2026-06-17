import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "PartnerCollabIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "EMOS TOOL · SYEDIRFANAJMAL.COM",
    title: "PartnerCollabIQ · Partnership intelligence",
    subtitle:
      "Discover non-obvious co-marketing partners and a 90-day campaign brief in minutes.",
  });
}
