import type { Metadata } from "next";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NotInvitedForm from "./NotInvitedForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Access Required — EMOS Platform",
};

export default async function NotInvitedPage() {
  // If the user is signed in, do a fresh Clerk API check.
  // By the time they land here, the webhook has likely already fired
  // and set emos_access: true — so redirect them straight to the dashboard.
  const { userId } = await auth();
  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      if (user.publicMetadata?.emos_access) {
        redirect("/emos-platform/dashboard");
      }
    } catch {
      // If Clerk API fails, fall through to show the form
    }
  }

  return <NotInvitedForm />;
}
