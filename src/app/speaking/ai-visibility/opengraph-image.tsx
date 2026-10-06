import { ogPhotoCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "AI Visibility Through Earned Media | Keynote and Workshop";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogPhotoCard({
    eyebrow: "FLAGSHIP SESSION · AI VISIBILITY · KEYNOTE · WORKSHOP · AUDIT",
    title: "AI Visibility\nThrough Earned Media",
    credit: "Workshop at AstroLabs, Dubai",
    photo: "session-earned-media-ai.jpg",
  });
}
