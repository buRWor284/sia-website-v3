import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients · The Roster",
  description:
    "Three-tier client roster: pre-agency profile engagements, featured case studies with headline results, and the full logo grid.",
  openGraph: {
    title: "Clients · The Roster",
    description: "Client roster and case studies from 15+ years of digital marketing work.",
  },
  alternates: { canonical: "/clients" },
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
