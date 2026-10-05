import { ogPhotoCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "When Travelers Ask ChatGPT Where to Go · Earned Media for Saudi Tourism";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogPhotoCard({
    eyebrow: "TRAVEL EDITION · KEYNOTE · WORKSHOP · PANEL",
    title: "When Travelers Ask\nChatGPT Where to Go",
    credit: "On the panel at Arabian Travel Market, Dubai, 2018",
    photo: "session-earned-media-ai-travel.jpg",
  });
}
