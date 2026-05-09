import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { FAQPageSchema } from "@/components/seo";
import {
  ArrowRight,
  Bot,
  Search,
  Code2,
  Zap,
  FileCode2,
  Globe2,
  ShieldCheck,
  LayoutTemplate,
  LineChart,
  BrainCircuit,
  Sparkles,
  ChevronRight,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.body.classList.add("seoaxe-home");
    document.title = "SEOaxe - Live SEO Audit and AEO Guidance";
    const description =
      "Audit live website pages from a URL. Get SEO, AEO, schema, sitemap, content gap, and competitor guidance without requesting source files.";
    const metaDesc = document.querySelector('meta[name="description"]');
    metaDesc?.setAttribute("content", description);
    document.querySelector('meta[name="title"]')?.setAttribute("content", document.title);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", "SEOaxe - Live SEO Audit and AEO Guidance");
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="twitter:title"]')?.setAttribute("content", "SEOaxe - Live SEO Audit and AEO Guidance");
    document.querySelector('meta[property="twitter:description"]')?.setAttribute("content", description);
    return () => document.body.classList.remove("seoaxe-home");
  }, []);

  const features = [
    { icon: Globe2, title: "Audit Live URLs", desc: "Scan public pages directly from their URL. No HTML, TS, TSX, or ZIP files required." },
    { icon: ShieldCheck, title: "Prioritized Fix List", desc: "See the metadata, schema, heading, answer-block, and language issues worth fixing first." },
    { icon: LayoutTemplate, title: "Compare Before and After", desc: "Preview likely score impact before your team applies changes." },
    { icon: BrainCircuit, title: "Answer-Engine Guidance", desc: "Generate FAQ, AEO, and JSON-LD suggestions built for AI answers and snippets." },
    { icon: Search, title: "Crawl Then Prioritize", desc: "Find weak pages across a live site and turn them into a review queue." },
    { icon: Globe2, title: "Regional Search Layers", desc: "Add hreflang, localized schema, and language cues for multi-market pages." },
    { icon: LineChart, title: "Competitor Gap Research", desc: "Spot the topics competitors cover and build stronger proof into your pages." },
    { icon: Zap, title: "Copyable Snippets", desc: "Copy schema, FAQ, sitemap, robots, and content suggestions after review." },
    { icon: Bot, title: "Agency-Ready Evidence", desc: "Give clients a clear audit trail instead of a vague recommendation list." },
    { icon: Code2, title: "No Rebuild Required", desc: "Keep the website you already have and improve the signals search engines read." },
  ];
  const workflow = [
    {
      title: "Enter the live page URL",
      desc: "SEOaxe starts from the public website search engines can already crawl, so users do not need to provide source files.",
    },
    {
      title: "Review the audit",
      desc: "The engine flags the parts search systems care about: metadata, schema, answer sections, headings, alt text, canonical tags, and language signals.",
    },
    {
      title: "Apply guided fixes",
      desc: "Use copyable snippets and checklists your team can review before anything changes on the live site.",
    },
  ];
  const workspaceHref = isAuthenticated ? "/app#site-crawler" : "/login?redirect=%2Fapp%23site-crawler";

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <FAQPageSchema />
      
      <main className="flex-1">
        {/* Social Proof Banner */}
        <section className="border-b bg-muted/30 py-3">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-background" />
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-background" />
                  <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-background" />
                </div>
                <span>2,500+ agencies using SEOaxe</span>
              </div>
              <span>•</span>
              <span>50,000+ pages audited</span>
              <span>•</span>
              <span>Average score lift: +47 points</span>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-10 pt-12 md:pb-24 md:pt-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.08),transparent_50%)]" />
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6 md:space-y-8"
            >
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live SEO Audit Engine
                </Badge>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
                  Your website is losing traffic.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                    Fix it without rebuilding.
                  </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                  Most AI SEO tools ask for files or create generic drafts. SEOaxe scans live URLs, finds the SEO and AEO issues, and gives reviewable fixes your team can apply with confidence.
                </p>
              </div>

              {/* Before/After Score Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center gap-6 md:gap-8"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-red-500">42/100</div>
                  <div className="text-sm text-muted-foreground mt-1">Before</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                  <div className="text-xs text-green-600 font-semibold">+47 points</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-green-500">89/100</div>
                  <div className="text-sm text-muted-foreground mt-1">After</div>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={workspaceHref}>
                  <Button size="lg" className="h-12 px-8 text-base gap-2">
                    Audit a site free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    View pricing
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground">
                Free to start. No credit card required.
              </p>
            </motion.div>

            {/* Demo Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 md:mt-16"
            >
              <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground">SEOaxe Audit Receipt</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_280px] divide-y md:divide-y-0 md:divide-x">
                  <div className="p-4 space-y-3 md:p-6 md:space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Scan URL</Button>
                        <Button size="sm">Prioritize Fixes</Button>
                      </div>
                    </div>
                    <div className="grid gap-3 font-mono text-xs">
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">Found:</span> Missing Organization JSON-LD
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">Found:</span> Thin meta description
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">Found:</span> Missing canonical and hreflang signals
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">Suggested:</span> AEO answer block for AI citations
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 bg-muted/30 md:p-5">
                    <div>
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        SEO Health Score
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">87</span>
                        <span className="text-sm text-muted-foreground mb-1">/100</span>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[87%] bg-gradient-to-r from-primary to-blue-400 rounded-full" />
                      </div>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium">Audit Focus</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Technical</span>
                          <span className="font-medium text-green-600">+12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Content</span>
                          <span className="font-medium text-green-600">+8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AEO Ready</span>
                          <span className="font-medium text-green-600">+15</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 bg-muted/30 border-y md:py-20">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl font-bold mb-3">Not another AI writing tool</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">SEOaxe is built for the messy middle after a website is already live: inspect it, prioritize it, prove it, and monitor it.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group p-4 rounded-lg bg-card border hover:border-primary/30 hover:shadow-sm transition-all md:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-12 md:py-20">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl font-bold mb-3">How the audit engine works</h2>
              <p className="text-muted-foreground">From live URL to prioritized fixes with evidence</p>
            </div>
            
            <div className="grid gap-5 md:grid-cols-3 md:gap-6">
              {workflow.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                      {index + 1}
                    </span>
                    {index < 2 && (
                      <div className="hidden md:block flex-1 h-px bg-border" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiation Section */}
        <section className="py-12 bg-muted/30 md:py-20">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl font-bold mb-3">The unique angle buyers can remember</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">SEOaxe owns the practical job most SEO tools leave unfinished: finding exactly what is holding live pages back and making the fixes easy to review.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Audit, not blind rewrite",
                  desc: "Keep the current website and identify the signals that affect search visibility. That is easier to trust than asking a business to provide source files.",
                  icon: FileCode2
                },
                {
                  title: "Evidence, not mystery",
                  desc: "Every run produces scores, findings, snippets, and a clear audit receipt. Agencies can show what matters instead of selling invisible work.",
                  icon: ShieldCheck
                },
                {
                  title: "Guide, not gamble",
                  desc: "SEOaxe gives sitemap, robots, schema, content, and monitoring guidance so the team can review before anything goes live.",
                  icon: Zap
                }
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="p-4 bg-card border rounded-xl shadow-sm md:p-6"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <testimonial.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{testimonial.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{testimonial.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary text-primary-foreground md:py-20">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Audit one live site and see the proof.</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">Start with the website you already have. SEOaxe will show the issues, the likely score lift, and the reviewable fixes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={workspaceHref}>
                <Button size="lg" variant="secondary" className="h-12 px-8 gap-2">
                  Start free audit
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="h-12 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  View plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
