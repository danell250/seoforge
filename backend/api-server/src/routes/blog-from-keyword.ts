import { Router, type IRouter } from "express";
import { runSeoaxeJsonTask } from "../lib/seoaxe-ai";
import { getWorkspaceMemory, type WorkspaceMemory } from "../lib/workspace-memory";
import { GroqApiError, GroqTimeoutError } from "../lib/groq";

const router: IRouter = Router();
// Temporarily public for bulk article generation
// router.use(requireAuthenticatedUser);

interface BlogFromKeyword {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
  wordCount: number;
  searchIntent?: string;
  contentGaps?: string[];
  internalLinkSuggestions?: string[];
  semanticKeywords?: string[];
  schemaType?: string;
  readingTime?: number;
  seoScore?: number;
}

const BLOG_FROM_KEYWORD_TASK = `You are an elite SEO content strategist with 15+ years of experience ranking #1 on Google. You understand that ranking requires beating existing content, not just being "good." Create content that DOMINATES SERPs.

ANALYZE THE SEARCH INTENT FIRST:
- Informational (learning/knowing): "how to", "what is", "guide", "tutorial"
- Commercial (comparing/buying): "best", "top", "vs", "comparison", "review"
- Transactional (ready to buy): "buy", "discount", "price", "deal", "free trial"
- Navigational (finding a brand): brand names, "login", "official"

MATCH YOUR CONTENT STRUCTURE TO THE DOMINANT INTENT IN THE TOP 10 RESULTS.

Return ONLY a JSON object (no prose, no code fences) of this exact shape:

{
  "title": "Main article title (H1) - MUST contain keyword + power words + curiosity gap or number",
  "metaTitle": "SEO meta title (50-60 chars, includes keyword + benefit/urgency)",
  "metaDescription": "Meta description (150-160 chars, includes keyword + CTA + specific benefit)",
  "slug": "url-slug-for-article (include exact keyword, 3-5 words)",
  "content": "Full HTML content",
  "searchIntent": "informational|commercial|transactional",
  "contentGaps": ["3-5 topics competitors are missing that this article covers"],
  "internalLinkSuggestions": ["3-5 suggested anchor text phrases for internal linking"],
  "semanticKeywords": ["15-20 LSI/related keywords to sprinkle throughout"],
  "schemaType": "Article|BlogPosting|FAQPage|HowTo|Review"
}

ADVANCED CONTENT REQUIREMENTS:
- LENGTH: 2000-3000 words (thoroughly beats thin content)
- STRUCTURE: Match top-ranking patterns
  * Informational: Definition → Step-by-step → Examples → FAQ
  * Commercial: Problem → Solutions → Comparison → Recommendation
  * Transactional: Benefits → Features → Social Proof → CTA
- HOOK: First 100 words must contain the EXACT keyword + a bold promise/statistic
- H2 HEADINGS: 6-8 sections, each addressing a sub-topic searchers actually care about
  * Include "What is [keyword]" if informational
  * Include "Best [keyword] for [use case]" if commercial
  * Include numbered lists ("Top 10", "7 Ways", "5 Tips") where appropriate
- H3 SUBHEADINGS: 2-3 per H2, specific and actionable
- CONTENT DEPTH:
  * Include original insights, not just regurgitated information
  * Add specific statistics with (estimated) percentages/dollar amounts
  * Include real-world examples and case studies
  * Address common objections/questions
  * Add "Pro Tips" or "Expert Insights" callout boxes
- FAQ SECTION: 7-10 questions based on "People Also Ask" patterns
  * Use question words: What, How, Why, When, Is, Can, Does
  * Answer directly in 40-60 words, then expand
- READABILITY:
  * Short paragraphs (2-3 sentences max)
  * Bullet points for lists
  * Bold key phrases
  * Transition words between sections
- EEAT SIGNALS (Expertise, Experience, Authoritativeness, Trustworthiness):
  * Include "Last updated: [current date]" at top
  * Add author expertise indicators (implied through depth)
  * Include "Sources" or "References" section mentioning credible sources
  * Add trust signals: warnings, best practices, expert tips
- SCHEMA RECOMMENDATIONS:
  * Article schema with headline, description, publish date
  * FAQ schema for the FAQ section
  * HowTo schema if tutorial-style
  * Review schema if comparing products
- INTERNAL LINKING:
  * Suggest 3-5 anchor text phrases for linking to other articles
  * Natural placement in content flow
- FRESHNESS SIGNALS:
  * Mention current year (2026) and trends
  * "Updated for [year]" in title/meta if appropriate
  * Recent data points

SEMANTIC KEYWORD COVERAGE:
Include these types of related terms:
- Synonyms (e.g., "VoIP" → "voice over IP", "internet calling")
- Related topics (e.g., for "CRM" → "customer retention", "sales pipeline")
- Entity connections (brands, tools, concepts in the space)

HTML FORMATTING RULES:
- <h1> for title only
- <h2> for main sections (no H2 in first 100 words)
- <h3> for subsections
- <p> for body text (short paragraphs)
- <ul>/<li> for lists
- <strong> for emphasis (not <b>)
- <em> for subtle emphasis
- <blockquote> for expert quotes or important callouts
- <div class="pro-tip"> for expert tips (if applicable)

DO NOT INCLUDE:
- JSON-LD schema markup (frontend handles this)
- Emojis
- Generic fluff
- Marketing jargon
- Unrealistic promises
- Duplicate content from competitors

KEYWORD STRATEGY:
- Primary keyword: EXACT match in title, H1, first 100 words, 1 H2, conclusion
- Secondary keywords: 5-10 related terms in H2s and throughout
- LSI keywords: 15-20 semantic variations naturally woven in
- Long-tail variations: Include in H3s and FAQs`

