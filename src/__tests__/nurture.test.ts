import { describe, it, expect } from "vitest";
import {
  planTouches,
  decideTouch,
  extractHighlights,
  idempotencyKeyFor,
  smsBodyFor,
  DAY_MS,
  MAX_DEFER_DAYS,
} from "../../supabase/functions/_shared/nurture";

const AUDIT = "11111111-1111-1111-1111-111111111111";
const FROM = new Date("2026-01-01T12:00:00.000Z");

describe("planTouches", () => {
  it("schedules exactly three touches at day 1, 3 and 7", () => {
    const rows = planTouches(AUDIT, "buyer@example.com", { from: FROM });
    expect(rows.map((r) => r.step)).toEqual([1, 3, 7]);
    expect(rows.map((r) => r.template_name)).toEqual([
      "audit-nurture-insight",
      "audit-nurture-access",
      "audit-nurture-booking",
    ]);
    rows.forEach((r) => {
      const offset = new Date(r.scheduled_for).getTime() - FROM.getTime();
      expect(offset).toBe(r.step * DAY_MS);
    });
  });

  it("returns nothing when there is no address to send to", () => {
    expect(planTouches(AUDIT, null)).toEqual([]);
    expect(planTouches(AUDIT, "   ")).toEqual([]);
    expect(planTouches("", "buyer@example.com")).toEqual([]);
  });

  it("flags test purchases so the worker leaves them alone", () => {
    const rows = planTouches(AUDIT, "buyer@example.com", { isTest: true });
    expect(rows.every((r) => r.is_test)).toBe(true);
    expect(planTouches(AUDIT, "buyer@example.com").every((r) => !r.is_test)).toBe(true);
  });
});

describe("decideTouch", () => {
  const base = { scheduledFor: FROM, hasReport: true, isSuppressed: false };

  it("sends a ready touch", () => {
    expect(decideTouch({ ...base, step: 1 }).action).toBe("send");
    expect(decideTouch({ ...base, step: 3 }).action).toBe("send");
  });

  it("never sends to a suppressed address, even when otherwise ready", () => {
    const d = decideTouch({ ...base, step: 3, isSuppressed: true });
    expect(d).toEqual({ action: "skip", reason: "suppressed_recipient" });
  });

  it("defers the day 1 insight until the report exists", () => {
    const d = decideTouch({ ...base, step: 1, hasReport: false, now: FROM });
    expect(d).toEqual({ action: "defer", reason: "awaiting_report" });
  });

  it("does not hold report-independent touches hostage to the report", () => {
    expect(decideTouch({ ...base, step: 3, hasReport: false, now: FROM }).action).toBe("send");
    expect(decideTouch({ ...base, step: 7, hasReport: false, now: FROM }).action).toBe("send");
  });

  it("gives up on a report that never arrived instead of deferring forever", () => {
    const now = new Date(FROM.getTime() + (MAX_DEFER_DAYS + 1) * DAY_MS);
    expect(decideTouch({ ...base, step: 1, hasReport: false, now })).toEqual({
      action: "skip",
      reason: "report_never_generated",
    });
  });

  it("skips an unrecognised step rather than guessing", () => {
    expect(decideTouch({ ...base, step: 4 }).action).toBe("skip");
  });
});

describe("extractHighlights", () => {
  it("pulls the leak and the first planned action", () => {
    const h = extractHighlights({
      where_youre_leaking: "Leads go cold before you reply.",
      seven_day_plan: [
        { title: "Audit the entry points", action: "List every inbound channel.", focus_pillar: "Foundation" },
        { title: "Later", action: "Not this one." },
      ],
    });
    expect(h.leak).toBe("Leads go cold before you reply.");
    expect(h.actionTitle).toBe("Audit the entry points");
    expect(h.action).toBe("List every inbound channel.");
    expect(h.pillar).toBe("Foundation");
  });

  it("falls back to the executive snapshot when no leak was named", () => {
    expect(extractHighlights({ executive_snapshot: "Solid base, weak follow-up." }).leak)
      .toBe("Solid base, weak follow-up.");
  });

  it("degrades to nulls on malformed or empty reports", () => {
    for (const bad of [null, undefined, {}, { seven_day_plan: "nope" }, { where_youre_leaking: "  " }]) {
      const h = extractHighlights(bad);
      expect(h).toEqual({ leak: null, actionTitle: null, action: null, pillar: null });
    }
  });
});

describe("idempotencyKeyFor", () => {
  it("is stable per audit and step, and distinct across steps", () => {
    expect(idempotencyKeyFor(AUDIT, 1)).toBe(idempotencyKeyFor(AUDIT, 1));
    expect(idempotencyKeyFor(AUDIT, 1)).not.toBe(idempotencyKeyFor(AUDIT, 3));
  });
});

describe("smsBodyFor", () => {
  const ctx = { origin: "https://coachkayai.life/", auditId: AUDIT, bookingUrl: "https://book.test/15" };

  it("includes an opt-out on every message it produces", () => {
    for (const step of [1, 3, 7]) {
      expect(smsBodyFor(step, ctx)).toContain("Reply STOP");
    }
  });

  it("links the report, the challenges and the booking page", () => {
    expect(smsBodyFor(1, ctx)).toContain(`/audit/report/${AUDIT}`);
    expect(smsBodyFor(3, ctx)).toContain("/challenges");
    expect(smsBodyFor(7, ctx)).toContain("https://book.test/15");
  });

  it("does not double the origin slash", () => {
    expect(smsBodyFor(3, ctx)).not.toContain("life//");
  });

  it("stays silent when there is nothing useful to say", () => {
    expect(smsBodyFor(7, { ...ctx, bookingUrl: null })).toBeNull();
    expect(smsBodyFor(2, ctx)).toBeNull();
  });
});