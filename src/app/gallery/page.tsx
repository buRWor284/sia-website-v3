import { Colophon, Subscriptions } from "@/components/bureau";
import GalleryClient from "./GalleryClient";
import { ScrollButtons } from "@/components/ScrollButtons";

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
