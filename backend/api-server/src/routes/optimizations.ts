import { Router, type IRouter } from "express";
import { db, optimizationsTable } from "@workspace/db";
import { aiFeedbackTable } from "@workspace/db/schema";
import { ListOptimizationsResponse, GetDashboardSummaryResponse, DeleteOptimizationResponse } from "@workspace/api-zod";
import { and, desc, eq, sql } from "drizzle-orm";
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

router.post("/optimizations/:id/feedback", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const body = req.body;
  const verdict = typeof body?.verdict === "string" ? body.verdict.trim().toLowerCase() : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : null;
  if (!["accepted", "rejected"].includes(verdict)) {
    return res.status(400).json({ message: "Invalid verdict" });
  }

  const [optimization] = await db
    .select({ id: optimizationsTable.id })
    .from(optimizationsTable)
    .where(and(eq(optimizationsTable.id, id), eq(optimizationsTable.userId, user.id)))
    .limit(1);

  if (!optimization) {
    return res.status(404).json({ message: "Optimization not found" });
  }

  try {
    const [existing] = await db
      .select({ id: aiFeedbackTable.id })
      .from(aiFeedbackTable)
      .where(and(eq(aiFeedbackTable.optimizationId, id), eq(aiFeedbackTable.userId, user.id), eq(aiFeedbackTable.taskName, "optimize")))
      .limit(1);

    if (existing) {
      await db
        .update(aiFeedbackTable)
        .set({
          verdict,
          note,
          updatedAt: new Date(),
        })
        .where(eq(aiFeedbackTable.id, existing.id));
    } else {
      await db.insert(aiFeedbackTable).values({
        userId: user.id,
        optimizationId: id,
        taskName: "optimize",
        verdict,
        note,
        updatedAt: new Date(),
      });
    }
  } catch (err) {
    req.log.error({ err, optimizationId: id }, "Failed to record optimization feedback");
    return res.status(503).json({ message: "Feedback storage is not ready yet. Run the latest schema push and try again." });
  }

  return res.json({ success: true });
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
