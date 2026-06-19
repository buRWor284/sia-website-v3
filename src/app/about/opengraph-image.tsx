import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "About · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "ABOUT · SYEDIRFANAJMAL.COM",
    title: "Fractional CMO,\nspeaker, strategist",
    subtitle: "From bootstrapping a remote agency in 2013 to Forbes and HBR contributor.",
    variant: "dark",
  });
}
