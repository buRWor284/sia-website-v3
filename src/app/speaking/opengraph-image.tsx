import { ogPhotoCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Speaking · Syed Irfan Ajmal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The photograph is cropped ABOVE the photographer's watermark band rather than
// having it painted out. Cropping is fair; erasing someone's credit to reuse
// their picture is not. He is credited by name in the card itself, the same way
// the MPS strip on the page credits hafeezsaeed.com.
export default async function Image() {
  return ogPhotoCard({
    eyebrow: "SPEAKING · SYEDIRFANAJMAL.COM",
    title: "International\nkeynotes & workshops",
    credit: "University of Peshawar · Photo by Tanzeel Baig",
    photo: "speaking-keynote.jpg",
  });
}
