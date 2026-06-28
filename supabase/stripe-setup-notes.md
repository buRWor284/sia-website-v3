# Phase 9 — Stripe Setup Checklist

Complete these steps to activate Stripe billing. Code is already deployed — just needs the env vars and migration.

---

## Step 1 — Run the SQL migration

Supabase Dashboard → SQL Editor → paste and run `supabase/stripe-subscriptions.sql`.

---

## Step 2 — Create the Stripe product + price

1. Stripe Dashboard → Products → **Add product**
   - Name: `EMOS Platform`
   - Pricing: **Recurring**, `$50.00`, monthly, USD
2. Copy the **Price ID** (looks like `price_1ABC...`)

---

## Step 3 — Add env vars in Vercel

Vercel → Project → Settings → Environment Variables:

| Variable | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → **Secret key** (`sk_live_...`) |
| `STRIPE_PRICE_ID` | Price ID you copied in Step 2 (`price_...`) |
| `STRIPE_WEBHOOK_SECRET` | Step 4 below — come back to fill this in |

---

## Step 4 — Register the Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://www.syedirfanajmal.com/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Click **Add endpoint**
5. Copy the **Signing secret** (`whsec_...`)
6. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel (Step 3)

---

## Step 5 — Redeploy

After adding all env vars, trigger a Vercel redeploy (or push any commit).

---

## Step 6 — Test in Stripe test mode first

Use `sk_test_...` key and Stripe test card `4242 4242 4242 4242` to verify the full flow:
1. Go to `https://www.syedirfanajmal.com/emos/subscribe`
2. Pay with the test card
3. Check that the Clerk invite email arrives
4. Sign up → verify dashboard access

Switch to live keys when confirmed working.

---

## What the code does (summary)

- `/emos/subscribe` — public subscribe page with $50/month CTA
- `/emos/subscribe/success` — confirmation page shown after Stripe redirects back
- `/api/emos-checkout` — creates Stripe Checkout Session, returns redirect URL
- `/api/webhooks/stripe` — handles `checkout.session.completed` → upserts `stripe_subscriptions` row + sends Clerk invite + sends welcome email; handles cancellation + payment failures
- `dashboard/page.tsx` — non-admin users now checked against `stripe_subscriptions` table; redirect to `/emos/subscribe` if no active subscription
