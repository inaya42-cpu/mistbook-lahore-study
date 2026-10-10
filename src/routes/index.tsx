import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Mic, Type, FolderTree, TrendingUp, BellRing, BookOpenCheck } from "lucide-react";
import hero from "@/assets/hero.png";
import capture from "@/assets/capture.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mistbook — Mistake book for Punjab Lahore Board Class 11" },
      {
        name: "description",
        content:
          "Snap mistakes, spot patterns, and revise smarter for Lahore Board Punjab Class 11 with Mistbook.",
      },
      { property: "og:title", content: "Mistbook — Your smarter mistake book" },
      {
        property: "og:description",
        content: "Capture Class 11 mistakes with a photo, voice note or text. Mistbook organizes the lesson for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Work+Sans:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Camera, title: "Capture any way", text: "Snap a photo, record a voice note, or type a line. Done in seconds." },
  { icon: FolderTree, title: "Auto-organized", text: "Sorted by subject, chapter, and topic — Physics, Chemistry, Maths, Biology and more." },
  { icon: TrendingUp, title: "See your patterns", text: "Find the errors you keep repeating, before the board exam finds them." },
  { icon: BellRing, title: "Remember next time", text: "Clear, short reminders of what to do differently." },
  { icon: BookOpenCheck, title: "Review on demand", text: "Open your saved mistakes whenever you're ready to revise." },
];

const steps = [
  { icon: Camera, label: "Snap the question" },
  { icon: Mic, label: "Say what went wrong" },
  { icon: Type, label: "Mistbook writes the lesson" },
];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="font-['Fraunces'] text-2xl font-bold text-primary">
          mist<span className="text-amber-brand">book</span>
        </span>
        <Link to="/log" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
          Get started
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2 md:pt-12">
        <div>
          <p className="mb-4 inline-block rounded-full bg-amber-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Lahore Board · Punjab · Class 11
          </p>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
            Snap mistakes. Spot patterns. <span className="underline-sketch">Revise smarter.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Mistbook is your smarter mistake book. Capture the mistake while it's fresh — we organize the lesson for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/log" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90">
              Log your first mistake
            </Link>
            <a href="#features" className="rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground transition hover:bg-secondary">
              See how it works
            </a>
          </div>
        </div>
        <img src={hero} alt="Mistbook app surrounded by Class 11 notes" width={1200} height={1008} className="animate-float-soft w-full rounded-3xl" />
      </section>

      <section id="how" className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold md:text-4xl">No long typing. No messy notebooks.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-brand text-ink">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70">Step {i + 1}</p>
                  <p className="font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <img src={capture} alt="Snapping a physics question with a phone" width={816} height={816} loading="lazy" className="w-full rounded-3xl" />
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">With Mistbook, you can</h2>
            <ul className="mt-8 space-y-4">
              {features.map((f) => (
                <li key={f.title} className="paper-card flex gap-4 p-4">
                  <f.icon className="mt-1 h-5 w-5 shrink-0 text-amber-brand" />
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <div className="paper-card px-6 py-12">
          <h2 className="text-3xl font-bold md:text-4xl">
            Your job is simple: <span className="underline-sketch">log the mistake.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Mistbook helps turn it into a better revision habit.</p>
          <Link to="/log" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90">
            Start your mistake book
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © 2026 Mistbook · Made for Punjab Board students
      </footer>
    </main>
  );
}
