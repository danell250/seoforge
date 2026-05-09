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
          "text": `${BRAND_NAME} is a live SEO audit engine for existing website pages. It scans public URLs and returns prioritized SEO, AEO, schema, hreflang, sitemap, content gap, and health score guidance without requiring source files.`
        }
      },
      {
        "@type": "Question",
        "name": "How does live SEO auditing work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SEOaxe analyzes an existing public page, identifies the missing search signals, and returns a guided audit. The platform can generate meta title and description recommendations, JSON-LD structured data guidance, AEO answer blocks, XML sitemaps, robots.txt files, and a before/after SEO health score."
        }
      },
      {
        "@type": "Question",
        "name": "Is SEOaxe free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SEOaxe is free to start with no credit card required. Create a free account to audit live pages, then upgrade if you need premium features like multi-page crawling, competitor analysis, site monitoring, and white-label reporting."
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
    "featureList": [
      "Live URL SEO audits",
      "Meta tag generation",
      "Schema markup automation",
      "AEO answer block creation",
      "XML sitemap generation",
      "Robots.txt creation",
      "Before and after audit receipts",
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
      "Live SEO Audits",
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
