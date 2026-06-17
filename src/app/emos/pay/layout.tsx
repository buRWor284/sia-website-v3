import type { Metadata } from "next";

// Open Graph title/description for /emos/pay. Kept in a metadata-only layout so
// the large page.tsx stays untouched. The page itself stays noindex.
export const metadata: Metadata = {
  openGraph: {
    title: "Complete Your EMOS Payment",
    description:
      "Secure your seat in EMOS Cohort 1: Foundation or Accelerate. One-time investment, capability you keep forever.",
  },
};

export default function EmosPayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
