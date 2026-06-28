"use client";

import { usePathname } from "next/navigation";

/**
 * CredibilityTicker — the publications / speaking / podcast strip.
 * Mounted in layout.tsx so it appears on every page, directly below SiteHeader.
 * Hidden on /emos routes (EMOS has its own visual language).
 */
export const CredibilityTicker = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/emos")) return null;
  if (pathname.startsWith("/tools/")) return null;

  return (
  <div className="sia-ticker" aria-label="Publications · Speaking · Podcast">
    {[0, 1].map((i) => (
      <span key={i} className="sia-ticker-track" aria-hidden={i > 0 ? true : undefined}>
        <span>BYLINES &amp; CITATIONS: FORBES · HBR · ENTREPRENEUR · SEMRUSH · WORLD BANK</span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span>GLOBAL CLIENTS · 4 CONTINENTS</span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span>$160K → $1.2M REVENUE · ORGANIC ONLY</span>
        <span className="sia-ticker__sep">&nbsp;////&nbsp;</span>
        <span className="sia-ticker__sep">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </span>
    ))}
  </div>
  );
};
