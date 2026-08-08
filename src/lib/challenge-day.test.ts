import { describe, expect, it } from "vitest";
import { deriveChallengeDay, resolveChallengeDay } from "./challenge-day";

const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe("deriveChallengeDay", () => {
  it("starts on day 1", () => {
    expect(deriveChallengeDay(day(2026, 8, 1), 7, day(2026, 8, 1, 23))).toBe(1);
  });

  it("rolls at local midnight, not 24 hours later", () => {
    expect(deriveChallengeDay(day(2026, 8, 1, 23), 7, day(2026, 8, 2, 1))).toBe(2);
  });

  it("tracks the calendar across many days", () => {
    expect(deriveChallengeDay(day(2026, 8, 1), 30, day(2026, 8, 10))).toBe(10);
  });

  it("clamps at the challenge duration", () => {
    expect(deriveChallengeDay(day(2026, 8, 1), 7, day(2026, 9, 1))).toBe(7);
  });

  it("never returns less than 1 for a future or invalid anchor", () => {
    expect(deriveChallengeDay(day(2026, 8, 5), 7, day(2026, 8, 1))).toBe(1);
    expect(deriveChallengeDay(0, 7)).toBe(1);
    expect(deriveChallengeDay(Number.NaN, 7)).toBe(1);
  });
});

describe("resolveChallengeDay", () => {
  it("uses the calendar day when no entries exist", () => {
    expect(resolveChallengeDay(day(2026, 8, 1), {}, 7, day(2026, 8, 3))).toBe(3);
  });

  it("never sends someone back behind work they already logged", () => {
    expect(resolveChallengeDay(day(2026, 8, 1), { 1: "a", 5: "b" }, 7, day(2026, 8, 2))).toBe(5);
  });

  it("ignores non-day keys like the kickoff entry", () => {
    expect(resolveChallengeDay(day(2026, 8, 1), { 0: "kickoff", 1: "a" }, 7, day(2026, 8, 2))).toBe(2);
  });

  it("ignores entries beyond the duration", () => {
    expect(resolveChallengeDay(day(2026, 8, 1), { 30: "x" }, 7, day(2026, 8, 2))).toBe(2);
  });

  it("stays clamped to the duration once the calendar runs past it", () => {
    expect(resolveChallengeDay(day(2026, 8, 1), { 7: "x" }, 7, day(2026, 9, 1))).toBe(7);
  });
});