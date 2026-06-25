import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// /emostool and everything under it requires auth.
// /emos (course landing page) stays completely public and untouched.
const isProtectedRoute = createRouteMatcher(["/emostool(.*)"]);

// Physicians Thrive client workspace: gated with a single shared
// username + password (HTTP Basic Auth). Credentials come from the
// Vercel env vars PT_CLIENT_USER / PT_CLIENT_PASS and are never
// committed to the repo. Fails closed if the env vars are missing.
const isClientPtRoute = createRouteMatcher(["/clients/pt", "/clients/pt/(.*)"]);

function requireBasicAuth() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Physicians Thrive client workspace", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function hasValidCredentials(req: NextRequest): boolean {
  const user = process.env.PT_CLIENT_USER;
  const pass = process.env.PT_CLIENT_PASS;
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
    return hasValidCredentials(req) ? NextResponse.next() : requireBasicAuth();
  }

  if (isProtectedRoute(req) && !isNotInvitedRoute(req)) {
    await auth.protect();
    // Invite-only: require emos_access = true in Clerk publicMetadata
    const { sessionClaims } = await auth();
    const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
    if (!meta.emos_access) {
      return NextResponse.redirect(new URL("/emostool/not-invited", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    // Always run on the gated client workspace, including its static
    // .html assets (which the matcher above would otherwise skip).
    "/clients/pt",
    "/clients/pt/:path*",
  ],
};
