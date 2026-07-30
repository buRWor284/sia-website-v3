/**
 * /emos-platform/subscribe/success
 *
 * Shown after a successful Stripe checkout. Stripe redirects here with
 * ?session_id=...
 *
 * Public route — no Clerk auth (the buyer usually has no account yet).
 *
 * 2026-07-26: this page used to be static copy that said "check your inbox" and
 * threw the session_id away. The invite it referred to was sent by the Stripe
 * webhook alone, so whenever the webhook failed — Clerk lookup error, an already
 * pending invitation, a webhook that never arrived — the customer had paid and
 * there was no email, no account, and no way to recover without emailing Irfan.
 * Under Clerk's restricted sign-up mode that is a total lockout.
 *
 * Now the page verifies the session with Stripe itself and runs the SAME
 * reconciliation the webhook runs (see src/lib/emos-billing.ts). It is the
 * fallback that makes the money path self-healing: whichever of the two gets
 * there first wins, and both are idempotent. Reloading the page is a safe retry.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { reconcileCheckoutSession, type GrantOutcome } from "@/lib/emos-billing";
import { rateLimitDb } from "@/lib/rate-limit-db";

// 2026-07-26 follow-up to the self-serve change: ?resend=1 makes this GET send
// an email, which needs two guards the first version did not have.
//   1. prefetch={false} on the resend links below. Next prefetches <Link>s in
//      production, and prefetching an RSC route RUNS the server component — so
//      a hover over "Send it again" would fire the invite with no click at all.
//   2. this limiter. A checkout session_id is not a secret (it sits in the URL,
//      in browser history, in any shared screenshot); with no cap, anyone
//      holding one could loop the link and mail-bomb that buyer.
const RESEND_LIMIT     = 3;
const RESEND_WINDOW_MS = 60 * 60_000; // 3 resends per hour per checkout session

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Payment confirmed",
};

// Never prerender: this page performs a live Stripe lookup and a grant.
export const dynamic = "force-dynamic";

const INK   = "#1a1410";
const PAPER = "#f1ebde";
const YEL   = "#f5b81f";
const GREEN = "#5c9166";
const GROT  = "Arial, 'Helvetica Neue', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  fontFamily: GROT,
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "rgba(241,235,222,.85)",
  textDecoration: "none",
  border: "1px solid rgba(241,235,222,.42)",
  padding: "11px 24px",
};

const primaryLinkStyle: React.CSSProperties = {
  ...linkStyle,
  background: YEL,
  color: INK,
  border: "none",
  fontWeight: 900,
  padding: "13px 28px",
};

/**
 * D4: the escape hatch for a buyer who ALREADY has an EMOS account but paid
 * while signed out, with an address that account does not carry (Link, Google
 * Pay, a work card). Nothing in the payment tells us who they are, so the
 * invite goes to the payment address and the account they actually use stays
 * locked out — the original D4 lockout, and the one case the checkout-metadata
 * stamp cannot reach because there was no session to stamp.
 *
 * Signing in from here and coming straight back lets reconcileCheckoutSession
 * see a live session and claim the subscription for that account.
 *
 * Three things stop that being a way in for anyone else: the claim only ever
 * fills a NULL, so it cannot move a subscription that already has an owner; it
 * EXPIRES an hour after checkout, so a session id resurfacing from history or a
 * screenshot is worthless; and owner/admin accounts are refused outright.
 */
function linkExistingAccountHref(sessionId: string) {
  const back = `/emos-platform/subscribe/success?session_id=${encodeURIComponent(sessionId)}`;
  return `/emos-platform/signin?redirect_url=${encodeURIComponent(back)}`;
}

