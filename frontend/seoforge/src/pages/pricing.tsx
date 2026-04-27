import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SEODomination",
  "description": "AI-powered SEO and AEO optimization platform for businesses",
  "brand": {
    "@type": "Brand",
    "name": "SEODomination"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Plan",
      "price": "0",
      "priceCurrency": "ZAR",
      "description": "3 pages optimized per month, basic technical SEO checks",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "299",
      "priceCurrency": "ZAR",
      "priceValidUntil": "2026-12-31",
      "description": "20 pages optimized per month, full AEO & Answer Block Generation",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Agency Plan",
      "price": "999",
      "priceCurrency": "ZAR",
      "priceValidUntil": "2026-12-31",
      "description": "Unlimited pages optimized, white-label PDF reports",
      "availability": "https://schema.org/InStock"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
};

export default function Pricing() {
  useEffect(() => {
    // Inject Product schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(productSchema);
    script.id = 'pricing-product-schema';
    document.head.appendChild(script);
    
    // Update title and meta
    document.title = "SEODomination Pricing — Free, Starter R299/month, Agency R999/month";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'SEODomination pricing: Free plan (3 pages/month), Starter R299/month (20 pages), Agency R999/month (unlimited). All plans include AEO optimization, schema markup, and health scoring.');
    
    return () => {
      const existing = document.getElementById('pricing-product-schema');
      if (existing) existing.remove();
    };
  }, []);
  
  const plans = [
    {
      name: "Free",
      price: "R0",
      period: "forever",
      description: "Perfect for testing the waters.",
      features: [
        "3 pages optimized per month",
        "Basic technical SEO checks",
        "Standard JSON-LD schema",
        "Community support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Starter",
      price: "R299",
      period: "per month",
      description: "For ambitious freelancers & founders.",
      features: [
        "20 pages optimized per month",
        "Full AEO & Answer Block Generation",
        "Advanced Multilingual Schema",
        "Competitor Scanner access",
        "Email support within 24h"
      ],
      cta: "Start Starter Plan",
      popular: true
    },
    {
      name: "Agency",
      price: "R999",
      period: "per month",
      description: "Scale your entire agency operations.",
      features: [
        "Unlimited pages optimized",
        "Bulk ZIP processing pipeline",
        "White-label PDF reports",
        "CMS deployment integrations",
        "Priority Slack/WhatsApp support"
      ],
      cta: "Start Agency Plan",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Invest in your organic growth. All plans are billed in South African Rand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start">
                        <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Killer Positioning Comparison */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Why Businesses Choose SEODomination</h2>
              <p className="text-muted-foreground">See how we compare to traditional content tools</p>
            </div>
            
            <div className="bg-card border rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left py-4 px-6 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-bold text-primary bg-primary/5 w-1/3">SEODomination</th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground w-1/3">Traditional Content Tools</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">Fixes existing pages</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">Technical SEO automation</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">AEO schema injection</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">SEO health score (before/after)</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">Competitor SEO scanner</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">White label for agencies</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">Blog article generation</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">Pricing in local currency</td>
                    <td className="py-4 px-4 bg-primary/5">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-xl">
              <p className="font-semibold text-primary mb-2">The difference is clear</p>
              <p className="text-muted-foreground text-sm">
                Traditional content tools create new articles. SEODomination fixes your entire website — existing pages, technical SEO, AEO schema, and health scores. That's why our users see rankings improve faster.
              </p>
            </div>
          </div>

          <div className="mt-32 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">Yes, we offer a 14-day money-back guarantee if you are not satisfied with the platform.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">Absolutely. You can change your plan at any time. Prorated charges will be applied automatically.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What constitutes a "page optimization"?</h3>
                <p className="text-muted-foreground">One optimization counts every time you submit HTML through the Single Page Optimizer or process a file in the ZIP bulk uploader.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
