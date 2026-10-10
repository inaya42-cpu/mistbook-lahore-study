import type { Mistake } from "./mistakes";

export type PlanItem = { subject: string; chapter: string; topic: string; count: number; weak: number; score: number; lastAt: number };

const DAY = 86_400_000;

// Score = repeats ×2 + still-weak (review box 0) ×1 + recency bonus (1 if within 7 days)
export function buildPlan(list: Mistake[], now: number): PlanItem[] {
  const map = new Map<string, PlanItem>();
  for (const m of list) {
    const chapter = m.chapter || "Unspecified chapter";
    const topic = m.topic || "General";
    const k = `${m.subject}|${chapter.toLowerCase()}|${topic.toLowerCase()}`;
    const it = map.get(k) ?? { subject: m.subject, chapter, topic, count: 0, weak: 0, score: 0, lastAt: 0 };
    it.count += 1;
    if ((m.review?.box ?? 0) === 0) it.weak += 1;
    it.lastAt = Math.max(it.lastAt, m.createdAt);
    map.set(k, it);
  }
  const items = [...map.values()].map((i) => ({ ...i, score: i.count * 2 + i.weak + (now - i.lastAt <= 7 * DAY ? 1 : 0) }));
  return items.sort((a, b) => b.score - a.score || b.lastAt - a.lastAt);
}
