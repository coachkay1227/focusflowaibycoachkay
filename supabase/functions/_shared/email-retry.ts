// Retry policy for transactional email that failed on the provider's side.
//
// A provider timeout or 5xx is worth trying again. A rejected address or an
// invalid payload is not: it will fail identically forever, so it is parked for
// a human instead of burning attempts. The schedule and the cap live here so the
// send function, the retry worker, the unit tests and the build guard all read
// the same numbers.

export interface RetryableTemplateSpec {
  /** Table the worker re-reads to rebuild the payload. */
  sourceTable: string;
  /** Key on the send metadata that carries the source reference. */
  metadataKey: string;
  /**
   * Where that reference is stored on the retry row. Stripe checkout ids are
   * not uuids, so they live in the text `source_ref` column instead.
   */
  refColumn: "source_id" | "source_ref";
}

/**
 * Templates whose payload can be rebuilt from a stored source row, and are
 * therefore safe to retry automatically. A retry re-renders the email from the
 * database, so a template can only be listed once the worker knows where to
 * read its data from.
 */
export const RETRYABLE_TEMPLATES: Record<string, RetryableTemplateSpec> = {
  "starter-kit-report": {
    sourceTable: "starter_kit_reports",
    metadataKey: "starter_kit_report_id",
    refColumn: "source_id",
  },
  // Purchase confirmation for the AI Business Audit. Rebuilt from the audit row
  // plus its access token, so the magic link stays valid.
  "audit-purchase-confirmation": {
    sourceTable: "business_audits",
    metadataKey: "audit_id",
    refColumn: "source_id",
  },
  // The "what to do now" email. Rebuilt from the paid order behind the Stripe
  // checkout session, so the booking tier and links are recomputed, not reused.
  "purchase-next-steps": {
    sourceTable: "one_time_orders",
    metadataKey: "session_id",
    refColumn: "source_ref",
  },
};

export function isRetryableTemplate(templateName: string): boolean {
  return Object.prototype.hasOwnProperty.call(RETRYABLE_TEMPLATES, templateName);
}

/**
 * Pulls the source reference for a template out of a send's metadata, and says
 * which retry-row column it belongs in. Returns null when the caller did not
 * record one, in which case the row can be seen but never rebuilt.
 */
export function sourceRefFromMetadata(
  templateName: string,
  metadata: Record<string, unknown> | null | undefined,
): { column: "source_id" | "source_ref"; value: string } | null {
  const spec = RETRYABLE_TEMPLATES[templateName];
  if (!spec) return null;
  const raw = metadata?.[spec.metadataKey];
  if (typeof raw !== "string" || raw.trim() === "") return null;
  return { column: spec.refColumn, value: raw };
}

/** Delay before attempt N (1-indexed), in milliseconds. */
export const RETRY_BACKOFF_MS = [
  5 * 60_000, //      attempt 1: 5 minutes after the failure
  30 * 60_000, //     attempt 2: 30 minutes later
  2 * 3_600_000, //   attempt 3: 2 hours later
  6 * 3_600_000, //   attempt 4: 6 hours later
];

export const MAX_RETRY_ATTEMPTS = RETRY_BACKOFF_MS.length;

/**
 * Next state for a retry row after `attemptsSoFar` completed attempts.
 * Returns null once the cap is reached, meaning: stop, mark exhausted.
 */
export function nextRetryAt(attemptsSoFar: number, from: Date = new Date()): Date | null {
  if (attemptsSoFar < 0) return null;
  if (attemptsSoFar >= MAX_RETRY_ATTEMPTS) return null;
  return new Date(from.getTime() + RETRY_BACKOFF_MS[attemptsSoFar]);
}

/**
 * Whether a failed send should be queued for automatic retry, and in what
 * state. `parked` rows are visible to admins but never retried.
 */
export function retryDecisionFor(
  templateName: string,
  failureClass: "permanent" | "retryable",
): { enqueue: boolean; status: "pending" | "parked" } {
  if (!isRetryableTemplate(templateName)) return { enqueue: false, status: "parked" };
  if (failureClass === "permanent") return { enqueue: true, status: "parked" };
  return { enqueue: true, status: "pending" };
}
