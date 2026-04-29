export const DEFAULT_AGENCY_SETTINGS = {
  brandName: "SEOaxe",
  tagline: "AI-Powered SEO and Answer Engine Optimization",
  logoUrl: null,
  primaryColor: "#2563eb",
  supportEmail: null,
  websiteUrl: null,
  brandVoice: "Clear, professional, and practical",
  preferredMarkets: "Global English-speaking markets",
  primaryCms: "custom",
  optimizationStyle: "balanced",
} as const;

const LEGACY_BRAND_NAMES = new Set(["SEOForge", "SEODomination"]);

export function normalizeBrandName(value: string) {
  return LEGACY_BRAND_NAMES.has(value) ? DEFAULT_AGENCY_SETTINGS.brandName : value;
}
