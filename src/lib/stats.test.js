import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { last7Dates, weeklyStats } from "./stats.js";
import { toDateStr } from "./date.js";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

describe("weekly stats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("last7Dates returns 7 dates, oldest first, ending today", () => {
    const dates = last7Dates();
    expect(dates).toHaveLength(7);
    expect(dates[6]).toBe("2026-07-22");
    expect(dates[0]).toBe("2026-07-16");
  });

  it("sums only this week's focus minutes", () => {
    const sessions = [
      { minutes: 25, date: daysAgo(0) },
      { minutes: 25, date: daysAgo(3) },
      { minutes: 25, date: daysAgo(10) }, // outside the week → ignored
    ];
    expect(weeklyStats(sessions, [], []).focusMinutes).toBe(50);
  });

  it("counts all completed tasks regardless of date", () => {
    const tasks = [{ done: true }, { done: false }, { done: true }];
    expect(weeklyStats([], tasks, []).tasksDone).toBe(2);
  });

  it("counts distinct habits active this week", () => {
    const logs = [
      { habitId: "a", date: daysAgo(0), count: 1 },
      { habitId: "a", date: daysAgo(1), count: 2 }, // same habit, still 1 distinct
      { habitId: "b", date: daysAgo(2), count: 1 },
      { habitId: "c", date: daysAgo(20), count: 1 }, // old → ignored
    ];
    expect(weeklyStats([], [], logs).activeHabits).toBe(2);
  });
});
