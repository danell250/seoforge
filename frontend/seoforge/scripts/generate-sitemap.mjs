import fs from "node:fs";
import path from "node:path";

const siteUrl = "https://seoaxe.site";
const lastmod = "2026-05-08";

const publicPages = [
  ["", "daily", "1.0"],
  ["pricing", "weekly", "0.9"],
  ["compare", "weekly", "0.9"],
  ["blog", "daily", "0.8"],
  ["contact", "monthly", "0.7"],
  ["seo-repair-engine", "weekly", "0.9"],
  ["html-seo-optimizer", "weekly", "0.85"],
  ["aeo-optimizer", "weekly", "0.85"],
  ["answer-engine-optimization", "weekly", "0.85"],
  ["schema-markup-generator", "weekly", "0.8"],
  ["technical-seo-audit", "weekly", "0.8"],
  ["sitemap-generator", "weekly", "0.75"],
  ["robots-txt-generator", "weekly", "0.75"],
  ["wordpress-seo-repair", "weekly", "0.8"],
  ["shopify-seo-repair", "weekly", "0.8"],
  ["local-seo-south-africa", "weekly", "0.8"],
  ["seo-health-score", "weekly", "0.75"],
  ["privacy", "yearly", "0.3"],
  ["refund-policy", "yearly", "0.3"],
  ["terms", "yearly", "0.3"],
];

const existingBlogSlugs = [
  "what-is-aeo-answer-engine-optimization-south-africa",
  "what-is-seo-health-score",
  "how-to-add-schema-markup-website",
  "why-website-not-showing-google-ai-overviews",
  "how-to-optimize-website-south-african-google-search",
  "what-is-json-ld-schema-how-to-add-it",
  "how-to-win-google-featured-snippets",
  "seo-vs-aeo-difference",
  "how-to-submit-sitemap-google-search-console",
  "why-south-african-websites-rank-poorly-google",
  "what-is-answer-engine-optimization",
  "google-ai-overviews-guide",
  "schema-markup-complete-guide",
  "seo-vs-aeo-why-traditional-seo-not-enough",
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const topicsPath = path.resolve("src/lib/generated-blog-topics.json");
const generatedBlogSlugs = JSON.parse(fs.readFileSync(topicsPath, "utf8")).map(slugify);

function urlEntry(route, changefreq, priority) {
  const loc = route ? `${siteUrl}/${route}` : `${siteUrl}/`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const blogPages = [...existingBlogSlugs, ...generatedBlogSlugs].map((slug) => [`blog/${slug}`, "monthly", "0.65"]);
const entries = [...publicPages, ...blogPages].map(([route, changefreq, priority]) =>
  urlEntry(route, changefreq, priority),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

fs.writeFileSync(path.resolve("public/sitemap.xml"), sitemap);
console.log(`Generated sitemap.xml with ${entries.length} URLs`);
