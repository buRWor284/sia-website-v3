import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Contact Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "CONTACT · SYEDIRFANAJMAL.COM",
    title: "Let's talk\nearned media.",
    subtitle: "Reach out about EMOS, fractional CMO, or speaking engagements.",
    variant: "dark",
  });
}
