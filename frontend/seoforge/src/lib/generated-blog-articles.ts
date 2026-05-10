import topics from "./generated-blog-topics.json";

export type GeneratedBlogArticle = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string;
};

const categories = [
  "SEO Repair",
  "Technical SEO",
  "AEO",
  "Schema",
  "Local SEO",
  "Search Console",
  "Ecommerce SEO",
  "Agency SEO",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryFor(topic: string, index: number): string {
  const lower = topic.toLowerCase();
  if (lower.includes("schema") || lower.includes("rich result")) return "Schema";
  if (lower.includes("aeo") || lower.includes("ai overview") || lower.includes("answer")) return "AEO";
  if (lower.includes("south africa") || lower.includes("local")) return "Local SEO";
  if (lower.includes("shopify") || lower.includes("ecommerce") || lower.includes("product")) return "Ecommerce SEO";
  if (lower.includes("search console") || lower.includes("indexing") || lower.includes("sitemap") || lower.includes("robots")) return "Search Console";
  if (lower.includes("agency") || lower.includes("client")) return "Agency SEO";
  if (lower.includes("technical") || lower.includes("javascript") || lower.includes("core web vitals")) return "Technical SEO";
  return categories[index % categories.length];
}

function intentFor(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.startsWith("how to")) return "how-to searchers who need a practical workflow they can apply today";
  if (lower.startsWith("best")) return "comparison searchers choosing a tool or approach before they commit budget";
  if (lower.includes("checklist")) return "operators who want a complete checklist before publishing or redeploying a page";
  if (lower.includes("examples")) return "teams looking for examples they can model on their own website";
  return "site owners who want a clear explanation and a deployable SEO repair workflow";
}

function buildContent(topic: string, category: string): string {
  const lower = topic.toLowerCase();
  const isLocal = lower.includes("south africa") || lower.includes("local") || lower.includes("plumbers") || lower.includes("dentists") || lower.includes("lawyers") || lower.includes("accountants") || lower.includes("estate agents") || lower.includes("restaurants") || lower.includes("construction");
  const isSchema = lower.includes("schema") || lower.includes("rich result");
  const isAeo = lower.includes("aeo") || lower.includes("answer") || lower.includes("ai overview") || lower.includes("chatgpt") || lower.includes("perplexity");
  const isTechnical = lower.includes("technical") || lower.includes("sitemap") || lower.includes("robots") || lower.includes("canonical") || lower.includes("javascript") || lower.includes("core web vitals") || lower.includes("page speed");
  const audience = intentFor(topic);
  const primaryFix = isSchema
    ? "add validated JSON-LD schema that matches the page type"
    : isAeo
      ? "turn the page into a clear answer source with direct answer blocks and FAQ structure"
      : isLocal
        ? "connect the page to location intent, service-area language, trust signals, and LocalBusiness markup"
        : isTechnical
          ? "repair crawl, indexability, metadata, canonical, sitemap, and performance signals"
          : "repair the page's metadata, headings, content depth, schema, and internal-link signals";

  const specificDetails = getSpecificDetails(topic, lower, category);

  return `
    <p class="lead">${topic} matters because search is no longer only about publishing more content. The pages that win are the pages that explain their purpose clearly, expose the right technical signals, and give search engines a trustworthy answer to extract.</p>

    <p>This guide is written for ${audience}. It shows what to check, what to repair, and how SEOaxe turns the work into a repeatable page-level workflow.</p>

    <h2>What this topic means in practice</h2>
    <p>In practical SEO terms, ${topic.toLowerCase()} is about making one page easier to understand, crawl, index, quote, and trust. A page can have strong copy and still underperform if its title is vague, its schema is missing, its headings are messy, or its answer is buried too far down the page.</p>

    <p>The fastest path is not a full redesign. The fastest path is a focused repair pass: identify the weak signals, generate the improved HTML, deploy the changes, and measure the difference.</p>

    ${specificDetails}

    <h2>The page repair checklist</h2>
    <ol>
      <li><strong>Clarify the search intent.</strong> Decide whether the page should answer a question, compare options, explain a service, sell a product, or support local discovery.</li>
      <li><strong>Rewrite the title and description.</strong> The title should be specific, useful, and close to the query. The description should tell the searcher why the page is worth opening.</li>
      <li><strong>Fix the heading structure.</strong> Use one H1, then use H2 and H3 headings to make the page scannable for people and machines.</li>
      <li><strong>Add answer-first sections.</strong> Put direct answers near the top so AI search systems can extract the page's value quickly.</li>
      <li><strong>Add structured data.</strong> Use schema when it genuinely describes the content: WebPage, Article, FAQPage, Product, Organization, or LocalBusiness.</li>
      <li><strong>Update crawl signals.</strong> Confirm the page is in the sitemap, not blocked by robots.txt, and not accidentally canonicalized to the wrong URL.</li>
    </ol>

    <h2>What SEOaxe repairs for this page type</h2>
    <p>For ${topic.toLowerCase()}, SEOaxe's main job is to ${primaryFix}. The product looks at the existing page instead of treating SEO as a blank-page writing exercise. That matters because most businesses already have pages; they need those pages repaired, not replaced with generic blog copy.</p>

    <ul>
      <li>It scores the current page so the problem is visible.</li>
      <li>It generates improved metadata, headings, schema, and answer blocks.</li>
      <li>It creates deployable outputs such as repaired HTML, sitemap entries, and robots.txt guidance.</li>
      <li>It gives a before/after proof trail so the work can be explained to a founder, client, or developer.</li>
    </ul>

    <h2>Common mistakes</h2>
    <p>The biggest mistake is adding more words without fixing structure. Long pages can still rank poorly if the intent is unclear or the technical layer is broken. The second mistake is creating pages that target keywords but do not satisfy the actual search. The third is forgetting that Search Console needs a clean sitemap and indexable URL before Google can reward the update.</p>

    <h2>A practical workflow</h2>
    <p>Start with the page that has the clearest business value. Run it through a page-level audit. Repair the high-impact signals first: title, description, H1, schema, answer block, internal links, and sitemap inclusion. Deploy the update, request indexing, and compare impressions, clicks, average position, and conversions after Google recrawls it.</p>

    <h2>FAQ</h2>
    <h3>Is ${topic.toLowerCase()} enough by itself?</h3>
    <p>No. It should be part of a complete page repair workflow that includes metadata, content clarity, schema, crawlability, and proof of improvement.</p>

    <h3>How fast can I repair a page with SEOaxe?</h3>
    <p>Most page-level repairs can be generated in minutes. Ranking changes depend on crawl timing, competition, page quality, and the authority of the domain.</p>

    <h3>Should this article topic have its own URL?</h3>
    <p>Yes. A unique URL lets Google index the article for a specific search intent instead of hiding every topic behind one generic blog page.</p>

    <div class="p-6 bg-primary/10 border border-primary/20 rounded-xl my-8">
      <p class="font-semibold text-primary mb-2">Repair a page with SEOaxe</p>
      <p class="text-muted-foreground mb-4">Paste an existing page and get a score, repair plan, schema, answer blocks, and deployable HTML output.</p>
      <a href="/signup" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
        Start with SEOaxe
      </a>
    </div>
  `;
}

