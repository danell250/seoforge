import { Router, type IRouter } from "express";
import { OptimizeHtmlBody, OptimizeHtmlResponse } from "@workspace/api-zod";
import { getModel, extractJson } from "../lib/gemini";

const router: IRouter = Router();

interface GeminiResult {
  optimizedHtml: string;
  changes: string[];
  score: {
    technical: number;
    content: number;
    aeo: number;
    overall: number;
  };
}

const TASK_INSTRUCTION = `Given the HTML below, return a JSON object (no prose, no code fences) with this exact shape:

{
  "optimizedHtml": "<full optimized HTML, production-ready, every SEO and AEO improvement applied: title, meta description, canonical, Open Graph, Twitter card, JSON-LD schema (Organization/WebSite/WebPage/FAQPage where appropriate), hreflang for African multilingual targets when relevant, semantic HTML5, alt text on every image, descriptive heading hierarchy, AEO answer blocks, FAQ section if missing>",
  "changes": ["bullet list of every concrete change made, one short sentence each"],
  "score": {
    "technical": <0-100, how strong technical SEO now is>,
    "content": <0-100, how strong content SEO now is>,
    "aeo": <0-100, AEO readiness for Google AI Overviews / Perplexity / voice>,
    "overall": <0-100, weighted overall score>
  }
}

Return ONLY valid JSON. The optimizedHtml field must contain the FULL document HTML, not a fragment.`;

router.post("/optimize", async (req, res) => {
  const parsed = OptimizeHtmlBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const { html, filename } = parsed.data;

  try {
    const model = getModel();
    const result = await model.generateContent([
      TASK_INSTRUCTION,
      filename ? `Filename: ${filename}` : "",
      "HTML to optimize:\n```html\n" + html + "\n```",
    ]);
    const text = result.response.text();
    let data: GeminiResult;
    try {
      data = extractJson<GeminiResult>(text);
    } catch (err) {
      req.log.error({ err, text: text.slice(0, 500) }, "Failed to parse Gemini JSON");
      return res.status(500).json({ message: "Optimization failed, please try again." });
    }

    if (!data.optimizedHtml || !Array.isArray(data.changes) || !data.score) {
      req.log.error({ data }, "Gemini response missing fields");
      return res.status(500).json({ message: "Optimization failed, please try again." });
    }

    const safe = OptimizeHtmlResponse.parse({
      optimizedHtml: data.optimizedHtml,
      changes: data.changes,
      score: {
        technical: clamp(data.score.technical),
        content: clamp(data.score.content),
        aeo: clamp(data.score.aeo),
        overall: clamp(data.score.overall),
      },
    });
    return res.json(safe);
  } catch (err) {
    req.log.error({ err }, "Gemini optimize call failed");
    return res.status(500).json({ message: "Optimization failed, please try again." });
  }
});

function clamp(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default router;
