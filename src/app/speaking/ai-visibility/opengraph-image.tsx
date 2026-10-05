import { ogPhotoCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Earned Media in the Age of AI · Keynote & Interactive Session";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogPhotoCard({
    eyebrow: "FLAGSHIP SESSION · KEYNOTE · WORKSHOP · PANEL",
    title: "Earned Media\nin the Age of AI",
    credit: "Workshop at AstroLabs, Dubai",
    photo: "session-earned-media-ai.jpg",
  });
}
