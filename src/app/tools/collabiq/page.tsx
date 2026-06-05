import type { Metadata } from "next";
import Script from "next/script";
import { PartnerCollabIQ } from "@/components/tools/CollabIQ";
import { ToolHeader } from "@/components/bureau";

export const metadata: Metadata = {
  title: "Partner Collab IQ — Partnership Intelligence Tool · SIA",
  description:
    "AI-powered partnership intelligence. Discover non-obvious co-marketing partners, " +
    "score them, generate personalised outreach, and export a 90-day campaign brief — in minutes.",
};

// ToolHeader height: 28px logo + 13px top + 13px bottom padding = 54px
export const TOOL_HEADER_H = 54;

export default function CollabIQPage() {
  return (
    <>
      {/* jsPDF for client-side PDF export */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="lazyOnload"
      />
      {/* Sticky tool header — WizardProgress is offset by TOOL_HEADER_H so they stack */}
      <ToolHeader toolName="Partner Collab IQ — Partnership Intelligence" />
      <PartnerCollabIQ toolHeaderHeight={TOOL_HEADER_H} />
      {/* No ToolFooter — WizardFooter already has the syedirfanajmal.com back link */}
    </>
  );
}
