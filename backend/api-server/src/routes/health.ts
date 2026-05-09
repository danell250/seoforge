import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/readyz", async (_req, res) => {
  const requiredEnv = ["DATABASE_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());

  let dbOk = false;
  try {
    await db.execute(sql`select 1`);
    dbOk = true;
  } catch {
    dbOk = false;
  }

  if (missingEnv.length > 0 || !dbOk) {
    return res.status(503).json({
      status: "degraded",
      checks: {
        database: dbOk ? "ok" : "down",
        env: missingEnv.length === 0 ? "ok" : "missing",
        ai: hasGemini ? "configured" : "fallback-mode",
      },
      missingEnv,
    });
  }

  return res.json({
    status: "ready",
    checks: {
      database: "ok",
      env: "ok",
      ai: hasGemini ? "configured" : "fallback-mode",
    },
  });
});

export default router;
