import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ─── Browser client (no auth) ─────────────────────────────────────────────────
// Use for public/unauthenticated reads only.
// Lazy: the real client is created on first property access, NOT at module load,
// so importing this module never throws when NEXT_PUBLIC_SUPABASE_URL is absent
// (e.g. a local `next build` without Supabase env). Real env is present at runtime.
let _browserClient: SupabaseClient | null = null
function getBrowserClient(): SupabaseClient {
  if (!_browserClient) _browserClient = createClient(supabaseUrl, supabaseAnonKey)
  return _browserClient
}
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getBrowserClient()
    const value = Reflect.get(client as object, prop)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

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
