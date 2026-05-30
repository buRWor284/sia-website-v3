import { Colophon, Subscriptions } from "@/components/bureau";
import GalleryClient from "./GalleryClient";

export default function GalleryPage() {
  return (
    <>
      <GalleryClient />
      <Subscriptions sectionNumber="04" />
      <Colophon />
    </>
  );
}
