import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Complete Your EMOS Payment · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "EMOS CHECKOUT · SYEDIRFANAJMAL.COM",
    title: "Complete your\nEMOS payment",
    subtitle: "Foundation or Accelerate. One-time investment, capability you keep forever.",
    variant: "dark",
  });
}
