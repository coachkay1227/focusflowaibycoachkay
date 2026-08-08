import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLiveRefresh } from "./use-live-refresh";

const INTERVAL = 5000;

function setVisibility(value: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => value,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useLiveRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibility("visible");
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };

  it("does not poll when there is no work in flight", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useLiveRefresh({ refresh, active: false, intervalMs: INTERVAL }),
    );
    await advance(INTERVAL * 4);
    expect(refresh).not.toHaveBeenCalled();
    expect(result.current.state).toBe("settled");
  });

  it("does not poll when nothing is loaded", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useLiveRefresh({ refresh, active: true, enabled: false, intervalMs: INTERVAL }),
    );
    await advance(INTERVAL * 2);
    expect(refresh).not.toHaveBeenCalled();
    expect(result.current.state).toBe("idle");
  });

  it("polls on the interval while work is in flight", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useLiveRefresh({ refresh, active: true, intervalMs: INTERVAL }),
    );
    expect(result.current.state).toBe("polling");
    await advance(INTERVAL * 3);
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("stops polling once the work settles", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) =>
        useLiveRefresh({ refresh, active, intervalMs: INTERVAL }),
      { initialProps: { active: true } },
    );
    await advance(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(1);

    rerender({ active: false });
    await advance(INTERVAL * 3);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe("settled");
  });

  it("pauses on a hidden tab and resumes when visible again", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useLiveRefresh({ refresh, active: true, intervalMs: INTERVAL }),
    );

    await act(async () => {
      setVisibility("hidden");
    });
    expect(result.current.state).toBe("paused-hidden");
    await advance(INTERVAL * 3);
    expect(refresh).not.toHaveBeenCalled();

    await act(async () => {
      setVisibility("visible");
    });
    await advance(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("skips a poll while a user action is running", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { rerender } = renderHook(
      ({ isBusy }: { isBusy: boolean }) =>
        useLiveRefresh({ refresh, active: true, isBusy, intervalMs: INTERVAL }),
      { initialProps: { isBusy: true } },
    );
    await advance(INTERVAL * 2);
    expect(refresh).not.toHaveBeenCalled();

    rerender({ isBusy: false });
    await advance(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("never overlaps two polls", async () => {
    let release: (v: boolean) => void = () => {};
    const refresh = vi.fn(() => new Promise<boolean>((r) => (release = r)));
    renderHook(() => useLiveRefresh({ refresh, active: true, intervalMs: INTERVAL }));

    await advance(INTERVAL * 3);
    expect(refresh).toHaveBeenCalledTimes(1);

    await act(async () => {
      release(true);
    });
    await advance(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("gives up after the max duration", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useLiveRefresh({
        refresh,
        active: true,
        intervalMs: INTERVAL,
        maxDurationMs: INTERVAL * 3,
      }),
    );
    await advance(INTERVAL * 5);
    expect(result.current.state).toBe("paused-timeout");
    expect(refresh).toHaveBeenCalledTimes(2);

    act(() => result.current.resume());
    await advance(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("reports reconnecting then pauses after three consecutive failures", async () => {
    const refresh = vi.fn().mockResolvedValue(false);
    const onFailureLimit = vi.fn();
    const { result } = renderHook(() =>
      useLiveRefresh({ refresh, active: true, intervalMs: INTERVAL, onFailureLimit }),
    );

    await advance(INTERVAL);
    expect(result.current.state).toBe("reconnecting");

    await advance(INTERVAL * 2);
    expect(result.current.state).toBe("paused-manual");
    expect(onFailureLimit).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(3);

    await advance(INTERVAL * 3);
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("clears the failure count once a poll succeeds", async () => {
    const refresh = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
    const { result } = renderHook(() =>
      useLiveRefresh({ refresh, active: true, intervalMs: INTERVAL }),
    );
    await advance(INTERVAL);
    expect(result.current.state).toBe("reconnecting");
    await advance(INTERVAL);
    expect(result.current.state).toBe("polling");
  });

  it("honours a manual pause and resume", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useLiveRefresh({ refresh, active: true, intervalMs: INTERVAL }),
    );
    act(() => result.current.pause());
    expect(result.current.state).toBe("paused-manual");
    await advance(INTERVAL * 3);
    expect(refresh).not.toHaveBeenCalled();

    act(() => result.current.resume());
    await advance(INTERVAL);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("clears its timer on unmount", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const { unmount } = renderHook(() =>
      useLiveRefresh({ refresh, active: true, intervalMs: INTERVAL }),
    );
    unmount();
    await advance(INTERVAL * 3);
    expect(refresh).not.toHaveBeenCalled();
  });
});
