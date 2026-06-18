import { Router, type IRouter } from "express";
import { requireAuthenticatedUser, getAuthenticatedUser } from "../middleware/auth";
import { db, usersTable, auditEventsTable } from "@workspace/db";
import { and, count, eq, gte } from "drizzle-orm";

const router: IRouter = Router();

// Audit limits per month
const AUDIT_LIMITS = {
  free: 1,
  starter: 20,
  professional: 50,
  agency: Number.POSITIVE_INFINITY,
};

const FETCH_TIMEOUT_MS = 15000;
const MAX_BYTES = 500_000;

function normalizeUrl(raw: string): string {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return s;
}

async function checkAuditLimit(userId: number, log: any): Promise<{ allowed: boolean; limit: number; current: number; plan: string }> {
  try {
    const [user] = await db.select({ plan: usersTable.plan }).from(usersTable).where(eq(usersTable.id, userId));
    const plan = user?.plan || "free";
    const limit = AUDIT_LIMITS[plan as keyof typeof AUDIT_LIMITS] ?? AUDIT_LIMITS.free;

    // Count current month's audits
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({ count: count() })
      .from(auditEventsTable)
      .where(
        and(
          eq(auditEventsTable.userId, userId),
          gte(auditEventsTable.createdAt, startOfMonth),
        ),
      );

    const current = result?.count || 0;
    const allowed = current < limit;

    return { allowed, limit, current, plan };
  } catch (err) {
    log?.warn?.({ err }, "Audit limit check failed, allowing");
    return { allowed: true, limit: 1, current: 0, plan: "free" };
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEOForgeAudit/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("html")) return null;
    return (await res.text()).slice(0, MAX_BYTES);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? m[1].replace(/\s+/g, " ").trim().slice(0, 200) : "";
}

