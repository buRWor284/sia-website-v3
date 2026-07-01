"use client";

/**
 * SiteHeaderConditional — renders SiteHeader + CredibilityTicker only on
 * public site pages. Hidden on /emostool/*, /sign-in/*, and every page under
 * /clients/resourcex (private client workspace — has its own compact
 * masthead, doesn't need the main-site nav/personal branding).
 */

import { usePathname } from "next/navigation";
import { SiteHeader, CredibilityTicker } from "@/components/bureau";

const HIDDEN_PREFIXES = ["/emostool", "/sign-in", "/sign-up", "/clients/resourcex"];

export function SiteHeaderConditional() {
  const pathname = usePathname();
  const hide = HIDDEN_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (hide) return null;
  return (
    <>
      <SiteHeader />
      <CredibilityTicker />
    </>
  );
}
