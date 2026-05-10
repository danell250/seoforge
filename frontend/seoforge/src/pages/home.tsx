import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { FAQPageSchema } from "@/components/seo";
import { generateAfricanHreflang, DEFAULT_SUPPORTED_LANGUAGES } from "@/lib/hreflang";
import { SITE_URL } from "@/lib/brand-metadata";
import { ArrowRight, Zap, Code2, Bot, BarChart3, Eye, LockOpen } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.body.classList.add("seoaxe-home");
    return () => document.body.classList.remove("seoaxe-home");
  }, []);

  const workspaceHref = isAuthenticated ? "/app" : "/login?redirect=%2Fapp";

  const features = [
    { icon: Zap, title: "Instant audit from any URL", desc: "No file uploads. Paste the live page and get results immediately." },
    { icon: Code2, title: "Copyable schema + meta fixes", desc: "Get the exact JSON-LD and HTML you need — ready to paste." },
    { icon: Bot, title: "AEO for Google AI Overviews", desc: "Structure answers so AI search systems cite your pages." },
    { icon: BarChart3, title: "Before/after proof", desc: "Score lift report you can show a client or your team." },
  ];

  const proofStats = [
    { num: "+47 pts", desc: "average SEO score lift after first audit" },
    { num: "50,000+", desc: "pages audited and repaired" },
    { num: "30 sec", desc: "from URL to prioritized fix list" },
  ];

  const testimonials = [
    {
      text: "I paste a URL and get told exactly what to fix. No jargon, no guesswork. My homepage went from 38 to 91 in one afternoon.",
      author: "Thabo M.",
      role: "E-commerce founder, Joburg",
      initials: "TM",
      color: "bg-blue-100 text-blue-700",
    },
    {
      text: "Finally a tool that actually gives you the code, not just a list of problems. My agency uses it for every client onboarding now.",
      author: "Sarah R.",
      role: "Digital agency owner, Cape Town",
      initials: "SR",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>SEOaxe — Live SEO Audit and AEO Guidance</title>
        <meta name="description" content="SEOaxe provides live SEO audits and answer engine optimization (AEO) guidance. Optimize your website for Google search and AI overviews." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />
        {generateAfricanHreflang(SITE_URL, DEFAULT_SUPPORTED_LANGUAGES).map((tag, idx) => (
          <link key={idx} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
        ))}
        <meta property="og:title" content="SEOaxe — Live SEO Audit and AEO Guidance" />
        <meta property="og:description" content="SEOaxe provides live SEO audits and answer engine optimization (AEO) guidance. Optimize your website for Google search and AI overviews." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/opengraph.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:title" content="SEOaxe — Live SEO Audit and AEO Guidance" />
        <meta property="twitter:description" content="SEOaxe provides live SEO audits and answer engine optimization (AEO) guidance. Optimize your website for Google search and AI overviews." />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:image" content={`${SITE_URL}/opengraph.jpg`} />
      </Helmet>
      <Navbar />
      <FAQPageSchema />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-14 px-8">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full mb-5">
              <Eye className="w-3.5 h-3.5" />
              Live SEO audit engine
            </div>
            <h1 className="text-4xl font-semibold leading-tight mb-4 tracking-tight">
              Paste your URL.<br />
              <span className="text-blue-600">Get ranked fixes</span> in 30 seconds.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-7 max-w-xl">
              SEOaxe scans any live page and tells you exactly what's hurting your rankings — with copyable fixes you can apply today. No agency. No guesswork.
            </p>

            <div className="flex items-center gap-2.5 flex-wrap mb-8">
              <Link href={workspaceHref}>
                <Button className="h-10 px-5 text-sm font-semibold bg-blue-600 hover:bg-blue-700">
                  <ArrowRight className="w-4 h-4 mr-1.5" />
                  Audit my site free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="h-10 px-5 text-sm">
                  See how it works
                </Button>
              </Link>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <LockOpen className="w-3.5 h-3.5" />
              Free to start, no credit card
            </div>
          </div>
        </section>

        {/* Demo Audit Box */}
        <section className="px-8 mb-12">
          <Card className="overflow-hidden border bg-card max-w-4xl mx-auto">
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b bg-background">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1 bg-muted px-2.5 py-1 rounded border text-xs text-muted-foreground font-mono">
                yourwebsite.co.za
              </div>
              <Button className="py-1 px-2.5 text-xs h-7 bg-blue-600 hover:bg-blue-700">
                Scan
              </Button>
            </div>

            <div className="grid md:grid-cols-[1fr_200px]">
              <div className="p-4 border-r">
                <div className="text-xs font-semibold text-muted-foreground mb-2">4 issues found · sorted by impact</div>
                
                <div className="flex items-start gap-2 py-2 border-b text-xs">
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 whitespace-nowrap mt-0.5">Critical</span>
                  <span>No schema markup — invisible to AI search</span>
                </div>

                <div className="flex items-start gap-2 py-2 border-b text-xs">
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 whitespace-nowrap mt-0.5">Critical</span>
                  <span>Meta description missing on 3 key pages</span>
                </div>

                <div className="flex items-start gap-2 py-2 border-b text-xs">
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 whitespace-nowrap mt-0.5">Warning</span>
                  <span>H1 tag doesn't match search intent</span>
                </div>

                <div className="flex items-start gap-2 py-2 text-xs">
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700 whitespace-nowrap mt-0.5">Good</span>
                  <span>Page speed is within acceptable range</span>
                </div>
              </div>

              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">SEO health score</div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold text-blue-600 leading-none">87</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                
                <div className="mt-2.5 bg-muted rounded-full h-1.25 overflow-hidden">
                  <div className="h-full w-[87%] bg-blue-600 rounded-full" />
                </div>

                <div className="mt-2.5 text-xs text-green-700 bg-green-100 px-1.75 py-0.75 rounded inline-block mb-3">
                  ↑ +45 points after fixes
                </div>

                <div className="text-xs">
                  <div className="flex justify-between py-0.75 text-muted-foreground">
                    <span>Technical</span>
                    <span className="text-green-700 font-semibold">+14</span>
                  </div>
                  <div className="flex justify-between py-0.75 text-muted-foreground">
                    <span>Content</span>
                    <span className="text-green-700 font-semibold">+9</span>
                  </div>
                  <div className="flex justify-between py-0.75 text-muted-foreground">
                    <span>AEO ready</span>
                    <span className="text-green-700 font-semibold">+22</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <div className="h-px bg-border mx-8" />

        {/* Proof Grid Section */}
        <section className="py-10 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-5">
              real results
            </div>
            
            <div className="grid md:grid-cols-3 gap-3">
              {proofStats.map((stat, i) => (
                <Card key={i} className="bg-muted">
                  <CardContent className="p-3.5 md:p-4">
                    <div className="text-2xl font-semibold">{stat.num}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {stat.desc}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-8" />

        {/* Features Section */}
        <section className="py-10 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-5">
              what you get
            </div>
            
            <div className="grid md:grid-cols-2 gap-2.5">
              {features.map((feature, i) => (
                <Card key={i} className="bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-3.5 h-3.5 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-0.5">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-8" />

        {/* Comparison Section */}
        <section className="py-10 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-5">
              vs the alternatives
            </div>
            
            <div className="grid md:grid-cols-3 gap-2.5">
              <Card className="bg-card">
                <CardContent className="p-3.5">
                  <div className="text-sm font-semibold mb-2.5">SEO Agency</div>
                  <div className="space-y-0.75">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      R5,000–50,000/month
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      PDF reports, no code
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      6-month lock-in
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      Weeks to see results
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-2 border-blue-600">
                <CardContent className="p-3.5">
                  <div className="text-sm font-semibold mb-2.5 flex items-center justify-between">
                    SEOaxe
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">you're here</span>
                  </div>
                  <div className="space-y-0.75">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-green-600">✓</span>
                      From $3/month
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-green-600">✓</span>
                      Deployable code output
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-green-600">✓</span>
                      Cancel anytime
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-green-600">✓</span>
                      Results in 30 seconds
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-3.5">
                  <div className="text-sm font-semibold mb-2.5">Semrush / Ahrefs</div>
                  <div className="space-y-0.75">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      $140+/month in USD
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      Diagnoses, doesn't fix
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      Months to learn
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.75">
                      <span className="text-red-500">✕</span>
                      No AEO support
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-8" />

        {/* Testimonials Section */}
        <section className="py-10 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-5">
              what people say
            </div>
            
            <div className="grid md:grid-cols-2 gap-2.5">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="bg-card">
                  <CardContent className="p-3.5">
                    <p className="text-sm leading-relaxed text-muted-foreground mb-2.5">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${testimonial.color}`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{testimonial.author}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-8 pb-10">
          <div className="max-w-4xl mx-auto bg-[#042C53] rounded-xl p-7 text-center">
            <h2 className="text-xl font-semibold text-blue-100 mb-2">
              Your competitors are already fixing this.
            </h2>
            <p className="text-sm text-blue-300 mb-5 leading-relaxed">
              Audit your first page in 30 seconds.<br />
              No credit card. No setup. Just paste your URL.
            </p>
            <Link href={workspaceHref}>
              <Button className="h-10 px-6 text-sm font-semibold bg-blue-600 hover:bg-blue-700">
                <ArrowRight className="w-4 h-4 mr-1.5" />
                Start free audit now
              </Button>
            </Link>
            <div className="text-xs text-blue-400 mt-2.5 opacity-70">
              Free tier available · Paid plans from $3/month
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
