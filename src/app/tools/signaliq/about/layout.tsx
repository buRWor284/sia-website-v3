import type { Metadata } from "next";

// Metadata-only wrapper for the SignalIQ methodology page (client component).
export const metadata: Metadata = {
  title: "SignalIQ · Methodology & Data Sources",
  description:
    "How SignalIQ scores media coverage gaps: what the lead/whitespace score measures, the data sources behind it, and what it deliberately does not measure.",
  openGraph: {
    title: "SignalIQ · Methodology & Data Sources",
    description:
      "What the SignalIQ score measures, the data sources behind it, and its limits.",
  },
  alternates: { canonical: "/tools/signaliq/about" },
};

export default function SignalIQAboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
