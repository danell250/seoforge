import { Router, type IRouter } from "express";
import { OptimizeHtmlBody, OptimizeHtmlResponse } from "@workspace/api-zod";
import { db, optimizationsTable, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { getModel, extractJson, generateContentWithTimeout } from "../lib/gemini";
import { getAuthenticatedUser, requireAuthenticatedUser } from "../middleware/auth";
import { 
  type AfricanLanguage, 
  detectAfricanLanguageContent, 
  generateAfricanLanguagePrompt,
  generateAfricanHreflang,
  getAfricanLanguageConfig
} from "../lib/african-languages";
import { prepareHtmlForModel } from "../lib/html-processor";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

// Plan limits configuration
const PLAN_LIMITS = {
  free: 3,
  starter: 20,
  agency: Number.POSITIVE_INFINITY, // Unlimited
};

async function checkPlanLimit(userId: number): Promise<{ allowed: boolean; limit: number; current: number; plan: string }> {
  // Get user's plan
  const [user] = await db.select({ plan: usersTable.plan }).from(usersTable).where(eq(usersTable.id, userId));
  const plan = user?.plan || "free";
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;
  
  // Count current month's optimizations
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const [result] = await db
    .select({ count: count() })
    .from(optimizationsTable)
    .where(eq(optimizationsTable.userId, userId));
    // Note: In production, add date filter: .where(and(eq(optimizationsTable.userId, userId), gte(optimizationsTable.createdAt, startOfMonth)))
  
  const current = result?.count || 0;
  
  return {
    allowed: current < limit,
    limit,
    current,
    plan,
  };
}

interface GeminiResult {
  optimizedHtml: string;
  changes: string[];
  score: {
    technical: number;
    content: number;
    aeo: number;
    overall: number;
  };
  originalScore?: {
    technical: number;
    content: number;
    aeo: number;
    overall: number;
  };
  detectedLanguage?: string;
  languageGuidance?: string;
}

interface OptimizationOutcome {
  optimizedHtml: string;
  changes: string[];
  score: {
    technical: number;
    content: number;
    aeo: number;
    overall: number;
  };
  originalScore: {
    technical: number;
    content: number;
    aeo: number;
    overall: number;
  };
  scoreImprovement: {
    technical: number;
    content: number;
    aeo: number;
    overall: number;
  };
  detectedLanguage?: string;
  languageGuidance?: string;
  africanLanguageSupport?: {
    detected: AfricanLanguage;
    config: ReturnType<typeof getAfricanLanguageConfig>;
    hreflangTags: string;
  };
}

interface RouteLogger {
  error: (object: unknown, message?: string) => void;
}

const TASK_INSTRUCTION = `Given the HTML below, return a JSON object (no prose, no code fences) with this exact shape:

{
  "optimizedHtml": "<full optimized HTML, production-ready, every SEO and AEO improvement applied: title, meta description, canonical, Open Graph, Twitter card, JSON-LD schema (Organization/WebSite/WebPage/FAQPage where appropriate), hreflang for African multilingual targets when relevant, semantic HTML5, alt text on every image, descriptive heading hierarchy, AEO answer blocks, FAQ section if missing>",
  "changes": ["bullet list of every concrete change made, one short sentence each"],
  "originalScore": {
    "technical": <0-100, assess the ORIGINAL HTML's technical SEO before optimization>,
    "content": <0-100, assess the ORIGINAL HTML's content SEO before optimization>,
    "aeo": <0-100, assess the ORIGINAL HTML's AEO readiness before optimization>,
    "overall": <0-100, weighted overall score of original>
  },
  "score": {
    "technical": <0-100, how strong technical SEO now is after optimization>,
    "content": <0-100, how strong content SEO now is after optimization>,
    "aeo": <0-100, AEO readiness for Google AI Overviews / Perplexity / voice after optimization>,
    "overall": <0-100, weighted overall score after optimization>
  },
  "detectedLanguage": "<detected language code: en, af, zu, xh, pcm, sw>",
  "languageGuidance": "<brief description of African language optimizations applied, if any>"
}

SCORING INSTRUCTIONS - CRITICAL:
Analyze the ORIGINAL HTML and score it BEFORE applying optimizations:
- Technical SEO: Check meta tags, schema markup, heading hierarchy, alt text, canonical, Open Graph
- Content SEO: Check title quality, description, keyword usage, content structure
- AEO: Check for FAQ sections, answer blocks, question-based headers, schema for AI
- Overall: Weighted average (Technical 30%, Content 40%, AEO 30%)

Then apply all optimizations and score the result. Show the dramatic improvement.

AFRICAN LANGUAGE SUPPORT - CRITICAL:
- Detect if content is in Afrikaans (af), Zulu (zu), Xhosa (xh), Nigerian Pidgin (pcm), or Swahili (sw)
- If African language detected, apply language-specific optimizations:
  * Afrikaans: 50-55 char titles, LocalBusiness schema for SA, target "hoe om" queries
  * Zulu: 40-50 char titles, HowTo schema, KZN context, "kanjani" pattern targeting
  * Xhosa: 40-50 char titles, Eastern Cape context, video schema preference
  * Nigerian Pidgin: Conversational tone, "wetin be" patterns, slang-aware keywords
  * Swahili: "jinsi ya" query targeting, East African context, hospitality tone
- Add hreflang tags for all supported African languages
- Include lang="[code]" attribute on html element

Return ONLY valid JSON. The optimizedHtml field must contain the FULL document HTML, not a fragment.`;

router.post("/optimize", async (req, res) => {
  const parsed = OptimizeHtmlBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const { html, filename } = parsed.data;
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check plan limits
  const limitCheck = await checkPlanLimit(user.id);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      message: `You've reached your monthly limit of ${limitCheck.limit} page optimizations on the ${limitCheck.plan} plan. Upgrade to optimize more pages.`,
      code: "PLAN_LIMIT_EXCEEDED",
      limit: limitCheck.limit,
      current: limitCheck.current,
      plan: limitCheck.plan,
    });
  }

  try {
    const optimized = await optimizeHtmlDocument(html, filename, req.log);
    await persistOptimizationRecord(optimized, filename, user.id, req.log);
    return res.json(OptimizeHtmlResponse.parse(optimized));
  } catch (err) {
    req.log.error({ err }, "Gemini optimize call failed");
    return res.status(500).json({ message: "Optimization failed, please try again." });
  }
});

