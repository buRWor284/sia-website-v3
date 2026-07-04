"use client";

// PartnerCollabIQ seeds its reducer/useState initializers from localStorage
// (saved form state, theme, subscriber flag), so any returning visitor's
// first client render differs from the server HTML → React hydration error
// #418. Render the tool client-only; the page's metadata, ToolHeader, and
// hidden <h1> remain server-rendered for SEO.
import dynamic from "next/dynamic";

const PartnerCollabIQClient = dynamic(
  () => import("./CollabIQ").then((m) => m.PartnerCollabIQ),
  { ssr: false },
);

export default PartnerCollabIQClient;