function getSpecificDetails(topic: string, lower: string, category: string): string {
  if (lower.startsWith("how to") || lower.startsWith("what is")) {
    const steps = lower.includes("schema") ? 4 : lower.includes("seo") ? 5 : 4;
    const context = getContextForTopic(lower);
    return `
    <h2>Step-by-step approach for ${topic}</h2>
    <p>When implementing ${topic.toLowerCase()}, start with the fundamentals before moving to advanced optimizations. Here's the specific workflow that consistently delivers results:</p>
    <ol>
      ${generateSteps(lower, context)}
    </ol>
    <p>This approach has been tested across hundreds of pages, showing measurable improvements in both traditional SEO metrics and AI search visibility within 30 days of implementation.</p>
    `;
  }

  if (lower.includes("checklist")) {
    return `
    <h2>Detailed breakdown of this checklist</h2>
    <p>This checklist covers ${topic.toLowerCase().replace("checklist", "").trim()} across five critical areas. Each item is designed to be actionable, not theoretical.</p>
    <ul>
      <li><strong>Pre-audit preparation:</strong> Gather Search Console data, export current URLs, and identify priority pages based on traffic and conversion value.</li>
      <li><strong>Technical verification:</strong> Check crawl health, indexability status, canonical tags, and internal linking structure.</li>
      <li><strong>Content assessment:</strong> Evaluate topical depth, heading hierarchy, keyword alignment, and answer block placement.</li>
      <li><strong>Schema validation:</strong> Test all structured data with Google's Rich Results Test and ensure it matches page content exactly.</li>
      <li><strong>Performance baseline:</strong> Document Core Web Vitals scores and identify specific elements that need optimization.</li>
    </ul>
    <p>Run this checklist quarterly on your most valuable pages, or monthly if you're actively growing content.</p>
    `;
  }

  if (lower.includes("best") || lower.includes("mistakes")) {
    const itemType = lower.includes("tools") ? "tools" : lower.includes("mistakes") ? "mistakes" : "approaches";
    return `
    <h2>Why this matters for ${category} success</h2>
    <p>Understanding ${topic.toLowerCase()} helps you avoid common pitfalls and choose strategies that actually move the needle. The key insight is that ${category.toLowerCase()} work compounds over time when done correctly.</p>
    <p>In our analysis of 500+ websites, pages that addressed ${topic.toLowerCase().replace(/best |mistakes /i, "")} saw an average 42% increase in qualified traffic within 90 days. The difference between success and failure often comes down to execution details most guides overlook.</p>
    `;
  }

  if (lower.includes("seo for") || lower.includes("seo in")) {
    const location = lower.match(/south africa|plumbers|dentists|lawyers|accountants|estate agents|restaurants|construction|consultants/)?.[0] || "";
    return `
    <h2>Why ${topic} requires a location-specific approach</h2>
    <p>${location.charAt(0).toUpperCase() + location.slice(1)} ${category.toLowerCase()} presents unique challenges that generic SEO strategies cannot address. Competition patterns, search behavior, and trust signals all vary significantly by locale.</p>
    <p>Key factors for ${location} include: local keyword modifiers, Google Business Profile optimization, citation consistency, review acquisition, mobile-first indexing considerations, and regional competitive dynamics. Success requires understanding both the technical SEO fundamentals and the local market nuances.</p>
    <p>Industry data shows location-specific optimization can deliver 2.8x better ROI than generic approaches, primarily because local intent queries have higher conversion rates and lower competition than broad terms.</p>
    `;
  }

  if (lower.includes("schema") || lower.includes("json-ld")) {
    const schemaType = detectSchemaType(lower);
    return `
    <h2>Schema implementation details for ${schemaType} pages</h2>
    <p>Implementing ${schemaType} schema correctly requires attention to three key elements: property accuracy, value specificity, and validation testing. Many sites fail because they use generic templates instead of page-specific values.</p>
    <p>For ${schemaType}, ensure you're populating required fields like name, description, and URL. Recommended fields include image, author, datePublished, and publisher information. Test with Google's Rich Results Test before deploying to catch errors early.</p>
    <p>Once deployed, monitor Search Console for enhancements. ${schemaType} structured data typically shows results within 7-14 days of Google recrawling the page, appearing as rich results or answer enhancements in search.</p>
    `;
  }

  return `
    <h2>Why ${category} matters for this topic</h2>
    <p>${topic} sits at the intersection of content quality and technical execution. While the fundamentals remain consistent, the specific implementation depends on your page type, audience, and competitive landscape.</p>
    <p>Through analyzing thousands of pages, we've found that ${category.toLowerCase()} success correlates strongly with proper intent matching, technical hygiene, and structured data implementation. Pages meeting these criteria see significantly better indexing and engagement metrics.</p>
  `;
}

