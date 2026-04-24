import { Router, type IRouter } from "express";
import { getModel, extractJson } from "../lib/gemini";
import { requireAuthenticatedUser } from "../middleware/auth";
import { 
  type AfricanLanguage,
  detectAfricanLanguageContent,
  getAfricanLanguageConfig,
  generateAfricanLanguagePrompt
} from "../lib/african-languages";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

interface BlogArticle {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  slug: string;
}

const BLOG_GENERATION_TASK = `You are an expert SEO and AEO content writer. Based on the optimized webpage HTML provided below, generate a complete, high-quality blog article of approximately 1500 words.

The article must be:
1. AEO-optimized for Google AI Overviews, ChatGPT, and Perplexity
2. SEO-optimized with proper keyword usage
3. Engaging and valuable for human readers
4. Comprehensive and authoritative

Return ONLY a JSON object (no prose, no code fences) of this exact shape:

{
  "title": "Main article title (H1)",
  "metaTitle": "SEO meta title for search results (under 60 characters)",
  "metaDescription": "SEO meta description (under 160 characters, compelling click-through)",
  "slug": "url-slug-for-article",
  "content": "Full HTML content of the article with proper formatting"
}

Content structure requirements:
- Start with a compelling introduction
- Use H2 headings for main sections (at least 4 sections)
- Use H3 subheadings where appropriate
- Include a dedicated FAQ section near the end with at least 3 questions and detailed answers
- End with a strong conclusion/call-to-action
- The content should be in HTML format with proper <p>, <h2>, <h3>, <ul>, <li> tags
- Include schema markup at the end: FAQPage JSON-LD
- Make it specific to the page topic - not generic
- Write for South African businesses and context where relevant
- Include practical, actionable advice
- No fluff, no emojis, no marketing jargon

AFRICAN LANGUAGE SUPPORT:
- If the content is in an African language (Afrikaans, Zulu, Xhosa, Nigerian Pidgin, Swahili), the blog article MUST be written in the SAME language
- Maintain language-specific SEO requirements (title lengths, question patterns, cultural context)
- Use appropriate local terminology and expressions
- Ensure the content resonates with speakers of that language

Topic extraction: Analyze the HTML to understand what the page is about and expand on that topic with deeper insights, related concepts, and valuable information that positions this as an authoritative resource.`;

router.post("/generate-blog", async (req, res) => {
  const { html, topic, targetLanguage } = req.body;
  
  if (!html || typeof html !== "string") {
    return res.status(400).json({ message: "HTML content is required" });
  }

  try {
    // Detect African language if not explicitly specified
    const detectedLang: AfricanLanguage = targetLanguage || detectAfricanLanguageContent(html);
    const langConfig = getAfricanLanguageConfig(detectedLang);
    
    // Build enhanced prompt with African language support
    let enhancedTask = BLOG_GENERATION_TASK;
    if (detectedLang !== "en") {
      enhancedTask += generateAfricanLanguagePrompt(detectedLang);
      enhancedTask += `\n\nCRITICAL: Write the ENTIRE blog article in ${langConfig.name} (${langConfig.nativeName}). The title, meta tags, and all content must be in this language.`;
    }
    
    const model = getModel();
    const result = await model.generateContent([
      enhancedTask,
      topic ? `Page topic hint: ${topic}` : "",
      `Target Language: ${detectedLang} (${langConfig.name})`,
      "Optimized HTML Content:\n```html\n" + html.slice(0, 100_000) + "\n```",
    ]);
    
    const text = result.response.text();
    let data: BlogArticle;
    
    try {
      data = extractJson<BlogArticle>(text);
    } catch (err) {
      req.log.error({ err, text: text.slice(0, 500) }, "Blog generation parse failed");
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

    return res.json({
      title: data.title,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      slug: data.slug,
      content: data.content,
      wordCount: estimateWordCount(data.content),
      language: detectedLang,
      languageName: langConfig.name,
    });
  } catch (err) {
    req.log.error({ err }, "Blog generation call failed");
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
  // Strip HTML tags and estimate word count
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

export default router;
