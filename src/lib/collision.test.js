import { describe, it, expect } from "vitest";
import { layoutDay, toMinutes, toHHMM } from "./collision.js";

const ev = (id, start, end) => ({ id, start, end });

describe("layoutDay (collision layout)", () => {
  it("gives a lone event the full width", () => {
    const r = layoutDay([ev("a", 540, 600)]);
    expect(r.a).toEqual({ col: 0, cols: 1, left: 0, width: 1 });
  });

  it("sequential, non-overlapping events each get full width", () => {
    const r = layoutDay([ev("a", 540, 600), ev("b", 600, 660)]);
    expect(r.a.width).toBe(1);
    expect(r.b.width).toBe(1);
  });

  it("two overlapping events split into two half-width columns", () => {
    const r = layoutDay([ev("a", 540, 660), ev("b", 600, 720)]);
    expect(r.a).toEqual({ col: 0, cols: 2, left: 0, width: 0.5 });
    expect(r.b).toEqual({ col: 1, cols: 2, left: 0.5, width: 0.5 });
  });

  it("reuses a freed column (A–B overlap, C after A) => 2 columns", () => {
    // A 9:00-10:00, B 9:30-10:30 (overlaps A), C 10:00-11:00 (overlaps B, not A)
    const r = layoutDay([
      ev("a", 540, 600),
      ev("b", 570, 630),
      ev("c", 600, 660),
    ]);
    expect(r.a.cols).toBe(2);
    expect(r.b.cols).toBe(2);
    expect(r.c.cols).toBe(2);
    expect(r.a.col).toBe(0);
    expect(r.b.col).toBe(1);
    expect(r.c.col).toBe(0); // C reuses A's column since A has ended
  });

  it("three mutually overlapping events => three thirds", () => {
    const r = layoutDay([
      ev("a", 540, 660),
      ev("b", 550, 670),
      ev("c", 560, 680),
    ]);
    expect(r.a.cols).toBe(3);
    expect(r.c.width).toBeCloseTo(1 / 3);
  });

  it("separate clusters are laid out independently", () => {
    // cluster 1: a,b overlap; cluster 2: c alone later
    const r = layoutDay([
      ev("a", 540, 600),
      ev("b", 550, 610),
      ev("c", 700, 760),
    ]);
    expect(r.a.cols).toBe(2);
    expect(r.c.cols).toBe(1);
  });
});

describe("time conversion", () => {
  it("round-trips HH:MM <-> minutes", () => {
    expect(toMinutes("09:30")).toBe(570);
    expect(toMinutes("00:00")).toBe(0);
    expect(toHHMM(570)).toBe("09:30");
    expect(toHHMM(0)).toBe("00:00");
  });
});
