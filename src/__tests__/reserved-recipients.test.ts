import { describe, it, expect } from "vitest";
import {
  isReservedTestRecipient,
  RESERVED_EMAIL_DOMAINS,
  RESERVED_EMAIL_TLDS,
} from "../../supabase/functions/_shared/reserved-recipients";

/**
 * Guards the rule that stopped QA fixtures from being logged as real delivery
 * failures. A false negative here means fake addresses hit Resend and write
 * `failed` rows again; a false positive means a paying customer silently never
 * receives their email. Both directions are asserted.
 */
describe("isReservedTestRecipient", () => {
  it("catches the reserved documentation domains", () => {
    for (const domain of RESERVED_EMAIL_DOMAINS) {
      expect(isReservedTestRecipient(`qa@${domain}`)).toBe(true);
    }
  });

  it("catches the reserved TLDs and bare labels", () => {
    for (const tld of RESERVED_EMAIL_TLDS) {
      expect(isReservedTestRecipient(`qa@mailbox${tld}`)).toBe(true);
      expect(isReservedTestRecipient(`qa@${tld.slice(1)}`)).toBe(true);
    }
  });

  it("catches subdomains of reserved domains", () => {
    expect(isReservedTestRecipient("qa@mail.example.com")).toBe(true);
    expect(isReservedTestRecipient("qa@a.b.example.org")).toBe(true);
    expect(isReservedTestRecipient("qa@box.local.test")).toBe(true);
  });

  it("is case and whitespace insensitive, and tolerates a trailing dot", () => {
    expect(isReservedTestRecipient("QA@Example.COM")).toBe(true);
    expect(isReservedTestRecipient("qa@ example.com ")).toBe(true);
    expect(isReservedTestRecipient("qa@example.com.")).toBe(true);
  });

  it("catches the exact fixture addresses that produced the false failures", () => {
    expect(isReservedTestRecipient("fulfillment-test+1786157632303@example.com")).toBe(true);
    expect(isReservedTestRecipient("testfocusauditor1@example.com")).toBe(true);
  });

  it("never suppresses a real routable address", () => {
    for (const real of [
      "Hello@coachkayelevates.org",
      "noreply@coachkayai.life",
      "buyer@gmail.com",
      "person@example.company.com",
      "person@notexample.com",
      "person@examples.com",
      "person@testing.com",
      "person@my.invalidation.io",
      "person@localhost.io",
    ]) {
      expect(isReservedTestRecipient(real), real).toBe(false);
    }
  });

  it("does not throw on malformed input", () => {
    expect(isReservedTestRecipient("no-at-sign")).toBe(false);
    expect(isReservedTestRecipient("trailing@")).toBe(false);
    expect(isReservedTestRecipient("")).toBe(false);
  });
});
