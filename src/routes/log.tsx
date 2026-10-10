import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Mic, Square, Trash2, ArrowLeft, Plus } from "lucide-react";
import { loadMistakes, saveMistakes, fileToDataUrl, SUBJECTS, type Mistake } from "@/lib/mistakes";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Mistbook — Your mistake log" },
      { name: "description", content: "Log and review your Class 11 mistakes by subject, chapter and topic." },
    ],
  }),
  component: MistakeLog,
});

function MistakeLog() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [wrong, setWrong] = useState("");
  const [remember, setRemember] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [voice, setVoice] = useState<string | undefined>();
  const [recording, setRecording] = useState(false);
  const [filter, setFilter] = useState("All");
  const recRef = useRef<MediaRecorder | null>(null);

  useEffect(() => setMistakes(loadMistakes()), []);

  const persist = (list: Mistake[]) => {
    setMistakes(list);
    saveMistakes(list);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setVoice(await fileToDataUrl(new Blob(chunks, { type: rec.mimeType })));
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      alert("Microphone not available — you can type instead.");
    }
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const addMistake = () => {
    if (!wrong.trim()) return;
    const m: Mistake = {
      id: crypto.randomUUID(),
      subject,
      chapter: chapter.trim(),
      topic: topic.trim(),
      whatWentWrong: wrong.trim(),
      rememberNext: remember.trim(),
      photo,
      voice,
      createdAt: Date.now(),
    };
    persist([m, ...mistakes]);
    setChapter(""); setTopic(""); setWrong(""); setRemember(""); setPhoto(undefined); setVoice(undefined);
    setOpen(false);
  };

  const shown = filter === "All" ? mistakes : mistakes.filter((m) => m.subject === filter);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <span className="font-['Fraunces'] text-xl font-bold text-primary">mist<span className="text-amber-brand">book</span></span>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My mistakes</h1>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" /> Log mistake
          </button>
        </div>

        {open && (
          <div className="paper-card mt-6 space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Subject</span>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-input bg-card px-3 py-2">
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Chapter</span>
                <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g. Ch 3 — Vectors" className="w-full rounded-lg border border-input bg-card px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Topic</span>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Dot product" className="w-full rounded-lg border border-input bg-card px-3 py-2" />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">What went wrong? *</span>
              <textarea value={wrong} onChange={(e) => setWrong(e.target.value)} rows={3} placeholder="Forgot to convert km/h to m/s…" className="w-full rounded-lg border border-input bg-card px-3 py-2" />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">Remember next time</span>
              <input value={remember} onChange={(e) => setRemember(e.target.value)} placeholder="Always check units first" className="w-full rounded-lg border border-input bg-card px-3 py-2" />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm">
                <Camera className="h-4 w-4" /> {photo ? "Photo added ✓" : "Snap photo"}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setPhoto(await fileToDataUrl(f));
                }} />
              </label>
              <button type="button" onClick={recording ? stopRecording : startRecording} className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm">
                {recording ? <Square className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
                {recording ? "Stop recording" : voice ? "Voice note ✓" : "Voice note"}
              </button>
              {voice && <audio controls src={voice} className="h-9" />}
            </div>
            {photo && <img src={photo} alt="Mistake photo" className="max-h-48 rounded-lg border border-border" />}

            <button onClick={addMistake} disabled={!wrong.trim()} className="rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground disabled:opacity-40">
              Save mistake
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {["All", ...SUBJECTS].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-sm ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {s}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">
            No mistakes yet. Log your first one — your future self will thank you. 📓
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {shown.map((m) => (
              <li key={m.id} className="paper-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-brand">{m.subject}</p>
                    <p className="text-sm text-muted-foreground">{[m.chapter, m.topic].filter(Boolean).join(" · ")}</p>
                  </div>
                  <button onClick={() => persist(mistakes.filter((x) => x.id !== m.id))} aria-label="Delete" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 font-medium">{m.whatWentWrong}</p>
                {m.rememberNext && (
                  <p className="mt-2 rounded-lg bg-amber-soft px-3 py-2 text-sm">💡 {m.rememberNext}</p>
                )}
                {m.photo && <img src={m.photo} alt="Mistake" className="mt-3 max-h-56 rounded-lg border border-border" />}
                {m.voice && <audio controls src={m.voice} className="mt-3 h-9 w-full" />}
                <p className="mt-3 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
