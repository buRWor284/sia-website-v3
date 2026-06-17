import type { Metadata } from "next";

// Per-page metadata for the interactive checklist, overriding the shared
// /infographics layout so this route gets a unique title and description.
export const metadata: Metadata = {
  title: "The Journo Outreach Checklist · Interactive Field Guide",
  description:
    "An interactive, field-tested checklist to get your journalist pitches ready before you hit send, covering targeting, timing, personalization, and follow-up.",
  openGraph: {
    title: "The Journo Outreach Checklist",
    description:
      "An interactive, field-tested checklist to get your journalist pitches ready before you hit send.",
  },
  alternates: { canonical: "/infographics/journo-outreach-checklist" },
};

export default function JournoChecklistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
