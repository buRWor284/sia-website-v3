import type { Metadata } from "next";
import CoverageIQ from "@/components/tools/CoverageIQ";

export const metadata: Metadata = {
  title: "CoverageIQ — Pitch Tracking CRM · EMOS Tool Suite · SIA",
  description:
    "Track your entire media pitch lifecycle — from drafted to amplified. " +
    "Manage journalist relationships, log placements, monitor follow-ups, and " +
    "visualise your PESO coverage mix. Part of the EMOS earned-media suite.",
};

export default function CoverageIQPage() {
  return <CoverageIQ />;
}
