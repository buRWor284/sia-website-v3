import { auth, currentUser } from "@clerk/nextjs/server";
import { isEmosAdminEmail } from "@/lib/emos-admins";
import { redirect } from "next/navigation";
import { getPitches, getJournalists, getAlerts } from "@/app/emos-platform/actions/coverageiq";
import CoverageIQPlatform from "@/components/tools/CoverageIQPlatform";
import PipelineNav from "@/components/emos-platform/PipelineNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "CoverageIQ | EMOS Platform",
};

export default async function CoverageIQPlatformPage({
  searchParams,
}: {
  searchParams: Promise<{ pitch?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/emos-platform/signin");

  const params = await searchParams;
  const prefillSubject = params.pitch ? params.pitch : undefined;

  // 2026-09-25 (Points P3): the internal Placement value is admin-only. Same
  // check as /emos-platform/admin/costs; a customer account gets isAdmin=false
  // and the column, tile and legend entry never render.
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  const isAdmin = isEmosAdminEmail(email);

  // Parallel data fetch — all three queries run simultaneously
  const [pitches, journalists, alerts] = await Promise.all([
    getPitches(),
    getJournalists(),
    getAlerts(),
  ]);

  return (
    <>
      <CoverageIQPlatform
        initialPitches={pitches}
        initialJournalists={journalists}
        initialAlerts={alerts}
        prefillSubject={prefillSubject}
        isAdmin={isAdmin}
      />
      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "0 clamp(20px,4vw,56px)" }}>
        <PipelineNav current="coverage" />
      </div>
    </>
  );
}
