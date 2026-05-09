import { Router, type IRouter } from "express";
import { runSeoaxeJsonTask } from "../lib/seoaxe-ai";
import { getWorkspaceMemory, type WorkspaceMemory } from "../lib/workspace-memory";

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
}

const BLOG_FROM_KEYWORD_TASK = `You are an expert SEO content writer. Generate a complete, high-quality blog article of approximately 1500 words targeting the specific keyword provided.

Return ONLY a JSON object (no prose, no code fences) of this exact shape:

{
  "title": "Main article title (H1) - MUST contain the keyword naturally",
  "metaTitle": "SEO meta title (under 60 chars, includes keyword)",
  "metaDescription": "Meta description (under 160 chars, compelling, includes keyword)",
  "slug": "url-slug-for-article",
  "content": "Full HTML content"
}

Content requirements:
- Start with a compelling introduction that addresses the searcher's intent
- Use H2 headings for main sections (at least 5 sections)
- Use H3 subheadings where appropriate
- Include a dedicated FAQ section with at least 5 questions and detailed answers
- End with a strong conclusion
- Use proper HTML: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>
- DO NOT include JSON-LD schema markup in the content - the frontend will handle schema injection
- Make it actionable and practical
- No fluff, no emojis, no marketing jargon
- Include current year (2026) where relevant
- Target the EXACT keyword in title, H1, first paragraph, and at least 2 H2s
- Write in a clear, authoritative tone
- Include statistics or data points where appropriate (use realistic estimates if needed)
- Add related subtopics that expand on the main keyword

Keyword placement strategy:
- Title: exact match or close variant
- First 100 words: exact keyword appears
- At least 2 H2 sections: keyword or related terms
- Meta title: keyword included
- Meta description: keyword included`;

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
        taskPrompt: `${BLOG_FROM_KEYWORD_TASK}\n\n${tonePrompt}`,
        systemInstruction: "You are an SEO content specialist. Generate search-optimized blog articles from keywords that rank for the target query.",
        html: keyword,
        htmlLabel: "Target Keyword",
        primaryHtmlLimit: 5_000,
        fallbackHtmlLimit: 2_000,
        timeoutMs: 60_000,
        fallbackTimeoutMs: 30_000,
        extraParts: [
          `Target Keyword: ${keyword}`,
          `Word Count Target: 1500 words`,
          `Brand: ${workspaceMemory.brandName}`,
          `Voice: ${workspaceMemory.brandVoice}`,
        ],
        log: req.log,
      });
    } catch {
      return res.status(500).json({ message: "Blog generation failed, please try again." });
    }

    // Validate required fields
    if (!data.title || !data.content || !data.metaTitle || !data.metaDescription) {
      return res.status(500).json({ message: "Generated blog is missing required fields." });
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.title);
    }

    // Estimate word count
    data.wordCount = estimateWordCount(data.content);

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

export default router;
