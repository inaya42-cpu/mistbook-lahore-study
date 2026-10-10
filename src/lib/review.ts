// Spaced review: Leitner-style boxes. Intervals in days per box.
export const INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
const DAY = 86_400_000;

export type ReviewState = { box: number; dueAt: number };

export function initialReview(now: number): ReviewState {
  return { box: 0, dueAt: now + INTERVALS_DAYS[0] * DAY };
}

export function nextReview(state: ReviewState | undefined, remembered: boolean, now: number): ReviewState {
  const box = remembered ? Math.min((state?.box ?? -1) + 1, INTERVALS_DAYS.length - 1) : 0;
  return { box, dueAt: now + (INTERVALS_DAYS[box] ?? 30) * DAY };
}

export function isDue(state: ReviewState | undefined, createdAt: number, now: number): boolean {
  return (state?.dueAt ?? initialReview(createdAt).dueAt) <= now;
}
