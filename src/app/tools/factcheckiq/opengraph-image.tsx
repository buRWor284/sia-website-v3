import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "FactCheck IQ · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "FACTCHECK IQ · EMOS PLATFORM",
    title: "FactCheck IQ\nGraded, sourced fact-checks",
    subtitle: "Catch the made up statistic before your reader does.",
    variant: "dark",
  });
}
