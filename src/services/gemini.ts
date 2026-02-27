/**
 * Google Gemini API for AI chat. Uses VITE_GEMINI_API_KEY from .env.
 * Enable "Generative Language API" in Google Cloud and create an API key.
 */

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim();
// Use gemini-1.5-flash for broad compatibility; or gemini-2.0-flash when available
const MODEL = "gemini-1.5-flash";
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function generateContent(
  userText: string,
  options?: { systemPrompt?: string; history?: GeminiMessage[] }
): Promise<string> {
  if (!API_KEY) throw new Error("Add VITE_GEMINI_API_KEY to .env");
  const contents: { role: string; parts: { text: string }[] }[] = [];
  if (options?.systemPrompt) {
    contents.push({ role: "user", parts: [{ text: `System: ${options.systemPrompt}` }] });
    contents.push({ role: "model", parts: [{ text: "Understood. I will follow the system instructions." }] });
  }
  (options?.history ?? []).forEach((m) => {
    contents.push({ role: m.role === "user" ? "user" : "model", parts: m.parts });
  });
  contents.push({ role: "user", parts: [{ text: userText }] });

  const res = await fetch(`${BASE}?key=${encodeURIComponent(API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Gemini API error: ${res.status}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };
  if (data.error?.message) throw new Error(data.error.message);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text.trim();
}
