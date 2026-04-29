import type { SeoaxePageType } from "./page-rules";

export interface OptimizationAiReview {
  score: number;
  summary: string;
  passedChecks: string[];
  flags: string[];
}

export function evaluateOptimizationOutput(input: {
  originalHtml: string;
  optimizedHtml: string;
  changes: string[];
  pageType: SeoaxePageType;
}): OptimizationAiReview {
  const passedChecks: string[] = [];
  const flags: string[] = [];
  let score = 0;

  if (/<title[^>]*>[^<]{10,}<\/title>/i.test(input.optimizedHtml)) {
    score += 15;
    passedChecks.push("Has a non-empty title tag");
  } else {
    flags.push("Missing or weak title tag");
  }

  const metaDescription = input.optimizedHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "";
  if (metaDescription.length >= 50 && metaDescription.length <= 170) {
    score += 15;
    passedChecks.push("Has a search-friendly meta description");
  } else {
    flags.push("Meta description is missing or outside a healthy length");
  }

  if (/<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']+["']/i.test(input.optimizedHtml)) {
    score += 10;
    passedChecks.push("Has a canonical URL");
  } else {
    flags.push("Canonical URL is missing");
  }

  if (/<script[^>]+type=["']application\/ld\+json["']/i.test(input.optimizedHtml)) {
    score += 15;
    passedChecks.push("Has structured data markup");
  } else {
    flags.push("Structured data was not detected");
  }

  if (/<h1[^>]*>[\s\S]*?<\/h1>/i.test(input.optimizedHtml)) {
    score += 10;
    passedChecks.push("Has a primary H1 heading");
  } else {
    flags.push("Primary H1 heading is missing");
  }

  const imageTags = input.optimizedHtml.match(/<img\b[^>]*>/gi) ?? [];
  const imagesMissingAlt = imageTags.filter((tag) => !/\balt=["'][^"']*["']/i.test(tag));
  if (imageTags.length === 0 || imagesMissingAlt.length === 0) {
    score += 10;
    passedChecks.push(imageTags.length === 0 ? "No images require alt text review" : "Images include alt text");
  } else {
    flags.push(`${imagesMissingAlt.length} image(s) are missing alt text`);
  }

  if (/<html[^>]+\blang=["'][a-z-]+["']/i.test(input.optimizedHtml)) {
    score += 5;
    passedChecks.push("HTML document declares a language");
  } else {
    flags.push("HTML lang attribute is missing");
  }

  if (/<h2[^>]*>[\s\S]*?<\/h2>/i.test(input.optimizedHtml) || input.pageType === "homepage") {
    score += 10;
    passedChecks.push("Has supporting section headings");
  } else {
    flags.push("Supporting H2 section headings were not detected");
  }

  if (hasAeoSignals(input.optimizedHtml)) {
    score += 10;
    passedChecks.push("Includes answer-engine-friendly FAQ or Q&A signals");
  } else {
    flags.push("AEO-friendly Q&A signals are still thin");
  }

  if (input.changes.length >= 3) {
    score += 5;
    passedChecks.push("Returned multiple concrete optimization changes");
  } else {
    flags.push("Optimization returned only a very small set of changes");
  }

  const summary = buildSummary(score, input.pageType, flags);

  return {
    score: Math.max(0, Math.min(100, score)),
    summary,
    passedChecks,
    flags,
  };
}

function hasAeoSignals(html: string): boolean {
  return (
    /faqpage/i.test(html) ||
    /frequently asked questions/i.test(html) ||
    /<h[23][^>]*>[^<]*\?/i.test(html)
  );
}

function buildSummary(score: number, pageType: SeoaxePageType, flags: string[]): string {
  if (score >= 85) {
    return `Strong ${pageType} optimization. The core SEO, schema, and answer-engine signals are present.`;
  }
  if (score >= 70) {
    return `Good ${pageType} optimization overall, with a few follow-up checks still worth reviewing.`;
  }
  if (flags.length > 0) {
    return `Usable ${pageType} optimization, but it still has gaps: ${flags[0]}.`;
  }
  return `This ${pageType} optimization still needs review before it becomes a reliable training example.`;
}
