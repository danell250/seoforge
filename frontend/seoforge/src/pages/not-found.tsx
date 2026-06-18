import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/brand-metadata";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Helmet>
        <title>404 — Page Not Found | SEOaxe</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to SEOaxe's homepage to audit live website pages and optimize your SEO." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="404 — Page Not Found | SEOaxe" />
        <meta property="og:description" content="The page you're looking for doesn't exist. Return to SEOaxe's homepage to audit live website pages and optimize your SEO." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/opengraph.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:title" content="404 — Page Not Found | SEOaxe" />
        <meta property="twitter:description" content="The page you're looking for doesn't exist. Return to SEOaxe's homepage to audit live website pages and optimize your SEO." />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:image" content={`${SITE_URL}/opengraph.png`} />
      </Helmet>
      <Navbar />
      <main className="flex-1 w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600 mb-6">
              The page you're looking for doesn't exist. Return to the homepage to start optimizing your website.
            </p>

            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
