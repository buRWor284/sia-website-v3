import type { Metadata } from "next";
import { EmosDeck } from "./EmosDeck";

export const metadata: Metadata = {
  title: "EMOS Private Founder's Intensive · Resourcex × Sajid Shah",
  description:
    "Interactive slide deck: The Private Founder's Intensive — an 8-week done-with-you earned media program prepared for Sajid Shah / ResourceX.io.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/resourcex/emos-deck" },
};

export default function Page() {
  return <EmosDeck />;
}
