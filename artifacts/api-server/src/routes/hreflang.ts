import { Router, type IRouter } from "express";
import { ApplyHreflangBody, ApplyHreflangResponse } from "@workspace/api-zod";
import { getModel, extractJson } from "../lib/gemini";

const router: IRouter = Router();

interface DetectionResult {
  languageCode: string;
  confidence: number;
}

const DETECT_PROMPT = `Identify the primary natural language of the page text below. Respond ONLY with a JSON object (no prose, no code fences):

{
  "languageCode": "<BCP-47 code, lowercase, e.g. en, af, zu, xh, fr, pt, ar, sw>",
  "confidence": <0.0 to 1.0>
}`;

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

router.post("/hreflang", async (req, res) => {
  const parsed = ApplyHreflangBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  const { html, alternates } = parsed.data;

  if (alternates.length === 0) {
    return res.status(400).json({ message: "Provide at least one alternate locale." });
  }

  let detected: DetectionResult = { languageCode: "en", confidence: 0 };
  try {
    const model = getModel();
    const result = await model.generateContent([DETECT_PROMPT, "Page text:\n" + htmlToText(html)]);
    const text = result.response.text();
    try {
      detected = extractJson<DetectionResult>(text);
    } catch (err) {
      req.log.warn({ err, text: text.slice(0, 200) }, "hreflang detect parse failed");
    }
  } catch (err) {
    req.log.warn({ err }, "Gemini language detect failed");
  }

  const lang = detected.languageCode?.toLowerCase().slice(0, 8) || "en";

  const tags = alternates.map(
    (a) => `<link rel="alternate" hreflang="${escapeAttr(a.hreflang)}" href="${escapeAttr(a.href)}" />`,
  );
  const xDefault = alternates[0];
  if (xDefault) {
    tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeAttr(xDefault.href)}" />`);
  }
  const tagBlock = "\n  " + tags.join("\n  ") + "\n";

  let out = html;
  if (/<html[^>]*>/i.test(out)) {
    out = out.replace(/<html([^>]*)>/i, (match, attrs: string) => {
      if (/\blang\s*=/.test(attrs)) {
        return match.replace(/\blang\s*=\s*"[^"]*"/i, `lang="${lang}"`);
      }
      return `<html${attrs} lang="${lang}">`;
    });
  }
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `${tagBlock}</head>`);
  } else {
    out = `<head>${tagBlock}</head>\n${out}`;
  }

  return res.json(
    ApplyHreflangResponse.parse({
      html: out,
      detectedLanguage: lang,
      injectedTags: tags,
    }),
  );
});

export default router;
