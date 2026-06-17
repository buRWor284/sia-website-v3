import type { Metadata } from "next";
import { Colophon, Subscriptions } from "@/components/bureau";
import GalleryClient from "./GalleryClient";
import { ScrollButtons } from "@/components/ScrollButtons";

export const metadata: Metadata = {
  title: "Gallery · Speaking, Conferences & Travel",
  description:
    "Photos from international conferences, keynotes, workshops, and travels — Dubai, Bali, Copenhagen, and beyond.",
  openGraph: {
    title: "Gallery · Speaking, Conferences & Travel",
    description: "Speaking, conferences, and travel photos from around the world.",
  },
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <GalleryClient />
      <Subscriptions sectionNumber="04" />
      <Colophon />
      <ScrollButtons />
    </>
  );
}
