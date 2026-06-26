import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Gallery · Speaking, Conferences & Travel";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "GALLERY · SYEDIRFANAJMAL.COM",
    title: "Speaking,\nconferences & travel",
    subtitle: "Photos from 15+ stages, industry events, and travels worldwide.",
    variant: "dark",
  });
}
