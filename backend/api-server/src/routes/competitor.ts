import { Router, type IRouter } from "express";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ScanCompetitorBody, ScanCompetitorResponse } from "@workspace/api-zod";
import { getModel, extractJson, generateContentWithTimeout } from "../lib/gemini";
import { requireAuthenticatedUser } from "../middleware/auth";
import { prepareHtmlForModel } from "../lib/html-processor";

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
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new CompetitorScanError("Please enter a valid website URL.", 400);
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

async function fetchPage(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(url, {
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
      throw new CompetitorScanError(`We could not open that page. The site responded with ${res.status}.`, 502);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("html")) {
      throw new CompetitorScanError("That URL did not return an HTML page we can analyze.", 422);
    }
    const text = await res.text();
    if (!text.trim()) {
      throw new CompetitorScanError("That page loaded empty content, so there was nothing to analyze.", 422);
    }
    return text;
  } catch (err) {
    if (err instanceof CompetitorScanError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new CompetitorScanError("That page took too long to load. Try a simpler URL or retry in a moment.", 504);
    }
    throw new CompetitorScanError("We could not fetch that competitor page right now.", 502);
  } finally {
    clearTimeout(timeout);
  }
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

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (err) {
    req.log.warn({ err, url }, "Failed to fetch competitor page");
    return res.status(err instanceof CompetitorScanError ? err.statusCode : 500).json({
      message: err instanceof CompetitorScanError ? err.message : "Scan failed, please try again.",
    });
  }

  try {
    const model = getModel(
      "You are an elite SEO competitive intelligence analyst. You reverse-engineer SEO and AEO strategy from raw HTML with precision.",
    );
    const result = await generateContentWithTimeout(model, [
      PROMPT,
      `Competitor URL: ${url}`,
      "HTML:\n```html\n" + prepareHtmlForModel(html, 35_000) + "\n```",
    ], 30_000);
    const text = result.response.text();
    let data: ScanResult;
    try {
      data = extractJson<ScanResult>(text);
    } catch (err) {
      req.log.error({ err, text: text.slice(0, 500) }, "Failed to parse competitor JSON");
      return res.status(502).json({ message: "The scan response came back incomplete. Please try again." });
    }

    const safe = ScanCompetitorResponse.parse({
      url,
      title: data.title || url,
      strategy: {
        metaStrategy: data.strategy?.metaStrategy ?? "",
        targetKeywords: Array.isArray(data.strategy?.targetKeywords)
          ? data.strategy.targetKeywords
          : [],
        schemaUsage: Array.isArray(data.strategy?.schemaUsage)
          ? data.strategy.schemaUsage
          : [],
        contentStructure: data.strategy?.contentStructure ?? "",
      },
      beatThem: Array.isArray(data.beatThem) ? data.beatThem : [],
    });
    return res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Gemini competitor scan failed");
    return res.status(502).json({ message: "The competitor analysis service is having trouble right now. Please try again." });
  }
});

export default router;
