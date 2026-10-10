import { describe, it, expect } from "vitest";
import { buildPlan } from "./planner";
import type { Mistake } from "./mistakes";

const mk = (chapter: string, topic: string, createdAt = 0, box = 0): Mistake => ({
  id: Math.random().toString(), subject: "Physics", chapter, topic, whatWentWrong: "x", rememberNext: "", createdAt, review: { box, dueAt: 0 },
});

describe("revision planner", () => {
  it("ranks the most repeated topic first", () => {
    const plan = buildPlan([mk("Vectors", "Dot"), mk("Motion", "Units"), mk("motion", "units"), mk("Motion", "Units")], 100 * 86_400_000);
    expect(plan[0]).toMatchObject({ chapter: "Motion", topic: "Units", count: 3 });
  });
  it("mastered mistakes rank below still-weak ones with equal repeats", () => {
    const plan = buildPlan([mk("A", "a", 0, 3), mk("B", "b", 0, 0)], 100 * 86_400_000);
    expect(plan[0]?.chapter).toBe("B");
  });
});
