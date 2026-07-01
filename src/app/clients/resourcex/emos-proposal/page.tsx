import type { Metadata } from "next";
import { EmosProposal } from "./EmosProposal";

export const metadata: Metadata = {
  title: "EMOS Private Founder's Intensive · Revised · Prepared for Sajid · SIA Enterprises",
  description: "Your 8-week earned-media program: press kit, authority content, and acquisition announcement strategy.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/resourcex/emos-proposal" },
};

export default function EmosProposalPage() {
  return <EmosProposal />;
}