function extractMetaDescription(html: string): string {
  const m = html.match(/<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["']/i);
  return m?.[1] ? m[1].trim().slice(0, 300) : "";
}

function extractH1(html: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m?.[1] ? m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) : "";
}

function hasViewport(html: string): boolean {
  return /<meta[^>]*name\s*=\s*["']viewport["']/i.test(html);
}

function hasCanonical(html: string): boolean {
  return /<link[^>]*rel\s*=\s*["']canonical["']/i.test(html);
}

function hasSchema(html: string): boolean {
  return /<script[^>]*type\s*=\s*["']application\/ld\+json["']/i.test(html);
}

function hasOpenGraph(html: string): boolean {
  return /<meta[^>]*property\s*=\s*["']og:/i.test(html);
}

function hasTwitterCard(html: string): boolean {
  return /<meta[^>]*name\s*=\s*["']twitter:/i.test(html);
}

function countImagesWithoutAlt(html: string): number {
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  let count = 0;
  for (const img of imgs) {
    if (!/alt\s*=\s*["'][^"]*["']/i.test(img)) count++;
  }
  return count;
}

function countTotalImages(html: string): number {
  return (html.match(/<img\b/gi) || []).length;
}

function countInternalLinks(html: string, origin: string): number {
  const links = html.match(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi) || [];
  let count = 0;
  for (const link of links) {
    const m = link.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!m) continue;
    try {
      const abs = new URL(m[1], origin);
      if (abs.origin === origin) count++;
    } catch {
      // ignore
    }
  }
  return count;
}

function countExternalLinks(html: string, origin: string): number {
  const links = html.match(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi) || [];
  let count = 0;
  for (const link of links) {
    const m = link.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!m) continue;
    try {
      const abs = new URL(m[1], origin);
      if (abs.origin !== origin && abs.protocol.startsWith("http")) count++;
    } catch {
      // ignore
    }
  }
  return count;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function hasH2(html: string): boolean {
  return /<h2\b/i.test(html);
}

function hasH3(html: string): boolean {
  return /<h3\b/i.test(html);
}

function hasLangAttr(html: string): boolean {
  return /<html[^>]*lang\s*=/i.test(html);
}

function hasHreflang(html: string): boolean {
  return /<link[^>]*rel\s*=\s*["']alternate["'][^>]*hreflang/i.test(html);
}

interface AuditFinding {
  category: "meta" | "content" | "technical" | "social" | "links";
  severity: "critical" | "warning" | "good";
  title: string;
  detail: string;
}

interface AuditResult {
  url: string;
  overallScore: number;
  metaScore: number;
  contentScore: number;
  technicalScore: number;
  socialScore: number;
  linkScore: number;
  title: string;
  metaDescription: string;
  h1: string;
  wordCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  findings: AuditFinding[];
}

function runAudit(url: string, html: string, origin: string): AuditResult {
  const title = extractTitle(html);
  const metaDesc = extractMetaDescription(html);
  const h1 = extractH1(html);
  const viewport = hasViewport(html);
  const canonical = hasCanonical(html);
  const schema = hasSchema(html);
  const og = hasOpenGraph(html);
  const twitter = hasTwitterCard(html);
  const totalImages = countTotalImages(html);
  const noAlt = countImagesWithoutAlt(html);
  const internal = countInternalLinks(html, origin);
  const external = countExternalLinks(html, origin);
  const h2 = hasH2(html);
  const h3 = hasH3(html);
  const lang = hasLangAttr(html);
  const hreflang = hasHreflang(html);
  const bodyText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
  const wordCount = countWords(bodyText);

  const findings: AuditFinding[] = [];

  // Meta findings
  if (!title) {
    findings.push({ category: "meta", severity: "critical", title: "Missing title tag", detail: "The page has no <title> tag. Search engines use this as the clickable headline in results." });
  } else if (title.length < 30) {
    findings.push({ category: "meta", severity: "warning", title: "Title too short", detail: `Title is ${title.length} characters. Aim for 50–60 characters.` });
  } else if (title.length > 70) {
    findings.push({ category: "meta", severity: "warning", title: "Title may be truncated", detail: `Title is ${title.length} characters. Search engines often truncate after ~60.` });
  } else {
    findings.push({ category: "meta", severity: "good", title: "Title length looks good", detail: `Title is ${title.length} characters.` });
  }

  if (!metaDesc) {
    findings.push({ category: "meta", severity: "critical", title: "Missing meta description", detail: "No meta description found. This controls the snippet shown in search results." });
  } else if (metaDesc.length < 70) {
    findings.push({ category: "meta", severity: "warning", title: "Meta description too short", detail: `Description is ${metaDesc.length} characters. Aim for 150–160.` });
  } else if (metaDesc.length > 170) {
    findings.push({ category: "meta", severity: "warning", title: "Meta description may be truncated", detail: `Description is ${metaDesc.length} characters. Search engines often truncate after ~160.` });
  } else {
    findings.push({ category: "meta", severity: "good", title: "Meta description length looks good", detail: `Description is ${metaDesc.length} characters.` });
  }

  if (!canonical) {
    findings.push({ category: "meta", severity: "warning", title: "Missing canonical tag", detail: "Add a <link rel=\"canonical\"> to prevent duplicate content issues." });
  }

  if (!lang) {
    findings.push({ category: "meta", severity: "warning", title: "Missing lang attribute", detail: "Add lang=\"...\" to your <html> tag to help search engines understand the language." });
  }

  // Content findings
  if (!h1) {
    findings.push({ category: "content", severity: "critical", title: "Missing H1 heading", detail: "Every page should have one clear H1 that describes the page topic." });
  }

  if (!h2) {
    findings.push({ category: "content", severity: "warning", title: "No H2 headings found", detail: "Add H2 subheadings to break up content and improve readability." });
  }

  if (!h3) {
    findings.push({ category: "content", severity: "warning", title: "No H3 headings found", detail: "H3s help structure longer sections for readers and search engines." });
  }

  if (wordCount < 300) {
    findings.push({ category: "content", severity: "warning", title: "Thin content", detail: `Page body has ~${wordCount} words. Thin pages struggle to rank for competitive terms.` });
  } else if (wordCount > 2000) {
    findings.push({ category: "content", severity: "good", title: "Comprehensive content", detail: `Page body has ~${wordCount} words. Long-form content tends to rank better.` });
  } else {
    findings.push({ category: "content", severity: "good", title: "Decent content length", detail: `Page body has ~${wordCount} words.` });
  }

  if (noAlt > 0) {
    findings.push({ category: "content", severity: "warning", title: "Images missing alt text", detail: `${noAlt} of ${totalImages} images lack alt text. Alt text helps accessibility and image search.` });
  } else if (totalImages > 0) {
    findings.push({ category: "content", severity: "good", title: "All images have alt text", detail: `${totalImages} images found, all with alt attributes.` });
  }

  // Technical findings
  if (!viewport) {
    findings.push({ category: "technical", severity: "critical", title: "Missing viewport meta tag", detail: "Without viewport settings, the page will not display correctly on mobile devices." });
  } else {
    findings.push({ category: "technical", severity: "good", title: "Mobile viewport configured", detail: "Viewport meta tag is present for responsive design." });
  }

  if (!schema) {
    findings.push({ category: "technical", severity: "warning", title: "No schema markup detected", detail: "Add JSON-LD schema (Organization, Article, FAQPage, etc.) to unlock rich snippets." });
  } else {
    findings.push({ category: "technical", severity: "good", title: "Schema markup detected", detail: "Structured data helps search engines understand your content." });
  }

  if (!hreflang) {
    findings.push({ category: "technical", severity: "good", title: "No hreflang tags", detail: "Only needed if you have multiple language versions of this page." });
  } else {
    findings.push({ category: "technical", severity: "good", title: "Hreflang tags present", detail: "Good for multilingual SEO." });
  }

  // Social findings
  if (!og) {
    findings.push({ category: "social", severity: "warning", title: "Missing Open Graph tags", detail: "Add og:title, og:description, og:image for better social sharing previews." });
  } else {
    findings.push({ category: "social", severity: "good", title: "Open Graph tags present", detail: "Social sharing previews will look better." });
  }

  if (!twitter) {
    findings.push({ category: "social", severity: "warning", title: "Missing Twitter Card tags", detail: "Add twitter:card and twitter:image for Twitter/X link previews." });
  } else {
    findings.push({ category: "social", severity: "good", title: "Twitter Card tags present", detail: "Twitter/X sharing previews will look better." });
  }

  // Link findings
  if (internal === 0) {
    findings.push({ category: "links", severity: "warning", title: "No internal links", detail: "Link to other pages on your site to help search engines discover and distribute authority." });
  } else if (internal < 3) {
    findings.push({ category: "links", severity: "warning", title: "Few internal links", detail: `Only ${internal} internal link(s) found. Aim for at least 3–5.` });
  } else {
    findings.push({ category: "links", severity: "good", title: "Good internal linking", detail: `${internal} internal links found.` });
  }

  if (external === 0) {
    findings.push({ category: "links", severity: "good", title: "No external links", detail: "Citing external sources can increase trust signals." });
  }

  // Scoring
  let metaScore = 0;
  metaScore += title ? (title.length >= 30 && title.length <= 70 ? 25 : 15) : 0;
  metaScore += metaDesc ? (metaDesc.length >= 70 && metaDesc.length <= 170 ? 25 : 15) : 0;
  metaScore += canonical ? 15 : 0;
  metaScore += lang ? 10 : 0;
  metaScore += viewport ? 10 : 0;
  metaScore = Math.min(100, metaScore + 15); // baseline

  let contentScore = 0;
  contentScore += h1 ? 20 : 0;
  contentScore += h2 ? 15 : 0;
  contentScore += h3 ? 10 : 0;
  contentScore += wordCount >= 300 ? 20 : (wordCount > 0 ? 10 : 0);
  contentScore += wordCount >= 1000 ? 15 : 0;
  contentScore += totalImages > 0 && noAlt === 0 ? 20 : (totalImages > 0 ? 10 : 0);
  contentScore = Math.min(100, contentScore);

  let technicalScore = 0;
  technicalScore += viewport ? 25 : 0;
  technicalScore += schema ? 25 : 0;
  technicalScore += canonical ? 20 : 0;
  technicalScore += lang ? 15 : 0;
  technicalScore += hreflang ? 15 : 0;
  technicalScore = Math.min(100, technicalScore + 15);

  let socialScore = 0;
  socialScore += og ? 40 : 0;
  socialScore += twitter ? 40 : 0;
  socialScore = Math.min(100, socialScore + 20);

  let linkScore = 0;
  linkScore += internal >= 5 ? 30 : (internal > 0 ? 15 : 0);
  linkScore += external > 0 ? 15 : 5;
  linkScore += internal >= 3 ? 20 : 0;
  linkScore = Math.min(100, linkScore + 35);

  const overallScore = Math.round((metaScore + contentScore + technicalScore + socialScore + linkScore) / 5);

  return {
    url,
    overallScore,
    metaScore,
    contentScore,
    technicalScore,
    socialScore,
    linkScore,
    title,
    metaDescription: metaDesc,
    h1,
    wordCount,
    imageCount: totalImages,
    imagesWithoutAlt: noAlt,
    internalLinks: internal,
    externalLinks: external,
    findings,
  };
}

// ── Public demo endpoint (no auth, limited output) ────────────────────────────
// Rate limited to 10 req/15min per IP via the global API rate limit.
// Returns scores + first 5 issues + 3 fix previews. Full report requires signup.
router.post("/audit/demo", async (req, res) => {
  const url = typeof req.body?.url === "string" ? normalizeUrl(req.body.url) : "";
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  const html = await fetchHtml(url);
  if (!html) {
    return res.status(422).json({
      message: "Could not fetch that page. Make sure it's publicly accessible and try again.",
    });
  }

  const full = runAudit(url, html, origin);

  // Map findings → issues for the demo payload
  const severityMap: Record<string, "critical" | "warning" | "info"> = {
    critical: "critical",
    warning: "warning",
    good: "info",
  };

  const issues = full.findings
    .filter((f) => f.severity !== "good")
    .slice(0, 6)
    .map((f) => ({
      severity: severityMap[f.severity] ?? "info",
      message: `${f.title}: ${f.detail}`,
    }));

  // Generate fix preview copy based on findings
  const fixPreviews: string[] = [];
  for (const f of full.findings) {
    if (f.severity === "critical" && fixPreviews.length < 3) {
      fixPreviews.push(`Fix: ${f.title} — ${f.detail.split(".")[0]}.`);
    }
  }
  if (fixPreviews.length < 3) {
    for (const f of full.findings) {
      if (f.severity === "warning" && fixPreviews.length < 3) {
        fixPreviews.push(`Improve: ${f.title} — ${f.detail.split(".")[0]}.`);
      }
    }
  }

  return res.json({
    url: full.url,
    score: {
      technical: full.technicalScore,
      content: full.contentScore,
      aeo: Math.max(20, full.technicalScore - 15), // AEO proxy until we add real AEO audit
      overall: full.overallScore,
    },
    issues,
    preview: fixPreviews.slice(0, 3),
  });
});

router.post("/audit", requireAuthenticatedUser, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const url = typeof req.body?.url === "string" ? normalizeUrl(req.body.url) : "";
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  // Check audit limits
  const limitCheck = await checkAuditLimit(user.id, req.log);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      message: `You've reached your monthly limit of ${limitCheck.limit} page audits on the ${limitCheck.plan} plan. Upgrade to audit more pages.`,
      code: "AUDIT_LIMIT_EXCEEDED",
      limit: limitCheck.limit,
      current: limitCheck.current,
      plan: limitCheck.plan,
    });
  }

  const html = await fetchHtml(url);
  if (!html) {
    return res.status(500).json({ message: "Could not fetch the page. Please check the URL and try again." });
  }

  const result = runAudit(url, html, origin);

  // Record the audit event
  try {
    await db.insert(auditEventsTable).values({
      userId: user.id,
      url: url,
    });
  } catch (dbErr) {
    req.log.error({ err: dbErr }, "Failed to record audit event");
    // Continue anyway - don't fail the audit due to logging failure
  }

  return res.json(result);
});

export default router;
