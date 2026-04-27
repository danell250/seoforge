import { Router, type IRouter } from "express";
import { db, sitemapUrlsTable, agencySettingsTable } from "@workspace/db";
import {
  AddSitemapUrlBody,
  ListSitemapUrlsResponse,
  AddSitemapUrlResponse,
  DeleteSitemapUrlResponse,
} from "@workspace/api-zod";
import { desc, eq } from "drizzle-orm";
import { requireAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();

function toRecord(row: typeof sitemapUrlsTable.$inferSelect) {
  return {
    id: row.id,
    url: row.url,
    priority: row.priority,
    changefreq: row.changefreq,
    createdAt: row.createdAt.toISOString(),
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/sitemap-urls", requireAuthenticatedUser, async (_req, res) => {
  const rows = await db.select().from(sitemapUrlsTable).orderBy(desc(sitemapUrlsTable.createdAt));
  return res.json(ListSitemapUrlsResponse.parse({ items: rows.map(toRecord) }));
});

router.post("/sitemap-urls", requireAuthenticatedUser, async (req, res) => {
  const parsed = AddSitemapUrlBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  try {
    new URL(parsed.data.url);
  } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  try {
    const [row] = await db
      .insert(sitemapUrlsTable)
      .values({
        url: parsed.data.url,
        priority: parsed.data.priority ?? 80,
        changefreq: parsed.data.changefreq ?? "weekly",
      })
      .onConflictDoUpdate({
        target: sitemapUrlsTable.url,
        set: {
          priority: parsed.data.priority ?? 80,
          changefreq: parsed.data.changefreq ?? "weekly",
        },
      })
      .returning();
    return res.json(AddSitemapUrlResponse.parse(toRecord(row)));
  } catch (err) {
    req.log.error({ err }, "sitemap insert failed");
    return res.status(500).json({ message: "Failed to add URL" });
  }
});

router.delete("/sitemap-urls/:id", requireAuthenticatedUser, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const result = await db.delete(sitemapUrlsTable).where(eq(sitemapUrlsTable.id, id)).returning();
  if (result.length === 0) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.json(DeleteSitemapUrlResponse.parse({ success: true }));
});

router.get("/sitemap.xml", async (_req, res) => {
  const [settings] = await db.select().from(agencySettingsTable).limit(1);
  const baseUrl = settings?.websiteUrl?.replace(/\/$/, "") || "https://seoforge.app";
  const lastmod = new Date().toISOString().slice(0, 10);
  
  // Static pages with their priorities (only indexable, public pages)
  const staticPages = [
    { url: `${baseUrl}/`, priority: 100, changefreq: "weekly" },
    { url: `${baseUrl}/pricing`, priority: 90, changefreq: "weekly" },
    { url: `${baseUrl}/blog`, priority: 85, changefreq: "weekly" },
    { url: `${baseUrl}/login`, priority: 70, changefreq: "monthly" },
    { url: `${baseUrl}/privacy`, priority: 50, changefreq: "yearly" },
    { url: `${baseUrl}/terms`, priority: 50, changefreq: "yearly" },
    { url: `${baseUrl}/contact`, priority: 60, changefreq: "monthly" },
  ];
  
  const rows = await db.select().from(sitemapUrlsTable).orderBy(desc(sitemapUrlsTable.createdAt));
  
  // Combine static pages with user-added URLs
  const allUrls = [
    ...staticPages,
    ...rows.map(r => ({ url: r.url, priority: r.priority, changefreq: r.changefreq })),
  ];
  
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (r) =>
      `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${(r.priority / 100).toFixed(2)}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>`;
  res.set("Content-Type", "application/xml; charset=utf-8");
  return res.send(body);
});

router.get("/robots.txt", async (_req, res) => {
  const [settings] = await db.select().from(agencySettingsTable).limit(1);
  const baseUrl = settings?.websiteUrl?.replace(/\/$/, "") || "https://seoforge.app";
  const sitemapUrl = `${baseUrl}/api/sitemap.xml`;
  
  const body = `# SEODomination robots.txt
# Allow all crawlers
User-agent: *
Allow: /

# Disallow API endpoints
Disallow: /api/

# Disallow authenticated app routes (redirect to login)
Disallow: /app
Disallow: /dashboard
Disallow: /settings

# Disallow utility/query params
Disallow: /*?redirect=
Disallow: /login?*

# Sitemap location
Sitemap: ${sitemapUrl}

# Crawl-delay for politeness
Crawl-delay: 1
`;
  res.set("Content-Type", "text/plain; charset=utf-8");
  return res.send(body);
});

export default router;
