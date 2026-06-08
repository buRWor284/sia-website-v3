import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ─── Browser client (no auth) ─────────────────────────────────────────────────
// Use for public/unauthenticated reads only.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Authenticated server client ──────────────────────────────────────────────
// Call this inside Server Actions and Route Handlers.
// Passes the Clerk JWT so Supabase RLS can enforce org_id isolation.
export function createSupabaseServerClient(clerkToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  })
}

// ─── Service-role client (bypasses RLS) ───────────────────────────────────────
// Use ONLY in server-side code (API routes, Server Actions) where you need to
// write data that isn't tied to a specific user session (e.g., background jobs,
// API routes that run before the user has a full Clerk org context).
// Requires SUPABASE_SERVICE_ROLE_KEY in environment (never expose to the browser).
export function createSupabaseServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key (RLS will apply)')
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
