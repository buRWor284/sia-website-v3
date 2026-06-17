import type { Metadata } from "next";

// Open Graph title/description for /emos/apply. Kept in a metadata-only layout so
// the large page.tsx stays untouched. Overrides the section card from /emos.
export const metadata: Metadata = {
  openGraph: {
    title: "Apply for EMOS Cohort 1 · 5 Seats",
    description:
      "One short application, reviewed personally within 48 hours. If it's a fit, we'll send a link to talk through the details.",
  },
};

export default function EmosApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
