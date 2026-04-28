import {
  BRAND_NAME,
  GLOBAL_SUPPORT_ANSWER,
  PRODUCT_AUTOMATION_DESCRIPTION,
  PRODUCT_DESCRIPTION,
  SITE_URL,
  SUPPORT_EMAIL,
} from "@/lib/brand-metadata";
import { detectPricingLocale } from "@/lib/local-pricing";

// JSON-LD Structured Data Components for SEO

export function OrganizationSchema() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BRAND_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/android-chrome-512x512.png`,
    "description": PRODUCT_AUTOMATION_DESCRIPTION,
    "sameAs": [
      "https://twitter.com/seoforge",
      "https://linkedin.com/company/seoforge"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": SUPPORT_EMAIL,
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
    "name": BRAND_NAME,
    "url": SITE_URL,
    "description": PRODUCT_DESCRIPTION,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/app?search={search_term_string}`
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
        "name": `What is ${BRAND_NAME}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${BRAND_NAME} is an AI-powered SEO and Answer Engine Optimization platform for businesses worldwide. It automates the process of optimizing HTML pages for search engines and AI answer engines like Google AI Overviews, Perplexity, and ChatGPT search. Simply paste your HTML code and receive fully optimized code with meta tags, schema markup, AEO answer blocks, health scores, and sitemaps in seconds.`
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
        "name": `Does ${BRAND_NAME} support websites in different regions and languages?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": GLOBAL_SUPPORT_ANSWER
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
  const pricingLocale = detectPricingLocale();
  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": BRAND_NAME,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": pricingLocale.currency
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
    "name": BRAND_NAME,
    "description": PRODUCT_DESCRIPTION,
    "url": SITE_URL,
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
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
