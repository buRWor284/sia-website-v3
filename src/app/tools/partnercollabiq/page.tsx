import type { Metadata } from "next";
import Script from "next/script";
import { PartnerCollabIQ } from "@/components/tools/CollabIQ";
import { ToolHeader } from "@/components/bureau";

export const metadata: Metadata = {
  title: "PartnerCollabIQ · Partnership Intelligence Tool",
  description:
    "AI-powered partnership intelligence. Discover non-obvious co-marketing partners, " +
    "score them, generate personalised outreach, and export a 90-day campaign brief — in minutes.",
  openGraph: {
    title: "PartnerCollabIQ · Partnership Intelligence",
    description:
      "Discover non-obvious co-marketing partners, score them, and export a 90-day campaign brief in minutes. A free tool from the EMOS suite.",
  },
  alternates: { canonical: "/tools/partnercollabiq" },
};

// ToolHeader height: 28px logo + 13px top + 13px bottom padding = 54px
export const TOOL_HEADER_H = 54;

export default function PartnerCollabIQPage() {
  return (
    <>
      {/* jsPDF for client-side PDF export */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="lazyOnload"
      />
      <ToolHeader toolName="PartnerCollabIQ — Partnership Intelligence" />
      <PartnerCollabIQ toolHeaderHeight={TOOL_HEADER_H} />
    </>
  );
}
