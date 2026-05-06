import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  evaluateBookOrderEligibility,
  readMetaString,
  UUID_RE,
  type SessionLike,
} from "./validation.ts";

const VALID_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";

const baseSession: SessionLike = {
  payment_status: "paid",
  status: "complete",
  amount_total: 4900,
  metadata: { book_order_id: VALID_ID },
};
const pending = { id: VALID_ID, order_total: 4900 };

Deno.test("readMetaString returns null for missing/invalid values", () => {
  assertEquals(readMetaString(null, "x"), null);
  assertEquals(readMetaString({}, "x"), null);
  assertEquals(readMetaString({ x: 123 as unknown as string }, "x"), null);
  assertEquals(readMetaString({ x: "   " }, "x"), null);
  assertEquals(readMetaString({ x: "a".repeat(501) }, "x"), null);
  assertEquals(readMetaString({ x: "  hello  " }, "x"), "hello");
});

Deno.test("UUID_RE accepts canonical uuids and rejects junk", () => {
  assertEquals(UUID_RE.test(VALID_ID), true);
  assertEquals(UUID_RE.test("not-a-uuid"), false);
  assertEquals(UUID_RE.test(""), false);
  assertEquals(UUID_RE.test("'; DROP TABLE book_orders;--"), false);
});

Deno.test("eligibility: happy path", () => {
  assertEquals(evaluateBookOrderEligibility(baseSession, pending), { eligible: true });
});

Deno.test("eligibility: rejects unpaid sessions", () => {
  const r = evaluateBookOrderEligibility({ ...baseSession, payment_status: "unpaid" }, pending);
  assertEquals(r, { eligible: false, reason: "not_paid" });
});

Deno.test("eligibility: rejects non-complete sessions", () => {
  const r = evaluateBookOrderEligibility({ ...baseSession, status: "open" }, pending);
  assertEquals(r, { eligible: false, reason: "not_complete" });
});

Deno.test("eligibility: rejects missing/invalid metadata.book_order_id", () => {
  assertEquals(
    evaluateBookOrderEligibility({ ...baseSession, metadata: {} }, pending),
    { eligible: false, reason: "missing_book_order_id" },
  );
  assertEquals(
    evaluateBookOrderEligibility({ ...baseSession, metadata: { book_order_id: "junk" } }, pending),
    { eligible: false, reason: "invalid_book_order_id" },
  );
  assertEquals(
    evaluateBookOrderEligibility(
      { ...baseSession, metadata: { book_order_id: 999 as unknown as string } },
      pending,
    ),
    { eligible: false, reason: "missing_book_order_id" },
  );
});

Deno.test("eligibility: rejects mismatched order id", () => {
  const r = evaluateBookOrderEligibility(
    { ...baseSession, metadata: { book_order_id: OTHER_ID } },
    pending,
  );
  assertEquals(r, { eligible: false, reason: "metadata_mismatch" });
});

Deno.test("eligibility: rejects amount mismatch", () => {
  assertEquals(
    evaluateBookOrderEligibility({ ...baseSession, amount_total: 100 }, pending),
    { eligible: false, reason: "amount_mismatch" },
  );
  assertEquals(
    evaluateBookOrderEligibility({ ...baseSession, amount_total: null }, pending),
    { eligible: false, reason: "amount_mismatch" },
  );
});

/* -------------------------------------------------------------------------- */
/* Idempotency simulation                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Mirrors the webhook's idempotency contract:
 *   INSERT INTO processed_stripe_events(event_id) ...
 * Unique-violation (Postgres 23505) -> duplicate, short-circuit.
 */
class FakeProcessedEvents {
  private seen = new Set<string>();
  insert(eventId: string): { error: { code: string } | null } {
    if (this.seen.has(eventId)) return { error: { code: "23505" } };
    this.seen.add(eventId);
    return { error: null };
  }
}

class FakeBookOrders {
  updateCount = 0;
  status = "pending_payment";
  constructor(public order: { id: string; order_total: number }) {}

