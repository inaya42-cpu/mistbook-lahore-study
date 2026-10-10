import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { fetchMistakes } from "@/lib/mistakes";
import { buildPlan, type PlanItem } from "@/lib/planner";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Mistbook — Revision planner" },
      { name: "description", content: "See which Class 11 chapters and topics to revise next, based on your most repeated mistakes." },
      { property: "og:title", content: "Mistbook — Revision planner" },
      { property: "og:description", content: "Revise the chapters you slip on most, first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planner,
});

function Planner() {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  useEffect(() => { fetchMistakes().then((l) => setPlan(buildPlan(l, Date.now()))).catch(() => {}); }, []);
  const max = plan[0]?.score ?? 1;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-5">
        <Link to="/log" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> My mistakes
        </Link>
      </header>
      <div className="mx-auto max-w-2xl px-5 pb-24">
        <h1 className="text-3xl font-bold">Revise next</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ranked by how often you repeat a mistake, how many you still forget in review, and how recent they are.</p>
        {plan.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">Log a few mistakes and your plan will appear here.</p>
        ) : (
          <ol className="mt-6 space-y-3">
            {plan.map((p, i) => (
              <li key={`${p.subject}-${p.chapter}-${p.topic}`} className="paper-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-brand">#{i + 1} · {p.subject}</p>
                    <p className="font-medium">{p.chapter}</p>
                    <p className="text-sm text-muted-foreground">{p.topic}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{p.count} mistake{p.count > 1 ? "s" : ""}</p>
                    <p>{p.weak} still weak</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-secondary">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(p.score / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
