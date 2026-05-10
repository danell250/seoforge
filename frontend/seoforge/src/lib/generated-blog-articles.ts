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

  return `
    <p class="lead">${topic} matters because search is no longer only about publishing more content. The pages that win are the pages that explain their purpose clearly, expose the right technical signals, and give search engines a trustworthy answer to extract.</p>

    <p>This guide is written for ${audience}. It shows what to check, what to repair, and how SEOaxe turns the work into a repeatable page-level workflow.</p>

    <h2>What this topic means in practice</h2>
    <p>In practical SEO terms, ${topic.toLowerCase()} is about making one page easier to understand, crawl, index, quote, and trust. A page can have strong copy and still underperform if its title is vague, its schema is missing, its headings are messy, or its answer is buried too far down the page.</p>

    <p>The fastest path is not a full redesign. The fastest path is a focused repair pass: identify the weak signals, generate the improved HTML, deploy the changes, and measure the difference.</p>

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
