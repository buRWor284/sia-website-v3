import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { RadarCallout } from "@/components/bureau/RadarCallout";

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
 */

export const metadata: Metadata = {
  title: "EMOS Platform — the earned-media operating system",
  description:
    "EMOS connects the SIA earned-media tools into one workflow: detect the story, build the asset, find the journalist, score the pitch, track the coverage.",
};

// ── design tokens (match the dashboard / bureau system) ──────────────────────
const PAPER  = "#f1ebde";
const PAPER2 = "#e8e0cc";
const INK    = "#1a1410";
const INK70  = "rgba(26,20,16,.70)";
const INK55  = "rgba(26,20,16,.55)";
const INK15  = "rgba(26,20,16,.15)";
const CREAM  = "#fafafa";
const CREAM70 = "rgba(250,250,250,.70)";
const YEL    = "#f5b81f";
const GROT   = "var(--font-grot)";
const SERIF  = "var(--font-serif)";
const MONO   = "var(--font-mono)";

// The connected pipeline (order + copy mirror lib/emos-stage-config STAGE_META).
const PIPELINE: Array<{ n: string; label: string; tool: string; desc: string }> = [
  { n: "01", label: "SignalIQ",       tool: "Story Detection",       desc: "Scan open data for newsworthy signals and save the strongest opportunities." },
  { n: "02", label: "AssetIQ",        tool: "Linkable Asset Builder", desc: "Turn a signal into a linkable asset — a report, calculator, or quiz worth citing." },
  { n: "03", label: "JournoCollabIQ", tool: "Journalist CRM",        desc: "Build and manage journalist relationships and track every touchpoint." },
  { n: "04", label: "PressIQ",        tool: "Pitch Scoring",         desc: "Score and sharpen each pitch against a 32-point journalist rubric before you send." },
  { n: "05", label: "CoverageIQ",     tool: "Pitch Tracking",        desc: "Track the full pipeline from drafted to published to amplified." },
];

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
    <div style={{ background: PAPER, color: INK, fontFamily: SERIF, minHeight: "100vh" }}>

      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <header style={{ background: INK, color: CREAM, padding: "0 clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1120, marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 13, letterSpacing: ".22em", textTransform: "uppercase" }}>
              EMOS
            </span>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: CREAM70 }}>
              Earned Media Operating System
            </span>
          </div>
          <Link href="/emos-platform/signin" style={{ fontFamily: GROT, fontWeight: 800, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, textDecoration: "none" }}>
            Sign in →
          </Link>
        </div>
      </header>

      {/* ── Signed in, no subscription yet ───────────────────────────────── */}
      {userId && (
        <div style={{ background: PAPER2, borderBottom: `1px solid ${INK15}` }}>
          <div style={{ maxWidth: 1120, marginInline: "auto", padding: "14px clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14, color: INK70, lineHeight: 1.5 }}>
              You&apos;re signed in{signedInEmail ? ` as ${signedInEmail}` : ""}. Your account doesn&apos;t have an active
              EMOS subscription yet.
            </p>
            <Link href="/emos-platform/subscribe" style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: INK, textDecoration: "underline", textDecorationColor: INK15 }}>
              Activate for $50/month →
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1120, marginInline: "auto", padding: "clamp(40px,7vw,88px) clamp(20px,4vw,56px) clamp(28px,4vw,44px)" }}>
        <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: INK55 }}>
          The platform
        </span>
        <h1 style={{ margin: "16px 0 0", fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(30px,5.5vw,58px)", lineHeight: 1.02, letterSpacing: "-0.02em", maxWidth: 900 }}>
          Your whole earned-media engine,{" "}
          <span style={{ fontStyle: "italic", fontWeight: 600, background: YEL, color: INK, padding: "0 .12em", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
            in one system.
          </span>
        </h1>
        <p style={{ margin: "22px 0 0", maxWidth: 660, fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(16px,1.9vw,21px)", color: INK70, lineHeight: 1.5 }}>
          The free SIA tools each do one job. EMOS connects them into a single workflow — detect the
          story, build the asset, find the journalist, score the pitch, track the coverage — under one
          login, with your pipeline saved as you go.
        </p>
        <div style={{ marginTop: "clamp(24px,3vw,34px)", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
          {/* P4: the purchase path. Checkout is the primary CTA — sign-up is
              Restricted in Clerk (verified 2026-07-26), so paying first and then
              accepting the emailed invitation is the only way in for a new
              customer. The old "Request access →" link beside these pointed at
              /not-invited and was removed with that page: on a page that sells a
              $50/month product, inviting people to apply instead of buy was the
              clearest expression of the invite-only/self-serve split. */}
          <Link href="/emos-platform/subscribe" style={{ padding: "14px 34px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 900, fontSize: 13, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none" }}>
            Get EMOS · $50/month
          </Link>
          <Link href="/emos-platform/signin" style={{ padding: "14px 30px", background: "transparent", color: INK, border: `1px solid ${INK}`, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
        <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: INK55 }}>
          $50/month · cancel any time · secure payment via Stripe
        </p>
      </section>

      <RadarCallout />

      {/* ── The connected pipeline ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1120, marginInline: "auto", padding: "clamp(20px,3vw,32px) clamp(20px,4vw,56px) clamp(48px,7vw,88px)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: ".20em", textTransform: "uppercase", color: INK }}>
            One pipeline, five stages
          </span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: INK55 }}>
            each tool hands off to the next
          </span>
        </div>
        <div style={{ border: `1px solid ${INK}` }}>
          {PIPELINE.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                gap: "clamp(14px,3vw,32px)",
                alignItems: "baseline",
                padding: "clamp(16px,2.4vw,22px) clamp(16px,3vw,28px)",
                borderBottom: i < PIPELINE.length - 1 ? `1px solid ${INK15}` : "none",
                background: i % 2 === 1 ? PAPER2 : "transparent",
              }}
            >
              <span style={{ flexShrink: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(20px,2.6vw,28px)", lineHeight: 1, color: INK15, letterSpacing: "-0.02em", width: 44 }}>
                {s.n}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: "clamp(15px,1.8vw,19px)", letterSpacing: ".01em", color: INK }}>
                    {s.label}
                  </span>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: INK55 }}>
                    {s.tool}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: "clamp(13.5px,1.5vw,15.5px)", color: INK70, lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────────── */}
      <section style={{ background: INK, color: CREAM }}>
        <div style={{ maxWidth: 1120, marginInline: "auto", padding: "clamp(40px,6vw,72px) clamp(20px,4vw,56px)", display: "flex", flexWrap: "wrap", gap: "clamp(20px,4vw,48px)", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(24px,3.4vw,38px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
              Run the whole play in-house.
            </h2>
            <p style={{ margin: "14px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(14px,1.7vw,18px)", color: CREAM70, lineHeight: 1.5 }}>
              The public tools are the shop window. EMOS is the system behind it — the playbooks,
              the journalist workflow, and every stage of the pipeline in one place.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 220 }}>
            <Link href="/emos-platform/subscribe" style={{ textAlign: "center", padding: "15px 30px", background: YEL, color: INK, fontFamily: GROT, fontWeight: 900, fontSize: 13, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none" }}>
              Get EMOS · $50/month
            </Link>
            <Link href="/emos-platform/signin" style={{ textAlign: "center", padding: "14px 30px", background: "transparent", color: CREAM, border: `1px solid ${CREAM70}`, fontFamily: GROT, fontWeight: 800, fontSize: 12, letterSpacing: ".10em", textTransform: "uppercase", textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="/tools" style={{ textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: CREAM70, textDecoration: "underline", textDecorationColor: "rgba(250,250,250,.25)", marginTop: 2 }}>
              Try the free tools first
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
