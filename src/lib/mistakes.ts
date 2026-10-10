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

export function loadMistakes(): Mistake[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Mistake[]) : [];
  } catch {
    return [];
  }
}

export function saveMistakes(list: Mistake[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
