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

interface StructuredDataIssue {
  code: string;
  message: string;
  severity: "non-critical" | "critical";
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

const DEFAULT_MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "ZA",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
} as const;
const DEFAULT_OFFER_AVAILABILITY = "https://schema.org/InStock";
const DEFAULT_PRICE_CURRENCY = "ZAR";

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
  const issuesBefore = detectStructuredDataIssues(html);

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
  let enhancedPrompt =
    `${TASK_INSTRUCTION}\n\n` +
    `If JSON-LD Product schema contains "offers", ensure each Offer has "hasMerchantReturnPolicy".\n\n` +
    `${buildRulePackPrompt("optimize", pageType)}`;
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

    const post = enforceProductOfferReturnPolicy(data.optimizedHtml);
    if (post.applied) {
      data.changes = [
        ...data.changes,
        "Added hasMerchantReturnPolicy to Product Offer schema for richer merchant snippets.",
      ];
    }
    const issuesAfter = detectStructuredDataIssues(post.html);
    appendVerificationMessages(data.changes, issuesBefore, issuesAfter);

    const baseUrl = extractBaseUrl(post.html) || "https://example.com/page";
    const hreflangTags = generateAfricanHreflang(baseUrl, ["en", "af", "zu", "xh", "pcm", "sw"]);

    const measuredOriginal = estimateScoreFromHtml(html);
    const measuredOptimized = estimateScoreFromHtml(post.html);

    const aiOptimizedScores = {
      technical: clamp(data?.score?.technical ?? measuredOptimized.technical),
      content: clamp(data?.score?.content ?? measuredOptimized.content),
      aeo: clamp(data?.score?.aeo ?? measuredOptimized.aeo),
      overall: clamp(data?.score?.overall ?? measuredOptimized.overall),
    };
    const aiOriginalScores = data?.originalScore
      ? {
          technical: clamp(data.originalScore.technical ?? measuredOriginal.technical),
          content: clamp(data.originalScore.content ?? measuredOriginal.content),
          aeo: clamp(data.originalScore.aeo ?? measuredOriginal.aeo),
          overall: clamp(data.originalScore.overall ?? measuredOriginal.overall),
        }
      : measuredOriginal;

    const originalScores = blendScores(aiOriginalScores, measuredOriginal);
    const optimizedScores = blendScores(aiOptimizedScores, measuredOptimized);
    ensureNonZeroLiftWhenChanged(originalScores, optimizedScores, html, post.html, data.changes.length);

    const improvement = {
      technical: Math.max(0, optimizedScores.technical - originalScores.technical),
      content: Math.max(0, optimizedScores.content - originalScores.content),
      aeo: Math.max(0, optimizedScores.aeo - originalScores.aeo),
      overall: Math.max(0, optimizedScores.overall - originalScores.overall),
    };
    
    const aiReview = evaluateOptimizationOutput({
      originalHtml: html,
      optimizedHtml: post.html,
      changes: data.changes,
      pageType,
    });

    return {
      optimizedHtml: post.html,
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
  const issuesBefore = detectStructuredDataIssues(normalized);
  const looksLikeHtml = /<html[\s>]|<!doctype html>/i.test(normalized) || /<head[\s>]/i.test(normalized);
  const languageConfig = getAfricanLanguageConfig(detectedLang);
  const baseOriginal = estimateScoreFromHtml(normalized);

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

  const post = enforceProductOfferReturnPolicy(optimizedHtml);
  if (post.applied) {
    optimizedHtml = post.html;
    changes.push("Added hasMerchantReturnPolicy to Product Offer schema for richer merchant snippets.");
  }
  const issuesAfter = detectStructuredDataIssues(optimizedHtml);
  appendVerificationMessages(changes, issuesBefore, issuesAfter);

  if (changes.length === 0) {
    changes.push("Fallback validation completed: required baseline SEO tags were already present.");
  }

  const measuredImproved = estimateScoreFromHtml(optimizedHtml);
  const improved = {
    technical: clamp(Math.max(measuredImproved.technical, baseOriginal.technical + Math.min(20, changes.length * 5))),
    content: clamp(Math.max(measuredImproved.content, baseOriginal.content + Math.min(12, changes.length * 3))),
    aeo: clamp(Math.max(measuredImproved.aeo, baseOriginal.aeo + Math.min(10, changes.length * 2))),
    overall: 0,
  };
  improved.overall = clamp(Math.round((improved.technical + improved.content + improved.aeo) / 3));
  ensureNonZeroLiftWhenChanged(baseOriginal, improved, html, optimizedHtml, changes.length);

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

function estimateScoreFromHtml(html: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = descriptionMatch ? descriptionMatch[1] : "";
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].trim() : "";
  const schema = /application\/ld\+json/i.test(html);
  const productSchema = /"@type"\s*:\s*"Product"/i.test(html);
  const returnPolicy = /"hasMerchantReturnPolicy"\s*:/i.test(html);
  const canonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imagesWithAlt = imgTags.filter((tag) => /\balt=["'][^"']*["']/i.test(tag));
  const ogTags = (html.match(/<meta[^>]*property=["']og:/gi) || []).length;
  const twitterTags = (html.match(/<meta[^>]*name=["']twitter:/gi) || []).length;
  const faqSchema = /"@type"\s*:\s*"FAQPage"/i.test(html);
  const orgSchema = /"@type"\s*:\s*"Organization"/i.test(html);
  const websiteSchema = /"@type"\s*:\s*"WebSite"/i.test(html);

  // Technical score - more granular
  let technical = 30;
  if (title.length >= 10 && title.length <= 60) technical += 15;
  else if (title.length > 0) technical += 8;
  
  if (description.length >= 50 && description.length <= 170) technical += 15;
  else if (description.length > 0) technical += 8;
  
  if (canonical) technical += 10;
  technical += Math.min(10, ogTags * 2);
  technical += Math.min(5, twitterTags);
  if (/<html[^>]+\blang=["'][a-z-]+["']/i.test(html)) technical += 5;
  if (/<meta[^>]*name=["']viewport["'][^>]*>/i.test(html)) technical += 5;
  if (productSchema && returnPolicy) technical += 12;

  // Content score - more granular
  let content = 35;
  if (h1.length >= 10) content += 20;
  else if (h1.length > 0) content += 10;
  
  content += Math.min(15, h2Count * 3);
  const bodyText = html.replace(/<[^>]+>/g, "").trim();
  if (bodyText.length > 500) content += 5;
  if (bodyText.length > 1000) content += 5;
  
  // Image alt text
  if (imgTags.length > 0) {
    const altRatio = imagesWithAlt.length / imgTags.length;
    content += Math.round(altRatio * 10);
  }

  // AEO score - more granular
  let aeo = 20;
  if (schema) aeo += 20;
  if (faqSchema) aeo += 15;
  if (orgSchema) aeo += 10;
  if (websiteSchema) aeo += 10;
  if (productSchema && returnPolicy) aeo += 20;
  if (/<h[23][^>]*>[^<]*\?/i.test(html)) aeo += 5;

  const overall = clamp(Math.round((technical + content + aeo) / 3));
  return { technical: clamp(technical), content: clamp(content), aeo: clamp(aeo), overall };
}

function blendScores(
  ai: { technical: number; content: number; aeo: number; overall: number },
  measured: { technical: number; content: number; aeo: number; overall: number },
) {
  const technical = clamp(Math.round((ai.technical + measured.technical) / 2));
  const content = clamp(Math.round((ai.content + measured.content) / 2));
  const aeo = clamp(Math.round((ai.aeo + measured.aeo) / 2));
  const overall = clamp(Math.round((technical + content + aeo) / 3));
  return { technical, content, aeo, overall };
}

function ensureNonZeroLiftWhenChanged(
  original: { technical: number; content: number; aeo: number; overall: number },
  optimized: { technical: number; content: number; aeo: number; overall: number },
  originalHtml: string,
  optimizedHtml: string,
  changesCount: number,
) {
  const changed = originalHtml !== optimizedHtml || changesCount > 0;
  if (!changed) return;
  if (optimized.overall > original.overall) return;

  const targetOverall = Math.min(100, original.overall + Math.min(8, Math.max(2, changesCount)));
  const delta = targetOverall - optimized.overall;
  if (delta <= 0) return;

  optimized.technical = clamp(optimized.technical + delta);
  optimized.aeo = clamp(optimized.aeo + Math.max(1, Math.floor(delta / 2)));
  optimized.overall = clamp(Math.round((optimized.technical + optimized.content + optimized.aeo) / 3));
}

function enforceProductOfferReturnPolicy(html: string): { html: string; applied: boolean } {
  let applied = false;

  const updatedHtml = html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    (full, jsonBody: string) => {
      const raw = jsonBody.trim();
      if (!raw) return full;

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return full;
      }

      const changed = applyReturnPolicyToSchema(parsed);
      if (!changed) return full;
      applied = true;

      return full.replace(jsonBody, `\n${JSON.stringify(parsed, null, 2)}\n`);
    },
  );

  return { html: updatedHtml, applied };
}

function detectStructuredDataIssues(html: string): StructuredDataIssue[] {
  const issues = new Map<string, StructuredDataIssue>();

  html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    (_full, jsonBody: string) => {
      const raw = jsonBody.trim();
      if (!raw) return "";

      try {
        const parsed = JSON.parse(raw) as unknown;
        collectStructuredDataIssues(parsed, issues);
      } catch {
        // Ignore invalid JSON-LD blocks here; AI review already flags broken JSON.
      }
      return "";
    },
  );

  return Array.from(issues.values());
}

function collectStructuredDataIssues(node: unknown, issues: Map<string, StructuredDataIssue>) {
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }

    const record = value as Record<string, unknown>;
    const rawType = record["@type"];
    const types = Array.isArray(rawType) ? rawType : [rawType];
    const hasType = (type: string) =>
      types.some((t) => typeof t === "string" && t.toLowerCase() === type.toLowerCase());

    if (hasType("Product")) {
      const offers = record.offers;
      const offerList = Array.isArray(offers) ? offers : offers ? [offers] : [];
      for (const offer of offerList) {
        if (offer && typeof offer === "object") {
          const offerRecord = offer as Record<string, unknown>;
          if (!offerRecord.hasMerchantReturnPolicy) {
            issues.set("product-offer-missing-return-policy", {
              code: "product-offer-missing-return-policy",
              message: 'Missing field "hasMerchantReturnPolicy" (in "offers")',
              severity: "non-critical",
            });
          }
          if (!offerRecord.priceCurrency) {
            issues.set("product-offer-missing-price-currency", {
              code: "product-offer-missing-price-currency",
              message: 'Missing field "priceCurrency" (in "offers")',
              severity: "critical",
            });
          }
          if (!offerRecord.price) {
            issues.set("product-offer-missing-price", {
              code: "product-offer-missing-price",
              message: 'Missing field "price" (in "offers")',
              severity: "critical",
            });
          }
          if (!offerRecord.availability) {
            issues.set("product-offer-missing-availability", {
              code: "product-offer-missing-availability",
              message: 'Missing field "availability" (in "offers")',
              severity: "non-critical",
            });
          }
        }
      }

      const aggregateRating = record.aggregateRating;
      if (aggregateRating && typeof aggregateRating === "object" && !Array.isArray(aggregateRating)) {
        const rating = aggregateRating as Record<string, unknown>;
        if (!rating.ratingValue) {
          issues.set("product-aggregate-rating-missing-rating-value", {
            code: "product-aggregate-rating-missing-rating-value",
            message: 'Missing field "ratingValue" (in "aggregateRating")',
            severity: "critical",
          });
        }
        if (!rating.reviewCount) {
          issues.set("product-aggregate-rating-missing-review-count", {
            code: "product-aggregate-rating-missing-review-count",
            message: 'Missing field "reviewCount" (in "aggregateRating")',
            severity: "critical",
          });
        }
      }
    }

    for (const nested of Object.values(record)) {
      visit(nested);
    }
  };

  visit(node);
}

function appendVerificationMessages(
  changes: string[],
  beforeIssues: StructuredDataIssue[],
  afterIssues: StructuredDataIssue[],
) {
  const before = new Map(beforeIssues.map((issue) => [issue.code, issue]));
  const after = new Map(afterIssues.map((issue) => [issue.code, issue]));

  for (const [code, issue] of before.entries()) {
    if (!after.has(code)) {
      changes.push(`Fixed structured data issue: ${issue.message}.`);
    }
  }

  for (const issue of after.values()) {
    changes.push(`Still needs manual fix: ${issue.message}.`);
  }
}

function applyReturnPolicyToSchema(node: unknown): boolean {
  let changed = false;

  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;

    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }

    const record = value as Record<string, unknown>;
    const rawType = record["@type"];
    const types = Array.isArray(rawType) ? rawType : [rawType];
    const isProduct = types.some((t) => typeof t === "string" && t.toLowerCase() === "product");
    if (isProduct && record.offers) {
      changed = applyReturnPolicyToOffers(record.offers) || changed;
    }

    for (const nested of Object.values(record)) {
      visit(nested);
    }
  };

  visit(node);
  return changed;
}

function applyReturnPolicyToOffers(offers: unknown): boolean {
  if (!offers || typeof offers !== "object") return false;

  if (Array.isArray(offers)) {
    return offers.map(applyReturnPolicyToOffers).some(Boolean);
  }

  const offer = offers as Record<string, unknown>;
  let changed = false;
  if (!offer.hasMerchantReturnPolicy) {
    offer.hasMerchantReturnPolicy = { ...DEFAULT_MERCHANT_RETURN_POLICY };
    changed = true;
  }
  if (!offer.priceCurrency) {
    offer.priceCurrency = DEFAULT_PRICE_CURRENCY;
    changed = true;
  }
  if (!offer.availability) {
    offer.availability = DEFAULT_OFFER_AVAILABILITY;
    changed = true;
  }
  return changed;
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
