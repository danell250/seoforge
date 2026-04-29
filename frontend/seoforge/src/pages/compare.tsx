import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { 
  ArrowRight,
  Check,
  X,
  Sparkles,
  Shield,
  Zap,
  Clock,
  DollarSign,
  Globe,
  Award,
  Target,
  Wrench,
  FileText,
  BarChart3,
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
const jsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is SEOaxe better than Semrush?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For businesses that need deployable fixes instead of another diagnostic dashboard, SEOaxe is more direct. Semrush is excellent for research; SEOaxe repairs existing pages and shows a before/after receipt."
      }
    },
    {
      "@type": "Question",
      "name": "How does SEOaxe compare to AutoSEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AutoSEO focuses on article creation. SEOaxe focuses on repairing existing pages with meta tags, schema markup, AEO answer blocks, health scores, sitemaps, and a visible repair receipt."
      }
    },
    {
      "@type": "Question",
      "name": "Is SEOaxe cheaper than hiring an SEO agency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes significantly. Traditional SEO agencies charge R5,000 to R50,000 per month. SEOaxe Agency plan is R999 per month with full transparency, instant results, and no contract lock-in."
      }
    }
  ]
};

const fullComparisonFeatures = [
  { feature: "Repairs existing HTML pages", seoforge: true, autoseo: false, semrush: false, agency: "manual" },
  { feature: "Meta tag automation", seoforge: true, autoseo: false, semrush: false, agency: "manual" },
  { feature: "Schema/JSON-LD injection", seoforge: true, autoseo: false, semrush: false, agency: "sometimes" },
  { feature: "AEO answer block optimization", seoforge: true, autoseo: false, semrush: false, agency: false },
  { feature: "Before/after repair receipt", seoforge: true, autoseo: false, semrush: true, agency: "pdf" },
  { feature: "Competitor SEO scanner", seoforge: true, autoseo: false, semrush: true, agency: true },
  { feature: "Blog article generation", seoforge: true, autoseo: true, semrush: false, agency: true },
  { feature: "Sitemap + robots.txt generator", seoforge: true, autoseo: false, semrush: false, agency: "sometimes" },
  { feature: "ZIP bulk repair workflow", seoforge: true, autoseo: false, semrush: false, agency: false },
  { feature: "Emerging market optimization", seoforge: true, autoseo: false, semrush: false, agency: false },
  { feature: "Multilingual schema support", seoforge: true, autoseo: false, semrush: false, agency: false },
  { feature: "White label for agencies", seoforge: true, autoseo: false, semrush: false, agency: "na" },
  { feature: "Pricing in ZAR", seoforge: true, autoseo: false, semrush: false, agency: true },
  { feature: "No technical skills needed", seoforge: true, autoseo: true, semrush: false, agency: true },
  { feature: "Free tier available", seoforge: true, autoseo: false, semrush: false, agency: false },
  { feature: "Cancel anytime", seoforge: true, autoseo: true, semrush: true, agency: false },
  { feature: "Shows exactly what changed", seoforge: true, autoseo: false, semrush: true, agency: "rarely" },
  { feature: "Google AI Overviews optimization", seoforge: true, autoseo: false, semrush: false, agency: false },
  { feature: "Instant results", seoforge: true, autoseo: false, semrush: false, agency: false },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <span className="text-sm text-muted-foreground capitalize">{value}</span>
    </div>
  );
}

