// src/app/emos-platform/dashboard/factcheckiq/page.tsx
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FactcheckIQClient from "@/components/emos-platform/FactcheckIQClient";

export const metadata: Metadata = {
  title: "FactcheckIQ",
  description: "AI-assisted fact-checking for earned-media content. Review before publishing.",
  robots: { index: false, follow: false },
};

// Session guard only. The subscription gate lives in the shared
// dashboard/layout.tsx (mirrors every other EMOS dashboard tool).
export default async function FactcheckIQDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/emos-platform/signin");
  return <FactcheckIQClient />;
}
