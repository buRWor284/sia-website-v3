import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Only /emos/dashboard and everything under it requires auth.
// /emos (marketing page), /emos/apply, /emos/pay stay public.
const isProtectedRoute = createRouteMatcher(['/emos/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
