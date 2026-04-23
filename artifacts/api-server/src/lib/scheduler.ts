import { db, monitoredSitesTable } from "@workspace/db";
import { and, eq, lte } from "drizzle-orm";
import { logger } from "./logger";
import { runMonitorForSite } from "./monitor-runner";

const TICK_INTERVAL_MS = 60 * 60 * 1000;
let timer: NodeJS.Timeout | null = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    const due = await db
      .select()
      .from(monitoredSitesTable)
      .where(and(eq(monitoredSitesTable.enabled, true), lte(monitoredSitesTable.nextRunAt, new Date())));

    if (due.length === 0) return;
    logger.info({ count: due.length }, "scheduler running due monitors");

    for (const site of due) {
      try {
        await runMonitorForSite(site, { sendEmail: true, log: logger });
      } catch (err) {
        logger.error({ err, siteId: site.id }, "scheduler monitor run failed");
        const next = new Date();
        next.setHours(next.getHours() + 6);
        await db
          .update(monitoredSitesTable)
          .set({ nextRunAt: next })
          .where(eq(monitoredSitesTable.id, site.id));
      }
    }
  } catch (err) {
    logger.error({ err }, "scheduler tick failed");
  } finally {
    running = false;
  }
}

export function startScheduler() {
  if (timer) return;
  logger.info("scheduler started");
  setTimeout(tick, 30_000);
  timer = setInterval(tick, TICK_INTERVAL_MS);
}
