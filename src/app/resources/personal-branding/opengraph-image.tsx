import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Personal Branding 101 · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "RESOURCE · SYEDIRFANAJMAL.COM",
    title: "Personal\nBranding 101",
    subtitle: "How to brand yourself for success.",
    variant: "dark",
  });
}
