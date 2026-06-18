import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet-async";
import { generateAfricanHreflang, DEFAULT_SUPPORTED_LANGUAGES } from "@/lib/hreflang";
import { SITE_URL, BRAND_NAME } from "@/lib/brand-metadata";

export default function MediaKit() {
  const images = [
    {
      src: "/seoaxe_logo_hd.png",
      alt: "SEOaxe Official Logo",
    },
    {
      src: "/Image 2026-05-11 at 10.13.jpeg",
      alt: "SEOaxe Dashboard Preview",
    },
    {
      src: "/Image 2026-05-10 at 11.42.jpeg",
      alt: "SEOaxe SEO Health Score",
    },
    {
      src: "/Image 2026-05-09 at 13.38.jpeg",
      alt: "SEOaxe Audit Results",
    },
    {
      src: "/Image 2026-05-09 at 12.21.jpeg",
      alt: "SEOaxe Features Overview",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{BRAND_NAME} Media Kit — Logos, Screenshots, and Brand Assets</title>
        <meta name="description" content="Download the official SEOaxe media kit including logos, screenshots, and brand assets for press, partners, and affiliates." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/media-kit`} />
        {generateAfricanHreflang(`${SITE_URL}/media-kit`, DEFAULT_SUPPORTED_LANGUAGES).map((tag, idx) => (
          <link key={idx} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
        ))}
        <meta property="og:title" content={`${BRAND_NAME} Media Kit — Logos, Screenshots, and Brand Assets`} />
        <meta property="og:description" content="Download the official SEOaxe media kit including logos, screenshots, and brand assets for press, partners, and affiliates." />
        <meta property="og:url" content={`${SITE_URL}/media-kit`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/opengraph.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:title" content={`${BRAND_NAME} Media Kit — Logos, Screenshots, and Brand Assets`} />
        <meta property="twitter:description" content="Download the official SEOaxe media kit including logos, screenshots, and brand assets for press, partners, and affiliates." />
        <meta property="twitter:url" content={`${SITE_URL}/media-kit`} />
        <meta property="twitter:image" content={`${SITE_URL}/opengraph.png`} />
      </Helmet>
      <Navbar />

      <main className="flex-1 bg-background py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{BRAND_NAME} Media Kit</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Official brand assets, screenshots, and logos for press, partners, and affiliates.
            </p>
          </div>

          <div className="grid gap-8 mb-12">
            <section>
              <h2 className="text-2xl font-semibold mb-6">Product Screenshots</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {images.map((image, index) => (
                  <div key={index} className="bg-card border rounded-xl overflow-hidden">
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">{image.alt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-card border rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Brand Guidelines</h2>
              <div className="space-y-4 text-muted-foreground">
                <p><strong>Brand Name:</strong> {BRAND_NAME}</p>
                <p><strong>Primary Color:</strong> #378ADD (Blue)</p>
                <p><strong>Website:</strong> {SITE_URL}</p>
                <p><strong>Description:</strong> Live SEO audit engine that scores existing website pages and produces reviewable SEO, AEO, schema, sitemap, and content recommendations.</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
