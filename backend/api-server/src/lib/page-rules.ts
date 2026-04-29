export type SeoaxePageType =
  | "homepage"
  | "landing"
  | "blog"
  | "product"
  | "service"
  | "location"
  | "docs"
  | "generic";

type TaskType = "optimize" | "content-gaps" | "aeo" | "blog";

const PAGE_RULES: Record<SeoaxePageType, string[]> = {
  homepage: [
    "Keep the primary H1 broad and brand-aligned.",
    "Prioritize trust signals, navigation clarity, and a concise explanation of what the business offers.",
    "Avoid turning the homepage into a keyword-stuffed article.",
  ],
  landing: [
    "Optimize for one primary conversion intent and keep the message focused.",
    "Use clear benefit-led headings and strong answer-style sections for objections and FAQs.",
    "Preserve CTA clarity and avoid burying the offer under generic SEO filler.",
  ],
  blog: [
    "Use educational headings, concise summaries, and answer-style sections that are quotable by AI assistants.",
    "Preserve readability with a clear intro, scannable H2 sections, and a natural FAQ near the end when helpful.",
    "Avoid changing the article into sales copy unless the page already has commercial intent.",
  ],
  product: [
    "Preserve product facts, feature details, and buyer-intent keywords.",
    "Strengthen schema, FAQs, comparison cues, and descriptive headings without inventing unsupported claims.",
    "Keep commercial clarity high: specs, use cases, pricing/cost intent, and trust signals matter.",
  ],
  service: [
    "Emphasize service outcomes, process clarity, and local/commercial intent.",
    "Strengthen FAQs around pricing, timelines, eligibility, and how the service works.",
    "Keep the copy specific and credible rather than broad marketing language.",
  ],
  location: [
    "Preserve local intent, region references, and contact/location trust signals.",
    "Prioritize LocalBusiness-style schema cues, location-specific headings, and practical answers for nearby customers.",
    "Avoid generic national wording that weakens the location page's intent.",
  ],
  docs: [
    "Favor clarity, step-by-step structure, and terminology consistency.",
    "Do not add fluffy marketing copy to documentation-style pages.",
    "Use heading hierarchy and concise summaries to improve answer extraction.",
  ],
  generic: [
    "Preserve the original page intent and avoid turning the content into a different page type.",
    "Prefer precise metadata, sound heading structure, schema where justified, and answer-friendly formatting.",
  ],
};

const TASK_RULES: Record<TaskType, string[]> = {
  optimize: [
    "Return safe, production-ready HTML that keeps the page intent intact.",
    "Prioritize title/meta/canonical/schema/heading/AEO improvements that are justified by the source page.",
  ],
  "content-gaps": [
    "Only suggest genuinely missing topics that improve search coverage or buyer understanding.",
    "Prefer sections that can be injected cleanly into the page without changing its purpose.",
  ],
  aeo: [
    "Prioritize questions that real searchers or buyers would ask next.",
    "Answers must be concise, factual, and strong enough to stand alone in answer engines.",
  ],
  blog: [
    "Expand the page topic into a high-quality educational article without drifting off-topic.",
    "Preserve factual grounding from the source page and avoid unsupported claims.",
  ],
};

export function inferPageType(input: { html?: string; filename?: string | undefined; topic?: string | undefined }): SeoaxePageType {
  const haystack = `${input.filename ?? ""}\n${input.topic ?? ""}\n${input.html?.slice(0, 6000) ?? ""}`.toLowerCase();

  if (/blog|article|news|insights/.test(haystack)) return "blog";
  if (/product|sku|add to cart|buy now|price|pricing table/.test(haystack)) return "product";
  if (/service|book a call|consultation|request a quote/.test(haystack)) return "service";
  if (/location|branch|office|directions|near me|contact us/.test(haystack)) return "location";
  if (/docs|documentation|api reference|developer|getting started/.test(haystack)) return "docs";
  if (/landing|campaign|signup|start free|free trial/.test(haystack)) return "landing";
  if (/<nav[\s>]/.test(haystack) && /<h1[\s>]/.test(haystack) && /about|welcome|home/.test(haystack)) return "homepage";
  return "generic";
}

export function buildRulePackPrompt(task: TaskType, pageType: SeoaxePageType): string {
  const sharedRules = TASK_RULES[task] ?? [];
  const pageRules = PAGE_RULES[pageType] ?? PAGE_RULES.generic;

  return [
    `SEOAXE RULE PACK`,
    `Page type: ${pageType}`,
    `Task type: ${task}`,
    ...sharedRules.map((rule) => `- ${rule}`),
    ...pageRules.map((rule) => `- ${rule}`),
  ].join("\n");
}