/** Copy for each reconciliation outcome. */
function nextStep(outcome: GrantOutcome | "unknown", sessionId: string) {
  switch (outcome) {
    case "granted":
      return {
        label: "You're in",
        body: "Your account already exists and full access is switched on. Sign in and your dashboard is waiting.",
        cta: <Link href="/emos-platform/signin" style={primaryLinkStyle}>Sign in to EMOS &rarr;</Link>,
      };
    case "invited":
    case "invite_resent":
      return {
        label: "Next step",
        body: "Check your inbox and click the link to set your password.",
        cta: null,
      };
    case "invite_pending":
      return {
        label: "Next step",
        body: "Your invite is already on its way. Check your inbox, and your spam folder, for the link to set your password.",
        cta: sessionId ? (
          <Link
            href={`/emos-platform/subscribe/success?session_id=${encodeURIComponent(sessionId)}&resend=1`}
            prefetch={false}
            style={linkStyle}
          >
            Send it again &rarr;
          </Link>
        ) : null,
      };
    default:
      return {
        label: "Next step",
        body: "Check your inbox for the link to set your password. If nothing arrives in a few minutes, reload this page and we'll send it again.",
        cta: sessionId ? (
          <Link
            href={`/emos-platform/subscribe/success?session_id=${encodeURIComponent(sessionId)}&resend=1`}
            prefetch={false}
            style={linkStyle}
          >
            Resend my invite &rarr;
          </Link>
        ) : null,
      };
  }
}

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; resend?: string }>;
}) {
  const params    = await searchParams;
  const sessionId = params.session_id ?? "";
  const requestedResend = params.resend === "1";

  // Over the cap we still reconcile (the grant is idempotent and costs nothing)
  // but drop the resend flag, so the page keeps working and only the mail stops.
  const resend =
    requestedResend && sessionId
      ? (
          await rateLimitDb(`emos-invite-resend:${sessionId}`, {
            limit: RESEND_LIMIT,
            windowMs: RESEND_WINDOW_MS,
          })
        ).ok
      : false;

  // D4 (2026-07-30): who is standing here matters as much as what they paid.
  // This route is middleware-exempt, so auth() simply returns null for the
  // usual signed-out buyer — but when a session IS present it is the best
  // evidence we will ever get about which account the access belongs on,
  // better than the payment email that Link / Google Pay / a work card
  // reports. reconcileCheckoutSession only lets it claim an UNCLAIMED
  // subscription, so a session id recovered later from history or a shared
  // screenshot cannot move access to somebody else's account.
  let sessionClerkUserId: string | null = null;
  try {
    sessionClerkUserId = (await auth()).userId;
  } catch (e) {
    // Never let an auth hiccup break the post-payment page.
    console.warn("[subscribe/success] Clerk session lookup failed:", e);
  }

  // Idempotent: records the subscription and grants access or (re)sends the
  // invitation. Safe on every load; the email only goes out again on ?resend=1.
  const result = sessionId
    ? await reconcileCheckoutSession(sessionId, { resend, sessionClerkUserId })
    : null;

  const outcome: GrantOutcome | "unknown" =
    result?.verified ? result.outcome : "unknown";
  const step = nextStep(outcome, sessionId);

  // Offer the "attach to my existing account" path to every signed-out buyer,
  // including on a "granted" outcome. Granted only means SOME account matched
  // the payment email — with a work card or a shared address that can be a
  // colleague's account rather than theirs, and the webhook usually resolves it
  // before this page ever loads. A signed-in visitor is excluded because their
  // session was already considered above.
  //
  // Past the claim window the link would send them through sign-in and back to
  // a page that silently does nothing, so it is replaced with a way to reach a
  // human. `claimExpired` only ever comes back true for a signed-IN visitor, so
  // this state is reached on the return leg, after they have signed in.
  const claimExpired = result?.claimExpired === true;
  const showLinkExisting = Boolean(sessionId) && !sessionClerkUserId && !claimExpired;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAPER,
        fontFamily: SERIF,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 500 }}>

        {/* Wordmark: amber square + ink text (accessible on paper) */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ display: "inline-block", background: YEL, color: INK, fontFamily: SERIF, fontWeight: 700, fontSize: 14, width: 28, height: 28, lineHeight: "28px", textAlign: "center", verticalAlign: "middle" }}>
            E
          </span>
          <span style={{ fontFamily: GROT, fontWeight: 900, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: INK, verticalAlign: "middle", marginLeft: 9 }}>
            EMOS Platform
          </span>
        </div>

        {/* Card */}
        <div style={{ background: INK, color: PAPER, textAlign: "center", padding: "52px 44px 46px" }}>
          <div style={{ fontFamily: GROT, fontWeight: 900, fontSize: 30, color: GREEN, marginBottom: 22, lineHeight: 1 }}>
            ✓
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.15, letterSpacing: "-.02em", margin: "0 0 16px" }}>
            Payment confirmed.
          </h1>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "rgba(241,235,222,.88)", margin: "0 0 28px" }}>
            {outcome === "granted"
              ? "Your EMOS subscription is active and your account is ready."
              : "Your EMOS subscription is active. We’ve just emailed your invite to create your account."}
          </p>

          {/* Prominent next step */}
          <div style={{ background: "rgba(245,184,31,.12)", border: "1px solid rgba(245,184,31,.5)", padding: "16px 20px", margin: "0 0 30px" }}>
            <p style={{ fontFamily: GROT, fontWeight: 900, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: YEL, margin: "0 0 6px" }}>
              {step.label}
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: "rgba(241,235,222,.92)", margin: 0, lineHeight: 1.5 }}>
              {step.body}
            </p>
            {step.cta && <div style={{ marginTop: 16 }}>{step.cta}</div>}
          </div>

          {/* D4 escape hatch — for a signed-out buyer whose payment address may
              not be the one they sign in with. See linkExistingAccountHref. */}
          {claimExpired && (
            <p style={{ fontFamily: SERIF, fontSize: 13, color: "rgba(241,235,222,.7)", margin: "-14px 0 26px", lineHeight: 1.6 }}>
              This payment is too old to attach to an account automatically. Email{" "}
              <a href="mailto:sia@syedirfanajmal.com" style={{ color: YEL, textDecoration: "none", fontWeight: 700 }}>
                sia@syedirfanajmal.com
              </a>{" "}
              and we&rsquo;ll link it by hand.
            </p>
          )}
          {showLinkExisting && (
            <p style={{ fontFamily: SERIF, fontSize: 13, color: "rgba(241,235,222,.7)", margin: "-14px 0 26px", lineHeight: 1.6 }}>
              Paid with a different address than you sign in with?{" "}
              <Link href={linkExistingAccountHref(sessionId)} prefetch={false} style={{ color: YEL, textDecoration: "underline", fontWeight: 700 }}>
                Sign in to your existing account
              </Link>{" "}
              and we&rsquo;ll attach this subscription to it.
            </p>
          )}

          <div style={{ borderTop: "1px solid rgba(241,235,222,.18)", paddingTop: 24 }}>
            <p style={{ fontFamily: GROT, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(241,235,222,.72)", margin: "0 0 18px", lineHeight: 1.7 }}>
              Still stuck? Write to{" "}
              <a href="mailto:sia@syedirfanajmal.com" style={{ color: YEL, textDecoration: "none", fontWeight: 700 }}>
                sia@syedirfanajmal.com
              </a>{" "}
              and we&rsquo;ll set you up by hand.
            </p>
            <Link href="/" style={linkStyle}>
              Back to homepage
            </Link>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 22, fontFamily: SERIF, fontSize: 13, color: "rgba(26,20,16,.68)", lineHeight: 1.5 }}>
          While you wait,{" "}
          <a href="/tools" style={{ color: INK, fontWeight: 700, textDecoration: "underline" }}>
            explore the free tools →
          </a>
        </p>

        <p style={{ textAlign: "center", marginTop: 14, fontFamily: GROT, fontSize: 10, color: "rgba(26,20,16,.6)", letterSpacing: ".08em", textTransform: "uppercase" }}>
          EMOS Platform · syedirfanajmal.com
        </p>

      </div>
    </div>
  );
}