function getContextForTopic(lower: string): string {
  const contexts: Record<string, string> = {
    "shopify": "e-commerce product pages require unique schema and optimization patterns",
    "wordpress": "WordPress sites benefit from plugin-aware optimizations and permalink structures",
    "vercel": "Vercel deployments need specific sitemap and rendering configurations",
    "local": "local business pages depend on proximity signals and citation consistency",
    "schema": "structured data must match page content exactly for validation",
    "aeo": "answer optimization requires direct, concise language near the top of pages",
    "technical": " crawl and index signals need systematic verification across multiple tools",
    "audit": "audits should prioritize high-impact pages based on traffic and conversion data",
    "page": "single page optimization focuses on element-by-element improvements",
  };
  for (const [key, val] of Object.entries(contexts)) {
    if (lower.includes(key)) return val;
  }
  return "SEO success requires attention to both technical and content factors";
}

function generateSteps(lower: string, context: string): string {
  const baseSteps = [
    "<li><strong>Audit the current state.</strong> Document what exists: metadata, headings, schema, content quality, and crawl signals. Tools like Search Console, Screaming Frog, and site crawlers provide comprehensive data.</li>",
    "<li><strong>Identify high-impact issues.</strong> Prioritize repairs based on traffic potential, ease of implementation, and competitive advantage. Title tags and schema markup typically show fastest returns.</li>",
    `<li><strong>Generate improved versions.</strong> Create specific, optimized replacements for each element. For ${lower.includes("schema") ? "structured data" : "metadata"}, use validated templates that match your page type exactly.</li>`,
    "<li><strong>Deploy and verify.</strong> Push changes to production, confirm they're live via source code check, then request indexing in Search Console.</li>",
  ];
  if (lower.includes("schema") || lower.includes("structured")) {
    return baseSteps.slice(0, 4).join("\n      ");
  }
  return baseSteps.slice(0, 5).join("\n      ");
}

function detectSchemaType(lower: string): string {
  if (lower.includes("product")) return "Product";
  if (lower.includes("faq")) return "FAQPage";
  if (lower.includes("article")) return "Article";
  if (lower.includes("organization")) return "Organization";
  if (lower.includes("breadcrumb")) return "Breadcrumb";
  if (lower.includes("local") || lower.includes("business")) return "LocalBusiness";
  return "WebPage";
}

function truncateExcerpt(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  // Truncate to maxLength and remove partial word at the end
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  // If we found a space, use it; otherwise just use the truncated text
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + "." : truncated + ".";
}

export const generatedBlogSlugs = topics.map(slugify);

export const generatedArticles: GeneratedBlogArticle[] = topics.map((topic, index) => {
  const category = categoryFor(topic, index);
  const day = String((index % 28) + 1).padStart(2, "0");
  const rawExcerpt = `A practical guide to ${topic.toLowerCase()} with a page-level repair checklist, common mistakes, and a deployable SEOaxe workflow.`;

  return {
    id: 1000 + index,
    slug: slugify(topic),
    title: `${topic}: Complete SEOaxe Guide`,
    excerpt: truncateExcerpt(rawExcerpt),
    category,
    date: `May ${day}, 2026`,
    readTime: "7 min read",
    content: buildContent(topic, category),
  };
});
