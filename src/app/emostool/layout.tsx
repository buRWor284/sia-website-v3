import type { Metadata } from "next";
import { EmosUserButton } from "@/components/emostool/EmosUserButton";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "EMOS Platform",
    template: "%s — EMOS Platform",
  },
};

export default function EmostoolLayout({
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
