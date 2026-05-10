import { Router, type IRouter } from "express";
import { and, eq, gte, sql } from "drizzle-orm";
import { aiFeedbackTable, aiTrainingExamplesTable, db } from "@workspace/db";
import { getAuthenticatedUser, requireAuthenticatedUser } from "../middleware/auth";
import { createHash } from "node:crypto";

const router: IRouter = Router();
router.use(requireAuthenticatedUser);

router.get("/ai-feedback/training-examples/export", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const verdict = (req.query.verdict as string) || "accepted";
    const since = req.query.since as string | undefined;

    const whereConditions = [eq(aiTrainingExamplesTable.feedbackVerdict, verdict)];
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        whereConditions.push(gte(aiTrainingExamplesTable.updatedAt, sinceDate));
      }
    }

    const examples = await db
      .select()
      .from(aiTrainingExamplesTable)
      .where(and(...whereConditions));

    return res.json({
      count: examples.length,
      verdict,
      since,
      examples: examples.map(example => ({
        id: example.id,
        title: example.title,
        taskName: example.taskName,
        pageType: example.pageType,
        evaluationScore: example.evaluationScore,
        evaluationSummary: example.evaluationSummary,
        feedbackVerdict: example.feedbackVerdict,
        createdAt: example.createdAt,
        updatedAt: example.updatedAt,
        inputHtmlHash: example.outputFingerprint 
          ? example.outputFingerprint 
          : (example.inputHtml ? createHash("sha256").update(example.inputHtml).digest("hex") : null)
      }))
    });
  } catch (err) {
    req.log.error({ err }, "Failed to export training examples");
    return res.status(500).json({ message: "Failed to export training examples" });
  }
});

router.get("/ai-feedback/summary", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [acceptedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiTrainingExamplesTable)
      .where(eq(aiTrainingExamplesTable.feedbackVerdict, "accepted"));

    const [rejectedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiTrainingExamplesTable)
      .where(eq(aiTrainingExamplesTable.feedbackVerdict, "rejected"));

    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiTrainingExamplesTable)
      .where(eq(aiTrainingExamplesTable.feedbackVerdict, "pending"));

    return res.json({
      accepted: acceptedCount?.count ?? 0,
      rejected: rejectedCount?.count ?? 0,
      pending: pendingCount?.count ?? 0,
      total: (acceptedCount?.count ?? 0) + (rejectedCount?.count ?? 0) + (pendingCount?.count ?? 0)
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get AI feedback summary");
    return res.status(500).json({ message: "Failed to get AI feedback summary" });
  }
});

export default router;