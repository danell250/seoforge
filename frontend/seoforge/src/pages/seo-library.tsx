import { useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Braces,
  FileCode2,
  FileSearch,
  Globe2,
  ListChecks,
  Map,
  MonitorCheck,
  Search,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE_URL } from "@/lib/brand-metadata";

type PageSlug =
  | "seo-repair-engine"
  | "html-seo-optimizer"
  | "aeo-optimizer"
  | "answer-engine-optimization"
  | "schema-markup-generator"
  | "technical-seo-audit"
  | "sitemap-generator"
  | "robots-txt-generator"
  | "wordpress-seo-repair"
  | "shopify-seo-repair"
  | "local-seo-south-africa"
  | "seo-health-score";

type SeoPage = {
  slug: PageSlug;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Search;
  intent: string;
  outcomes: string[];
  workflow: string[];
  proof: string[];
  faq: Array<{ question: string; answer: string }>;
};

const pages: Record<PageSlug, SeoPage> = {
  "seo-repair-engine": {
    slug: "seo-repair-engine",
    eyebrow: "Live SEO audit",
    title: "Audit existing website pages from any live URL",
    description:
      "SEOaxe scans live pages and delivers an audit plan: metadata, schema, answer blocks, headings, internal-link prompts, sitemap entries, and before/after proof.",
    icon: Sparkles,
    intent: "For teams searching for a practical SEO audit engine that improves live pages without a long agency retainer.",
    outcomes: [
      "Audit findings for title tags and descriptions tied to the page's actual offer.",
      "Structured data and answer sections that help search and AI systems understand the page.",
      "An audit receipt that shows what to fix and why it matters.",
    ],
    workflow: [
      "Enter the live URL of the page you want to improve.",
      "Review SEOaxe's score, missing signals, and prioritized fix list.",
      "Apply the recommended changes and submit the updated URL for indexing.",
    ],
    proof: [
      "Built around before/after scoring, not vague content suggestions.",
      "Outputs deployable HTML, sitemap.xml, robots.txt, schema, and page receipts.",
      "Keeps the original page intent intact while repairing the search layer around it.",
    ],
    faq: [
      {
        question: "Is SEOaxe an SEO writer or an SEO repair engine?",
        answer: "It is a repair engine first. It improves the HTML, metadata, schema, and answer structure of pages you already have.",
      },
      {
        question: "Can I use it before hiring an agency?",
        answer: "Yes. SEOaxe gives founders and small teams a clear first pass before deciding whether a deeper agency engagement is needed.",
      },
    ],
  },
  "html-seo-optimizer": {
    slug: "html-seo-optimizer",
    eyebrow: "Live page analyzer",
    title: "Analyze live pages for search-ready improvements",
    description:
      "Enter any live URL and get cleaner titles, descriptions, headings, Open Graph tags, schema, alt text guidance, and copyable guidance you can hand to a developer.",
    icon: FileCode2,
    intent: "For people searching for an SEO analyzer that returns actionable guidance instead of a generic checklist.",
    outcomes: [
      "Production-ready recommendations for head tags and semantic page structure.",
      "JSON-LD schema matched to the page type and business context.",
      "Copyable guidance for WordPress, Shopify, custom sites, and static pages.",
    ],
    workflow: [
      "Enter the live page URL into the analyzer.",
      "Let SEOaxe detect missing search signals and weak answer structure.",
      "Copy the recommended snippets and apply the changes to your site.",
    ],
    proof: [
      "Shows the repaired code directly in the workspace.",
      "Flags weak meta data, thin headings, and missing schema in one flow.",
      "Pairs code output with a score so the work is measurable.",
    ],
    faq: [
      {
        question: "Does SEOaxe edit the full page or only metadata?",
        answer: "It can repair metadata, schema, headings, answer blocks, alt guidance, sitemap outputs, and robots.txt guidance.",
      },
      {
        question: "Does SEOaxe work with any CMS?",
        answer: "Yes. The workflow is CMS-agnostic because it scans live URLs rather than requiring platform plugins.",
      },
    ],
  },
  "aeo-optimizer": {
    slug: "aeo-optimizer",
    eyebrow: "AEO optimizer",
    title: "Add answer-engine structure to pages that already rank or convert",
    description:
      "SEOaxe creates concise answer blocks, FAQ-style sections, and schema so existing pages are easier for answer engines and AI search experiences to parse.",
    icon: Bot,
    intent: "For businesses looking for an AEO optimizer that improves real pages, not just blog outlines.",
    outcomes: [
      "Question-led headings that match how customers ask for help.",
      "Direct answer blocks that can support snippets and AI summaries.",
      "FAQPage or WebPage schema where it fits the page intent.",
    ],
    workflow: [
      "Enter your live page URL and target topic.",
      "Generate direct answers, supporting FAQs, and structured data.",
      "Copy the answer snippets to your live page and monitor visibility.",
    ],
    proof: [
      "Built into the same workflow as technical SEO audit.",
      "Targets answer clarity, entity coverage, and schema together.",
      "Designed for existing service, product, and location pages.",
    ],
    faq: [
      {
        question: "What is AEO?",
        answer: "Answer engine optimization structures a page so search engines and AI systems can extract direct, trustworthy answers.",
      },
      {
        question: "Does AEO replace SEO?",
        answer: "No. It sits on top of technical SEO, content clarity, and structured data.",
      },
    ],
  },
  "answer-engine-optimization": {
    slug: "answer-engine-optimization",
    eyebrow: "Answer engine optimization",
    title: "Prepare your website pages for AI answers and featured snippets",
    description:
      "SEOaxe helps pages answer the buyer's question clearly with structured sections, concise explanations, schema, and supporting context.",
    icon: Target,
    intent: "For teams researching answer engine optimization and how to adapt existing pages for AI search.",
    outcomes: [
      "Clear answer-first sections for service and product pages.",
      "FAQ coverage based on real objections and buyer intent.",
      "Schema and page structure that support machine readability.",
    ],
    workflow: [
      "Identify the question the page should answer.",
      "Generate a short answer block and supporting details.",
      "Apply the guidance and keep the page's original conversion path intact.",
    ],
    proof: [
      "Focuses on useful answers, not keyword stuffing.",
      "Links AEO work to the same before/after SEO health score.",
      "Works for small business pages, SaaS pages, agencies, and local services.",
    ],
    faq: [
      {
        question: "Which pages should get AEO first?",
        answer: "Start with pages that already matter commercially: home, pricing, comparison, service, product, and location pages.",
      },
      {
        question: "Does SEOaxe create FAQ schema?",
        answer: "Yes, when FAQ structure fits the page and the answers are useful to the visitor.",
      },
    ],
  },
  "schema-markup-generator": {
    slug: "schema-markup-generator",
    eyebrow: "Schema markup generator",
    title: "Generate JSON-LD schema that matches the page you already have",
    description:
      "Create Organization, WebSite, WebPage, FAQPage, Article, Product, and LocalBusiness-style structured data based on page context.",
    icon: Braces,
    intent: "For site owners who need practical schema markup without hand-writing JSON-LD.",
    outcomes: [
      "JSON-LD blocks aligned with page type and business information.",
      "Cleaner entity signals for brand, product, service, and FAQ content.",
      "Schema recommendations included alongside metadata and heading repairs.",
    ],
    workflow: [
      "Enter the live URL of the target page.",
      "Let SEOaxe infer the right schema candidates.",
      "Validate and apply the generated JSON-LD in the page head or body.",
    ],
    proof: [
      "Schema is generated from the page context, not a blank template.",
      "Pairs schema with meta and answer-block recommendations.",
      "Useful for agencies that need repeatable client deliverables.",
    ],
    faq: [
      {
        question: "Which schema types does SEOaxe support?",
        answer: "Common outputs include Organization, WebSite, WebPage, FAQPage, Article, Product, and LocalBusiness-style schema.",
      },
      {
        question: "Can schema alone make a page rank?",
        answer: "No. Schema helps machines understand the page, but it should support strong content, intent fit, and technical SEO.",
      },
    ],
  },
  "technical-seo-audit": {
    slug: "technical-seo-audit",
    eyebrow: "Technical SEO audit",
    title: "Audit the technical SEO signals that hold existing pages back",
    description:
      "Check metadata, headings, canonical tags, indexability clues, schema, social previews, image alt text, and answer readiness before you deploy changes.",
    icon: FileSearch,
    intent: "For founders and teams looking for a fast technical SEO audit for live website pages.",
    outcomes: [
      "A page-level score across technical SEO, content SEO, and AEO readiness.",
      "Prioritized findings instead of a long undifferentiated checklist.",
      "Guidance that maps directly to code and content changes.",
    ],
    workflow: [
      "Enter a live page URL to scan.",
      "Review missing, weak, and healthy SEO signals.",
      "Get prioritized guidance and compare the before/after state.",
    ],
    proof: [
      "The audit is connected to an optimizer, so findings can become fixes.",
      "Highlights deployable improvements for non-technical teams.",
      "Works at page level, where SEO problems are easiest to identify.",
    ],
    faq: [
      {
        question: "Is this a full enterprise crawler?",
        answer: "SEOaxe is focused on page audits. It is best for improving important pages one by one or in agency batches.",
      },
      {
        question: "What score should I aim for?",
        answer: "Aim for strong fundamentals first: unique metadata, clean headings, schema where useful, indexability, and clear answer sections.",
      },
    ],
  },
  "sitemap-generator": {
    slug: "sitemap-generator",
    eyebrow: "Sitemap generator",
    title: "Create sitemap.xml files that list the pages search engines should crawl",
    description:
      "SEOaxe helps generate clean XML sitemap entries so important public pages are discoverable and login-only screens stay out of search.",
    icon: Map,
    intent: "For teams who need a clean sitemap.xml file after updating a site or launching new pages.",
    outcomes: [
      "XML sitemap entries for public, indexable pages.",
      "Robots.txt guidance that points Google to the sitemap.",
      "A deployment checklist for Search Console submission.",
    ],
    workflow: [
      "Collect the public pages that should appear in search.",
      "Generate sitemap.xml and robots.txt outputs.",
      "Place them at the domain root and resubmit in Search Console.",
    ],
    proof: [
      "This SEOaxe site ships a root sitemap.xml as proof of the same workflow.",
      "Protected routes are intentionally excluded from indexable sitemap entries.",
      "Built for practical deployment rather than a report-only workflow.",
    ],
    faq: [
      {
        question: "Should login pages go in a sitemap?",
        answer: "No. A sitemap should focus on indexable public pages that can satisfy search intent.",
      },
      {
        question: "Why did Google say my sitemap was HTML?",
        answer: "That usually happens when a frontend fallback serves index.html at /sitemap.xml instead of a real XML file.",
      },
    ],
  },
  "robots-txt-generator": {
    slug: "robots-txt-generator",
    eyebrow: "Robots.txt generator",
    title: "Create robots.txt rules that keep crawlers focused",
    description:
      "Generate robots.txt guidance that allows public content, points to the sitemap, and keeps app dashboards or API routes out of search.",
    icon: ShieldCheck,
    intent: "For site owners who need a clean robots.txt file to support indexing without exposing private app routes.",
    outcomes: [
      "Allow rules for public marketing and content pages.",
      "Disallow rules for app, dashboard, API, login, and checkout paths.",
      "A sitemap pointer that matches the production domain.",
    ],
    workflow: [
      "Decide which routes should be public.",
      "Generate robots.txt with clear allow/disallow intent.",
      "Place it at the domain root next to sitemap.xml.",
    ],
    proof: [
      "SEOaxe's own robots.txt points to the live sitemap.",
      "The workflow separates indexable product pages from authenticated screens.",
      "Useful after Vercel, Netlify, Shopify, or WordPress launches.",
    ],
    faq: [
      {
        question: "Does robots.txt force Google to index a page?",
        answer: "No. It gives crawler access guidance. Indexing still depends on page quality, discoverability, and search demand.",
      },
      {
        question: "Can robots.txt hide private data?",
        answer: "No. Private data must be protected with authentication. Robots.txt is not a security control.",
      },
    ],
  },
  "wordpress-seo-repair": {
    slug: "wordpress-seo-repair",
    eyebrow: "WordPress SEO audit",
    title: "Audit WordPress page SEO without waiting on a full redesign",
    description:
      "Use SEOaxe to analyze WordPress page metadata, schema, headings, answers, and get guidance before publishing updates in your CMS.",
    icon: Globe2,
    intent: "For WordPress site owners who need page-level SEO analysis and clear handoff notes.",
    outcomes: [
      "Better titles, descriptions, headings, and schema for key WordPress pages.",
      "A practical checklist for applying fixes through your theme, builder, or SEO plugin.",
      "Before/after proof that helps explain the update to a client or founder.",
    ],
    workflow: [
      "Enter your live WordPress page URL.",
      "Generate the audit plan and code snippets.",
      "Apply the updates in WordPress and submit the URL for reindexing.",
    ],
    proof: [
      "Fits Elementor, Gutenberg, classic themes, and custom WordPress templates.",
      "Helps agencies produce visible page-level deliverables.",
      "Avoids replacing the CMS with another locked-in tool.",
    ],
    faq: [
      {
        question: "Do I still need Yoast or Rank Math?",
        answer: "Those plugins can help publish fields. SEOaxe helps decide what to fix and generate stronger page-ready outputs.",
      },
      {
        question: "Can SEOaxe generate WordPress-ready copy?",
        answer: "Yes. It can provide metadata, answer blocks, schema, and implementation notes you can apply in WordPress.",
      },
    ],
  },
  "shopify-seo-repair": {
    slug: "shopify-seo-repair",
    eyebrow: "Shopify SEO audit",
    title: "Improve Shopify product, collection, and landing page SEO",
    description:
      "Audit Shopify pages with stronger metadata, product context, structured data guidance, collection descriptions, and answer sections.",
    icon: ShoppingBag,
    intent: "For Shopify stores that need product and collection pages to be clearer for search engines and buyers.",
    outcomes: [
      "Cleaner product and collection metadata.",
      "Structured content that answers buyer questions before checkout.",
      "Schema and internal-link recommendations for commerce pages.",
    ],
    workflow: [
      "Choose a product, collection, or landing page URL.",
      "Run the live page through SEOaxe.",
      "Apply the guidance in Shopify theme fields, product content, or custom liquid where needed.",
    ],
    proof: [
      "Focuses on conversion pages, not just blog posts.",
      "Helps expose product details that AI summaries and snippets can understand.",
      "Creates a repeatable workflow for store owners and ecommerce agencies.",
    ],
    faq: [
      {
        question: "Can SEOaxe repair product pages?",
        answer: "Yes. It can analyze metadata, headings, product explanation, FAQ-style content, and provide schema guidance.",
      },
      {
        question: "Should collection pages have unique copy?",
        answer: "Yes. Thin collection pages often need useful descriptive copy, internal links, and clear intent signals.",
      },
    ],
  },
  "local-seo-south-africa": {
    slug: "local-seo-south-africa",
    eyebrow: "South Africa local SEO",
    title: "Audit local SEO pages for South African businesses",
    description:
      "SEOaxe helps service businesses analyze local pages with location intent, trust signals, schema, multilingual clues, and direct answers.",
    icon: Store,
    intent: "For South African businesses that need local service pages to rank and convert more clearly.",
    outcomes: [
      "Location-aware headings and service descriptions.",
      "LocalBusiness-style schema recommendations.",
      "Answer blocks that match how customers search for help in South Africa.",
    ],
    workflow: [
      "Enter your home, service, or city page URL.",
      "Analyze metadata, schema, headings, and trust signals.",
      "Apply the updates and connect it to Google Business Profile activity.",
    ],
    proof: [
      "SEOaxe was positioned around practical SEO for real small-business pages.",
      "Supports local intent rather than generic global copy.",
      "Works well for agencies servicing multiple local clients.",
    ],
    faq: [
      {
        question: "Does local SEO need separate location pages?",
        answer: "Often yes, but only when each page has useful local detail and is not a duplicate doorway page.",
      },
      {
        question: "Can SEOaxe help with South African spelling and context?",
        answer: "Yes. It can keep copy aligned with local market language, service areas, and buyer intent.",
      },
    ],
  },
  "seo-health-score": {
    slug: "seo-health-score",
    eyebrow: "SEO health score",
    title: "Score page SEO health before and after fixes",
    description:
      "Use SEOaxe to measure technical SEO, content SEO, and AEO readiness so improvements are visible, explainable, and repeatable.",
    icon: MonitorCheck,
    intent: "For teams that want proof of product: a measurable score before and after SEO improvements.",
    outcomes: [
      "A page-level score that highlights what changed.",
      "Category breakdowns for technical SEO, content quality, and answer readiness.",
      "Receipts that help justify client work or internal updates.",
    ],
    workflow: [
      "Analyze the current page.",
      "Apply the generated guidance.",
      "Compare the improved page against the original baseline.",
    ],
    proof: [
      "Makes SEOaxe's value visible instead of hidden in a black-box recommendation.",
      "Supports agency reporting and founder decision-making.",
      "Turns SEO improvements into a repeatable workflow with evidence.",
    ],
    faq: [
      {
        question: "Is the score a Google ranking score?",
        answer: "No. It is a practical page-health score that reflects SEO and AEO implementation quality.",
      },
      {
        question: "Why score before and after?",
        answer: "Before/after scoring helps prove that the improvements enhanced the page's search signals.",
      },
    ],
  },
};

