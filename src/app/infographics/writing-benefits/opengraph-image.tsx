import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Top 11 Scientific Benefits of Writing · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "INFOGRAPHIC · SYEDIRFANAJMAL.COM",
    title: "11 Scientific\nBenefits of Writing",
    subtitle: "Research-backed reasons why writing makes you sharper, healthier, and more credible.",
    variant: "dark",
  });
}
