"use client";

/**
 * SiteHeaderConditional — renders SiteHeader + CredibilityTicker only on
 * public site pages. Hidden on /emostool/*, /sign-in/*, and every page under
 * /clients/resourcex (private client workspace — has its own compact
 * masthead, doesn't need the main-site nav/personal branding).
 *
 * Also hidden on /emos-academy/apply and /emos-academy/pay: each ships its own standalone
 * `emos-nav` ("EMOS · Back to overview"), so the global header would stack on
 * top of it. The main /emos-academy landing has NO nav of its own and DOES need the
 * global header, so it is intentionally not hidden here.
 */

import { usePathname } from "next/navigation";
import { SiteHeader, CredibilityTicker } from "@/components/bureau";

const HIDDEN_PREFIXES = ["/emostool", "/sign-in", "/sign-up", "/clients/resourcex", "/emos-academy/apply", "/emos-academy/pay"];

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
