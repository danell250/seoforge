import type { RequestHandler } from "express";
import { sql } from "drizzle-orm";
import { db, rateLimitBucketsTable } from "@workspace/db";

interface RateLimitOptions {
  key: string;
  max: number;
  windowMs: number;
}

const CLEANUP_INTERVAL_MS = 1000 * 60 * 10;
let cleanupStarted = false;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startRateLimitCleanupLoop() {
  if (cleanupStarted) return;
  cleanupStarted = true;

  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }

  cleanupTimer = setInterval(() => {
    void db
      .delete(rateLimitBucketsTable)
      .where(sql`${rateLimitBucketsTable.resetAt} <= NOW()`)
      .catch(() => undefined);
  }, CLEANUP_INTERVAL_MS);

  cleanupTimer.unref?.();
}

export function createRateLimit(options: RateLimitOptions): RequestHandler {
  return async (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const bucketKey = `${options.key}:${ip}`;
    const now = new Date();
    const nextResetAt = new Date(now.getTime() + options.windowMs);

    try {
      const result = await db.execute<{ count: number; reset_at: Date }>(sql`
        INSERT INTO rate_limit_buckets ("key", "count", "reset_at", "updated_at")
        VALUES (${bucketKey}, 1, ${nextResetAt}, ${now})
        ON CONFLICT ("key") DO UPDATE
        SET
          "count" = CASE
            WHEN rate_limit_buckets."reset_at" <= ${now} THEN 1
            ELSE rate_limit_buckets."count" + 1
          END,
          "reset_at" = CASE
            WHEN rate_limit_buckets."reset_at" <= ${now} THEN ${nextResetAt}
            ELSE rate_limit_buckets."reset_at"
          END,
          "updated_at" = ${now}
        RETURNING "count", "reset_at"
      `);

      const row = Array.isArray(result.rows) ? result.rows[0] : undefined;
      if (!row) {
        next();
        return;
      }
      const count = Number(row?.count ?? 1);
      const resetAt = row?.reset_at instanceof Date ? row.reset_at : nextResetAt;
      const remaining = Math.max(0, options.max - count);

      res.setHeader("X-RateLimit-Limit", String(options.max));
      res.setHeader("X-RateLimit-Remaining", String(remaining));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt.getTime() / 1000)));

      if (count > options.max) {
        res.status(429).json({ message: "Too many requests. Please try again shortly." });
        return;
      }
    } catch (err) {
      req.log.error({ err }, "rate limit lookup failed");
    }

    next();
  };
}
