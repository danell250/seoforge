import { Router, type IRouter } from "express";
import { db, optimizationsTable } from "@workspace/db";
import { ListOptimizationsResponse, GetDashboardSummaryResponse, DeleteOptimizationResponse } from "@workspace/api-zod";
import { desc, eq, sql } from "drizzle-orm";
import { getAuthenticatedUser, requireAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

function toRecord(row: typeof optimizationsTable.$inferSelect) {
  return {
    id: row.id,
    filename: row.filename,
    title: row.title,
    sourceUrl: row.sourceUrl,
    score: {
      technical: row.scoreTechnical,
      content: row.scoreContent,
      aeo: row.scoreAeo,
      overall: row.scoreOverall,
    },
    changesCount: row.changesCount,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/optimizations", async (_req, res) => {
  const user = getAuthenticatedUser(_req);
  if (!user) return res.status(401).json({ message: "Authentication required" });
  const rows = await db
    .select()
    .from(optimizationsTable)
    .where(eq(optimizationsTable.userId, user.id))
    .orderBy(desc(optimizationsTable.createdAt))
    .limit(100);
  const safe = ListOptimizationsResponse.parse({ items: rows.map(toRecord) });
  return res.json(safe);
});

router.delete("/optimizations/:id", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id" });
  }
  const result = await db
    .delete(optimizationsTable)
    .where(sql`${optimizationsTable.id} = ${id} AND ${optimizationsTable.userId} = ${user.id}`)
    .returning();
  if (result.length === 0) {
    return res.status(404).json({ message: "Not found" });
  }
  const safe = DeleteOptimizationResponse.parse({ success: true });
  return res.json(safe);
});

router.get("/dashboard-summary", async (_req, res) => {
  const user = getAuthenticatedUser(_req);
  if (!user) return res.status(401).json({ message: "Authentication required" });
  const [agg] = await db
    .select({
      totalPages: sql<number>`COUNT(*)::int`,
      avgOverall: sql<number>`COALESCE(ROUND(AVG(${optimizationsTable.scoreOverall}))::int, 0)`,
      avgTechnical: sql<number>`COALESCE(ROUND(AVG(${optimizationsTable.scoreTechnical}))::int, 0)`,
      avgContent: sql<number>`COALESCE(ROUND(AVG(${optimizationsTable.scoreContent}))::int, 0)`,
      avgAeo: sql<number>`COALESCE(ROUND(AVG(${optimizationsTable.scoreAeo}))::int, 0)`,
      greenCount: sql<number>`COUNT(*) FILTER (WHERE ${optimizationsTable.scoreOverall} >= 80)::int`,
      orangeCount: sql<number>`COUNT(*) FILTER (WHERE ${optimizationsTable.scoreOverall} >= 50 AND ${optimizationsTable.scoreOverall} < 80)::int`,
      redCount: sql<number>`COUNT(*) FILTER (WHERE ${optimizationsTable.scoreOverall} < 50)::int`,
    })
    .from(optimizationsTable)
    .where(eq(optimizationsTable.userId, user.id));

  const recentRows = await db
    .select()
    .from(optimizationsTable)
    .where(eq(optimizationsTable.userId, user.id))
    .orderBy(desc(optimizationsTable.createdAt))
    .limit(10);

  const safe = GetDashboardSummaryResponse.parse({
    totalPages: agg?.totalPages ?? 0,
    avgOverall: agg?.avgOverall ?? 0,
    avgTechnical: agg?.avgTechnical ?? 0,
    avgContent: agg?.avgContent ?? 0,
    avgAeo: agg?.avgAeo ?? 0,
    greenCount: agg?.greenCount ?? 0,
    orangeCount: agg?.orangeCount ?? 0,
    redCount: agg?.redCount ?? 0,
    recent: recentRows.map(toRecord),
  });
  return res.json(safe);
});

export default router;
