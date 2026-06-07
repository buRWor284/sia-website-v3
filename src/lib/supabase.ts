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
