import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients · The Roster — Syed Irfan Ajmal",
  description:
    "Three-tier client roster: pre-agency profile engagements, featured case studies with headline results, and the full logo grid.",
  openGraph: {
    title: "Clients — Syed Irfan Ajmal",
    description: "Client roster and case studies from 15+ years of digital marketing work.",
  },
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