export const seoLibraryPages = Object.values(pages);

function setMeta(name: string, value: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

function setProperty(property: string, value: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function usePageSeo(page: SeoPage) {
  useEffect(() => {
    const url = `${SITE_URL}/${page.slug}`;
    document.title = `${page.eyebrow} | SEOaxe`;
    setMeta("description", page.description);
    setMeta("robots", "index, follow");
    setCanonical(url);
    setProperty("og:title", `${page.eyebrow} | SEOaxe`);
    setProperty("og:description", page.description);
    setProperty("og:url", url);
    setProperty("twitter:title", `${page.eyebrow} | SEOaxe`);
    setProperty("twitter:description", page.description);
    setProperty("twitter:url", url);
  }, [page]);
}

function SeoLibraryPage({ slug }: { slug: PageSlug }) {
  const page = pages[slug];
  const Icon = page.icon;
  usePageSeo(page);

  const related = seoLibraryPages.filter((item) => item.slug !== slug).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="border-b bg-muted/20">
          <div className="container px-4 py-14 sm:px-6 lg:py-18">
            <div className="max-w-4xl">
              <Badge variant="secondary" className="mb-5 gap-2">
                <Icon className="h-3.5 w-3.5" />
                {page.eyebrow}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{page.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{page.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Repair a page
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing">View plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold tracking-tight">Search Intent</h2>
                <p className="mt-3 text-muted-foreground leading-7">{page.intent}</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">What SEOaxe Produces</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {page.outcomes.map((outcome) => (
                    <div key={outcome} className="rounded-lg border bg-card p-5">
                      <BadgeCheck className="h-5 w-5 text-primary" />
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{outcome}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">Workflow</h2>
                <div className="mt-5 grid gap-4">
                  {page.workflow.map((step, index) => (
                    <div key={step} className="flex gap-4 rounded-lg border bg-background p-5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">Why This Proves The Product</h2>
                <ul className="mt-5 space-y-3">
                  {page.proof.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
                <div className="mt-5 divide-y rounded-lg border bg-card">
                  {page.faq.map((item) => (
                    <div key={item.question} className="p-5">
                      <h3 className="font-semibold">{item.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-lg border bg-card p-5">
                <h2 className="font-semibold">Repair Checklist</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {["Metadata", "Schema", "Answer blocks", "Headings", "Sitemap/robots", "Before/after score"].map((item) => (
                    <li key={item} className="flex gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border bg-muted/25 p-5">
                <h2 className="font-semibold">Related SEOaxe Pages</h2>
                <div className="mt-4 space-y-2">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/${item.slug}`} className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground">
                      {item.eyebrow}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function SeoRepairEnginePage() {
  return <SeoLibraryPage slug="seo-repair-engine" />;
}

export function HtmlSeoOptimizerPage() {
  return <SeoLibraryPage slug="html-seo-optimizer" />;
}

export function AeoOptimizerPage() {
  return <SeoLibraryPage slug="aeo-optimizer" />;
}

export function AnswerEngineOptimizationPage() {
  return <SeoLibraryPage slug="answer-engine-optimization" />;
}

export function SchemaMarkupGeneratorPage() {
  return <SeoLibraryPage slug="schema-markup-generator" />;
}

export function TechnicalSeoAuditPage() {
  return <SeoLibraryPage slug="technical-seo-audit" />;
}

export function SitemapGeneratorLandingPage() {
  return <SeoLibraryPage slug="sitemap-generator" />;
}

export function RobotsTxtGeneratorPage() {
  return <SeoLibraryPage slug="robots-txt-generator" />;
}

export function WordpressSeoRepairPage() {
  return <SeoLibraryPage slug="wordpress-seo-repair" />;
}

export function ShopifySeoRepairPage() {
  return <SeoLibraryPage slug="shopify-seo-repair" />;
}

export function LocalSeoSouthAfricaPage() {
  return <SeoLibraryPage slug="local-seo-south-africa" />;
}

export function SeoHealthScorePage() {
  return <SeoLibraryPage slug="seo-health-score" />;
}
