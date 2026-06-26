import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Active Ventures · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "VENTURES · SYEDIRFANAJMAL.COM",
    title: "Active\nventures",
    subtitle: "The companies and tools I'm building in the earned-media space.",
    variant: "white",
  });
}
