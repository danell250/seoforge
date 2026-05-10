import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo } from "react";
import { BRAND_NAME, PRODUCT_DESCRIPTION, SITE_URL } from "@/lib/brand-metadata";
import { useAuth } from "@/hooks/use-auth";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { generateAfricanHreflang, DEFAULT_SUPPORTED_LANGUAGES } from "@/lib/hreflang";

const faqQuestions = [
  {
    name: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee if you are not satisfied with the platform. Contact us within 14 days of your first paid charge and we will review your request fairly."
  },
  {
    name: "Can I upgrade or downgrade my plan?",
    answer: "Absolutely. You can change your plan at any time. Prorated charges will be applied automatically to your next billing cycle."
  },
  {
    name: "What counts as a page audit?",
    answer: "One audit counts every time SEOaxe reviews a live URL and generates a score, findings, and guided recommendations. Each unique URL audit counts toward your monthly limit."
  },
  {
    name: "Is there a free plan available?",
    answer: "Yes, SEOaxe offers a free plan that includes 1 live page audit per month with basic technical SEO checks. It's perfect for getting started with SEO optimization."
  },
  {
    name: "Which plan is best for agencies?",
    answer: "The Agency plan is designed specifically for agencies and includes unlimited live page audits, multi-page crawling, white-label proof, and team collaboration features."
  },
  {
    name: "Does SEOaxe work for South African websites?",
    answer: "Yes, SEOaxe is optimized for South African websites with support for local SEO, African hreflang tags, and region-specific SEO best practices."
  }
];

