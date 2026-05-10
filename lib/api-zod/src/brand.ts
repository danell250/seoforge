export const DEFAULT_AGENCY_SETTINGS = {
  brandName: "SEOaxe",
  tagline: "SEO Repair Engine for Existing Website Pages",
  logoUrl: null,
  primaryColor: "#2563eb",
  supportEmail: null,
  websiteUrl: null,
  brandVoice: "Clear, professional, and practical",
  preferredMarkets: "Global English-speaking markets",
  primaryCms: "custom",
  optimizationStyle: "balanced",
  customSubdomain: null,
  customEmailDomain: null,
  enableClientPortal: false,
} as const;

const LEGACY_BRAND_NAMES = new Set(["SEOForge", "SEODomination"]);

export function normalizeBrandName(value: string) {
  return LEGACY_BRAND_NAMES.has(value) ? DEFAULT_AGENCY_SETTINGS.brandName : value;
}
