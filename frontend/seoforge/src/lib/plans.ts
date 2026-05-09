export type PlanSlug = "free" | "starter" | "agency";

export interface PlanDefinition {
  slug: PlanSlug;
  name: string;
  amountZar: number;
  period: "forever" | "month";
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

export const PLAN_DEFINITIONS: readonly PlanDefinition[] = [
  {
    slug: "free",
    name: "Free",
    amountZar: 0,
    period: "forever",
    description: "Perfect for trying our core SEO audit features.",
    features: [
      "3 live page audits per month",
      "Basic technical SEO checks",
      "Standard JSON-LD schema guidance",
      "Audit receipt for every page",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    slug: "starter",
    name: "Professional",
    amountZar: 599,
    period: "month",
    description: "For serious website owners and small businesses.",
    features: [
      "50 live page audits per month",
      "AI-powered AEO and answer block generation",
      "Advanced multilingual schema markup",
      "Competitor analysis and gap detection",
      "Copyable schema, sitemap, and robots.txt",
      "Priority email support",
      "Content optimization suggestions",
    ],
    cta: "Start Professional",
    popular: true,
  },
  {
    slug: "agency",
    name: "Agency",
    amountZar: 1499,
    period: "month",
    description: "For SEO agencies and large-scale operations.",
    features: [
      "Unlimited live page audits",
      "Multi-page crawl and site-wide analysis",
      "White-label PDF reports for clients",
      "Advanced competitor intelligence",
      "Bulk processing and automation",
      "API access for integrations",
      "Priority phone & Slack support",
      "Custom branding options",
    ],
    cta: "Start Agency Plan",
    popular: false,
  },
] as const;

export function isPlanSlug(value: string | null): value is PlanSlug {
  return value === "free" || value === "starter" || value === "agency";
}

export function getPlanDefinition(plan: string | null): PlanDefinition | null {
  if (!isPlanSlug(plan)) return null;
  return PLAN_DEFINITIONS.find((entry) => entry.slug === plan) ?? null;
}
