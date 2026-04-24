import { Router, type IRouter } from "express";
import { GenerateAeoBlockBody, GenerateAeoBlockResponse } from "@workspace/api-zod";
import { getModel, extractJson } from "../lib/gemini";
import { requireAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

interface GeminiAeo {
  questions: { question: string; answer: string }[];
}

const TASK = `You are an AEO (Answer Engine Optimization) expert. Read the page HTML below and identify the 6 to 10 most important questions a real searcher would ask that this page should answer to win Google AI Overviews, Perplexity, ChatGPT search, and voice assistants.

Return ONLY a JSON object (no prose, no code fences) of this exact shape:

{
  "questions": [
    { "question": "<natural-language question, 6-12 words>", "answer": "<concise, factual answer 30-60 words, written in plain English, directly usable by an LLM as a snippet>" }
  ]
}

Rules:
- Questions must be specific to the page topic, not generic.
- Answers must be standalone (no "as mentioned above").
- No marketing fluff. No emojis.
- Cover the buyer journey: definition, how-it-works, comparison, pricing/cost, getting-started.`;

router.post("/aeo-block", async (req, res) => {
  const parsed = GenerateAeoBlockBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const { html, topic } = parsed.data;

  try {
    const model = getModel();
    const result = await model.generateContent([
      TASK,
      topic ? `Topic hint: ${topic}` : "",
      "HTML:\n```html\n" + html.slice(0, 80_000) + "\n```",
    ]);
    const text = result.response.text();
    let data: GeminiAeo;
    try {
      data = extractJson<GeminiAeo>(text);
    } catch (err) {
      req.log.error({ err, text: text.slice(0, 500) }, "AEO parse failed");
      return res.status(500).json({ message: "Generation failed, please try again." });
    }

    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      return res.status(500).json({ message: "Generation failed, please try again." });
    }

    const questions = data.questions
      .filter((q) => q && typeof q.question === "string" && typeof q.answer === "string")
      .slice(0, 12);

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    };
    const schemaJsonLd = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;

    const visibleBlock = `\n<section class="seoforge-aeo-faq" aria-label="Frequently asked questions">\n  <h2>Frequently Asked Questions</h2>\n${questions
      .map(
        (q) =>
          `  <div class="seoforge-aeo-item">\n    <h3>${escapeHtml(q.question)}</h3>\n    <p>${escapeHtml(q.answer)}</p>\n  </div>`,
      )
      .join("\n")}\n</section>\n`;

    const augmented = injectIntoHtml(html, visibleBlock, schemaJsonLd);

    const safe = GenerateAeoBlockResponse.parse({
      html: augmented,
      questions,
      schemaJsonLd,
    });
    return res.json(safe);
  } catch (err) {
    req.log.error({ err }, "AEO call failed");
    return res.status(500).json({ message: "Generation failed, please try again." });
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectIntoHtml(html: string, visibleBlock: string, schemaJsonLd: string): string {
  let out = html;
  if (/<\/body>/i.test(out)) {
    out = out.replace(/<\/body>/i, `${visibleBlock}</body>`);
  } else {
    out += visibleBlock;
  }
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `${schemaJsonLd}\n</head>`);
  } else {
    out = `${schemaJsonLd}\n${out}`;
  }
  return out;
}

export default router;
