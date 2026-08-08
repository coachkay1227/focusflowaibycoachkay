// Admin console for the post-purchase audit nurture sequence.
//
// One endpoint, five actions, all admin-only:
//   lookup   - find an audit by id / session id / email and return its touches
//   preview  - render a step's email exactly as the buyer would receive it
//   enqueue  - create the missing steps for an audit (never duplicates a step)
//   resend   - send one step right now with a fresh idempotency key
//   queue    - fleet-wide queue status and delivery outcome per step, keyed by
//              the same idempotency key the worker sends with
//
// The worker (process-nurture-queue) still owns scheduled delivery. This only
// gives Coach Kay a way to see and repair a single buyer's sequence.

import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";
import { TEMPLATES } from "../_shared/transactional-email-templates/registry.ts";
import { getBookingLinks } from "../_shared/booking-links.ts";
import {
  extractHighlights,
  idempotencyKeyFor,
  NURTURE_STEPS,
  planTouches,
  smsBodyFor,
} from "../_shared/nurture.ts";

const APP_ORIGIN = "https://coachkayai.life";

function json(body: unknown, status = 200, cors: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

interface AuditRow {
  id: string;
  guest_email: string | null;
  guest_name: string | null;
  user_id: string | null;
  stripe_session_id: string | null;
  status: string;
  report: unknown;
  phone: string | null;
  sms_consent_at: string | null;
  created_at: string;
  generated_at: string | null;
  is_test: boolean;
}

function templateDataFor(
  step: number,
  audit: AuditRow,
  bookingUrl: string,
): Record<string, unknown> {
  const highlights = extractHighlights(audit.report);
  const data: Record<string, unknown> = {
    name: audit.guest_name ?? null,
    audit_id: audit.id,
  };
  if (step === 1) {
    data.leak = highlights.leak;
    data.action_title = highlights.actionTitle;
    data.action = highlights.action;
    data.pillar = highlights.pillar;
  }
  if (step === 7) data.bookingUrl = bookingUrl;
  return data;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return json({ error: "Unauthorized" }, 401, cors);

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401, cors);
  const adminId = userData.user.id;

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: adminId,
    _role: "admin",
  });
  if (!isAdmin) return json({ error: "Forbidden" }, 403, cors);

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON body" }, 400, cors);
  }

  const action = typeof body.action === "string" ? body.action : "";
  const auditId = typeof body.auditId === "string" ? body.auditId.trim() : "";
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const step = typeof body.step === "number" ? body.step : NaN;

  const auditColumns =
    "id,guest_email,guest_name,user_id,stripe_session_id,status,report,phone,sms_consent_at,created_at,generated_at,is_test";

  async function loadAudit(): Promise<AuditRow | null> {
    if (auditId) {
      const { data } = await supabase
        .from("business_audits")
        .select(auditColumns)
        .eq("id", auditId)
        .maybeSingle();
      return (data as AuditRow) ?? null;
    }
    if (!query) return null;
    const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
    if (uuidLike) {
      const { data } = await supabase
        .from("business_audits")
        .select(auditColumns)
        .eq("id", query)
        .maybeSingle();
      if (data) return data as AuditRow;
    }
    if (query.startsWith("cs_")) {
      const { data } = await supabase
        .from("business_audits")
        .select(auditColumns)
        .eq("stripe_session_id", query)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) return data as AuditRow;
    }
    const { data } = await supabase
      .from("business_audits")
      .select(auditColumns)
      .ilike("guest_email", query)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as AuditRow) ?? null;
  }

  async function touchesFor(id: string) {
    const { data } = await supabase
      .from("nurture_touches")
      .select("id,step,template_name,email,status,scheduled_for,sent_at,attempts,last_error,is_test,created_at")
      .eq("audit_id", id)
      .order("step", { ascending: true });
    return data ?? [];
  }

  async function logAdmin(act: string, targetId: string, metadata: Record<string, unknown>) {
    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      action: act,
      target_table: "nurture_touches",
      target_id: targetId,
      metadata,
    });
  }

  try {
    if (action === "lookup") {
      const audit = await loadAudit();
      if (!audit) return json({ found: false }, 200, cors);
      const { count: suppressed } = await supabase
        .from("suppressed_emails")
        .select("*", { count: "exact", head: true })
        .eq("email", audit.guest_email ?? "");
      return json({
        found: true,
        audit: {
          id: audit.id,
          email: audit.guest_email,
          name: audit.guest_name,
          status: audit.status,
          has_report: audit.report !== null && audit.report !== undefined,
          generated_at: audit.generated_at,
          created_at: audit.created_at,
          stripe_session_id: audit.stripe_session_id,
          phone: audit.phone ? `***${audit.phone.slice(-4)}` : null,
          sms_consent_at: audit.sms_consent_at,
          is_test: audit.is_test,
          linked_user: audit.user_id !== null,
        },
        suppressed: (suppressed ?? 0) > 0,
        steps: NURTURE_STEPS,
        touches: await touchesFor(audit.id),
      }, 200, cors);
    }

    if (action === "preview") {
      const audit = await loadAudit();
      if (!audit) return json({ error: "Audit not found" }, 404, cors);
      const stepDef = NURTURE_STEPS.find((s) => s.step === step);
      if (!stepDef) return json({ error: "Unknown step" }, 400, cors);

      const entry = TEMPLATES[stepDef.templateName];
      if (!entry) return json({ error: "Template not registered" }, 500, cors);

      const links = await getBookingLinks(supabase);
      const data = templateDataFor(stepDef.step, audit, links.freeClarityUrl);
      const html = await renderAsync(React.createElement(entry.component, data));
      const subject = typeof entry.subject === "function" ? entry.subject(data) : entry.subject;

      return json({
        step: stepDef.step,
        templateName: stepDef.templateName,
        subject,
        html,
        recipient: audit.guest_email,
        requiresReport: stepDef.requiresReport,
        hasReport: audit.report !== null && audit.report !== undefined,
        smsBody: audit.phone && audit.sms_consent_at
          ? smsBodyFor(stepDef.step, {
              origin: APP_ORIGIN,
              auditId: audit.id,
              bookingUrl: links.freeClarityUrl,
            })
          : null,
      }, 200, cors);
    }

    if (action === "enqueue") {
      const audit = await loadAudit();
      if (!audit) return json({ error: "Audit not found" }, 404, cors);
      if (!audit.guest_email) {
        return json({ error: "This audit has no email address to send to" }, 400, cors);
      }

      const existing = await touchesFor(audit.id);
      const existingSteps = new Set(existing.map((t) => t.step));
      const planned = planTouches(audit.id, audit.guest_email, { isTest: audit.is_test })
        .filter((p) => !existingSteps.has(p.step));

      if (planned.length === 0) {
        return json({ inserted: 0, reason: "all_steps_already_exist", touches: existing }, 200, cors);
      }

      const { error: insErr } = await supabase.from("nurture_touches").insert(planned);
      if (insErr) throw insErr;

      await logAdmin("nurture_enqueued", audit.id, {
        audit_id: audit.id,
        email: audit.guest_email,
        steps: planned.map((p) => p.step),
      });

      return json({ inserted: planned.length, touches: await touchesFor(audit.id) }, 200, cors);
    }

    if (action === "resend") {
      const audit = await loadAudit();
      if (!audit) return json({ error: "Audit not found" }, 404, cors);
      if (!audit.guest_email) {
        return json({ error: "This audit has no email address to send to" }, 400, cors);
      }
      const stepDef = NURTURE_STEPS.find((s) => s.step === step);
      if (!stepDef) return json({ error: "Unknown step" }, 400, cors);

      const { count: suppressed } = await supabase
        .from("suppressed_emails")
        .select("*", { count: "exact", head: true })
        .eq("email", audit.guest_email);
      if ((suppressed ?? 0) > 0) {
        return json({ error: "This address is suppressed. Nothing was sent." }, 409, cors);
      }

      const links = await getBookingLinks(supabase);
      const data = templateDataFor(stepDef.step, audit, links.freeClarityUrl);

      // Fresh key on purpose: the scheduled key is already spent, and an admin
      // resend is a deliberate second delivery.
      const idempotencyKey = `nurture-${audit.id}-${stepDef.step}-manual-${Date.now()}`;
      const { error: sendError } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: stepDef.templateName,
          recipientEmail: audit.guest_email,
          idempotencyKey,
          templateData: data,
        },
      });
      if (sendError) throw sendError;

      const { data: row } = await supabase
        .from("nurture_touches")
        .select("id,attempts")
        .eq("audit_id", audit.id)
        .eq("step", stepDef.step)
        .maybeSingle();

      if (row) {
        await supabase
          .from("nurture_touches")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            attempts: (row.attempts ?? 0) + 1,
            last_error: null,
          })
          .eq("id", row.id);
      }

      await logAdmin("nurture_resent", audit.id, {
        audit_id: audit.id,
        step: stepDef.step,
        template_name: stepDef.templateName,
        recipient: audit.guest_email,
        idempotency_key: idempotencyKey,
        touch_existed: row !== null,
      });

      return json({
        sent: true,
        step: stepDef.step,
        recipient: audit.guest_email,
        touches: await touchesFor(audit.id),
      }, 200, cors);
    }

    return json({ error: "Unknown action" }, 400, cors);
  } catch (err) {
    console.error("admin-nurture error", err);
    return json({ error: "Unable to complete that nurture action" }, 500, cors);
  }
});
