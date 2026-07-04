import type { Metadata } from "next";
import CoverageIQ from "@/components/tools/CoverageIQClient";

export const metadata: Metadata = {
  title: "CoverageIQ · Pitch Tracking CRM",
  description:
    "Track every pitch from drafted to placed. Log journalist relationships, monitor follow-ups, and see your PESO coverage mix. Free tool from the EMOS suite.",
  openGraph: {
    title: "CoverageIQ · Pitch Tracking CRM",
    description:
      "Track every pitch from drafted to placed. Log placements and see your PESO mix. Free from the EMOS suite.",
  },
  alternates: { canonical: "/tools/coverageiq" },
};

export default function CoverageIQPage() {
  return (
    <>
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        CoverageIQ - Pitch Tracking CRM
      </h1>
      <CoverageIQ />
    </>
  );
}
