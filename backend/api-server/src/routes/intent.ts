import { Router, type IRouter } from "express";
import { requireAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();

const FETCH_TIMEOUT_MS = 15000;
const MAX_BYTES = 500_000;

function normalizeUrl(raw: string): string {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return s;
}

function normalizeKeyword(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function stemWord(word: string): string {
  const s = word.toLowerCase();
  // Very basic stemming
  if (s.endsWith("ing") && s.length > 5) return s.slice(0, -3);
  if (s.endsWith("ed") && s.length > 4) return s.slice(0, -2);
  if (s.endsWith("s") && s.length > 3 && !s.endsWith("ss")) return s.slice(0, -1);
  if (s.endsWith("es") && s.length > 4) return s.slice(0, -2);
  return s;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map(stemWord);
}

function countOccurrences(text: string, phrase: string): number {
  const t = text.toLowerCase();
  const p = phrase.toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = t.indexOf(p, pos)) !== -1) {
    count++;
    pos += 1;
  }
  return count;
}

async function fetchHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEOForgeIntent/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("html")) return null;
    return (await res.text()).slice(0, MAX_BYTES);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? m[1].replace(/\s+/g, " ").trim().slice(0, 200) : "";
}

function extractMetaDescription(html: string): string {
  const m = html.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["']/i);
  return m?.[1] ? m[1].trim().slice(0, 300) : "";
}

function extractH1(html: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m?.[1] ? m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) : "";
}

function extractH2s(html: string): string[] {
  const matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  return matches.map((m) =>
    m.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
  ).filter(Boolean);
}

