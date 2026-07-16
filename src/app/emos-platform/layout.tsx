import type { Metadata } from "next";
import { EmosUserButton } from "@/components/emos-platform/EmosUserButton";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "EMOS Platform",
    template: "%s \u2014 EMOS Platform",
  },
};

// Thin shell for ALL /emos-platform pages (public + gated). The subscription
// gate now lives in dashboard/layout.tsx, NOT here: putting it here made this
// layout wrap /subscribe and redirect a cancelled user /subscribe -> /subscribe
// forever (the 307 loop fixed 2026-07-16). Public pages (subscribe, signin,
// signup, signedout) must render without a subscription check.
export default function EmosPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <EmosUserButton />
    </>
  );
}
