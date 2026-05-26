import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

const adminEmailsEnv = Deno.env.get("ADMIN_EMAILS") ?? "hello@coachkayelevates.org";
const ADMIN_EMAILS = adminEmailsEnv.split(",").map((e: string) => e.trim());

const BRAND = {
  gold: "#c9a227",
  darkBg: "#111827",
  textLight: "#e8d5a3",
  textMuted: "#8a7a5a",
  white: "#ffffff",
  footerText: "#6b7280",
};

const BASE_URL = "https://focusflowelevation-hub.com";

function baseWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>FocusFlow</title></head>
<body style="margin:0;padding:0;background:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${BRAND.darkBg};padding:32px 40px;text-align:center;">
<h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;"><span style="color:${BRAND.gold};">Focus</span><span style="color:${BRAND.textLight};">Flow</span></h1>
<p style="margin:4px 0 0;font-size:12px;color:${BRAND.textMuted};letter-spacing:2px;text-transform:uppercase;">by Coach Kay</p>
</td></tr>
<tr><td style="padding:40px;">${content}</td></tr>
<tr><td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
<p style="margin:0;font-size:12px;color:${BRAND.footerText};line-height:1.6;">FocusFlow by Coach Kay<br/>Master Certified Life Coach · 600+ Hours</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
<tr><td style="background:${BRAND.gold};border-radius:8px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${BRAND.darkBg};text-decoration:none;">${text}</a>
</td></tr></table>`;
}

function welcomeEmail(name: string): string {
  return baseWrapper(`
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">Welcome to FocusFlow</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hey ${name || "there"}, I'm Coach Kay — and I'm glad you're here.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      FocusFlow is built on the Clarity Code framework — the same methodology I use with clients who pay $497 for a coaching package. You now have access to tools that can identify your patterns, sharpen your focus, and move you toward real clarity.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Start with a 5-minute Clarity Check. It's free, it's honest, and it will show you something about yourself you haven't seen before.
    </p>
    ${ctaButton("Begin Your Clarity Check", `${BASE_URL}/clarity`)}
    <p style="margin:0;font-size:13px;color:${BRAND.footerText};text-align:center;">"See clearly. Move with purpose." — Coach Kay</p>
  `);
}

function reengagementEmail(name: string): string {
  return baseWrapper(`
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">Still thinking about it?</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hey ${name || "there"}, I noticed you haven't been back in a while. That's okay — clarity doesn't run on anyone else's timeline.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      But I'll say this: the patterns you discovered don't go away just because you stopped looking at them. They're still running. The question is whether you want to keep letting them — or do something about it.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Come back when you're ready. Your dashboard remembers where you left off.
    </p>
    ${ctaButton("Pick Up Where You Left Off", `${BASE_URL}/dashboard`)}
  `);
}

function challengeReminderEmail(name: string, challengeType: string, day: number): string {
  return baseWrapper(`
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">Day ${day} — Don't break the streak</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hey ${name || "there"}, your <strong>${challengeType}</strong> challenge is waiting. You've made it ${day} day${day > 1 ? "s" : ""} — that's not nothing.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Today's reflection takes 5 minutes. The insight it gives you could change the next 5 years.
    </p>
    ${ctaButton("Complete Today's Reflection", `${BASE_URL}/challenges`)}
    <p style="margin:0;font-size:13px;color:${BRAND.footerText};text-align:center;">"The mirror doesn't judge. It just shows you what's real." — Coach Kay</p>
  `);
}

function customEmail(name: string, subject: string, message: string): string {
  return baseWrapper(`
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.darkBg};font-weight:600;">${subject}</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hey ${name || "there"},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;white-space:pre-line;">
      ${message}
    </p>
    ${ctaButton("Go to FocusFlow", `${BASE_URL}/dashboard`)}
    <p style="margin:0;font-size:13px;color:${BRAND.footerText};text-align:center;">— Coach Kay</p>
  `);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    // Admin check
    const isAdminEmail = ADMIN_EMAILS.includes(userData.user.email ?? "");
    if (!isAdminEmail) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Admin access required");
    }

    const body = await req.json();
    const { template, user_id, subject, message } = body;

    if (!user_id) throw new Error("Missing user_id");
    if (!template) throw new Error("Missing template");

    // Get recipient info
    const { data: recipientAuth } = await supabase.auth.admin.getUserById(user_id);
    const recipientEmail = recipientAuth?.user?.email;
    if (!recipientEmail) throw new Error("User has no email address");

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user_id)
      .single();

    const name = profile?.display_name ?? recipientEmail.split("@")[0];

    // Build email HTML based on template
    let html: string;
    let emailSubject: string;

    switch (template) {
      case "welcome":
        html = welcomeEmail(name);
        emailSubject = "Welcome to FocusFlow — Your Clarity Journey Starts Now";
        break;
      case "reengagement":
        html = reengagementEmail(name);
        emailSubject = "Still thinking about it?";
        break;
      case "challenge_reminder": {
        const challengeType = body.challenge_type ?? "Mirror Challenge";
        const day = body.day ?? 1;
        html = challengeReminderEmail(name, challengeType, day);
        emailSubject = `Day ${day} — Your ${challengeType} awaits`;
        break;
      }
      case "custom":
        if (!subject || !message) throw new Error("Custom emails require subject and message");
        html = customEmail(name, subject, message);
        emailSubject = subject;
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    // Send via Supabase auth.admin (uses built-in email provider)
    // This sends a "magic link" style email with custom HTML
    // For production, configure a custom SMTP in Supabase dashboard
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") ?? "noreply@coachkayai.life";
    const replyToEmail = Deno.env.get("REPLY_TO_EMAIL") ?? "hello@coachkayelevates.org";

    if (resendKey) {
      // Use Resend API if configured
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: `Coach Kay <${fromEmail}>`,
          to: recipientEmail,
          reply_to: replyToEmail,
          subject: emailSubject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Email send failed: ${err}`);
      }

      return new Response(JSON.stringify({ success: true, sent_to: recipientEmail, method: "resend" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Fallback: log the email (no SMTP configured yet)
    console.log(`[SEND-EMAIL] Would send to ${recipientEmail}: ${emailSubject}`);
    return new Response(JSON.stringify({
      success: true,
      sent_to: recipientEmail,
      method: "logged",
      note: "Email logged but not sent. Configure RESEND_API_KEY in Supabase secrets to enable sending.",
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const status = msg.includes("Admin access") || msg.includes("Not authenticated") ? 403 : 400;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status,
    });
  }
});
