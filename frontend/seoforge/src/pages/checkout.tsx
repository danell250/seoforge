import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { ApiError, customFetch } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getPlanDefinition, PLAN_DEFINITIONS } from "@/lib/plans";
import { detectPricingLocale, formatLocalPrice } from "@/lib/local-pricing";

type StitchCheckoutResponse = {
  paymentId: string;
  paymentUrl: string;
};

function buildAuthRedirect(path: string) {
  return encodeURIComponent(path);
}

function getPaymentErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data;
    if (data && typeof data === "object" && typeof (data as Record<string, unknown>).message === "string") {
      return (data as Record<string, string>).message;
    }
    return error.message;
  }

  return "Could not start secure payment. Please try again.";
}

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const planParam = params.get("plan");
  const returnedFromPayment = params.get("payment") === "return";
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

  async function startPayment() {
    const planSlug = selectedPlan?.slug;
    if (!planSlug || planSlug === "free") return;

    setIsStartingPayment(true);
    setPaymentError(null);
    try {
      const response = await customFetch<StitchCheckoutResponse>("/api/payments/stitch/checkout", {
        method: "POST",
        responseType: "json",
        body: JSON.stringify({ plan: planSlug }),
      });
      window.location.assign(response.paymentUrl);
    } catch (error) {
      setPaymentError(getPaymentErrorMessage(error));
      setIsStartingPayment(false);
    }
  }

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
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Secure Stitch payment
                    </CardTitle>
                    <CardDescription>
                      Your account is linked. We&apos;ll create a secure Stitch checkout for your plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>
                    </div>
                    {returnedFromPayment && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                        Thanks. If payment completed successfully, your plan will unlock as soon as Stitch sends the paid webhook.
                      </div>
                    )}
                    {paymentError && (
                      <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {paymentError}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full sm:w-auto" onClick={startPayment} disabled={isStartingPayment || alreadyOnPlan}>
                      {isStartingPayment ? "Starting payment..." : "Continue to payment"}
                      <ArrowRight className="ml-2 h-4 w-4" />
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
                "Complete payment through the secure Stitch checkout for that plan.",
                "Stitch confirms the paid webhook and unlocks the right limits on your account.",
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