function buildProductSchema() {
  const activeCurrency = "USD";
  const prices = { free: 0, starter: 3, professional: 37, agency: 92 };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": BRAND_NAME,
    "image": `${SITE_URL}/android-chrome-512x512.png`,
    "url": `${SITE_URL}/pricing`,
    "description": "SEOaxe - The all-in-one SEO and AEO optimization platform for live page audits, schema markup generation, Answer Engine Optimization, and technical SEO fixes. Free, Starter, Professional, and Agency plans available.",
    "brand": {
      "@type": "Brand",
      "name": BRAND_NAME,
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "128",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Sarah J."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "SEOaxe transformed our website's visibility. The AEO improvements are a game changer for South African businesses."
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Michael K."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "The live page audits and schema generator saved us hours of work. Our SEO health score improved from 42 to 89 in just 6 weeks."
      }
    ],
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": prices.free.toFixed(2),
        "priceCurrency": activeCurrency,
        "description": "1 live page audit per month with basic technical SEO checks",
        "availability": "https://schema.org/InStock",
        "category": "Software",
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "ZA",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      },
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": prices.starter.toFixed(2),
        "priceCurrency": activeCurrency,
        "priceValidUntil": "2026-12-31",
        "description": "3 live page audits per month with basic checks and audit receipts",
        "availability": "https://schema.org/InStock",
        "category": "Software",
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "ZA",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      },
      {
        "@type": "Offer",
        "name": "Professional Plan",
        "price": prices.professional.toFixed(2),
        "priceCurrency": activeCurrency,
        "priceValidUntil": "2026-12-31",
        "description": "50 live page audits per month with AEO answer blocks and copyable snippets",
        "availability": "https://schema.org/InStock",
        "category": "Software",
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "ZA",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      },
      {
        "@type": "Offer",
        "name": "Agency Plan",
        "price": prices.agency.toFixed(2),
        "priceCurrency": activeCurrency,
        "priceValidUntil": "2026-12-31",
        "description": "Unlimited live page audits, multi-page crawling, and white-label proof",
        "availability": "https://schema.org/InStock",
        "category": "Software",
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "ZA",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 14,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      }
    ]
  };
}

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqQuestions.map(q => ({
      "@type": "Question",
      "name": q.name,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
}

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  const plans = useMemo(
    () =>
      PLAN_DEFINITIONS.map((plan) => ({
        ...plan,
        price: `$${plan.amountUsd}${plan.period === "forever" ? "" : "/month"}`,
        href:
          isAuthenticated
              ? `/checkout?plan=${plan.slug}`
              : `/login?redirect=${encodeURIComponent(`/checkout?plan=${plan.slug}`)}`,
      })),
    [isAuthenticated],
  );
  const productSchema = useMemo(() => buildProductSchema(), []);
  const faqSchema = useMemo(() => buildFaqSchema(), []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>SEOaxe Pricing | SEO & AEO Optimization Plans 2026</title>
        <meta name="description" content="SEOaxe pricing plans for 2026: Free, Starter, Professional, and Agency options for live page audits, schema markup, AEO optimization, technical SEO fixes, and South African website optimization." />
        <meta name="keywords" content="SEO pricing, AEO optimization cost, schema markup tool price, technical SEO audit, South African SEO tools, SEOaxe plans" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/pricing`} />
        {generateAfricanHreflang(`${SITE_URL}/pricing`, DEFAULT_SUPPORTED_LANGUAGES).map((tag, idx) => (
          <link key={idx} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
        ))}
        <meta property="og:title" content="SEOaxe Pricing | SEO & AEO Optimization Plans 2026" />
        <meta property="og:description" content="SEOaxe pricing plans for 2026: Free, Starter, Professional, and Agency options for live page audits, schema markup, AEO optimization, technical SEO fixes, and South African website optimization." />
        <meta property="og:url" content={`${SITE_URL}/pricing`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/opengraph.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:title" content="SEOaxe Pricing | SEO & AEO Optimization Plans 2026" />
        <meta property="twitter:description" content="SEOaxe pricing plans for 2026: Free, Starter, Professional, and Agency options for live page audits, schema markup, AEO optimization, technical SEO fixes, and South African website optimization." />
        <meta property="twitter:url" content={`${SITE_URL}/pricing`} />
        <meta property="twitter:image" content={`${SITE_URL}/opengraph.jpg`} />
      </Helmet>
      <Navbar />
      <script
        id="pricing-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        id="pricing-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">SEOaxe Pricing Plans 2026</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Affordable SEO and AEO optimization for South African businesses. Choose from Free, Starter, Professional, or Agency plans for live page audits, schema markup, Answer Engine Optimization, and technical SEO fixes.
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
                    <span className="text-muted-foreground">{plan.period === "forever" ? `/${plan.period}` : ` per ${plan.period}`}</span>
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
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8 max-w-3xl mx-auto rounded-2xl border bg-muted/20 px-6 py-5 text-sm text-muted-foreground">
            <p>
              Paid plans come with a customer-friendly first-charge refund window. If your first paid month is not the right fit, contact us within 14 days and we will review it fairly.
              {" "}
              <Link href="/refund-policy" className="font-medium text-primary hover:underline">
                Read the refund policy
              </Link>
              .
            </p>
          </div>

          {/* Killer Positioning Comparison */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Why SEOaxe is different</h2>
              <p className="text-muted-foreground">Most SEO tools advise or draft. SEOaxe audits live pages and shows proof.</p>
            </div>
            
            <div className="bg-card border rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left py-4 px-6 font-semibold">Job to be done</th>
                    <th className="text-center py-4 px-4 font-bold text-primary bg-primary/5 w-1/3">SEOaxe</th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground w-1/3">AI Content Tools</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/20">
                    <td className="py-4 px-6 font-medium">Audits existing live pages</td>
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
                    <td className="py-4 px-6 font-medium">Prioritizes technical SEO fixes</td>
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
                    <td className="py-4 px-6 font-medium">Adds AEO schema and answer blocks</td>
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
                    <td className="py-4 px-6 font-medium">Shows a before/after audit receipt</td>
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
                    <td className="py-4 px-6 font-medium">Uses competitors to find page gaps</td>
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
                    <td className="py-4 px-6 font-medium">Packages proof for agencies</td>
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
                AI content tools create more drafts. SEOaxe audits the pages that already exist: technical SEO, AEO schema, localized tags, content gaps, and before/after proof in one workflow.
              </p>
            </div>
          </div>

          {/* SEO Benefits Section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Why Choose SEOaxe for Your SEO Needs?</h2>
              <p className="text-muted-foreground">Comprehensive SEO and AEO optimization designed for results</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-primary">Technical SEO Excellence</h3>
                <p className="text-muted-foreground">Fix meta tags, heading structure, canonical issues, and page speed problems with our automated audit system.</p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-primary">Answer Engine Optimization</h3>
                <p className="text-muted-foreground">Get your content cited in Google AI Overviews, ChatGPT, and Perplexity with AEO-optimized content structures.</p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-primary">Schema Markup Generation</h3>
                <p className="text-muted-foreground">Automatically generate valid JSON-LD schema for FAQPage, Article, Product, and LocalBusiness types.</p>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-primary">South African Focused</h3>
                <p className="text-muted-foreground">Optimized for local SEO, African languages, and South African business requirements.</p>
              </div>
            </div>
          </div>

          <div className="mt-32 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqQuestions.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-lg mb-2">{faq.name}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
