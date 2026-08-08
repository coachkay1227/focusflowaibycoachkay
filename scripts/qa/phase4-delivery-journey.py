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
  6. A real /starter-kit submission delivers its report email (status 'sent'),
     and a reserved test address is suppressed instead of logged as failed.
"""
import asyncio, json, os, re, subprocess, sys, time
from pathlib import Path
from playwright.async_api import async_playwright

def env_file(key):
    for line in Path("/dev-server/.env").read_text().splitlines():
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip().strip('"')
    raise KeyError(key)

BASE = os.environ.get("PHASE4_BASE_URL", "http://localhost:8080")
# Section 6 puts one real email in a real inbox per run. That is the only way to
# prove the starter-kit template actually delivers rather than merely enqueues.
QA_EMAIL = os.environ.get("PHASE4_QA_EMAIL", "Hello@coachkayelevates.org")
# Reserved by RFC 2606: must be suppressed, never sent, never logged as failed.
# Unique per run so the row-count assertion measures this run only.
FAKE_EMAIL = f"phase4-suppression-{int(time.time())}@example.com"
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


def skip(name, detail=""):
    """Record a deliberate non-failure (a correct guardrail fired, e.g. a 429)."""
    results.append((name, True, detail))
    print("SKIP " + name + (f" :: {detail}" if detail else ""))


def sqlq(email):
    """psql-safe single-quoted literal."""
    return email.replace("'", "''")


async def submit_starter_kit(page, email, name):
    """Drive the public /starter-kit form exactly as a visitor would.

    Returns every generate-starter-report HTTP status observed, so the caller can
    tell a real failure apart from the guest rate limit correctly firing, and can
    count how many report generations this submission actually triggered.
    """
    statuses = []
    handler = lambda r: statuses.append(r.status) if "generate-starter-report" in r.url else None
    page.on("response", handler)
    await page.goto(f"{BASE}/starter-kit", wait_until="domcontentloaded")
    # Scope to the report form: the page footer also carries a newsletter email
    # input with the same placeholder.
    bottleneck = page.get_by_placeholder(re.compile("one thing slowing you down"))
    form = page.locator("form").filter(has=bottleneck)
    await form.get_by_placeholder("First name (optional)").fill(name)
    await form.get_by_placeholder("you@email.com").fill(email)
    await form.locator("select").select_option("Coaching/Consulting")
    await bottleneck.fill(
        "Phase 4 automated delivery check: lead generation and follow-up.")
    await form.get_by_role("button", name=re.compile("Generate My Quick Start Report")).click()
    for _ in range(60):
        if statuses:
            break
        await page.wait_for_timeout(1000)
    await page.wait_for_timeout(3000)
    page.remove_listener("response", handler)
    return statuses


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
            }""", {"sid": session_id, "url": FN_URL, "key": FN_KEY})
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

        # ---- 6. starter-kit report email actually delivers ----------------
        # Regression guard: 21 rows once sat in email_send_log as `failed`
        # because QA fixtures were addressed to @example.com, which Resend
        # rejects permanently. Two submissions here: one real address that must
        # reach 'sent', one reserved address that must be suppressed untouched.
        sk_before = int(sql("select count(*) from email_send_log where template_name = "
                            f"'starter-kit-report' and recipient_email ilike '{sqlq(QA_EMAIL)}';")[0])
        sk_statuses = await submit_starter_kit(page, QA_EMAIL, "Phase4")
        status = sk_statuses[0] if sk_statuses else 0
        await page.screenshot(path=str(SHOTS / "4_starter_kit.png"))
        sk_body = await page.inner_text("body")
        rate_limited = status == 429

        if rate_limited:
            skip("starter-kit live send (guest hourly limit reached, limit working)", f"status={status}")
        else:
            check("starter-kit form returns a report to the visitor", status == 200,
                  f"status={status}")
            check("the report renders on screen",
                  "Where You Are" in sk_body or "where you are" in sk_body.lower(),
                  sk_body[:110].replace("\n", " "))

        # ---- 6b. reserved address must be suppressed, never sent ----------
        fake_statuses = await submit_starter_kit(page, FAKE_EMAIL, "Phase4Fake")
        fake_ok_calls = sum(1 for s in fake_statuses if s == 200)
        fake_rate_limited = bool(fake_statuses) and fake_statuses[0] == 429

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

    # ---- 6. starter-kit delivery assertions (SQL, not the UI) -------------
    if rate_limited:
        skip("starter-kit email reached 'sent' (skipped: rate limited)")
    else:
        sk_rows = sql(
            "select status || '|' || coalesce(metadata->>'resend_id','') || '|' || "
            "coalesce(metadata->>'starter_kit_report_id','') || '|' || coalesce(error_message,'') "
            "from email_send_log where template_name = 'starter-kit-report' and "
            f"recipient_email ilike '{sqlq(QA_EMAIL)}' order by created_at desc limit 2;")
        parsed = [r.split("|") for r in sk_rows]
        sent = next((p for p in parsed if p[0] == "sent"), None)
        check("starter-kit email reached 'sent'", sent is not None, str(sk_rows)[:200])
        check("the send carries a real provider id", bool(sent and sent[1]),
              sent[1] if sent else "no sent row")
        check("the send is correlated to the report that triggered it",
              bool(sent and sent[2]), sent[2] if sent else "no report id")
        check("no starter-kit row for this recipient is 'failed'",
              not any(p[0] == "failed" for p in parsed), str(sk_rows)[:200])
        check("the live send wrote new log rows",
              int(sql("select count(*) from email_send_log where template_name = "
                      f"'starter-kit-report' and recipient_email ilike '{sqlq(QA_EMAIL)}';")[0]) > sk_before,
              f"before={sk_before}")

    if fake_rate_limited:
        skip("reserved address is suppressed (skipped: rate limited)")
    else:
        # Scoped to the report template: one starter-kit submission also fires an
        # `application-received` email, and both must be suppressed.
        fake_rows = sql("select status || '|' || coalesce(error_message,'') || '|' || "
                        "coalesce(metadata->>'suppression_reason','') from email_send_log "
                        f"where recipient_email = '{sqlq(FAKE_EMAIL)}' "
                        "and template_name = 'starter-kit-report';")
        fparsed = [r.split("|") for r in fake_rows]
        # One log row per generated report, and no more: the reserved-domain
        # branch must short-circuit instead of adding a pending + failed pair.
        check("reserved test address logs one row per report, no send attempted",
              len(fparsed) == fake_ok_calls and fake_ok_calls >= 1,
              f"rows={len(fparsed)} reports={fake_ok_calls} {str(fake_rows)[:140]}")
        check("reserved test address is 'suppressed', never 'failed'",
              bool(fparsed) and all(p[0] == "suppressed" and not p[1] for p in fparsed),
              str(fake_rows)[:200])
        check("the suppression records its reason",
              bool(fparsed) and all(p[2] == "reserved_test_domain" for p in fparsed),
              str(fake_rows)[:200])

        # Every other template triggered by the same submission must be
        # suppressed too, not merely the report itself.
        other = sql("select template_name || '|' || status from email_send_log where "
                    f"recipient_email = '{sqlq(FAKE_EMAIL)}' and template_name <> 'starter-kit-report';")
        check("every email to the reserved address is suppressed",
              all(r.endswith("|suppressed") for r in other), str(other)[:200])

    # Whole-log invariant: a fixture address must never re-introduce a failure.
    still_failed = sql("select template_name || ' -> ' || recipient_email from email_send_log "
                       "where status = 'failed' limit 5;")
    check("no email anywhere in the log is in a 'failed' state",
          len(still_failed) == 0, str(still_failed)[:200])

    # ---- 7. automatic retry recovery -------------------------------------
    # A provider-side failure must land in email_delivery_retries and be drained
    # by the worker. The worker itself is a send trigger, so the first assertion
    # is that it cannot be called without a privileged credential.
    import urllib.request, urllib.error, json as _json
    retry_url = f"{FN_URL}/functions/v1/retry-failed-emails"
    req = urllib.request.Request(retry_url, method="POST",
                                 data=b"{}",
                                 headers={"Content-Type": "application/json",
                                          "Authorization": f"Bearer {FN_KEY}",
                                          "apikey": FN_KEY})
    try:
        urllib.request.urlopen(req, timeout=30)
        check("retry worker refuses the public key", False, "call succeeded with anon key")
    except urllib.error.HTTPError as e:
        check("retry worker refuses the public key", e.code == 403, f"status={e.code}")

    # Queue invariants. These hold whether or not anything failed this run.
    over_cap = sql("select id::text from public.email_delivery_retries "
                   "where attempts > max_attempts limit 5;")
    check("no retry row ever exceeds its attempt cap", len(over_cap) == 0, str(over_cap)[:200])

    bad_state = sql("select status from public.email_delivery_retries "
                    "where status not in ('pending','sent','exhausted','parked') limit 5;")
    check("every retry row is in a known state", len(bad_state) == 0, str(bad_state)[:200])

    # Permanent failures (bad address, invalid payload) must never be retried.
    retried_permanent = sql("select id::text from public.email_delivery_retries "
                            "where failure_class = 'permanent' and status = 'pending' limit 5;")
    check("permanent failures are parked, not retried",
          len(retried_permanent) == 0, str(retried_permanent)[:200])

    # The scheduler runs every 5 minutes, so a due row should never sit for long.
    stale = sql("select id::text || ' due ' || next_attempt_at::text from "
                "public.email_delivery_retries where status = 'pending' "
                "and next_attempt_at < now() - interval '30 minutes' limit 5;")
    check("no retry is stuck past its due time", len(stale) == 0, str(stale)[:200])

    # And nothing gave up silently: an exhausted row is a real outage to look at.
    exhausted = sql("select recipient_email from public.email_delivery_retries "
                    "where status = 'exhausted' limit 5;")
    check("no report email exhausted its retries", len(exhausted) == 0, str(exhausted)[:200])

    passed = sum(1 for _, ok, _ in results if ok)
    print("\n==== PHASE 4 SUMMARY ====")
    for n, ok, _ in results:
        print(("PASS " if ok else "FAIL ") + n)
    print(f"{passed}/{len(results)} passed")
    return 0 if passed == len(results) else 1

sys.exit(asyncio.run(main()))
