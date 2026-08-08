// Retry policy for transactional email that failed on the provider's side.
//
// A provider timeout or 5xx is worth trying again. A rejected address or an
// invalid payload is not: it will fail identically forever, so it is parked for
// a human instead of burning attempts. The schedule and the cap live here so the
// send function, the retry worker, the unit tests and the build guard all read
// the same numbers.

/**
 * Templates whose payload can be rebuilt from a stored source row, and are
 * therefore safe to retry automatically. A retry re-renders the email from the
 * database, so a template can only be listed once the worker knows where to
 * read its data from.
 */
export const RETRYABLE_TEMPLATES: Record<string, { sourceTable: string; metadataKey: string }> = {
  "starter-kit-report": {
    sourceTable: "starter_kit_reports",
    metadataKey: "starter_kit_report_id",
  },
};

export function isRetryableTemplate(templateName: string): boolean {
  return Object.prototype.hasOwnProperty.call(RETRYABLE_TEMPLATES, templateName);
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
