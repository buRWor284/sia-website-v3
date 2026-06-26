import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Physicians Thrive · Client Workspace";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    eyebrow: "CLIENT WORKSPACE · SYEDIRFANAJMAL.COM",
    title: "Physicians Thrive\nClient Hub",
    subtitle: "Private workspace for campaign updates, deliverables, and reporting.",
    variant: "white",
  });
}
