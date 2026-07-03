import type { Metadata } from "next";
import Script from "next/script";
import { PartnerCollabIQ } from "@/components/tools/CollabIQ";
import Link from "next/link";
import { ToolHeader } from "@/components/tools/ToolHeader";

export const metadata: Metadata = {
  title: "PartnerCollabIQ · Partnership Intelligence Tool",
  description:
    "AI-powered partnership intelligence. Discover non-obvious co-marketing partners, " +
    "score them, generate personalised outreach, and export a 90-day campaign brief in minutes.",
  openGraph: {
    title: "PartnerCollabIQ · Partnership Intelligence",
    description:
      "Discover non-obvious co-marketing partners, score them, and export a 90-day campaign brief in minutes.",
  },
  alternates: { canonical: "/tools/partnercollabiq" },
};

// Shared tools/ToolHeader is a fixed 52px bar
export const TOOL_HEADER_H = 52;

export default function PartnerCollabIQPage() {
  return (
    <>
      {/* jsPDF for client-side PDF export */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="lazyOnload"
      />
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        PartnerCollabIQ - Partnership Intelligence Tool
      </h1>
      <ToolHeader
        toolPrefix="PartnerCollab"
        subtitle="Partnership Intelligence"
        rightContent={
          <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(241,235,222,.55)", textDecoration: "none" }}>
            ← syedirfanajmal.com
          </Link>
        }
      />
      <PartnerCollabIQ toolHeaderHeight={TOOL_HEADER_H} />
    </>
  );
}
