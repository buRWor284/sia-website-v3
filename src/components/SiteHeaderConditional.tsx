"use client";

/**
 * SiteHeaderConditional — renders SiteHeader + CredibilityTicker only on
 * public site pages. Hidden on /emostool/* and /sign-in/* so the EMOS
 * platform has its own clean chrome.
 */

import { usePathname } from "next/navigation";
import { SiteHeader, CredibilityTicker } from "@/components/bureau";

const HIDDEN_PREFIXES = ["/emostool", "/sign-in", "/sign-up", "/clients/resourcex/cmo-pilot"];

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
