import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isEmosAdminEmail } from "@/lib/emos-admins";
import InviteForm from "./InviteForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Invite (admin)",
};

/**
 * /emos-platform/invite — admin only.
 *
 * Until 2026-09-10 this was a bare client page: any signed-in EMOS user could
 * open it and see the form. The send button never worked for them (the API
 * refuses non-admins), but the page advertised an admin surface. Now a
 * non-admin gets a 404, the same way /emos-platform/admin/costs does, so the
 * page's existence is not advertised. Middleware has already required a
 * signed-in account with emos_access before this runs.
 *
 * Admin = the VERIFIED primary email is on EMOS_ADMIN_EMAILS. No fallback to
 * other addresses on the account: an unverified one proves nothing.
 */
export default async function InvitePage() {
  const user = await currentUser();
  const primary = user?.primaryEmailAddress;
  const email = primary?.verification?.status === "verified" ? primary.emailAddress : "";
  if (!isEmosAdminEmail(email)) notFound();

  return <InviteForm />;
}