  /** Simulate the real .update(...).eq(id).eq(session).eq(status='pending_payment') filter. */
  markPaidIfPending(id: string): { rowsAffected: number } {
    if (id !== this.order.id) return { rowsAffected: 0 };
    if (this.status !== "pending_payment") return { rowsAffected: 0 };
    this.status = "paid";
    this.updateCount += 1;
    return { rowsAffected: 1 };
  }
}

function processWebhook(
  events: FakeProcessedEvents,
  orders: FakeBookOrders,
  event: { id: string; session: SessionLike },
) {
  // 1. Idempotency gate
  const ins = events.insert(event.id);
  if (ins.error?.code === "23505") return { result: "duplicate" as const };

  // 2. Eligibility gate
  const elig = evaluateBookOrderEligibility(event.session, orders.order);
  if (!elig.eligible) return { result: "ignored" as const, reason: elig.reason };

  // 3. Conditional update
  const upd = orders.markPaidIfPending(orders.order.id);
  return { result: "updated" as const, rowsAffected: upd.rowsAffected };
}

Deno.test("idempotency: duplicate event id is skipped, order updated only once", () => {
  const events = new FakeProcessedEvents();
  const orders = new FakeBookOrders({ id: VALID_ID, order_total: 4900 });
  const event = { id: "evt_123", session: baseSession };

  const first = processWebhook(events, orders, event);
  const second = processWebhook(events, orders, event);
  const third = processWebhook(events, orders, event);

  assertEquals(first, { result: "updated", rowsAffected: 1 });
  assertEquals(second, { result: "duplicate" });
  assertEquals(third, { result: "duplicate" });
  assertEquals(orders.updateCount, 1);
  assertEquals(orders.status, "paid");
});

Deno.test("idempotency: distinct event ids for same order still only flip once", () => {
  // Stripe occasionally re-delivers with a NEW event id (e.g. retries against
  // a different signing secret). The status='pending_payment' guard must
  // ensure we still only flip once.
  const events = new FakeProcessedEvents();
  const orders = new FakeBookOrders({ id: VALID_ID, order_total: 4900 });

  const a = processWebhook(events, orders, { id: "evt_a", session: baseSession });
  const b = processWebhook(events, orders, { id: "evt_b", session: baseSession });

  assertEquals(a, { result: "updated", rowsAffected: 1 });
  assertEquals(b, { result: "updated", rowsAffected: 0 }); // pending_payment guard
  assertEquals(orders.updateCount, 1);
});

Deno.test("invalid metadata: tampered book_order_id never updates the order", () => {
  const events = new FakeProcessedEvents();
  const orders = new FakeBookOrders({ id: VALID_ID, order_total: 4900 });

  const r1 = processWebhook(events, orders, {
    id: "evt_bad_1",
    session: { ...baseSession, metadata: { book_order_id: "not-a-uuid" } },
  });
  const r2 = processWebhook(events, orders, {
    id: "evt_bad_2",
    session: { ...baseSession, metadata: { book_order_id: OTHER_ID } },
  });
  const r3 = processWebhook(events, orders, {
    id: "evt_bad_3",
    session: { ...baseSession, metadata: {} },
  });

  assertEquals(r1, { result: "ignored", reason: "invalid_book_order_id" });
  assertEquals(r2, { result: "ignored", reason: "metadata_mismatch" });
  assertEquals(r3, { result: "ignored", reason: "missing_book_order_id" });
  assertEquals(orders.updateCount, 0);
  assertEquals(orders.status, "pending_payment");
});

Deno.test("invalid metadata: amount mismatch does not update the order", () => {
  const events = new FakeProcessedEvents();
  const orders = new FakeBookOrders({ id: VALID_ID, order_total: 4900 });

  const r = processWebhook(events, orders, {
    id: "evt_amt",
    session: { ...baseSession, amount_total: 100 },
  });

  assertEquals(r, { result: "ignored", reason: "amount_mismatch" });
  assertEquals(orders.updateCount, 0);
});