import { Metadata } from "next";
import { Colophon, Mast, Subscriptions } from "@/components/bureau";
import CollabLinkBuildingTool from "@/components/tools/CollabLinkBuildingTool";

export const metadata: Metadata = {
  title: "Collab Link Building Partner Finder · SIA Wire S02E06",
  description:
    "Three proven collab link building strategies — Discount Partnership, Institution Rebate, Expert Roundup + Badge. Find your shoulder-niche partners, score them, and generate your outreach campaign brief.",
};

export default function CollabLinkBuildingPage() {
  return (
    <>
      <Mast active="Resources" />
      <CollabLinkBuildingTool />
      <Subscriptions sectionNumber="05" />
      <Colophon />
    </>
  );
}
