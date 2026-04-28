import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { AlertCircle, LoaderCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { login, isAuthenticated, isLoading, isLoginPending, errorMessage } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const redirect =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null;
  const isReturningToCheckout = redirect?.startsWith("/checkout") ?? false;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      const next = redirect && redirect.startsWith("/") ? redirect : "/app";
      navigate(next);
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    try {
      const response = await login({ email, password });
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      const next = redirect && redirect.startsWith("/") ? redirect : "/app";
      if (response.authenticated) {
        navigate(next);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              {isReturningToCheckout
                ? "Sign in to continue to your selected plan."
                : "Login to access your SEOaxe workspace."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(submitError || errorMessage) && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm flex gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{submitError || errorMessage}</span>
              </div>
            )}

            <div className="bg-primary/10 text-primary p-4 rounded-md text-sm">
              <div className="flex items-center gap-2 font-medium mb-2">
                <ShieldCheck className="h-4 w-4" />
                Existing account
              </div>
              <div>
                {isReturningToCheckout ? (
                  <>
                    Sign in with your account and we&apos;ll send you back to checkout.
                  </>
                ) : (
                  <>
                    Sign in with your account, or <Link href="/signup" className="underline underline-offset-4">create a new one</Link> if you&apos;re new here.
                  </>
                )}
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@agency.co.za"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button className="w-full" type="submit" disabled={isLoginPending}>
                {isLoginPending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
                className="text-primary hover:underline"
              >
                Create account
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Need access details? <Link href="/pricing" className="text-primary hover:underline">View plans</Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
