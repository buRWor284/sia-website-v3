import { redirect } from "next/navigation";

// Legacy redirect — canonical URL is now /tools/collabiq
export default function CollabIQResourcesRedirect() {
  redirect("/tools/collabiq");
}
