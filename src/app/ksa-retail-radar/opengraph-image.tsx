import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "KSA Retail & Consumer Radar · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "KSA RETAIL & CONSUMER RADAR",
    title: "Saudi retail,\nmeasured in press",
    subtitle: "E-commerce, retail groups, lifestyle retail and the macro picture, wired to live press-coverage data via SignalIQ.",
    variant: "white",
  });
}
