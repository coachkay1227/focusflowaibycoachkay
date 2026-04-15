import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const COACH_EMAIL = "Hello@coachkayelevates.org";

const BRAND = {
  gold: "#c9a227",
  darkBg: "#111827",
  textLight: "#e8d5a3",
  textMuted: "#8a7a5a",
  footerText: "#6b7280",
};

function buildNotificationHtml(data: {
  type: string;
  name: string;
  email: string;
  organization?: string;
  programName?: string;
  message: string;
}): string {
  const isApp = data.type === "application";
  const heading = isApp ? `New Application: ${data.programName}` : "New Coaching Inquiry";
  const rows = [
    `<tr><td style="padding:8px 0;font-weight:600;color:#374151;width:140px;">Name</td><td style="padding:8px 0;color:#374151;">${escapeHtml(data.name)}</td></tr>`,
    `<tr><td style="padding:8px 0;font-weight:600;color:#374151;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:${BRAND.gold};">${escapeHtml(data.email)}</a></td></tr>`,
  ];
  if (data.organization) {
    rows.push(`<tr><td style="padding:8px 0;font-weight:600;color:#374151;">Organization</td><td style="padding:8px 0;color:#374151;">${escapeHtml(data.organization)}</td></tr>`);
  }
  if (data.programName) {
    rows.push(`<tr><td style="padding:8px 0;font-weight:600;color:#374151;">Program</td><td style="padding:8px 0;color:#374151;">${escapeHtml(data.programName)}</td></tr>`);
  }

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${BRAND.darkBg};padding:24px 40px;text-align:center;">
<h1 style="margin:0;font-size:20px;font-weight:700;"><span style="color:${BRAND.gold};">Focus</span><span style="color:${BRAND.textLight};">Flow</span></h1>
<p style="margin:4px 0 0;font-size:11px;color:${BRAND.textMuted};letter-spacing:2px;text-transform:uppercase;">New ${isApp ? "Application" : "Inquiry"}</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<h2 style="margin:0 0 20px;font-size:20px;color:#111827;">${heading}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
${rows.join("")}
</table>
<div style="margin:24px 0 0;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
<p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Message</p>
<p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-line;">${escapeHtml(data.message)}</p>
</div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const body = await req.json();
    const { type, name, email, organization, programName, message } = body;

    // Validate
    if (!type || !["application", "inquiry"].includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    }
    if (!name || typeof name !== "string" || name.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    }
    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    }
    if (!message || typeof message !== "string" || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    }

    const html = buildNotificationHtml({ type, name, email, organization, programName, message });
    const isApp = type === "application";
    const subject = isApp
      ? `[FocusFlow] New Application: ${programName ?? "Program"} — ${name}`
      : `[FocusFlow] New Coaching Inquiry — ${name}`;

    // Try Resend first, then LOVABLE_API_KEY gateway, then log
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "FocusFlow <onboarding@resend.dev>",
          to: COACH_EMAIL,
          reply_to: email,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[apply-now] Resend error:", err);
        throw new Error("Email send failed");
      }
    } else if (lovableKey) {
      const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": lovableKey,
        },
        body: JSON.stringify({
          from: "FocusFlow <onboarding@resend.dev>",
          to: [COACH_EMAIL],
          reply_to: email,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[apply-now] Gateway error:", err);
        // Fall through to log instead of throwing — don't block user flow
        console.log(`[apply-now] Falling back to log. Would send to ${COACH_EMAIL}: ${subject}`);
      }
    } else {
      console.log(`[apply-now] Would send to ${COACH_EMAIL}: ${subject}`);
      console.log("[apply-now] Configure RESEND_API_KEY to enable actual sending.");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[apply-now] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
