

# Add STRIPE_WEBHOOK_SECRET

## What This Does
Stores your Stripe webhook signing secret (`whsec_...`) securely in Lovable Cloud so the `stripe-webhook` edge function can verify incoming Stripe events.

## Steps

1. **Add the secret** using the `add_secret` tool with key name `STRIPE_WEBHOOK_SECRET` — you'll be prompted to paste your `whsec_` value securely.

2. **Optionally add ADMIN_EMAILS** secret (`hello@coachkayelevates.org`) if not already configured, for admin validation in edge functions.

No code changes needed — the `stripe-webhook` edge function already reads `STRIPE_WEBHOOK_SECRET` from the environment.

