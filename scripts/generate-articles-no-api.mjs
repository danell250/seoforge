#!/usr/bin/env node
import { runSeoaxeJsonTask } from "./backend/api-server/src/lib/seoaxe-ai.ts";
import { getWorkspaceMemory } from "./backend/api-server/src/lib/workspace-memory.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keywords = [
  "how to improve domain authority in 2026",
  "why my website is not ranking on google",
  "best seo tools for small business 2026",
  "how to get backlinks fast and safe",
  "seo checklist for new websites",
  "what is answer engine optimization",
  "how to optimize for google ai overviews",
  "schema markup for local seo south africa",
  "technical seo audit checklist 2026",
  "how to rank higher on google maps",
  "shopify seo mistakes to avoid",
  "wordpress seo plugins compared 2026",
  "how to fix crawl errors on website",
  "best keyword research tools free",
  "how to write seo friendly blog posts",
  "what is domain rating vs domain authority",
  "how to increase organic traffic fast",
  "google algorithm updates 2026 explained",
  "how to optimize page speed for seo",
  "mobile seo best practices 2026",
  "how to build internal linking strategy",
  "what is e-e-a-t and why it matters",
  "how to optimize images for seo",
  "best content management systems for seo",
  "how to recover from google penalty",
  "local seo checklist for south africa",
  "how to create xml sitemap manually",
  "what is core web vitals 2026",
  "how to optimize meta descriptions for ctr",
  "how to use google search console effectively",
  "what are featured snippets and how to get them",
  "how to do competitor keyword analysis",
  "best link building strategies 2026",
  "how to optimize for voice search",
  "what is programmatic seo",
  "how to create seo content clusters",
  "how to optimize category pages for seo",
  "what is semantic search optimization",
  "how to fix duplicate content issues",
  "best url structure for seo 2026",
  "how to optimize for bing seo",
  "what is https and why it matters for seo",
  "how to use structured data for rich snippets",
  "how to optimize for local pack rankings",
  "what is keyword cannibalization and how to fix",
  "how to create pillar pages for seo",
  "best practices for title tags 2026",
  "how to optimize for youtube seo",
  "what is entity-based seo",
  "how to use google analytics for seo",
  "how to optimize for google discover",
  "what is search intent and why it matters",
  "how to create seo-friendly url slugs",
  "best practices for heading structure",
  "how to optimize for google news",
  "what is topical authority and how to build it",
  "how to do seo audit for wordpress site",
  "how to optimize for google images",
  "best practices for internal linking",
  "what is keyword density and does it matter",
  "how to optimize for zero click searches",
  "how to use ahrefs for keyword research",
  "how to optimize for long-tail keywords",
  "what is page speed and why it matters",
  "how to create seo-friendly content calendar",
  "best practices for robots.txt",
  "how to optimize for google shopping",
  "what is crawl budget and how to optimize",
  "how to use semrush for competitor analysis",
  "how to optimize for question keywords",
  "best practices for canonical tags",
  "how to optimize for local business schema",
  "what is bounce rate and how to reduce it",
  "how to create seo-friendly navigation",
  "how to optimize for google my business",
  "best practices for hreflang tags",
  "what is content pruning and when to do it",
  "how to optimize for featured snippets",
  "how to use moz for link building",
  "how to optimize for video seo",
  "best practices for meta robots tags",
  "what is pogo sticking and how to avoid",
  "how to create seo-friendly faq pages",
  "how to optimize for google sitelinks",
  "how to use screaming frog for technical seo",
  "how to optimize for brand searches",
  "best practices for breadcrumb navigation",
  "what is dwell time and why it matters",
  "how to create seo-friendly landing pages",
  "how to optimize for guest posting",
  "best practices for sitemap xml",
  "what is keyword difficulty and how to measure",
  "how to optimize for social signals",
  "how to use surfer seo for content optimization",
  "how to optimize for google knowledge panel",
  "best practices for 404 pages",
  "what is page authority vs domain authority",
  "how to create seo-friendly blog titles",
  "how to optimize for pinterest seo",
  "how to use majestic for backlink analysis",
  "how to optimize for amazon seo",
  "best practices for redirect chains",
  "what is click through rate and how to improve",
];

const TASK = `You are an expert SEO content writer. Generate a complete, high-quality blog article of approximately 1500 words targeting the specific keyword provided.

Return ONLY a JSON object (no prose, no code fences) of this exact shape:

{
  "title": "Main article title (H1) - MUST contain the keyword naturally",
  "metaTitle": "SEO meta title (under 60 chars, includes keyword)",
  "metaDescription": "Meta description (under 160 chars, compelling, includes keyword)",
  "slug": "url-slug-for-article",
  "content": "Full HTML content"
}

Content requirements:
- Start with a compelling introduction
- Use H2 headings for main sections (at least 5 sections)
- Use H3 subheadings where appropriate
- Include a dedicated FAQ section with at least 5 questions
- End with a strong conclusion
- Use proper HTML: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>
- Include FAQPage JSON-LD schema at the end
- Make it actionable and practical
- No fluff, no emojis, no marketing jargon
- Include current year (2026) where relevant
- Target the EXACT keyword in title, H1, first paragraph, and at least 2 H2s
- Write in a clear, authoritative tone`;

const outputDir = path.join(__dirname, "generated-articles");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateArticle(keyword, index) {
  try {
    const workspaceMemory = await getWorkspaceMemory();
    
    const data = await runSeoaxeJsonTask({
      taskName: "blog-from-keyword",
      taskPrompt: TASK,
      systemInstruction: "You are an SEO content specialist. Generate search-optimized blog articles from keywords.",
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
      log: console,
    });

    const slug = data.slug || generateSlug(data.title);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.metaTitle}</title>
  <meta name="description" content="${data.metaDescription}">
</head>
<body>
${data.content}
</body>
</html>`;

    const filename = `${String(index + 1).padStart(3, "0")}-${slug}.html`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, html, "utf-8");
    
    console.log(`✓ ${index + 1}/100: ${data.title}`);
    return { keyword, success: true, file: filename };
  } catch (error) {
    console.error(`✗ ${index + 1}/100: ${keyword}`, error.message);
    return { keyword, success: false };
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

async function main() {
  const results = [];
  
  for (let i = 0; i < keywords.length; i++) {
    const result = await generateArticle(keywords[i], i);
    results.push(result);
    
    if (i < keywords.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  const summary = {
    total: keywords.length,
    successful,
    failed,
    results,
  };

  fs.writeFileSync(
    path.join(outputDir, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf-8"
  );

  console.log("\n=== Summary ===");
  console.log(`Total: ${keywords.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Articles saved to: ${outputDir}`);
}

main().catch(console.error);
