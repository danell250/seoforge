import { pgTable, serial, text, integer, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";

export const monitoredSitesTable = pgTable(
  "monitored_sites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    url: text("url").notNull(),
    domain: text("domain").notNull(),
    email: text("email").notNull(),
    topic: text("topic"),
    audience: text("audience"),
    frequency: text("frequency").notNull().default("monthly"),
    maxPages: integer("max_pages").notNull().default(20),
    enabled: boolean("enabled").notNull().default(true),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }).notNull().defaultNow(),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    nextRunIdx: index("monitored_sites_next_run_idx").on(t.nextRunAt),
    userIdx: index("monitored_sites_user_idx").on(t.userId),
  }),
);

export const siteSnapshotsTable = pgTable(
  "site_snapshots",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id").notNull(),
    pages: jsonb("pages").notNull(),
    avgScore: integer("avg_score").notNull(),
    pagesCount: integer("pages_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    siteIdx: index("site_snapshots_site_idx").on(t.siteId, t.createdAt),
  }),
);

export const monitorReportsTable = pgTable(
  "monitor_reports",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id").notNull(),
    summary: text("summary").notNull(),
    report: jsonb("report").notNull(),
    pagesScanned: integer("pages_scanned").notNull(),
    regressionsCount: integer("regressions_count").notNull(),
    newGapsCount: integer("new_gaps_count").notNull(),
    emailedTo: text("emailed_to"),
    emailedAt: timestamp("emailed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    siteIdx: index("monitor_reports_site_idx").on(t.siteId, t.createdAt),
  }),
);

export type MonitoredSite = typeof monitoredSitesTable.$inferSelect;
export type InsertMonitoredSite = typeof monitoredSitesTable.$inferInsert;
export type SiteSnapshot = typeof siteSnapshotsTable.$inferSelect;
export type MonitorReport = typeof monitorReportsTable.$inferSelect;
