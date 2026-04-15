

# Fix: Redeploy GHL Webhook Function

## What's happening
The `ghl-webhook` edge function code was updated to check `GHL_WEBHOOK_URL` first, but the **deployed** version is still the old code that only reads `GHL_API_KEY`. The error messages in logs (`GHL_API_KEY is not a valid URL`) confirm this — the new code would say `Webhook URL is not valid. Set GHL_WEBHOOK_URL...` instead.

## Steps

1. **Redeploy the `ghl-webhook` edge function** so the latest code (which reads `GHL_WEBHOOK_URL`) goes live
2. **Send a test ping** to verify the webhook reaches GHL successfully
3. **Check logs** to confirm no more errors

## What to check on your end
After the fix, log into your GoHighLevel account and check the webhook/automation history for a `test_ping` event from `focusflow-ai`. The exact location depends on your GHL setup — typically under Automation → Workflow History or the specific workflow tied to that webhook URL.

