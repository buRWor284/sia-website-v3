import type { Metadata } from "next";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EMOS_ADMIN_EMAILS, getSubscriptionStatus } from "@/lib/emos-guard";
import NotInvitedForm from "./NotInvitedForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Access Required: EMOS Platform",
};

export default async function NotInvitedPage() {
  const { userId } = await auth();

  if (userId) {
    let hasAccess = false;
    let email = "";
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      hasAccess = user.publicMetadata?.emos_access === true;
      email =
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses?.[0]?.emailAddress ??
        "";
    } catch {
      // Clerk API unreachable: fall through and show the form.
    }

    // Redirects MUST stay OUTSIDE the try/catch above: Next's redirect() throws
    // a control-flow signal that a bare catch would otherwise swallow.

    // Just-invited user whose webhook already granted access -> dashboard.
    if (hasAccess) {
      redirect("/emos-platform/dashboard");
    }

    // Lapsed subscriber (cancelled / past-due) -> re-subscribe path, NOT the
    // invite-era "not invited" page. Never-subscribed ("none") stays here; admins bypass.
    if (email && !EMOS_ADMIN_EMAILS.includes(email)) {
      let status = "none";
      try {
        status = await getSubscriptionStatus(email);
      } catch {
        status = "none";
      }
      if (status !== "active" && status !== "none") {
        redirect("/emos-platform/subscribe?returning=1");
      }
    }
  }

  return <NotInvitedForm />;
}
