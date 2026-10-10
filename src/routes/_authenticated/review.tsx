import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Check, X } from "lucide-react";
import { fetchMistakes, upsertMistake, type Mistake } from "@/lib/mistakes";
import { isDue, nextReview, INTERVALS_DAYS } from "@/lib/review";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: "Mistbook — Review queue" },
      { name: "description", content: "Practice recalling the right approach to your saved Class 11 mistakes on a spaced schedule." },
      { property: "og:title", content: "Mistbook — Review queue" },
      { property: "og:description", content: "Spaced review of your saved mistakes so the right approach sticks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Review,
});

function Review() {
  const [all, setAll] = useState<Mistake[]>([]);
  const [now, setNow] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attempt, setAttempt] = useState("");
  const [done, setDone] = useState(0);

  useEffect(() => { fetchMistakes().then(setAll).catch(() => {}); setNow(Date.now()); }, []);

  const queue = useMemo(() => all.filter((m) => isDue(m.review, m.createdAt, now)), [all, now]);
  const current = queue[0];
  const nextDue = useMemo(() => {
    const times = all.map((m) => m.review?.dueAt ?? m.createdAt + INTERVALS_DAYS[0] * 86_400_000).filter((t) => t > now);
    return times.length ? Math.min(...times) : null;
  }, [all, now]);

  const grade = (remembered: boolean) => {
    if (!current) return;
    const list = all.map((m) => (m.id === current.id ? { ...m, review: nextReview(m.review, remembered, Date.now()) } : m));
    setAll(list);
    const saved = list.find((m) => m.id === current.id);
    if (saved) void upsertMistake(saved);
    setRevealed(false); setAttempt(""); setDone((d) => d + 1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-5">
        <Link to="/log" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> My mistakes
        </Link>
        <span className="text-sm text-muted-foreground">{queue.length} due · {done} reviewed</span>
      </header>

      <div className="mx-auto max-w-2xl px-5 pb-24">
        <h1 className="text-3xl font-bold">Review queue</h1>
        {!current ? (
          <div className="paper-card mt-6 p-6 text-center">
            <p className="text-lg font-medium">All caught up 🎉</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {nextDue ? `Next mistake comes back ${new Date(nextDue).toLocaleString()}.` : "Log a mistake and it will come back here tomorrow."}
            </p>
          </div>
        ) : (
          <div className="paper-card mt-6 space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-brand">{current.subject}</p>
              <p className="text-sm text-muted-foreground">{[current.chapter, current.topic].filter(Boolean).join(" · ")}</p>
            </div>
            {current.photo && <img src={current.photo} alt="Question" className="max-h-72 rounded-lg border border-border" />}
            <p className="font-medium">Last time: {current.whatWentWrong}</p>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">What's the right approach? Try recalling before you peek.</span>
              <textarea value={attempt} onChange={(e) => setAttempt(e.target.value)} rows={3} className="w-full rounded-lg border border-input bg-card px-3 py-2" />
            </label>

            {!revealed ? (
              <button onClick={() => setRevealed(true)} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground">
                <Eye className="h-4 w-4" /> Check my notes
              </button>
            ) : (
              <>
                <div className="space-y-2 rounded-lg border border-border bg-secondary/50 p-3 text-sm">
                  {current.analysis && <p><span className="font-semibold">Misconception:</span> {current.analysis.misconception}</p>}
                  {current.analysis && <p className="whitespace-pre-line"><span className="font-semibold">Corrected reasoning:</span> {current.analysis.correctedReasoning}</p>}
                  {(current.rememberNext || current.analysis?.takeaway) && (
                    <p className="rounded-lg bg-amber-soft px-3 py-2">💡 {current.rememberNext || current.analysis?.takeaway}</p>
                  )}
                  {!current.analysis && !current.rememberNext && <p className="text-muted-foreground">No notes saved for this one yet.</p>}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => grade(true)} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground">
                    <Check className="h-4 w-4" /> I remembered
                  </button>
                  <button onClick={() => grade(false)} className="flex items-center gap-2 rounded-full border border-border bg-secondary px-5 py-2.5 font-medium">
                    <X className="h-4 w-4" /> I forgot — show again tomorrow
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
