import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Book a Strategy Call · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "STRATEGY CALL · SYEDIRFANAJMAL.COM",
    title: "Book a free\n30-minute call",
    subtitle: "Pressure-test your earned-media plan with Syed Irfan Ajmal.",
    variant: "dark",
  });
}
