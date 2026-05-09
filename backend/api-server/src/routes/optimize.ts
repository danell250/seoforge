import { Router, type IRouter } from "express";
import { OptimizeHtmlBody, OptimizeHtmlResponse } from "@workspace/api-zod";
import { createHash } from "node:crypto";
import { aiFeedbackTable, aiTrainingExamplesTable, db, optimizationsTable, usersTable } from "@workspace/db";
import { and, count, eq, gte } from "drizzle-orm";
import { getAuthenticatedUser, requireAuthenticatedUser } from "../middleware/auth";
import { 
  type AfricanLanguage, 
  detectAfricanLanguageContent, 
  generateAfricanLanguagePrompt,
  generateAfricanHreflang,
  getAfricanLanguageConfig
} from "../lib/african-languages";
import { runSeoaxeJsonTask, type AiLogger } from "../lib/seoaxe-ai";
import { buildRulePackPrompt, inferPageType, type SeoaxePageType } from "../lib/page-rules";
import { evaluateOptimizationOutput, type OptimizationAiReview } from "../lib/ai-evals";
import { buildWorkspaceMemoryPrompt, getWorkspaceMemory } from "../lib/workspace-memory";
import { buildAcceptedExamplesPrompt } from "../lib/training-patterns";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

// Plan limits configuration
const PLAN_LIMITS = {
  free: 3,
  starter: 20,
  agency: Number.POSITIVE_INFINITY, // Unlimited
};

