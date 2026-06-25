import type { Metadata } from "next";
import NotInvitedForm from "./NotInvitedForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Access Required — EMOS Platform",
};

export default function NotInvitedPage() {
  return <NotInvitedForm />;
}
