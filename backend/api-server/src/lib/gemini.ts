import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env["GEMINI_API_KEY"];
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const SEO_SYSTEM_PROMPT = `You are an expert SEO and AEO engineer with 15 years experience. You know every Google algorithm update, every schema type on schema.org, every technical SEO requirement, and every AEO strategy for winning Google AI Overviews, Perplexity, and voice search results. You know South African, Nigerian, Kenyan and broader African market search behaviour. You optimize for both English and multilingual African content. When given HTML code you return a fully optimized version with every SEO and AEO improvement applied. You never give advice — you only return fixed, production-ready code with a bullet list of changes made.`;

export function getModel(systemInstruction?: string) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY environment variable is required but was not provided.");
  }
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction ?? SEO_SYSTEM_PROMPT,
  });
}

export async function generateContentWithTimeout(
  model: ReturnType<typeof getModel>,
  parts: Parameters<ReturnType<typeof getModel>["generateContent"]>[0],
  timeoutMs = 45_000,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      model.generateContent(parts),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Gemini request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function extractJson<T = unknown>(text: string): T {
  const trimmed = text.trim();
  // Strip code fences
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : trimmed;
  if (!raw) throw new Error("Empty response");
  return JSON.parse(raw) as T;
}
