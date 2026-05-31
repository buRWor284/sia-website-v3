import { redirect } from "next/navigation";

// Legacy URL — permanent redirect to /tools/collabiq
export default function CollabLinkBuildingRedirect() {
  redirect("/tools/collabiq");
}
