import type { Metadata } from "next";
import Script from "next/script";
import { JournoCollabIQ } from "@/components/tools/JournoCollabIQ";
import { ToolHeader } from "@/components/bureau";

export const metadata: Metadata = {
  title: "JournoCollabIQ — Journalist Beat Matcher · SIA",
  description:
    "AI-powered journalist beat matching. Find the right reporters and outlets for your story, " +
    "score them by beat fit and recent coverage, generate tailored pitch angles, and export a targeting brief — in minutes.",
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
      <ToolHeader toolName="JournoCollabIQ — Journalist Beat Matcher" />
      <JournoCollabIQ toolHeaderHeight={TOOL_HEADER_H} />
      {/* No ToolFooter — WizardFooter already has the syedirfanajmal.com back link */}
    </>
  );
}
