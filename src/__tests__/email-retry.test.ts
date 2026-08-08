import { describe, it, expect } from "vitest";
import {
  MAX_RETRY_ATTEMPTS,
  RETRY_BACKOFF_MS,
  isRetryableTemplate,
  nextRetryAt,
  retryDecisionFor,
  RETRYABLE_TEMPLATES,
} from "../../supabase/functions/_shared/email-retry";

const BASE = new Date("2026-01-01T00:00:00.000Z");
const minutesAfter = (d: Date) => (d.getTime() - BASE.getTime()) / 60000;

describe("retry backoff schedule", () => {
  it("widens the gap between attempts", () => {
    expect(RETRY_BACKOFF_MS).toEqual([...RETRY_BACKOFF_MS].sort((a, b) => a - b));
    expect(minutesAfter(nextRetryAt(0, BASE)!)).toBe(5);
    expect(minutesAfter(nextRetryAt(1, BASE)!)).toBe(30);
    expect(minutesAfter(nextRetryAt(2, BASE)!)).toBe(120);
    expect(minutesAfter(nextRetryAt(3, BASE)!)).toBe(360);
  });

  it("stops at the cap so a fifth attempt never happens", () => {
    expect(MAX_RETRY_ATTEMPTS).toBe(4);
    expect(nextRetryAt(MAX_RETRY_ATTEMPTS, BASE)).toBeNull();
    expect(nextRetryAt(MAX_RETRY_ATTEMPTS + 3, BASE)).toBeNull();
  });

  it("refuses nonsense attempt counts", () => {
    expect(nextRetryAt(-1, BASE)).toBeNull();
  });

  it("keeps the whole window under half a day", () => {
    const total = RETRY_BACKOFF_MS.reduce((a, b) => a + b, 0);
    expect(total).toBeLessThan(12 * 3600_000);
  });
});

describe("retry eligibility", () => {
  it("covers the starter kit report", () => {
    expect(isRetryableTemplate("starter-kit-report")).toBe(true);
    expect(RETRYABLE_TEMPLATES["starter-kit-report"].sourceTable).toBe("starter_kit_reports");
  });

  it("does not retry templates with no known source row", () => {
    for (const name of ["purchase-next-steps", "audit-day-1", "welcome", ""]) {
      expect(isRetryableTemplate(name)).toBe(false);
    }
  });
});

describe("retry decision", () => {
  it("queues retryable provider failures", () => {
    expect(retryDecisionFor("starter-kit-report", "retryable")).toEqual({
      enqueue: true,
      status: "pending",
    });
  });

  it("parks permanent failures instead of retrying them", () => {
    expect(retryDecisionFor("starter-kit-report", "permanent")).toEqual({
      enqueue: true,
      status: "parked",
    });
  });

  it("ignores templates that cannot be rebuilt", () => {
    expect(retryDecisionFor("purchase-next-steps", "retryable").enqueue).toBe(false);
    expect(retryDecisionFor("purchase-next-steps", "permanent").enqueue).toBe(false);
  });
});
