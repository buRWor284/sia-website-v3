import type { Metadata } from "next";
import { PtWorkspace } from "./PtWorkspace";

export const metadata: Metadata = {
  title: "Tools Ecosystem & Growth Strategy · Physicians Thrive",
  description: "Private client workspace — tools, strategy assets, and data advantage.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/pt" },
};

export default function PtPage() {
  return <PtWorkspace />;
}
