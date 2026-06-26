import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "EMOS Curriculum · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "RESOURCES · SYEDIRFANAJMAL.COM",
    title: "The Earned-Media\nPipeline Curriculum",
    subtitle: "The full EMOS learning path: Signal to Coverage in 12 weeks.",
    variant: "white",
  });
}