function MiniComparisonTable({ 
  headers, 
  rows 
}: { 
  headers: string[], 
  rows: { label: string; values: (boolean | string)[] }[] 
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Feature</th>
            {headers.map((h, i) => (
              <th key={i} className={`text-center py-3 px-4 font-semibold ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
              <td className="py-3 px-4 font-medium">{row.label}</td>
              {row.values.map((v, j) => (
                <td key={j} className={`py-3 px-4 ${j === 0 ? 'bg-primary/5' : ''}`}>
                  <ComparisonCell value={v} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricingCard({ 
  seoforge, 
  competitor, 
  seoforgeLabel, 
  competitorLabel 
}: { 
  seoforge: string; 
  competitor: string; 
  seoforgeLabel: string; 
  competitorLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-xs text-primary font-semibold uppercase mb-1">{seoforgeLabel}</p>
        <p className="text-2xl font-bold text-primary">{seoforge}</p>
      </div>
      <div className="p-4 bg-muted rounded-lg border">
        <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">{competitorLabel}</p>
        <p className="text-2xl font-bold text-muted-foreground">{competitor}</p>
      </div>
    </div>
  );
}

export default function ComparePage() {
  useEffect(() => {
    document.title = "SEOaxe vs AutoSEO vs Semrush - SEO repair comparison 2026";
    
    // Inject JSON-LD schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLdSchema);
    script.id = 'compare-page-schema';
    document.head.appendChild(script);
    
    // Add meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'How does SEOaxe compare to AutoSEO, Semrush, Ahrefs, and traditional SEO agencies? See why SEOaxe is positioned as an SEO repair engine for existing pages.');
    
    return () => {
      const existingScript = document.getElementById('compare-page-schema');
      if (existingScript) existingScript.remove();
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-16 md:pb-24 md:pt-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Honest Comparison
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
                  SEOaxe is the SEO repair engine
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                    for pages you already have
                  </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                  Most SEO tools diagnose, draft, or report. SEOaxe takes a narrower lane:
                  it repairs real HTML, returns deployable output, and gives you a receipt of what changed.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem With Every Other Option</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Understanding where diagnostics, content tools, and agencies stop short for small and medium businesses.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-white dark:bg-card border rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Traditional SEO Agencies</h3>
                  <p className="text-sm text-muted-foreground">
                    Charge R5,000 to R50,000 per month, lock you into 6-month contracts, give PDF reports you don't understand.
                  </p>
                </div>

                <div className="p-6 bg-white dark:bg-card border rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Global SEO Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Semrush and Ahrefs cost R1,500–R5,000/month in USD. Require weeks of training. Do not fix anything — only tell you what is broken.
                  </p>
                </div>

                <div className="p-6 bg-white dark:bg-card border rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Content Tools (AutoSEO)</h3>
                  <p className="text-sm text-muted-foreground">
                    Write blog articles but rarely repair existing pages. Your meta tags can stay thin, schema can stay missing, and AEO sections can stay absent.
                  </p>
                </div>

                <div className="p-6 bg-white dark:bg-card border rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">DIY with ChatGPT</h3>
                  <p className="text-sm text-muted-foreground">
                    Gives you a starting point but no structure, no schema injection, no health scoring, no sitemap generation.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">What SEOaxe Does Differently</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      SEOaxe is not trying to be the biggest SEO suite. It is trying to own the repair job:
                      existing pages, technical SEO patches, AEO schema, repair receipts, sitemaps, and deployable output.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Full Feature Comparison Table */}
        <section className="px-4 py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Full Feature Comparison</h2>
                <p className="text-muted-foreground">See exactly how every tool stacks up feature by feature.</p>
              </div>

              <div className="bg-white dark:bg-card rounded-2xl border shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left py-4 px-6 font-semibold">Feature</th>
                        <th className="text-center py-4 px-4 font-bold text-primary bg-primary/5">SEOaxe</th>
                        <th className="text-center py-4 px-4 font-semibold text-muted-foreground">AutoSEO</th>
                        <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Semrush</th>
                        <th className="text-center py-4 px-4 font-semibold text-muted-foreground">SEO Agency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fullComparisonFeatures.map((row, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="py-4 px-6 font-medium">{row.feature}</td>
                          <td className="py-4 px-4 bg-primary/5">
                            <ComparisonCell value={row.seoforge} />
                          </td>
                          <td className="py-4 px-4">
                            <ComparisonCell value={row.autoseo} />
                          </td>
                          <td className="py-4 px-4">
                            <ComparisonCell value={row.semrush} />
                          </td>
                          <td className="py-4 px-4">
                            <ComparisonCell value={row.agency} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SEOaxe vs AutoSEO */}
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">SEOaxe vs AutoSEO</h2>
                <p className="text-muted-foreground">Content generation vs page repair</p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  AutoSEO is a content machine. It writes one SEO article per day for your website. 
                  That is genuinely useful - but it is only one piece of the puzzle, and it ignores 
                  the most urgent problem most websites have.
                </p>

                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 my-8">
                  <h4 className="text-red-800 dark:text-red-200 font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5" />
                    The Problem AutoSEO Cannot Solve
                  </h4>
                  <p className="text-red-700 dark:text-red-300">
                    If your existing pages have no meta tags, no schema markup, broken heading structure, 
                    and missing AEO optimization, publishing more articles on top of that broken foundation 
                    will not move your rankings. You are adding floors to a building with no structural integrity.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6 my-8">
                  <h4 className="text-green-800 dark:text-green-200 font-semibold flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5" />
                    What SEOaxe Does Differently
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    SEOaxe repairs the foundation first. Paste any page HTML and get back a deployable
                    version with meta tags, schema, AEO answer blocks, and a health score.
                    Then use the blog generator to create new content on top of a solid base.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden">
                <MiniComparisonTable 
                  headers={["SEOaxe", "AutoSEO"]}
                  rows={[
                    { label: "Repairs existing pages", values: [true, false] },
                    { label: "Technical SEO automation", values: [true, false] },
                    { label: "AEO schema injection", values: [true, false] },
                    { label: "Repair receipt", values: [true, false] },
                    { label: "Blog generation", values: [true, true] },
                    { label: "Emerging market focus", values: [true, false] },
                    { label: "Priced in ZAR", values: [true, false] },
                  ]}
                />
                <PricingCard 
                  seoforge="R299/month" 
                  competitor="R1,800+/month" 
                  seoforgeLabel="SEOaxe Starter" 
                  competitorLabel="AutoSEO Basic"
                />
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="font-semibold text-primary">
                  Verdict: AutoSEO is a content tool. SEOaxe is the repair layer for pages that already exist.
                  If you want more articles, use a content tool. If you want existing pages patched and ready to ship, use SEOaxe.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SEOaxe vs Semrush */}
        <section className="px-4 py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">SEOaxe vs Semrush</h2>
                  <p className="text-muted-foreground">Execution vs Diagnosis</p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Semrush is the industry standard for enterprise SEO teams. It has over 50 tools, 
                  billions of keywords in its database, and features that take months to master. 
                  It is also priced in USD starting at $139 per month - expensive for non-US markets.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
                  <h4 className="text-blue-800 dark:text-blue-200 font-semibold mb-3">The Fundamental Difference</h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Semrush tells you what is wrong. SEOaxe fixes it.</strong> A Semrush audit 
                    will show you 200 issues across your website. It will not fix a single one. You still 
                    need a developer, an SEO specialist, and hours of manual work to action anything it finds.
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-4">
                    SEOaxe shows you the issues <em>and</em> fixes them automatically in the same workflow. 
                    Paste your HTML. Get back optimized HTML. No developer needed. No additional tools needed.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden">
                <MiniComparisonTable 
                  headers={["SEOaxe", "Semrush"]}
                  rows={[
                    { label: "Automatically fixes issues", values: [true, false] },
                    { label: "No technical skills needed", values: [true, false] },
                    { label: "AEO optimization", values: [true, false] },
                    { label: "Schema injection", values: [true, false] },
                    { label: "Emerging market focus", values: [true, false] },
                    { label: "Priced in ZAR", values: [true, false] },
                  ]}
                />
                <div className="grid grid-cols-2 gap-4 mt-4 p-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-xs text-primary font-semibold uppercase mb-1">SEOaxe Learning Curve</p>
                    <p className="text-2xl font-bold text-primary">Minutes</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border">
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Semrush Learning Curve</p>
                    <p className="text-2xl font-bold text-muted-foreground">Months</p>
                  </div>
                </div>
                <PricingCard 
                  seoforge="R299/month" 
                  competitor="R2,500+/month" 
                  seoforgeLabel="SEOaxe Starter" 
                  competitorLabel="Semrush Pro"
                />
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="font-semibold text-primary">
                  Verdict: Semrush is a diagnostic tool for experts. SEOaxe is an execution tool for everyone. 
                  If you have an in-house SEO team, use Semrush. If you want results without the complexity - use SEOaxe.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SEOaxe vs Ahrefs */}
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">SEOaxe vs Ahrefs</h2>
                  <p className="text-muted-foreground">Implementation vs Research</p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Ahrefs is primarily a backlink analysis and keyword research tool. It is exceptional 
                  at what it does - but what it does is research, not implementation. Like Semrush, 
                  it identifies opportunities and problems but does not fix them.
                </p>
                <p className="text-muted-foreground">
                  Ahrefs charges in USD with high entry pricing.
                  It has no AEO optimization, no schema injection, and no automated page fixing.
                </p>
              </div>

              <div className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden">
                <MiniComparisonTable 
                  headers={["SEOaxe", "Ahrefs"]}
                  rows={[
                    { label: "Automatically fixes pages", values: [true, false] },
                    { label: "AEO optimization", values: [true, false] },
                    { label: "Schema markup injection", values: [true, false] },
                    { label: "No technical skills needed", values: [true, false] },
                    { label: "Priced in ZAR", values: [true, false] },
                  ]}
                />
                <PricingCard 
                  seoforge="R299/month" 
                  competitor="R2,000+/month" 
                  seoforgeLabel="SEOaxe Starter" 
                  competitorLabel="Ahrefs Lite"
                />
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="font-semibold text-primary">
                  Verdict: Ahrefs is for keyword research and backlink analysis. SEOaxe is for implementing 
                  SEO and AEO on your actual website. They solve different problems - but for most businesses, implementation is the urgent need, not more research.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SEOaxe vs SEO Agencies */}
        <section className="px-4 py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">SEOaxe vs Hiring an SEO Agency</h2>
                  <p className="text-muted-foreground">Automation vs Outsourcing</p>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Traditional SEO agencies charge between R5,000 and R50,000 per month. Enterprise 
                  agencies charge more. Most require minimum 6-month contracts. Most produce monthly 
                  PDF reports that tell you what they did without proving it worked.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-8">
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
                    <h4 className="text-red-800 dark:text-red-200 font-semibold flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Transparency Problem
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      You do not see the actual work. You see a report. SEOaxe shows you every change 
                      — before code, after code, complete list of what was added.
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
                    <h4 className="text-orange-800 dark:text-orange-200 font-semibold flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      Speed Problem
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      An agency takes weeks to audit, more weeks to implement, months for results. 
                      SEOaxe optimizes a page in 30 seconds.
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                    <h4 className="text-yellow-800 dark:text-yellow-200 font-semibold flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Cost Problem
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      At R5,000/month minimum = R60,000/year. SEOaxe Agency is R11,988/year. 
                      You save over R48,000 annually.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden">
                <MiniComparisonTable 
                  headers={["SEOaxe Agency", "SEO Agency"]}
                  rows={[
                    { label: "Full transparency", values: [true, "rarely"] },
                    { label: "No contract lock-in", values: [true, false] },
                    { label: "AEO optimization", values: [true, "rarely"] },
                    { label: "Local market expertise", values: [true, "sometimes"] },
                    { label: "You stay in control", values: [true, false] },
                  ]}
                />
                <div className="grid grid-cols-2 gap-4 mt-4 p-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-xs text-primary font-semibold uppercase mb-1">SEOaxe Agency</p>
                    <p className="text-2xl font-bold text-primary">R11,988/year</p>
                    <p className="text-xs text-primary/70">R999/month</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border">
                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Traditional Agency</p>
                    <p className="text-2xl font-bold text-muted-foreground">R60,000–600K/year</p>
                    <p className="text-xs text-muted-foreground/70">R5,000–50K/month</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="font-semibold text-primary">
                  Verdict: Agencies make sense for businesses that want to completely outsource their 
                  SEO strategy and have the budget. SEOaxe is for businesses that want professional 
                  results at a fraction of the cost with full control and transparency.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Local Market Focus Section */}
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              <div className="text-center">
                <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
                  <MapPin className="h-3 w-3 mr-1" />
                  Built for Local Markets
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Only Tool Built for Local Markets</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Every competitor was built for the US or UK market. Their keyword databases prioritize 
                  American search intent. Their pricing is in USD. SEOaxe is different.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <Award className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="font-semibold mb-2">LocalBusiness Schema</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimized for local address formats and search patterns.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Globe className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">Multilingual Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Schema support for 20+ languages including emerging market languages.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <Shield className="w-8 h-8 text-purple-600 mb-4" />
                  <h3 className="font-semibold mb-2">Mobile-First AEO</h3>
                  <p className="text-sm text-muted-foreground">
                    AEO optimization tuned for mobile search behaviour and data constraints.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                  <DollarSign className="w-8 h-8 text-orange-600 mb-4" />
                  <h3 className="font-semibold mb-2">Priced in ZAR</h3>
                  <p className="text-sm text-muted-foreground">
                    No USD conversion surprises. Local pricing for your market.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-red-600 mb-4" />
                  <h3 className="font-semibold mb-2">Local Case Studies</h3>
                  <p className="text-sm text-muted-foreground">
                    Real results from real local businesses - not generic case studies.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                  <Zap className="w-8 h-8 text-indigo-600 mb-4" />
                  <h3 className="font-semibold mb-2">Local Challenges</h3>
                  <p className="text-sm text-muted-foreground">
                    Built by people who understand local infrastructure challenges and market realities.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cost of Inaction */}
        <section className="px-4 py-16 md:py-24 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/10">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">What Happens When You Don't Fix Your SEO</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Every day your website runs with missing meta tags, broken schema, and no AEO optimization 
                is a day your competitors are being recommended instead of you.
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Google AI Overviews now appear on over 60% of searches. If your website is not structured 
                for AEO, you are invisible in those answers. Your competitor who implemented it last month 
                is being cited as the expert in your industry every single day.
              </p>
              <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg inline-block">
                <p className="text-red-800 dark:text-red-200 font-semibold">
                  The cost of inaction is not zero. It is every customer who never knew you existed.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold">Start Free. No Credit Card. No Risk.</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                SEOaxe has a free tier. Paste your first page right now and see your SEO health score 
                in 30 seconds. No signup required to try the optimizer.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/app">
                  <Button size="lg" className="h-14 px-8 text-base gap-2">
                    Try SEOaxe Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Quick answers to common comparison questions.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Is SEOaxe really better than Semrush?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    For businesses that need to fix their website without technical expertise, yes. 
                    Semrush identifies problems. SEOaxe fixes them automatically. If you have an enterprise 
                    SEO team that needs deep keyword research and backlink analysis, Semrush is still the 
                    industry leader for that specific use case. For implementation and AEO optimization, SEOaxe wins.
                  </p>
                </div>

                <div className="bg-white dark:bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Can I use SEOaxe alongside other tools?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Absolutely. Many users run Semrush or Ahrefs for keyword research, then use SEOaxe to 
                    implement the fixes those tools identify. SEOaxe handles the execution that other tools cannot.
                  </p>
                </div>

                <div className="bg-white dark:bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Is SEOaxe suitable for agencies?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Yes. The Agency plan at R999/month includes unlimited page optimizations, white label reports, 
                    and full client management features. It is designed specifically for digital 
                    agencies who want to deliver professional SEO results without the overhead of manual implementation.
                  </p>
                </div>

                <div className="bg-white dark:bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Why is SEOaxe cheaper than global alternatives?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Because it is built for local markets and priced accordingly. Global tools price in USD 
                    for US market purchasing power. SEOaxe is priced in local currency for local businesses. 
                    Same professional results. Local price.
                  </p>
                </div>

                <div className="bg-white dark:bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Does SEOaxe replace my content strategy?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No. SEOaxe handles technical SEO and AEO implementation - the foundation that makes your 
                    content rankable. For ongoing content creation, use the built-in blog generator or pair 
                    SEOaxe with your existing content workflow.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
