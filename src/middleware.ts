import { clerkMiddleware, clerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// /emos-platform and everything under it requires auth.
// /emos (course landing page) stays completely public and untouched.
const isProtectedRoute = createRouteMatcher(["/emos-platform(.*)"]);

// C2 (2026-07-02 review): "/emos-platform(.*)" does NOT match /api/emostool/* —
// the platform API routes were reachable by ANY signed-in Clerk account with
// no emos_access check. Gate them here too (belt) in addition to the
// requireEmosAccess() guard inside each handler (suspenders). APIs get JSON
// errors, not redirects.
const isProtectedApiRoute = createRouteMatcher(["/api/emostool(.*)"]);

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

// /emos-platform/not-invited is public (no redirect loop)
const isNotInvitedRoute = createRouteMatcher(["/emos-platform/not-invited"]);

// /emos-platform (exact root) is the PUBLIC platform landing + sign-out destination.
// Only the root is public; everything BELOW it (/emos-platform/dashboard, tools, invite)
// stays protected. The page itself forwards signed-in users to the dashboard.
const isEmostoolLanding = createRouteMatcher(["/emos-platform", "/emos-platform/"]);

// /emos-platform/subscribe (+ /success) is the PUBLIC checkout path: new buyers hit it
// BEFORE they have an account. It moved UNDER the protected prefix in the rename, so it
// must be explicitly exempted or Clerk would force sign-in before payment (money path).
const isSubscribeRoute = createRouteMatcher(["/emos-platform/subscribe", "/emos-platform/subscribe/(.*)"]);

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
      await auth.protect(); // redirects unauthenticated users to /sign-in

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
  if (isProtectedRoute(req) && !isNotInvitedRoute(req) && !isEmostoolLanding(req) && !isSubscribeRoute(req)) {
    await auth.protect();
    // Invite-only: require emos_access = true in Clerk publicMetadata.
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
          return NextResponse.redirect(new URL("/emos-platform/not-invited", req.url));
        }
        // Live metadata has it — let them through (JWT will catch up on next refresh)
      } catch {
        // If Clerk API is unreachable, fail closed
        return NextResponse.redirect(new URL("/emos-platform/not-invited", req.url));
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
  ],
};
