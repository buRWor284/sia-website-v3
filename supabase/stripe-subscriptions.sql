-- Phase 9: Stripe billing — subscription tracking
-- Run once in Supabase SQL editor.
--
-- This table is written by /api/webhooks/stripe (service role only).
-- It is NOT directly accessible to end users — all reads happen server-side.

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email                  TEXT        NOT NULL UNIQUE,
  stripe_customer_id     TEXT        UNIQUE,
  stripe_subscription_id TEXT        UNIQUE,
  status                 TEXT        NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only service role can touch this table — all API routes use service client
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
-- No user-facing policies needed; webhook uses SUPABASE_SERVICE_ROLE_KEY