async function checkPlanLimit(userId: number): Promise<{ allowed: boolean; limit: number; current: number; plan: string }> {
  try {
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
      .where(
        and(
          eq(optimizationsTable.userId, userId),
          gte(optimizationsTable.createdAt, startOfMonth),
        ),
      );
    
    const current = result?.count || 0;
    
    return {
      allowed: current < limit,
      limit,
      current,
      plan,
    };
  } catch (err) {
    console.error("Plan limit check failed, defaulting to allowed:", err);
    return { allowed: true, limit: 3, current: 0, plan: "free" };
  }
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
  optimizationId?: number;
  optimizedHtml: string;
  changes: string[];
  pageType: SeoaxePageType;
  aiReview: OptimizationAiReview;
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

const TASK_INSTRUCTION = `Return a JSON object (no prose, no code fences) with this shape:

{
  "optimizedHtml": "<full optimized code, every SEO and AEO improvement applied. Optimize: title, meta, canonical, OG, Twitter, JSON-LD schema (Org/WebSite/FAQ), hreflang, semantic HTML, alt text, heading hierarchy, AEO answer blocks. If TS/TSX, maintain code but optimize HTML/JSX strings.>",
  "changes": ["list of concrete changes made"],
  "originalScore": { "technical": 0-100, "content": 0-100, "aeo": 0-100, "overall": 0-100 },
  "score": { "technical": 0-100, "content": 0-100, "aeo": 0-100, "overall": 0-100 },
  "detectedLanguage": "en|af|zu|xh|pcm|sw",
  "languageGuidance": "brief description of language optimizations"
}

CRITICAL: Return ONLY valid JSON. optimizedHtml must contain the FULL document code.`;

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
    req.log.info({ filename, htmlLength: html.length }, "Starting optimization request");
    
    const optimized = await optimizeHtmlDocument(html, filename, user.id, req.log);
    req.log.info("AI optimization complete");

    // "Safe-to-Fail" Persistence: If DB saving fails, we still want to return the result to the user!
    try {
      req.log.info("Attempting to persist results to database");
      const optimizationId = await persistOptimizationRecord(optimized, filename, user.id, req.log);
      optimized.optimizationId = optimizationId ?? undefined;
      
      if (optimizationId) {
        req.log.info({ optimizationId }, "Persisting feedback and training seeds");
        // These are non-critical, so we don't await them or we wrap them tightly
        persistOptimizationFeedbackSeed(optimized, optimizationId, user.id, req.log).catch(e => req.log.error(e, "Feedback seed failed"));
        persistTrainingExampleSeed(html, optimized, optimizationId, user.id, req.log).catch(e => req.log.error(e, "Training seed failed"));
      }
    } catch (dbErr) {
      req.log.error({ err: dbErr }, "Non-critical persistence failure - continuing to return result to user");
    }
    
    try {
      return res.json(OptimizeHtmlResponse.parse(optimized));
    } catch (zodErr) {
      req.log.error({ err: zodErr }, "Zod validation failed for optimization result");
      return res.json(optimized);
    }
  } catch (err) {
    req.log.error({ 
      err: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      filename,
      htmlLength: html.length 
    }, "Optimization workflow failed");
    
    return res.status(500).json({ 
      message: "Optimization failed. This often happens if the code is too large or the AI timed out.",
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

async function optimizeHtmlDocument(
  html: string,
  filename: string | undefined,
  userId: number,
  log: AiLogger,
): Promise<OptimizationOutcome> {
  // Detect African language content
  const detectedLang = detectAfricanLanguageContent(html);
  const langConfig = getAfricanLanguageConfig(detectedLang);
  const pageType = inferPageType({ html, filename });
  
  let workspaceMemory = null;
  try {
    workspaceMemory = await getWorkspaceMemory();
  } catch (e) {
    log.error({ err: e }, "Failed to load workspace memory");
  }

  let acceptedExamplesPrompt = null;
  try {
    acceptedExamplesPrompt = await buildAcceptedExamplesPrompt(userId, "optimize", pageType);
  } catch (e) {
    log.error({ err: e }, "Failed to load accepted examples");
  }
  
  // Build enhanced prompt with African language support
  let enhancedPrompt = `${TASK_INSTRUCTION}\n\n${buildRulePackPrompt("optimize", pageType)}`;
  if (detectedLang !== "en") {
    enhancedPrompt += generateAfricanLanguagePrompt(detectedLang);
  }
  
  log.info({ pageType, detectedLang, promptLength: enhancedPrompt.length }, "Calling AI model");

  try {
    if (!process.env.GEMINI_API_KEY) {
      log.info("GEMINI_API_KEY missing; using deterministic fallback optimizer");
      return fallbackOptimizeWithoutAi({ html, pageType, detectedLang });
    }

    const data = await runSeoaxeJsonTask<GeminiResult>({
      taskName: "optimize-html",
      taskPrompt: enhancedPrompt,
      systemInstruction:
        "You are the core SEOaxe page optimizer. Transform full HTML/TS/TSX documents safely. RETURN ONLY VALID JSON. IMPORTANT: Do not use backticks (```) inside the optimizedHtml JSON field, as this breaks the JSON parser. Use single quotes or escaped double quotes for internal code.",
      html,
      htmlLabel: "Code to optimize",
      primaryHtmlLimit: 40_000,
      fallbackHtmlLimit: 20_000,
      timeoutMs: 28_000,
      fallbackTimeoutMs: 12_000,
      extraParts: [
        filename ? `Filename: ${filename}` : undefined,
        `Detected/Prioritized Language: ${detectedLang} (${langConfig.name})`,
        workspaceMemory ? buildWorkspaceMemoryPrompt(workspaceMemory) : undefined,
        acceptedExamplesPrompt ?? undefined,
      ],
      log,
    });

    log.info("AI model response received and parsed successfully");

    if (!data.optimizedHtml || !Array.isArray(data.changes) || !data.score) {
      log.error({ dataKeys: Object.keys(data) }, "Gemini response missing critical fields");
      throw new Error("AI response missing required fields (optimizedHtml, changes, or score)");
    }

    // ... rest of the function remains same
    const baseUrl = extractBaseUrl(data.optimizedHtml) || "https://example.com/page";
    const hreflangTags = generateAfricanHreflang(baseUrl, ["en", "af", "zu", "xh", "pcm", "sw"]);

    const optimizedScores = {
      technical: clamp(data?.score?.technical ?? 0),
      content: clamp(data?.score?.content ?? 0),
      aeo: clamp(data?.score?.aeo ?? 0),
      overall: clamp(data?.score?.overall ?? 0),
    };

    // Use AI-provided original scores or estimate if missing
    const originalScores = data?.originalScore ? {
      technical: clamp(data.originalScore.technical ?? 0),
      content: clamp(data.originalScore.content ?? 0),
      aeo: clamp(data.originalScore.aeo ?? 0),
      overall: clamp(data.originalScore.overall ?? 0),
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
    
    const aiReview = evaluateOptimizationOutput({
      originalHtml: html,
      optimizedHtml: data.optimizedHtml,
      changes: data.changes,
      pageType,
    });

    return {
      optimizedHtml: data.optimizedHtml,
      changes: data.changes,
      pageType,
      aiReview,
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
  } catch (aiErr) {
    log.error({ err: aiErr }, "AI model execution or JSON parsing failed; falling back");
    return fallbackOptimizeWithoutAi({ html, pageType, detectedLang });
  }
}

function fallbackOptimizeWithoutAi({
  html,
  pageType,
  detectedLang,
}: {
  html: string;
  pageType: SeoaxePageType;
  detectedLang: AfricanLanguage;
}): OptimizationOutcome {
  const normalized = html.trim();
  const looksLikeHtml = /<html[\s>]|<!doctype html>/i.test(normalized) || /<head[\s>]/i.test(normalized);
  const languageConfig = getAfricanLanguageConfig(detectedLang);
  const baseOriginal = estimateOriginalScore(normalized);

  if (!looksLikeHtml) {
    return {
      optimizedHtml: normalized,
      changes: [
        "Kept source structure as-is because the input does not look like a full HTML document.",
        "Skipped AI-only semantic rewrites and returned deterministic fallback output.",
      ],
      pageType,
      aiReview: evaluateOptimizationOutput({
        originalHtml: html,
        optimizedHtml: normalized,
        changes: ["Fallback mode: non-HTML source retained"],
        pageType,
      }),
      score: baseOriginal,
      originalScore: baseOriginal,
      scoreImprovement: { technical: 0, content: 0, aeo: 0, overall: 0 },
      detectedLanguage: detectedLang,
      languageGuidance:
        detectedLang !== "en" ? `${languageConfig.name} detected. AI rewrite unavailable in fallback mode.` : undefined,
      africanLanguageSupport:
        detectedLang !== "en"
          ? {
              detected: detectedLang,
              config: languageConfig,
              hreflangTags: "",
            }
          : undefined,
    };
  }

  const changes: string[] = [];
  let optimizedHtml = normalized;

  const hasTitle = /<title[^>]*>[\s\S]*?<\/title>/i.test(optimizedHtml);
  if (!hasTitle) {
    optimizedHtml = optimizedHtml.replace(/<head([^>]*)>/i, `<head$1>\n  <title>Optimized page</title>`);
    changes.push("Added a missing <title> tag.");
  }

  const hasMetaDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(optimizedHtml);
  if (!hasMetaDescription) {
    optimizedHtml = optimizedHtml.replace(
      /<head([^>]*)>/i,
      `<head$1>\n  <meta name="description" content="Optimized by SEOaxe fallback mode for better search visibility.">`,
    );
    changes.push("Added a basic meta description.");
  }

  const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(optimizedHtml);
  if (!hasViewport) {
    optimizedHtml = optimizedHtml.replace(
      /<head([^>]*)>/i,
      `<head$1>\n  <meta name="viewport" content="width=device-width, initial-scale=1">`,
    );
    changes.push("Added a responsive viewport meta tag.");
  }

  const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(optimizedHtml);
  if (!hasCanonical) {
    optimizedHtml = optimizedHtml.replace(
      /<head([^>]*)>/i,
      `<head$1>\n  <link rel="canonical" href="https://example.com/">`,
    );
    changes.push("Added a canonical link placeholder.");
  }

  if (changes.length === 0) {
    changes.push("Fallback validation completed: required baseline SEO tags were already present.");
  }

  const improved = {
    technical: clamp(baseOriginal.technical + Math.min(20, changes.length * 5)),
    content: clamp(baseOriginal.content + Math.min(12, changes.length * 3)),
    aeo: clamp(baseOriginal.aeo + Math.min(10, changes.length * 2)),
    overall: 0,
  };
  improved.overall = clamp(Math.round((improved.technical + improved.content + improved.aeo) / 3));

  return {
    optimizedHtml,
    changes,
    pageType,
    aiReview: evaluateOptimizationOutput({
      originalHtml: html,
      optimizedHtml,
      changes,
      pageType,
    }),
    score: improved,
    originalScore: baseOriginal,
    scoreImprovement: {
      technical: improved.technical - baseOriginal.technical,
      content: improved.content - baseOriginal.content,
      aeo: improved.aeo - baseOriginal.aeo,
      overall: improved.overall - baseOriginal.overall,
    },
    detectedLanguage: detectedLang,
    languageGuidance:
      detectedLang !== "en" ? `${languageConfig.name} detected and preserved in fallback mode.` : undefined,
    africanLanguageSupport:
      detectedLang !== "en"
        ? {
            detected: detectedLang,
            config: languageConfig,
            hreflangTags: "",
          }
        : undefined,
  };
}

function estimateOriginalScore(html: string) {
  const title = /<title[^>]*>[\s\S]*?<\/title>/i.test(html);
  const description = /<meta[^>]*name=["']description["'][^>]*>/i.test(html);
  const h1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(html);
  const schema = /application\/ld\+json/i.test(html);
  const canonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
  const technical = clamp(35 + (title ? 15 : 0) + (description ? 15 : 0) + (canonical ? 10 : 0));
  const content = clamp(35 + (h1 ? 20 : 0));
  const aeo = clamp(25 + (schema ? 25 : 0));
  const overall = clamp(Math.round((technical + content + aeo) / 3));
  return { technical, content, aeo, overall };
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
  log: AiLogger,
): Promise<number | null> {
  try {
    const titleMatch = optimized.optimizedHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
    const [record] = await db.insert(optimizationsTable).values({
      userId,
      filename: filename ?? null,
      title: titleMatch?.[1]?.trim() || "Untitled Optimization",
      sourceUrl: null,
      scoreTechnical: optimized.score.technical ?? 0,
      scoreContent: optimized.score.content ?? 0,
      scoreAeo: optimized.score.aeo ?? 0,
      scoreOverall: optimized.score.overall ?? 0,
      changesCount: optimized.changes?.length ?? 0,
    }).returning({ id: optimizationsTable.id });
    return record?.id ?? null;
  } catch (persistErr) {
    log.error({ err: persistErr }, "Failed to persist optimization to database");
    return null;
  }
}

async function persistOptimizationFeedbackSeed(
  optimized: OptimizationOutcome,
  optimizationId: number,
  userId: number,
  log: AiLogger,
) {
  try {
    await db.insert(aiFeedbackTable).values({
      userId,
      optimizationId,
      taskName: "optimize",
      pageType: optimized.pageType,
      verdict: "pending",
      evaluationScore: optimized.aiReview.score,
      evaluationSummary: optimized.aiReview.summary,
      outputFingerprint: createHash("sha256").update(optimized.optimizedHtml).digest("hex"),
      note: null,
    });
  } catch (persistErr) {
    log.error({ err: persistErr }, "Failed to persist optimization feedback seed");
  }
}

async function persistTrainingExampleSeed(
  originalHtml: string,
  optimized: OptimizationOutcome,
  optimizationId: number,
  userId: number,
  log: AiLogger,
) {
  try {
    const titleMatch = optimized.optimizedHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
    await db.insert(aiTrainingExamplesTable).values({
      userId,
      optimizationId,
      taskName: "optimize",
      pageType: optimized.pageType,
      title: titleMatch?.[1]?.trim() || null,
      inputHtml: originalHtml,
      outputHtml: optimized.optimizedHtml,
      outputFingerprint: createHash("sha256").update(optimized.optimizedHtml).digest("hex"),
      evaluationScore: optimized.aiReview.score,
      evaluationSummary: optimized.aiReview.summary,
      feedbackVerdict: "pending",
      feedbackNote: null,
    });
  } catch (persistErr) {
    log.error({ err: persistErr }, "Failed to persist training example seed");
  }
}

function clamp(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default router;
