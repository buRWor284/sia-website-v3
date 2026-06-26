import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Bing SEO Guide 2015 · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "INFOGRAPHIC · SYEDIRFANAJMAL.COM",
    title: "The Bing SEO\nGuide",
    subtitle: "A deep-dive on Bing ranking factors, meta tags, and search visibility.",
    variant: "white",
  });
}
