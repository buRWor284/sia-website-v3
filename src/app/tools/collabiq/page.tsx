import type { Metadata } from "next";
import Script from "next/script";
import { CollabIQ } from "@/components/tools/CollabIQ";

export const metadata: Metadata = {
  title: "CollabIQ — Partnership Intelligence Tool · SIA",
  description:
    "AI-powered partnership intelligence. Discover non-obvious collab link building partners, " +
    "score them, generate personalised outreach, and export a 90-day campaign brief — in minutes.",
};

export default function CollabIQPage() {
  return (
    <>
      {/* jsPDF for client-side PDF export */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="lazyOnload"
      />
      <CollabIQ />
    </>
  );
}
