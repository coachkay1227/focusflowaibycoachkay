// One reader for "what actually got delivered for this order".
// Every value comes from a row that exists — never from intent, never from a
// rendered screen. Used by verify-checkout-session and fulfillment-recovery so
// the buyer, the admin console, and the recovery function cannot disagree.

export type StageState = "pending" | "done" | "failed" | "not_applicable";

export interface Stage {
  key: "payment" | "order" | "access_link" | "report" | "email";
  label: string;
  state: StageState;
  /** Short, human sentence. Safe to render to a buyer. */
  detail: string;
}

export interface FulfillmentSnapshot {
  stages: Stage[];
  fulfilledIn: string | null;
  recordId: string | null;
  auditId: string | null;
  /** True when payment settled and every applicable stage is done. */
  complete: boolean;
  /** True when payment settled but something is still missing or failed. */
  needsAttention: boolean;
}

interface QueryClient {
  // deno-lint-ignore no-explicit-any
  from: (table: string) => any;
}

export const ORDER_TABLES: Array<{ table: string; label: string }> = [
  { table: "business_audits", label: "AI Business Audit" },
  { table: "one_time_orders", label: "Order" },
  { table: "agent_orders", label: "Agent Build" },
  { table: "book_orders", label: "Book Order" },
  { table: "autism_orders", label: "Social Story Order" },
];

export const NEXT_STEPS_TEMPLATE = "purchase-next-steps";

/** Latest email_send_log row for this order's next-steps email, deduplicated
 *  by message_id (a single email writes a pending row then a sent/failed row). */
