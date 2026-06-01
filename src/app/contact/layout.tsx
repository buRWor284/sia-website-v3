import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact · Get in Touch — Syed Irfan Ajmal",
  description:
    "Reach out for fractional CMO engagements, speaking invitations, EMOS enquiries, or press. Two business days to a reply.",
  openGraph: {
    title: "Contact — Syed Irfan Ajmal",
    description: "Get in touch for fractional CMO, speaking, EMOS, or press enquiries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
