import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PlatformLanding } from "@/components/emos-platform/landing/PlatformLanding";
import { FAQ } from "@/components/emos-platform/landing/content";

/**
 * /emos-platform — EMOS PLATFORM landing (public).
 *
 * Doubles as the sign-out destination for the dashboard (see
 * app/emos-platform/dashboard/page.tsx SignOutButton). Behaviour:
 *   - signed OUT              → this marketing landing for the paid EMOS platform
 *   - signed IN, has access   → forwarded to the dashboard (this is the app root)
 *   - signed IN, NO access    → this landing, with a banner pointing at checkout
 * The emostool layout only enforces the subscription gate when a user is
 * present, so a logged-out visitor renders straight through to here.
 *
 * 2026-07-26: that third case used to be a bug. The redirect was unconditional,
 * so ANY signed-in user without emos_access was forwarded to the dashboard,
 * bounced by middleware, and landed on "Access by invitation only" — a page with
 * no way to buy on it. A person holding out a credit card could not reach the
 * checkout from the platform's own front door. Gate the redirect on access.
 *
 * Distinct from /emos, which markets the EMOS Academy. This page is the paid
 * *platform* (the connected tool suite). Copy is a concise first pass — refine
 * as the platform's naming/pricing settles.
 * 2026-09-10: quick-fix pass (indexing, stale copy, radar moved below the
 * pipeline). A full rebuild is specced separately; see WORKLOG.
 * 2026-09-11: FULL REBUILD from the Claude Design handoff (FINAL) and the locked
 * copy deck in EMOS-Platform-Page-Rebuild-Brief-2026-09-10.md. The page body now
 * lives in components/emos-platform/landing/ (PlatformLanding + content.ts);
 * this file keeps the metadata, the auth branching and the FAQPage JSON-LD.
 * Metadata, canonical and the sitemap entry are deliberately unchanged. The
 * OG/Twitter card is the static opengraph-image.png / twitter-image.png beside
 * this file (rendered from the "EMOS OG Card" artboard).
 */

const META_TITLE = "EMOS Platform: the earned media operating system";
const META_DESC =
  "Five connected earned media tools for founders: find the story, plan the asset, pick the journalists, score the pitch, log the coverage. Everything saved under one login. $149/month, cancel any time.";

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  // The /emos-platform layout sets noindex for the whole prefix, which is right
  // for the dashboard and auth pages but was wrongly swept onto this public
  // sales page too (found 2026-09-10). Page-level robots replaces the layout's.
  robots: { index: true, follow: true },
  // Without this the root layout's canonical ("/") applied, pointing the page
  // at the homepage.
  alternates: { canonical: "/emos-platform" },
  openGraph: {
    type: "website",
    siteName: "Syed Irfan Ajmal",
    url: "https://www.syedirfanajmal.com/emos-platform",
    title: META_TITLE,
    description: META_DESC,
  },
  twitter: {
    card: "summary_large_image",
    site: "@syedirfanajmal",
    creator: "@syedirfanajmal",
    title: META_TITLE,
    description: META_DESC,
  },
};

// FAQPage structured data, built from the same array the accordion renders, so
// the two can never disagree (pattern: emos-academy/layout.tsx). Lives on the
// page, not the /emos-platform layout, which also wraps the dashboard.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default async function EmostoolLandingPage() {
  // Members skip the pitch — send them straight to the product. Everyone else,
  // signed in or not, sees the pitch and can reach checkout from here.
  const { userId } = await auth();
  let signedInEmail = "";
  if (userId) {
    const user = await currentUser();
    if (user?.publicMetadata?.emos_access === true) {
      redirect("/emos-platform/dashboard");
    }
    signedInEmail =
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress ??
      "";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PlatformLanding signedIn={Boolean(userId)} signedInEmail={signedInEmail} />
    </>
  );
}
