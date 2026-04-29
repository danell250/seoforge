import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { BRAND_NAME, PRODUCT_DESCRIPTION } from "@/lib/brand-metadata";
import { useAuth } from "@/hooks/use-auth";
import {
  detectPricingLocale,
  formatLocalPrice,
  type PricingLocale,
} from "@/lib/local-pricing";
import { PLAN_DEFINITIONS } from "@/lib/plans";

interface PricingContextResponse {
  currency: PricingLocale["currency"];
  locale: string;
  region: string | null;
  plans: {
    free: number;
    starter: number;
    agency: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function buildProductSchema(pricingContext: PricingContextResponse | null) {
  const activeCurrency = pricingContext?.currency ?? "ZAR";
  const prices = pricingContext?.plans ?? { free: 0, starter: 299, agency: 999 };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": BRAND_NAME,
    "description": PRODUCT_DESCRIPTION,
    "brand": {
      "@type": "Brand",
      "name": BRAND_NAME,
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": prices.free.toFixed(2),
        "priceCurrency": activeCurrency,
        "description": "3 page repairs per month with basic checks and repair receipts",
        "availability": "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": prices.starter.toFixed(2),
        "priceCurrency": activeCurrency,
        "priceValidUntil": "2026-12-31",
        "description": "20 page repairs per month with AEO answer blocks and deployable HTML",
        "availability": "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        "name": "Agency Plan",
        "price": prices.agency.toFixed(2),
        "priceCurrency": activeCurrency,
        "priceValidUntil": "2026-12-31",
        "description": "Unlimited page repairs, bulk ZIP processing, and white-label proof",
        "availability": "https://schema.org/InStock",
      },
    ],
  };
}

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [pricingLocale] = useState(() => detectPricingLocale());
  const [pricingContext, setPricingContext] = useState<PricingContextResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`${API_BASE_URL}/pricing-context?locale=${encodeURIComponent(pricingLocale.locale)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Pricing context request failed with ${response.status}`);
        }
        return response.json() as Promise<PricingContextResponse>;
      })
      .then((data) => setPricingContext(data))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setPricingContext(null);
      });

    return () => controller.abort();
  }, [pricingLocale.locale]);

  const displayLocale = pricingContext
    ? { currency: pricingContext.currency, locale: pricingContext.locale, region: pricingContext.region }
    : pricingLocale;

  const plans = useMemo(
    () =>
      PLAN_DEFINITIONS.map((plan) => ({
        ...plan,
        price: formatLocalPrice(
          pricingContext?.plans[plan.slug] ?? plan.amountZar,
          displayLocale,
        ),
        href:
          plan.slug === "free"
            ? isAuthenticated
              ? "/app"
              : "/signup?redirect=%2Fapp"
            : `/checkout?plan=${plan.slug}`,
      })),
    [displayLocale, isAuthenticated, pricingContext],
  );
  const productSchema = useMemo(
    () => buildProductSchema(pricingContext),
    [pricingContext],
  );

  useEffect(() => {
    // Update title and meta
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    document.title = "SEOaxe Pricing - SEO repair plans for live websites";
    metaDesc.setAttribute('content', 'SEOaxe pricing: Free, Starter, and Agency plans for teams that want deployable SEO repairs, schema markup, AEO improvements, repair receipts, and health scoring in one workflow.');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <script
        id="pricing-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Repair live pages without agency pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with the website you already have. Prices are shown in your local currency based on your browser locale.
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
              <p className="text-muted-foreground">Most SEO tools advise or draft. SEOaxe patches existing pages and shows proof.</p>
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
                    <td className="py-4 px-6 font-medium">Repairs existing HTML pages</td>
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
                    <td className="py-4 px-6 font-medium">Applies technical SEO patches</td>
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
                    <td className="py-4 px-6 font-medium">Shows a before/after repair receipt</td>
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
                AI content tools create more drafts. SEOaxe repairs the pages that already exist - technical SEO, AEO schema, localized tags, deployable HTML, and before/after proof in one workflow.
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
                <h3 className="font-semibold text-lg mb-2">What counts as a page repair?</h3>
                <p className="text-muted-foreground">One repair counts every time you submit HTML through the Single Page Optimizer or process a file in the ZIP bulk uploader.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
