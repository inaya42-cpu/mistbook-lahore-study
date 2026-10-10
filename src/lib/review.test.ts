import { describe, it, expect } from "vitest";
import { nextReview, isDue, initialReview } from "./review";

const DAY = 86_400_000;

describe("spaced review", () => {
  it("new mistake is due one day after saving", () => {
    expect(initialReview(0).dueAt).toBe(DAY);
    expect(isDue(undefined, 0, DAY - 1)).toBe(false);
    expect(isDue(undefined, 0, DAY)).toBe(true);
  });
  it("remembering moves through 1, 3, 7, 14, 30 days", () => {
    let s = initialReview(0);
    const gaps = [3, 7, 14, 30, 30].map(() => {
      s = nextReview(s, true, 0);
      return s.dueAt / DAY;
    });
    expect(gaps).toEqual([3, 7, 14, 30, 30]);
  });
  it("forgetting resets to one day", () => {
    expect(nextReview({ box: 3, dueAt: 0 }, false, 0).dueAt).toBe(DAY);
  });
});
