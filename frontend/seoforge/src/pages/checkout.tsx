import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, CreditCard, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { SUPPORT_EMAIL } from "@/lib/brand-metadata";
import { getPlanDefinition, PLAN_DEFINITIONS, type PlanSlug } from "@/lib/plans";
import { detectPricingLocale, formatLocalPrice } from "@/lib/local-pricing";

const CHECKOUT_LINKS: Partial<Record<Exclude<PlanSlug, "free">, string | undefined>> = {
  starter: import.meta.env.VITE_STARTER_CHECKOUT_URL,
  agency: import.meta.env.VITE_AGENCY_CHECKOUT_URL,
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

  const checkoutLink =
    selectedPlan?.slug && selectedPlan.slug !== "free"
      ? CHECKOUT_LINKS[selectedPlan.slug]
      : undefined;

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
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Activate ${selectedPlan.name} plan`)}&body=${encodeURIComponent(
    `Hi,\n\nI want to activate the ${selectedPlan.name} plan for ${user?.email ?? "my account"}.\n\nPlease send me the billing link or next steps.\n`,
  )}`;

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
                    ? "Create your account and jump into the workspace right away."
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
                      Your account is signed in. Open the workspace and start optimizing pages.
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
              ) : checkoutLink ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment ready
                    </CardTitle>
                    <CardDescription>
                      Your account is linked. Continue to secure checkout to finish your subscription.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <a href={checkoutLink}>
                        Continue to payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Mail className="h-5 w-5 text-primary" />
                      Billing link not configured yet
                    </CardTitle>
                    <CardDescription>
                      The routing is fixed, but this environment still needs a live payment link for the {selectedPlan.name} plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>. Once a checkout link is configured, this page will send you straight to payment.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <a href={mailtoHref}>Email billing support</a>
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
                "Complete payment through the secure checkout link for that plan.",
                "Come back to the workspace with the right limits and features unlocked.",
              ].map((step, index) => (
                <div key={step} className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            {!checkoutLink && selectedPlan.slug !== "free" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Right now this deployment is missing the actual payment link for paid plans, so the final checkout handoff still needs configuration.
              </p>
            )}
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