export async function readNextStepsEmail(
  client: QueryClient,
  sessionId: string,
  recipientEmail: string | null,
): Promise<{ status: string | null; created_at: string | null; error_message: string | null }> {
  const byMetadata = await client
    .from("email_send_log")
    .select("message_id, status, created_at, error_message")
    .eq("template_name", NEXT_STEPS_TEMPLATE)
    .eq("metadata->>session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(20);

  let rows = (byMetadata.data ?? []) as Array<{
    message_id: string | null;
    status: string;
    created_at: string;
    error_message: string | null;
  }>;

  // Rows written before session correlation existed carry no metadata, so fall
  // back to the recipient address for those older orders.
  if (rows.length === 0 && recipientEmail) {
    const byEmail = await client
      .from("email_send_log")
      .select("message_id, status, created_at, error_message")
      .eq("template_name", NEXT_STEPS_TEMPLATE)
      .eq("recipient_email", recipientEmail)
      .order("created_at", { ascending: false })
      .limit(20);
    rows = (byEmail.data ?? []) as typeof rows;
  }

  if (rows.length === 0) return { status: null, created_at: null, error_message: null };

  // Rows are newest-first; the first row for the newest message_id is its
  // latest status.
  const newest = rows[0];
  return {
    status: newest.status,
    created_at: newest.created_at,
    error_message: newest.error_message,
  };
}

/** Counts real send attempts for this order inside a rolling window. Used to
 *  cap recovery resends from rows that already exist. */
export async function countRecentSends(
  client: QueryClient,
  sessionId: string,
  windowMinutes = 60,
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { data } = await client
    .from("email_send_log")
    .select("message_id")
    .eq("template_name", NEXT_STEPS_TEMPLATE)
    .eq("metadata->>session_id", sessionId)
    .gte("created_at", since);
  const ids = new Set((data ?? []).map((r: { message_id: string | null }) => r.message_id));
  return ids.size;
}

export interface StageInput {
  sessionId: string;
  /** Stripe payment_status. */
  paymentStatus: string | null;
  /** Stripe session status, e.g. "complete" or "expired". */
  sessionStatus: string | null;
  customerEmail: string | null;
  mode: string | null;
}

export async function readFulfillmentStages(
  client: QueryClient,
  input: StageInput,
): Promise<FulfillmentSnapshot> {
  const settled = input.paymentStatus === "paid" || input.paymentStatus === "no_payment_required";
  const stages: Stage[] = [
    {
      key: "payment",
      label: "Payment",
      state: settled ? "done" : input.sessionStatus === "expired" ? "failed" : "pending",
      detail: settled
        ? "Your payment settled with the card processor."
        : input.sessionStatus === "expired"
          ? "This checkout expired before it was paid."
          : "The processor has not settled this payment yet.",
    },
  ];

  // Find the order row.
  let fulfilledIn: string | null = null;
  let recordId: string | null = null;
  let orderEmail: string | null = null;
  for (const l of ORDER_TABLES) {
    const { data } = await client
      .from(l.table)
      .select("id")
      .eq("stripe_session_id", input.sessionId)
      .maybeSingle();
    if (data?.id) {
      fulfilledIn = l.table;
      recordId = data.id as string;
      break;
    }
  }

  // Subscriptions fulfil by flipping the buyer's tier rather than writing an
  // order row, so a recorded webhook event is the fulfillment proof there.
  let subscriptionRecorded = false;
  if (!fulfilledIn && input.mode === "subscription") {
    const { data } = await client
      .from("processed_stripe_events")
      .select("event_id")
      .eq("event_type", "checkout.session.completed")
      .limit(1);
    subscriptionRecorded = !!data?.length;
  }

  const orderLabel = ORDER_TABLES.find((t) => t.table === fulfilledIn)?.label ?? "Order";
  stages.push({
    key: "order",
    label: "Order record",
    state: fulfilledIn || subscriptionRecorded ? "done" : settled ? "pending" : "not_applicable",
    detail: fulfilledIn
      ? `Recorded as ${orderLabel}.`
      : subscriptionRecorded
        ? "Your subscription access was applied."
        : settled
          ? "Your order row has not been written yet."
          : "Waiting on payment.",
  });

  const isAudit = fulfilledIn === "business_audits";
  const auditId: string | null = isAudit ? recordId : null;
  let reportReady = false;
  let linkState: StageState = "not_applicable";
  let linkDetail = "Not needed for this purchase.";

  if (isAudit && auditId) {
    const { data: audit } = await client
      .from("business_audits")
      .select("report, guest_email")
      .eq("id", auditId)
      .maybeSingle();
    reportReady = !!audit?.report;
    orderEmail = (audit?.guest_email as string | null) ?? null;

    const { data: tokenRow } = await client
      .from("audit_tokens")
      .select("token, expires_at")
      .eq("audit_id", auditId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!tokenRow?.token) {
      linkState = "pending";
      linkDetail = "Your private access link has not been issued yet.";
    } else if (tokenRow.expires_at && new Date(tokenRow.expires_at as string) < new Date()) {
      linkState = "failed";
      linkDetail = "Your access link has expired. Re-issue it below.";
    } else {
      linkState = "done";
      linkDetail = "Your private access link is live.";
    }
  }

  stages.push({
    key: "access_link",
    label: "Access link",
    state: linkState,
    detail: linkDetail,
  });

  stages.push({
    key: "report",
    label: "Report",
    state: !isAudit ? "not_applicable" : reportReady ? "done" : "pending",
    detail: !isAudit
      ? "Not part of this purchase."
      : reportReady
        ? "Your report is generated and ready to read."
        : "Your report is still generating.",
  });

  const email = await readNextStepsEmail(
    client,
    input.sessionId,
    input.customerEmail ?? orderEmail,
  );
  const emailState: StageState = email.status === "sent"
    ? "done"
    : email.status === "pending"
      ? "pending"
      : email.status === null
        ? settled ? "pending" : "not_applicable"
        : "failed";
  stages.push({
    key: "email",
    label: "Next-steps email",
    state: emailState,
    detail: emailState === "done"
      ? "Sent to the address on your order."
      : emailState === "failed"
        ? "The send did not go through. You can resend it below."
        : email.status === "pending"
          ? "The send is in flight."
          : settled
            ? "Not sent yet."
            : "Waiting on payment.",
  });

  const applicable = stages.filter((s) => s.state !== "not_applicable");
  const complete = settled && applicable.every((s) => s.state === "done");
  const needsAttention = settled && applicable.some((s) => s.state !== "done");

  return {
    stages,
    fulfilledIn,
    recordId,
    auditId,
    complete,
    needsAttention,
  };
}
