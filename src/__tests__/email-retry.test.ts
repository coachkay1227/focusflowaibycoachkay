import { describe, it, expect } from "vitest";
import {
  MAX_RETRY_ATTEMPTS,
  RETRY_BACKOFF_MS,
  isRetryableTemplate,
  nextRetryAt,
  retryDecisionFor,
  RETRYABLE_TEMPLATES,
  sourceRefFromMetadata,
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

  it("covers the purchase and next-steps emails", () => {
    expect(RETRYABLE_TEMPLATES["audit-purchase-confirmation"]).toEqual({
      sourceTable: "business_audits",
      metadataKey: "audit_id",
      refColumn: "source_id",
    });
    expect(RETRYABLE_TEMPLATES["purchase-next-steps"]).toEqual({
      sourceTable: "one_time_orders",
      metadataKey: "session_id",
      refColumn: "source_ref",
    });
  });

  it("does not retry templates with no known source row", () => {
    for (const name of ["audit-day-1", "welcome", "weekly-newsletter-issue", ""]) {
      expect(isRetryableTemplate(name)).toBe(false);
    }
  });
});

describe("source reference extraction", () => {
  it("routes a stripe session into the text column", () => {
    expect(sourceRefFromMetadata("purchase-next-steps", { session_id: "cs_test_123" })).toEqual({
      column: "source_ref",
      value: "cs_test_123",
    });
  });

  it("routes uuid sources into source_id", () => {
    expect(sourceRefFromMetadata("audit-purchase-confirmation", { audit_id: "abc" })).toEqual({
      column: "source_id",
      value: "abc",
    });
    expect(sourceRefFromMetadata("starter-kit-report", { starter_kit_report_id: "xyz" })).toEqual({
      column: "source_id",
      value: "xyz",
    });
  });

  it("returns null when the reference is missing, blank or the wrong type", () => {
    expect(sourceRefFromMetadata("purchase-next-steps", {})).toBeNull();
    expect(sourceRefFromMetadata("purchase-next-steps", { session_id: "  " })).toBeNull();
    expect(sourceRefFromMetadata("purchase-next-steps", { session_id: 12 })).toBeNull();
    expect(sourceRefFromMetadata("welcome", { session_id: "cs_1" })).toBeNull();
    expect(sourceRefFromMetadata("purchase-next-steps", null)).toBeNull();
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

  it("queues the purchase and next-steps emails too", () => {
    expect(retryDecisionFor("purchase-next-steps", "retryable").status).toBe("pending");
    expect(retryDecisionFor("audit-purchase-confirmation", "retryable").status).toBe("pending");
  });

  it("ignores templates that cannot be rebuilt", () => {
    expect(retryDecisionFor("weekly-newsletter-issue", "retryable").enqueue).toBe(false);
    expect(retryDecisionFor("weekly-newsletter-issue", "permanent").enqueue).toBe(false);
  });
});
