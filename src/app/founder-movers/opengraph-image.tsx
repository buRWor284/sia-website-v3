import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Founder Movers · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "FOUNDER MOVERS · SYEDIRFANAJMAL.COM",
    title: "This week's biggest\nmovers in founder press",
    subtitle: "What is heating up and cooling down across founder and Series-A topics. Powered by SignalIQ.",
    variant: "white",
  });
}
