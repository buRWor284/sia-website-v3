import type { Metadata } from "next";
import { PageSchema } from "@/lib/seo/page-schema";
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
      <PageSchema
        type="CollectionPage"
        path="/gallery"
        name="Gallery · Speaking, Conferences & Travel"
        description={metadata.description as string}
        crumbs={[{ name: "Gallery", path: "/gallery" }]}
      />
      <GalleryClient />
      <Subscriptions sectionNumber="04" />
      <Colophon />
      <ScrollButtons />
    </>
  );
}
