import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import GalleryClient from "./GalleryClient";

export default function GalleryPage() {
  return (
    <>
      <Mast active="Gallery" />
      <GalleryClient />
      <Subscriptions sectionNumber="04" />
      <Colophon />
    </>
  );
}
