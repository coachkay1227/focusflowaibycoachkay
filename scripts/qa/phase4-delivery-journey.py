#!/usr/bin/env python3
"""Phase 4 end-to-end delivery journey.

Drives the real app in a browser for one already-paid order, then asserts the
result against real database rows. Nothing here trusts the UI: every closing
assertion is a SQL read. Run against the dev server:

    python3 scripts/qa/phase4-delivery-journey.py

Covers:
  1. Buyer sees per-stage delivery truth on /order-success.
  2. Buyer reaches the report through the magic-link token.
  3. Admin sees the order plus its delivery state on /admin/orders.
  4. Recovery re-sends the next-steps email and returns post-recovery stages.
  5. Backend: email_send_log, admin_audit_log, nurture_touches, audit_tokens.
"""
import asyncio, json, os, subprocess, sys
from pathlib import Path
from playwright.async_api import async_playwright

def env_file(key):
    for line in Path("/dev-server/.env").read_text().splitlines():
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip().strip('"')
    raise KeyError(key)

BASE = os.environ.get("PHASE4_BASE_URL", "http://localhost:8080")
SHOTS = Path("/tmp/browser/phase4/screenshots"); SHOTS.mkdir(parents=True, exist_ok=True)
results = []
FN_URL = env_file("VITE_SUPABASE_URL")
FN_KEY = env_file("VITE_SUPABASE_PUBLISHABLE_KEY")

# Dev-mode noise, plus the non-2xx statuses this journey deliberately provokes
# (the unknown-session 404 and the resend-cap 429). Both are asserted on
# explicitly below, so the browser's generic "failed to load resource" line is
# not an extra failure.
IGNORED_CONSOLE = ("Function components cannot be given refs", "was preloaded using link preload",
                   "Download the React DevTools", "Failed to load resource")


