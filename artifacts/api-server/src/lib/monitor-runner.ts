import { db, monitoredSitesTable, siteSnapshotsTable, monitorReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getModel, extractJson } from "./gemini";
import { sendEmail, renderReportEmail } from "./email";
import type { Logger } from "pino";

const FETCH_TIMEOUT_MS = 12000;
const MAX_BYTES_PER_PAGE = 400_000;
const SKIP_EXT = /\.(pdf|zip|rar|7z|tar|gz|jpg|jpeg|png|gif|webp|svg|ico|css|js|mjs|mp4|mp3|wav|woff2?|ttf|otf|xml|json|csv|xlsx?|docx?|pptx?)(\?|#|$)/i;

interface PageSnapshot {
  url: string;
  title: string;
  score: number;
  gaps: string[];
}

interface DiffRow {
  url: string;
  title: string;
  status: "new" | "removed" | "regressed" | "improved" | "unchanged" | "error";
  previousScore: number | null;
  currentScore: number | null;
  scoreDelta: number;
  previousGaps: number | null;
  currentGaps: number;
  newGapQuestions: string[];
}

async function fetchHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEOForgeBot/1.0; +https://seoforge.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("html")) return null;
    const text = await res.text();
    return text.slice(0, MAX_BYTES_PER_PAGE);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m && m[1] ? m[1].replace(/\s+/g, " ").trim().slice(0, 200) : "";
}

function extractLinks(html: string, baseUrl: string, origin: string): string[] {
  const out: string[] = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    try {
      const abs = new URL(href, baseUrl);
      if (abs.origin !== origin) continue;
      if (SKIP_EXT.test(abs.pathname)) continue;
      abs.hash = "";
      out.push(abs.toString());
    } catch {
      // ignore
    }
  }
  return out;
}

async function crawlSite(startUrl: string, maxPages: number): Promise<{ url: string; html: string; title: string }[]> {
  let origin: string;
  try {
    origin = new URL(startUrl).origin;
  } catch {
    return [];
  }
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const pages: { url: string; html: string; title: string }[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);
    const html = await fetchHtml(next);
    if (!html) continue;
    pages.push({ url: next, html, title: extractTitle(html) });
    if (pages.length + queue.length < maxPages * 2) {
      for (const l of extractLinks(html, next, origin)) {
        if (!visited.has(l) && !queue.includes(l)) queue.push(l);
      }
    }
  }
  return pages;
}

async function scoreAndGapsForPage(html: string, topic: string | null, audience: string | null): Promise<{ score: number; gaps: string[] }> {
  const model = getModel();
  const prompt = `You are an SEO analyst. Look at this HTML page and return ONLY a JSON object:
{
  "score": <0-100 overall SEO+AEO quality score>,
  "gaps": ["<short search-query-style description of a content gap>", ...]
}
Rules:
- Return 0-6 gaps. Only include gaps that are genuinely missing or thin on this page.
- Each gap should be a concise question or topic phrase, max 12 words.
${topic ? `- Topic / niche: ${topic}` : ""}
${audience ? `- Audience: ${audience}` : ""}

HTML:
\`\`\`html
${html.slice(0, 60_000)}
\`\`\``;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    const parsed = extractJson<{ score: number; gaps: string[] }>(text);
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const gaps = Array.isArray(parsed.gaps)
      ? parsed.gaps
          .filter((g): g is string => typeof g === "string")
          .map((g) => g.trim().slice(0, 140))
          .filter(Boolean)
          .slice(0, 6)
      : [];
    return { score, gaps };
  } catch {
    return { score: 0, gaps: [] };
  }
}

function buildDiffs(prev: PageSnapshot[] | null, curr: PageSnapshot[]): DiffRow[] {
  const prevMap = new Map<string, PageSnapshot>();
  if (prev) for (const p of prev) prevMap.set(p.url, p);
  const currMap = new Map<string, PageSnapshot>();
  for (const p of curr) currMap.set(p.url, p);

  const rows: DiffRow[] = [];
  for (const c of curr) {
    const p = prevMap.get(c.url);
    const newGapQuestions = p ? c.gaps.filter((g) => !p.gaps.includes(g)) : c.gaps;
    if (!p) {
      rows.push({
        url: c.url,
        title: c.title,
        status: "new",
        previousScore: null,
        currentScore: c.score,
        scoreDelta: 0,
        previousGaps: null,
        currentGaps: c.gaps.length,
        newGapQuestions,
      });
      continue;
    }
    const delta = c.score - p.score;
    let status: DiffRow["status"] = "unchanged";
    if (delta <= -5) status = "regressed";
    else if (delta >= 5) status = "improved";
    else if (newGapQuestions.length > 0) status = "regressed";
    rows.push({
      url: c.url,
      title: c.title,
      status,
      previousScore: p.score,
      currentScore: c.score,
      scoreDelta: delta,
      previousGaps: p.gaps.length,
      currentGaps: c.gaps.length,
      newGapQuestions,
    });
  }
  if (prev) {
    for (const p of prev) {
      if (!currMap.has(p.url)) {
        rows.push({
          url: p.url,
          title: p.title,
          status: "removed",
          previousScore: p.score,
          currentScore: null,
          scoreDelta: -(p.score),
          previousGaps: p.gaps.length,
          currentGaps: 0,
          newGapQuestions: [],
        });
      }
    }
  }
  return rows;
}

