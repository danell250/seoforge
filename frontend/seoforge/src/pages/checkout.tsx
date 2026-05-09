import { useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getPlanDefinition, PLAN_DEFINITIONS } from "@/lib/plans";
import { detectPricingLocale, formatLocalPrice } from "@/lib/local-pricing";

declare global {
  interface Window {
    paypal: any;
  }
}

const PAYPAL_CLIENT_ID = "AXxjiGRRXzL0lhWXhz9lUCYnIXg0Sfz-9-kDB7HbdwYPOrlspRzyS6TQWAlwRC2GlYSd4lze25jluDLj";

const PLAN_PRICES_USD: Record<string, number> = {
  starter: 4.99,
  agency: 9.99,
};

function buildAuthRedirect(path: string) {
  return encodeURIComponent(path);
}

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const planParam = params.get("plan");
  const selectedPlan = getPlanDefinition(planParam) ?? getPlanDefinition("starter");
  const pricingLocale = detectPricingLocale();

  const currentPath = useMemo(() => {
    if (typeof window === "undefined") return location;
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }, [location]);

  const priceLabel = selectedPlan
    ? formatLocalPrice(selectedPlan.amountZar, pricingLocale)
    : null;

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Choose a plan</CardTitle>
              <CardDescription>We could not tell which plan you wanted.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const alreadyOnPlan = user?.plan === selectedPlan.slug;
  const signupHref = `/signup?redirect=${buildAuthRedirect(currentPath)}`;
  const loginHref = `/login?redirect=${buildAuthRedirect(currentPath)}`;
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const planPrice = selectedPlan.slug ? PLAN_PRICES_USD[selectedPlan.slug] : null;

  // Load PayPal SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // PayPal SDK loaded
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render PayPal button
  useEffect(() => {
    if (!paypalContainerRef.current || !planPrice || !window.paypal) return;

    paypalContainerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "pill",
          label: "paypal",
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: `SEOaxe ${selectedPlan.name} Plan`,
                amount: {
                  currency_code: "USD",
                  value: planPrice.toFixed(2),
                },
              },
            ],
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            alert(`Payment completed by ${details.payer.name.given_name}! Email your transaction ID to danelloosthuizen3@gmail.com to activate your plan.`);
          });
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          alert("Payment error. Please try again.");
        },
      })
      .render(paypalContainerRef.current);
  }, [planPrice, selectedPlan.name]);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1 px-4 py-12">
        <div className="container max-w-5xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-primary">Checkout</p>
                <h1 className="text-3xl font-bold tracking-tight">
                  {selectedPlan.slug === "free" ? "Start your workspace" : `Complete your ${selectedPlan.name} plan`}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {selectedPlan.slug === "free"
                    ? "Create your account and repair your first page right away."
                    : "We use your account to attach the subscription to the right workspace, then send you to payment."}
                </p>
              </div>

              {!isAuthenticated ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <LockKeyhole className="h-5 w-5 text-primary" />
                      Sign in before payment
                    </CardTitle>
                    <CardDescription>
                      We need your account first so your plan lands in the right workspace after checkout.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      You&apos;ll return here automatically after you sign in or create your account.
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="flex-1">
                        <Link href={signupHref}>Create account</Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={loginHref}>Sign in</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : selectedPlan.slug === "free" ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      You&apos;re ready to go
                    </CardTitle>
                    <CardDescription>
                      Your account is signed in. Open the workspace and start repairing pages.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/app">
                        Open workspace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : planPrice ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Secure PayPal payment
                    </CardTitle>
                    <CardDescription>
                      Your account is linked. Complete payment via PayPal for your plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                      After payment, email danelloosthuizen3@gmail.com with your transaction ID to activate your plan.
                    </div>
                    <div ref={paypalContainerRef} id="paypal-button-container" />
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full sm:w-auto" disabled={alreadyOnPlan}>
                      Pay with PayPal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Free plan
                    </CardTitle>
                    <CardDescription>
                      You can start with the free plan and upgrade later.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/app">
                        Open workspace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </section>

            <aside>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{selectedPlan.name}</CardTitle>
                  <CardDescription>{selectedPlan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold">{priceLabel}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPlan.period === "forever" ? "forever" : `per ${selectedPlan.period}`}
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {selectedPlan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {alreadyOnPlan && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                      This account is already on the {selectedPlan.name} plan.
                    </div>
                  )}

                  <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    Need a different plan?{" "}
                    <Link href="/pricing" className="font-medium text-primary hover:underline">
                      Compare plans
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          <div className="mt-10 rounded-2xl border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">What happens next</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                "Pick your plan and confirm the account it should belong to.",
                "Complete payment via PayPal for your chosen plan.",
                "Email your transaction ID to danelloosthuizen3@gmail.com to activate your plan.",
              ].map((step, index) => (
                <div key={step} className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {PLAN_DEFINITIONS.map((plan) => (
              <Button key={plan.slug} variant={plan.slug === selectedPlan.slug ? "default" : "outline"} asChild>
                <Link href={plan.slug === "free" ? "/checkout?plan=free" : `/checkout?plan=${plan.slug}`}>
                  {plan.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