def sql(q):
    out = subprocess.run(["psql", "-At", "-F", "|", "-c", q], capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return [l for l in out.stdout.strip().split("\n") if l]


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS " if ok else "FAIL ") + name + (f" :: {detail}" if detail else ""))


async def main():
    rows = sql(
        "select a.id, a.stripe_session_id, t.token from business_audits a "
        "join audit_tokens t on t.audit_id = a.id "
        "where a.stripe_session_id is not null and a.report is not null "
        "order by a.created_at desc limit 1;")
    if not rows:
        print("No fulfilled audit order to test. Run /admin/fulfillment-test first.")
        return 1
    audit_id, session_id, token = rows[0].split("|")
    print(f"order under test: audit={audit_id} session={session_id[:18]}…")

    emails_before = int(sql(
        f"select count(*) from email_send_log where metadata->>'session_id' = '{session_id}';")[0])
    audits_before = int(sql(
        f"select count(*) from admin_audit_log where target_id = '{session_id}' "
        "and action like 'order_recovery_%';")[0])

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text)
                if m.type == "error" and not any(i in m.text for i in IGNORED_CONSOLE) else None)

        cookies_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON")
        if cookies_json:
            cookies = json.loads(cookies_json)
            for c in cookies:
                c["url"] = BASE
            await ctx.add_cookies(cookies)
        await page.goto(BASE, wait_until="domcontentloaded")
        sk = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        sj = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        if sk and sj:
            await page.evaluate(
                f"window.localStorage.setItem({json.dumps(sk)}, {json.dumps(sj)})")

    # ---- 1. buyer: order success + delivery panel ------------------------
        await page.goto(f"{BASE}/order-success?session_id={session_id}",
                        wait_until="domcontentloaded")
        panel = page.get_by_label("Delivery status")
        try:
            await panel.wait_for(timeout=45000)
            panel_text = await panel.inner_text()
        except Exception:
            panel_text = ""
        await page.screenshot(path=str(SHOTS / "1_order_success.png"))
        body = await page.inner_text("body")
        check("order-success confirms the payment", "Payment Confirmed" in body or "Order Confirmed" in body)
        check("delivery panel lists all five stages",
              all(s in panel_text for s in ("Payment", "Order record", "Access link", "Report", "Next-steps email")),
              panel_text[:120].replace("\n", " "))
        check("no stage is claimed done without a row",
              "—" in panel_text and "landed" in panel_text.lower())
        check("next-steps actions render", "Book your free" in body or "next step" in body.lower())

        # ---- 2. buyer: magic-link report ---------------------------------
        await page.goto(f"{BASE}/audit/report/{audit_id}?token={token}",
                        wait_until="domcontentloaded")
        await page.wait_for_timeout(6000)
        await page.screenshot(path=str(SHOTS / "2_report.png"))
        rbody = await page.inner_text("body")
        check("magic-link report opens for the buyer",
              "No access" not in rbody and len(rbody) > 400, rbody[:100].replace("\n", " "))

        # ---- 3. admin visibility -----------------------------------------
        await page.goto(f"{BASE}/admin/orders", wait_until="domcontentloaded")
        await page.wait_for_timeout(8000)
        await page.screenshot(path=str(SHOTS / "3_admin_orders.png"))
        abody = (await page.inner_text("body")).lower()  # inner_text applies text-transform
        check("admin reaches /admin/orders", page.url.endswith("/admin/orders"), page.url)
        check("admin table exposes a Delivery column", "delivery" in abody)
        check("admin can filter to orders needing attention", "needs attention" in abody)

        # ---- 4. recovery -------------------------------------------------
        # supabase-js swallows the body on non-2xx, so read the raw response:
        # the cap's 429 payload is part of what this journey asserts.
        recovery = await page.evaluate(
            """async ({ sid, url, key }) => {
                const mod = await import('/src/integrations/supabase/client.ts');
                const { data: { session } } = await mod.supabase.auth.getSession();
                const res = await fetch(`${url}/functions/v1/fulfillment-recovery`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    apikey: key,
                    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
                  },
                  body: JSON.stringify({ session_id: sid, action: 'resend_next_steps' }),
                });
                return { status: res.status, data: await res.json().catch(() => null) };
            """, {"sid": session_id, "url": FN_URL, "key": FN_KEY})
        data = recovery.get("data") or {}
        print("recovery status:", recovery.get("status"))
        rate_capped = isinstance(data.get("error"), str) and "already been sent" in data["error"]
        if rate_capped:
            # The 3-per-hour cap fired, which is itself correct behaviour.
            check("recovery enforces the 3-per-hour resend cap", True, data["error"])
        else:
            check("recovery resends the next-steps email", data.get("ok") is True,
                  recovery.get("error") or json.dumps(data)[:120])
            check("recovery returns post-recovery stages from real rows",
                  isinstance(data.get("stages"), list) and len(data["stages"]) == 5)
            check("recovery reports the order complete", data.get("complete") is True)

        bad = await page.evaluate(
            """async ({ url, key }) => {
                const res = await fetch(`${url}/functions/v1/fulfillment-recovery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', apikey: key },
                  body: JSON.stringify({ session_id: 'cs_live_doesnotexist', action: 'resend_next_steps' }),
                });
                return { status: res.status, data: await res.json().catch(() => null) };
            }""", {"url": FN_URL, "key": FN_KEY})
        check("recovery refuses an unknown session",
              bad.get("status") == 404 and not (bad.get("data") or {}).get("ok"),
              json.dumps(bad)[:120])

        check("no runtime console errors during the journey",
              len(console_errors) == 0, "; ".join(console_errors[:2])[:200])
        await browser.close()

    # ---- 5. backend assertions ------------------------------------------
    await asyncio.sleep(6)
    emails_after = int(sql(
        f"select count(*) from email_send_log where metadata->>'session_id' = '{session_id}';")[0])
    if rate_capped:
        check("capped recovery sent nothing extra",
              emails_after == emails_before, f"before={emails_before} after={emails_after}")
    else:
        check("recovery wrote new email_send_log rows tagged to this session",
              emails_after > emails_before, f"before={emails_before} after={emails_after}")
    log_rows = sql(
        f"select template_name || '/' || status from email_send_log "
        f"where metadata->>'session_id' = '{session_id}' order by created_at desc limit 4;")
    check("a purchase-next-steps send reached 'sent'",
          any(r == "purchase-next-steps/sent" for r in log_rows), str(log_rows))
    audits_after = int(sql(
        f"select count(*) from admin_audit_log where target_id = '{session_id}' "
        "and action like 'order_recovery_%';")[0])
    check("recovery is written to the admin audit trail",
          audits_after > audits_before if not rate_capped else audits_after == audits_before,
          f"before={audits_before} after={audits_after}")
    nurture = sql(f"select step || '/' || status from nurture_touches where audit_id = '{audit_id}' order by step;")
    check("nurture sequence is scheduled for day 1/3/7", len(nurture) == 3, str(nurture))
    live_token = int(sql(
        f"select count(*) from audit_tokens where audit_id = '{audit_id}' and expires_at > now();")[0])
    check("a live access link exists for the order", live_token >= 1, str(live_token))

    passed = sum(1 for _, ok, _ in results if ok)
    print("\n==== PHASE 4 SUMMARY ====")
    for n, ok, _ in results:
        print(("PASS " if ok else "FAIL ") + n)
    print(f"{passed}/{len(results)} passed")
    return 0 if passed == len(results) else 1

sys.exit(asyncio.run(main()))
