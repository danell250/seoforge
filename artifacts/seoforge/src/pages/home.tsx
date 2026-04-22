import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Bot, 
  Search, 
  Code2, 
  Zap, 
  FileCode2, 
  Globe2, 
  ShieldCheck, 
  LayoutTemplate,
  LineChart,
  BrainCircuit
} from "lucide-react";

export default function Home() {
  const features = [
    { icon: Search, title: "Full-Site Crawler", desc: "Instantly scan and audit your entire domain for critical technical SEO errors and missed AEO opportunities." },
    { icon: LayoutTemplate, title: "Before/After Google Preview", desc: "See exactly how your Answer Engine Optimization updates will look in Google AI Overviews and traditional SERPs." },
    { icon: LineChart, title: "Competitor Scanner", desc: "Reverse-engineer the exact meta strategies, schema, and content structures your competitors use to rank." },
    { icon: BrainCircuit, title: "AEO Answer Block Generator", desc: "Automatically format your content to win Google AI Overviews and featured snippets." },
    { icon: Zap, title: "CMS Deploy", desc: "Deploy optimized HTML directly to WordPress or Shopify environments in seconds." },
    { icon: ShieldCheck, title: "SEO Health Score", desc: "Get a granular technical, content, and AEO readiness score for every page you optimize." },
    { icon: FileCode2, title: "Sitemap & Robots Generator", desc: "Auto-generate perfectly formatted sitemap.xml and robots.txt files ready for Search Console." },
    { icon: Globe2, title: "Multilingual Schema", desc: "Generate advanced JSON-LD structured data tailored for South African and pan-African multilingual markets." },
    { icon: Bot, title: "White-Label Reports", desc: "Export agency-branded optimization reports to prove value to your SEO clients." },
    { icon: Code2, title: "AI Content Gap Detector", desc: "Identify exactly which semantic entities and LSI keywords your content is missing." },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="container max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                SEO & AEO Done For You <br/>
                <span className="text-primary">In Seconds.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                The serious optimization platform for South African agencies. Automate your technical SEO and win Google AI Overviews without touching a line of backend code.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/app">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                    Try It Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Complete Optimization Arsenal</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to dominate SERPs and AI Answer Engines, engineered into one seamless workflow.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                >
                  <feature.icon className="h-10 w-10 text-primary mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA Section */}
        <section className="py-24">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to scale your agency's output?</h2>
            <p className="text-muted-foreground mb-10 text-lg">Join top African digital agencies automating their SEO workflows today.</p>
            <Link href="/pricing">
              <Button size="lg" className="h-12 px-8 text-base">See Plans & Pricing</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
