import { Router, type IRouter } from "express";
import { db, monitoredSitesTable, siteSnapshotsTable, monitorReportsTable, usersTable } from "@workspace/db";
import { desc, eq, and, count } from "drizzle-orm";
import {
  CreateMonitoredSiteBody,
  CreateMonitoredSiteResponse,
  DeleteMonitoredSiteResponse,
  ListMonitoredSitesResponse,
  ListMonitorReportsResponse,
  RunMonitoredSiteResponse,
} from "@workspace/api-zod";
import { runMonitorForSite } from "../lib/monitor-runner";
import { requireAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

function nextRunDate(frequency: string, from = new Date()): Date {
  const d = new Date(from);
  const days = frequency === "daily" ? 1 : frequency === "monthly" ? 30 : 7;
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeUrl(raw: string): string {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return s;
}

function serializeSite(s: typeof monitoredSitesTable.$inferSelect) {
  return {
    id: s.id,
    userId: s.userId,
    url: s.url,
    domain: s.domain,
    email: s.email,
    topic: s.topic,
    audience: s.audience,
    frequency: s.frequency,
    maxPages: s.maxPages,
    enabled: s.enabled,
    nextRunAt: s.nextRunAt.toISOString(),
    lastRunAt: s.lastRunAt ? s.lastRunAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  };
}

function serializeReport(r: typeof monitorReportsTable.$inferSelect) {
  return {
    id: r.id,
    siteId: r.siteId,
    summary: r.summary,
    pagesScanned: r.pagesScanned,
    regressionsCount: r.regressionsCount,
    newGapsCount: r.newGapsCount,
    emailedTo: r.emailedTo,
    emailedAt: r.emailedAt ? r.emailedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    diffs: Array.isArray((r.report as { diffs?: unknown[] })?.diffs)
      ? (r.report as { diffs: unknown[] }).diffs
      : [],
  };
}

router.get("/monitor/sites", async (req, res) => {
  const userId = (req as any).user?.id;
  const query = userId 
    ? db.select().from(monitoredSitesTable).where(eq(monitoredSitesTable.userId, userId)).orderBy(desc(monitoredSitesTable.createdAt))
    : db.select().from(monitoredSitesTable).orderBy(desc(monitoredSitesTable.createdAt));
  const rows = await query;
  return res.json(ListMonitoredSitesResponse.parse({ sites: rows.map(serializeSite) }));
});

router.post("/monitor/sites", async (req, res) => {
  const userId = (req as any).user?.id;
  const userPlan = (req as any).user?.plan || "free";
  
  // Check plan limits
  if (userId && userPlan === "free") {
    return res.status(403).json({ 
      message: "Domain monitoring requires Starter or Agency plan. Upgrade to monitor your website." 
    });
  }
  
  // Check 5 domain limit for paid users
  if (userId) {
    const [siteCount] = await db
      .select({ count: count() })
      .from(monitoredSitesTable)
      .where(eq(monitoredSitesTable.userId, userId));
    if (siteCount.count >= 5) {
      return res.status(403).json({ 
        message: "You can monitor up to 5 domains. Delete an existing domain to add a new one." 
      });
    }
  }
  
  const parsed = CreateMonitoredSiteBody.safeParse({
    ...req.body,
    url: typeof req.body?.url === "string" ? normalizeUrl(req.body.url) : req.body?.url,
  });
  if (!parsed.success) return res.status(400).json({ message: "Invalid request body" });

  let domain = "";
  try {
    domain = new URL(parsed.data.url).hostname;
  } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  const frequency = parsed.data.frequency || "monthly";
  const [row] = await db
    .insert(monitoredSitesTable)
    .values({
      userId: userId || null,
      url: parsed.data.url,
      domain,
      email: parsed.data.email,
      topic: parsed.data.topic ?? null,
      audience: parsed.data.audience ?? null,
      frequency,
      maxPages: parsed.data.maxPages ?? 20,
      nextRunAt: nextRunDate(frequency),
    })
    .returning();
  return res.json(CreateMonitoredSiteResponse.parse(serializeSite(row)));
});

router.delete("/monitor/sites/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid id" });
  await db.delete(siteSnapshotsTable).where(eq(siteSnapshotsTable.siteId, id));
  await db.delete(monitorReportsTable).where(eq(monitorReportsTable.siteId, id));
  await db.delete(monitoredSitesTable).where(eq(monitoredSitesTable.id, id));
  return res.json(DeleteMonitoredSiteResponse.parse({ ok: true, message: "Removed" }));
});

router.post("/monitor/sites/:id/run", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid id" });
  const [site] = await db.select().from(monitoredSitesTable).where(eq(monitoredSitesTable.id, id));
  if (!site) return res.status(404).json({ message: "Site not found" });

  try {
    const report = await runMonitorForSite(site, { sendEmail: true, log: req.log });
    return res.json(RunMonitoredSiteResponse.parse(serializeReport(report)));
  } catch (err) {
    req.log.error({ err }, "monitor run failed");
    return res.status(500).json({ message: "Run failed, please try again." });
  }
});

router.get("/monitor/sites/:id/reports", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid id" });
  const rows = await db
    .select()
    .from(monitorReportsTable)
    .where(eq(monitorReportsTable.siteId, id))
    .orderBy(desc(monitorReportsTable.createdAt))
    .limit(20);
  return res.json(ListMonitorReportsResponse.parse({ reports: rows.map(serializeReport) }));
});

export default router;
export { nextRunDate };