function extractBodyText(html: string): string {
  // Strip scripts and styles, then tags
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectIntentType(keyword: string): string {
  const k = keyword.toLowerCase();
  if (/\b(buy|purchase|order|shop|deal|price|discount|coupon|checkout|cart)\b/.test(k)) {
    return "transactional";
  }
  if (/\b(best|top|review|comparison|compare|vs|versus|alternatives|worth it)\b/.test(k)) {
    return "commercial";
  }
  if (/\b(how to|what is|why|guide|tutorial|learn|step by step|tips|examples)\b/.test(k)) {
    return "informational";
  }
  if (/\b(tool|calculator|generator|checker|tester|audit|scanner|analyze)\b/.test(k)) {
    return "tool-seeking";
  }
  if (/\b(brand|login|signin|sign up|app|download|official)\b/.test(k)) {
    return "navigational";
  }
  return "informational";
}

function scoreIntentMatch(
  keyword: string,
  title: string,
  metaDesc: string,
  h1: string,
  h2s: string[],
  bodyText: string
): {
  titleMatch: number;
  metaMatch: number;
  h1Match: number;
  headingMatch: number;
  bodyMatch: number;
  first100Words: number;
  intentType: string;
  keywordInTitle: boolean;
  keywordInH1: boolean;
  keywordInFirst100: boolean;
  recommendations: string[];
} {
  const kw = normalizeKeyword(keyword);
  const kwTokens = tokenize(kw);
  const intentType = detectIntentType(kw);

  const kwInTitle = countOccurrences(title, kw);
  const kwInMeta = countOccurrences(metaDesc, kw);
  const kwInH1 = countOccurrences(h1, kw);
  const kwInBody = countOccurrences(bodyText, kw);
  const first100 = bodyText.slice(0, 500);
  const kwInFirst100 = countOccurrences(first100, kw);

  // Stemmed token overlap
  const titleTokens = tokenize(title);
  const metaTokens = tokenize(metaDesc);
  const h1Tokens = tokenize(h1);
  const headingTokens = h2s.flatMap(tokenize);
  const bodyTokens = tokenize(bodyText);
  const first100Tokens = tokenize(first100);

  const overlap = (haystack: string[]) => {
    if (kwTokens.length === 0) return 0;
    const matches = kwTokens.filter((t) => haystack.includes(t)).length;
    return matches / kwTokens.length;
  };

  const titleOverlap = overlap(titleTokens);
  const metaOverlap = overlap(metaTokens);
  const h1Overlap = overlap(h1Tokens);
  const headingOverlap = overlap(headingTokens);
  const bodyOverlap = overlap(bodyTokens);
  const first100Overlap = overlap(first100Tokens);

  // Scores 0-100
  const titleMatch = Math.min(100, (kwInTitle > 0 ? 60 : 0) + titleOverlap * 40);
  const metaMatch = Math.min(100, (kwInMeta > 0 ? 60 : 0) + metaOverlap * 40);
  const h1Match = Math.min(100, (kwInH1 > 0 ? 70 : 0) + h1Overlap * 30);
  const headingMatch = Math.min(100, headingOverlap * 100);
  const bodyMatch = Math.min(100, (kwInBody > 0 ? 30 : 0) + bodyOverlap * 70);
  const first100Words = Math.min(100, (kwInFirst100 > 0 ? 60 : 0) + first100Overlap * 40);

  const recommendations: string[] = [];

  if (kwInTitle === 0) {
    recommendations.push("Add the exact keyword to your <title> tag near the beginning.");
  }
  if (kwInH1 === 0) {
    recommendations.push("Include the keyword in your H1 heading.");
  }
  if (kwInMeta === 0) {
    recommendations.push("Mention the keyword in your meta description.");
  }
  if (kwInFirst100 === 0) {
    recommendations.push("Use the keyword in the first 100 words of the page body.");
  }
  if (h2s.length < 2) {
    recommendations.push("Add H2 subheadings that include the keyword or related terms.");
  }

  if (intentType === "transactional" && !/\b(buy|purchase|price|order)\b/i.test(bodyText)) {
    recommendations.push("Add transactional cues: pricing, buy buttons, or checkout options.");
  }
  if (intentType === "informational" && !/\b(guide|how to|what is|learn|step)\b/i.test(bodyText)) {
    recommendations.push("Structure content as a guide or tutorial to match informational intent.");
  }
  if (intentType === "tool-seeking" && !/(tool|generator|checker|calculator|free)/i.test(title + " " + h1)) {
    recommendations.push("Mention 'free tool' or 'checker' in the title to match tool-seeking intent.");
  }
  if (intentType === "commercial" && !/\b(review|best|top|compare)\b/i.test(title + " " + h1)) {
    recommendations.push("Add comparison language (best, top, review) for commercial intent.");
  }

  return {
    titleMatch,
    metaMatch,
    h1Match,
    headingMatch,
    bodyMatch,
    first100Words,
    intentType,
    keywordInTitle: kwInTitle > 0,
    keywordInH1: kwInH1 > 0,
    keywordInFirst100: kwInFirst100 > 0,
    recommendations,
  };
}

router.post("/search-intent", requireAuthenticatedUser, async (req, res) => {
  const url = typeof req.body?.url === "string" ? normalizeUrl(req.body.url) : "";
  const keyword = typeof req.body?.keyword === "string" ? req.body.keyword.trim() : "";

  if (!url || !keyword) {
    return res.status(400).json({ message: "URL and keyword are required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  const html = await fetchHtml(url);
  if (!html) {
    return res.status(500).json({ message: "Could not fetch the page. Please check the URL and try again." });
  }

  const title = extractTitle(html);
  const metaDesc = extractMetaDescription(html);
  const h1 = extractH1(html);
  const h2s = extractH2s(html);
  const bodyText = extractBodyText(html);

  const match = scoreIntentMatch(keyword, title, metaDesc, h1, h2s, bodyText);

  // Overall score = weighted average
  const overallScore = Math.round(
    match.titleMatch * 0.25 +
    match.h1Match * 0.20 +
    match.first100Words * 0.20 +
    match.bodyMatch * 0.15 +
    match.headingMatch * 0.10 +
    match.metaMatch * 0.10
  );

  return res.json({
    url,
    keyword,
    overallScore,
    intentType: match.intentType,
    title,
    metaDescription: metaDesc,
    h1,
    scores: {
      titleMatch: match.titleMatch,
      h1Match: match.h1Match,
      first100Words: match.first100Words,
      bodyMatch: match.bodyMatch,
      headingMatch: match.headingMatch,
      metaMatch: match.metaMatch,
    },
    checks: {
      keywordInTitle: match.keywordInTitle,
      keywordInH1: match.keywordInH1,
      keywordInFirst100: match.keywordInFirst100,
    },
    recommendations: match.recommendations,
  });
});

export default router;
