import { extractJson, generateContentWithTimeout, getModel } from "./gemini";
import { generateSeoaxeOptimization, isGroqAvailable, extractJson as groqExtractJson } from "./groq";
import { prepareHtmlForModel } from "./html-processor";

export interface AiLogger {
  error: (object: unknown, message?: string) => void;
  info: (object: unknown, message?: string) => void;
  warn: (object: unknown, message?: string) => void;
}

// Prefer Groq if available, otherwise fallback to Gemini
const USE_GROQ = isGroqAvailable();

interface RunSeoaxeJsonTaskOptions {
  taskName: string;
  taskPrompt: string;
  systemInstruction?: string;
  html?: string;
  htmlLabel?: string;
  primaryHtmlLimit?: number;
  fallbackHtmlLimit?: number;
  timeoutMs?: number;
  fallbackTimeoutMs?: number;
  extraParts?: Array<string | undefined>;
  log?: AiLogger;
}

const SEOAXE_CORE_SYSTEM_PROMPT = `You are SEOaxe AI, the optimization engine behind an SEO and AEO product. You specialize in safe HTML transformations, structured SEO analysis, schema strategy, answer-engine optimization, and actionable competitor research.

Follow these product rules on every task:
- Be precise, not chatty.
- Return structured output only when the task asks for JSON.
- Preserve document integrity and avoid malformed HTML.
- Prefer factual, implementation-ready output over theory.
- Keep SEO improvements realistic and defensible.
- Never invent hidden page details that are not supported by the input.`;

function appendHtml(parts: string[], htmlLabel: string, html: string | null, filename?: string): string[] {
  if (!html) return parts;
  let lang = "html";
  if (filename) {
    if (filename.endsWith(".ts")) lang = "typescript";
    else if (filename.endsWith(".tsx")) lang = "typescript";
  }
  return [...parts, `${htmlLabel}:\n\`\`\`${lang}\n${html}\n\`\`\``];
}

export async function runSeoaxeJsonTask<T>({
  taskName,
  taskPrompt,
  systemInstruction,
  html,
  htmlLabel = "HTML",
  primaryHtmlLimit = 80_000,
  fallbackHtmlLimit = 40_000,
  timeoutMs = 30_000,
  fallbackTimeoutMs = 15_000,
  extraParts = [],
  log,
}: RunSeoaxeJsonTaskOptions): Promise<T> {
  const filename = extraParts.find(p => p?.startsWith("Filename: "))?.split(": ")[1];
  
  const systemPrompt = systemInstruction
    ? `${SEOAXE_CORE_SYSTEM_PROMPT}\n\nTask specialization:\n${systemInstruction}`
    : SEOAXE_CORE_SYSTEM_PROMPT;

  const promptParts = [
    taskPrompt,
    ...extraParts.filter((value): value is string => Boolean(value && value.trim())),
  ];

  const primaryHtml = html ? prepareHtmlForModel(html, primaryHtmlLimit) : null;
  const fallbackHtml = html ? prepareHtmlForModel(html, fallbackHtmlLimit) : null;

  let text: string = "";
  let usedGroq = false;

  if (USE_GROQ) {
    log?.info({ taskName }, "Using Groq (Llama 3.1 70B) for optimization");
    try {
      try {
        text = await generateSeoaxeOptimization(
          systemPrompt,
          promptParts.join("\n\n"),
          primaryHtml,
          timeoutMs,
        );
        usedGroq = true;
      } catch (err) {
          if (fallbackHtml && fallbackHtml !== primaryHtml) {
            log?.error({ err, taskName }, `${taskName} Groq primary call failed, retrying with compact HTML payload`);
            text = await generateSeoaxeOptimization(
              systemPrompt,
              promptParts.join("\n\n"),
              fallbackHtml,
              fallbackTimeoutMs,
            );
            usedGroq = true;
          } else {
            throw err;
          }
        }
    } catch (groqErr) {
      log?.warn({ err: groqErr, taskName }, `${taskName} Groq failed entirely, falling back to Gemini`);
      usedGroq = false;
    }
  }

  if (!usedGroq) {
    // Use Gemini (either Groq wasn't available, or it failed and we're falling back)
    log?.info({ taskName }, "Using Gemini for optimization");
    const model = getModel(systemPrompt);

    let result;
    try {
      result = await generateContentWithTimeout(
        model,
        appendHtml(promptParts, htmlLabel, primaryHtml, filename),
        timeoutMs,
      );
    } catch (err) {
      if (!fallbackHtml || fallbackHtml === primaryHtml) {
        throw err;
      }
      log?.error({ err, taskName }, `${taskName} primary model call failed, retrying with compact HTML payload`);
      result = await generateContentWithTimeout(
        model,
        appendHtml(promptParts, htmlLabel, fallbackHtml, filename),
        fallbackTimeoutMs,
      );
    }
    text = result.response.text();
  }

  // At this point, text should always be defined because both code paths assign it
  // or throw an error before reaching here
  try {
    return usedGroq ? groqExtractJson<T>(text!) : extractJson<T>(text!);
  } catch (err) {
    log?.error({ err, taskName, text: text?.slice(0, 500) }, `${taskName} JSON parse failed`);
    throw err;
  }
}

