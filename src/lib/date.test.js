import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  toDateStr,
  todayStr,
  daysUntil,
  urgencyClass,
  daysLabel,
} from "./date.js";

// daysUntil / todayStr depend on "now", so we freeze the clock. Everything is
// computed relative to a fixed noon on 2026-07-22 to stay timezone-stable.
describe("date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 22, 12, 0, 0)); // month is 0-indexed → July
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("toDateStr zero-pads month and day", () => {
    expect(toDateStr(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateStr(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("todayStr returns the frozen date", () => {
    expect(todayStr()).toBe("2026-07-22");
  });

  it("daysUntil counts whole days, negative when overdue", () => {
    expect(daysUntil("2026-07-22")).toBe(0);
    expect(daysUntil("2026-07-23")).toBe(1);
    expect(daysUntil("2026-07-25")).toBe(3);
    expect(daysUntil("2026-07-20")).toBe(-2);
    expect(daysUntil("")).toBeNull();
    expect(daysUntil(null)).toBeNull();
  });

  it("urgencyClass buckets days into severity levels", () => {
    expect(urgencyClass(null)).toBe("");
    expect(urgencyClass(-1)).toBe("overdue");
    expect(urgencyClass(0)).toBe("urgent");
    expect(urgencyClass(1)).toBe("urgent");
    expect(urgencyClass(2)).toBe("soon");
    expect(urgencyClass(3)).toBe("soon");
    expect(urgencyClass(4)).toBe("later");
  });

  it("daysLabel is human-readable", () => {
    expect(daysLabel(null)).toBe("No date");
    expect(daysLabel(-2)).toBe("2d overdue");
    expect(daysLabel(0)).toBe("Due today");
    expect(daysLabel(1)).toBe("Due tomorrow");
    expect(daysLabel(5)).toBe("5d left");
  });
});
