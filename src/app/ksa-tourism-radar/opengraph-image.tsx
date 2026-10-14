import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "KSA Tourism & Hospitality Radar · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "KSA TOURISM & HOSPITALITY RADAR",
    title: "Saudi tourism,\nmeasured in press",
    subtitle: "Giga-projects, mega-events, hospitality and faith travel, wired to live press-coverage data via SignalIQ.",
    variant: "white",
  });
}
