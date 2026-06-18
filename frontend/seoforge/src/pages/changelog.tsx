import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SITE_URL } from "@/lib/brand-metadata";
import { useEffect } from "react";
import { Analytics } from "@/lib/analytics";
import { Sparkles, Wrench, Zap, Shield, Bug } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  badge: "new" | "improved" | "fix" | "security";
  title: string;
  items: string[];
}

const BADGE_META = {
  new: { label: "New", classes: "bg-blue-100 text-blue-700 border-blue-200", Icon: Sparkles },
  improved: { label: "Improved", classes: "bg-purple-100 text-purple-700 border-purple-200", Icon: Zap },
  fix: { label: "Fix", classes: "bg-amber-100 text-amber-700 border-amber-200", Icon: Bug },
  security: { label: "Security", classes: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: Shield },
} as const;

const ENTRIES: ChangelogEntry[] = [
  {
    version: "1.5.0",
    date: "June 2025",
    badge: "new",
    title: "Public Demo Audit — no account needed",
    items: [
      "Added /demo page: run a real SEO audit on any public URL without signing up.",
      "Partial results shown publicly; full report gated behind free account.",
      "Helps new users experience the product before committing to signup.",
    ],
  },
  {
    version: "1.4.0",
    date: "June 2025",
    badge: "improved",
    title: "AEO Optimization Engine v2",
    items: [
      "Improved Answer Engine Optimization scoring — now checks for FAQ schema, HowTo schema, and speakable markup.",
      "AEO score is now a standalone metric alongside Technical, Content, and Overall.",
      "Added detection for Google AI Overview citation eligibility signals.",
      "Improved multilingual AEO support for Zulu, Afrikaans, Xhosa, Pidgin, and Swahili content.",
    ],
  },
  {
    version: "1.3.0",
    date: "May 2025",
    badge: "new",
    title: "Blog Generator from Keyword",
    items: [
      "Generate full SEO-optimised blog posts from a single keyword.",
      "Posts include H1, H2 structure, meta description, FAQ schema, and internal link placeholders.",
      "Supports African market keyword context for South Africa, Nigeria, and Kenya.",
    ],
  },
  {
    version: "1.2.0",
    date: "May 2025",
    badge: "improved",
    title: "Site Crawler upgrade",
    items: [
      "Crawl up to 50 pages per site (up from 10).",
      "Per-page score breakdown now includes AEO score alongside technical and content.",
      "Faster crawl engine — average site scan time reduced by 40%.",
      "Added hreflang tag detection in crawl results.",
    ],
  },
  {
    version: "1.1.2",
    date: "April 2025",
    badge: "fix",
    title: "Schema validation bug fixes",
    items: [
      "Fixed Product schema detection failing on single-quote attribute values.",
      "Fixed FAQPage schema not being recognised when nested inside WebPage schema.",
      "Corrected AEO score overcounting for pages with multiple JSON-LD blocks.",
    ],
  },
  {
    version: "1.1.0",
    date: "April 2025",
    badge: "new",
    title: "Competitor Gap Detector",
    items: [
      "Scan any competitor URL and see exactly what SEO signals they have that you're missing.",
      "Side-by-side comparison of title, meta, schema, heading structure, and word count.",
      "Generates a prioritised list of gaps to close.",
    ],
  },
  {
    version: "1.0.5",
    date: "March 2025",
    badge: "security",
    title: "Security hardening",
    items: [
      "Added CSRF protection to all state-changing API endpoints.",
      "Rate limiting now persisted in DB — survives server restarts.",
      "PayPal webhook signature verification hardened with cert URL domain validation.",
      "Secrets removed from committed environment files.",
    ],
  },
  {
    version: "1.0.0",
    date: "February 2025",
    badge: "new",
    title: "Initial Launch 🎉",
    items: [
      "Live SEO audit engine with Technical, Content, and AEO scoring.",
      "AI-powered page optimizer using Google Gemini 2.0 Flash.",
      "Schema markup generator (JSON-LD) for FAQPage, Article, Organization, Product.",
      "Hreflang tag generator with African language support.",
      "Sitemap and robots.txt generator.",
      "PayPal payment integration with Free, Starter, Professional, and Agency plans.",
      "Agency white-label mode with custom branding and PDF reports.",
    ],
  },
];

export default function Changelog() {
  useEffect(() => {
    Analytics.changelogViewed();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Changelog — SEOaxe</title>
        <meta name="description" content="See what's new in SEOaxe — new features, improvements, fixes, and security updates." />
        <link rel="canonical" href={`${SITE_URL}/changelog`} />
      </Helmet>
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Product updates</p>
            <h1 className="text-4xl font-black text-slate-900 mb-3">Changelog</h1>
            <p className="text-slate-500 text-base">
              Every update, fix, and new feature — in one place. We ship improvements weekly.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100" aria-hidden />

            <div className="space-y-12">
              {ENTRIES.map((entry) => {
                const meta = BADGE_META[entry.badge];
                const Icon = meta.Icon;
                return (
                  <div key={entry.version} className="relative pl-12">
                    {/* Dot */}
                    <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <div>
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.classes}`}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                        <span className="text-xs font-mono text-slate-400">v{entry.version}</span>
                        <span className="text-xs text-slate-400">{entry.date}</span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 mb-3">{entry.title}</h2>

                      <ul className="space-y-2">
                        {entry.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 pt-10 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Have a feature request? We read every one.
            </p>
            <a
              href="mailto:support@seoaxe.site?subject=Feature Request"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              <Wrench className="w-4 h-4" />
              Submit a feature request
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
