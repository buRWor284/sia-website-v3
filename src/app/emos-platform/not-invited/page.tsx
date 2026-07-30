import type { Metadata } from "next";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EMOS_ADMIN_EMAILS, getSubscriptionStatus } from "@/lib/emos-guard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "EMOS Platform",
};

/**
 * /emos-platform/not-invited — RETIRED as a destination 2026-07-26.
 *
 * This used to be where every signed-in user without emos_access landed, and it
 * showed "Access by invitation only" over a request-access form with no way to
 * buy anywhere on the page. That made it a dead end for exactly the people we
 * most want to convert: anyone with a Clerk account who is ready to pay.
 *
 * The route is kept, rather than deleted, for three reasons:
 *   - old invite-era emails and bookmarks still point here,
 *   - the landing page and /api/emos-access-request referenced it, and
 *   - middleware exempts this exact path, so keeping it costs nothing while
 *     deleting it would mean editing the exemption list, which has no admin
 *     bypass if it goes wrong (see the C3 note in middleware.ts).
 *
 * It is now a pure forwarder. Nothing renders. NotInvitedForm.tsx and
 * /api/emos-access-request are left in place, unlinked, in case a
 * request-access flow is ever wanted again.
 */
export default async function NotInvitedPage() {
  const { userId } = await auth();

  if (!userId) redirect("/emos-platform/subscribe");

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
    // Clerk API unreachable: fall through to the generic subscribe path.
  }

  // Redirects MUST stay OUTSIDE the try/catch above: Next's redirect() throws
  // a control-flow signal that a bare catch would otherwise swallow.

  // Already provisioned (e.g. the webhook granted access while they sat here).
  if (hasAccess) redirect("/emos-platform/dashboard");

  // Lapsed subscriber (cancelled / past-due) gets the "welcome back" framing;
  // admins bypass the lookup entirely.
  if (email && !EMOS_ADMIN_EMAILS.includes(email)) {
    let status = "none";
    try {
      status = await getSubscriptionStatus(email, userId); // D4: account first, payment email second
    } catch {
      status = "none";
    }
    if (status !== "active" && status !== "none") {
      redirect("/emos-platform/subscribe?returning=1");
    }
  }

  redirect("/emos-platform/subscribe");
}
