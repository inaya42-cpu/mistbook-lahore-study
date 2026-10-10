import { supabase } from "@/integrations/supabase/client";

export type Mistake = {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  whatWentWrong: string;
  rememberNext: string;
  photo?: string | undefined; // data URL
  voice?: string | undefined; // data URL
  createdAt: number;
  analysis?: { misconception: string; correctedReasoning: string; takeaway: string } | undefined;
  review?: { box: number; dueAt: number } | undefined;
};

const KEY = "mistbook.mistakes.v1";

export const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Urdu", "Computer Science", "Other"] as const;

type Row = {
  id: string; subject: string; chapter: string; topic: string; what_went_wrong: string; remember_next: string;
  photo: string | null; voice: string | null; analysis: unknown; review: unknown; created_at: string;
};

const fromRow = (r: Row): Mistake => ({
  id: r.id, subject: r.subject, chapter: r.chapter, topic: r.topic, whatWentWrong: r.what_went_wrong,
  rememberNext: r.remember_next, photo: r.photo ?? undefined, voice: r.voice ?? undefined,
  createdAt: new Date(r.created_at).getTime(),
  analysis: (r.analysis as Mistake["analysis"]) ?? undefined, review: (r.review as Mistake["review"]) ?? undefined,
});

const toRow = (m: Mistake) => ({
  id: m.id, subject: m.subject, chapter: m.chapter, topic: m.topic, what_went_wrong: m.whatWentWrong,
  remember_next: m.rememberNext, photo: m.photo ?? null, voice: m.voice ?? null,
  analysis: m.analysis ?? null, review: m.review ?? null, created_at: new Date(m.createdAt).toISOString(),
});

export async function fetchMistakes(): Promise<Mistake[]> {
  const { data, error } = await supabase.from("mistakes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function upsertMistake(m: Mistake) {
  const { error } = await supabase.from("mistakes").upsert(toRow(m) as never);
  if (error) throw error;
}

export async function deleteMistake(id: string) {
  const { error } = await supabase.from("mistakes").delete().eq("id", id);
  if (error) throw error;
}

// One-time move of mistakes saved on this device into the signed-in account.
export async function migrateLocalMistakes() {
  if (typeof window === "undefined") return 0;
  let list: Mistake[] = [];
  try { list = JSON.parse(window.localStorage.getItem(KEY) || "[]") as Mistake[]; } catch { return 0; }
  if (!list.length) return 0;
  const { error } = await supabase.from("mistakes").upsert(list.map(toRow) as never);
  if (error) throw error;
  window.localStorage.removeItem(KEY);
  return list.length;
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
