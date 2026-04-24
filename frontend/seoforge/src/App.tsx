import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Pricing from "@/pages/pricing";
import Login from "@/pages/login";
import AppWorkspace from "@/pages/app";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import PrivacyPolicy from "@/pages/privacy";
import TermsOfService from "@/pages/terms";
import Contact from "@/pages/contact";
import Blog from "@/pages/blog";
import Compare from "@/pages/compare";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { GlobalSEO } from "@/components/seo";
import { ScrollToTop } from "@/components/scroll-to-top";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = encodeURIComponent(redirectTo || "/app");
      navigate(`/login?redirect=${next}`);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/login" component={Login} />
        <Route path="/blog" component={Blog} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/contact" component={Contact} />
        <Route path="/compare" component={Compare} />
        <Route path="/app" component={() => <ProtectedRoute component={AppWorkspace} />} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <GlobalSEO />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
