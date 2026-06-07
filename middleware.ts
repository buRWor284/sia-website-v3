import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// /emostool and everything under it requires auth.
// /emos (course landing page) stays completely public and untouched.
const isProtectedRoute = createRouteMatcher(['/emostool(.*)'])

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
