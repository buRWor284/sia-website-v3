import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Bing SEO, AEO & GEO · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "INFOGRAPHIC · SYEDIRFANAJMAL.COM",
    title: "Bing SEO, AEO\n& GEO in 2026",
    subtitle: "10 data points on why Bing still matters and how it feeds the AI answer layer.",
    variant: "white",
  });
}
