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
    name: "$1 Starter",
    amountZar: 16.38,
    period: "month",
    description: "Start for just $1/month and try our core features.",
    features: [
      "3 live page audits per month",
      "Basic technical SEO checks",
      "Standard JSON-LD schema",
      "Audit receipt for every page",
      "Community support",
    ],
    cta: "Start for $1",
    popular: true,
  },
  {
    slug: "starter",
    name: "Pro",
    amountZar: 299,
    period: "month",
    description: "For founders auditing live websites.",
    features: [
      "20 live page audits per month",
      "Full AEO and answer block generation",
      "Advanced multilingual schema",
      "Competitor scanner access",
      "Copyable schema, sitemap, and robots guidance",
      "Email support within 24h",
    ],
    cta: "Start Pro Plan",
    popular: false,
  },
  {
    slug: "agency",
    name: "Agency",
    amountZar: 999,
    period: "month",
    description: "Audit client sites with proof.",
    features: [
      "Unlimited live page audits",
      "Multi-page crawl and prioritization",
      "White-label PDF reports",
      "Competitor and content-gap workflows",
      "Before/after audit receipts for client delivery",
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
