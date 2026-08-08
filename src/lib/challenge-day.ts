// ============================================================
// Challenge day derivation.
// The day a person is on is a fact about the calendar, not a click
// counter. It is derived from the anchor start date so a returning
// user lands on the right day whether they logged in or not.
// ============================================================

const MS_PER_DAY = 86_400_000;

/** Local-midnight timestamp for a given instant. */
function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Calendar days elapsed since `startedAt`, 1-indexed and clamped to `durationDays`.
 * A challenge started at 11pm rolls to day 2 the next morning, not 24 hours later.
 */
export function deriveChallengeDay(
  startedAt: number,
  durationDays: number,
  now: number = Date.now()
): number {
  if (!Number.isFinite(startedAt) || startedAt <= 0) return 1;
  const elapsed = Math.floor((startOfLocalDay(now) - startOfLocalDay(startedAt)) / MS_PER_DAY);
  const day = elapsed + 1;
  if (day < 1) return 1;
  if (day > durationDays) return durationDays;
  return day;
}

/**
 * Day the UI should show: the calendar day, but never behind the work already
 * logged (someone who wrote day 5 does not get sent back to day 3).
 */
export function resolveChallengeDay(
  startedAt: number,
  entries: Record<number, string> | null | undefined,
  durationDays: number,
  now: number = Date.now()
): number {
  const calendarDay = deriveChallengeDay(startedAt, durationDays, now);
  const answered = Object.keys(entries ?? {})
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= durationDays);
  const highestAnswered = answered.length ? Math.max(...answered) : 0;
  return Math.max(calendarDay, Math.min(highestAnswered, durationDays));
}
