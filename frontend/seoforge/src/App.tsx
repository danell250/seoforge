import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Pricing from "@/pages/pricing";
import Checkout from "@/pages/checkout";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import AppWorkspace from "@/pages/app";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import PrivacyPolicy from "@/pages/privacy";
import RefundPolicy from "@/pages/refund-policy";
import TermsOfService from "@/pages/terms";
import Contact from "@/pages/contact";
import Blog from "@/pages/blog";
import Compare from "@/pages/compare";
import Audit from "@/pages/audit";
import Intent from "@/pages/intent";
import {
  AeoOptimizerPage,
  AnswerEngineOptimizationPage,
  HtmlSeoOptimizerPage,
  LocalSeoSouthAfricaPage,
  RobotsTxtGeneratorPage,
  SchemaMarkupGeneratorPage,
  SeoHealthScorePage,
  SeoRepairEnginePage,
  ShopifySeoRepairPage,
  SitemapGeneratorLandingPage,
  TechnicalSeoAuditPage,
  WordpressSeoRepairPage,
} from "@/pages/seo-library";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { GlobalSEO } from "@/components/seo";
import { ScrollToTop } from "@/components/scroll-to-top";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

const PAYPAL_OPTIONS = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
  "disable-funding": "credit,card",
};

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

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
        <Route path="/checkout" component={() => <ProtectedRoute component={Checkout} />} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/blog/:slug" component={Blog} />
        <Route path="/blog" component={Blog} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/refund-policy" component={RefundPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/contact" component={Contact} />
        <Route path="/compare" component={Compare} />
        <Route path="/seo-repair-engine" component={SeoRepairEnginePage} />
        <Route path="/html-seo-optimizer" component={HtmlSeoOptimizerPage} />
        <Route path="/aeo-optimizer" component={AeoOptimizerPage} />
        <Route path="/answer-engine-optimization" component={AnswerEngineOptimizationPage} />
        <Route path="/schema-markup-generator" component={SchemaMarkupGeneratorPage} />
        <Route path="/technical-seo-audit" component={TechnicalSeoAuditPage} />
        <Route path="/sitemap-generator" component={SitemapGeneratorLandingPage} />
        <Route path="/robots-txt-generator" component={RobotsTxtGeneratorPage} />
        <Route path="/wordpress-seo-repair" component={WordpressSeoRepairPage} />
        <Route path="/shopify-seo-repair" component={ShopifySeoRepairPage} />
        <Route path="/local-seo-south-africa" component={LocalSeoSouthAfricaPage} />
        <Route path="/seo-health-score" component={SeoHealthScorePage} />
        <Route path="/audit" component={() => <ProtectedRoute component={Audit} />} />
        <Route path="/intent" component={() => <ProtectedRoute component={Intent} />} />
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {paypalClientId ? (
            <PayPalScriptProvider options={PAYPAL_OPTIONS}>
              <TooltipProvider>
                <GlobalSEO />
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
                <Analytics />
                <SpeedInsights />
              </TooltipProvider>
            </PayPalScriptProvider>
          ) : (
            <TooltipProvider>
              <GlobalSEO />
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </TooltipProvider>
          )}
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
