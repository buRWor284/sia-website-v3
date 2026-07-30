import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EMOS_ADMIN_EMAILS, getSubscriptionStatus } from "@/lib/emos-guard";

/**
 * Subscription gate for the PAID area only (dashboard + all tool pages + settings).
 *
 * Relocated here from the shared /emos-platform layout (2026-07-16). It used to
 * live on the shared layout (H3, 2026-07-02) to cover all five tool pages, but
 * that layout also wrapped /emos-platform/subscribe, so a signed-in cancelled
 * user was redirected /subscribe -> /subscribe forever (307 loop). Keeping the
 * gate here preserves platform-wide coverage while leaving the public
 * subscribe/auth pages ungated. Policy unchanged: status not "active" AND not
 * "none" blocks; "none" (admin-invited beta, no Stripe row) allowed; admins bypass.
 */
export default async function EmosDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) {
    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      "";

    if (email && !EMOS_ADMIN_EMAILS.includes(email)) {
      // D4: pass the Clerk user id so a subscription bought under a different
      // payment address still resolves to this account.
      const status = await getSubscriptionStatus(email, userId);
      if (status !== "active" && status !== "none") {
        redirect("/emos-platform/subscribe");
      }
    }
  }

  return <>{children}</>;
}
