import { Router, type IRouter } from "express";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ScanCompetitorBody, ScanCompetitorResponse } from "@workspace/api-zod";
import { requireAuthenticatedUser } from "../middleware/auth";
import { runSeoaxeJsonTask } from "../lib/seoaxe-ai";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

interface ScanResult {
  title: string;
  strategy: {
    metaStrategy: string;
    targetKeywords: string[];
    schemaUsage: string[];
    contentStructure: string;
  };
  beatThem: string[];
}

class CompetitorScanError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "CompetitorScanError";
    this.statusCode = statusCode;
  }
}

async function lookupWithTimeout(hostname: string, timeoutMs = 3_000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      lookup(hostname, { all: true, verbatim: true }),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new CompetitorScanError("We could not resolve that domain fast enough. Please try again.", 504));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function validateCompetitorUrl(rawUrl: string): Promise<URL> {
  const trimmedUrl = rawUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmedUrl);
  } catch {
    try {
      parsed = new URL(`https://${trimmedUrl}`);
    } catch {
      throw new CompetitorScanError("Please enter a valid website URL.", 400);
    }
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new CompetitorScanError("Only http and https URLs can be scanned.", 400);
  }
  if (parsed.username || parsed.password) {
    throw new CompetitorScanError("URLs with embedded credentials are not allowed.", 400);
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new CompetitorScanError("That URL points to a private or local address and cannot be scanned.", 400);
  }

  let addresses;
  try {
    addresses = await lookupWithTimeout(parsed.hostname);
  } catch (err) {
    if (err instanceof CompetitorScanError) {
      throw err;
    }
    throw new CompetitorScanError("We could not resolve that domain.", 422);
  }

  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new CompetitorScanError("That URL points to a private or local address and cannot be scanned.", 400);
  }

  return parsed;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized === "0.0.0.0"
  );
}

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("::ffff:")) {
    return isPrivateAddress(normalized.slice(7));
  }
  return false;
}

async function fetchPage(url: string): Promise<{ html: string; finalUrl: string }> {
  const parsedUrl = new URL(url);
  const urlsToTry: string[] = [];
  
  if (parsedUrl.protocol === "https:") {
    urlsToTry.push(url);
    const httpUrl = new URL(url);
    httpUrl.protocol = "http:";
    urlsToTry.push(httpUrl.toString());
  } else if (parsedUrl.protocol === "http:") {
    urlsToTry.push(url);
    const httpsUrl = new URL(url);
    httpsUrl.protocol = "https:";
    urlsToTry.push(httpsUrl.toString());
  } else {
    urlsToTry.push(url);
  }

  let lastError: CompetitorScanError | null = null;
  
  for (const tryUrl of urlsToTry) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 20_000);
    try {
      const res = await fetch(tryUrl, {
        signal: ctrl.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });
      if (!res.ok) {
        lastError = new CompetitorScanError(`We could not open that page. The site responded with ${res.status}.`, 502);
        continue;
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("html")) {
        lastError = new CompetitorScanError("That URL did not return an HTML page we can analyze.", 422);
        continue;
      }
      const text = await res.text();
      if (!text.trim()) {
        lastError = new CompetitorScanError("That page loaded empty content, so there was nothing to analyze.", 422);
        continue;
      }
      return { html: text, finalUrl: res.url };
    } catch (err) {
      if (err instanceof CompetitorScanError) {
        lastError = err;
      } else if (err instanceof Error && err.name === "AbortError") {
        lastError = new CompetitorScanError("That page took too long to load. Try a simpler URL or retry in a moment.", 504);
      } else {
        lastError = new CompetitorScanError("We could not fetch that competitor page right now.", 502);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  
  if (lastError) {
    throw lastError;
  }
  throw new CompetitorScanError("We could not fetch that competitor page right now.", 502);
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  gt: ">",
  lt: "<",
  quot: "\"",
  apos: "'",
  nbsp: " ",
};

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "also",
  "and",
  "are",
  "because",
  "been",
  "before",
  "being",
  "best",
  "but",
  "can",
  "com",
  "could",
  "for",
  "from",
  "get",
  "has",
  "have",
  "here",
  "how",
  "into",
  "its",
  "just",
  "learn",
  "more",
  "not",
  "our",
  "out",
  "over",
  "page",
  "see",
  "services",
  "site",
  "that",
  "the",
  "their",
  "then",
  "this",
  "through",
  "use",
  "was",
  "web",
  "website",
  "what",
  "when",
  "where",
  "which",
  "with",
  "you",
  "your",
]);

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith("#x")) {
      const parsed = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : match;
    }
    if (normalized.startsWith("#")) {
      const parsed = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : match;
    }
    return HTML_ENTITIES[normalized] ?? match;
  });
}

