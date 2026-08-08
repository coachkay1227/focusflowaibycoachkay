// Post-purchase nurture sequence for AI Business Audit buyers.
//
// This module holds the schedule and the send-decision logic as pure
// functions so both the enrollment path (stripe-webhook) and the worker
// (process-nurture-queue) share one definition, and so the day offsets and
// skip rules can be unit tested without a database or an email provider.
//
// Scope note: these three touches deliver the purchased insight, confirm
// access, and schedule the next step. They carry no promotional copy for
// other offers. Keep it that way.

export const DAY_MS = 86_400_000;

export interface NurtureStep {
  /** Days after fulfillment. Also the stable step identifier in the DB. */
  step: 1 | 3 | 7;
  templateName: string;
  /** Day 1 leads with the report, so it cannot send before one exists. */
  requiresReport: boolean;
}

export const NURTURE_STEPS: NurtureStep[] = [
  { step: 1, templateName: "audit-nurture-insight", requiresReport: true },
  { step: 3, templateName: "audit-nurture-access", requiresReport: false },
  { step: 7, templateName: "audit-nurture-booking", requiresReport: false },
];

export interface PlannedTouch {
  audit_id: string;
  email: string;
  step: number;
  template_name: string;
  scheduled_for: string;
  is_test: boolean;
}

/**
 * Build the full set of rows to enroll one audit buyer.
 * Returns an empty array when there is no address to send to, so a missing
 * email can never create a queue of unsendable rows.
 */
export function planTouches(
  auditId: string,
  email: string | null | undefined,
  opts: { isTest?: boolean; from?: Date } = {},
): PlannedTouch[] {
  const trimmed = (email ?? "").trim();
  if (!auditId || !trimmed) return [];

  const from = opts.from ?? new Date();
  return NURTURE_STEPS.map((s) => ({
    audit_id: auditId,
    email: trimmed,
    step: s.step,
    template_name: s.templateName,
    scheduled_for: new Date(from.getTime() + s.step * DAY_MS).toISOString(),
    is_test: opts.isTest === true,
  }));
}

/** How long a report-dependent touch may wait before we give up on it. */
export const MAX_DEFER_DAYS = 14;

export type TouchDecision =
  | { action: "send" }
  | { action: "defer"; reason: string }
  | { action: "skip"; reason: string };

export interface TouchContext {
  step: number;
  scheduledFor: Date;
  /** True when the buyer's report has finished generating. */
  hasReport: boolean;
  /** True when the address is on the suppression list. */
  isSuppressed: boolean;
  now?: Date;
}

/**
 * Decide what to do with a single due touch.
 * Suppression always wins, so an unsubscribed or bounced address is skipped
 * before any other rule can send to it.
 */
export function decideTouch(ctx: TouchContext): TouchDecision {
  if (ctx.isSuppressed) return { action: "skip", reason: "suppressed_recipient" };

  const stepDef = NURTURE_STEPS.find((s) => s.step === ctx.step);
  if (!stepDef) return { action: "skip", reason: "unknown_step" };

  if (stepDef.requiresReport && !ctx.hasReport) {
    const now = ctx.now ?? new Date();
    const waitedMs = now.getTime() - ctx.scheduledFor.getTime();
    if (waitedMs > MAX_DEFER_DAYS * DAY_MS) {
      return { action: "skip", reason: "report_never_generated" };
    }
    return { action: "defer", reason: "awaiting_report" };
  }

  return { action: "send" };
}

/** Stable key so a retry or duplicate run can never send the same touch twice. */
export function idempotencyKeyFor(auditId: string, step: number): string {
  return `nurture-${auditId}-${step}`;
}

/**
 * Pull the single highest-leverage finding out of a generated report.
 * Every field is optional in practice, so each one degrades to null rather
 * than rendering an empty section or throwing.
 */
export interface InsightHighlights {
  leak: string | null;
  actionTitle: string | null;
  action: string | null;
  pillar: string | null;
}

export function extractHighlights(report: unknown): InsightHighlights {
  const r = (report ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  };

  const plan = Array.isArray(r.seven_day_plan) ? r.seven_day_plan : [];
  const firstDay = (plan[0] ?? {}) as Record<string, unknown>;

  return {
    leak: str(r.where_youre_leaking) ?? str(r.executive_snapshot),
    actionTitle: str(firstDay.title),
    action: str(firstDay.action),
    pillar: str(firstDay.focus_pillar),
  };
}