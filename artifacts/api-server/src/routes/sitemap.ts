import { Router, type IRouter } from "express";
import { db, sitemapUrlsTable, agencySettingsTable } from "@workspace/db";
import {
  AddSitemapUrlBody,
  ListSitemapUrlsResponse,
  AddSitemapUrlResponse,
  DeleteSitemapUrlResponse,
} from "@workspace/api-zod";
import { desc, eq } from "drizzle-orm";

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

router.get("/sitemap-urls", async (_req, res) => {
  const rows = await db.select().from(sitemapUrlsTable).orderBy(desc(sitemapUrlsTable.createdAt));
  return res.json(ListSitemapUrlsResponse.parse({ items: rows.map(toRecord) }));
});

router.post("/sitemap-urls", async (req, res) => {
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

router.delete("/sitemap-urls/:id", async (req, res) => {
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
  const rows = await db.select().from(sitemapUrlsTable).orderBy(desc(sitemapUrlsTable.createdAt));
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows
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
  const sitemapUrl = settings?.websiteUrl
    ? `${settings.websiteUrl.replace(/\/$/, "")}/sitemap.xml`
    : "https://example.com/sitemap.xml";
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
  res.set("Content-Type", "text/plain; charset=utf-8");
  return res.send(body);
});

export default router;
