import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Infographics · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "INFOGRAPHICS · SYEDIRFANAJMAL.COM",
    title: "Visual guides to\nearned media & SEO",
    subtitle: "Research-backed infographics on writing, outreach, and Bing SEO.",
    variant: "white",
  });
}
