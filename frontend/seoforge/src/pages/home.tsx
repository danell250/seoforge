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
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Star,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const features = [
    { icon: Search, title: "Scan a Website", desc: "Crawl a live site and find the pages that need improvement." },
    { icon: LayoutTemplate, title: "See the Before and After", desc: "Preview how your updated page can look in search results before you publish it." },
    { icon: LineChart, title: "Research Competitors", desc: "Analyze a competitor page and see what they are targeting." },
    { icon: BrainCircuit, title: "Add FAQ Answers", desc: "Generate FAQ-style answers that help Google and AI tools quote your page." },
    { icon: Zap, title: "Publish to Your CMS", desc: "Send finished HTML straight to WordPress or Shopify." },
    { icon: ShieldCheck, title: "Track Page Scores", desc: "See how each page improves after optimization." },
    { icon: FileCode2, title: "Create Sitemap Files", desc: "Generate `sitemap.xml` and `robots.txt` ready for Search Console." },
    { icon: Globe2, title: "Add Language Targeting", desc: "Create the language and country tags needed for multi-region pages." },
    { icon: Bot, title: "Client-Friendly Reports", desc: "Export clear reports you can share with clients or teammates." },
    { icon: Code2, title: "Find Missing Content", desc: "Add the topics and questions your page still does not answer." },
  ];
  const workflow = [
    {
      title: "Audit the page or crawl the site",
      desc: "Start with a single HTML page or scan a live domain to understand what is missing before you make changes.",
    },
    {
      title: "Improve SEO structure and answer readiness",
      desc: "Add stronger metadata, schema, hreflang, answer blocks, and content improvements in a guided workflow.",
    },
    {
      title: "Deploy and monitor",
      desc: "Push final HTML into WordPress or Shopify, then keep a record of improvements in the dashboard and monitor views.",
    },
  ];
  const outcomes = [
    "Clearer metadata and technical SEO structure",
    "Better formatting for AI Overviews and answer engines",
    "A workflow a freelancer, founder, or agency team can explain quickly",
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
                  AI-Powered SEO + AEO
                </Badge>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
                  While other tools write articles,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                    SEOForge fixes your entire website.
                  </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                  Technical SEO, AEO schema, health scores - automated in 30 seconds. No developer needed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/app">
                  <Button size="lg" className="h-12 px-8 text-base gap-2">
                    Start optimizing
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

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                {outcomes.map((item, i) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
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
                    <span className="text-xs text-muted-foreground">SEOForge Workspace</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_280px] divide-y md:divide-y-0 md:divide-x">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Upload HTML</Button>
                        <Button size="sm">Optimize Now</Button>
                      </div>
                    </div>
                    <div className="grid gap-3 font-mono text-xs">
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Added:</span> JSON-LD structured data for Organization
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Added:</span> Meta description (155 chars optimized)
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Added:</span> Canonical URL and hreflang tags
                      </div>
                      <div className="p-3 rounded bg-muted/50 border text-muted-foreground">
                        <span className="text-green-600">+ Added:</span> AEO answer block for featured snippet
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
                      <p className="text-sm font-medium">Improvements</p>
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
              <h2 className="text-3xl font-bold mb-3">Everything you need to rank</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">From technical audits to AI answer optimization - one platform for modern SEO teams.</p>
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
              <h2 className="text-3xl font-bold mb-3">How it works</h2>
              <p className="text-muted-foreground">Three steps to optimized, deploy-ready pages</p>
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

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm font-medium text-muted-foreground">4.9/5 from 127 reviews</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">Loved by businesses worldwide</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">See what founders, marketers, and agencies say about SEOForge.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "We went from 34 to 91 SEO health score in one afternoon. Our developer estimated this would have taken weeks manually.",
                  author: "Sarah Mitchell",
                  role: "Marketing Director, TechFlow SA",
                  rating: 5
                },
                {
                  quote: "The AEO answer blocks alone are worth the subscription. We're now cited in Google AI Overviews for our key terms.",
                  author: "David Chen",
                  role: "Founder, GrowthLab",
                  rating: 5
                },
                {
                  quote: "Finally an SEO tool that actually FIXES things instead of just telling me what's broken. White-label reports are a game-changer for our agency.",
                  author: "Thabo Ndlovu",
                  role: "CEO, Digital Forge Agency",
                  rating: 5
                }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-card border rounded-xl shadow-sm"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div className="flex gap-1 mb-4" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <meta itemProp="ratingValue" content={String(testimonial.rating)} />
                    <meta itemProp="bestRating" content="5" />
                  </div>
                  <blockquote className="text-sm text-muted-foreground mb-4 leading-relaxed" itemProp="reviewBody">
                    "{testimonial.quote}"
                  </blockquote>
                  <div itemProp="author" itemScope itemType="https://schema.org/Person">
                    <p className="font-semibold text-sm" itemProp="name">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground" itemProp="jobTitle">{testimonial.role}</p>
                  </div>
                  <meta itemProp="itemReviewed" content="SEOForge" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to optimize your pages?</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">Start auditing and improving your HTML for search engines and AI answer engines today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app">
                <Button size="lg" variant="secondary" className="h-12 px-8 gap-2">
                  Get started free
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
