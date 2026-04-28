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
    description: "Perfect for testing the waters.",
    features: [
      "3 pages optimized per month",
      "Basic technical SEO checks",
      "Standard JSON-LD schema",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    slug: "starter",
    name: "Starter",
    amountZar: 299,
    period: "month",
    description: "For ambitious freelancers and founders.",
    features: [
      "20 pages optimized per month",
      "Full AEO and answer block generation",
      "Advanced multilingual schema",
      "Competitor scanner access",
      "Email support within 24h",
    ],
    cta: "Start Starter Plan",
    popular: true,
  },
  {
    slug: "agency",
    name: "Agency",
    amountZar: 999,
    period: "month",
    description: "Scale your entire agency operations.",
    features: [
      "Unlimited pages optimized",
      "Bulk ZIP processing pipeline",
      "White-label PDF reports",
      "CMS deployment integrations",
      "Priority Slack/WhatsApp support",
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