interface RunOptions {
  sendEmail?: boolean;
  log?: Pick<Logger, "info" | "warn" | "error">;
}

export async function runMonitorForSite(
  site: typeof monitoredSitesTable.$inferSelect,
  opts: RunOptions = {},
) {
  const log = opts.log;
  log?.info({ siteId: site.id, url: site.url }, "monitor run starting");

  const pages = await crawlSite(site.url, site.maxPages);
  if (pages.length === 0) {
    throw new Error("Crawl returned no pages");
  }

  const snapshots: PageSnapshot[] = [];
  for (const p of pages) {
    try {
      const { score, gaps } = await scoreAndGapsForPage(p.html, site.topic, site.audience);
      snapshots.push({ url: p.url, title: p.title || p.url, score, gaps });
    } catch (err) {
      log?.warn({ err, url: p.url }, "page analysis failed");
      snapshots.push({ url: p.url, title: p.title || p.url, score: 0, gaps: [] });
    }
  }

  const [prev] = await db
    .select()
    .from(siteSnapshotsTable)
    .where(eq(siteSnapshotsTable.siteId, site.id))
    .orderBy(desc(siteSnapshotsTable.createdAt))
    .limit(1);

  const previousPages = prev ? (prev.pages as PageSnapshot[]) : null;
  const diffs = buildDiffs(previousPages, snapshots);
  const regressions = diffs.filter((d) => d.status === "regressed").length;
  const newGapsTotal = diffs.reduce((acc, d) => acc + d.newGapQuestions.length, 0);
  const avgScore = Math.round(snapshots.reduce((a, p) => a + p.score, 0) / snapshots.length);

  const summary = previousPages
    ? `${snapshots.length} pages re-scanned. ${regressions} regressed, ${newGapsTotal} new content gaps detected. Site average score: ${avgScore}/100.`
    : `Baseline established for ${snapshots.length} pages. Average score: ${avgScore}/100.`;

  await db.insert(siteSnapshotsTable).values({
    siteId: site.id,
    pages: snapshots,
    avgScore,
    pagesCount: snapshots.length,
  });

  let emailedTo: string | null = null;
  let emailedAt: Date | null = null;
  if (opts.sendEmail) {
    const appUrl = `https://${process.env["REPLIT_DEV_DOMAIN"] || "seoforge.app"}/app#monitor`;
    const html = renderReportEmail({
      domain: site.domain,
      summary,
      pagesScanned: snapshots.length,
      regressions,
      newGaps: newGapsTotal,
      diffs,
      appUrl,
    });
    const result = await sendEmail({
      to: site.email,
      subject: `SEOForge: ${site.domain} — ${regressions} regressions, ${newGapsTotal} new gaps`,
      html,
    });
    if (result.ok) {
      emailedTo = site.email;
      emailedAt = new Date();
      log?.info({ siteId: site.id }, "report emailed");
    } else {
      log?.warn({ siteId: site.id, error: result.error }, "email send failed");
    }
  }

  const [report] = await db
    .insert(monitorReportsTable)
    .values({
      siteId: site.id,
      summary,
      report: { diffs },
      pagesScanned: snapshots.length,
      regressionsCount: regressions,
      newGapsCount: newGapsTotal,
      emailedTo,
      emailedAt,
    })
    .returning();

  const days = site.frequency === "daily" ? 1 : site.frequency === "monthly" ? 30 : 7;
  const next = new Date();
  next.setDate(next.getDate() + days);
  await db
    .update(monitoredSitesTable)
    .set({ lastRunAt: new Date(), nextRunAt: next })
    .where(eq(monitoredSitesTable.id, site.id));

  return report;
}
