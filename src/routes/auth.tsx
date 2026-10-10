import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Mistbook — Sign up or sign in" },
      { name: "description", content: "Create your Mistbook account so your Class 11 mistake log syncs across all your devices." },
      { property: "og:title", content: "Mistbook — Sign up or sign in" },
      { property: "og:description", content: "Your mistake log, on every device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/log` },
      });
      if (error) setMsg({ kind: "error", text: error.message });
      else if (!data.session) setMsg({ kind: "info", text: "Check your email and tap the confirmation link to finish signing up." });
      else navigate({ to: "/log" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ kind: "error", text: error.message });
      else navigate({ to: "/log" });
    }
    setBusy(false);
  };

  const input = "w-full rounded-lg border border-input bg-card px-3 py-2";
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center font-['Fraunces'] text-3xl font-bold text-primary">mist<span className="text-amber-brand">book</span></Link>
        <form onSubmit={submit} className="paper-card mt-6 space-y-4 p-6">
          <h1 className="text-xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          {mode === "signup" && (
            <label className="block text-sm"><span className="mb-1 block font-medium">Name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={input} /></label>
          )}
          <label className="block text-sm"><span className="mb-1 block font-medium">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} /></label>
          <label className="block text-sm"><span className="mb-1 block font-medium">Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={input} /></label>
          {msg && <p className={`text-sm ${msg.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>{msg.text}</p>}
          <button disabled={busy} className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground disabled:opacity-50">
            {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
          </button>
          <button type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMsg(null); }} className="w-full text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </form>
      </div>
    </main>
  );
}