router.post("/blog-from-keyword", async (req, res) => {
  const { keyword, tone } = req.body;
  
  if (!keyword || typeof keyword !== "string") {
    return res.status(400).json({ message: "Keyword is required" });
  }

  try {
    const workspaceMemory = await getWorkspaceMemory();
    const tonePrompt = tone ? `Write in a ${tone} tone.` : "Write in an authoritative, practical tone.";
    
    let data: BlogFromKeyword;
    
    try {
      data = await runSeoaxeJsonTask<BlogFromKeyword>({
        taskName: "blog-from-keyword",
        taskPrompt: `${BLOG_FROM_KEYWORD_TASK}\n\n${tonePrompt}\n\nCurrent date: ${new Date().toISOString().split('T')[0]}`,
        systemInstruction: "You are the world's elite SEO content strategist. You have ranked thousands of articles #1 on Google. Your content beats competitors because you understand search intent, cover topics exhaustively, and follow Google's EEAT guidelines perfectly. Every article you write is designed to dominate SERPs.",
        html: keyword,
        htmlLabel: "Target Keyword",
        primaryHtmlLimit: 10_000,
        fallbackHtmlLimit: 5_000,
        timeoutMs: 90_000, // Increased for deeper content
        fallbackTimeoutMs: 60_000,
        extraParts: [
          `Target Keyword: ${keyword}`,
          `Word Count Target: 2000-3000 words (comprehensive, beats thin content)`,
          `Brand Name: ${workspaceMemory.brandName || "Our Brand"}`,
          `Brand Voice: ${workspaceMemory.brandVoice || "Authoritative, practical, expert"}`,
          `Content Goal: Rank #1 for "${keyword}" by creating the best, most comprehensive resource`,
        ],
        log: req.log,
      });
    } catch (err) {
      req.log.error({ err, keyword }, "Blog generation AI task failed");
      
      if (err instanceof GroqTimeoutError) {
        return res.status(504).json({
          message: "The blog generation took too long. Try a shorter keyword or simpler topic.",
          error: err.message,
          code: "GENERATION_TIMEOUT"
        });
      }
      
      if (err instanceof GroqApiError) {
        return res.status(502).json({
          message: "AI service temporarily unavailable. Please try again.",
          error: err.message,
          code: "AI_SERVICE_ERROR"
        });
      }
      
      return res.status(500).json({ 
        message: "Blog generation failed. Please try again.",
        error: err instanceof Error ? err.message : "Unknown error",
        code: "GENERATION_FAILED"
      });
    }

    // Validate required fields
    if (!data.title || !data.content || !data.metaTitle || !data.metaDescription) {
      return res.status(500).json({ message: "Generated blog is missing required fields." });
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.title);
    }

    // Estimate word count and reading time
    data.wordCount = estimateWordCount(data.content);
    data.readingTime = Math.ceil(data.wordCount / 200); // 200 words per minute average

    // Estimate SEO score based on optimization signals
    data.seoScore = estimateSeoScore(data);

    return res.json(data);
  } catch (err) {
    req.log.error({ err }, "Blog from keyword generation failed");
    return res.status(500).json({ message: "Blog generation failed, please try again." });
  }
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function estimateWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

function estimateSeoScore(data: BlogFromKeyword): number {
  let score = 70; // Base score
  
  // Length bonus
  if (data.wordCount && data.wordCount >= 2000) score += 10;
  if (data.wordCount && data.wordCount >= 2500) score += 5;
  
  // Meta optimization
  if (data.metaTitle && data.metaTitle.length >= 50 && data.metaTitle.length <= 60) score += 5;
  if (data.metaDescription && data.metaDescription.length >= 150 && data.metaDescription.length <= 160) score += 5;
  
  // Content structure
  const h2Count = (data.content.match(/<h2/gi) || []).length;
  if (h2Count >= 6) score += 5;
  if (h2Count >= 8) score += 3;
  
  // FAQ presence
  if (data.content.includes('FAQ') || data.content.includes('Frequently Asked')) score += 5;
  
  // Semantic keywords
  if (data.semanticKeywords && data.semanticKeywords.length >= 10) score += 3;
  
  // Content gaps identified
  if (data.contentGaps && data.contentGaps.length > 0) score += 2;
  
  return Math.min(100, score);
}

export default router;
