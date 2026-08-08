import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Poll a refresh callback only while there is genuinely something to watch.
 *
 * The rules exist to keep an admin page honest and cheap:
 * - nothing polls unless the caller says work is in flight
 * - a hidden tab polls nothing at all
 * - a poll never overlaps a user action or a previous poll
 * - polling gives up after a bounded stretch, because the backing worker runs
 *   on a schedule and watching longer cannot change the answer
 */
export type LiveRefreshState =
  | "idle"
  | "polling"
  | "reconnecting"
  | "paused-hidden"
  | "paused-manual"
  | "paused-timeout"
  | "settled";

export interface UseLiveRefreshOptions {
  /** Returns true when the read succeeded. Failures drive the retry counter. */
  refresh: () => Promise<boolean>;
  /** True when at least one thing on screen can still change. */
  active: boolean;
  /** False when there is nothing loaded to refresh at all. */
  enabled?: boolean;
  /** True while a user-initiated request is running. Polls are skipped. */
  isBusy?: boolean;
  intervalMs?: number;
  /** Total polling time before giving up. Counted only while actually polling. */
  maxDurationMs?: number;
  /** Consecutive failures tolerated before pausing. */
  maxFailures?: number;
  /** Called once when the failure limit pauses polling. */
  onFailureLimit?: () => void;
}

export interface UseLiveRefreshResult {
  state: LiveRefreshState;
  isPolling: boolean;
  /** Consecutive failed polls. Zero once a poll succeeds. */
  failures: number;
  pause: () => void;
  resume: () => void;
}

export function useLiveRefresh({
  refresh,
  active,
  enabled = true,
  isBusy = false,
  intervalMs = 5000,
  maxDurationMs = 300_000,
  maxFailures = 3,
  onFailureLimit,
}: UseLiveRefreshOptions): UseLiveRefreshResult {
  const [manualPaused, setManualPaused] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [failures, setFailures] = useState(0);
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );

  // Refs so a changing callback or a changing busy flag never tears down and
  // restarts the interval, which would reset the cadence on every render.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const isBusyRef = useRef(isBusy);
  isBusyRef.current = isBusy;
  const onFailureLimitRef = useRef(onFailureLimit);
  onFailureLimitRef.current = onFailureLimit;

  const inFlightRef = useRef(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  // A fresh stretch of work restarts the budget, so a settled page that later
  // gets a new pending row is watched again rather than staying timed out.
  useEffect(() => {
    if (active) {
      elapsedRef.current = 0;
      setTimedOut(false);
    }
  }, [active]);

  const shouldPoll = enabled && active && visible && !manualPaused && !timedOut;

  useEffect(() => {
    if (!shouldPoll) return;

    const id = setInterval(() => {
      elapsedRef.current += intervalMs;
      if (elapsedRef.current >= maxDurationMs) {
        setTimedOut(true);
        return;
      }
      // Never stack a poll on top of a user action or an unfinished poll.
      if (isBusyRef.current || inFlightRef.current) return;

      inFlightRef.current = true;
      void refreshRef.current()
        .then((ok) => {
          if (ok) {
            setFailures(0);
            return;
          }
          setFailures((n) => {
            const next = n + 1;
            if (next >= maxFailures) {
              setManualPaused(true);
              onFailureLimitRef.current?.();
            }
            return next;
          });
        })
        .catch(() => {
          setFailures((n) => {
            const next = n + 1;
            if (next >= maxFailures) {
              setManualPaused(true);
              onFailureLimitRef.current?.();
            }
            return next;
          });
        })
        .finally(() => {
          inFlightRef.current = false;
        });
    }, intervalMs);

    return () => clearInterval(id);
  }, [shouldPoll, intervalMs, maxDurationMs, maxFailures]);

  const pause = useCallback(() => setManualPaused(true), []);
  const resume = useCallback(() => {
    elapsedRef.current = 0;
    setFailures(0);
    setTimedOut(false);
    setManualPaused(false);
  }, []);

  let state: LiveRefreshState;
  if (manualPaused) state = "paused-manual";
  else if (timedOut) state = "paused-timeout";
  else if (!enabled) state = "idle";
  else if (!active) state = "settled";
  else if (!visible) state = "paused-hidden";
  else if (failures > 0) state = "reconnecting";
  else state = "polling";

  return { state, isPolling: shouldPoll, failures, pause, resume };
}
