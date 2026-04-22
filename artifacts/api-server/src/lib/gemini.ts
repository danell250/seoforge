import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env["GEMINI_API_KEY"];

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY environment variable is required but was not provided.",
  );
}

export const genAI = new GoogleGenerativeAI(apiKey);

export const SEO_SYSTEM_PROMPT = `You are an expert SEO and AEO engineer with 15 years experience. You know every Google algorithm update, every schema type on schema.org, every technical SEO requirement, and every AEO strategy for winning Google AI Overviews, Perplexity, and voice search results. You know South African, Nigerian, Kenyan and broader African market search behaviour. You optimize for both English and multilingual African content. When given HTML code you return a fully optimized version with every SEO and AEO improvement applied. You never give advice — you only return fixed, production-ready code with a bullet list of changes made.`;

export function getModel(systemInstruction?: string) {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction ?? SEO_SYSTEM_PROMPT,
  });
}

export function extractJson<T = unknown>(text: string): T {
  const trimmed = text.trim();
  // Strip code fences
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : trimmed;
  if (!raw) throw new Error("Empty response");
  return JSON.parse(raw) as T;
}
