import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Syed Irfan Ajmal · Fractional CMO & Earned Media Strategist";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "PERSONAL · SYEDIRFANAJMAL.COM",
    title: "Get found.\nGet covered.\nGet customers.",
    subtitle: "The earned-media playbook for founders building real authority.",
    variant: "dark",
  });
}