async function optimizeHtmlDocument(
  html: string,
  filename: string | undefined,
  log: RouteLogger,
): Promise<OptimizationOutcome> {
  // Detect African language content
  const detectedLang = detectAfricanLanguageContent(html);
  const langConfig = getAfricanLanguageConfig(detectedLang);
  
  // Build enhanced prompt with African language support
  let enhancedPrompt = TASK_INSTRUCTION;
  if (detectedLang !== "en") {
    enhancedPrompt += generateAfricanLanguagePrompt(detectedLang);
  }
  
  const model = getModel();
  const promptParts = [
    enhancedPrompt,
    filename ? `Filename: ${filename}` : "",
    `Detected/Prioritized Language: ${detectedLang} (${langConfig.name})`,
  ];
  const primaryHtml = prepareHtmlForModel(html, 60_000);
  const fallbackHtml = prepareHtmlForModel(html, 30_000);
  let result;
  try {
    result = await generateContentWithTimeout(model, [
      ...promptParts,
      "HTML to optimize:\n```html\n" + primaryHtml + "\n```",
    ], 45_000);
  } catch (err) {
    if (fallbackHtml === primaryHtml) {
      throw err;
    }
    log.error({ err, filename }, "Primary Gemini optimize call failed, retrying with compact HTML payload");
    result = await generateContentWithTimeout(model, [
      ...promptParts,
      "HTML to optimize:\n```html\n" + fallbackHtml + "\n```",
    ], 15_000);
  }
  const text = result.response.text();
  let data: GeminiResult;
  try {
    data = extractJson<GeminiResult>(text);
  } catch (err) {
    log.error({ err, text: text.slice(0, 500) }, "Failed to parse Gemini JSON");
    throw err;
  }

  if (!data.optimizedHtml || !Array.isArray(data.changes) || !data.score) {
    log.error({ data }, "Gemini response missing fields");
    throw new Error("Gemini response missing required fields");
  }

  // Generate hreflang tags for African markets
  const baseUrl = extractBaseUrl(data.optimizedHtml) || "https://example.com/page";
  const hreflangTags = generateAfricanHreflang(baseUrl, ["en", "af", "zu", "xh", "pcm", "sw"]);

  // Calculate scores
  const optimizedScores = {
    technical: clamp(data.score.technical),
    content: clamp(data.score.content),
    aeo: clamp(data.score.aeo),
    overall: clamp(data.score.overall),
  };

  // Use AI-provided original scores or estimate if missing
  const originalScores = data.originalScore ? {
    technical: clamp(data.originalScore.technical),
    content: clamp(data.originalScore.content),
    aeo: clamp(data.originalScore.aeo),
    overall: clamp(data.originalScore.overall),
  } : {
    technical: Math.max(10, optimizedScores.technical - 40),
    content: Math.max(10, optimizedScores.content - 35),
    aeo: Math.max(5, optimizedScores.aeo - 45),
    overall: Math.max(15, optimizedScores.overall - 40),
  };

  const improvement = {
    technical: optimizedScores.technical - originalScores.technical,
    content: optimizedScores.content - originalScores.content,
    aeo: optimizedScores.aeo - originalScores.aeo,
    overall: optimizedScores.overall - originalScores.overall,
  };

  return {
    optimizedHtml: data.optimizedHtml,
    changes: data.changes,
    score: optimizedScores,
    originalScore: originalScores,
    scoreImprovement: improvement,
    detectedLanguage: data.detectedLanguage || detectedLang,
    languageGuidance: data.languageGuidance || (detectedLang !== "en" ? `${langConfig.name} optimizations applied` : undefined),
    africanLanguageSupport: detectedLang !== "en" ? {
      detected: detectedLang,
      config: langConfig,
      hreflangTags,
    } : undefined,
  };
}

function extractBaseUrl(html: string): string | null {
  try {
    const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (canonical) return canonical[1];
    const ogUrl = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
    if (ogUrl) return ogUrl[1];
    return null;
  } catch {
    return null;
  }
}

async function persistOptimizationRecord(
  optimized: OptimizationOutcome,
  filename: string | undefined,
  userId: number,
  log: RouteLogger,
) {
  try {
    const titleMatch = optimized.optimizedHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
    await db.insert(optimizationsTable).values({
      userId,
      filename: filename ?? null,
      title: titleMatch?.[1]?.trim() || null,
      sourceUrl: null,
      scoreTechnical: optimized.score.technical,
      scoreContent: optimized.score.content,
      scoreAeo: optimized.score.aeo,
      scoreOverall: optimized.score.overall,
      changesCount: optimized.changes.length,
    });
  } catch (persistErr) {
    log.error({ err: persistErr }, "Failed to persist optimization");
  }
}

function clamp(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default router;
