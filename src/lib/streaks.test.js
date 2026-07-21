import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { level, computeStreaks } from "./streaks.js";
import { toDateStr } from "./date.js";

// Helper: date string N days before the frozen "today".
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

describe("level (heatmap intensity buckets)", () => {
  it("maps counts to 0-4", () => {
    expect(level(0)).toBe(0);
    expect(level(undefined)).toBe(0);
    expect(level(1)).toBe(1);
    expect(level(2)).toBe(2);
    expect(level(3)).toBe(3);
    expect(level(4)).toBe(3);
    expect(level(5)).toBe(4);
    expect(level(100)).toBe(4);
  });
});

describe("computeStreaks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("empty history has no streak", () => {
    expect(computeStreaks({})).toEqual({ current: 0, longest: 0 });
  });

  it("counts consecutive days ending today", () => {
    const byDate = { [daysAgo(0)]: 1, [daysAgo(1)]: 2, [daysAgo(2)]: 1 };
    expect(computeStreaks(byDate)).toEqual({ current: 3, longest: 3 });
  });

  it("does not break the current streak when today is empty", () => {
    // logged yesterday and the day before, nothing today yet
    const byDate = { [daysAgo(1)]: 1, [daysAgo(2)]: 1 };
    expect(computeStreaks(byDate).current).toBe(2);
  });

  it("a gap resets the current streak", () => {
    // done today, but previous entry was 3 days ago → current is just today
    const byDate = { [daysAgo(0)]: 1, [daysAgo(3)]: 1 };
    expect(computeStreaks(byDate).current).toBe(1);
  });

  it("longest can live in the past, separate from current", () => {
    const byDate = {
      [daysAgo(0)]: 1, // current streak = 1
      [daysAgo(5)]: 1,
      [daysAgo(6)]: 1,
      [daysAgo(7)]: 1,
      [daysAgo(8)]: 1, // a 4-day run a week ago
    };
    expect(computeStreaks(byDate)).toEqual({ current: 1, longest: 4 });
  });
});
