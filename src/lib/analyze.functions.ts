import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Analysis = { misconception: string; correctedReasoning: string; takeaway: string };

type Input = { subject: string; chapter: string; topic: string; explanation: string; photo?: string | undefined };

const schema = {
  type: "object",
  properties: {
    misconception: { type: "string" },
    correctedReasoning: { type: "string" },
    takeaway: { type: "string" },
  },
  required: ["misconception", "correctedReasoning", "takeaway"],
  additionalProperties: false,
};

export const analyzeMistake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => {
    if (!d || typeof d.explanation !== "string" || !d.explanation.trim()) throw new Error("Please explain your mistake.");
    if (d.photo && (!d.photo.startsWith("data:image/") || d.photo.length > 8_000_000)) throw new Error("Photo is invalid or too large.");
    return d;
  })
  .handler(async ({ data }): Promise<{ analysis?: Analysis; error?: string }> => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { error: "AI is not configured." };

    const content: unknown[] = [
      {
        type: "input_text",
        text: `Subject: ${data.subject}\nChapter: ${data.chapter || "-"}\nTopic: ${data.topic || "-"}\nStudent's explanation of the mistake: ${data.explanation}`,
      },
    ];
    if (data.photo) content.push({ type: "input_image", image_url: data.photo });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "You are a patient tutor for Class 11 students of the Lahore Board (BISE Lahore, Punjab Textbook Board syllabus). Given a question (possibly a photo) and the student's own explanation of what went wrong, identify the underlying misconception (not just the slip), give clear step-by-step corrected reasoning matching the Punjab textbook approach, and one short memorable takeaway. Use simple English. Keep each field concise.",
        input: [{ role: "user", content }],
        text: { format: { type: "json_schema", name: "mistake_analysis", strict: true, schema } },
      }),
    });

    if (!res.ok || !res.body) {
      let msg = "The AI couldn't analyze this right now.";
      try {
        const j = (await res.json()) as { error?: { message?: string }; message?: string };
        msg = j.error?.message || j.message || msg;
      } catch {}
      if (res.status === 429) msg = "Too many requests — please try again in a minute.";
      if (res.status === 402) msg = "AI credits have run out for this app.";
      console.error("AI gateway error", res.status, msg);
      return { error: msg };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let refusal = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type: string; delta?: string; error?: { message?: string } };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
          else if (ev.type === "response.refusal.delta" && ev.delta) refusal += ev.delta;
          else if (ev.type === "error" || ev.type === "response.failed") return { error: ev.error?.message || "AI analysis failed." };
        } catch {}
      }
    }
    if (refusal) return { error: refusal };
    try {
      return { analysis: JSON.parse(text) as Analysis };
    } catch {
      return { error: "The AI returned an unexpected answer. Please try again." };
    }
  });
