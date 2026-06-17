import type { Metadata } from "next";
import CoverageIQ from "@/components/tools/CoverageIQ";

export const metadata: Metadata = {
  title: "CoverageIQ · Pitch Tracking CRM · EMOS Tool Suite",
  description:
    "Track your entire media pitch lifecycle — from drafted to amplified. " +
    "Manage journalist relationships, log placements, monitor follow-ups, and " +
    "visualise your PESO coverage mix. Part of the EMOS earned-media suite.",
  openGraph: {
    title: "CoverageIQ · Pitch Tracking CRM",
    description:
      "Track your media pitch lifecycle from drafted to amplified, log placements, and visualise your PESO mix. A free tool from the EMOS suite.",
  },
  alternates: { canonical: "/tools/coverageiq" },
};

export default function CoverageIQPage() {
  return <CoverageIQ />;
}
