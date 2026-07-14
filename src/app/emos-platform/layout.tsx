import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EmosUserButton } from "@/components/emostool/EmosUserButton";
import { EMOS_ADMIN_EMAILS, getSubscriptionStatus } from "@/lib/emos-guard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "EMOS Platform",
    template: "%s — EMOS Platform",
  },
};

export default async function EmostoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // H3 (2026-07-02 review): the subscription-status check used to exist only
  // on the dashboard page — cancelled subscribers could still open all five
  // tool pages directly. This shared layout enforces it platform-wide.
  // Policy: a stripe_subscriptions row that is NOT 'active' blocks; no row at
  // all (admin-invited beta user) is allowed; admin emails bypass.
  const { userId } = await auth();
  if (userId) {
    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      "";

    if (email && !EMOS_ADMIN_EMAILS.includes(email)) {
      const status = await getSubscriptionStatus(email);
      if (status !== "active" && status !== "none") {
        redirect("/emos-platform/subscribe");
      }
    }
  }

  return (
    <>
      {children}
      <EmosUserButton />
    </>
  );
}
