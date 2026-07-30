-- D4 (2026-07-30): decouple EMOS access from the PAYMENT email.
-- APPLIED LIVE to the emos-platform project on 2026-07-30. Kept here for the record.
--
-- The problem this closes
-- -----------------------
-- Access was resolved purely by the email Stripe reported. That address is not
-- an identity: Stripe Link, Google Pay and a work card on a personal account all
-- routinely report one the buyer never signs in with. Three consequences, all
-- silent:
--
--   1. GRANT went to whichever Clerk account matched the payment email — or to a
--      brand-new invitation for an address the buyer may not even read — while
--      the account they actually sign in with stayed locked out.
--   2. REVOKE was the same bug in reverse, and strictly worse. Cancellation read
--      the payment email off the row and revoked THAT account, so a signed-in
--      buyer (whose grant had correctly gone to their own account via the
--      checkout metadata) kept full access for free after cancelling.
--   3. The row was written with `onConflict: "email"` in Stripe's raw casing,
--      while stripe_customer_id is ALSO unique. A returning customer paying
--      under a different address matched neither target, so the INSERT died on
--      the customer-id constraint, the error was swallowed, and their stale
--      `canceled` row kept blocking them right after they had paid.
--
-- clerk_user_id is the durable link between a payment and an account. It is
-- nullable ON PURPOSE: rows written before this column existed, and any future
-- purchase where no account can be resolved, keep working through the email
-- path. Nothing here changes the enforcement policy — a MISSING row still means
-- allowed (admin-invited beta accounts have no Stripe row at all).

alter table public.stripe_subscriptions
  add column if not exists clerk_user_id text;

comment on column public.stripe_subscriptions.clerk_user_id is
  'Clerk user the access was granted to. Authoritative over email: set from the checkout session metadata or claimed once from the buyer''s live session on the success page. NULL means the row predates D4 or no account could be resolved — fall back to email.';

create index if not exists stripe_subscriptions_clerk_user_id_idx
  on public.stripe_subscriptions (clerk_user_id)
  where clerk_user_id is not null;

-- The read side queries with .eq() on a lowercased address, while the write side
-- stored whatever case Stripe supplied. Normalise so the UNIQUE(email) conflict
-- target and the lookups agree. All three rows present at the time were already
-- lowercase, so this was a no-op then and a guard from here on.
update public.stripe_subscriptions
   set email = lower(trim(email))
 where email <> lower(trim(email));

create unique index if not exists stripe_subscriptions_email_lower_idx
  on public.stripe_subscriptions (lower(email));