function cleanText(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstTagText(html: string, tagName: string): string {
  const match = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i").exec(html);
  return match ? cleanText(match[1]) : "";
}

function extractTagTexts(html: string, tagName: string, limit = 20): string[] {
  const values: string[] = [];
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && values.length < limit) {
    const text = cleanText(match[1]);
    if (text) {
      values.push(text);
    }
  }
  return values;
}

function getAttribute(tag: string, attributeName: string): string {
  const pattern = new RegExp(`${attributeName}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  const match = pattern.exec(tag);
  if (!match) return "";
  return decodeHtmlEntities(match[1].replace(/^['"]|['"]$/g, "").trim());
}

function extractMetaContent(html: string, metaName: string): string {
  const pattern = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    const tag = match[0];
    const name = getAttribute(tag, "name").toLowerCase();
    const property = getAttribute(tag, "property").toLowerCase();
    if (name === metaName.toLowerCase() || property === metaName.toLowerCase()) {
      return getAttribute(tag, "content");
    }
  }
  return "";
}

function collectJsonLdTypes(value: unknown, types: Set<string>): void {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectJsonLdTypes(entry, types));
    return;
  }
  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  const type = record["@type"];
  if (typeof type === "string" && type.trim()) {
    types.add(type.trim());
  } else if (Array.isArray(type)) {
    type.filter((entry): entry is string => typeof entry === "string").forEach((entry) => types.add(entry.trim()));
  }
  Object.values(record).forEach((entry) => collectJsonLdTypes(entry, types));
}

function extractSchemaUsage(html: string): string[] {
  const types = new Set<string>();
  const scriptPattern = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;
  while ((scriptMatch = scriptPattern.exec(html))) {
    const rawJson = cleanText(scriptMatch[1]);
    try {
      collectJsonLdTypes(JSON.parse(rawJson), types);
    } catch {
      for (const typeMatch of rawJson.matchAll(/"@type"\s*:\s*"([^"]+)"/g)) {
        types.add(typeMatch[1].trim());
      }
    }
  }

  for (const itemTypeMatch of html.matchAll(/itemtype\s*=\s*["'][^"']*schema\.org\/([^"']+)["']/gi)) {
    types.add(itemTypeMatch[1].trim());
  }

  return [...types].filter(Boolean).sort();
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
}

function scoreKeywordText(scores: Map<string, number>, value: string, weight: number): void {
  const words = tokenize(value);
  words.forEach((word) => {
    scores.set(word, (scores.get(word) ?? 0) + weight);
  });

  for (let i = 0; i < words.length - 1; i += 1) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    scores.set(phrase, (scores.get(phrase) ?? 0) + weight * 2);
  }

  for (let i = 0; i < words.length - 2; i += 1) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    scores.set(phrase, (scores.get(phrase) ?? 0) + weight * 3);
  }
}

function extractTargetKeywords(html: string, finalUrl: string): string[] {
  const scores = new Map<string, number>();
  const title = extractFirstTagText(html, "title");
  const description = extractMetaContent(html, "description");
  const headings = ["h1", "h2", "h3"].flatMap((tagName) => extractTagTexts(html, tagName, 12));
  const bodyText = cleanText(html).slice(0, 6_000);

  scoreKeywordText(scores, new URL(finalUrl).hostname.replace(/^www\./, "").replace(/\./g, " "), 2);
  scoreKeywordText(scores, title, 8);
  scoreKeywordText(scores, description, 5);
  headings.forEach((heading) => scoreKeywordText(scores, heading, 4));
  scoreKeywordText(scores, bodyText, 1);

  const selected: string[] = [];
  for (const [keyword] of [...scores.entries()].sort((a, b) => b[1] - a[1])) {
    if (selected.length >= 12) break;
    if (keyword.length > 60) continue;
    if (selected.some((existing) => existing.includes(keyword) || keyword.includes(existing))) continue;
    selected.push(keyword);
  }

  return selected.length >= 5 ? selected.slice(0, 12) : [...selected, "seo", "answer engine optimization"].slice(0, 8);
}

function buildDeterministicScan(html: string, finalUrl: string): ScanResult {
  const title = extractFirstTagText(html, "title") || new URL(finalUrl).hostname.replace(/^www\./, "");
  const description = extractMetaContent(html, "description");
  const h1s = extractTagTexts(html, "h1", 5);
  const h2s = extractTagTexts(html, "h2", 12);
  const schemaTypes = extractSchemaUsage(html);
  const targetKeywords = extractTargetKeywords(html, finalUrl);
  const headingSummary =
    h1s.length > 0
      ? `The page leads with ${h1s.length} H1${h1s.length === 1 ? "" : "s"} (${h1s.slice(0, 2).join("; ")}) and ${h2s.length} H2 section${h2s.length === 1 ? "" : "s"}.`
      : `The page has no clear H1 and uses ${h2s.length} H2 section${h2s.length === 1 ? "" : "s"}, which weakens answer extraction.`;

  const schemaUsage = schemaTypes.length > 0 ? schemaTypes : ["None detected"];
  const metaStrategy = description
    ? `The page uses a title-led search snippet around "${title}" with a meta description that supports the same intent. Its likely strategy is to capture branded and service-intent searches, then reinforce those themes through headings and repeated on-page terms.`
    : `The page relies mostly on its title, "${title}", and visible headings because no meta description was detected. That leaves room to beat the snippet with a sharper value proposition and answer-first summary.`;

  const beatThem = [
    description
      ? "Write a tighter meta title and description pair that states the exact buyer problem, location or market, and measurable outcome more clearly than their snippet."
      : "Add a complete meta title and description pair so your result has a stronger search snippet than theirs.",
    schemaTypes.length > 0
      ? `Match their structured data coverage (${schemaTypes.slice(0, 3).join(", ")}) and add FAQ, HowTo, or Service schema where it genuinely fits your page.`
      : "Add relevant FAQ, Service, Organization, and Breadcrumb schema because this competitor page does not expose strong structured data signals.",
    h1s.length === 1
      ? "Keep one clear H1, then build stronger H2 sections around pricing, process, proof, FAQs, and comparison queries they do not answer directly."
      : "Use one clean H1 and a more deliberate H2 hierarchy so Google and AI answer engines can understand the page faster.",
    `Create supporting content around "${targetKeywords.slice(0, 3).join('", "')}" and link those articles back to the money page.`,
    "Add proof blocks, concrete examples, and direct question-answer sections so your page is easier to quote in AI results.",
  ];

  return {
    title,
    strategy: {
      metaStrategy,
      targetKeywords,
      schemaUsage,
      contentStructure: `${headingSummary} ${schemaTypes.length > 0 ? `Structured data detected: ${schemaTypes.join(", ")}.` : "No structured data was detected in the page HTML."} This suggests ${h2s.length >= 4 ? "a section-led content strategy" : "a thin structure that can be beaten with deeper sections"} and an AEO opportunity around direct answers.`,
    },
    beatThem,
  };
}

function normalizeScanResult(data: Partial<ScanResult> | null | undefined, html: string, finalUrl: string): ScanResult {
  const fallback = buildDeterministicScan(html, finalUrl);
  return {
    title: typeof data?.title === "string" && data.title.trim() ? data.title.trim() : fallback.title,
    strategy: {
      metaStrategy:
        typeof data?.strategy?.metaStrategy === "string" && data.strategy.metaStrategy.trim()
          ? data.strategy.metaStrategy.trim()
          : fallback.strategy.metaStrategy,
      targetKeywords:
        Array.isArray(data?.strategy?.targetKeywords) && data.strategy.targetKeywords.length > 0
          ? data.strategy.targetKeywords
              .filter((keyword): keyword is string => typeof keyword === "string" && keyword.trim().length > 0)
              .slice(0, 12)
          : fallback.strategy.targetKeywords,
      schemaUsage:
        Array.isArray(data?.strategy?.schemaUsage) && data.strategy.schemaUsage.length > 0
          ? data.strategy.schemaUsage.filter((schema): schema is string => typeof schema === "string" && schema.trim().length > 0)
          : fallback.strategy.schemaUsage,
      contentStructure:
        typeof data?.strategy?.contentStructure === "string" && data.strategy.contentStructure.trim()
          ? data.strategy.contentStructure.trim()
          : fallback.strategy.contentStructure,
    },
    beatThem:
      Array.isArray(data?.beatThem) && data.beatThem.length > 0
        ? data.beatThem.filter((tip): tip is string => typeof tip === "string" && tip.trim().length > 0).slice(0, 5)
        : fallback.beatThem,
  };
}

const PROMPT = `You are scanning a competitor's web page for SEO and AEO intelligence. Given the raw HTML below, return a JSON object (no prose, no code fences) with this exact shape:

{
  "title": "<page title or site name>",
  "strategy": {
    "metaStrategy": "<2-3 sentence summary of their meta title/description approach and what intent they target>",
    "targetKeywords": ["8-12 likely target keywords, ordered by likely priority"],
    "schemaUsage": ["bullet list of every JSON-LD or microdata schema type detected, or 'None detected' if absent"],
    "contentStructure": "<2-3 sentence summary of their heading hierarchy, content blocks, and AEO posture>"
  },
  "beatThem": [
    "5 concrete, sharp, actionable ways to outrank them — each one a specific tactic, not generic advice"
  ]
}

Return ONLY valid JSON.`;

router.post("/scan-competitor", async (req, res) => {
  try {
    const parsed = ScanCompetitorBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request body" });
    }
    let competitorUrl: URL;
    try {
      competitorUrl = await validateCompetitorUrl(parsed.data.url);
    } catch (err) {
      return res.status(err instanceof CompetitorScanError ? err.statusCode : 400).json({
        message: err instanceof CompetitorScanError ? err.message : "Invalid competitor URL.",
      });
    }
    const url = competitorUrl.toString();

    let fetchResult: { html: string; finalUrl: string };
    try {
      fetchResult = await fetchPage(url);
    } catch (err) {
      (req.log as any).warn?.({ err, url }, "Failed to fetch competitor page");
      return res.status(err instanceof CompetitorScanError ? err.statusCode : 500).json({
        message: err instanceof CompetitorScanError ? err.message : "Scan failed, please try again.",
      });
    }
    const { html, finalUrl } = fetchResult;

    let data: ScanResult;
    try {
      const aiScan = await runSeoaxeJsonTask<ScanResult>({
        taskName: "competitor-scan",
        taskPrompt: PROMPT,
        systemInstruction:
          "You are the SEOaxe competitor scanner. Reverse-engineer SEO and AEO positioning from raw HTML and turn it into concise competitive intelligence.",
        html,
        htmlLabel: "HTML",
        primaryHtmlLimit: 35_000,
        fallbackHtmlLimit: 20_000,
        timeoutMs: 30_000,
        fallbackTimeoutMs: 15_000,
        extraParts: [`Competitor URL: ${finalUrl}`],
        log: req.log as any,
      });
      data = normalizeScanResult(aiScan, html, finalUrl);
    } catch (err) {
      (req.log as any).warn?.({ err, url: finalUrl, htmlLength: html.length }, "Competitor scan AI task failed, using deterministic fallback");
      data = buildDeterministicScan(html, finalUrl);
    }

    const safe = ScanCompetitorResponse.parse({
      url: finalUrl,
      ...data,
    });
    return res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Competitor scan failed");
    return res.status(502).json({ message: "The competitor analysis service is having trouble right now. Please try again." });
  }
});

export default router;
