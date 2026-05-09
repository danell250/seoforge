import { extractJson } from "./gemini";

const GROQ_API_KEY = process.env["GROQ_API_KEY"];
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const SEO_SYSTEM_PROMPT = `You are an expert SEO and AEO engineer with 15 years experience. You know every Google algorithm update, every schema type on schema.org, every technical SEO requirement, and every AEO strategy for winning Google AI Overviews, Perplexity, and voice search results. You know South African, Nigerian, Kenyan and broader African market search behaviour. You optimize for both English and multilingual African content. When given HTML code you return a fully optimized version with every SEO and AEO improvement applied. You never give advice — you only return fixed, production-ready code with a bullet list of changes made.`;

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function isGroqAvailable(): boolean {
  return !!GROQ_API_KEY;
}

export async function generateContentWithGroq(
  messages: GroqMessage[],
  model = "llama-3.1-70b-versatile",
  temperature = 0.3,
  maxTokens = 8192,
  timeoutMs = 45_000,
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is required but was not provided.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as GroqResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Groq returned no choices in response");
    }

    return data.choices[0].message.content;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Groq request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

export async function generateSeoaxeOptimization(
  systemPrompt: string,
  userPrompt: string,
  html: string | null,
  timeoutMs = 45_000,
): Promise<string> {
  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  let fullUserContent = userPrompt;
  if (html) {
    fullUserContent += `\n\nHTML to optimize:\n\`\`\`html\n${html}\n\`\`\``;
  }

  messages.push({ role: "user", content: fullUserContent });

  // Use Llama 3.1 70B for best SEO optimization quality
  return generateContentWithGroq(
    messages,
    "llama-3.1-70b-versatile",
    0.3, // Lower temperature for consistent output
    8192,
    timeoutMs,
  );
}

export { extractJson };
