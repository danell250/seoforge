import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
  const features = [
    { icon: FileCode2, title: "Repair Real HTML", desc: "Paste, upload, or crawl existing pages and get production-ready HTML back." },
    { icon: ShieldCheck, title: "Get a Repair Receipt", desc: "See every meta, schema, heading, answer block, and language patch applied." },
    { icon: LayoutTemplate, title: "Compare Before and After", desc: "Preview the search result and score lift before the repaired page ships." },
    { icon: BrainCircuit, title: "Answer-Engine Patches", desc: "Add FAQ, AEO, and JSON-LD sections built for AI answers and snippets." },
    { icon: Search, title: "Crawl Then Fix", desc: "Find weak pages across a live site and turn them into a repair queue." },
    { icon: Globe2, title: "Regional Search Layers", desc: "Add hreflang, localized schema, and language cues for multi-market pages." },
    { icon: LineChart, title: "Competitor Gap Repair", desc: "Spot the topics competitors cover and patch missing proof into your page." },
    { icon: Zap, title: "Deployable Outputs", desc: "Download HTML, sitemap.xml, robots.txt, or send finished pages to your CMS." },
    { icon: Bot, title: "Agency-Ready Evidence", desc: "Give clients a clear before/after record instead of a vague recommendation list." },
    { icon: Code2, title: "No Rebuild Required", desc: "Keep the website you already have and improve the code search engines read." },
  ];
  const workflow = [
    {
      title: "Bring the page you already have",
      desc: "Paste one HTML file, upload a ZIP, or crawl a live site. SEOaxe starts from your real website, not a blank article editor.",
    },
    {
      title: "Build the repair patch",
      desc: "The engine rewrites the parts search systems care about: metadata, schema, answer sections, headings, alt text, canonical tags, and language signals.",
    },
    {
      title: "Ship with proof",
      desc: "Download deployable HTML and assets with a repair receipt showing exactly what changed and how the score moved.",
    },
  ];
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-16 md:pb-24 md:pt-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.08),transparent_50%)]" />
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  The SEO Repair Engine
                </Badge>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
                  SEOaxe repairs the pages
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                    you already have.
                  </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                  Most AI SEO tools create drafts. SEOaxe returns deployable page patches: optimized HTML, schema, AEO answer blocks, sitemaps, language tags, before/after scores, and a repair receipt you can trust.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/app">
                  <Button size="lg" className="h-12 px-8 text-base gap-2">
                    Repair a page
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
              className="mt-16"
            >
              <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted-foreground">SEOaxe Repair Receipt</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_280px] divide-y md:divide-y-0 md:divide-x">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Upload Page</Button>
                        <Button size="sm">Build Patch</Button>
                      </div>
                    </div>
                    <div className="grid gap-3 font-mono text-xs">
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Patched:</span> JSON-LD structured data for Organization
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Patched:</span> Meta description with search intent
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Patched:</span> Canonical URL and hreflang tags
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Patched:</span> AEO answer block for AI citations
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4 bg-muted/30">
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
                      <p className="text-sm font-medium">Repair Pack</p>
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
        <section id="features" className="py-20 bg-muted/30 border-y">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Not another AI writing tool</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">SEOaxe is built for the messy middle after a website is already live: inspect it, patch it, prove it, and ship it.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-5 rounded-lg bg-card border hover:border-primary/30 hover:shadow-sm transition-all"
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">How the repair engine works</h2>
              <p className="text-muted-foreground">From live page to patched HTML with evidence</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
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
        <section className="py-20 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">The unique angle buyers can remember</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">SEOaxe owns the practical job most SEO tools leave unfinished: turning existing pages into repaired, deployable, evidence-backed pages.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Repair, not rewrite",
                  desc: "Keep the current website and patch the code that affects search visibility. That is easier to trust than asking a business to replace every page.",
                  icon: FileCode2
                },
                {
                  title: "Evidence, not mystery",
                  desc: "Every run produces a before score, after score, code diff, and repair receipt. Agencies can show what changed instead of selling invisible work.",
                  icon: ShieldCheck
                },
                {
                  title: "Deploy, not advise",
                  desc: "SEOaxe packages the actual HTML, sitemap, robots file, CMS path, and monitoring workflow so the fix can leave the dashboard.",
                  icon: Zap
                }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-card border rounded-xl shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <testimonial.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{testimonial.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{testimonial.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Repair one page and see the receipt.</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">Start with the website you already have. SEOaxe will show the patch, the score lift, and the deployable output.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app">
                <Button size="lg" variant="secondary" className="h-12 px-8 gap-2">
                  Start free repair
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
