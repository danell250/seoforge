import { Router, type IRouter } from "express";
import { ScanCompetitorBody, ScanCompetitorResponse } from "@workspace/api-zod";
import { getModel, extractJson } from "../lib/gemini";

const router: IRouter = Router();

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

async function fetchPage(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEOForgeBot/1.0; +https://seoforge.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return text.slice(0, 60000);
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
  const { url } = parsed.data;

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (err) {
    req.log.warn({ err, url }, "Failed to fetch competitor page");
    return res.status(500).json({
      message: "Scan failed, please try again.",
    });
  }

  try {
    const model = getModel(
      "You are an elite SEO competitive intelligence analyst. You reverse-engineer SEO and AEO strategy from raw HTML with precision.",
    );
    const result = await model.generateContent([
      PROMPT,
      `Competitor URL: ${url}`,
      "HTML:\n```html\n" + html + "\n```",
    ]);
    const text = result.response.text();
    let data: ScanResult;
    try {
      data = extractJson<ScanResult>(text);
    } catch (err) {
      req.log.error({ err, text: text.slice(0, 500) }, "Failed to parse competitor JSON");
      return res.status(500).json({ message: "Scan failed, please try again." });
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
    return res.status(500).json({ message: "Scan failed, please try again." });
  }
});

export default router;
