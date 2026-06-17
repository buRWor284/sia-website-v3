import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Default social-share card for every route that doesn't define its own.
export const alt = "Syed Irfan Ajmal · Fractional CMO & Earned Media Strategist";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "FRACTIONAL CMO · EARNED MEDIA STRATEGIST",
    title: "Syed Irfan Ajmal",
    subtitle: "Helping founders and teams get found, get covered, and get customers.",
  });
}
