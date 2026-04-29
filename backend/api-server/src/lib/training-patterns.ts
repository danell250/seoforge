import { and, desc, eq, sql } from "drizzle-orm";
import { aiTrainingExamplesTable, db } from "@workspace/db";
import type { SeoaxePageType } from "./page-rules";

export async function buildAcceptedExamplesPrompt(
  userId: number,
  taskName: string,
  pageType: SeoaxePageType,
): Promise<string | null> {
  const examples = await db
    .select({
      title: aiTrainingExamplesTable.title,
      pageType: aiTrainingExamplesTable.pageType,
      outputHtml: aiTrainingExamplesTable.outputHtml,
      evaluationScore: aiTrainingExamplesTable.evaluationScore,
      evaluationSummary: aiTrainingExamplesTable.evaluationSummary,
    })
    .from(aiTrainingExamplesTable)
    .where(
      and(
        eq(aiTrainingExamplesTable.userId, userId),
        eq(aiTrainingExamplesTable.taskName, taskName),
        eq(aiTrainingExamplesTable.feedbackVerdict, "accepted"),
        eq(aiTrainingExamplesTable.pageType, pageType),
      ),
    )
    .orderBy(desc(sql`COALESCE(${aiTrainingExamplesTable.evaluationScore}, 0)`), desc(aiTrainingExamplesTable.updatedAt))
    .limit(3);

  if (examples.length === 0) {
    return null;
  }

  const lines = ["SEOAXE ACCEPTED EXAMPLE PATTERNS"];
  for (const [index, example] of examples.entries()) {
    lines.push(`Example ${index + 1}:`);
    lines.push(`- Title: ${example.title || "Untitled"}`);
    lines.push(`- Page type: ${example.pageType || pageType}`);
    lines.push(`- Evaluation score: ${example.evaluationScore ?? "n/a"}`);
    lines.push(`- Why it was accepted: ${example.evaluationSummary ?? "Strong SEOaxe output"}`);
    const title = extractTagContent(example.outputHtml, "title");
    const h1 = extractTagContent(example.outputHtml, "h1");
    const metaDescription = extractMetaDescription(example.outputHtml);
    lines.push(`- Optimized title tag: ${title || "Not found"}`);
    lines.push(`- Optimized H1: ${h1 || "Not found"}`);
    lines.push(`- Optimized meta description: ${metaDescription || "Not found"}`);
    lines.push(`- Includes FAQ schema: ${/<script[^>]+type=["']application\/ld\+json["'][\s\S]*faqpage/i.test(example.outputHtml) ? "yes" : "no"}`);
  }

  lines.push("- Learn from these accepted patterns, but adapt to the current page instead of copying them verbatim.");
  return lines.join("\n");
}

function extractTagContent(html: string, tagName: string): string | null {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1]?.replace(/\s+/g, " ").trim() || null;
}

function extractMetaDescription(html: string): string | null {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1]?.trim() || null;
}
