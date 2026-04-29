import { Router, type IRouter } from "express";
import { DetectContentGapsBody, DetectContentGapsResponse } from "@workspace/api-zod";
import { requireAuthenticatedUser } from "../middleware/auth";
import { runSeoaxeJsonTask } from "../lib/seoaxe-ai";
import { buildRulePackPrompt, inferPageType } from "../lib/page-rules";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

interface GeminiGap {
  question: string;
  why: string;
  impact: "high" | "medium" | "low";
  sectionTitle: string;
  sectionHtml: string;
}

interface GeminiResult {
  gaps: GeminiGap[];
  coverageScoreBefore: number;
  coverageScoreAfter: number;
}

const TASK = `You are a senior SEO content strategist. The HTML below is a single page in a niche. Your job is to identify the most important questions and topics that real searchers in this niche are asking that this page does NOT currently answer well — the content gaps that are costing rankings against competitors.

Return ONLY a JSON object (no prose, no code fences):

{
  "coverageScoreBefore": <0-100, how well the current page covers searcher intent for this topic>,
  "coverageScoreAfter": <0-100, projected coverage after the new sections below are added>,
  "gaps": [
    {
      "question": "<the missing question/topic, written as a real query a searcher would type>",
      "why": "<one sentence: why this matters for rankings, AI Overviews, or buyer intent>",
      "impact": "high" | "medium" | "low",
      "sectionTitle": "<H2 heading for a new section that fills this gap>",
      "sectionHtml": "<production-ready HTML for the new section: an <h2> heading plus 1-3 short paragraphs (<p>) and/or a <ul>. 80-180 words total. No emojis. Plain factual writing, optimized to be quoted by Google AI Overviews and Perplexity. Do NOT wrap in <section> tags — the caller adds those.>"
    }
  ]
}

Rules:
- Return between 4 and 8 gaps.
- Order by impact: high first.
- Do not repeat content already on the page. Each gap must be genuinely missing or thin.
- sectionHtml must be self-contained valid HTML and use semantic tags.`;

router.post("/content-gaps", async (req, res) => {
  const parsed = DetectContentGapsBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const { html, topic, audience } = parsed.data;
  const pageType = inferPageType({ html, topic });

  try {
    let data: GeminiResult;
    try {
      data = await runSeoaxeJsonTask<GeminiResult>({
        taskName: "content-gaps",
        taskPrompt: `${TASK}\n\n${buildRulePackPrompt("content-gaps", pageType)}`,
        systemInstruction:
          "You are the SEOaxe missing-content finder. Identify genuine topic gaps, prioritize buyer-intent and answer-engine opportunities, and return HTML sections that are ready to inject.",
        html,
        htmlLabel: "Page HTML",
        primaryHtmlLimit: 80_000,
        fallbackHtmlLimit: 40_000,
        timeoutMs: 30_000,
        fallbackTimeoutMs: 15_000,
        extraParts: [
          `Topic / niche: ${topic}`,
          audience ? `Target audience: ${audience}` : undefined,
        ],
        log: req.log,
      });
    } catch {
      return res.status(500).json({ message: "Detection failed, please try again." });
    }

    if (!Array.isArray(data.gaps) || data.gaps.length === 0) {
      return res.status(500).json({ message: "Detection failed, please try again." });
    }

    const gaps = data.gaps
      .filter((g) => g && typeof g.sectionHtml === "string" && typeof g.sectionTitle === "string")
      .slice(0, 10)
      .map((g) => ({
        question: String(g.question || "").slice(0, 200),
        why: String(g.why || "").slice(0, 400),
        impact: ["high", "medium", "low"].includes(g.impact) ? g.impact : "medium",
        sectionTitle: String(g.sectionTitle).slice(0, 160),
        sectionHtml: String(g.sectionHtml),
      }));

    const block = `\n<section class="seoforge-content-gap" aria-label="Additional information">\n${gaps
      .map((g) => g.sectionHtml.trim())
      .join("\n\n")}\n</section>\n`;

    let augmentedHtml = html;
    if (/<\/body>/i.test(augmentedHtml)) {
      augmentedHtml = augmentedHtml.replace(/<\/body>/i, `${block}</body>`);
    } else {
      augmentedHtml += block;
    }

    const safe = DetectContentGapsResponse.parse({
      gaps,
      augmentedHtml,
      coverageScoreBefore: clamp(data.coverageScoreBefore),
      coverageScoreAfter: clamp(data.coverageScoreAfter),
    });
    return res.json(safe);
  } catch (err) {
    req.log.error({ err }, "content-gap call failed");
    return res.status(500).json({ message: "Detection failed, please try again." });
  }
});

function clamp(n: unknown): number {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export default router;
