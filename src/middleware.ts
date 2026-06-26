import { clerkMiddleware, clerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// /emostool and everything under it requires auth.
// /emos (course landing page) stays completely public and untouched.
const isProtectedRoute = createRouteMatcher(["/emostool(.*)"]);

// Physicians Thrive client workspace: gated with a single shared
// username + password (HTTP Basic Auth). Credentials come from the
// Vercel env vars PT_CLIENT_USER / PT_CLIENT_PASS and are never
// committed to the repo. Fails closed if the env vars are missing.
const isClientPtRoute = createRouteMatcher(["/clients/pt", "/clients/pt/(.*)"]);

// Resourcex.io client workspace: same Basic Auth pattern.
// Env vars: RESOURCEX_CLIENT_USER / RESOURCEX_CLIENT_PASS
const isClientResourcexRoute = createRouteMatcher(["/clients/resourcex", "/clients/resourcex/(.*)"]);

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

// /emostool/not-invited is public (no redirect loop)
const isNotInvitedRoute = createRouteMatcher(["/emostool/not-invited"]);

export default clerkMiddleware(async (auth, req) => {
  // Gate the Physicians Thrive client workspace before anything else.
  if (isClientPtRoute(req)) {
    return hasValidCredentials(req, "PT_CLIENT_USER", "PT_CLIENT_PASS")
      ? NextResponse.next()
      : requireBasicAuth("Physicians Thrive client workspace");
  }

  // Gate the Resourcex.io client workspace.
  if (isClientResourcexRoute(req)) {
    return hasValidCredentials(req, "RESOURCEX_CLIENT_USER", "RESOURCEX_CLIENT_PASS")
      ? NextResponse.next()
      : requireBasicAuth("Resourcex client workspace");
  }

  if (isProtectedRoute(req) && !isNotInvitedRoute(req)) {
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
          return NextResponse.redirect(new URL("/emostool/not-invited", req.url));
        }
        // Live metadata has it — let them through (JWT will catch up on next refresh)
      } catch {
        // If Clerk API is unreachable, fail closed
        return NextResponse.redirect(new URL("/emostool/not-invited", req.url));
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
