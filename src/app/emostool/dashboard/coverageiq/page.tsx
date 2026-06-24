import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPitches, getJournalists, getAlerts } from "@/app/emostool/actions/coverageiq";
import CoverageIQPlatform from "@/components/tools/CoverageIQPlatform";
import PipelineNav from "@/components/emostool/PipelineNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "CoverageIQ — EMOS Platform",
};

const ALLOWED_USER_ID = "user_3Eoj1EYMREQhylhnRWn2AbzcZHH";

export default async function CoverageIQPlatformPage({
  searchParams,
}: {
  searchParams: Promise<{ pitch?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (userId !== ALLOWED_USER_ID) redirect("/");

  const params = await searchParams;
  const prefillSubject = params.pitch ? decodeURIComponent(params.pitch) : undefined;

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
      />
      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "0 clamp(20px,4vw,56px)" }}>
        <PipelineNav current="coverage" />
      </div>
    </>
  );
}
