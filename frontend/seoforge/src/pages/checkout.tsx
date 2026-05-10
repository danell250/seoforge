import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, CreditCard, LockKeyhole, ShieldCheck, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getPlanDefinition, PLAN_DEFINITIONS } from "@/lib/plans";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

function buildAuthRedirect(path: string) {
  return encodeURIComponent(path);
}

export default function Checkout() {
  const { isAuthenticated, user, refreshSession } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [{ isResolved, isRejected, isPending }] = usePayPalScriptReducer();
  
  // Debug PayPal script status
  useEffect(() => {

  }, [isResolved, isRejected, isPending]);
  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const planParam = params.get("plan");
  const selectedPlan = getPlanDefinition(planParam) ?? getPlanDefinition("starter");

  const currentPath = useMemo(() => {
    if (typeof window === "undefined") return location;
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }, [location]);

  const createPayPalOrder = async () => {

    try {
      const response = await customFetch<{ id: string }>("/api/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan?.slug }),
      });
      


      if (!response || !response.id) {
        throw new Error("Invalid response from PayPal order creation");
      }


      return response.id;
    } catch (err) {
      console.error("PayPal create order failed:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      const errorMessage = err instanceof Error ? err.message : "Could not initialize PayPal payment.";
      toast({
        title: "Payment setup failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const onPayPalApprove = async (data: { orderID: string }) => {

    setIsProcessing(true);
    try {
      const captureResponse = await customFetch("/api/payments/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      
      await refreshSession();
      
      toast({
        title: "Success!",
        description: `Your ${selectedPlan?.name} plan is now active.`,
      });
      
      navigate("/app");
    } catch (err) {
      console.error("PayPal capture failed:", err);
      toast({
        title: "Payment capture failed",
        description: "Your payment was successful but we couldn't activate your plan. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const priceLabel = selectedPlan
    ? `$${selectedPlan.amountUsd}${selectedPlan.period === "forever" ? "" : "/month"}`
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
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";
  const isPaypalConfigured = paypalClientId.length > 0;

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
                  {`Complete your ${selectedPlan.name} plan`}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {"We use your account to attach the subscription to the right workspace, then send you to payment."}
                </p>
              </div>

              {!isAuthenticated ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <LockKeyhole className="h-5 w-5 text-primary" />
                      Sign in to complete your purchase
                    </CardTitle>
                    <CardDescription>
                      Your plan will be attached to your account after payment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      You'll return here automatically after signing in.
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
                      Free plan selected
                    </CardTitle>
                    <CardDescription>
                      Start optimizing your pages with the free plan. Upgrade anytime.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-3">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/app">
                        Open workspace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : alreadyOnPlan ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Check className="h-5 w-5 text-green-600" />
                      Already on this plan
                    </CardTitle>
                    <CardDescription>
                      Your account already has the {selectedPlan.name} plan active.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <Link href="/app">
                        Go to workspace
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
                      Secure PayPal payment
                    </CardTitle>
                    <CardDescription>
                      Complete payment via PayPal. Your plan activates automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user?.email}</span>
                    </div>
                    
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Setting up payment...</p>
                      </div>
                    ) : !isPaypalConfigured ? (
                      <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-center">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">PayPal not configured</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Please set VITE_PAYPAL_CLIENT_ID environment variable.</p>
                      </div>
                    ) : !isResolved ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Loading PayPal...</p>
                      </div>
                    ) : isRejected ? (
                      <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-center">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">PayPal failed to load</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Please refresh the page and try again.</p>
                      </div>
                    ) : (
                      <div className="py-2 space-y-4">
                        {usdPrice && (
                          <div className="rounded-lg bg-muted/30 p-3 text-center border border-dashed border-primary/20">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">PayPal Amount</p>
                            <p className="text-lg font-bold text-primary">${usdPrice.toFixed(2)} USD</p>
                          </div>
                        )}
                        <PayPalButtons
                          key={`paypal-buttons-${selectedPlan?.slug}-${user?.id}`}
                          style={{ layout: "vertical", label: "pay" }}
                          createOrder={createPayPalOrder}
                          onApprove={onPayPalApprove}
                          onError={(err) => {
                            console.error("PayPal button error:", err);
                            console.error("PayPal full error details:", JSON.stringify(err, null, 2));
                            
                            // Check if it's an environment mismatch
                            const clientIdStart = paypalClientId?.substring(0, 2) || 'undefined';
                            const isSandboxId = clientIdStart === 'AZ';
                            const isProd = import.meta.env.PROD;
                            

                            
                            let errorMessage = "Something went wrong. Please try again.";
                            if (isProd && isSandboxId) {
                              errorMessage = "PayPal configuration error: Using sandbox credentials in production.";
                            } else if (!isProd && !isSandboxId && clientIdStart !== 'undefined') {
                              errorMessage = "PayPal configuration error: Using production credentials in development.";
                            } else if (!paypalClientId) {
                              errorMessage = "PayPal not configured: VITE_PAYPAL_CLIENT_ID environment variable is missing.";
                            }
                            
                            toast({
                              title: "Payment error",
                              description: errorMessage,
                              variant: "destructive",
                            });
                          }}
                          onCancel={(data) => {

                            toast({
                              title: "Payment cancelled",
                              description: "You cancelled the PayPal payment.",
                              variant: "default",
                            });
                          }}
                          onClick={(data, actions) => {

                            return actions.resolve();
                          }}
                        />
                      </div>
                    )}

                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                      Your {selectedPlan?.name} plan activates immediately after payment.
                    </div>
                  </CardContent>
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
                "Your plan activates automatically after successful payment.",
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