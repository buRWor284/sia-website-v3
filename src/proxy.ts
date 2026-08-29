import { clerkMiddleware, clerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// /emos-platform and everything under it requires auth.
// /emos (course landing page) stays completely public and untouched.
const isProtectedRoute = createRouteMatcher(["/emos-platform(.*)"]);

// C2 (2026-07-02 review): "/emos-platform(.*)" does NOT match /api/emos-platform/* —
// the platform API routes were reachable by ANY signed-in Clerk account with
// no emos_access check. Gate them here too (belt) in addition to the
// requireEmosAccess() guard inside each handler (suspenders). APIs get JSON
// errors, not redirects.
const isProtectedApiRoute = createRouteMatcher(["/api/emos-platform(.*)"]);

// C4 (2026-07-22, tabless-cron live-verify): cron-triggered routes under
// /api/emos-platform authenticate via their own CRON_SECRET bearer check
// (see factcheck/cron/route.ts), not a Clerk session — Vercel Cron never
// carries one. Left ungated, isProtectedApiRoute's `if (!userId) return 401`
// fired before the route handler ever ran, so every scheduled tick 401'd at
// the middleware layer and the route's CRON_SECRET check was never reached.
// Caught via Vercel runtime logs: 100% 401 on every per-minute invocation
// since the route shipped. Exempt by exact path, not prefix, so any future
// /api/emos-platform/** route defaults back to the Clerk gate.
const isEmosCronRoute = createRouteMatcher(["/api/emos-platform/factcheck/cron"]);

// ─── Legacy Basic Auth clients ────────────────────────────────────────────────
// PT and Resourcex stay on HTTP Basic Auth (shared username/password via Vercel
// env vars). All new clients should use the Clerk-based system below instead.

const isClientPtRoute = createRouteMatcher(["/clients/pt", "/clients/pt/(.*)"]);
const isClientResourcexRoute = createRouteMatcher(["/clients/resourcex", "/clients/resourcex/(.*)"]);

// Keep this in sync with the two matchers above.
const BASIC_AUTH_CLIENT_SLUGS = new Set(["pt", "resourcex"]);

function requireBasicAuth(realm: string) {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        `Basic realm="${realm}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

function hasValidCredentials(req: NextRequest, userVar: string, passVar: string): boolean {
  const user = process.env[userVar];
  const pass = process.env[passVar];
  if (!user || !pass) return false; // fail closed until configured in Vercel

  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return false;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return false;
  return decoded.slice(0, i) === user && decoded.slice(i + 1) === pass;
}

// ─── Clerk-based client workspaces ───────────────────────────────────────────
// New clients get individual Clerk accounts instead of shared Basic Auth.
// Each user has publicMetadata.client_slug set to the workspace slug they own.
// To provision a new client: run `scripts/create-client.mjs` (or invoke the
// "add-client" Cowork skill), then create src/app/clients/<slug>/page.tsx.

// Matches any /clients/:slug route — Basic Auth slugs are skipped inside the handler.
const isClerkClientRoute = createRouteMatcher(["/clients/:slug", "/clients/:slug/(.*)"]);

// Public escape hatch — shown when a logged-in user tries the wrong workspace.
const isClientUnauthorizedPage = createRouteMatcher(["/clients/unauthorized"]);

// ─── Workspace pages (new prefix, 2026-08-07) ────────────────────────────────
// /workspace/<slug> is the new home for private client + prospect pages. It exists
// because /clients is ALSO a public marketing route (the roster page), and
// src/app/clients/layout.tsx stamps every child with title "Clients · The Roster"
// and canonical "/clients" — so private workspaces were declaring a public
// marketing page as their canonical. /workspace has no public parent.
// Gating mirrors the /clients/:slug Clerk check below, same client_slug metadata.
const isWorkspaceRoute = createRouteMatcher(["/workspace/:slug", "/workspace/:slug/(.*)"]);

// Slugs served WITHOUT any login. Use only for prospect-facing material that is
// not confidential. Every page in here must set robots: { index:false, follow:false }.
// Empty by design: prefer Basic Auth below over a bare public URL.
const PUBLIC_WORKSPACE_SLUGS = new Set<string>([]);

// ─── Basic Auth workspace slugs ──────────────────────────────────────────────
// For PROSPECTS and anyone who should not have to create an account. They get a
// username and password by email and the browser prompts once. Same mechanism as
// the legacy PT / Resourcex client routes above, different env vars per slug.
// Real clients with an ongoing relationship should move to the Clerk path instead.
const isWorkspaceHajjPeopleRoute = createRouteMatcher([
  "/workspace/hajj-people",
  "/workspace/hajj-people/(.*)",
]);

// Keep this in sync with the Basic Auth matchers above.
const BASIC_AUTH_WORKSPACE_SLUGS = new Set(["hajj-people"]);

// /emos-platform/not-invited is public (no redirect loop).
// RETIRED as a destination 2026-07-26 (see the no-access redirect below) but the
// route itself stays — it is now a redirect stub, and it must remain exempt or
// the stub would be gated by the very check that used to send people to it.
const isNotInvitedRoute = createRouteMatcher(["/emos-platform/not-invited"]);

// /emos-platform (exact root) is the PUBLIC platform landing + sign-out destination.
// Only the root is public; everything BELOW it (/emos-platform/dashboard, tools, invite)
// stays protected. The page itself forwards signed-in users to the dashboard.
const isEmostoolLanding = createRouteMatcher(["/emos-platform", "/emos-platform/"]);

// /emos-platform/subscribe (+ /success) is the PUBLIC checkout path: new buyers hit it
// BEFORE they have an account. It moved UNDER the protected prefix in the rename, so it
// must be explicitly exempted or Clerk would force sign-in before payment (money path).
const isSubscribeRoute = createRouteMatcher(["/emos-platform/subscribe", "/emos-platform/subscribe/(.*)"]);

// C3 (2026-07-15): sign-in/sign-up moved UNDER the protected /emos-platform prefix.
// They MUST be exempted here or Clerk would force sign-in in order to REACH sign-in
// (redirect loop / lockout). There is no admin bypass; recovery = revert + redeploy.
const isAuthRoute = createRouteMatcher(["/emos-platform/signin(.*)", "/emos-platform/signup(.*)"]);

// C3 (2026-07-15): /emos-platform/signedout is the PUBLIC post-sign-out landing. It sits
// under the protected prefix, so exempt it too or a signed-out visitor is bounced to sign-in.
const isSignedOutRoute = createRouteMatcher(["/emos-platform/signedout"]);

// 2026-07-26 (self-serve): where a signed-in user WITHOUT emos_access goes.
// Was /emos-platform/not-invited — a dead end whose only affordance was a
// "request access" form, with no way to buy anywhere on the page. Anyone with a
// Clerk account who wanted to PAY (a client-workspace user, someone whose grant
// failed, an old beta account) was told they were not invited and left there.
// /subscribe is the correct destination: it sells, it takes payment, and it is
// already exempt above so there is no redirect loop. Lapsed subscribers are
// separately steered to /subscribe?returning=1 by the dashboard layout.
const NO_ACCESS_DESTINATION = "/emos-platform/subscribe";

export default clerkMiddleware(async (auth, req) => {
  // ── Legacy: PT (Basic Auth) ──────────────────────────────────────────────
  if (isClientPtRoute(req)) {
    return hasValidCredentials(req, "PT_CLIENT_USER", "PT_CLIENT_PASS")
      ? NextResponse.next()
      : requireBasicAuth("Physicians Thrive client workspace");
  }

  // ── Legacy: Resourcex (Basic Auth) ──────────────────────────────────────
  if (isClientResourcexRoute(req)) {
    return hasValidCredentials(req, "RESOURCEX_CLIENT_USER", "RESOURCEX_CLIENT_PASS")
      ? NextResponse.next()
      : requireBasicAuth("Resourcex client workspace");
  }

  // ── Public: client "wrong workspace" page ────────────────────────────────
  if (isClientUnauthorizedPage(req)) return NextResponse.next();

  // ── Clerk-authenticated client workspaces ────────────────────────────────
  if (isClerkClientRoute(req)) {
    const slug = req.nextUrl.pathname.split("/")[2]; // /clients/{slug}/...

    // Belt-and-suspenders: skip if this slug is on Basic Auth (already returned above).
    if (slug && !BASIC_AUTH_CLIENT_SLUGS.has(slug)) {
      await auth.protect(); // redirects unauthenticated users to the Clerk sign-in URL (/emos-platform/signin)

      const { sessionClaims, userId } = await auth();
      const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;

      if (meta.client_slug !== slug) {
        // JWT may be stale — do a live Clerk API check before rejecting.
        try {
          const clerkApi = await clerkClient();
          const user = await clerkApi.users.getUser(userId!);
          if (user.publicMetadata?.client_slug !== slug) {
            return NextResponse.redirect(new URL("/clients/unauthorized", req.url));
          }
          // Live metadata matches — let through; JWT will catch up on next refresh.
        } catch {
          return NextResponse.redirect(new URL("/clients/unauthorized", req.url));
        }
      }
    }
  }

  // ── Workspace: Hajj People (Basic Auth, prospect) ────────────────────────
  if (isWorkspaceHajjPeopleRoute(req)) {
    return hasValidCredentials(req, "HAJJPEOPLE_USER", "HAJJPEOPLE_PASS")
      ? NextResponse.next()
      : requireBasicAuth("Hajj People workspace");
  }

  // ── Workspace pages: Clerk-gated unless the slug is public ───────────────
  if (isWorkspaceRoute(req)) {
    const slug = req.nextUrl.pathname.split("/")[2]; // /workspace/{slug}/...

    // Basic Auth slugs already returned above; skip them here too (belt and suspenders).
    if (slug && !PUBLIC_WORKSPACE_SLUGS.has(slug) && !BASIC_AUTH_WORKSPACE_SLUGS.has(slug)) {
      await auth.protect();

      const { sessionClaims, userId } = await auth();
      const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;

      if (meta.client_slug !== slug) {
        // JWT may be stale — do a live Clerk API check before rejecting.
        try {
          const clerkApi = await clerkClient();
          const user = await clerkApi.users.getUser(userId!);
          if (user.publicMetadata?.client_slug !== slug) {
            return NextResponse.redirect(new URL("/clients/unauthorized", req.url));
          }
          // Live metadata matches — let through; JWT will catch up on next refresh.
        } catch {
          return NextResponse.redirect(new URL("/clients/unauthorized", req.url));
        }
      }
    }
  }

  // ── EMOS cron routes: own CRON_SECRET check, no Clerk session available ──
  if (isEmosCronRoute(req)) return NextResponse.next();

  // ── EMOS platform API routes: Clerk auth + emos_access, JSON errors ──────
  if (isProtectedApiRoute(req)) {
    const { sessionClaims, userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
    if (!meta.emos_access) {
      // JWT may be stale — live check before rejecting, fail closed.
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        if (!user.publicMetadata?.emos_access) {
          return NextResponse.json({ error: "EMOS platform access required." }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Could not verify platform access." }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // ── EMOS tool: Clerk auth + emos_access metadata ─────────────────────────
  if (isProtectedRoute(req) && !isNotInvitedRoute(req) && !isEmostoolLanding(req) && !isSubscribeRoute(req) && !isAuthRoute(req) && !isSignedOutRoute(req)) {
    await auth.protect();
    // Require emos_access = true in Clerk publicMetadata.
    // Fast path: read from JWT session claims (already in token).
    // Fallback: fresh Clerk API call for new sign-ups where the webhook
    // may have set emos_access after the session token was issued.
    const { sessionClaims, userId } = await auth();
    const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;

    if (!meta.emos_access) {
      // JWT doesn't have it — check live metadata before rejecting
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId!);
        if (!user.publicMetadata?.emos_access) {
          return NextResponse.redirect(new URL(NO_ACCESS_DESTINATION, req.url));
        }
        // Live metadata has it — let them through (JWT will catch up on next refresh)
      } catch {
        // If Clerk API is unreachable, fail closed
        return NextResponse.redirect(new URL(NO_ACCESS_DESTINATION, req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    // Always run on gated client workspaces, including static .html assets.
    "/clients/pt",
    "/clients/pt/:path*",
    "/clients/resourcex",
    "/clients/resourcex/:path*",
    // Workspace pages, so static .html assets under /workspace are gated too.
    "/workspace/:slug",
    "/workspace/:slug/:path*",
  ],
};
