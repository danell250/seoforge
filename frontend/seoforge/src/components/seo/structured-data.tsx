// JSON-LD Structured Data Components for SEO

export function OrganizationSchema() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SEOaxe",
    "url": "https://seoforge.app",
    "logo": "https://seoforge.app/android-chrome-512x512.png",
    "description": "AI-powered SEO and Answer Engine Optimization platform for South African businesses. Automate meta tags, schema markup, AEO answer blocks, and sitemaps.",
    "sameAs": [
      "https://twitter.com/seoforge",
      "https://linkedin.com/company/seoforge"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@seoforge.app",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ZA"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  );
}

export function WebsiteSchema() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SEOaxe",
    "url": "https://seoforge.app",
    "description": "AI-powered SEO and AEO optimization platform",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://seoforge.app/app?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  );
}

export function FAQPageSchema() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is SEOaxe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SEOaxe is an AI-powered SEO and Answer Engine Optimization (AEO) platform designed for South African businesses. It automates the process of optimizing HTML pages for search engines and AI answer engines like Google AI Overviews, Perplexity, and ChatGPT search. Simply paste your HTML code and receive fully optimized code with meta tags, schema markup, AEO answer blocks, health scores, and sitemaps in seconds."
        }
      },
      {
        "@type": "Question",
        "name": "How does AI SEO optimization work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SEOaxe uses advanced AI to analyze your HTML code and identify optimization opportunities. The platform automatically generates optimized meta titles and descriptions, creates JSON-LD structured data schema, adds AEO (Answer Engine Optimization) answer blocks for featured snippets, generates XML sitemaps and robots.txt files, and provides an SEO health score. All optimizations follow best practices for both traditional search engines and AI answer engines."
        }
      },
      {
        "@type": "Question",
        "name": "Is SEOaxe free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SEOaxe is free to start with no credit card required. You can begin optimizing your pages immediately. We also offer premium plans with additional features like bulk optimization, competitor analysis, site monitoring, and CMS deployment to WordPress and Shopify for agencies and larger businesses."
        }
      },
      {
        "@type": "Question",
        "name": "Does SEOaxe support South African websites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! SEOaxe is specifically designed with South African businesses in mind. The platform supports multilingual schema markup for South Africa's 11 official languages, understands local SEO requirements, and provides hreflang tag generation for businesses targeting multiple language markets within South Africa and across Africa. Our AI is trained to recognize and optimize for South African search patterns and user intent."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SEOaxe",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "ZAR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    },
    "featureList": [
      "AI-powered HTML optimization",
      "Meta tag generation",
      "Schema markup automation",
      "AEO answer block creation",
      "XML sitemap generation",
      "Robots.txt creation",
      "SEO health scoring",
      "Competitor analysis",
      "Site crawling",
      "Content gap detection"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
    />
  );
}

export function LocalBusinessSchema() {
  const localData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "SEOaxe",
    "description": "AI-powered SEO and AEO optimization services for South African businesses",
    "url": "https://seoforge.app",
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    },
    "serviceType": [
      "SEO Optimization",
      "Answer Engine Optimization",
      "Technical SEO Audits",
      "Schema Markup Implementation",
      "Content Optimization"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localData) }}
    />
  );
}
