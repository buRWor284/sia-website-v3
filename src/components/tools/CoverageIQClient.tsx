"use client";

// CoverageIQ renders clock-relative text ("3 days ago", overdue/follow-up
// counts vs "today") and loads pitches from localStorage at module scope.
// Server HTML is baked at build time, so the client's first render can never
// match it → React hydration error #418. Render the tool client-only; the
// page's metadata and hidden <h1> remain server-rendered for SEO.
import dynamic from "next/dynamic";

const CoverageIQ = dynamic(() => import("./CoverageIQ"), { ssr: false });

export default CoverageIQ;
