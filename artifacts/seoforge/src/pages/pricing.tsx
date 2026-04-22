import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
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
                    <Link href="/login">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
