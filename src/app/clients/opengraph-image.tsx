import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Clients · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "CLIENTS · SYEDIRFANAJMAL.COM",
    title: "Brands that trust\nearned media",
    subtitle: "A curated roster of companies we've helped earn coverage, links, and authority.",
    variant: "white",
  });
}
