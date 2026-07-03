import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { JournoCollabIQ } from "@/components/tools/JournoCollabIQ";
import { ToolHeader } from "@/components/bureau";

export const metadata: Metadata = {
  title: "JournoCollabIQ · Journalist Beat Matcher",
  description:
    "Find the right reporters for your story, score them by beat fit and recent coverage, generate pitch angles, and export a targeting brief. Free from the EMOS suite.",
  openGraph: {
    title: "JournoCollabIQ · Journalist Beat Matcher",
    description:
      "Find the right reporters for your story, score them by beat fit and recent coverage, and export a targeting brief in minutes. A free tool from the EMOS suite.",
  },
  alternates: { canonical: "/tools/journocollabiq" },
};

// ToolHeader height: 28px logo + 13px top + 13px bottom padding = 54px
export const TOOL_HEADER_H = 54;

export default function JournoCollabIQPage() {
  return (
    <>
      {/* jsPDF for client-side PDF export */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="lazyOnload"
      />
      {/* Sticky tool header — WizardProgress is offset by TOOL_HEADER_H so they stack */}
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        JournoCollabIQ - Journalist Beat Matcher
      </h1>
      <ToolHeader
        toolName="JournoCollabIQ: Journalist Beat Matcher"
        rightExtra={
          <Link
            href="/tools/journocollabiq/how-it-works"
            style={{ fontFamily: "var(--font-grot)", fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "#f5b81f", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            How it works →
          </Link>
        }
      />
      <JournoCollabIQ toolHeaderHeight={TOOL_HEADER_H} />
    </>
  );
}
