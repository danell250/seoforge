import { extractJson, generateContentWithTimeout, getModel } from "./gemini";
import { prepareHtmlForModel } from "./html-processor";

export interface AiLogger {
  error: (object: unknown, message?: string) => void;
}

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
  const model = getModel(
    systemInstruction
      ? `${SEOAXE_CORE_SYSTEM_PROMPT}\n\nTask specialization:\n${systemInstruction}`
      : SEOAXE_CORE_SYSTEM_PROMPT,
  );

  const promptParts = [
    taskPrompt,
    ...extraParts.filter((value): value is string => Boolean(value && value.trim())),
  ];

  const primaryHtml = html ? prepareHtmlForModel(html, primaryHtmlLimit) : null;
  const fallbackHtml = html ? prepareHtmlForModel(html, fallbackHtmlLimit) : null;

  let result;
  try {
    result = await generateContentWithTimeout(
      model,
      appendHtml(promptParts, htmlLabel, primaryHtml),
      timeoutMs,
    );
  } catch (err) {
    if (!fallbackHtml || fallbackHtml === primaryHtml) {
      throw err;
    }
    log?.error({ err, taskName }, `${taskName} primary model call failed, retrying with compact HTML payload`);
    result = await generateContentWithTimeout(
      model,
      appendHtml(promptParts, htmlLabel, fallbackHtml),
      fallbackTimeoutMs,
    );
  }

  const text = result.response.text();
  try {
    return extractJson<T>(text);
  } catch (err) {
    log?.error({ err, taskName, text: text.slice(0, 500) }, `${taskName} JSON parse failed`);
    throw err;
  }
}

function appendHtml(parts: string[], htmlLabel: string, html: string | null): string[] {
  if (!html) return parts;
  return [...parts, `${htmlLabel}:\n\`\`\`html\n${html}\n\`\`\``];
}

