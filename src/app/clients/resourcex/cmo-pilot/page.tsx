import type { Metadata } from "next";
import { CmoPilotProposal } from "./CmoPilotProposal";

export const metadata: Metadata = {
  title: "Fractional CMO Pilot Offer · Resourcex × happy.co",
  description:
    "One-page engagement outline for the Resourcex × happy.co Fractional CMO Pilot: scope, rate, success-fee structure, and pilot terms.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/clients/resourcex/cmo-pilot" },
};

export default function Page() {
  return <CmoPilotProposal />;
}
