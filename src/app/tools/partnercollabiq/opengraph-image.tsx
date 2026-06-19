import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "PartnerCollabIQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "PARTNERCOLLABIQ TOOL · SYEDIRFANAJMAL.COM",
    title: "PartnerCollabIQ\nPartnership intelligence",
    subtitle: "Discover non-obvious co-marketing partners and a 90-day brief in minutes.",
    variant: "dark",
  });
}
