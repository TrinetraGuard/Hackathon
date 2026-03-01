/**
 * Google Gemini API for AI chat. Uses VITE_GEMINI_API_KEY from .env.
 * Enable "Generative Language API" in Google Cloud and create an API key.
 */

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim();

// Try these in order; first success wins. v1beta has newer models, v1 has gemini-pro.
const MODEL_ATTEMPTS: { url: string }[] = [
  { url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" },
  { url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent" },
  { url: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent" },
];

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

async function doRequest(url: string, body: string): Promise<Response> {
  return fetch(`${url}?key=${encodeURIComponent(API_KEY!)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
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

  const body = JSON.stringify({
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  let lastError: string | null = null;
  for (const { url } of MODEL_ATTEMPTS) {
    const res = await doRequest(url, body);
    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string };
      };
      if (data.error?.message) {
        lastError = data.error.message;
        continue;
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return text.trim();
    }
    const errText = await res.text();
    if (res.status === 404) {
      lastError = errText;
      continue;
    }
    throw new Error(errText || `Gemini API error: ${res.status}`);
  }
  throw new Error(lastError || "No Gemini model available. Check VITE_GEMINI_API_KEY and enabled APIs.");
}
