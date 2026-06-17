import type { Metadata } from "next";

// Open Graph title/description for /strategy-call. Kept in a metadata-only layout
// so the large page.tsx stays untouched.
export const metadata: Metadata = {
  openGraph: {
    title: "Book a Free 30-Minute Strategy Call",
    description:
      "A free 30-minute call with Syed Irfan Ajmal, fractional CMO and founder of DMR.agency, to pressure-test your earned-media plan.",
  },
};

export default function StrategyCallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
